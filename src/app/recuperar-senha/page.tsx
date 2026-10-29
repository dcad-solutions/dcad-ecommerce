'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setBusy(true);

    const sb = supabaseBrowser();
    const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: 'https://portal.dcadsolutions.com.br/auth/callback?next=/nova-senha',
    });

    setBusy(false);

    if (error) {
      setErro('Erro ao enviar e-mail. Tente novamente.');
      return;
    }

    setEnviado(true);
  }

  const estiloBase: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
  };

  if (enviado) {
    return (
      <div style={estiloBase}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <Logo />
          <div style={cardStyle}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                backgroundColor: '#052e16', border: '1px solid #166534',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '24px',
              }}>✓</div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', margin: '0 0 8px' }}>
                E-mail enviado!
              </h1>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: '1.6' }}>
                Enviamos um link de recuperação para <strong style={{ color: '#d1d5db' }}>{email}</strong>.
                Verifique sua caixa de entrada e clique no link para criar uma nova senha.
              </p>
            </div>
            <p style={{ fontSize: '12px', color: '#4b5563', textAlign: 'center', margin: '16px 0 0' }}>
              Não recebeu?{' '}
              <button
                onClick={() => { setEnviado(false); }}
                style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '12px', padding: 0 }}
              >
                Reenviar
              </button>
            </p>
            <a href="/login" style={{ display: 'block', marginTop: '16px', textAlign: 'center', fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>
              ← Voltar ao login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={estiloBase}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <Logo />
        <div style={cardStyle}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', margin: '0 0 4px' }}>
            Recuperar senha
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 28px', lineHeight: '1.5' }}>
            Informe seu e-mail e enviaremos um link para você criar uma nova senha.
          </p>

          {erro && (
            <div style={{
              backgroundColor: '#1f0909', border: '1px solid #3b1212',
              borderRadius: '8px', padding: '12px 14px', marginBottom: '20px',
              fontSize: '13px', color: '#f87171',
            }}>
              {erro}
            </div>
          )}

          <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#d1d5db', marginBottom: '6px' }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="seu@email.com"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '10px 14px',
                  backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                  borderRadius: '8px', color: '#fff',
                  fontSize: '14px', outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              style={{
                width: '100%', padding: '11px',
                backgroundColor: busy ? '#1d3a6e' : '#2563eb',
                border: 'none', borderRadius: '8px',
                color: '#fff', fontSize: '14px', fontWeight: '600',
                cursor: busy ? 'not-allowed' : 'pointer',
                marginTop: '4px',
              }}
            >
              {busy ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>

          <a href="/login" style={{
            display: 'block', marginTop: '20px',
            textAlign: 'center', fontSize: '13px',
            color: '#6b7280', textDecoration: 'none',
          }}>
            ← Voltar ao login
          </a>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#4b5563' }}>
          © 2025 D-CAD Dental Digital Solutions
        </p>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', fontWeight: '800', color: 'white',
        }}>D</div>
        <span style={{ fontSize: '22px', fontWeight: '700', color: '#fff', letterSpacing: '-0.5px' }}>
          D-CAD
        </span>
      </div>
      <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Portal do Cliente</p>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#111111',
  border: '1px solid #222',
  borderRadius: '16px',
  padding: '32px',
};
