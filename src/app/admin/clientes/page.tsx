'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, CheckCircle, XCircle, Clock, Filter, RefreshCw, Building2, Stethoscope, GraduationCap, ChevronDown } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type TipoCliente = 'dentista_clinica' | 'radiologia' | 'cursos' | 'todos';
type StatusFiltro = 'todos' | 'ativo' | 'pendente' | 'bloqueado';

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  tipo_cliente: 'dentista_clinica' | 'radiologia' | 'cursos';
  nome_clinica?: string;
  cnpj?: string;
  ativo: boolean;
  cadastro_completo: boolean;
  aprovado_em?: string;
  criado_em: string;
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
  // Radiologia/cursos sem aprovação manual = pendente mesmo se confirmou email
  const isPendente = !cliente.ativo && (cliente.tipo_cliente === 'radiologia' || cliente.tipo_cliente === 'cursos');
  const isBloqueado = !cliente.ativo && cliente.tipo_cliente === 'dentista_clinica';
  const isAtivo = cliente.ativo;

  if (isAtivo) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', backgroundColor: '#052e16', border: '1px solid #166534', borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: '#4ade80' }}>
      <CheckCircle size={10} /> Ativo
    </span>
  );
  if (isPendente) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', backgroundColor: '#1c1008', border: '1px solid #92400e', borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: '#fbbf24' }}>
      <Clock size={10} /> Aguardando aprovação
    </span>
  );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', backgroundColor: '#1f0909', border: '1px solid #3b1212', borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: '#f87171' }}>
      <XCircle size={10} /> Bloqueado
    </span>
  );
}

export const dynamic = 'force-dynamic';

export default function AdminClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoCliente>('todos');
  const [filtroStatus, setFiltroStatus] = useState<StatusFiltro>('todos');
  const [atualizando, setAtualizando] = useState<string | null>(null);
  const [admin, setAdmin] = useState<{ id: string } | null>(null);

  const carregarClientes = useCallback(async () => {
    setCarregando(true);
    const sb = supabaseBrowser();
    const { data } = await sb
      .from('dcad_clientes')
      .select('*')
      .order('criado_em', { ascending: false });
    setClientes(data || []);
    setCarregando(false);
  }, []);

  useEffect(() => {
    async function init() {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (user) setAdmin({ id: user.id });
      await carregarClientes();
    }
    init();
  }, [carregarClientes]);

  async function alterarStatus(clienteId: string, novoAtivo: boolean) {
    if (!admin) return;
    setAtualizando(clienteId);
    const sb = supabaseBrowser();

    const update: Record<string, unknown> = { ativo: novoAtivo };
    if (novoAtivo) {
      update.aprovado_por = admin.id;
      update.aprovado_em = new Date().toISOString();
    } else {
      update.aprovado_por = null;
      update.aprovado_em = null;
    }

    await sb.from('dcad_clientes').update(update).eq('id', clienteId);
    await carregarClientes();
    setAtualizando(null);
  }

  const clientesFiltrados = clientes.filter(c => {
    const matchBusca = !busca || c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.email.toLowerCase().includes(busca.toLowerCase()) ||
      (c.nome_clinica || '').toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || c.tipo_cliente === filtroTipo;
    const matchStatus = filtroStatus === 'todos' ||
      (filtroStatus === 'ativo' && c.ativo) ||
      (filtroStatus === 'pendente' && !c.ativo && c.tipo_cliente !== 'dentista_clinica') ||
      (filtroStatus === 'bloqueado' && !c.ativo && c.tipo_cliente === 'dentista_clinica');
    return matchBusca && matchTipo && matchStatus;
  });

  const contadores = {
    total: clientes.length,
    ativos: clientes.filter(c => c.ativo).length,
    pendentes: clientes.filter(c => !c.ativo && c.tipo_cliente !== 'dentista_clinica').length,
    bloqueados: clientes.filter(c => !c.ativo && c.tipo_cliente === 'dentista_clinica').length,
  };

  const s: Record<string, React.CSSProperties> = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#e5e7eb',
      fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
      padding: '24px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '28px',
      flexWrap: 'wrap' as const,
      gap: '12px',
    },
    card: {
      backgroundColor: '#111',
      border: '1px solid #222',
      borderRadius: '12px',
      padding: '16px 20px',
    },
    input: {
      backgroundColor: '#161616',
      border: '1px solid #252525',
      borderRadius: '8px',
      color: '#e5e7eb',
      fontSize: '13px',
      padding: '8px 12px',
      outline: 'none',
    },
    select: {
      backgroundColor: '#161616',
      border: '1px solid #252525',
      borderRadius: '8px',
      color: '#e5e7eb',
      fontSize: '13px',
      padding: '8px 28px 8px 10px',
      outline: 'none',
      appearance: 'none' as const,
      cursor: 'pointer',
    },
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#fff', margin: 0 }}>Clientes</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
            Gerencie cadastros e liberações de acesso
          </p>
        </div>
        <button
          onClick={carregarClientes}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#161616', border: '1px solid #252525', borderRadius: '8px', color: '#9ca3af', fontSize: '13px', cursor: 'pointer' }}
        >
          <RefreshCw size={13} /> Atualizar
        </button>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total', valor: contadores.total, cor: '#9ca3af' },
          { label: 'Ativos', valor: contadores.ativos, cor: '#4ade80' },
          { label: 'Aguardando', valor: contadores.pendentes, cor: '#fbbf24' },
          { label: 'Bloqueados', valor: contadores.bloqueados, cor: '#f87171' },
        ].map(m => (
          <div key={m.label} style={{ ...s.card, textAlign: 'center' }}>
            <div style={{ fontSize: '26px', fontWeight: '700', color: m.cor }}>{m.valor}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ ...s.card, display: 'flex', gap: '10px', flexWrap: 'wrap' as const, alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
          <Search size={14} color="#6b7280" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou clínica..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{ ...s.input, flex: 1, border: 'none', backgroundColor: 'transparent', padding: '4px 0' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
          <div style={{ position: 'relative' }}>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value as TipoCliente)} style={s.select}>
              <option value="todos">Todos os tipos</option>
              <option value="dentista_clinica">Dentista / Clínica</option>
              <option value="radiologia">Radiologia</option>
              <option value="cursos">Cursos</option>
            </select>
            <ChevronDown size={12} color="#6b7280" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as StatusFiltro)} style={s.select}>
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativos</option>
              <option value="pendente">Aguardando aprovação</option>
              <option value="bloqueado">Bloqueados</option>
            </select>
            <ChevronDown size={12} color="#6b7280" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Lista */}
      <div style={{ ...s.card, padding: 0, overflow: 'hidden' }}>
        {carregando ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
            Carregando clientes...
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
            Nenhum cliente encontrado.
          </div>
        ) : (
          clientesFiltrados.map((cliente, i) => {
            const Icon = TIPO_ICON[cliente.tipo_cliente] || Stethoscope;
            const isUltimo = i === clientesFiltrados.length - 1;
            const isAtualizandoEste = atualizando === cliente.id;

            return (
              <div
                key={cliente.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 20px',
                  borderBottom: isUltimo ? 'none' : '1px solid #1a1a1a',
                  transition: 'background 0.1s',
                }}
              >
                {/* Ícone tipo */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={16} color="#6b7280" />
                </div>

                {/* Dados */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' as const }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#e5e7eb' }}>{cliente.nome}</span>
                    {!cliente.cadastro_completo && cliente.tipo_cliente === 'dentista_clinica' && (
                      <span style={{ fontSize: '10px', color: '#6b7280', backgroundColor: '#1a1a1a', border: '1px solid #252525', borderRadius: '4px', padding: '1px 5px' }}>
                        Cadastro incompleto
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {cliente.email}
                    {cliente.telefone && <span style={{ marginLeft: '8px', color: '#4b5563' }}>· {cliente.telefone}</span>}
                    {cliente.nome_clinica && <span style={{ marginLeft: '8px', color: '#4b5563' }}>· {cliente.nome_clinica}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' as const }}>
                    <StatusBadge cliente={cliente} />
                    <span style={{ fontSize: '11px', color: '#4b5563' }}>{TIPO_LABEL[cliente.tipo_cliente]}</span>
                    <span style={{ fontSize: '11px', color: '#374151' }}>
                      Cadastrado em {new Date(cliente.criado_em).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div style={{ flexShrink: 0, display: 'flex', gap: '8px' }}>
                  {cliente.ativo ? (
                    <button
                      onClick={() => alterarStatus(cliente.id, false)}
                      disabled={!!isAtualizandoEste}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#1f0909',
                        border: '1px solid #3b1212',
                        borderRadius: '6px',
                        color: '#f87171',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: isAtualizandoEste ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px',
                      }}
                    >
                      <XCircle size={12} />
                      {isAtualizandoEste ? '...' : 'Bloquear'}
                    </button>
                  ) : (
                    <button
                      onClick={() => alterarStatus(cliente.id, true)}
                      disabled={!!isAtualizandoEste}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#052e16',
                        border: '1px solid #166534',
                        borderRadius: '6px',
                        color: '#4ade80',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: isAtualizandoEste ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px',
                      }}
                    >
                      <CheckCircle size={12} />
                      {isAtualizandoEste ? '...' : 'Liberar acesso'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {!carregando && clientesFiltrados.length > 0 && (
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#374151' }}>
          {clientesFiltrados.length} de {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
