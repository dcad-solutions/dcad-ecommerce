'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function Login() {
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
      backgroundColor: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
    }}>
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
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '800',
              color: 'white',
            }}>D</div>
            <span style={{ fontSize: '22px', fontWeight: '700', color: '#fff', letterSpacing: '-0.5px' }}>
              D-CAD
            </span>
          </div>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Portal do Cliente</p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#111111',
          border: '1px solid #222',
          borderRadius: '16px',
          padding: '32px',
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', margin: '0 0 4px 0' }}>
            Entrar na sua conta
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 28px 0' }}>
            Não tem conta?{' '}
            <a href="/cadastro" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
              Cadastre-se grátis
            </a>
          </p>

          {erro && (
            <div style={{
              backgroundColor: '#1f0909',
              border: '1px solid #3b1212',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#f87171',
            }}>
              {erro}
            </div>
          )}

          <form onSubmit={entrar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 14px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#d1d5db', marginBottom: '6px' }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 44px 10px 14px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: 0,
                    display: 'flex',
                  }}
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              style={{
                width: '100%',
                padding: '11px',
                backgroundColor: busy ? '#1d3a6e' : '#2563eb',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: busy ? 'not-allowed' : 'pointer',
                marginTop: '4px',
                transition: 'background-color 0.2s',
              }}
            >
              {busy ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#4b5563' }}>
          © 2025 D-CAD Dental Digital Solutions
        </p>
      </div>
    </div>
  );
}
