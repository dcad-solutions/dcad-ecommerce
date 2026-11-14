import { NextRequest, NextResponse } from 'next/server';
import { clienteAtual, supabaseAdmin } from '@/lib/supabase-server';

// Cria o pedido do Portal do Cliente como ordem de serviço do Kanban (ordens_servico) + conta a receber.
//
// * Pix e cartão: OS em "aguardando_pagamento", cancelada sozinha se não for paga no prazo
//   (fin_regras_pagamento.pedido_expira_horas; função dcad_cancelar_pedidos_expirados no banco).
// * Boleto: OS já entra em "novo" (o trabalho começa); o pagamento corre em paralelo.
// * Enquanto fin_regras_pagamento.vendas_ativas estiver desligado, só contas de administrador
//   (dcad_clientes.is_admin) fazem pedidos — em modo teste, sem cobrança.
//
// A cobrança (InfinitePay / Banco Inter) entra nas próximas fases; esta rota devolve a OS criada.

type Forma = 'pix' | 'cartao' | 'boleto';
const FORMA_DO_WIZARD: Record<string, Forma> = { pix: 'pix', card: 'cartao', prazo: 'boleto' };
const FORMA_FINANCEIRO: Record<Forma, string> = { pix: 'PIX', cartao: 'Cartão de crédito', boleto: 'Boleto' };

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v));
const r2 = (v: number) => Math.round(v * 100) / 100;
const txt = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** "dd/mm/aaaa" → "aaaa-mm-dd" */
function dataNasc(v: unknown) {
  const m = typeof v === 'string' ? v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/) : null;
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

/** Data de hoje (+ dias) no horário de São Luís, "aaaa-mm-dd" */
function diaSaoLuis(mais = 0) {
  const d = new Date(Date.now() - 3 * 3600 * 1000 + mais * 86400 * 1000);
  return d.toISOString().slice(0, 10);
}

const proximoNumero = (maior?: string | null) => {
  const n = Number(maior);
  return String((Number.isFinite(n) ? n : 0) + 1).padStart(5, '0');
};

export async function POST(req: NextRequest) {
  const { user, cliente } = await clienteAtual();
  if (!user) return NextResponse.json({ error: 'Faça login novamente.' }, { status: 401 });
  if (!cliente) return NextResponse.json({ error: 'Cadastro não encontrado.' }, { status: 404 });
  if (!cliente.ativo) return NextResponse.json({ error: 'Seu cadastro ainda não foi liberado pela D-CAD.' }, { status: 403 });
  if (!cliente.cadastro_completo) return NextResponse.json({ error: 'Complete seu cadastro antes de fazer o pedido.' }, { status: 403 });

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 }); }

  const db = await supabaseAdmin();
  const { data: regras } = await db.from('fin_regras_pagamento').select('*').eq('id', 1).maybeSingle();
  if (!regras) return NextResponse.json({ error: 'Regras de pagamento não configuradas.' }, { status: 500 });

  const modoTeste = !regras.vendas_ativas;
  if (modoTeste && !cliente.is_admin) {
    return NextResponse.json({ error: 'Os pedidos pelo portal ainda não estão liberados. Fale com a equipe D-CAD pelo WhatsApp (98) 98542-5982.' }, { status: 503 });
  }

  // ── Forma de pagamento ────────────────────────────────────────────────────
  const forma = FORMA_DO_WIZARD[String(b.method)];
  if (!forma) return NextResponse.json({ error: 'Escolha a forma de pagamento.' }, { status: 400 });
  const responsavel = b.responsavel === 'paciente' ? 'paciente' : b.responsavel === 'dentista' ? 'dentista' : null;
  if (!responsavel) return NextResponse.json({ error: 'Informe quem vai pagar.' }, { status: 400 });
  if (forma === 'boleto') {
    if (responsavel !== 'dentista') return NextResponse.json({ error: 'O boleto é só para pagamento pelo dentista.' }, { status: 400 });
    const { data: sit } = await db.rpc('dcad_boleto_situacao', { p_cliente: user.id });
    if (!sit?.liberado) return NextResponse.json({ error: 'O boleto ainda não está liberado para o seu cadastro.' }, { status: 403 });
  }

  // ── Itens e valores ───────────────────────────────────────────────────────
  // O preço vem do cálculo do portal. Antes de ligar a cobrança real ele passa a ser conferido no servidor.
  const itens = Array.isArray(b.services) ? (b.services as Record<string, unknown>[]).slice(0, 30) : [];
  if (!itens.length) return NextResponse.json({ error: 'Nenhum serviço no pedido.' }, { status: 400 });
  for (const it of itens) {
    const t = num(it.total);
    if (!txt(it.name) || !Number.isFinite(t) || t <= 0 || t > 100000) {
      return NextResponse.json({ error: 'Há um serviço com valor inválido no pedido.' }, { status: 400 });
    }
  }
  const bruto = r2(itens.reduce((s, it) => s + num(it.total), 0));
  const frete = r2(itens.reduce((s, it) => s + (num((it.freight as Record<string, unknown> | null)?.value) || 0), 0));
  const cupom = Math.min(bruto, Math.max(0, num(b.couponDiscount) || 0));
  const aposCupom = r2(bruto - cupom);
  const descontoPix = forma === 'pix' ? r2(aposCupom * (Number(regras.pix_desconto_pct) / 100)) : 0;
  const total = r2(aposCupom - descontoPix);
  if (total <= 0) return NextResponse.json({ error: 'Valor do pedido inválido.' }, { status: 400 });

  // ── Paciente ──────────────────────────────────────────────────────────────
  const pac = (b.patient || {}) as Record<string, unknown>;
  const pacNome = txt(pac.nome, 120) || 'Não informado';
  let pacienteId: string | null = null;
  if (typeof pac.id === 'string' && UUID.test(pac.id)) {
    const { data: p } = await db.from('dcad_pacientes').select('id').eq('id', pac.id).eq('cliente_id', user.id).maybeSingle();
    pacienteId = p?.id ?? null;
  }
  if (!pacienteId && pacNome !== 'Não informado') {
    const { data: p } = await db.from('dcad_pacientes')
      .insert({ cliente_id: user.id, nome: pacNome, nascimento: dataNasc(pac.nasc) }).select('id').single();
    pacienteId = p?.id ?? null;
  }

  // ── Ordem de serviço ──────────────────────────────────────────────────────
  const agora = new Date();
  const status = forma === 'boleto' ? 'novo' : 'aguardando_pagamento';
  const expira = forma === 'boleto' ? null : new Date(agora.getTime() + Number(regras.pedido_expira_horas) * 3600 * 1000).toISOString();
  const nomes = itens.map(it => txt(it.name, 120));
  const pedido = {
    modo_teste: modoTeste,
    responsavel,
    nf: responsavel === 'paciente' ? b.nfData ?? null : null,
    cupom_desconto: cupom,
    desconto_pix: descontoPix,
    pix_desconto_pct: forma === 'pix' ? Number(regras.pix_desconto_pct) : null,
    itens,
  };
  const dados = {
    status,
    origem: 'portal',
    cliente_id: user.id,
    paciente_id: pacienteId,
    paciente_nome: pacNome,
    dentista_nome: cliente.nome || cliente.email,
    dentista_cro: cliente.cro || '',
    dentista_whatsapp: cliente.celular || cliente.telefone || '',
    servicos: itens.map(it => ({ nome: txt(it.name, 120), preco: r2(num(it.total)), quantidade: 1, servico_id: typeof it.servicoId === 'string' && UUID.test(it.servicoId) ? it.servicoId : null })),
    observacoes: itens.map(it => txt(it.observacoes, 1000)).filter(Boolean).join('\n\n') || null,
    pagamento_forma: forma,
    pagamento_status: 'aguardando',
    pagamento_expira_em: expira,
    valor_bruto: bruto,
    desconto: r2(cupom + descontoPix),
    frete,
    valor_total: total,
    pedido,
    log: [{
      ts: agora.toISOString(),
      acao: 'Pedido recebido pelo Portal do Cliente',
      detalhe: `${FORMA_FINANCEIRO[forma]} · R$ ${total.toFixed(2).replace('.', ',')}${modoTeste ? ' · modo teste (sem cobrança)' : ''}`,
      usuario_nome: cliente.nome || 'Cliente',
    }],
  };

  let os: { id: string; numero: string } | null = null;
  for (let i = 0; i < 5 && !os; i++) {
    const { data: maior } = await db.from('ordens_servico').select('numero').order('numero', { ascending: false }).limit(1);
    const { data, error } = await db.from('ordens_servico')
      .insert({ ...dados, numero: proximoNumero(maior?.[0]?.numero) }).select('id, numero').single();
    if (data) os = data;
    else if (error?.code !== '23505') {
      console.error('[pedidos] OS', error);
      return NextResponse.json({ error: 'Não foi possível registrar o pedido. Tente novamente.' }, { status: 500 });
    }
  }
  if (!os) return NextResponse.json({ error: 'Não foi possível registrar o pedido. Tente novamente.' }, { status: 500 });

  // ── Conta a receber ───────────────────────────────────────────────────────
  const imprime = itens.some(it => it.serviceType === 'print');
  const soImpressao = itens.every(it => String(it.specialty || '').toLowerCase().includes('impressão'));
  const [{ data: plano }, { data: centro }] = await Promise.all([
    db.from('fin_plano_contas').select('id').eq('codigo', soImpressao ? '1.1.02' : '1.1.01').maybeSingle(),
    db.from('fin_centros_custo').select('id').eq('nome', soImpressao ? 'Impressão 3D' : imprime ? 'Planejamento + Impressão 3D' : 'Somente planejamento').maybeSingle(),
  ]);
  const { error: erroConta } = await db.from('fin_contas_receber').insert({
    descricao: `OS ${os.numero} · ${pacNome} · ${nomes.join(', ')}`.slice(0, 250),
    cliente_id: user.id,
    os_id: os.id,
    plano_conta_id: plano?.id ?? null,
    centro_custo_id: centro?.id ?? null,
    valor: total,
    vencimento: forma === 'boleto' ? diaSaoLuis(Number(regras.boleto_vencimento_dias)) : diaSaoLuis(),
    forma_pagamento: FORMA_FINANCEIRO[forma],
    obs: modoTeste ? 'Pedido de teste feito pelo Portal do Cliente (sem cobrança).' : 'Pedido do Portal do Cliente.',
  });
  if (erroConta) {
    // Sem a conta a receber o pedido não fica completo: desfaz a OS criada nesta mesma requisição
    console.error('[pedidos] conta a receber', erroConta);
    await db.from('ordens_servico').delete().eq('id', os.id);
    return NextResponse.json({ error: 'Não foi possível registrar o pedido. Tente novamente.' }, { status: 500 });
  }

  // Carrinho deste paciente vira pedido (recuperado, se já tinha recebido lembrete do "Carrinho perdido")
  const chave = typeof b.carrinhoChave === 'string' ? b.carrinhoChave.slice(0, 80) : '';
  if (chave) {
    const { data: carrinho } = await db.from('dcad_carrinhos').select('id, envios')
      .eq('cliente_id', user.id).eq('chave', chave).eq('status', 'aberto').maybeSingle();
    if (carrinho) {
      await db.from('dcad_carrinhos').update({
        status: 'pedido', os_id: os.id, convertido_em: agora.toISOString(), recuperado: (carrinho.envios || 0) > 0,
      }).eq('id', carrinho.id);
    }
  }
  // Pedido que tinha sido cancelado por falta de pagamento e foi refeito para o mesmo paciente
  if (pacienteId) {
    const { data: perdidos } = await db.from('dcad_carrinhos').select('id, envios')
      .eq('cliente_id', user.id).eq('origem', 'pagamento').eq('status', 'aberto').eq('paciente_id', pacienteId);
    for (const c of perdidos || []) {
      await db.from('dcad_carrinhos').update({ status: 'pedido', os_id: os.id, convertido_em: agora.toISOString(), recuperado: (c.envios || 0) > 0 }).eq('id', c.id);
    }
  }

  return NextResponse.json({
    ok: true,
    os: { id: os.id, numero: os.numero },
    forma,
    total,
    expira_em: expira,
    modo_teste: modoTeste,
  });
}
