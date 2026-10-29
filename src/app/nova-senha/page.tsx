'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

function NovaSenhaForm() {
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sessaoOk, setSessaoOk] = useState(false);
  const searchParams = useSearchParams();

  // O Supabase envia type=recovery na URL após trocar o código no callback
  useEffect(() => {
    const sb = supabaseBrowser();
    // Verifica se há sessão ativa (callback já trocou o código)
    sb.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSessaoOk(true);
      } else {
        setErro('Link inválido ou expirado. Solicite um novo link de recuperação.');
      }
    });
  }, [searchParams]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    if (senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (senha !== confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }

    setBusy(true);
    const sb = supabaseBrowser();
    const { error } = await sb.auth.updateUser({ password: senha });
    setBusy(false);

    if (error) {
      setErro('Erro ao atualizar senha. Tente novamente.');
      return;
    }

    setSucesso(true);
    // Redireciona para home após 2s (já está logado)
    setTimeout(() => { window.location.href = '/'; }, 2000);
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

  if (sucesso) {
    return (
      <div style={estiloBase}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <Logo />
          <div style={cardStyle}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                backgroundColor: '#052e16', border: '1px solid #166534',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', fontSize: '24px',
              }}>✓</div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', margin: '0 0 8px' }}>
                Senha atualizada!
              </h1>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                Sua senha foi alterada com sucesso. Redirecionando...
              </p>
            </div>
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
            Criar nova senha
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 28px' }}>
            Escolha uma senha segura para sua conta.
          </p>

          {erro && (
            <div style={{
              backgroundColor: '#1f0909', border: '1px solid #3b1212',
              borderRadius: '8px', padding: '12px 14px', marginBottom: '20px',
              fontSize: '13px', color: '#f87171',
            }}>
              {erro}
              {!sessaoOk && (
                <div style={{ marginTop: '10px' }}>
                  <a href="/recuperar-senha" style={{
                    display: 'inline-block', padding: '7px 14px',
                    backgroundColor: '#2563eb', color: '#fff',
                    borderRadius: '6px', fontSize: '12px',
                    fontWeight: '600', textDecoration: 'none',
                  }}>
                    Solicitar novo link
                  </a>
                </div>
              )}
            </div>
          )}

          {sessaoOk && (
            <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#d1d5db', marginBottom: '6px' }}>
                  Nova senha
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '10px 44px 10px 14px',
                      backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                      borderRadius: '8px', color: '#fff',
                      fontSize: '14px', outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', color: '#6b7280', padding: 0,
                      display: 'flex',
                    }}
                  >
                    {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#d1d5db', marginBottom: '6px' }}>
                  Confirmar nova senha
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={mostrarConfirmar ? 'text' : 'password'}
                    value={confirmar}
                    onChange={e => setConfirmar(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '10px 44px 10px 14px',
                      backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                      borderRadius: '8px', color: '#fff',
                      fontSize: '14px', outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', color: '#6b7280', padding: 0,
                      display: 'flex',
                    }}
                  >
                    {mostrarConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
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
                {busy ? 'Salvando...' : 'Salvar nova senha'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#4b5563' }}>
          © 2025 D-CAD Dental Digital Solutions
        </p>
      </div>
    </div>
  );
}

export default function NovaSenha() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', backgroundColor: '#0a0a0a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ color: '#6b7280', fontSize: '14px' }}>Carregando...</div>
      </div>
    }>
      <NovaSenhaForm />
    </Suspense>
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
