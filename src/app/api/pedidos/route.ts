import { NextRequest, NextResponse } from 'next/server';
import { clienteAtual, supabaseAdmin } from '@/lib/supabase-server';
import { conferirItens, descontoCupom } from '@/lib/preco-servidor';
import { cobrancaDisponivel, criarCobranca, type PagamentoPublico } from '@/lib/pagamentos';

// Cria o pedido do Portal do Cliente como ordem de serviço do Kanban (ordens_servico) + conta a receber.
//
// * Pix e cartão: OS em "aguardando_pagamento", cancelada sozinha se não for paga no prazo
//   (fin_regras_pagamento.pedido_expira_horas; função dcad_cancelar_pedidos_expirados no banco).
// * Boleto: OS já entra em "novo" (o trabalho começa); o pagamento corre em paralelo.
// * Enquanto fin_regras_pagamento.vendas_ativas estiver desligado, só contas de administrador
//   (dcad_clientes.is_admin) fazem pedidos — em modo teste, sem cobrança.
//
// * Cobrança: com a integração da forma escolhida ativa (Financeiro → Integrações), o Admin cria o Pix,
//   o boleto (Banco Inter) ou o link de cartão (InfinitePay) e a resposta já leva o que o cliente precisa.
//   Com as vendas liberadas e a integração desligada, o pedido nem é registrado.
// * Crédito do cliente (usarCredito): abatido do total depois dos descontos (função dcad_credito_aplicar_os).
//   Se cobrir tudo, a OS já entra paga (forma 'credito' quando o cliente não escolhe outra); senão, cobra só a diferença.

type Forma = 'pix' | 'cartao' | 'boleto' | 'credito';
const FORMA_DO_WIZARD: Record<string, Forma> = { pix: 'pix', card: 'cartao', prazo: 'boleto', credito: 'credito' };
const FORMA_FINANCEIRO: Record<Forma, string> = { pix: 'PIX', cartao: 'Cartão de crédito', boleto: 'Boleto', credito: 'Crédito do cliente' };

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

export const maxDuration = 30;

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

  // Crédito do cliente: saldo conferido aqui e de novo no banco ao aplicar
  const usarCredito = b.usarCredito === true || forma === 'credito';
  let saldoCredito = 0;
  if (usarCredito) {
    const { data: saldo } = await db.rpc('dcad_credito_saldo', { p_cliente: user.id });
    saldoCredito = Number(saldo) || 0;
    if (saldoCredito <= 0) return NextResponse.json({ error: 'Você não tem crédito disponível. Escolha uma forma de pagamento.' }, { status: 409 });
  }

  const cobrar = forma === 'credito' ? false : await cobrancaDisponivel(db, forma);

  // ── Itens e valores: preço recalculado no servidor (src/lib/preco.js) ────
  const recebidos = Array.isArray(b.services) ? (b.services as Record<string, unknown>[]).slice(0, 30) : [];
  if (!recebidos.length) return NextResponse.json({ error: 'Nenhum serviço no pedido.' }, { status: 400 });
  const conf = await conferirItens(db, recebidos, cliente);
  if (!conf.ok) return NextResponse.json({ error: conf.erro }, { status: 409 });
  const itens: Record<string, unknown>[] = conf.itens.map(x => ({ ...x.item, total: x.total }));
  const bruto = r2(conf.itens.reduce((s, x) => s + x.total, 0));
  const frete = r2(conf.itens.reduce((s, x) => s + x.frete, 0));
  const cup = await descontoCupom(db, b.couponCode, conf.itens);
  if (!cup.ok) return NextResponse.json({ error: cup.erro }, { status: 409 });
  const cupom = Math.min(bruto, cup.desconto);
  const aposCupom = r2(bruto - cupom);
  const descontoPix = forma === 'pix' ? r2(aposCupom * (Number(regras.pix_desconto_pct) / 100)) : 0;
  const total = r2(aposCupom - descontoPix);
  if (total <= 0) return NextResponse.json({ error: 'Valor do pedido inválido.' }, { status: 400 });
  const credito = usarCredito ? r2(Math.min(saldoCredito, total)) : 0;
  const cobertoPeloCredito = usarCredito && credito >= total;
  if (forma === 'credito' && !cobertoPeloCredito) {
    return NextResponse.json({ error: 'Seu crédito não cobre o pedido inteiro. Escolha uma forma de pagamento para o restante.' }, { status: 409 });
  }
  // Com as vendas liberadas, a forma escolhida precisa estar disponível (a não ser que o crédito pague tudo)
  if (!modoTeste && !cobrar && !cobertoPeloCredito) {
    return NextResponse.json({ error: 'Esta forma de pagamento está indisponível no momento. Escolha outra ou fale com a D-CAD pelo WhatsApp (98) 98542-5982.' }, { status: 503 });
  }

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
    cupom_codigo: cup.cupomId ? String(b.couponCode).trim().toUpperCase() : null,
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
    servicos: itens.map(it => ({
      nome: txt(it.name, 120), preco: r2(num(it.total)), quantidade: 1,
      servico_id: typeof it.servicoId === 'string' && UUID.test(it.servicoId) ? it.servicoId : null,
      // Respostas das etapas personalizadas (conferidas no servidor)
      ...(Array.isArray(it.etapasResumo) && it.etapasResumo.length ? { etapas: it.etapasResumo } : {}),
    })),
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
      detalhe: `${FORMA_FINANCEIRO[forma]} · R$ ${total.toFixed(2).replace('.', ',')}${credito > 0 && forma !== 'credito' ? ` · crédito de R$ ${credito.toFixed(2).replace('.', ',')}` : ''}${modoTeste ? (cobrar ? ' · modo teste' : ' · modo teste (sem cobrança)') : ''}`,
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
    obs: modoTeste ? `Pedido de teste feito pelo Portal do Cliente${cobrar ? '' : ' (sem cobrança)'}.` : 'Pedido do Portal do Cliente.',
  });
  if (erroConta) {
    // Sem a conta a receber o pedido não fica completo: desfaz a OS criada nesta mesma requisição
    console.error('[pedidos] conta a receber', erroConta);
    await db.from('ordens_servico').delete().eq('id', os.id);
    return NextResponse.json({ error: 'Não foi possível registrar o pedido. Tente novamente.' }, { status: 500 });
  }

  // Crédito do cliente: abate do total (e libera a OS se pagar tudo)
  let pagoComCredito = false;
  if (credito > 0) {
    const { data: r, error: erroCredito } = await db.rpc('dcad_credito_aplicar_os', { p_os: os.id, p_valor: credito, p_usuario: null, p_usuario_nome: cliente.nome || 'Cliente' });
    if (erroCredito) {
      console.error('[pedidos] crédito', erroCredito);
      await db.from('fin_contas_receber').delete().eq('os_id', os.id);
      await db.from('ordens_servico').delete().eq('id', os.id);
      return NextResponse.json({ error: 'Não foi possível usar o seu crédito agora. Nenhuma cobrança foi feita. Tente novamente.' }, { status: 409 });
    }
    pagoComCredito = !!(r as { pago?: boolean } | null)?.pago;
  }

  // Uso do cupom
  if (cup.cupomId) {
    const { data: c } = await db.from('cupons').select('usos_atual').eq('id', cup.cupomId).single();
    await db.from('cupons').update({ usos_atual: (c?.usos_atual || 0) + 1 }).eq('id', cup.cupomId);
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

  // ── Cobrança ──────────────────────────────────────────────────────────────
  // Se falhar aqui, o pedido fica registrado e o cliente gera o pagamento de novo em Meus Pedidos.
  let pagamento: PagamentoPublico | null = null;
  let erroPagamento: string | null = null;
  if (cobrar && !pagoComCredito) {
    try { pagamento = await criarCobranca(db, os.id); }
    catch (e) {
      console.error('[pedidos] cobrança', e);
      erroPagamento = 'Seu pedido foi registrado, mas o banco não respondeu ao gerar o pagamento. Gere de novo em Meus Pedidos.';
    }
  }

  return NextResponse.json({
    ok: true,
    os: { id: os.id, numero: os.numero },
    forma,
    total,
    expira_em: pagoComCredito ? null : expira,
    credito_aplicado: credito,
    a_pagar: r2(total - credito),
    pago_com_credito: pagoComCredito,
    modo_teste: modoTeste,
    pagamento,
    erro_pagamento: erroPagamento,
  });
}
