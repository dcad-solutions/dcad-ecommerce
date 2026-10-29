import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, senha, nome, celular, temWhatsapp, tipoCliente, nomeEmpresa, cnpj } = body;

    // Validação básica
    if (!email || !senha || !nome || !celular || !tipoCliente) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 });
    }

    const admin = await supabaseAdmin();

    // 1. Criar usuário no Auth (service role bypassa confirmação de e-mail para criar)
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: senha,
      email_confirm: false, // envia e-mail de confirmação, usuário ainda precisa confirmar
      user_metadata: { nome: nome.trim() },
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already been registered') || authError.message.includes('User already registered')) {
        return NextResponse.json({ error: 'Este e-mail já está cadastrado. Faça login ou recupere sua senha.' }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Erro ao criar usuário.' }, { status: 500 });
    }

    // 2. Gerar e enviar e-mail de confirmação explicitamente
    // admin.createUser NÃO envia e-mail automaticamente — é preciso chamar generateLink
    await admin.auth.admin.generateLink({
      type: 'signup',
      email: email.trim().toLowerCase(),
      password: senha,
      options: {
        redirectTo: 'https://portal.dcadsolutions.com.br/auth/callback',
      },
    });

    // 3. Inserir na tabela dcad_clientes com service role (bypassa RLS)
    const registro: Record<string, unknown> = {
      id: authData.user.id,
      email: email.trim().toLowerCase(),
      nome: nome.trim(),
      celular: celular,
      tem_whatsapp: temWhatsapp ?? false,
      tipo_cliente: tipoCliente,
      ativo: false,
      cadastro_completo: false,
    };

    if (tipoCliente !== 'dentista_clinica') {
      registro.nome_clinica = nomeEmpresa?.trim() ?? '';
      registro.cnpj = cnpj?.replace(/\D/g, '') ?? '';
    }

    const { error: insertError } = await admin.from('dcad_clientes').insert(registro);

    if (insertError) {
      // Se o insert falhou, remove o usuário do auth para não deixar órfão
      await admin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: 'Erro ao salvar cadastro: ' + insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId: authData.user.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
