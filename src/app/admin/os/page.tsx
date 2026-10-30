'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { RefreshCw, X, ChevronRight, Clock, User, Package } from 'lucide-react';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type OsStatus =
  | 'novo'
  | 'ag_arquivos'
  | 'planejamento'
  | 'aprovacao'
  | 'impressao'
  | 'enviado'
  | 'entregue';

interface OrdemServico {
  id: string;
  dentist_id: string | null;
  patient_id: string | null;
  specialty: string | null;
  service_name: string | null;
  service_type: string | null;
  total: number | null;
  discount: number | null;
  freight_value: number | null;
  responsavel: string | null;
  payment_method: string | null;
  payment_status: string | null;
  os_status: OsStatus;
  observacoes: string | null;
  created_at: string;
  // join
  dentista?: { nome: string | null; email: string | null } | null;
}

// ─── Configuração das colunas ─────────────────────────────────────────────────

const COLUNAS: { key: OsStatus; label: string; cor: string; fundo: string }[] = [
  { key: 'novo',        label: 'Novo',          cor: '#6b7280', fundo: '#111' },
  { key: 'ag_arquivos', label: 'Ag. Arquivos',  cor: '#f59e0b', fundo: '#111' },
  { key: 'planejamento',label: 'Planejamento',  cor: '#3b82f6', fundo: '#111' },
  { key: 'aprovacao',   label: 'Aprovação',     cor: '#8b5cf6', fundo: '#111' },
  { key: 'impressao',   label: 'Impressão',     cor: '#ec4899', fundo: '#111' },
  { key: 'enviado',     label: 'Enviado',       cor: '#14b8a6', fundo: '#111' },
  { key: 'entregue',    label: 'Entregue',      cor: '#22c55e', fundo: '#111' },
];

const STATUS_PROXIMO: Partial<Record<OsStatus, OsStatus>> = {
  novo:         'ag_arquivos',
  ag_arquivos:  'planejamento',
  planejamento: 'aprovacao',
  aprovacao:    'impressao',
  impressao:    'enviado',
  enviado:      'entregue',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

function formatMoeda(v: number | null) {
  if (v == null) return '—';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function nomeCurto(os: OrdemServico) {
  return os.dentista?.nome ?? os.dentist_id?.slice(0, 8) ?? '—';
}

// ─── Componente Modal ─────────────────────────────────────────────────────────

function ModalOS({
  os,
  onClose,
  onAvancar,
  avancando,
}: {
  os: OrdemServico;
  onClose: () => void;
  onAvancar: (id: string, novoStatus: OsStatus) => Promise<void>;
  avancando: boolean;
}) {
  const proximoStatus = STATUS_PROXIMO[os.os_status];
  const col = COLUNAS.find(c => c.key === os.os_status)!;
  const proxCol = proximoStatus ? COLUNAS.find(c => c.key === proximoStatus) : null;

  const total = (os.total ?? 0) - (os.discount ?? 0) + (os.freight_value ?? 0);

  const s: Record<string, React.CSSProperties> = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '24px',
    },
    modal: {
      backgroundColor: '#111',
      border: '1px solid #222',
      borderRadius: '16px',
      width: '100%',
      maxWidth: '560px',
      maxHeight: '90vh',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 24px',
      borderBottom: '1px solid #1e1e1e',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: '99px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: col.cor + '22',
      color: col.cor,
      border: `1px solid ${col.cor}44`,
    },
    body: {
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    section: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    sectionTitle: {
      fontSize: '11px',
      fontWeight: '600',
      color: '#4b5563',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '12px',
    },
    label: {
      fontSize: '13px',
      color: '#6b7280',
      flexShrink: 0,
    },
    value: {
      fontSize: '13px',
      color: '#e5e7eb',
      textAlign: 'right' as const,
    },
    divider: {
      height: '1px',
      backgroundColor: '#1e1e1e',
    },
    footer: {
      padding: '16px 24px',
      borderTop: '1px solid #1e1e1e',
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end',
    },
    btnSecundario: {
      padding: '9px 16px',
      borderRadius: '8px',
      border: '1px solid #2a2a2a',
      backgroundColor: 'transparent',
      color: '#9ca3af',
      fontSize: '13px',
      cursor: 'pointer',
    },
    btnAvancar: {
      padding: '9px 16px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: proxCol?.cor ?? '#22c55e',
      color: '#000',
      fontSize: '13px',
      fontWeight: '600',
      cursor: avancando ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      opacity: avancando ? 0.7 : 1,
    },
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#4b5563' }}>
              #{os.id.slice(0, 8).toUpperCase()}
            </span>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#f3f4f6' }}>
              {os.service_name ?? 'Sem nome'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={s.badge}>{col.label}</span>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={s.body}>
          {/* Dentista / Responsável */}
          <div style={s.section}>
            <span style={s.sectionTitle}>Dentista</span>
            <div style={s.row}>
              <span style={s.label}>Nome</span>
              <span style={s.value}>{os.dentista?.nome ?? '—'}</span>
            </div>
            <div style={s.row}>
              <span style={s.label}>E-mail</span>
              <span style={s.value}>{os.dentista?.email ?? '—'}</span>
            </div>
            <div style={s.row}>
              <span style={s.label}>Responsável</span>
              <span style={s.value}>{os.responsavel ?? '—'}</span>
            </div>
          </div>

          <div style={s.divider} />

          {/* Serviço */}
          <div style={s.section}>
            <span style={s.sectionTitle}>Serviço</span>
            <div style={s.row}>
              <span style={s.label}>Especialidade</span>
              <span style={s.value}>{os.specialty ?? '—'}</span>
            </div>
            <div style={s.row}>
              <span style={s.label}>Tipo</span>
              <span style={s.value}>{os.service_type ?? '—'}</span>
            </div>
            <div style={s.row}>
              <span style={s.label}>Data</span>
              <span style={s.value}>{formatData(os.created_at)}</span>
            </div>
          </div>

          <div style={s.divider} />

          {/* Financeiro */}
          <div style={s.section}>
            <span style={s.sectionTitle}>Financeiro</span>
            <div style={s.row}>
              <span style={s.label}>Valor bruto</span>
              <span style={s.value}>{formatMoeda(os.total)}</span>
            </div>
            <div style={s.row}>
              <span style={s.label}>Desconto</span>
              <span style={{ ...s.value, color: '#f87171' }}>
                {formatMoeda(os.discount ? -os.discount : null)}
              </span>
            </div>
            <div style={s.row}>
              <span style={s.label}>Frete</span>
              <span style={s.value}>{formatMoeda(os.freight_value)}</span>
            </div>
            <div style={{ ...s.row, borderTop: '1px solid #1e1e1e', paddingTop: '8px' }}>
              <span style={{ ...s.label, fontWeight: '600', color: '#e5e7eb' }}>Total</span>
              <span style={{ ...s.value, fontWeight: '700', fontSize: '15px', color: '#22c55e' }}>
                {formatMoeda(total)}
              </span>
            </div>
            <div style={s.row}>
              <span style={s.label}>Pagamento</span>
              <span style={s.value}>{os.payment_method ?? '—'}</span>
            </div>
            <div style={s.row}>
              <span style={s.label}>Status pgto</span>
              <span style={s.value}>{os.payment_status ?? '—'}</span>
            </div>
          </div>

          {os.observacoes && (
            <>
              <div style={s.divider} />
              <div style={s.section}>
                <span style={s.sectionTitle}>Observações</span>
                <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.6', margin: 0 }}>
                  {os.observacoes}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={s.footer}>
          <button style={s.btnSecundario} onClick={onClose}>
            Fechar
          </button>
          {proximoStatus && proxCol && (
            <button
              style={s.btnAvancar}
              onClick={() => onAvancar(os.id, proximoStatus)}
              disabled={avancando}
            >
              {avancando ? (
                <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <ChevronRight size={14} />
              )}
              Mover para {proxCol.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Card da OS ───────────────────────────────────────────────────────────────

function CardOS({ os, onClick }: { os: OrdemServico; onClick: () => void }) {
  const s: Record<string, React.CSSProperties> = {
    card: {
      backgroundColor: '#161616',
      border: '1px solid #222',
      borderRadius: '10px',
      padding: '12px',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      transition: 'border-color 0.15s, background 0.15s',
    },
    nome: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#f3f4f6',
      lineHeight: '1.3',
    },
    meta: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '11px',
      color: '#6b7280',
    },
    total: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#22c55e',
      marginTop: '2px',
    },
  };

  const total = (os.total ?? 0) - (os.discount ?? 0) + (os.freight_value ?? 0);

  return (
    <div
      style={s.card}
      onClick={onClick}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#333';
        (e.currentTarget as HTMLDivElement).style.backgroundColor = '#1a1a1a';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#222';
        (e.currentTarget as HTMLDivElement).style.backgroundColor = '#161616';
      }}
    >
      <div style={s.nome}>{os.service_name ?? 'Sem nome'}</div>

      <div style={s.meta}>
        <User size={11} />
        {nomeCurto(os)}
      </div>

      {os.specialty && (
        <div style={s.meta}>
          <Package size={11} />
          {os.specialty}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={s.meta}>
          <Clock size={11} />
          {formatData(os.created_at)}
        </div>
        {os.total != null && (
          <span style={s.total}>{formatMoeda(total)}</span>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function KanbanOS() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [selecionada, setSelecionada] = useState<OrdemServico | null>(null);
  const [avancando, setAvancando] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const buscarOrdens = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          dentist_id,
          patient_id,
          specialty,
          service_name,
          service_type,
          total,
          discount,
          freight_value,
          responsavel,
          payment_method,
          payment_status,
          os_status,
          observacoes,
          created_at,
          dentista:dcad_clientes!dentist_id(nome, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrdens((data ?? []) as OrdemServico[]);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao buscar ordens');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscarOrdens();
  }, [buscarOrdens]);

  const handleAvancar = async (id: string, novoStatus: OsStatus) => {
    setAvancando(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ os_status: novoStatus })
        .eq('id', id);

      if (error) throw error;

      // Atualiza localmente sem rebuscar tudo
      setOrdens(prev =>
        prev.map(o => (o.id === id ? { ...o, os_status: novoStatus } : o))
      );
      if (selecionada?.id === id) {
        setSelecionada(prev => prev ? { ...prev, os_status: novoStatus } : prev);
      }
    } catch (e: unknown) {
      alert('Erro ao atualizar: ' + (e instanceof Error ? e.message : 'desconhecido'));
    } finally {
      setAvancando(false);
    }
  };

  const ordensPorStatus = (status: OsStatus) =>
    ordens.filter(o => o.os_status === status);

  const totalOS = ordens.length;

  // ── Estilos ──

  const s: Record<string, React.CSSProperties> = {
    page: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#0a0a0a',
      color: '#e5e7eb',
      fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
    },
    topbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      borderBottom: '1px solid #1a1a1a',
      flexShrink: 0,
    },
    title: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#f3f4f6',
    },
    subtitle: {
      fontSize: '12px',
      color: '#4b5563',
      marginTop: '2px',
    },
    refreshBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 14px',
      borderRadius: '8px',
      border: '1px solid #2a2a2a',
      backgroundColor: 'transparent',
      color: '#9ca3af',
      fontSize: '13px',
      cursor: carregando ? 'not-allowed' : 'pointer',
    },
    board: {
      display: 'flex',
      gap: '12px',
      padding: '16px 24px',
      overflowX: 'auto' as const,
      flex: 1,
      alignItems: 'flex-start',
    },
    coluna: {
      flexShrink: 0,
      width: '220px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    colunaHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 10px',
      borderRadius: '8px',
      marginBottom: '4px',
    },
    colunaLabel: {
      fontSize: '12px',
      fontWeight: '600',
    },
    colunaBadge: {
      fontSize: '11px',
      fontWeight: '700',
      minWidth: '20px',
      height: '20px',
      borderRadius: '99px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 6px',
    },
    vazio: {
      padding: '16px',
      border: '1px dashed #1e1e1e',
      borderRadius: '10px',
      textAlign: 'center' as const,
      fontSize: '12px',
      color: '#374151',
    },
    erroBox: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '200px',
      flexDirection: 'column',
      gap: '12px',
    },
  };

  return (
    <div style={s.page}>
      {/* Topbar */}
      <div style={s.topbar}>
        <div>
          <div style={s.title}>Ordens de Serviço</div>
          <div style={s.subtitle}>
            {carregando ? 'Carregando…' : `${totalOS} OS no sistema`}
          </div>
        </div>
        <button
          style={s.refreshBtn}
          onClick={buscarOrdens}
          disabled={carregando}
        >
          <RefreshCw
            size={14}
            style={carregando ? { animation: 'spin 1s linear infinite' } : {}}
          />
          Atualizar
        </button>
      </div>

      {/* Board */}
      {erro ? (
        <div style={s.erroBox}>
          <span style={{ color: '#f87171', fontSize: '14px' }}>{erro}</span>
          <button
            onClick={buscarOrdens}
            style={{ ...s.refreshBtn, color: '#f87171', borderColor: '#7f1d1d' }}
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div style={s.board}>
          {COLUNAS.map(col => {
            const lista = ordensPorStatus(col.key);
            return (
              <div key={col.key} style={s.coluna}>
                {/* Header da coluna */}
                <div
                  style={{
                    ...s.colunaHeader,
                    backgroundColor: col.cor + '15',
                    border: `1px solid ${col.cor}30`,
                  }}
                >
                  <span style={{ ...s.colunaLabel, color: col.cor }}>
                    {col.label}
                  </span>
                  <span
                    style={{
                      ...s.colunaBadge,
                      backgroundColor: col.cor + '25',
                      color: col.cor,
                    }}
                  >
                    {lista.length}
                  </span>
                </div>

                {/* Cards */}
                {lista.length === 0 ? (
                  <div style={s.vazio}>vazio</div>
                ) : (
                  lista.map(os => (
                    <CardOS
                      key={os.id}
                      os={os}
                      onClick={() => setSelecionada(os)}
                    />
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Animação spin */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Modal */}
      {selecionada && (
        <ModalOS
          os={selecionada}
          onClose={() => setSelecionada(null)}
          onAvancar={handleAvancar}
          avancando={avancando}
        />
      )}
    </div>
  );
}
