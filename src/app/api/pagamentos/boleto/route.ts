import { NextRequest, NextResponse } from 'next/server';
import { clienteAtual, supabaseAdmin } from '@/lib/supabase-server';
import { pdfDoBoleto } from '@/lib/pagamentos';

export const maxDuration = 30;

// GET ?id=<pagamento> — PDF do boleto (só do próprio cliente)
export async function GET(req: NextRequest) {
  const { user } = await clienteAtual();
  if (!user) return NextResponse.json({ error: 'Faça login novamente.' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id') || '';
  const db = await supabaseAdmin();
  const { data: pag } = await db.from('fin_pagamentos').select('id, metodo, referencia, os:ordens_servico!inner(cliente_id)')
    .eq('id', id).eq('metodo', 'boleto').eq('os.cliente_id', user.id).maybeSingle();
  if (!pag) return NextResponse.json({ error: 'Boleto não encontrado.' }, { status: 404 });
  try {
    const pdf = Buffer.from(await pdfDoBoleto(db, pag.id), 'base64');
    return new NextResponse(new Uint8Array(pdf), {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="boleto-${pag.referencia}.pdf"`, 'Cache-Control': 'private, no-store' },
    });
  } catch (e) {
    console.error('[pagamentos] boleto', e);
    return NextResponse.json({ error: 'O boleto ainda está sendo emitido pelo banco. Tente em alguns minutos.' }, { status: 502 });
  }
}
