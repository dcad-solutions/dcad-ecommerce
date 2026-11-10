'use client';

import { useEffect, useState } from 'react';
import { BENEFICIOS_WHATSAPP, TERMO_WHATSAPP, TERMO_WHATSAPP_VERSAO } from '@/lib/termo-whatsapp';

// Chave "Comunicações pelo WhatsApp" do perfil: o cliente autoriza (lendo o termo) ou revoga.
// Grava na hora, pelo servidor (/api/whatsapp-consentimento), com data, IP e versão do termo.

interface Estado { aceita: boolean; aceitaEm: string | null; versao: string | null; revogadoEm: string | null; temCelular: boolean }

const TEMAS = {
  escuro: {
    fundo: '#1A1A1A', fundo2: '#242424', borda: 'rgba(255,255,255,0.08)', texto: '#FFF', sec: '#B8B8B8',
    verde: '#22c55e', vermelho: '#f87171', overlay: 'rgba(0,0,0,0.85)', trilho: '#4A4A4A',
  },
  claro: {
    fundo: '#FFFFFF', fundo2: '#F5F5F5', borda: '#E5E5E5', texto: '#1A1A1A', sec: '#666',
    verde: '#16a34a', vermelho: '#dc2626', overlay: 'rgba(0,0,0,0.5)', trilho: '#BDBDBD',
  },
};

const data = (iso: string | null) => iso
  ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Fortaleza' })
  : '';

export default function ConsentimentoWhatsapp({ tema = 'claro' }: { tema?: 'claro' | 'escuro' }) {
  const t = TEMAS[tema];
  const [estado, setEstado] = useState<Estado | null>(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [modal, setModal] = useState<null | 'aceitar' | 'revogar'>(null);

  useEffect(() => {
    let vivo = true;
    fetch('/api/whatsapp-consentimento', { cache: 'no-store' })
      .then(r => r.json().catch(() => ({ error: 'Faça login novamente.' })))
      .then(j => { if (vivo) { if (j.error) setErro(j.error); else setEstado(j); } })
      .catch(() => { if (vivo) setErro('Sem conexão.'); });
    return () => { vivo = false; };
  }, []);

  async function salvar(aceita: boolean) {
    setSalvando(true); setErro('');
    try {
      const r = await fetch('/api/whatsapp-consentimento', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aceita }),
      });
      const j = await r.json().catch(() => ({ error: 'Faça login novamente.' }));
      if (!r.ok || j.error) setErro(j.error || 'Não foi possível salvar.');
      else { setEstado(j); setModal(null); }
    } catch { setErro('Sem conexão. Tente novamente.'); }
    setSalvando(false);
  }

  const ligado = !!estado?.aceita;
  const situacao = !estado ? (erro ? '' : 'Carregando…')
    : ligado ? `Autorizado em ${data(estado.aceitaEm)} · termo ${estado.versao || TERMO_WHATSAPP_VERSAO}`
    : estado.revogadoEm ? `Você parou de receber em ${data(estado.revogadoEm)}`
    : 'Não autorizado';

  const botao = (cor: string, cheio: boolean): React.CSSProperties => ({
    flex: 1, minHeight: 44, padding: '10px 12px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: salvando ? 'wait' : 'pointer',
    border: `1px solid ${cheio ? cor : t.borda}`, background: cheio ? cor : 'transparent', color: cheio ? '#fff' : t.sec, opacity: salvando ? 0.7 : 1,
  });

  return (
    <div style={{ background: t.fundo2, border: `1px solid ${t.borda}`, borderRadius: 12, padding: '14px 16px', marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.texto }}>Comunicações pelo WhatsApp</div>
          <div style={{ fontSize: 12, color: ligado ? t.verde : t.sec, marginTop: 2 }}>{situacao}</div>
        </div>
        <button
          type="button" role="switch" aria-checked={ligado} aria-label="Receber comunicações pelo WhatsApp"
          disabled={!estado || salvando}
          onClick={() => setModal(ligado ? 'revogar' : 'aceitar')}
          style={{
            width: 48, height: 28, borderRadius: 14, border: 'none', padding: 3, flexShrink: 0, cursor: estado ? 'pointer' : 'default',
            background: ligado ? t.verde : t.trilho, transition: 'background .2s', opacity: estado ? 1 : 0.5,
          }}>
          <span style={{ display: 'block', width: 22, height: 22, borderRadius: 11, background: '#fff', transform: `translateX(${ligado ? 20 : 0}px)`, transition: 'transform .2s' }} />
        </button>
      </div>
      {erro && !modal && <div role="alert" style={{ fontSize: 12, color: t.vermelho, marginTop: 8 }}>{erro}</div>}

      {modal && (
        <div onClick={() => !salvando && setModal(null)} style={{ position: 'fixed', inset: 0, background: t.overlay, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()} style={{ background: t.fundo, border: `1px solid ${t.borda}`, borderRadius: 14, padding: 20, maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto', color: t.texto }}>
            {modal === 'aceitar' ? (<>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>Autorizar comunicações pelo WhatsApp</div>
              <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: 13, color: t.sec, lineHeight: 1.7 }}>
                {BENEFICIOS_WHATSAPP.map(b => <li key={b}>{b}</li>)}
              </ul>
              <div style={{ background: t.fundo2, border: `1px solid ${t.borda}`, borderRadius: 10, padding: '12px 14px', fontSize: 11, color: t.sec, lineHeight: 1.7, marginBottom: 14 }}>
                <div style={{ fontWeight: 700, color: t.texto, marginBottom: 6, letterSpacing: 0.5 }}>TERMO DE AUTORIZAÇÃO — LGPD ({TERMO_WHATSAPP_VERSAO})</div>
                {TERMO_WHATSAPP.map(p => <p key={p.titulo} style={{ margin: '0 0 6px' }}><b style={{ color: t.texto }}>{p.titulo}:</b> {p.texto}</p>)}
              </div>
              {estado && !estado.temCelular && <div style={{ fontSize: 12, color: t.vermelho, marginBottom: 10 }}>Cadastre um celular com WhatsApp no perfil antes de autorizar.</div>}
            </>) : (<>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Parar de receber pelo WhatsApp?</div>
              <div style={{ fontSize: 13, color: t.sec, lineHeight: 1.6, marginBottom: 14 }}>
                Você deixa de receber novidades, promoções e conteúdos. Pode autorizar de novo quando quiser.
              </div>
            </>)}
            {erro && <div role="alert" style={{ fontSize: 12, color: t.vermelho, marginBottom: 10 }}>{erro}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" disabled={salvando} onClick={() => setModal(null)} style={botao(t.sec, false)}>Cancelar</button>
              {modal === 'aceitar'
                ? <button type="button" disabled={salvando || !estado?.temCelular} onClick={() => salvar(true)} style={{ ...botao(t.verde, true), flex: 2 }}>{salvando ? 'Salvando…' : '✓ Autorizar'}</button>
                : <button type="button" disabled={salvando} onClick={() => salvar(false)} style={{ ...botao(t.vermelho, true), flex: 2 }}>{salvando ? 'Salvando…' : 'Parar de receber'}</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
