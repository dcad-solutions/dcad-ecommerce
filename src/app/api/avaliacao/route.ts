import { NextRequest, NextResponse } from 'next/server';
import { clienteAtual, supabaseAdmin } from '@/lib/supabase-server';
import { chamarAdmin } from '@/lib/pagamentos';

export const maxDuration = 30;

// Avaliação de pós-venda (página pública com link único). Quem grava e confere é o Admin.
// GET ?t=<token>  → perguntas · GET ?minhas=1 → avaliações das OS do cliente logado (Meus Pedidos)
// POST { t, notas, nps, comentario }

async function repassar(corpo: Record<string, unknown>) {
  const db = await supabaseAdmin();
  try {
    return NextResponse.json(await chamarAdmin(db, '/api/avaliacao', corpo), { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    const msg = (e as Error).message;
    const status = /não encontrada/i.test(msg) ? 404 : /já foi respondida/i.test(msg) ? 409 : /nota|escolha/i.test(msg) ? 400 : 502;
    return NextResponse.json({ error: status === 502 ? 'Não foi possível carregar a avaliação agora. Tente de novo em instantes.' : msg }, { status });
  }
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  if (sp.get('minhas')) {
    const { user } = await clienteAtual();
    if (!user) return NextResponse.json({ avaliacoes: [] });
    return repassar({ acao: 'minhas', cliente_id: user.id });
  }
  const t = sp.get('t') || '';
  if (!/^[0-9a-f]{36}$/.test(t)) return NextResponse.json({ error: 'Link de avaliação inválido.' }, { status: 404 });
  return repassar({ acao: 'ler', t });
}

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => ({}));
  const t = String(b.t || '');
  if (!/^[0-9a-f]{36}$/.test(t)) return NextResponse.json({ error: 'Link de avaliação inválido.' }, { status: 404 });
  return repassar({ acao: 'responder', t, notas: b.notas, nps: b.nps, comentario: b.comentario });
}
