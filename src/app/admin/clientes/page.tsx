'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search, CheckCircle, XCircle, Clock, RefreshCw,
  Building2, Stethoscope, GraduationCap, ChevronDown,
  ChevronUp, MapPin, Phone, User, FileText, X,
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type TipoCliente = 'dentista_clinica' | 'radiologia' | 'cursos' | 'todos';
type StatusFiltro = 'todos' | 'ativo' | 'pendente' | 'bloqueado';

interface Endereco {
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  celular?: string;
  tem_whatsapp?: boolean;
  aceita_whatsapp?: boolean;
  aceita_whatsapp_em?: string;
  tipo_cliente: 'dentista_clinica' | 'radiologia' | 'cursos';
  tipo_pessoa?: 'fisica' | 'juridica';
  nome_clinica?: string;
  razao_social?: string;
  cpf?: string;
  cnpj?: string;
  cro?: string;
  cro_estado?: string;
  especialidade?: string;
  avatar_url?: string;
  endereco?: Endereco | null;
  endereco_entrega?: Endereco | null;
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

/* ── Avatar ─────────────────────────────────────────────── */
function Avatar({ cliente, size = 40 }: { cliente: Cliente; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const initials = (cliente.nome || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  if (cliente.avatar_url && !imgError) {
    return (
      <img
        src={cliente.avatar_url}
        alt={cliente.nome}
        onError={() => setImgError(true)}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover', border: '2px solid #252525', flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg,#E52229,#8b1218)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: '700', color: '#fff',
      flexShrink: 0, border: '2px solid #252525',
    }}>
      {initials}
    </div>
  );
}

/* ── Status badge ───────────────────────────────────────── */
function StatusBadge({ cliente }: { cliente: Cliente }) {
  if (cliente.ativo) return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 8px', backgroundColor:'#052e16', border:'1px solid #166534', borderRadius:20, fontSize:11, fontWeight:600, color:'#4ade80' }}>
      <CheckCircle size={10} /> Ativo
    </span>
  );
  if (!cliente.ativo && cliente.tipo_cliente !== 'dentista_clinica') return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 8px', backgroundColor:'#1c1008', border:'1px solid #92400e', borderRadius:20, fontSize:11, fontWeight:600, color:'#fbbf24' }}>
      <Clock size={10} /> Aguardando aprovação
    </span>
  );
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 8px', backgroundColor:'#1f0909', border:'1px solid #3b1212', borderRadius:20, fontSize:11, fontWeight:600, color:'#f87171' }}>
      <XCircle size={10} /> Bloqueado
    </span>
  );
}

/* ── Endereço formatado ─────────────────────────────────── */
function EnderecoTexto({ end, label }: { end?: Endereco | null; label: string }) {
  if (!end || (!end.rua && !end.cidade)) {
    return <span style={{ color:'#4b5563', fontStyle:'italic' }}>Não informado</span>;
  }
  const partes = [
    end.rua, end.numero, end.complemento, end.bairro,
    [end.cidade, end.estado].filter(Boolean).join(' - '),
    end.cep,
  ].filter(Boolean);
  return (
    <span>
      <span style={{ color:'#9ca3af', fontWeight:500 }}>{label}: </span>
      <span style={{ color:'#d1d5db' }}>{partes.join(', ')}</span>
    </span>
  );
}

/* ── Modal detalhe ──────────────────────────────────────── */
function ModalDetalhe({ cliente, onClose }: { cliente: Cliente; onClose: () => void }) {
  const Row = ({ label, value }: { label: string; value?: string | null }) => {
    if (!value) return null;
    return (
      <div style={{ display:'flex', gap:8, padding:'8px 0', borderBottom:'1px solid #1a1a1a' }}>
        <span style={{ width:160, flexShrink:0, fontSize:12, color:'#6b7280', paddingTop:1 }}>{label}</span>
        <span style={{ fontSize:13, color:'#e5e7eb', flex:1 }}>{value}</span>
      </div>
    );
  };
  const fmtEnd = (e?: Endereco | null) => {
    if (!e || !e.rua) return null;
    return [e.rua, e.numero, e.complemento, e.bairro, [e.cidade,e.estado].filter(Boolean).join(' - '), e.cep].filter(Boolean).join(', ');
  };

  return (
    <div
      style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.75)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor:'#111', border:'1px solid #252525', borderRadius:16, width:'100%', maxWidth:600, maxHeight:'90vh', overflowY:'auto', padding:24 }}>
        {/* Cabeçalho */}
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
          <Avatar cliente={cliente} size={64} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:18, fontWeight:700, color:'#fff' }}>{cliente.nome}</div>
            <div style={{ fontSize:13, color:'#6b7280', marginTop:2 }}>{cliente.email}</div>
            <div style={{ marginTop:8, display:'flex', gap:8, flexWrap:'wrap' }}>
              <StatusBadge cliente={cliente} />
              <span style={{ fontSize:11, color:'#4b5563' }}>{TIPO_LABEL[cliente.tipo_cliente]}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#6b7280', cursor:'pointer', padding:4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Dados pessoais */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#E52229', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Dados Pessoais</div>
          <Row label="Tipo de pessoa" value={cliente.tipo_pessoa === 'juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'} />
          <Row label="CPF" value={cliente.cpf} />
          <Row label="CNPJ" value={cliente.cnpj} />
          <Row label="Razão Social" value={cliente.razao_social} />
          <Row label="Nome da Clínica" value={cliente.nome_clinica} />
          <Row label="CRO" value={cliente.cro ? `${cliente.cro}${cliente.cro_estado ? ' - ' + cliente.cro_estado : ''}` : null} />
          <Row label="Especialidade" value={cliente.especialidade} />
          <Row label="Celular" value={cliente.celular} />
          <Row label="Telefone" value={cliente.telefone} />
          <Row label="WhatsApp" value={cliente.tem_whatsapp ? (cliente.aceita_whatsapp ? 'Autorizado' : 'Possui (sem autorização)') : 'Não informado'} />
        </div>

        {/* Endereços */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#E52229', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Endereços</div>
          <div style={{ padding:'10px 0', borderBottom:'1px solid #1a1a1a' }}>
            <div style={{ fontSize:12, color:'#6b7280', marginBottom:4 }}>Faturamento</div>
            <div style={{ fontSize:13, color: fmtEnd(cliente.endereco) ? '#d1d5db' : '#4b5563', fontStyle: fmtEnd(cliente.endereco) ? 'normal' : 'italic' }}>
              {fmtEnd(cliente.endereco) || 'Não informado'}
            </div>
          </div>
          <div style={{ padding:'10px 0' }}>
            <div style={{ fontSize:12, color:'#6b7280', marginBottom:4 }}>Entrega</div>
            <div style={{ fontSize:13, color: fmtEnd(cliente.endereco_entrega) ? '#d1d5db' : '#4b5563', fontStyle: fmtEnd(cliente.endereco_entrega) ? 'normal' : 'italic' }}>
              {fmtEnd(cliente.endereco_entrega) || 'Não informado'}
            </div>
          </div>
        </div>

        {/* Meta */}
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:'#E52229', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Informações do Sistema</div>
          <Row label="Cadastrado em" value={new Date(cliente.criado_em).toLocaleString('pt-BR')} />
          <Row label="Cadastro completo" value={cliente.cadastro_completo ? 'Sim' : 'Não'} />
          {cliente.aprovado_em && <Row label="Liberado em" value={new Date(cliente.aprovado_em).toLocaleString('pt-BR')} />}
        </div>
      </div>
    </div>
  );
}

/* ── Página principal ───────────────────────────────────── */
export const dynamic = 'force-dynamic';

export default function AdminClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoCliente>('todos');
  const [filtroStatus, setFiltroStatus] = useState<StatusFiltro>('todos');
  const [atualizando, setAtualizando] = useState<string | null>(null);
  const [admin, setAdmin] = useState<{ id: string } | null>(null);
  const [detalhe, setDetalhe] = useState<Cliente | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);

  const carregarClientes = useCallback(async () => {
    setCarregando(true);
    const sb = supabaseBrowser();
    const { data } = await sb
      .from('dcad_clientes')
      .select('*')
      .order('criado_em', { ascending: false });
    setClientes((data || []) as Cliente[]);
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
    const matchBusca = !busca ||
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.email.toLowerCase().includes(busca.toLowerCase()) ||
      (c.nome_clinica || '').toLowerCase().includes(busca.toLowerCase()) ||
      (c.cpf || '').includes(busca) ||
      (c.cnpj || '').includes(busca) ||
      (c.cro || '').includes(busca);
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
      padding: 'clamp(16px, 4vw, 24px)',
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
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#fff', margin:0 }}>Clientes</h1>
          <p style={{ fontSize:13, color:'#6b7280', margin:'4px 0 0 0' }}>
            Gerencie cadastros e liberações de acesso
          </p>
        </div>
        <button
          onClick={carregarClientes}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', backgroundColor:'#161616', border:'1px solid #252525', borderRadius:8, color:'#9ca3af', fontSize:13, cursor:'pointer' }}
        >
          <RefreshCw size={13} /> Atualizar
        </button>
      </div>

      {/* Métricas */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
        {[
          { label:'Total', valor:contadores.total, cor:'#9ca3af' },
          { label:'Ativos', valor:contadores.ativos, cor:'#4ade80' },
          { label:'Aguardando', valor:contadores.pendentes, cor:'#fbbf24' },
          { label:'Bloqueados', valor:contadores.bloqueados, cor:'#f87171' },
        ].map(m => (
          <div key={m.label} style={{ ...s.card, textAlign:'center' }}>
            <div style={{ fontSize:26, fontWeight:700, color:m.cor }}>{m.valor}</div>
            <div style={{ fontSize:12, color:'#6b7280', marginTop:2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ ...s.card, display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, minWidth:200 }}>
          <Search size={14} color="#6b7280" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, CPF, CRO..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{ ...s.input, flex:1, border:'none', backgroundColor:'transparent', padding:'4px 0' }}
          />
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <div style={{ position:'relative' }}>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value as TipoCliente)} style={s.select}>
              <option value="todos">Todos os tipos</option>
              <option value="dentista_clinica">Dentista / Clínica</option>
              <option value="radiologia">Radiologia</option>
              <option value="cursos">Cursos</option>
            </select>
            <ChevronDown size={12} color="#6b7280" style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
          </div>
          <div style={{ position:'relative' }}>
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as StatusFiltro)} style={s.select}>
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativos</option>
              <option value="pendente">Aguardando aprovação</option>
              <option value="bloqueado">Bloqueados</option>
            </select>
            <ChevronDown size={12} color="#6b7280" style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
          </div>
        </div>
      </div>

      {/* Lista */}
      <div style={{ ...s.card, padding:0, overflow:'hidden' }}>
        {carregando ? (
          <div style={{ padding:40, textAlign:'center', color:'#6b7280', fontSize:14 }}>Carregando clientes...</div>
        ) : clientesFiltrados.length === 0 ? (
          <div style={{ padding:40, textAlign:'center', color:'#6b7280', fontSize:14 }}>Nenhum cliente encontrado.</div>
        ) : (
          clientesFiltrados.map((cliente, i) => {
            const isUltimo = i === clientesFiltrados.length - 1;
            const isAtualizandoEste = atualizando === cliente.id;
            const isExp = expandido === cliente.id;
            const temEndFat = cliente.endereco && (cliente.endereco.rua || cliente.endereco.cidade);
            const temEndEnt = cliente.endereco_entrega && (cliente.endereco_entrega.rua || cliente.endereco_entrega.cidade);

            return (
              <div key={cliente.id} style={{ borderBottom: isUltimo ? 'none' : '1px solid #1a1a1a' }}>
                {/* Linha principal */}
                <div
                  className="clientes-item"
                  style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', transition:'background 0.1s', cursor:'pointer' }}
                  onClick={() => setExpandido(isExp ? null : cliente.id)}
                >
                  <Avatar cliente={cliente} size={40} />

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:14, fontWeight:500, color:'#e5e7eb' }}>{cliente.nome}</span>
                      {!cliente.cadastro_completo && cliente.tipo_cliente === 'dentista_clinica' && (
                        <span style={{ fontSize:10, color:'#6b7280', backgroundColor:'#1a1a1a', border:'1px solid #252525', borderRadius:4, padding:'1px 5px' }}>
                          Incompleto
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize:12, color:'#6b7280', marginTop:2, display:'flex', flexWrap:'wrap', gap:'0 8px' }}>
                      <span>{cliente.email}</span>
                      {(cliente.celular || cliente.telefone) && (
                        <span style={{ color:'#4b5563' }}>
                          · {cliente.celular || cliente.telefone}
                          {cliente.tem_whatsapp && (
                            <span style={{ marginLeft:4, color: cliente.aceita_whatsapp ? '#22c55e' : '#f59e0b' }}>
                              {cliente.aceita_whatsapp ? '✓ WA' : '⚠ WA'}
                            </span>
                          )}
                        </span>
                      )}
                      {cliente.cro && <span style={{ color:'#4b5563' }}>· CRO {cliente.cro}{cliente.cro_estado ? '/' + cliente.cro_estado : ''}</span>}
                      {cliente.nome_clinica && <span style={{ color:'#4b5563' }}>· {cliente.nome_clinica}</span>}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6, flexWrap:'wrap' }}>
                      <StatusBadge cliente={cliente} />
                      <span style={{ fontSize:11, color:'#4b5563' }}>{TIPO_LABEL[cliente.tipo_cliente]}</span>
                      <span style={{ fontSize:11, color:'#374151' }}>
                        Cadastrado em {new Date(cliente.criado_em).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="clientes-acoes" style={{ flexShrink:0, display:'flex', gap:8, alignItems:'center' }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setDetalhe(cliente)}
                      style={{ padding:'6px 12px', backgroundColor:'#161616', border:'1px solid #252525', borderRadius:6, color:'#9ca3af', fontSize:12, fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}
                    >
                      <User size={12} /> Ver
                    </button>
                    {cliente.ativo ? (
                      <button
                        onClick={() => alterarStatus(cliente.id, false)}
                        disabled={!!isAtualizandoEste}
                        style={{ padding:'6px 12px', backgroundColor:'#1f0909', border:'1px solid #3b1212', borderRadius:6, color:'#f87171', fontSize:12, fontWeight:500, cursor: isAtualizandoEste ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:5 }}
                      >
                        <XCircle size={12} />
                        {isAtualizandoEste ? '...' : 'Bloquear'}
                      </button>
                    ) : (
                      <button
                        onClick={() => alterarStatus(cliente.id, true)}
                        disabled={!!isAtualizandoEste}
                        style={{ padding:'6px 12px', backgroundColor:'#052e16', border:'1px solid #166534', borderRadius:6, color:'#4ade80', fontSize:12, fontWeight:600, cursor: isAtualizandoEste ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:5 }}
                      >
                        <CheckCircle size={12} />
                        {isAtualizandoEste ? '...' : 'Liberar'}
                      </button>
                    )}
                    <span style={{ color:'#374151', cursor:'pointer' }}>
                      {isExp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </div>
                </div>

                {/* Linha expandida — endereços */}
                {isExp && (
                  <div style={{ padding:'0 20px 16px 74px', display:'flex', flexWrap:'wrap', gap:16, backgroundColor:'#0d0d0d' }}>
                    {/* Faturamento */}
                    <div style={{ flex:'1 1 220px', minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                        <MapPin size={12} color="#E52229" />
                        <span style={{ fontSize:11, fontWeight:600, color:'#E52229', textTransform:'uppercase', letterSpacing:'0.06em' }}>Faturamento</span>
                      </div>
                      <div style={{ fontSize:12, color: temEndFat ? '#d1d5db' : '#4b5563', fontStyle: temEndFat ? 'normal' : 'italic', lineHeight:1.5 }}>
                        {temEndFat ? (
                          <>
                            {cliente.endereco!.rua}{cliente.endereco!.numero ? ', ' + cliente.endereco!.numero : ''}
                            {cliente.endereco!.complemento && <><br />{cliente.endereco!.complemento}</>}
                            <br />{[cliente.endereco!.bairro, cliente.endereco!.cidade, cliente.endereco!.estado].filter(Boolean).join(', ')}
                            {cliente.endereco!.cep && <><br />CEP {cliente.endereco!.cep}</>}
                          </>
                        ) : 'Não informado'}
                      </div>
                    </div>
                    {/* Entrega */}
                    <div style={{ flex:'1 1 220px', minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                        <MapPin size={12} color="#6b7280" />
                        <span style={{ fontSize:11, fontWeight:600, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.06em' }}>Entrega</span>
                      </div>
                      <div style={{ fontSize:12, color: temEndEnt ? '#d1d5db' : '#4b5563', fontStyle: temEndEnt ? 'normal' : 'italic', lineHeight:1.5 }}>
                        {temEndEnt ? (
                          <>
                            {cliente.endereco_entrega!.rua}{cliente.endereco_entrega!.numero ? ', ' + cliente.endereco_entrega!.numero : ''}
                            {cliente.endereco_entrega!.complemento && <><br />{cliente.endereco_entrega!.complemento}</>}
                            <br />{[cliente.endereco_entrega!.bairro, cliente.endereco_entrega!.cidade, cliente.endereco_entrega!.estado].filter(Boolean).join(', ')}
                            {cliente.endereco_entrega!.cep && <><br />CEP {cliente.endereco_entrega!.cep}</>}
                          </>
                        ) : 'Não informado'}
                      </div>
                    </div>
                    {/* Documento */}
                    {(cliente.cpf || cliente.cnpj || cliente.cro) && (
                      <div style={{ flex:'1 1 180px', minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                          <FileText size={12} color="#6b7280" />
                          <span style={{ fontSize:11, fontWeight:600, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.06em' }}>Documentos</span>
                        </div>
                        <div style={{ fontSize:12, color:'#d1d5db', lineHeight:1.8 }}>
                          {cliente.cpf && <div><span style={{ color:'#6b7280' }}>CPF: </span>{cliente.cpf}</div>}
                          {cliente.cnpj && <div><span style={{ color:'#6b7280' }}>CNPJ: </span>{cliente.cnpj}</div>}
                          {cliente.cro && <div><span style={{ color:'#6b7280' }}>CRO: </span>{cliente.cro}{cliente.cro_estado ? '/' + cliente.cro_estado : ''}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {!carregando && clientesFiltrados.length > 0 && (
        <p style={{ textAlign:'center', marginTop:16, fontSize:12, color:'#374151' }}>
          {clientesFiltrados.length} de {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Modal detalhe */}
      {detalhe && <ModalDetalhe cliente={detalhe} onClose={() => setDetalhe(null)} />}

      <style>{`
        .clientes-item:hover { background: #141414 !important; }
        @media (max-width: 640px) {
          .clientes-item { flex-wrap: wrap !important; }
          .clientes-acoes { width: 100%; padding-left: 54px; }
          .clientes-acoes button { flex: 1; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
