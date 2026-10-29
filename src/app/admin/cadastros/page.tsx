'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Users, Building2 } from 'lucide-react';

function CadastrosHub() {
  const router = useRouter();
  const params = useSearchParams();
  const aba = (params.get('aba') as 'clientes' | 'fornecedores') || 'clientes';

  function irPara(tab: 'clientes' | 'fornecedores') {
    router.push(`/admin/cadastros?aba=${tab}`);
  }

  const s: Record<string, React.CSSProperties> = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#e5e7eb',
      fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
      padding: '24px',
    },
    header: {
      marginBottom: '24px',
    },
    tabs: {
      display: 'flex',
      gap: '4px',
      backgroundColor: '#111',
      border: '1px solid #222',
      borderRadius: '10px',
      padding: '4px',
      width: 'fit-content',
      marginBottom: '24px',
    },
  };

  function tabStyle(active: boolean): React.CSSProperties {
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '7px',
      padding: '8px 16px',
      borderRadius: '7px',
      fontSize: '13px',
      fontWeight: active ? '600' : '400',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: active ? '#E52229' : 'transparent',
      color: active ? '#fff' : '#6b7280',
      transition: 'all 0.15s',
    };
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#fff', margin: '0 0 4px 0' }}>Cadastros</h1>
        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
          Gerencie clientes e fornecedores da D-CAD
        </p>
      </div>

      <div style={s.tabs}>
        <button style={tabStyle(aba === 'clientes')} onClick={() => irPara('clientes')}>
          <Users size={14} />
          Clientes
        </button>
        <button style={tabStyle(aba === 'fornecedores')} onClick={() => irPara('fornecedores')}>
          <Building2 size={14} />
          Fornecedores
        </button>
      </div>

      {aba === 'clientes' ? (
        <ClientesContent />
      ) : (
        <FornecedoresContent />
      )}
    </div>
  );
}

// ─── CLIENTES ──────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import { Search, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw, ChevronDown, Plus, X, Stethoscope, GraduationCap, Pencil } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type TipoCliente = 'dentista_clinica' | 'radiologia' | 'cursos' | 'todos';
type StatusFiltro = 'todos' | 'ativo' | 'pendente' | 'incompleto' | 'bloqueado';

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  celular?: string;
  tipo_cliente: 'dentista_clinica' | 'radiologia' | 'cursos';
  nome_clinica?: string;
  cnpj?: string;
  cpf?: string;
  cro?: string;
  tipo_pessoa?: string;
  ativo: boolean;
  cadastro_completo: boolean;
  aprovado_em?: string;
  criado_em: string;
  origem?: 'portal' | 'manual';
}

const TIPO_LABEL: Record<string, string> = {
  dentista_clinica: 'Dentista / Clínica',
  radiologia: 'Radiologia',
  cursos: 'Cursos',
};

const TIPO_ICON: Record<string, React.ElementType> = {
  dentista_clinica: Stethoscope,
  radiologia: Building2,
  cursos: GraduationCap,
};

function StatusBadge({ cliente }: { cliente: Cliente }) {
  // INCOMPLETO: dentista_clinica que ainda não completou o perfil
  const isIncompleto = cliente.tipo_cliente === 'dentista_clinica' && !cliente.ativo && !cliente.cadastro_completo;
  // PENDENTE: radiologia ou cursos aguardando aprovação
  const isPendente = !cliente.ativo && (cliente.tipo_cliente === 'radiologia' || cliente.tipo_cliente === 'cursos');
  // BLOQUEADO: dentista com cadastro completo mas bloqueado pelo admin
  const isBloqueado = !cliente.ativo && cliente.tipo_cliente === 'dentista_clinica' && cliente.cadastro_completo;

  if (cliente.ativo) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', backgroundColor: '#052e16', border: '1px solid #166534', borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: '#4ade80' }}>
      <CheckCircle size={10} /> Ativo
    </span>
  );
  if (isIncompleto) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', backgroundColor: '#1a0f2e', border: '1px solid #5b21b6', borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: '#a78bfa' }}>
      <AlertCircle size={10} /> Incompleto
    </span>
  );
  if (isPendente) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', backgroundColor: '#1c1008', border: '1px solid #92400e', borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: '#fbbf24' }}>
      <Clock size={10} /> Aguardando aprovação
    </span>
  );
  if (isBloqueado) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', backgroundColor: '#1f0909', border: '1px solid #3b1212', borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: '#f87171' }}>
      <XCircle size={10} /> Bloqueado
    </span>
  );
  // fallback
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', backgroundColor: '#1f0909', border: '1px solid #3b1212', borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: '#f87171' }}>
      <XCircle size={10} /> Bloqueado
    </span>
  );
}

const CAMPOS_MODAL_CLIENTE = [
  { key: 'nome', label: 'Nome completo', type: 'text', required: true, placeholder: 'Dr. João Silva' },
  { key: 'email', label: 'E-mail', type: 'email', required: true, placeholder: 'email@clinica.com' },
  { key: 'telefone', label: 'Telefone / WhatsApp', type: 'tel', required: false, placeholder: '(98) 99999-9999' },
  { key: 'nome_clinica', label: 'Nome da clínica', type: 'text', required: false, placeholder: 'Clínica Odontológica Exemplo' },
  { key: 'cnpj', label: 'CNPJ', type: 'text', required: false, placeholder: '00.000.000/0001-00' },
];

function ModalNovoCliente({ onClose, onSalvo }: { onClose: () => void; onSalvo: () => void }) {
  const [form, setForm] = useState<Record<string, string>>({ tipo_cliente: 'dentista_clinica' });
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setBusy(true);
    const sb = supabaseBrowser();
    const { error } = await sb.from('dcad_clientes').insert({
      id: crypto.randomUUID(),
      nome: form.nome,
      email: form.email.trim().toLowerCase(),
      telefone: form.telefone || null,
      nome_clinica: form.nome_clinica || null,
      cnpj: form.cnpj?.replace(/\D/g, '') || null,
      tipo_cliente: form.tipo_cliente,
      ativo: true,
      cadastro_completo: true,
      origem: 'manual',
    });
    setBusy(false);
    if (error) { setErro('Erro ao salvar: ' + error.message); return; }
    onSalvo();
  }

  const inputS: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '9px 12px',
    backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '7px',
    color: '#e5e7eb', fontSize: '13px', outline: 'none',
  };
  const labelS: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: '500', color: '#9ca3af', marginBottom: '5px' };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
      <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>Novo cliente manual</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 0 }}><X size={18} /></button>
        </div>

        {erro && <div style={{ backgroundColor: '#1f0909', border: '1px solid #3b1212', borderRadius: '7px', padding: '10px 12px', marginBottom: '16px', fontSize: '12px', color: '#f87171' }}>{erro}</div>}

        <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelS}>Tipo de cliente *</label>
            <div style={{ position: 'relative' }}>
              <select
                value={form.tipo_cliente}
                onChange={e => setForm(f => ({ ...f, tipo_cliente: e.target.value }))}
                style={{ ...inputS, appearance: 'none', paddingRight: '32px', cursor: 'pointer' }}
              >
                <option value="dentista_clinica">Dentista / Clínica</option>
                <option value="radiologia">Radiologia</option>
                <option value="cursos">Cursos / Educação</option>
              </select>
              <ChevronDown size={13} color="#6b7280" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>

          {CAMPOS_MODAL_CLIENTE.map(campo => (
            <div key={campo.key}>
              <label style={labelS}>{campo.label}{campo.required ? ' *' : ''}</label>
              <input
                type={campo.type}
                value={form[campo.key] || ''}
                onChange={e => setForm(f => ({ ...f, [campo.key]: e.target.value }))}
                required={campo.required}
                placeholder={campo.placeholder}
                style={inputS}
              />
            </div>
          ))}

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '9px', backgroundColor: 'transparent', border: '1px solid #2a2a2a', borderRadius: '7px', color: '#9ca3af', fontSize: '13px', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={busy} style={{ flex: 1, padding: '9px', backgroundColor: busy ? '#a01820' : '#E52229', border: 'none', borderRadius: '7px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: busy ? 'not-allowed' : 'pointer' }}>
              {busy ? 'Salvando...' : 'Salvar cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── MODAL EDITAR CLIENTE ──────────────────────────────────────────────────

function ModalEditarCliente({ cliente, onClose, onSalvo }: { cliente: Cliente; onClose: () => void; onSalvo: () => void }) {
  const [form, setForm] = useState<Record<string, string>>({
    nome: cliente.nome || '',
    email: cliente.email || '',
    telefone: cliente.telefone || cliente.celular || '',
    nome_clinica: cliente.nome_clinica || '',
    cnpj: cliente.cnpj || '',
    cpf: cliente.cpf || '',
    cro: cliente.cro || '',
    tipo_cliente: cliente.tipo_cliente || 'dentista_clinica',
    tipo_pessoa: cliente.tipo_pessoa || 'juridica',
    ativo: String(cliente.ativo),
    cadastro_completo: String(cliente.cadastro_completo),
  });
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setBusy(true);
    const sb = supabaseBrowser();
    const { error } = await sb.from('dcad_clientes').update({
      nome: form.nome.trim(),
      email: form.email.trim().toLowerCase(),
      telefone: form.telefone || null,
      celular: form.telefone || null,
      nome_clinica: form.nome_clinica || null,
      cnpj: form.cnpj?.replace(/\D/g, '') || null,
      cpf: form.cpf?.replace(/\D/g, '') || null,
      cro: form.cro || null,
      tipo_cliente: form.tipo_cliente,
      tipo_pessoa: form.tipo_pessoa || null,
      ativo: form.ativo === 'true',
      cadastro_completo: form.cadastro_completo === 'true',
    }).eq('id', cliente.id);
    setBusy(false);
    if (error) { setErro('Erro ao salvar: ' + error.message); return; }
    onSalvo();
  }

  const inputS: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '9px 12px',
    backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '7px',
    color: '#e5e7eb', fontSize: '13px', outline: 'none',
  };
  const labelS: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: '500', color: '#9ca3af', marginBottom: '5px' };
  const selS: React.CSSProperties = { ...inputS, appearance: 'none', paddingRight: '32px', cursor: 'pointer' };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
      <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>Editar cadastro</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 0 }}><X size={18} /></button>
        </div>
        <p style={{ fontSize: '12px', color: '#4b5563', marginBottom: '20px', marginTop: 0 }}>{cliente.email}</p>

        {erro && <div style={{ backgroundColor: '#1f0909', border: '1px solid #3b1212', borderRadius: '7px', padding: '10px 12px', marginBottom: '16px', fontSize: '12px', color: '#f87171' }}>{erro}</div>}

        <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Seção: Dados pessoais */}
          <div style={{ borderBottom: '1px solid #1a1a1a', paddingBottom: '4px', marginBottom: '2px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dados pessoais</span>
          </div>

          <div>
            <label style={labelS}>Nome completo *</label>
            <input type="text" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required placeholder="Dr. João Silva" style={inputS} />
          </div>

          <div>
            <label style={labelS}>E-mail *</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="email@clinica.com" style={inputS} />
          </div>

          <div>
            <label style={labelS}>Telefone / WhatsApp</label>
            <input type="tel" value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(98) 99999-9999" style={inputS} />
          </div>

          <div>
            <label style={labelS}>CRO</label>
            <input type="text" value={form.cro} onChange={e => setForm(f => ({ ...f, cro: e.target.value }))} placeholder="MA-12345" style={inputS} />
          </div>

          {/* Seção: Dados da empresa */}
          <div style={{ borderBottom: '1px solid #1a1a1a', paddingBottom: '4px', marginBottom: '2px', marginTop: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Empresa / Clínica</span>
          </div>

          <div>
            <label style={labelS}>Nome da clínica</label>
            <input type="text" value={form.nome_clinica} onChange={e => setForm(f => ({ ...f, nome_clinica: e.target.value }))} placeholder="Clínica Odontológica Exemplo" style={inputS} />
          </div>

          <div>
            <label style={labelS}>Tipo de pessoa</label>
            <div style={{ position: 'relative' }}>
              <select value={form.tipo_pessoa} onChange={e => setForm(f => ({ ...f, tipo_pessoa: e.target.value }))} style={selS}>
                <option value="fisica">Pessoa Física (CPF)</option>
                <option value="juridica">Pessoa Jurídica (CNPJ)</option>
              </select>
              <ChevronDown size={13} color="#6b7280" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>

          {form.tipo_pessoa === 'fisica' ? (
            <div>
              <label style={labelS}>CPF</label>
              <input type="text" value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00" style={inputS} />
            </div>
          ) : (
            <div>
              <label style={labelS}>CNPJ</label>
              <input type="text" value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" style={inputS} />
            </div>
          )}

          {/* Seção: Configurações do cadastro */}
          <div style={{ borderBottom: '1px solid #1a1a1a', paddingBottom: '4px', marginBottom: '2px', marginTop: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Configurações</span>
          </div>

          <div>
            <label style={labelS}>Tipo de cliente *</label>
            <div style={{ position: 'relative' }}>
              <select value={form.tipo_cliente} onChange={e => setForm(f => ({ ...f, tipo_cliente: e.target.value }))} style={selS}>
                <option value="dentista_clinica">Dentista / Clínica</option>
                <option value="radiologia">Radiologia</option>
                <option value="cursos">Cursos / Educação</option>
              </select>
              <ChevronDown size={13} color="#6b7280" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>

          <div>
            <label style={labelS}>Status de acesso</label>
            <div style={{ position: 'relative' }}>
              <select value={form.ativo} onChange={e => setForm(f => ({ ...f, ativo: e.target.value }))} style={selS}>
                <option value="true">Ativo (acesso liberado)</option>
                <option value="false">Inativo (acesso bloqueado)</option>
              </select>
              <ChevronDown size={13} color="#6b7280" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>

          <div>
            <label style={labelS}>Cadastro completo</label>
            <div style={{ position: 'relative' }}>
              <select value={form.cadastro_completo} onChange={e => setForm(f => ({ ...f, cadastro_completo: e.target.value }))} style={selS}>
                <option value="true">Sim (perfil completo)</option>
                <option value="false">Não (perfil incompleto)</option>
              </select>
              <ChevronDown size={13} color="#6b7280" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '9px', backgroundColor: 'transparent', border: '1px solid #2a2a2a', borderRadius: '7px', color: '#9ca3af', fontSize: '13px', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={busy} style={{ flex: 1, padding: '9px', backgroundColor: busy ? '#1a4d2e' : '#16a34a', border: 'none', borderRadius: '7px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: busy ? 'not-allowed' : 'pointer' }}>
              {busy ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ClientesContent() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoCliente>('todos');
  const [filtroStatus, setFiltroStatus] = useState<StatusFiltro>('todos');
  const [atualizando, setAtualizando] = useState<string | null>(null);
  const [admin, setAdmin] = useState<{ id: string } | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const sb = supabaseBrowser();
    const { data } = await sb.from('dcad_clientes').select('*').order('criado_em', { ascending: false });
    setClientes(data || []);
    setCarregando(false);
  }, []);

  useEffect(() => {
    async function init() {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (user) setAdmin({ id: user.id });
      await carregar();
    }
    init();
  }, [carregar]);

  async function alterarStatus(clienteId: string, novoAtivo: boolean) {
    if (!admin) return;
    setAtualizando(clienteId);
    const sb = supabaseBrowser();
    const update: Record<string, unknown> = { ativo: novoAtivo };
    if (novoAtivo) { update.aprovado_por = admin.id; update.aprovado_em = new Date().toISOString(); }
    else { update.aprovado_por = null; update.aprovado_em = null; }
    await sb.from('dcad_clientes').update(update).eq('id', clienteId);
    await carregar();
    setAtualizando(null);
  }

  const filtrados = clientes.filter(c => {
    const matchBusca = !busca || c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.email.toLowerCase().includes(busca.toLowerCase()) ||
      (c.nome_clinica || '').toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || c.tipo_cliente === filtroTipo;
    const isIncompleto = c.tipo_cliente === 'dentista_clinica' && !c.ativo && !c.cadastro_completo;
    const isPendente = !c.ativo && (c.tipo_cliente === 'radiologia' || c.tipo_cliente === 'cursos');
    const isBloqueado = !c.ativo && c.tipo_cliente === 'dentista_clinica' && c.cadastro_completo;
    const matchStatus = filtroStatus === 'todos' ||
      (filtroStatus === 'ativo' && c.ativo) ||
      (filtroStatus === 'pendente' && isPendente) ||
      (filtroStatus === 'incompleto' && isIncompleto) ||
      (filtroStatus === 'bloqueado' && isBloqueado);
    return matchBusca && matchTipo && matchStatus;
  });

  const contadores = {
    total: clientes.length,
    ativos: clientes.filter(c => c.ativo).length,
    pendentes: clientes.filter(c => !c.ativo && (c.tipo_cliente === 'radiologia' || c.tipo_cliente === 'cursos')).length,
    incompletos: clientes.filter(c => c.tipo_cliente === 'dentista_clinica' && !c.ativo && !c.cadastro_completo).length,
    bloqueados: clientes.filter(c => !c.ativo && c.tipo_cliente === 'dentista_clinica' && c.cadastro_completo).length,
  };

  const card: React.CSSProperties = { backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '16px 20px' };
  const input: React.CSSProperties = { backgroundColor: '#161616', border: '1px solid #252525', borderRadius: '8px', color: '#e5e7eb', fontSize: '13px', padding: '8px 12px', outline: 'none' };
  const sel: React.CSSProperties = { ...input, appearance: 'none', paddingRight: '28px', cursor: 'pointer' };

  return (
    <>
      {modalAberto && <ModalNovoCliente onClose={() => setModalAberto(false)} onSalvo={() => { setModalAberto(false); carregar(); }} />}
      {clienteEditando && <ModalEditarCliente cliente={clienteEditando} onClose={() => setClienteEditando(null)} onSalvo={() => { setClienteEditando(null); carregar(); }} />}

      {/* Ações e métricas */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', flex: 1, minWidth: '360px' }}>
          {[
            { label: 'Total', valor: contadores.total, cor: '#9ca3af' },
            { label: 'Ativos', valor: contadores.ativos, cor: '#4ade80' },
            { label: 'Aguardando', valor: contadores.pendentes, cor: '#fbbf24' },
            { label: 'Incompletos', valor: contadores.incompletos, cor: '#a78bfa' },
            { label: 'Bloqueados', valor: contadores.bloqueados, cor: '#f87171' },
          ].map(m => (
            <div key={m.label} style={{ ...card, textAlign: 'center', padding: '12px' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: m.cor }}>{m.valor}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={carregar} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', backgroundColor: '#161616', border: '1px solid #252525', borderRadius: '8px', color: '#9ca3af', fontSize: '12px', cursor: 'pointer' }}>
            <RefreshCw size={13} /> Atualizar
          </button>
          <button onClick={() => setModalAberto(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', backgroundColor: '#E52229', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
            <Plus size={14} /> Novo cliente
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ ...card, display: 'flex', gap: '10px', flexWrap: 'wrap' as const, alignItems: 'center', marginBottom: '16px', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '180px' }}>
          <Search size={13} color="#6b7280" />
          <input type="text" placeholder="Buscar por nome, e-mail ou clínica..." value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{ ...input, flex: 1, border: 'none', backgroundColor: 'transparent', padding: '4px 0' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
          <div style={{ position: 'relative' }}>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value as TipoCliente)} style={sel}>
              <option value="todos">Todos os tipos</option>
              <option value="dentista_clinica">Dentista / Clínica</option>
              <option value="radiologia">Radiologia</option>
              <option value="cursos">Cursos</option>
            </select>
            <ChevronDown size={12} color="#6b7280" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as StatusFiltro)} style={sel}>
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativos</option>
              <option value="pendente">Aguardando aprovação</option>
              <option value="incompleto">Incompletos</option>
              <option value="bloqueado">Bloqueados</option>
            </select>
            <ChevronDown size={12} color="#6b7280" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Lista */}
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {carregando ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Users size={32} color="#374151" style={{ marginBottom: '12px' }} />
            <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Nenhum cliente encontrado</div>
            <button onClick={() => setModalAberto(true)} style={{ fontSize: '12px', color: '#E52229', background: 'none', border: 'none', cursor: 'pointer' }}>+ Cadastrar manualmente</button>
          </div>
        ) : (
          filtrados.map((cliente, i) => {
            const Icon = TIPO_ICON[cliente.tipo_cliente] || Stethoscope;
            const isUltimo = i === filtrados.length - 1;
            const isAtualizando = atualizando === cliente.id;
            return (
              <div key={cliente.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: isUltimo ? 'none' : '1px solid #1a1a1a' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color="#6b7280" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' as const }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#e5e7eb' }}>{cliente.nome}</span>
                    {cliente.origem === 'manual' && (
                      <span style={{ fontSize: '10px', color: '#60A5FA', backgroundColor: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '4px', padding: '1px 5px' }}>Manual</span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {cliente.email}
                    {(cliente.telefone || cliente.celular) && <span style={{ marginLeft: '8px', color: '#4b5563' }}>· {cliente.telefone || cliente.celular}</span>}
                    {cliente.nome_clinica && <span style={{ marginLeft: '8px', color: '#4b5563' }}>· {cliente.nome_clinica}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' as const }}>
                    <StatusBadge cliente={cliente} />
                    <span style={{ fontSize: '11px', color: '#4b5563' }}>{TIPO_LABEL[cliente.tipo_cliente]}</span>
                    <span style={{ fontSize: '11px', color: '#374151' }}>
                      {new Date(cliente.criado_em).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div style={{ flexShrink: 0, display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {/* Botão editar */}
                  <button
                    onClick={() => setClienteEditando(cliente)}
                    title="Editar cadastro"
                    style={{ padding: '6px 8px', backgroundColor: '#1a1a2e', border: '1px solid #2a2a4e', borderRadius: '6px', color: '#818cf8', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Pencil size={12} />
                  </button>
                  {/* Botão bloquear/liberar */}
                  {cliente.ativo ? (
                    <button onClick={() => alterarStatus(cliente.id, false)} disabled={!!isAtualizando}
                      style={{ padding: '6px 12px', backgroundColor: '#1f0909', border: '1px solid #3b1212', borderRadius: '6px', color: '#f87171', fontSize: '12px', fontWeight: '500', cursor: isAtualizando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <XCircle size={12} />{isAtualizando ? '...' : 'Bloquear'}
                    </button>
                  ) : (
                    <button onClick={() => alterarStatus(cliente.id, true)} disabled={!!isAtualizando}
                      style={{ padding: '6px 12px', backgroundColor: '#052e16', border: '1px solid #166534', borderRadius: '6px', color: '#4ade80', fontSize: '12px', fontWeight: '600', cursor: isAtualizando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <CheckCircle size={12} />{isAtualizando ? '...' : 'Liberar acesso'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      {!carregando && filtrados.length > 0 && (
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#374151' }}>
          {filtrados.length} de {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
        </p>
      )}
    </>
  );
}

// ─── FORNECEDORES ──────────────────────────────────────────────────────────

type TipoFornecedor = 'laboratorio' | 'material' | 'servico' | 'outro';

interface Fornecedor {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  cnpj?: string;
  tipo_fornecedor: TipoFornecedor;
  contato_nome?: string;
  observacoes?: string;
  ativo: boolean;
  criado_em: string;
}

const TIPO_FORNECEDOR_LABEL: Record<TipoFornecedor, string> = {
  laboratorio: 'Laboratório',
  material: 'Material / Insumo',
  servico: 'Serviço',
  outro: 'Outro',
};

const TIPO_FORNECEDOR_COR: Record<TipoFornecedor, { bg: string; border: string; text: string }> = {
  laboratorio: { bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)', text: '#A78BFA' },
  material:    { bg: 'rgba(45,212,191,0.1)', border: 'rgba(45,212,191,0.25)', text: '#2DD4BF' },
  servico:     { bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)', text: '#60A5FA' },
  outro:       { bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.25)', text: '#9CA3AF' },
};

const TEMPLATE_XLSX_HEADER = 'nome,email,telefone,cnpj,tipo_fornecedor,contato_nome,observacoes\n';
const TEMPLATE_EXEMPLO = 'Laboratório ABC,contato@lab.com,(98) 99999-9999,00.000.000/0001-00,laboratorio,Maria Silva,Parceiro principal\n';

function ModalNovoFornecedor({ onClose, onSalvo }: { onClose: () => void; onSalvo: () => void }) {
  const [form, setForm] = useState<Record<string, string>>({ tipo_fornecedor: 'servico', ativo: 'true' });
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setBusy(true);
    const sb = supabaseBrowser();
    const { error } = await sb.from('dcad_fornecedores').insert({
      nome: form.nome,
      email: form.email?.trim().toLowerCase() || null,
      telefone: form.telefone || null,
      cnpj: form.cnpj?.replace(/\D/g, '') || null,
      tipo_fornecedor: form.tipo_fornecedor,
      contato_nome: form.contato_nome || null,
      observacoes: form.observacoes || null,
      ativo: true,
    });
    setBusy(false);
    if (error) { setErro('Erro ao salvar: ' + error.message); return; }
    onSalvo();
  }

  const inputS: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '9px 12px',
    backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '7px',
    color: '#e5e7eb', fontSize: '13px', outline: 'none',
  };
  const labelS: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: '500', color: '#9ca3af', marginBottom: '5px' };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
      <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>Novo fornecedor</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 0 }}><X size={18} /></button>
        </div>
        {erro && <div style={{ backgroundColor: '#1f0909', border: '1px solid #3b1212', borderRadius: '7px', padding: '10px 12px', marginBottom: '16px', fontSize: '12px', color: '#f87171' }}>{erro}</div>}
        <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelS}>Tipo de fornecedor *</label>
            <div style={{ position: 'relative' }}>
              <select value={form.tipo_fornecedor} onChange={e => setForm(f => ({ ...f, tipo_fornecedor: e.target.value }))}
                style={{ ...inputS, appearance: 'none', paddingRight: '32px', cursor: 'pointer' }}>
                <option value="laboratorio">Laboratório</option>
                <option value="material">Material / Insumo</option>
                <option value="servico">Serviço</option>
                <option value="outro">Outro</option>
              </select>
              <ChevronDown size={13} color="#6b7280" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
          {[
            { key: 'nome', label: 'Nome / Razão social', required: true, placeholder: 'Laboratório XYZ' },
            { key: 'contato_nome', label: 'Nome do contato', required: false, placeholder: 'Maria Silva' },
            { key: 'email', label: 'E-mail', required: false, placeholder: 'contato@empresa.com' },
            { key: 'telefone', label: 'Telefone', required: false, placeholder: '(98) 99999-9999' },
            { key: 'cnpj', label: 'CNPJ', required: false, placeholder: '00.000.000/0001-00' },
          ].map(c => (
            <div key={c.key}>
              <label style={labelS}>{c.label}{c.required ? ' *' : ''}</label>
              <input type="text" value={form[c.key] || ''} onChange={e => setForm(f => ({ ...f, [c.key]: e.target.value }))}
                required={c.required} placeholder={c.placeholder} style={inputS} />
            </div>
          ))}
          <div>
            <label style={labelS}>Observações</label>
            <textarea value={form.observacoes || ''} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
              placeholder="Condições de pagamento, prazo, etc." rows={3}
              style={{ ...inputS, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '9px', backgroundColor: 'transparent', border: '1px solid #2a2a2a', borderRadius: '7px', color: '#9ca3af', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={busy} style={{ flex: 1, padding: '9px', backgroundColor: busy ? '#a01820' : '#E52229', border: 'none', borderRadius: '7px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: busy ? 'not-allowed' : 'pointer' }}>
              {busy ? 'Salvando...' : 'Salvar fornecedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalImportarFornecedores({ onClose, onImportado }: { onClose: () => void; onImportado: () => void }) {
  const [linhas, setLinhas] = useState<Record<string, string>[]>([]);
  const [importando, setImportando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  function baixarTemplate() {
    const blob = new Blob([TEMPLATE_XLSX_HEADER + TEMPLATE_EXEMPLO], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-fornecedores-dcad.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function lerArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    setErro(''); setSucesso(''); setLinhas([]);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const texto = ev.target?.result as string;
        const rows = texto.split('\n').filter(r => r.trim());
        if (rows.length < 2) { setErro('Arquivo vazio ou sem dados.'); return; }
        const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const dados = rows.slice(1).map(row => {
          const vals = row.split(',').map(v => v.trim().replace(/"/g, ''));
          return Object.fromEntries(headers.map((h, i) => [h, vals[i] || '']));
        }).filter(d => d.nome);
        if (dados.length === 0) { setErro('Nenhuma linha válida encontrada.'); return; }
        setLinhas(dados);
      } catch {
        setErro('Erro ao ler arquivo. Verifique o formato.');
      }
    };
    reader.readAsText(file);
  }

  async function importar() {
    if (linhas.length === 0) return;
    setImportando(true); setErro('');
    const sb = supabaseBrowser();
    const registros = linhas.map(l => ({
      nome: l.nome,
      email: l.email?.trim().toLowerCase() || null,
      telefone: l.telefone || null,
      cnpj: l.cnpj?.replace(/\D/g, '') || null,
      tipo_fornecedor: (['laboratorio','material','servico','outro'].includes(l.tipo_fornecedor) ? l.tipo_fornecedor : 'outro') as TipoFornecedor,
      contato_nome: l.contato_nome || null,
      observacoes: l.observacoes || null,
      ativo: true,
    }));
    const { error } = await sb.from('dcad_fornecedores').insert(registros);
    setImportando(false);
    if (error) { setErro('Erro na importação: ' + error.message); return; }
    setSucesso(`${registros.length} fornecedor${registros.length > 1 ? 'es' : ''} importado${registros.length > 1 ? 's' : ''} com sucesso!`);
    setTimeout(() => { onImportado(); }, 1500);
  }

  const inputS: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '9px 12px',
    backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '7px',
    color: '#e5e7eb', fontSize: '13px', outline: 'none',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
      <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>Importar fornecedores</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 0 }}><X size={18} /></button>
        </div>

        <div style={{ backgroundColor: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', color: '#93c5fd', margin: '0 0 8px 0', fontWeight: '500' }}>
            📋 Use a planilha modelo para garantir o formato correto
          </p>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 10px 0' }}>
            Colunas: nome, email, telefone, cnpj, tipo_fornecedor (laboratorio/material/servico/outro), contato_nome, observacoes
          </p>
          <button onClick={baixarTemplate}
            style={{ fontSize: '12px', color: '#60A5FA', background: 'none', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer' }}>
            ⬇ Baixar template CSV
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#9ca3af', marginBottom: '8px' }}>Selecionar arquivo (.csv)</label>
          <input type="file" accept=".csv,.txt" onChange={lerArquivo} style={{ ...inputS, padding: '6px 10px' }} />
        </div>

        {erro && <div style={{ backgroundColor: '#1f0909', border: '1px solid #3b1212', borderRadius: '7px', padding: '10px 12px', marginBottom: '12px', fontSize: '12px', color: '#f87171' }}>{erro}</div>}
        {sucesso && <div style={{ backgroundColor: '#052e16', border: '1px solid #166534', borderRadius: '7px', padding: '10px 12px', marginBottom: '12px', fontSize: '12px', color: '#4ade80' }}>{sucesso}</div>}

        {linhas.length > 0 && (
          <div style={{ backgroundColor: '#052e16', border: '1px solid #166534', borderRadius: '7px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#4ade80' }}>
            ✓ {linhas.length} fornecedor{linhas.length > 1 ? 'es' : ''} encontrado{linhas.length > 1 ? 's' : ''} no arquivo
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', backgroundColor: 'transparent', border: '1px solid #2a2a2a', borderRadius: '7px', color: '#9ca3af', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={importar} disabled={linhas.length === 0 || importando}
            style={{ flex: 1, padding: '9px', backgroundColor: linhas.length === 0 ? '#2a2a2a' : (importando ? '#a01820' : '#E52229'), border: 'none', borderRadius: '7px', color: linhas.length === 0 ? '#6b7280' : '#fff', fontSize: '13px', fontWeight: '600', cursor: linhas.length === 0 || importando ? 'not-allowed' : 'pointer' }}>
            {importando ? 'Importando...' : `Importar ${linhas.length > 0 ? linhas.length : ''} ${linhas.length === 1 ? 'fornecedor' : 'fornecedores'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function FornecedoresContent() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoFornecedor | 'todos'>('todos');
  const [modalNovo, setModalNovo] = useState(false);
  const [modalImport, setModalImport] = useState(false);
  const [removendo, setRemovendo] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const sb = supabaseBrowser();
    const { data } = await sb.from('dcad_fornecedores').select('*').order('criado_em', { ascending: false });
    setFornecedores(data || []);
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function toggleAtivo(id: string, ativo: boolean) {
    setRemovendo(id);
    const sb = supabaseBrowser();
    await sb.from('dcad_fornecedores').update({ ativo: !ativo }).eq('id', id);
    await carregar();
    setRemovendo(null);
  }

  const filtrados = fornecedores.filter(f => {
    const matchBusca = !busca || f.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (f.email || '').toLowerCase().includes(busca.toLowerCase()) ||
      (f.contato_nome || '').toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || f.tipo_fornecedor === filtroTipo;
    return matchBusca && matchTipo;
  });

  const card: React.CSSProperties = { backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '16px 20px' };
  const input: React.CSSProperties = { backgroundColor: '#161616', border: '1px solid #252525', borderRadius: '8px', color: '#e5e7eb', fontSize: '13px', padding: '8px 12px', outline: 'none' };

  return (
    <>
      {modalNovo && <ModalNovoFornecedor onClose={() => setModalNovo(false)} onSalvo={() => { setModalNovo(false); carregar(); }} />}
      {modalImport && <ModalImportarFornecedores onClose={() => setModalImport(false)} onImportado={() => { setModalImport(false); carregar(); }} />}

      {/* Ações e métricas */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', flex: 1, minWidth: '300px' }}>
          {(['laboratorio','material','servico','outro'] as TipoFornecedor[]).map(tipo => {
            const cor = TIPO_FORNECEDOR_COR[tipo];
            const count = fornecedores.filter(f => f.tipo_fornecedor === tipo && f.ativo).length;
            return (
              <div key={tipo} style={{ ...card, textAlign: 'center', padding: '12px' }}>
                <div style={{ fontSize: '22px', fontWeight: '700', color: cor.text }}>{count}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{TIPO_FORNECEDOR_LABEL[tipo]}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setModalImport(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', backgroundColor: '#161616', border: '1px solid #252525', borderRadius: '8px', color: '#9ca3af', fontSize: '12px', cursor: 'pointer' }}>
            ⬆ Importar CSV
          </button>
          <button onClick={() => setModalNovo(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', backgroundColor: '#E52229', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
            <Plus size={14} /> Novo fornecedor
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ ...card, display: 'flex', gap: '10px', flexWrap: 'wrap' as const, alignItems: 'center', marginBottom: '16px', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '180px' }}>
          <Search size={13} color="#6b7280" />
          <input type="text" placeholder="Buscar por nome, e-mail ou contato..." value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{ ...input, flex: 1, border: 'none', backgroundColor: 'transparent', padding: '4px 0' }} />
        </div>
        <div style={{ position: 'relative' }}>
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value as TipoFornecedor | 'todos')}
            style={{ ...input, appearance: 'none', paddingRight: '28px', cursor: 'pointer' }}>
            <option value="todos">Todos os tipos</option>
            <option value="laboratorio">Laboratório</option>
            <option value="material">Material / Insumo</option>
            <option value="servico">Serviço</option>
            <option value="outro">Outro</option>
          </select>
          <ChevronDown size={12} color="#6b7280" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Lista */}
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {carregando ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Building2 size={32} color="#374151" style={{ marginBottom: '12px' }} />
            <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Nenhum fornecedor cadastrado</div>
            <button onClick={() => setModalNovo(true)} style={{ fontSize: '12px', color: '#E52229', background: 'none', border: 'none', cursor: 'pointer' }}>+ Cadastrar manualmente</button>
          </div>
        ) : (
          filtrados.map((f, i) => {
            const cor = TIPO_FORNECEDOR_COR[f.tipo_fornecedor];
            const isUltimo = i === filtrados.length - 1;
            const isRemovendo = removendo === f.id;
            return (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: isUltimo ? 'none' : '1px solid #1a1a1a' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: cor.bg, border: `1px solid ${cor.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building2 size={16} color={cor.text} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' as const }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: f.ativo ? '#e5e7eb' : '#6b7280' }}>{f.nome}</span>
                    <span style={{ fontSize: '10px', fontWeight: '600', color: cor.text, backgroundColor: cor.bg, border: `1px solid ${cor.border}`, borderRadius: '4px', padding: '1px 6px' }}>
                      {TIPO_FORNECEDOR_LABEL[f.tipo_fornecedor]}
                    </span>
                    {!f.ativo && <span style={{ fontSize: '10px', color: '#f87171', backgroundColor: '#1f0909', border: '1px solid #3b1212', borderRadius: '4px', padding: '1px 5px' }}>Inativo</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {f.contato_nome && <span>{f.contato_nome}</span>}
                    {f.email && <span style={{ marginLeft: f.contato_nome ? '8px' : 0, color: '#4b5563' }}>{f.contato_nome ? '· ' : ''}{f.email}</span>}
                    {f.telefone && <span style={{ marginLeft: '8px', color: '#4b5563' }}>· {f.telefone}</span>}
                  </div>
                  {f.observacoes && (
                    <div style={{ fontSize: '11px', color: '#374151', marginTop: '4px', fontStyle: 'italic' }}>
                      {f.observacoes.slice(0, 80)}{f.observacoes.length > 80 ? '...' : ''}
                    </div>
                  )}
                </div>
                <div style={{ flexShrink: 0 }}>
                  <button onClick={() => toggleAtivo(f.id, f.ativo)} disabled={!!isRemovendo}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: f.ativo ? '#1f0909' : '#052e16',
                      border: `1px solid ${f.ativo ? '#3b1212' : '#166534'}`,
                      borderRadius: '6px', color: f.ativo ? '#f87171' : '#4ade80',
                      fontSize: '12px', fontWeight: '500',
                      cursor: isRemovendo ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '5px',
                    }}>
                    {f.ativo ? <><XCircle size={12} />{isRemovendo ? '...' : 'Desativar'}</> : <><CheckCircle size={12} />{isRemovendo ? '...' : 'Ativar'}</>}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      {!carregando && filtrados.length > 0 && (
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#374151' }}>
          {filtrados.length} de {fornecedores.length} fornecedor{fornecedores.length !== 1 ? 'es' : ''}
        </p>
      )}
    </>
  );
}

export const dynamic = 'force-dynamic';

export default function Cadastros() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '14px' }}>Carregando...</div>}>
      <CadastrosHub />
    </Suspense>
  );
}
