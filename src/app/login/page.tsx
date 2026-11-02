'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const e = searchParams.get('erro');
    if (e === 'link_invalido') setErro('Link de confirmação inválido ou expirado. Faça login novamente.');
    if (e === 'email_nao_confirmado') setErro('Confirme seu e-mail antes de acessar. Verifique sua caixa de entrada.');
  }, [searchParams]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setBusy(true);
    const sb = supabaseBrowser();
    const { data, error } = await sb.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    });

    if (error) {
      setBusy(false);
      if (error.message.includes('Email not confirmed')) {
        setErro('E-mail ainda não confirmado. Verifique sua caixa de entrada.');
      } else {
        setErro('E-mail ou senha incorretos.');
      }
      return;
    }

    // Verifica se email foi confirmado
    if (!data.user?.email_confirmed_at) {
      setBusy(false);
      setErro('Confirme seu e-mail antes de acessar. Verifique sua caixa de entrada.');
      return;
    }

    window.location.href = '/';
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFAFA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
    }}>
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
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#E52229',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '800',
              color: 'white',
            }}>D</div>
            <span style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A1A', letterSpacing: '-0.5px' }}>
              D-CAD
            </span>
          </div>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Portal do Cliente</p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E5E5',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1A1A1A', margin: '0 0 4px 0' }}>
            Entrar na sua conta
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 28px 0' }}>
            Não tem conta?{' '}
            <a href="/cadastro" style={{ color: '#E52229', textDecoration: 'none', fontWeight: '500' }}>
              Cadastre-se grátis
            </a>
          </p>

          {erro && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#DC2626',
            }}>
              {erro}
            </div>
          )}

          <form onSubmit={entrar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  backgroundColor: '#FAFAFA',
                  border: '1px solid #E5E5E5',
                  borderRadius: '8px',
                  color: '#1A1A1A',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  minHeight: '44px',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                  Senha
                </label>
                <a href="/recuperar-senha" style={{ fontSize: '12px', color: '#E52229', textDecoration: 'none' }}>
                  Esqueci minha senha
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  className="auth-input"
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 44px 12px 14px',
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #E5E5E5',
                    borderRadius: '8px',
                    color: '#1A1A1A',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    minHeight: '44px',
                  }}
                />
                <button
                  type="button"
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9CA3AF',
                    padding: 0,
                    display: 'flex',
                  }}
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              className="auth-btn-primary"
              type="submit"
              disabled={busy}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: busy ? '#F87171' : '#E52229',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: busy ? 'not-allowed' : 'pointer',
                marginTop: '4px',
                transition: 'background-color 0.2s',
                minHeight: '44px',
              }}
            >
              {busy ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#9CA3AF' }}>
          © 2026 D-CAD Dental Digital Solutions
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#FAFAFA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: '#9CA3AF', fontSize: '14px' }}>Carregando...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
