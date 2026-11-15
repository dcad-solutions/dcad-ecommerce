'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Avaliação de pós-venda: o dentista abre pelo link do e-mail (sem login), avalia cada etapa com
// 1 a 5 estrelas, dá a nota de recomendação (0 a 10) e pode deixar um comentário.

interface Dados {
  os: { numero: string; paciente: string | null; dentista: string | null; servicos: string[] };
  respondida: boolean;
  config: { titulo: string; introducao: string; nps_texto: string; comentario_texto: string };
  perguntas: { id: string; texto: string; ajuda: string | null }[];
}

const ROTULO_ESTRELA = ['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente'];
const vermelho = '#E52229';

function Estrelas({ valor, onChange, rotulo }: { valor: number; onChange: (n: number) => void; rotulo: string }) {
  return (
    <div role="radiogroup" aria-label={rotulo} style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" role="radio" aria-checked={valor === n} aria-label={`${n} — ${ROTULO_ESTRELA[n]}`} onClick={() => onChange(n)}
          style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <Star size={30} color={n <= valor ? '#EAB308' : 'var(--dcad-border)'} fill={n <= valor ? '#EAB308' : 'none'} strokeWidth={1.6} />
        </button>
      ))}
      <span style={{ fontSize: 13, color: 'var(--dcad-text-sec)', minWidth: 80 }}>{ROTULO_ESTRELA[valor] || ''}</span>
    </div>
  );
}

function Formulario() {
  const t = useSearchParams().get('t') || '';
  const [dados, setDados] = useState<Dados | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [notas, setNotas] = useState<Record<string, number>>({});
  const [nps, setNps] = useState<number | null>(null);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let vivo = true;
    fetch(`/api/avaliacao?t=${encodeURIComponent(t)}`, { cache: 'no-store' })
      .then(async r => { const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Avaliação não encontrada.'); return j as Dados; })
      .then(j => { if (vivo) setDados(j); })
      .catch(e => { if (vivo) setErro(e.message); });
    return () => { vivo = false; };
  }, [t]);

  const faltam = dados ? dados.perguntas.filter(p => !notas[p.id]).length + (nps == null ? 1 : 0) : 0;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!dados) return;
    if (faltam) { setErroEnvio(faltam === 1 ? 'Falta responder 1 item.' : `Faltam responder ${faltam} itens.`); return; }
    setEnviando(true); setErroEnvio(null);
    try {
      const r = await fetch('/api/avaliacao', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t, notas, nps, comentario }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Não foi possível enviar. Tente de novo.');
      setPronto(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { setErroEnvio((e as Error).message); }
    finally { setEnviando(false); }
  }

  const cartao: React.CSSProperties = { background: 'var(--dcad-card)', border: '1px solid var(--dcad-border)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 };

  if (erro) return <Aviso icone={<AlertCircle size={36} color={vermelho} />} titulo="Link inválido" texto={erro} />;
  if (!dados) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: 'var(--dcad-text-sec)' }}><Loader2 size={24} style={{ animation: 'giro 1s linear infinite' }} /></div>;
  if (pronto || dados.respondida) {
    return <Aviso icone={<CheckCircle size={40} color="#22C55E" />} titulo="Obrigado pela avaliação!" texto={pronto ? 'Sua opinião chega direto para a equipe D-CAD e ajuda a melhorar cada etapa do serviço.' : 'Esta OS já foi avaliada. Obrigado!'} />;
  }

  return (
    <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, textWrap: 'balance' }}>{dados.config.titulo}</h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--dcad-text-sec)', lineHeight: 1.6 }}>{dados.config.introducao}</p>
        <div style={{ fontSize: 13, color: 'var(--dcad-text-sec)', background: 'var(--dcad-card)', border: '1px solid var(--dcad-border)', borderRadius: 10, padding: '10px 12px' }}>
          <b style={{ color: 'var(--dcad-text)' }}>OS {dados.os.numero}</b>{dados.os.paciente ? ` · paciente ${dados.os.paciente}` : ''}
          {dados.os.servicos.length > 0 && <div style={{ marginTop: 2 }}>{dados.os.servicos.join(', ')}</div>}
        </div>
      </header>

      {dados.perguntas.map((p, i) => (
        <div key={p.id} style={cartao}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{i + 1}. {p.texto}</div>
            {p.ajuda && <div style={{ fontSize: 13, color: 'var(--dcad-text-sec)', marginTop: 2 }}>{p.ajuda}</div>}
          </div>
          <Estrelas valor={notas[p.id] || 0} rotulo={p.texto} onChange={n => setNotas({ ...notas, [p.id]: n })} />
        </div>
      ))}

      <div style={cartao}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{dados.perguntas.length + 1}. {dados.config.nps_texto}</div>
        <div role="radiogroup" aria-label={dados.config.nps_texto} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))', gap: 6 }}>
          {Array.from({ length: 11 }, (_, n) => {
            const on = nps === n;
            const cor = n <= 6 ? vermelho : n <= 8 ? '#EAB308' : '#22C55E';
            return (
              <button key={n} type="button" role="radio" aria-checked={on} onClick={() => setNps(n)}
                style={{ minHeight: 44, borderRadius: 10, border: `1px solid ${on ? cor : 'var(--dcad-border)'}`, background: on ? cor : 'var(--dcad-bg)', color: on ? '#fff' : 'var(--dcad-text)', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>
                {n}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--dcad-text-sec)' }}>
          <span>Nada provável</span><span>Com certeza</span>
        </div>
      </div>

      <div style={cartao}>
        <label htmlFor="comentario" style={{ fontSize: 15, fontWeight: 700 }}>{dados.config.comentario_texto} <span style={{ fontWeight: 400, color: 'var(--dcad-text-sec)', fontSize: 13 }}>(opcional)</span></label>
        <textarea id="comentario" value={comentario} onChange={e => setComentario(e.target.value)} maxLength={2000} rows={4}
          style={{ width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1px solid var(--dcad-border)', background: 'var(--dcad-bg)', color: 'var(--dcad-text)', fontSize: 16, padding: 12, resize: 'vertical', fontFamily: 'inherit' }} />
      </div>

      {erroEnvio && <div role="alert" style={{ fontSize: 14, color: vermelho }}>{erroEnvio}</div>}
      <button type="submit" disabled={enviando}
        style={{ minHeight: 52, borderRadius: 12, border: 'none', background: vermelho, color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', opacity: enviando ? 0.6 : 1 }}>
        {enviando ? 'Enviando…' : 'Enviar avaliação'}
      </button>
    </form>
  );
}

function Aviso({ icone, titulo, texto }: { icone: React.ReactNode; titulo: string; texto: string }) {
  return (
    <div style={{ background: 'var(--dcad-card)', border: '1px solid var(--dcad-border)', borderRadius: 14, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
      {icone}
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{titulo}</h1>
      <p style={{ margin: 0, fontSize: 14, color: 'var(--dcad-text-sec)', lineHeight: 1.6 }}>{texto}</p>
    </div>
  );
}

export default function AvaliacaoPage() {
  return (
    <main style={{ minHeight: '100dvh', background: 'var(--dcad-bg)', color: 'var(--dcad-text)', paddingBlock: 28, paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}>
      <style>{'@keyframes giro { to { transform: rotate(360deg); } }'}</style>
      <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em' }}>D<span style={{ color: vermelho }}>-</span>CAD</div>
        <Suspense fallback={null}><Formulario /></Suspense>
      </div>
    </main>
  );
}
