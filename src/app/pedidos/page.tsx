'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Package, ChevronDown, ChevronUp, Clock, CheckCircle, Truck, RefreshCw, AlertCircle } from 'lucide-react';

// ── Tipos ────────────────────────────────────────────────────────────────────
type OsStatus =
  | 'novo'
  | 'ag_arquivos'
  | 'planejamento'
  | 'aprovacao'
  | 'impressao'
  | 'enviado'
  | 'entregue';

interface Pedido {
  id: string;
  service_name: string;
  specialty: string;
  service_type: string | null;
  total: number;
  discount: number;
  freight_value: number;
  payment_status: string;
  payment_method: string | null;
  os_status: OsStatus;
  observacoes: string | null;
  created_at: string;
}

// ── Configuração das etapas ──────────────────────────────────────────────────
const ETAPAS: { key: OsStatus; label: string; icone: string }[] = [
  { key: 'novo',        label: 'Recebido',     icone: '📥' },
  { key: 'ag_arquivos', label: 'Ag. Arquivos', icone: '📎' },
  { key: 'planejamento',label: 'Planejamento', icone: '🔬' },
  { key: 'aprovacao',   label: 'Aprovação',    icone: '✅' },
  { key: 'impressao',   label: 'Impressão',    icone: '🖨️' },
  { key: 'enviado',     label: 'Enviado',      icone: '📦' },
  { key: 'entregue',    label: 'Entregue',     icone: '🏁' },
];

const STATUS_IDX: Record<OsStatus, number> = {
  novo: 0,
  ag_arquivos: 1,
  planejamento: 2,
  aprovacao: 3,
  impressao: 4,
  enviado: 5,
  entregue: 6,
};

type Filtro = 'todos' | 'andamento' | 'entregues';

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtData = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

// ── Componente: Barra de Progresso ──────────────────────────────────────────
function BarraProgresso({ status }: { status: OsStatus }) {
  const atual = STATUS_IDX[status];
  const total = ETAPAS.length;

  return (
    <div style={{ width: '100%' }}>
      {/* Steps compactos — apenas ícone + label da etapa atual */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        position: 'relative',
      }}>
        {ETAPAS.map((e, i) => {
          const concluida = i < atual;
          const ativa = i === atual;
          return (
            <div
              key={e.key}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Linha conectora */}
              {i > 0 && (
                <div style={{
                  position: 'absolute',
                  left: '-50%',
                  right: '50%',
                  top: 11,
                  height: 2,
                  backgroundColor: concluida || ativa ? '#E52229' : 'var(--dcad-border)',
                  zIndex: 0,
                }} />
              )}
              {/* Bolinha */}
              <div style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                backgroundColor: concluida ? '#E52229' : ativa ? '#E52229' : 'var(--dcad-border)',
                border: ativa ? '3px solid #E52229' : concluida ? '3px solid #E52229' : '3px solid var(--dcad-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 2,
                boxShadow: ativa ? '0 0 0 3px rgba(229,34,41,0.18)' : 'none',
                flexShrink: 0,
              }}>
                {concluida && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              {/* Label abaixo — apenas na etapa ativa e na última */}
            </div>
          );
        })}
      </div>

      {/* Label da etapa atual */}
      <div style={{
        marginTop: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#E52229',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {ETAPAS[atual].icone} {ETAPAS[atual].label}
        </span>
        <span style={{ fontSize: 11, color: 'var(--dcad-text-sec)' }}>
          — etapa {atual + 1} de {total}
        </span>
      </div>
    </div>
  );
}

// ── Componente: Card de Pedido ───────────────────────────────────────────────
function CardPedido({ pedido }: { pedido: Pedido }) {
  const [aberto, setAberto] = useState(false);
  const entregue = pedido.os_status === 'entregue';
  const bruto = pedido.total;
  const desc = pedido.discount ?? 0;
  const frete = pedido.freight_value ?? 0;

  return (
    <div style={{
      backgroundColor: 'var(--dcad-card)',
      borderRadius: 12,
      border: '1px solid var(--dcad-border)',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {/* Cabeçalho do card */}
      <button
        onClick={() => setAberto(!aberto)}
        style={{
          width: '100%',
          padding: '16px 16px 14px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
        aria-expanded={aberto}
      >
        {/* Linha topo: serviço + badge entregue */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--dcad-text)',
              lineHeight: 1.3,
            }}>
              {pedido.service_name}
            </p>
            <p style={{
              margin: '3px 0 0',
              fontSize: 12,
              color: 'var(--dcad-text-sec)',
            }}>
              {pedido.specialty}{pedido.service_type ? ` · ${pedido.service_type}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {entregue && (
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 99,
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Entregue
              </span>
            )}
            {aberto ? <ChevronUp size={16} style={{ color: 'var(--dcad-text-sec)' }} /> : <ChevronDown size={16} style={{ color: 'var(--dcad-text-sec)' }} />}
          </div>
        </div>

        {/* Barra de progresso */}
        {!entregue && <BarraProgresso status={pedido.os_status} />}

        {/* Linha inferior: data + valor */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 11, color: 'var(--dcad-text-sec)' }}>
            <Clock size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
            {fmtData(pedido.created_at)}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--dcad-text)' }}>
            {fmt(bruto - desc + frete)}
          </span>
        </div>
      </button>

      {/* Detalhe expandido */}
      {aberto && (
        <div style={{
          borderTop: '1px solid var(--dcad-border)',
          padding: '14px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          {/* Todas as etapas */}
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: 'var(--dcad-text-sec)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Linha do tempo
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ETAPAS.map((e, i) => {
                const atual = STATUS_IDX[pedido.os_status];
                const concluida = i <= atual;
                const ativa = i === atual;
                return (
                  <div key={e.key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    opacity: i > atual ? 0.35 : 1,
                  }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: ativa ? 'rgba(229,34,41,0.08)' : concluida ? '#E52229' : 'var(--dcad-bg)',
                      border: ativa ? '2px solid #E52229' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: 13,
                    }}>
                      {concluida && !ativa
                        ? <CheckCircle size={14} color="#fff" />
                        : <span>{e.icone}</span>
                      }
                    </div>
                    <span style={{
                      fontSize: 13,
                      fontWeight: ativa ? 700 : 500,
                      color: ativa ? '#E52229' : concluida ? 'var(--dcad-text)' : 'var(--dcad-text-sec)',
                    }}>
                      {e.label}
                      {ativa && <span style={{ fontWeight: 400, color: 'var(--dcad-text-sec)', marginLeft: 6 }}>← atual</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Valores */}
          <div style={{
            backgroundColor: 'var(--dcad-bg)',
            borderRadius: 8,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: 'var(--dcad-text-sec)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Resumo financeiro
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--dcad-text-sec)' }}>
              <span>Subtotal</span><span>{fmt(bruto)}</span>
            </div>
            {desc > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#16A34A' }}>
                <span>Desconto</span><span>-{fmt(desc)}</span>
              </div>
            )}
            {frete > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--dcad-text-sec)' }}>
                <span>Frete</span><span>+{fmt(frete)}</span>
              </div>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--dcad-text)',
              borderTop: '1px solid var(--dcad-border)',
              paddingTop: 8,
              marginTop: 4,
            }}>
              <span>Total</span><span>{fmt(bruto - desc + frete)}</span>
            </div>
          </div>

          {/* Pagamento */}
          {pedido.payment_method && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--dcad-text-sec)' }}>
              <span>Forma de pagamento</span>
              <span style={{ fontWeight: 600, color: 'var(--dcad-text)' }}>{pedido.payment_method}</span>
            </div>
          )}

          {/* Observações */}
          {pedido.observacoes && (
            <div style={{
              backgroundColor: 'rgba(234,179,8,0.08)',
              border: '1px solid rgba(234,179,8,0.25)',
              borderRadius: 8,
              padding: '10px 12px',
            }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#B45309', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Observações</p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--dcad-text-sec)', lineHeight: 1.5 }}>{pedido.observacoes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [atualizando, setAtualizando] = useState(false);

  async function carregar() {
    try {
      setAtualizando(true);
      const sb = supabaseBrowser();
      const { data, error } = await sb
        .from('orders')
        .select('id, service_name, specialty, service_type, total, discount, freight_value, payment_status, payment_method, os_status, observacoes, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPedidos((data as Pedido[]) ?? []);
    } catch (e: unknown) {
      setErro((e as Error).message ?? 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
      setAtualizando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = pedidos.filter(p => {
    if (filtro === 'andamento') return p.os_status !== 'entregue';
    if (filtro === 'entregues') return p.os_status === 'entregue';
    return true;
  });

  const contAndamento = pedidos.filter(p => p.os_status !== 'entregue').length;
  const contEntregues = pedidos.filter(p => p.os_status === 'entregue').length;

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: 'var(--dcad-bg)',
      fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
    }}>
      {/* Header da seção — fica abaixo da ClientNav (top: 56px = altura da nav) */}
      <div style={{
        backgroundColor: 'var(--dcad-card)',
        borderBottom: '1px solid var(--dcad-border)',
        padding: '16px max(16px, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(16px, env(safe-area-inset-right, 0px))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 56,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: 'rgba(229,34,41,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Package size={18} color="#E52229" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--dcad-text)' }}>
              Meus Pedidos
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--dcad-text-sec)' }}>
              Acompanhe suas ordens de serviço
            </p>
          </div>
        </div>
        <button
          onClick={carregar}
          disabled={atualizando}
          aria-label="Atualizar pedidos"
          style={{
            background: 'none',
            border: '1px solid var(--dcad-border)',
            borderRadius: 8,
            padding: '8px 10px',
            cursor: atualizando ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: 'var(--dcad-text-sec)',
            minHeight: 44,
            minWidth: 44,
            justifyContent: 'center',
          }}
        >
          <RefreshCw size={15} style={{
            animation: atualizando ? 'spin 1s linear infinite' : 'none',
            color: '#E52229',
          }} />
        </button>
      </div>

      {/* Conteúdo */}
      <div style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: '16px max(16px, env(safe-area-inset-left, 0px)) 32px',
        paddingRight: 'max(16px, env(safe-area-inset-right, 0px))',
      }}>
        {/* Filtros */}
        {!loading && !erro && (
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 16,
            overflowX: 'auto',
            paddingBottom: 2,
          }}>
            {([
              { key: 'todos',     label: `Todos (${pedidos.length})` },
              { key: 'andamento', label: `Em andamento (${contAndamento})` },
              { key: 'entregues', label: `Entregues (${contEntregues})` },
            ] as { key: Filtro; label: string }[]).map(f => (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 99,
                  border: filtro === f.key ? '1.5px solid #E52229' : '1.5px solid var(--dcad-border)',
                  backgroundColor: filtro === f.key ? 'rgba(229,34,41,0.08)' : 'var(--dcad-card)',
                  color: filtro === f.key ? '#E52229' : 'var(--dcad-text-sec)',
                  fontSize: 13,
                  fontWeight: filtro === f.key ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  minHeight: 36,
                  flexShrink: 0,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Estado: carregando */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                backgroundColor: 'var(--dcad-card)',
                borderRadius: 12,
                border: '1px solid var(--dcad-border)',
                padding: 16,
                height: 120,
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        )}

        {/* Estado: erro */}
        {erro && (
          <div style={{
            backgroundColor: 'rgba(229,34,41,0.06)',
            border: '1px solid rgba(229,34,41,0.2)',
            borderRadius: 12,
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            textAlign: 'center',
          }}>
            <AlertCircle size={28} color="#E52229" />
            <p style={{ margin: 0, fontSize: 14, color: 'var(--dcad-text)', fontWeight: 600 }}>
              Não foi possível carregar seus pedidos
            </p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--dcad-text-sec)' }}>{erro}</p>
            <button
              onClick={carregar}
              style={{
                marginTop: 4,
                padding: '8px 20px',
                backgroundColor: '#E52229',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: 44,
              }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Estado: vazio */}
        {!loading && !erro && filtrados.length === 0 && (
          <div style={{
            backgroundColor: 'var(--dcad-card)',
            borderRadius: 12,
            border: '1px solid var(--dcad-border)',
            padding: '40px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            textAlign: 'center',
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: 'rgba(229,34,41,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Package size={26} color="#E52229" />
            </div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--dcad-text)' }}>
              {filtro === 'todos' ? 'Nenhum pedido ainda' : filtro === 'andamento' ? 'Nenhum pedido em andamento' : 'Nenhum pedido entregue'}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--dcad-text-sec)', maxWidth: 260 }}>
              {filtro === 'todos'
                ? 'Seus pedidos D-CAD aparecerão aqui após serem criados pela equipe.'
                : 'Altere o filtro para ver todos os pedidos.'}
            </p>
          </div>
        )}

        {/* Lista de pedidos */}
        {!loading && !erro && filtrados.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtrados.map(p => (
              <CardPedido key={p.id} pedido={p} />
            ))}
          </div>
        )}
      </div>

      {/* Estilos animações */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        * { box-sizing: border-box; }
        button:focus-visible {
          outline: 2px solid #E52229;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
