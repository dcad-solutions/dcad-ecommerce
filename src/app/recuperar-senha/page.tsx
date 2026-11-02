'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { DcadLogo } from '@/components/DcadLogo';

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
    backgroundColor: '#FAFAFA',
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
                backgroundColor: '#F0FDF4', border: '1px solid #86EFAC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '24px',
                color: '#16A34A',
              }}>✓</div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1A1A1A', margin: '0 0 8px' }}>
                E-mail enviado!
              </h1>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: '1.6' }}>
                Enviamos um link de recuperação para <strong style={{ color: '#1A1A1A' }}>{email}</strong>.
                Verifique sua caixa de entrada e clique no link para criar uma nova senha.
              </p>
            </div>
            <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', margin: '16px 0 0' }}>
              Não recebeu?{' '}
              <button
                onClick={() => { setEnviado(false); }}
                style={{ background: 'none', border: 'none', color: '#E52229', cursor: 'pointer', fontSize: '12px', padding: 0, fontWeight: '500' }}
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
      <style>{`
        .auth-input:focus {
          border-color: #E52229 !important;
          box-shadow: 0 0 0 3px rgba(229, 34, 41, 0.12) !important;
        }
        .auth-btn-primary:hover:not(:disabled) {
          background-color: #C81E24 !important;
        }
      `}</style>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <Logo />
        <div style={cardStyle}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1A1A1A', margin: '0 0 4px' }}>
            Recuperar senha
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 28px', lineHeight: '1.5' }}>
            Informe seu e-mail e enviaremos um link para você criar uma nova senha.
          </p>

          {erro && (
            <div style={{
              backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: '8px', padding: '12px 14px', marginBottom: '20px',
              fontSize: '13px', color: '#DC2626',
            }}>
              {erro}
            </div>
          )}

          <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                E-mail
              </label>
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="seu@email.com"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '12px 14px',
                  backgroundColor: '#FAFAFA', border: '1px solid #E5E5E5',
                  borderRadius: '8px', color: '#1A1A1A',
                  fontSize: '14px', outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  minHeight: '44px',
                }}
              />
            </div>

            <button
              className="auth-btn-primary"
              type="submit"
              disabled={busy}
              style={{
                width: '100%', padding: '12px',
                backgroundColor: busy ? '#F87171' : '#E52229',
                border: 'none', borderRadius: '8px',
                color: '#fff', fontSize: '14px', fontWeight: '600',
                cursor: busy ? 'not-allowed' : 'pointer',
                marginTop: '4px',
                transition: 'background-color 0.2s',
                minHeight: '44px',
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

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#9CA3AF' }}>
          © 2026 D-CAD Dental Digital Solutions
        </p>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <DcadLogo size={40} variant="color" showText={true} />
        <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Portal do Cliente</p>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E5E5E5',
  borderRadius: '16px',
  padding: '32px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
};
