import { NextRequest, NextResponse } from 'next/server';
import { clienteAtual, supabaseAdmin } from '@/lib/supabase-server';

// Carrinho do cliente salvo no servidor (para retomar em outro aparelho e para o "Carrinho perdido" do Admin).
// Um carrinho aberto por cliente e paciente ("chave"). Carrinho vazio = "esvaziado" (não conta como perdido).

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  const { user, cliente } = await clienteAtual();
  if (!user || !cliente) return NextResponse.json({ error: 'Faça login novamente.' }, { status: 401 });

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 }); }
  const chave = typeof b.chave === 'string' ? b.chave.slice(0, 80) : '';
  if (!chave || chave.startsWith('pagamento:')) return NextResponse.json({ error: 'Carrinho inválido.' }, { status: 400 });

  const itens = Array.isArray(b.itens) ? b.itens.slice(0, 30) : [];
  if (JSON.stringify(itens).length > 200_000) return NextResponse.json({ error: 'Carrinho grande demais.' }, { status: 413 });
  const valor = Math.max(0, Math.min(1_000_000, Number(b.total) || 0));
  const pac = (b.paciente || {}) as Record<string, unknown>;
  const pacienteId = typeof pac.id === 'string' && UUID.test(pac.id) ? pac.id : null;
  const pacienteNome = typeof pac.nome === 'string' ? pac.nome.trim().slice(0, 120) || null : null;

  const db = await supabaseAdmin();
  const { data: atual } = await db.from('dcad_carrinhos').select('id')
    .eq('cliente_id', user.id).eq('chave', chave).eq('status', 'aberto').maybeSingle();

  if (!itens.length) {
    if (atual) await db.from('dcad_carrinhos').update({ status: 'esvaziado', itens: [], qtd: 0, atualizado_em: new Date().toISOString() }).eq('id', atual.id);
    return NextResponse.json({ ok: true, id: null });
  }

  const dados = { itens, qtd: itens.length, valor, paciente_id: pacienteId, paciente_nome: pacienteNome, atualizado_em: new Date().toISOString() };
  if (atual) {
    await db.from('dcad_carrinhos').update(dados).eq('id', atual.id);
    return NextResponse.json({ ok: true, id: atual.id });
  }
  const { data, error } = await db.from('dcad_carrinhos').insert({ ...dados, cliente_id: user.id, chave }).select('id').single();
  if (error) {
    // Outra aba gravou ao mesmo tempo: atualiza o que ela criou
    const { data: outro } = await db.from('dcad_carrinhos').select('id').eq('cliente_id', user.id).eq('chave', chave).eq('status', 'aberto').maybeSingle();
    if (outro) { await db.from('dcad_carrinhos').update(dados).eq('id', outro.id); return NextResponse.json({ ok: true, id: outro.id }); }
    return NextResponse.json({ error: 'Não foi possível salvar o carrinho.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data.id });
}
