import type { SupabaseClient } from '@supabase/supabase-js';

// Ponte Portal → Admin para as cobranças. Quem fala com o Banco Inter e a InfinitePay é só o Admin
// (credenciais no cofre); o portal chama com o token interno, também lido do cofre.

const ADMIN_URL = process.env.DCAD_ADMIN_URL || 'https://admin.dcadsolutions.com.br';

export type Forma = 'pix' | 'cartao' | 'boleto';
export interface PagamentoPublico {
  id: string; metodo: Forma; status: 'pendente' | 'pago' | 'expirado' | 'cancelado' | 'falhou'; valor: number;
  link: string | null; pix_copia_cola: string | null; pix_qrcode: string | null; linha_digitavel: string | null;
  vencimento: string | null; expira_em: string | null; ambiente: string;
}
export const CAMPOS_PUBLICOS = 'id, metodo, status, valor, link, pix_copia_cola, pix_qrcode, linha_digitavel, vencimento, expira_em, ambiente';

/** A forma escolhida tem integração ativa e testada? */
export async function cobrancaDisponivel(db: SupabaseClient, forma: Forma) {
  const provedor = forma === 'cartao' ? 'infinitepay' : 'inter';
  const { data } = await db.from('fin_integracoes').select('ativo, status').eq('provedor', provedor).maybeSingle();
  return !!(data?.ativo && data.status === 'ok');
}

async function chamarAdmin<T>(db: SupabaseClient, caminho: string, corpo: unknown): Promise<T> {
  const { data: token, error } = await db.rpc('dcad_segredo_ler', { p_nome: 'dcad_interno_token' });
  if (error || !token) throw new Error('Token interno indisponível');
  const r = await fetch(ADMIN_URL + caminho, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-dcad-interno': String(token) },
    body: JSON.stringify(corpo),
    signal: AbortSignal.timeout(28000),
    cache: 'no-store',
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.erro || `Admin respondeu ${r.status}`);
  return j as T;
}

/** Cria (ou devolve a que já existe) a cobrança da OS */
export const criarCobranca = (db: SupabaseClient, osId: string) =>
  chamarAdmin<{ pagamento: PagamentoPublico }>(db, '/api/pagamentos/criar', { os_id: osId }).then(j => j.pagamento);

export const pdfDoBoleto = (db: SupabaseClient, pagamentoId: string) =>
  chamarAdmin<{ pdf: string }>(db, '/api/pagamentos/boleto', { pagamento_id: pagamentoId }).then(j => j.pdf);
