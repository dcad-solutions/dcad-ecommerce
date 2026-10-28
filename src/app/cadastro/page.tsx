'use client';

import { useState } from 'react';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    if (senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setBusy(true);
    const sb = supabaseBrowser();

    // 1. Cria usuário no Supabase Auth com confirmação de email
    const { data, error } = await sb.auth.signUp({
      email: email.trim().toLowerCase(),
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { nome: nome.trim() },
      },
    });

    if (error) {
      setBusy(false);
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        setErro('Este e-mail já está cadastrado. Faça login ou recupere sua senha.');
      } else {
        setErro('Erro ao criar conta. Tente novamente.');
      }
      return;
    }

    // 2. Cria registro na tabela dcad_clientes (ativo=false até confirmar email)
    if (data.user) {
      await sb.from('dcad_clientes').insert({
        id: data.user.id,
        email: email.trim().toLowerCase(),
        nome: nome.trim(),
        ativo: false,
      });
    }

    setSucesso(true);
    setBusy(false);
  }

  if (sucesso) {
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
        <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{
            backgroundColor: '#111111',
            border: '1px solid #222',
            borderRadius: '16px',
            padding: '40px 32px',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#052e16',
              border: '1px solid #166534',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle size={28} color="#4ade80" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', margin: '0 0 12px 0' }}>
              Verifique seu e-mail
            </h2>
            <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              Enviamos um link de confirmação para{' '}
              <strong style={{ color: '#d1d5db' }}>{email}</strong>.
              <br />Clique no link para ativar sua conta e acessar o portal.
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 24px 0' }}>
              Não recebeu? Verifique sua caixa de spam ou{' '}
              <button
                onClick={() => { setSucesso(false); setNome(''); setSenha(''); }}
                style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '12px', padding: 0 }}
              >
                tente novamente
              </button>.
            </p>
            <a
              href="/login"
              style={{
                display: 'block',
                padding: '10px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                color: '#d1d5db',
                fontSize: '14px',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Voltar ao login
            </a>
          </div>
        </div>
      </div>
    );
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
            Criar sua conta
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 28px 0' }}>
            Já tem conta?{' '}
            <a href="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
              Fazer login
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

          <form onSubmit={cadastrar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#d1d5db', marginBottom: '6px' }}>
                Nome completo
              </label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                autoComplete="name"
                placeholder="Dr. João Silva"
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
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
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
              <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0 0' }}>
                Mínimo de 8 caracteres
              </p>
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
              {busy ? 'Criando conta...' : 'Criar conta'}
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
