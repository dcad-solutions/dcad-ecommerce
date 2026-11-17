import { fetchCatalog } from '@/lib/catalog';
import { mesclarCatalogo, calcularPrecoItem, servicoParaCalculo, descontoDaConta, tipoDaConta, P } from '@/lib/preco';

// Confere no servidor o preço de cada item do carrinho com o mesmo cálculo do portal (src/lib/preco.js).
// O valor que vale para o pedido e para a cobrança é sempre o calculado aqui.

type Item = Record<string, unknown>;
type Db = NonNullable<Parameters<typeof fetchCatalog>[0]>;

const FRETE_MAX = 300;   // frete ainda é estimado no portal (Correios não integrado): limite de segurança
const r2 = (v: number) => Math.round(v * 100) / 100;

export interface ItemConferido { item: Item; preco: number; frete: number; total: number }

export async function conferirItens(db: Db, itens: Item[], cliente: { tipo_cliente?: string | null; ativo?: boolean | null }):
  Promise<{ ok: true; itens: ItemConferido[] } | { ok: false; erro: string }> {
  const catalogo = mesclarCatalogo(await fetchCatalog(db)) as { services: Record<string, unknown>[] }[];
  const porId = new Map<string, Record<string, unknown>>();
  for (const esp of catalogo) for (const sv of esp.services || []) if (sv._supabaseId) porId.set(String(sv._supabaseId), sv);
  const desconto = descontoDaConta(tipoDaConta(cliente.tipo_cliente), cliente.ativo ? 'active' : 'pending');

  const saida: ItemConferido[] = [];
  for (const it of itens) {
    let preco: number;
    if (it.name === 'Pré-planejamento' && it.specialty === 'D-CAD') {
      preco = P.preplan;
    } else {
      const sv = porId.get(String(it.servicoId || ''));
      if (!sv) return { ok: false, erro: `O serviço "${String(it.name || '')}" não está mais disponível. Remova-o do carrinho.` };
      const serviceType = (it.serviceType as string | null) || null;
      // Etapas personalizadas: obrigatórias respondidas; respostas só com opções que existem (texto refeito aqui)
      const defs = (sv.etapasPers || {}) as Record<string, { titulo: string; obrigatoria: boolean; tipo: string; opcoes: { id: string; rotulo: string }[] }>;
      const resp = (it.etapas && typeof it.etapas === 'object' ? it.etapas : {}) as Record<string, unknown>;
      const etapas: Record<string, string[]> = {};
      for (const [id, e] of Object.entries(defs)) {
        const v = Array.isArray(resp[id]) ? (resp[id] as unknown[]).map(String).filter(o => e.opcoes.some(x => x.id === o)) : [];
        const escolhas = e.tipo === 'multipla' ? [...new Set(v)] : v.slice(0, 1);
        if (e.obrigatoria && !escolhas.length) return { ok: false, erro: `Responda a etapa "${e.titulo}" de "${String(it.name || '')}".` };
        if (escolhas.length) etapas[id] = escolhas;
      }
      it.etapas = etapas;
      it.etapasResumo = Object.entries(etapas).map(([id, v]) => ({ titulo: defs[id].titulo, respostas: v.map(o => defs[id].opcoes.find(x => x.id === o)?.rotulo).filter(Boolean) }));
      preco = calcularPrecoItem({ service: servicoParaCalculo(sv, serviceType), serviceType, discount: desconto }, it);
    }
    const freteInf = Number((it.freight as Record<string, unknown> | null)?.value) || 0;
    const frete = it.serviceType === 'print' ? Math.min(FRETE_MAX, Math.max(0, r2(freteInf))) : 0;
    const total = r2(preco + frete);
    if (!(preco > 0)) return { ok: false, erro: `Não foi possível calcular o preço de "${String(it.name || '')}".` };
    if (Math.abs(total - (Number(it.total) || 0)) > 0.05) {
      return { ok: false, erro: 'Os valores do carrinho foram atualizados. Revise o pedido e tente de novo.' };
    }
    saida.push({ item: it, preco, frete, total });
  }
  return { ok: true, itens: saida };
}

/** Desconto do cupom calculado no servidor (mesmas regras do portal) */
export async function descontoCupom(db: { from: Db['from'] }, codigo: unknown, itens: ItemConferido[]):
  Promise<{ ok: true; desconto: number; cupomId: string | null } | { ok: false; erro: string }> {
  const cod = typeof codigo === 'string' ? codigo.trim().toUpperCase() : '';
  if (!cod) return { ok: true, desconto: 0, cupomId: null };
  const { data: c } = await db.from('cupons').select('*').eq('codigo', cod).eq('ativo', true).maybeSingle();
  if (!c) return { ok: false, erro: 'O cupom não é mais válido. Remova-o e tente de novo.' };
  if (c.validade && new Date(c.validade + 'T23:59:59-03:00') < new Date()) return { ok: false, erro: 'O cupom expirou.' };
  if (c.usos_max != null && c.usos_atual >= c.usos_max) return { ok: false, erro: 'O cupom atingiu o limite de usos.' };
  const restrito = (c.servicos_ids?.length > 0) || (c.especialidades?.length > 0);
  const base = restrito
    ? itens.filter(x => (c.especialidades || []).includes(x.item.specialty) || (c.servicos_ids || []).includes(x.item.servicoId))
      .reduce((s, x) => s + x.total, 0)
    : itens.reduce((s, x) => s + x.total, 0);
  if (base <= 0) return { ok: false, erro: 'O cupom não se aplica aos serviços do carrinho.' };
  const desconto = c.tipo === 'percentual' ? r2(base * (Number(c.valor) / 100)) : Math.min(Number(c.valor), base);
  return { ok: true, desconto: r2(desconto), cupomId: c.id };
}
