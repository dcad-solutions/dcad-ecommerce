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
    badgeBg: '#DCFCE7',
  },
  {
    id: 'radiologia' as TipoCliente,
    label: 'Clínica Radiológica',
    descricao: 'Valores diferenciados — aprovação manual necessária',
    icon: Building2,
    badge: 'Aprovação necessária',
    badgeColor: '#92400e',
    badgeBg: '#FEF3C7',
  },
  {
    id: 'cursos' as TipoCliente,
    label: 'Cursos / Educação',
    descricao: 'Valores diferenciados — aprovação manual necessária',
    icon: GraduationCap,
    badge: 'Aprovação necessária',
    badgeColor: '#92400e',
    badgeBg: '#FEF3C7',
  },
];

export default function Cadastro() {
  const [etapa, setEtapa] = useState<'tipo' | 'dados' | 'extra' | 'sucesso'>('tipo');
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoCliente | null>(null);

  // Campos comuns
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [temWhatsapp, setTemWhatsapp] = useState(true);
  const [mostrarModalWA, setMostrarModalWA] = useState(false);
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

    const tel = celular.replace(/\D/g, '');
    if (tel.length < 10) {
      setErro('Informe um celular válido com DDD.');
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
        emailRedirectTo: 'https://portal.dcadsolutions.com.br/login',
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
        celular: celular,
        tem_whatsapp: temWhatsapp,
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
    backgroundColor: '#FAFAFA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E5E5',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 14px',
    backgroundColor: '#FAFAFA',
    border: '1px solid #E5E5E5',
    borderRadius: '8px',
    color: '#1A1A1A',
    fontSize: '14px',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#555',
    marginBottom: '6px',
  };

  const btnPrimario: React.CSSProperties = {
    width: '100%',
    padding: '11px',
    backgroundColor: busy ? '#C41920' : '#E52229',
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
          background: '#E52229',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', fontWeight: '800', color: 'white',
        }}>D</div>
        <span style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', letterSpacing: '-0.5px' }}>D-CAD</span>
      </div>
      <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>Portal do Cliente</p>
    </div>
  );

  const ErroBox = () => erro ? (
    <div style={{
      backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
      borderRadius: '8px', padding: '12px 14px', marginBottom: '20px',
      fontSize: '13px', color: '#E52229',
    }}>{erro}</div>
  ) : null;

  // ── ETAPA: TIPO ─────────────────────────────────────────────────────────
  if (etapa === 'tipo') {
    return (
      <div style={pageStyle}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <Logo />
          <div style={cardStyle}>
            <h1 style={{ fontSize: '19px', fontWeight: '700', color: '#1A1A1A', margin: '0 0 4px 0' }}>
              Criar sua conta
            </h1>
            <p style={{ fontSize: '13px', color: '#999', margin: '0 0 24px 0' }}>
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
                      backgroundColor: selecionado ? '#FEF2F2' : '#FAFAFA',
                      border: `1px solid ${selecionado ? '#E52229' : '#E5E5E5'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '8px',
                      backgroundColor: selecionado ? '#FECACA' : '#F5F5F5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={18} color={selecionado ? '#E52229' : '#999'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: selecionado ? '#1A1A1A' : '#2D2D2D', marginBottom: '3px' }}>
                        {tipo.label}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>{tipo.descricao}</div>
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
                backgroundColor: tipoSelecionado ? '#E52229' : '#E5E5E5',
                color: tipoSelecionado ? '#fff' : '#999',
                cursor: tipoSelecionado ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              Continuar <ChevronRight size={15} />
            </button>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#999' }}>
              Já tem conta?{' '}
              <a href="/login" style={{ color: '#E52229', textDecoration: 'none', fontWeight: '600' }}>
                Fazer login
              </a>
            </p>
          </div>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#CCC' }}>
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
              backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: '8px',
            }}>
              <tipoInfo.icon size={15} color="#E52229" />
              <span style={{ fontSize: '12px', color: '#E52229', fontWeight: '500' }}>{tipoInfo.label}</span>
              <button
                onClick={() => { setEtapa('tipo'); setErro(''); }}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#999', fontSize: '11px', cursor: 'pointer', padding: 0 }}
              >
                alterar
              </button>
            </div>

            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', margin: '0 0 20px 0' }}>
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
                <label style={labelStyle}>Celular *</label>
                <input type="tel" value={celular}
                  onChange={e => setCelular(formatarTelefone(e.target.value))}
                  required autoComplete="tel" placeholder="(99) 99999-9999"
                  style={inputStyle} />
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '8px', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={temWhatsapp}
                    onChange={e => {
                      if (e.target.checked) {
                        setMostrarModalWA(true);
                      } else {
                        setTemWhatsapp(false);
                      }
                    }}
                    style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: '#25D366', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '13px', color: '#555', lineHeight: '1.4' }}>Este número possui WhatsApp?</span>
                </label>
              </div>

              {/* Modal de consentimento WhatsApp / LGPD */}
              {mostrarModalWA && (
                <div style={{
                  position: 'fixed', inset: 0, zIndex: 9999,
                  background: 'rgba(0,0,0,0.55)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '16px',
                }} onClick={() => setMostrarModalWA(false)}>
                  <div style={{
                    background: '#fff', borderRadius: '12px', maxWidth: '520px', width: '100%',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                    maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                  }} onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F0F0F0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '20px' }}>💬</span>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111' }}>
                          Autorização de Comunicação via WhatsApp
                        </h3>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
                        D-CAD Dental Digital Solutions · LGPD Art. 7º, I e Art. 8º
                      </p>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '20px 24px', overflowY: 'auto', fontSize: '13px', color: '#333', lineHeight: '1.6' }}>
                      <p style={{ margin: '0 0 12px' }}>
                        Ao marcar esta opção, você, <strong>titular dos dados pessoais</strong> (número de celular
                        informado neste cadastro), <strong>consente livremente, de forma informada e inequívoca</strong>,
                        nos termos do Art. 7º, inciso I, da Lei nº 13.709/2018 (LGPD), que a{' '}
                        <strong>D-CAD Dental Digital Solutions</strong> inclua seu número na lista de transmissão
                        de WhatsApp para envio de:
                      </p>
                      <ul style={{ margin: '0 0 12px', paddingLeft: '20px' }}>
                        <li>Avisos operacionais e atualizações sobre os serviços contratados;</li>
                        <li>Novidades, lançamentos e conteúdos educacionais em odontologia digital;</li>
                        <li>Promoções, condições especiais e comunicados comerciais;</li>
                        <li>Mensagens automáticas sobre o <em>status</em> e andamento dos seus pedidos.</li>
                      </ul>
                      <p style={{ margin: '0 0 12px' }}>
                        Suas mensagens serão enviadas pelo número oficial da D-CAD e a frequência será
                        proporcional à relevância do conteúdo — sem spam.
                      </p>
                      <div style={{ background: '#F8F8F8', borderRadius: '8px', padding: '12px', marginBottom: '12px', fontSize: '12px', color: '#555' }}>
                        <strong>Revogação do consentimento (Art. 8º, §5º e Art. 18, VI da LGPD):</strong>{' '}
                        Você pode revogar esta autorização a qualquer momento, sem custo, respondendo{' '}
                        <strong>SAIR</strong> ou <strong>CANCELAR</strong> a qualquer mensagem recebida,
                        ou solicitando por escrito ao e-mail{' '}
                        <strong>contato@dcadsolutions.com.br</strong>.
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>
                        Base legal: LGPD Art. 7º, I (consentimento). Finalidade específica conforme Art. 8º,
                        §4º. Registro de aceitação: data/hora, canal digital (formulário de cadastro web),
                        número e finalidade declarada.
                      </p>
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '16px 24px', borderTop: '1px solid #F0F0F0', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => { setTemWhatsapp(false); setMostrarModalWA(false); }}
                        style={{
                          padding: '10px 20px', borderRadius: '8px', border: '1px solid #E5E5E5',
                          background: '#FAFAFA', color: '#555', cursor: 'pointer',
                          fontSize: '13px', fontWeight: 600,
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => { setTemWhatsapp(true); setMostrarModalWA(false); }}
                        style={{
                          padding: '10px 24px', borderRadius: '8px', border: 'none',
                          background: '#25D366', color: '#fff', cursor: 'pointer',
                          fontSize: '13px', fontWeight: 700,
                        }}
                      >
                        ✓ Autorizar
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#CCC' }}>
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
              padding: '10px 12px', backgroundColor: '#FEF9C3', border: '1px solid #FDE047',
              borderRadius: '8px',
            }}>
              <tipoInfo.icon size={15} color="#92400e" />
              <span style={{ fontSize: '12px', color: '#78350f', fontWeight: '500' }}>{tipoInfo.label}</span>
            </div>

            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', margin: '0 0 8px 0' }}>
              Dados da empresa
            </h1>
            <p style={{ fontSize: '13px', color: '#999', margin: '0 0 20px 0', lineHeight: '1.5' }}>
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
                backgroundColor: '#FEF9C3', border: '1px solid #FDE047',
                borderRadius: '8px', padding: '12px 14px',
              }}>
                <p style={{ fontSize: '12px', color: '#78350f', margin: 0, lineHeight: '1.5' }}>
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
            backgroundColor: isDentistaClinica ? '#DCFCE7' : '#FEF9C3',
            border: `1px solid ${isDentistaClinica ? '#86EFAC' : '#FDE047'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <CheckCircle size={28} color={isDentistaClinica ? '#166534' : '#92400e'} />
          </div>

          {isDentistaClinica ? (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', margin: '0 0 12px 0' }}>
                Verifique seu e-mail
              </h2>
              <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', margin: '0 0 8px 0' }}>
                Enviamos um link de confirmação para{' '}
                <strong style={{ color: '#1A1A1A' }}>{email}</strong>.
              </p>
              <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                Após confirmar, seu acesso será liberado automaticamente.
              </p>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', margin: '0 0 12px 0' }}>
                Cadastro recebido!
              </h2>
              <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', margin: '0 0 8px 0' }}>
                Primeiro, confirme seu e-mail: enviamos um link para{' '}
                <strong style={{ color: '#1A1A1A' }}>{email}</strong>.
              </p>
              <p style={{ fontSize: '13px', color: '#78350f', lineHeight: '1.6', margin: '0 0 24px 0', backgroundColor: '#FEF9C3', borderRadius: '8px', padding: '10px 14px' }}>
                Após a confirmação, sua conta passará por análise da equipe D-CAD. Você será notificado por e-mail quando o acesso for liberado.
              </p>
            </>
          )}

          <p style={{ fontSize: '12px', color: '#999', margin: '0 0 20px 0' }}>
            Não recebeu?{' '}
            <button
              onClick={() => { setEtapa('tipo'); setNome(''); setEmail(''); setCelular(''); setTemWhatsapp(true); setMostrarModalWA(false); setSenha(''); setNomeEmpresa(''); setCnpj(''); }}
              style={{ background: 'none', border: 'none', color: '#E52229', cursor: 'pointer', fontSize: '12px', padding: 0, fontWeight: '600' }}
            >
              Tente novamente
            </button>
          </p>

          <a href="/login" style={{
            display: 'block', padding: '10px',
            backgroundColor: '#FAFAFA', border: '1px solid #E5E5E5',
            borderRadius: '8px', color: '#1A1A1A', fontSize: '14px',
            textDecoration: 'none', textAlign: 'center',
          }}>
            Voltar ao login
          </a>
        </div>
        <p style={{ marginTop: '20px', fontSize: '12px', color: '#CCC' }}>
          © 2025 D-CAD Dental Digital Solutions
        </p>
      </div>
    </div>
  );
}
