'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { DcadLogo } from '@/components/DcadLogo';

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
  const router = useRouter();

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
    setTimeout(() => { router.push('/'); }, 2000);
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

  if (sucesso) {
    return (
      <div style={estiloBase}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <Logo />
          <div style={cardStyle}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                backgroundColor: '#F0FDF4', border: '1px solid #86EFAC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', fontSize: '24px',
                color: '#16A34A',
              }}>✓</div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1A1A1A', margin: '0 0 8px' }}>
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
            Criar nova senha
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 28px' }}>
            Escolha uma senha segura para sua conta.
          </p>

          {erro && (
            <div style={{
              backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: '8px', padding: '12px 14px', marginBottom: '20px',
              fontSize: '13px', color: '#DC2626',
            }}>
              {erro}
              {!sessaoOk && (
                <div style={{ marginTop: '10px' }}>
                  <a href="/recuperar-senha" style={{
                    display: 'inline-block', padding: '7px 14px',
                    backgroundColor: '#E52229', color: '#fff',
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Nova senha
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="auth-input"
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '12px 44px 12px 14px',
                      backgroundColor: '#FAFAFA', border: '1px solid #E5E5E5',
                      borderRadius: '8px', color: '#1A1A1A',
                      fontSize: '14px', outline: 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      minHeight: '44px',
                    }}
                  />
                  <button
                    type="button"
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', color: '#9CA3AF', padding: 0,
                      display: 'flex',
                    }}
                  >
                    {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Confirmar nova senha
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="auth-input"
                    type={mostrarConfirmar ? 'text' : 'password'}
                    value={confirmar}
                    onChange={e => setConfirmar(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '12px 44px 12px 14px',
                      backgroundColor: '#FAFAFA', border: '1px solid #E5E5E5',
                      borderRadius: '8px', color: '#1A1A1A',
                      fontSize: '14px', outline: 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      minHeight: '44px',
                    }}
                  />
                  <button
                    type="button"
                    aria-label={mostrarConfirmar ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', color: '#9CA3AF', padding: 0,
                      display: 'flex',
                    }}
                  >
                    {mostrarConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
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
                {busy ? 'Salvando...' : 'Salvar nova senha'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#9CA3AF' }}>
          © 2026 D-CAD Dental Digital Solutions
        </p>
      </div>
    </div>
  );
}

export default function NovaSenha() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', backgroundColor: '#FAFAFA',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ color: '#9CA3AF', fontSize: '14px' }}>Carregando...</div>
      </div>
    }>
      <NovaSenhaForm />
    </Suspense>
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
