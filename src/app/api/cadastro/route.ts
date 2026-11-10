import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { montarCadastro } from '@/lib/cadastro';
import { ipDoPedido } from '@/lib/termo-whatsapp';

// Cria o cadastro (dcad_clientes) logo depois do supabase.auth.signUp do Wizard.
// O signUp continua no navegador porque é ele que envia o e-mail de confirmação; o registro do cliente
// é gravado aqui, com a chave de serviço, porque antes da confirmação não há sessão no navegador.
//
// Só aceita um usuário recém-criado: e-mail ainda não confirmado (ou criado há menos de 10 min, se a
// confirmação estiver desligada) e com o mesmo e-mail do formulário.

const JANELA_CONFIRMADO_MS = 10 * 60 * 1000;
const JANELA_REMOVER_MS = 60 * 60 * 1000;
const JA_CADASTRADO = 'Este e-mail já está cadastrado. Faça login ou recupere sua senha.';

export async function POST(req: NextRequest) {
  let corpo: Record<string, unknown>;
  try { corpo = await req.json(); } catch { return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 }); }

  const userId = typeof corpo.userId === 'string' ? corpo.userId : '';
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 });

  const montado = montarCadastro(corpo, { em: new Date().toISOString(), ip: ipDoPedido(req.headers) });
  if ('erro' in montado) return NextResponse.json({ error: montado.erro }, { status: 400 });
  const { registro } = montado;

  const admin = await supabaseAdmin();
  const { data: u } = await admin.auth.admin.getUserById(userId);
  const user = u?.user;
  // signUp de e-mail já confirmado devolve um usuário fictício (sem identidades) — não existe aqui
  if (!user || user.email?.toLowerCase() !== registro.email) return NextResponse.json({ error: JA_CADASTRADO }, { status: 409 });

  const idade = Date.now() - new Date(user.created_at).getTime();
  const confirmado = !!user.email_confirmed_at;
  const { data: existente } = await admin.from('dcad_clientes').select('id').eq('id', userId).maybeSingle();
  if (confirmado && (existente || idade > JANELA_CONFIRMADO_MS)) return NextResponse.json({ error: JA_CADASTRADO }, { status: 409 });

  const { data: outro } = await admin.from('dcad_clientes').select('id').eq('email', registro.email).neq('id', userId).maybeSingle();
  if (outro) return NextResponse.json({ error: JA_CADASTRADO }, { status: 409 });

  // Dentista é ativado ao confirmar o e-mail (gatilho ativar_cliente_dentista). Se a confirmação estiver
  // desligada, o e-mail já chega confirmado e o gatilho não roda mais: ativa aqui.
  const dentistaConfirmado = confirmado && registro.tipo_cliente === 'dentista_clinica';
  const linha = {
    ...registro,
    id: userId,
    ativo: dentistaConfirmado,
    confirmado_em: dentistaConfirmado ? user.email_confirmed_at : null,
  };

  // Recadastro antes de confirmar o e-mail (o signUp reenvia a confirmação): atualiza os dados
  const { error } = existente
    ? await admin.from('dcad_clientes').update(linha).eq('id', userId)
    : await admin.from('dcad_clientes').insert(linha);

  if (error) {
    console.error('[cadastro] erro ao gravar dcad_clientes', error.code, error.message);
    // Sem o cadastro a conta fica inútil: remove o usuário recém-criado para a pessoa poder tentar de novo
    if (!existente && !confirmado && idade < JANELA_REMOVER_MS) await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: 'Não foi possível salvar o cadastro. Tente novamente.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ativo: linha.ativo });
}
