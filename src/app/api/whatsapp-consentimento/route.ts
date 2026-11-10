import { NextRequest, NextResponse } from 'next/server';
import { clienteAtual, supabaseAdmin } from '@/lib/supabase-server';
import { ipDoPedido, TERMO_WHATSAPP_VERSAO } from '@/lib/termo-whatsapp';

// Aceite / revogação das comunicações pelo WhatsApp pelo próprio cliente (perfil do portal).
// Grava com a chave de serviço: o banco não deixa o navegador alterar essas colunas.

type Cliente = {
  celular: string | null; telefone: string | null; aceita_whatsapp: boolean;
  aceita_whatsapp_em: string | null; aceita_whatsapp_versao: string | null; whatsapp_descadastro_em: string | null;
};

const estado = (c: Cliente) => ({
  aceita: !!c.aceita_whatsapp,
  aceitaEm: c.aceita_whatsapp ? c.aceita_whatsapp_em : null,
  versao: c.aceita_whatsapp ? c.aceita_whatsapp_versao : null,
  revogadoEm: c.aceita_whatsapp ? null : c.whatsapp_descadastro_em,
  temCelular: !!(c.celular || c.telefone),
});

export async function GET() {
  const { user, cliente } = await clienteAtual();
  if (!user) return NextResponse.json({ error: 'Faça login novamente.' }, { status: 401 });
  if (!cliente) return NextResponse.json({ error: 'Cadastro não encontrado.' }, { status: 404 });
  return NextResponse.json(estado(cliente as Cliente));
}

export async function POST(req: NextRequest) {
  const { user, cliente } = await clienteAtual();
  if (!user) return NextResponse.json({ error: 'Faça login novamente.' }, { status: 401 });
  if (!cliente) return NextResponse.json({ error: 'Cadastro não encontrado.' }, { status: 404 });

  let corpo: { aceita?: unknown };
  try { corpo = await req.json(); } catch { return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 }); }
  if (typeof corpo.aceita !== 'boolean') return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 });

  const c = cliente as Cliente;
  if (corpo.aceita && !(c.celular || c.telefone)) {
    return NextResponse.json({ error: 'Cadastre um celular com WhatsApp antes de autorizar.' }, { status: 400 });
  }

  const agora = new Date().toISOString();
  const update = corpo.aceita
    ? {
        aceita_whatsapp: true, tem_whatsapp: true,
        aceita_whatsapp_em: agora, aceita_whatsapp_versao: TERMO_WHATSAPP_VERSAO,
        aceita_whatsapp_ip: ipDoPedido(req.headers), whatsapp_descadastro_em: null,
      }
    // Revogação: o registro do aceite anterior fica como histórico; a data da saída vai em whatsapp_descadastro_em
    : { aceita_whatsapp: false, whatsapp_descadastro_em: agora };

  const admin = await supabaseAdmin();
  const { data, error } = await admin.from('dcad_clientes').update(update).eq('id', user.id)
    .select('celular, telefone, aceita_whatsapp, aceita_whatsapp_em, aceita_whatsapp_versao, whatsapp_descadastro_em')
    .single();
  if (error) {
    console.error('[whatsapp-consentimento]', error.code, error.message);
    return NextResponse.json({ error: 'Não foi possível salvar. Tente novamente.' }, { status: 500 });
  }
  return NextResponse.json(estado(data as Cliente));
}
