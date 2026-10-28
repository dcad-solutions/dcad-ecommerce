'use client';

import { useState } from 'react';
import { Eye, EyeOff, CheckCircle, ChevronRight, Building2, Stethoscope, GraduationCap } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type TipoCliente = 'dentista_clinica' | 'radiologia' | 'cursos';

interface Etapa1Data {
  tipo: TipoCliente;
  nome: string;
  email: string;
  telefone: string;
  senha: string;
}

const TIPOS = [
  {
    id: 'dentista_clinica' as TipoCliente,
    label: 'Dentista / Clínica Odontológica',
    descricao: 'Acesso imediato após confirmação de e-mail',
    icon: Stethoscope,
    badge: 'Acesso rápido',
    badgeColor: '#166534',
    badgeBg: '#052e16',
  },
  {
    id: 'radiologia' as TipoCliente,
    label: 'Clínica Radiológica',
    descricao: 'Valores diferenciados — aprovação manual necessária',
    icon: Building2,
    badge: 'Aprovação necessária',
    badgeColor: '#92400e',
    badgeBg: '#1c1008',
  },
  {
    id: 'cursos' as TipoCliente,
    label: 'Cursos / Educação',
    descricao: 'Valores diferenciados — aprovação manual necessária',
    icon: GraduationCap,
    badge: 'Aprovação necessária',
    badgeColor: '#92400e',
    badgeBg: '#1c1008',
  },
];

export default function Cadastro() {
  const [etapa, setEtapa] = useState<'tipo' | 'dados' | 'extra' | 'sucesso'>('tipo');
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoCliente | null>(null);

  // Campos comuns
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Campos extras (radiologia / cursos)
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [cnpj, setCnpj] = useState('');

  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);

  function formatarTelefone(valor: string) {
    const nums = valor.replace(/\D/g, '').slice(0, 11);
    if (nums.length <= 2) return nums;
    if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  }

  function formatarCnpj(valor: string) {
    const nums = valor.replace(/\D/g, '').slice(0, 14);
    if (nums.length <= 2) return nums;
    if (nums.length <= 5) return `${nums.slice(0, 2)}.${nums.slice(2)}`;
    if (nums.length <= 8) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5)}`;
    if (nums.length <= 12) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8)}`;
    return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12)}`;
  }

  function avancarParaDados() {
    if (!tipoSelecionado) return;
    setEtapa('dados');
  }

  async function submeterDados(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    if (senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    const tel = telefone.replace(/\D/g, '');
    if (tel.length < 10) {
      setErro('Informe um telefone válido com DDD.');
      return;
    }

    // Dentista: cadastra direto. Radiologia/Cursos: vai para etapa extra
    if (tipoSelecionado !== 'dentista_clinica') {
      setEtapa('extra');
      return;
    }

    await realizarCadastro();
  }

  async function submeterExtra(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    const cnpjNums = cnpj.replace(/\D/g, '');
    if (cnpjNums.length < 14) {
      setErro('Informe um CNPJ válido.');
      return;
    }

    await realizarCadastro();
  }

  async function realizarCadastro() {
    setBusy(true);
    const sb = supabaseBrowser();

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

    if (data.user) {
      const registro: Record<string, unknown> = {
        id: data.user.id,
        email: email.trim().toLowerCase(),
        nome: nome.trim(),
        telefone: telefone,
        tipo_cliente: tipoSelecionado,
        ativo: false, // trigger ativa dentistas automaticamente ao confirmar email
        cadastro_completo: false,
      };

      if (tipoSelecionado !== 'dentista_clinica') {
        registro.nome_clinica = nomeEmpresa.trim();
        registro.cnpj = cnpj.replace(/\D/g, '');
      }

      await sb.from('dcad_clientes').insert(registro);
    }

    setEtapa('sucesso');
    setBusy(false);
  }

  // ── Estilos compartilhados ──────────────────────────────────────────────
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#111111',
    border: '1px solid #222',
    borderRadius: '16px',
    padding: '32px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 14px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#d1d5db',
    marginBottom: '6px',
  };

  const btnPrimario: React.CSSProperties = {
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
  };

  const Logo = () => (
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '9px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', fontWeight: '800', color: 'white',
        }}>D</div>
        <span style={{ fontSize: '20px', fontWeight: '700', color: '#fff', letterSpacing: '-0.5px' }}>D-CAD</span>
      </div>
      <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>Portal do Cliente</p>
    </div>
  );

  const ErroBox = () => erro ? (
    <div style={{
      backgroundColor: '#1f0909', border: '1px solid #3b1212',
      borderRadius: '8px', padding: '12px 14px', marginBottom: '20px',
      fontSize: '13px', color: '#f87171',
    }}>{erro}</div>
  ) : null;

  // ── ETAPA: TIPO ─────────────────────────────────────────────────────────
  if (etapa === 'tipo') {
    return (
      <div style={pageStyle}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <Logo />
          <div style={cardStyle}>
            <h1 style={{ fontSize: '19px', fontWeight: '600', color: '#fff', margin: '0 0 4px 0' }}>
              Criar sua conta
            </h1>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px 0' }}>
              Selecione o tipo de cadastro para continuar
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {TIPOS.map((tipo) => {
                const Icon = tipo.icon;
                const selecionado = tipoSelecionado === tipo.id;
                return (
                  <button
                    key={tipo.id}
                    onClick={() => setTipoSelecionado(tipo.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 16px',
                      backgroundColor: selecionado ? '#0f2044' : '#161616',
                      border: `1px solid ${selecionado ? '#2563eb' : '#252525'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '8px',
                      backgroundColor: selecionado ? '#1d3a6e' : '#1e1e1e',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={18} color={selecionado ? '#60a5fa' : '#6b7280'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: selecionado ? '#e5e7eb' : '#d1d5db', marginBottom: '3px' }}>
                        {tipo.label}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{tipo.descricao}</div>
                    </div>
                    <div style={{
                      fontSize: '10px', fontWeight: '600', color: tipo.badgeColor,
                      backgroundColor: tipo.badgeBg, border: `1px solid ${tipo.badgeColor}33`,
                      borderRadius: '4px', padding: '2px 6px', whiteSpace: 'nowrap',
                    }}>
                      {tipo.badge}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={avancarParaDados}
              disabled={!tipoSelecionado}
              style={{
                ...btnPrimario,
                backgroundColor: tipoSelecionado ? '#2563eb' : '#1a1a1a',
                color: tipoSelecionado ? '#fff' : '#4b5563',
                cursor: tipoSelecionado ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              Continuar <ChevronRight size={15} />
            </button>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
              Já tem conta?{' '}
              <a href="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
                Fazer login
              </a>
            </p>
          </div>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#4b5563' }}>
            © 2025 D-CAD Dental Digital Solutions
          </p>
        </div>
      </div>
    );
  }

  // ── ETAPA: DADOS BÁSICOS ────────────────────────────────────────────────
  if (etapa === 'dados') {
    const tipoInfo = TIPOS.find(t => t.id === tipoSelecionado)!;
    return (
      <div style={pageStyle}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <Logo />
          <div style={cardStyle}>
            {/* Indicador de etapa */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '24px', padding: '10px 12px',
              backgroundColor: '#0f2044', border: '1px solid #1e3a5f',
              borderRadius: '8px',
            }}>
              <tipoInfo.icon size={15} color="#60a5fa" />
              <span style={{ fontSize: '12px', color: '#93c5fd' }}>{tipoInfo.label}</span>
              <button
                onClick={() => { setEtapa('tipo'); setErro(''); }}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#6b7280', fontSize: '11px', cursor: 'pointer', padding: 0 }}
              >
                alterar
              </button>
            </div>

            <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', margin: '0 0 20px 0' }}>
              {tipoSelecionado === 'dentista_clinica' ? 'Seus dados' : 'Dados de contato'}
            </h1>

            <ErroBox />

            <form onSubmit={submeterDados} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Nome completo</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)}
                  required autoComplete="name" placeholder="Dr. João Silva" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required autoComplete="email" placeholder="seu@email.com" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Telefone / WhatsApp</label>
                <input type="tel" value={telefone}
                  onChange={e => setTelefone(formatarTelefone(e.target.value))}
                  required autoComplete="tel" placeholder="(99) 99999-9999" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Senha</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha} onChange={e => setSenha(e.target.value)}
                    required autoComplete="new-password" placeholder="Mínimo 8 caracteres"
                    style={{ ...inputStyle, paddingRight: '44px' }}
                  />
                  <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0, display: 'flex' }}>
                    {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0 0' }}>Mínimo de 8 caracteres</p>
              </div>

              <button type="submit" disabled={busy} style={{ ...btnPrimario, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {busy ? 'Processando...' : (
                  tipoSelecionado === 'dentista_clinica'
                    ? <>Criar conta <ChevronRight size={15} /></>
                    : <>Continuar <ChevronRight size={15} /></>
                )}
              </button>
            </form>
          </div>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#4b5563' }}>
            © 2025 D-CAD Dental Digital Solutions
          </p>
        </div>
      </div>
    );
  }

  // ── ETAPA: DADOS EXTRAS (radiologia / cursos) ───────────────────────────
  if (etapa === 'extra') {
    const tipoInfo = TIPOS.find(t => t.id === tipoSelecionado)!;
    const labelEmpresa = tipoSelecionado === 'radiologia' ? 'Nome da clínica radiológica' : 'Nome da instituição / empresa';
    return (
      <div style={pageStyle}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <Logo />
          <div style={cardStyle}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px',
              padding: '10px 12px', backgroundColor: '#1c1008', border: '1px solid #92400e33',
              borderRadius: '8px',
            }}>
              <tipoInfo.icon size={15} color="#f59e0b" />
              <span style={{ fontSize: '12px', color: '#fbbf24' }}>{tipoInfo.label}</span>
            </div>

            <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', margin: '0 0 8px 0' }}>
              Dados da empresa
            </h1>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px 0', lineHeight: '1.5' }}>
              Necessários para análise e liberação de acesso com valores diferenciados.
            </p>

            <ErroBox />

            <form onSubmit={submeterExtra} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>{labelEmpresa}</label>
                <input type="text" value={nomeEmpresa} onChange={e => setNomeEmpresa(e.target.value)}
                  required placeholder="Nome completo da empresa" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>CNPJ</label>
                <input type="text" value={cnpj}
                  onChange={e => setCnpj(formatarCnpj(e.target.value))}
                  required placeholder="00.000.000/0001-00" style={inputStyle} />
              </div>

              <div style={{
                backgroundColor: '#1c1008', border: '1px solid #92400e33',
                borderRadius: '8px', padding: '12px 14px',
              }}>
                <p style={{ fontSize: '12px', color: '#d97706', margin: 0, lineHeight: '1.5' }}>
                  ⚠️ Após o cadastro, sua conta será analisada pela equipe D-CAD. Você receberá um e-mail quando o acesso for liberado.
                </p>
              </div>

              <button type="submit" disabled={busy} style={{ ...btnPrimario, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {busy ? 'Enviando...' : <>Finalizar cadastro <ChevronRight size={15} /></>}
              </button>

              <button type="button" onClick={() => { setEtapa('dados'); setErro(''); }}
                style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', cursor: 'pointer', padding: '4px' }}>
                ← Voltar
              </button>
            </form>
          </div>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#4b5563' }}>
            © 2025 D-CAD Dental Digital Solutions
          </p>
        </div>
      </div>
    );
  }

  // ── SUCESSO ─────────────────────────────────────────────────────────────
  const isDentistaClinica = tipoSelecionado === 'dentista_clinica';
  return (
    <div style={pageStyle}>
      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={cardStyle}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            backgroundColor: isDentistaClinica ? '#052e16' : '#1c1008',
            border: `1px solid ${isDentistaClinica ? '#166534' : '#92400e'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <CheckCircle size={28} color={isDentistaClinica ? '#4ade80' : '#f59e0b'} />
          </div>

          {isDentistaClinica ? (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', margin: '0 0 12px 0' }}>
                Verifique seu e-mail
              </h2>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.6', margin: '0 0 8px 0' }}>
                Enviamos um link de confirmação para{' '}
                <strong style={{ color: '#d1d5db' }}>{email}</strong>.
              </p>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                Após confirmar, seu acesso será liberado automaticamente.
              </p>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', margin: '0 0 12px 0' }}>
                Cadastro recebido!
              </h2>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.6', margin: '0 0 8px 0' }}>
                Primeiro, confirme seu e-mail: enviamos um link para{' '}
                <strong style={{ color: '#d1d5db' }}>{email}</strong>.
              </p>
              <p style={{ fontSize: '14px', color: '#d97706', lineHeight: '1.6', margin: '0 0 24px 0', backgroundColor: '#1c1008', borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }}>
                Após a confirmação, sua conta passará por análise da equipe D-CAD. Você será notificado por e-mail quando o acesso for liberado.
              </p>
            </>
          )}

          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 20px 0' }}>
            Não recebeu?{' '}
            <button
              onClick={() => { setEtapa('tipo'); setNome(''); setEmail(''); setTelefone(''); setSenha(''); setNomeEmpresa(''); setCnpj(''); }}
              style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '12px', padding: 0 }}
            >
              Tente novamente
            </button>
          </p>

          <a href="/login" style={{
            display: 'block', padding: '10px',
            backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
            borderRadius: '8px', color: '#d1d5db', fontSize: '14px',
            textDecoration: 'none', textAlign: 'center',
          }}>
            Voltar ao login
          </a>
        </div>
        <p style={{ marginTop: '20px', fontSize: '12px', color: '#4b5563' }}>
          © 2025 D-CAD Dental Digital Solutions
        </p>
      </div>
    </div>
  );
}
