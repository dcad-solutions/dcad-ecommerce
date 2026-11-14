import { NextRequest, NextResponse } from 'next/server';
import { clienteAtual, supabaseAdmin } from '@/lib/supabase-server';
import { CAMPOS_PUBLICOS, criarCobranca, cobrancaDisponivel, type Forma } from '@/lib/pagamentos';

export const maxDuration = 30;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function osDoCliente(req: NextRequest) {
  const { user } = await clienteAtual();
  if (!user) return { erro: NextResponse.json({ error: 'Faça login novamente.' }, { status: 401 }) };
  const id = req.nextUrl.searchParams.get('os') || '';
  if (!UUID.test(id)) return { erro: NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 }) };
  const db = await supabaseAdmin();
  const { data: os } = await db.from('ordens_servico')
    .select('id, numero, status, pagamento_forma, pagamento_status, pagamento_expira_em, valor_total')
    .eq('id', id).eq('cliente_id', user.id).maybeSingle();
  if (!os) return { erro: NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 }) };
  return { db, os };
}

// GET ?os=<id> — situação do pagamento do pedido (a tela de retorno e Meus Pedidos consultam aqui)
export async function GET(req: NextRequest) {
  const r = await osDoCliente(req);
  if ('erro' in r) return r.erro;
  const { db, os } = r;
  const { data: pag } = await db.from('fin_pagamentos').select(CAMPOS_PUBLICOS).eq('os_id', os.id).order('criado_em', { ascending: false }).limit(1).maybeSingle();
  return NextResponse.json({
    os: { id: os.id, numero: os.numero, status: os.status, pagamento_status: os.pagamento_status, forma: os.pagamento_forma, expira_em: os.pagamento_expira_em, valor: Number(os.valor_total) },
    pagamento: pag || null,
  }, { headers: { 'Cache-Control': 'no-store' } });
}

// POST ?os=<id> — gera de novo a cobrança (falhou na hora do pedido, ou o cliente quer o código outra vez)
export async function POST(req: NextRequest) {
  const r = await osDoCliente(req);
  if ('erro' in r) return r.erro;
  const { db, os } = r;
  if (os.pagamento_status === 'pago') return NextResponse.json({ error: 'Este pedido já está pago.' }, { status: 409 });
  if (os.status === 'cancelado' || os.status === 'concluido') return NextResponse.json({ error: 'Este pedido não aceita mais pagamento.' }, { status: 409 });
  const forma = os.pagamento_forma as Forma;
  if (!(await cobrancaDisponivel(db, forma))) {
    return NextResponse.json({ error: 'O pagamento on-line está indisponível no momento. Fale com a D-CAD pelo WhatsApp (98) 98542-5982.' }, { status: 503 });
  }
  try {
    return NextResponse.json({ pagamento: await criarCobranca(db, os.id) });
  } catch (e) {
    console.error('[pagamentos] criar', e);
    return NextResponse.json({ error: 'Não foi possível gerar a cobrança agora. Tente de novo em instantes.' }, { status: 502 });
  }
}
