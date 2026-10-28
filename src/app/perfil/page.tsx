'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Phone, MapPin, Building2, Award, ChevronRight,
  CheckCircle, AlertCircle, Loader2, ArrowLeft
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface Endereco {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

interface FormData {
  nome: string;
  telefone: string;
  cro: string;
  nome_clinica: string;
  // Endereço principal
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  // Entrega
  entregaIgualPrincipal: boolean;
  entrega_rua: string;
  entrega_numero: string;
  entrega_complemento: string;
  entrega_bairro: string;
  entrega_cidade: string;
  entrega_estado: string;
  entrega_cep: string;
}

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO',
  'MA','MT','MS','MG','PA','PB','PR','PE','PI',
  'RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

function formatarTelefone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

function formatarCep(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0,5)}-${d.slice(5)}`;
}

export const dynamic = 'force-dynamic';

export default function PerfilPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    nome: '',
    telefone: '',
    cro: '',
    nome_clinica: '',
    rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '',
    entregaIgualPrincipal: true,
    entrega_rua: '', entrega_numero: '', entrega_complemento: '',
    entrega_bairro: '', entrega_cidade: '', entrega_estado: '', entrega_cep: '',
  });

  useEffect(() => {
    async function carregarPerfil() {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      const { data: cliente } = await sb
        .from('dcad_clientes')
        .select('*')
        .eq('id', user.id)
        .single();

      if (cliente) {
        const end = (cliente.endereco as Endereco | null) || {} as Endereco;
        const endEntrega = (cliente.endereco_entrega as Endereco | null) || {} as Endereco;
        const temEntregaDiferente = !!cliente.endereco_entrega;

        setForm(f => ({
          ...f,
          nome: cliente.nome || '',
          telefone: cliente.telefone ? formatarTelefone(cliente.telefone) : '',
          cro: cliente.cro || '',
          nome_clinica: cliente.nome_clinica || '',
          rua: end.rua || '',
          numero: end.numero || '',
          complemento: end.complemento || '',
          bairro: end.bairro || '',
          cidade: end.cidade || '',
          estado: end.estado || '',
          cep: end.cep ? formatarCep(end.cep) : '',
          entregaIgualPrincipal: !temEntregaDiferente,
          entrega_rua: endEntrega.rua || '',
          entrega_numero: endEntrega.numero || '',
          entrega_complemento: endEntrega.complemento || '',
          entrega_bairro: endEntrega.bairro || '',
          entrega_cidade: endEntrega.cidade || '',
          entrega_estado: endEntrega.estado || '',
          entrega_cep: endEntrega.cep ? formatarCep(endEntrega.cep) : '',
        }));
      }
      setCarregando(false);
    }
    carregarPerfil();
  }, [router]);

  function set(field: keyof FormData, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    // Validações mínimas
    if (!form.cro.trim()) return setErro('Informe o número do CRO.');
    if (!form.nome_clinica.trim()) return setErro('Informe o nome da clínica ou consultório.');
    if (!form.cep.trim() || !form.rua.trim() || !form.cidade.trim() || !form.estado) {
      return setErro('Preencha o endereço completo (CEP, rua, cidade e estado).');
    }

    setSalvando(true);
    try {
      const sb = supabaseBrowser();

      const enderecoPrincipal: Endereco = {
        rua: form.rua.trim(),
        numero: form.numero.trim(),
        complemento: form.complemento.trim() || undefined,
        bairro: form.bairro.trim(),
        cidade: form.cidade.trim(),
        estado: form.estado,
        cep: form.cep.replace(/\D/g, ''),
      };

      const enderecoEntrega: Endereco | null = form.entregaIgualPrincipal
        ? null
        : {
            rua: form.entrega_rua.trim(),
            numero: form.entrega_numero.trim(),
            complemento: form.entrega_complemento.trim() || undefined,
            bairro: form.entrega_bairro.trim(),
            cidade: form.entrega_cidade.trim(),
            estado: form.entrega_estado,
            cep: form.entrega_cep.replace(/\D/g, ''),
          };

      const update: Record<string, unknown> = {
        nome: form.nome.trim(),
        telefone: form.telefone.replace(/\D/g, ''),
        cro: form.cro.trim().toUpperCase(),
        nome_clinica: form.nome_clinica.trim(),
        endereco: enderecoPrincipal,
        cadastro_completo: true,
      };

      if (enderecoEntrega) {
        update.endereco_entrega = enderecoEntrega;
      } else {
        update.endereco_entrega = null;
      }

      const { error: errUpdate } = await sb
        .from('dcad_clientes')
        .update(update)
        .eq('id', userId!);

      if (errUpdate) throw errUpdate;

      setSucesso(true);
      setTimeout(() => router.push('/'), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErro('Erro ao salvar: ' + msg);
    } finally {
      setSalvando(false);
    }
  }

  // ─── Estilos ───────────────────────────────────────────────────────────────
  const s: Record<string, React.CSSProperties> = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#e5e7eb',
      fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
    },
    topbar: {
      borderBottom: '1px solid #1a1a1a',
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: '#0d0d0d',
    },
    logo: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#fff',
      letterSpacing: '-0.3px',
    },
    dot: { color: '#22c55e' },
    container: {
      maxWidth: '640px',
      margin: '0 auto',
      padding: '32px 20px 60px',
    },
    heading: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#fff',
      margin: '0 0 6px 0',
    },
    subheading: {
      fontSize: '14px',
      color: '#6b7280',
      margin: '0 0 32px 0',
    },
    section: {
      backgroundColor: '#111',
      border: '1px solid #1e1e1e',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
    },
    sectionTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
      fontWeight: '600',
      color: '#9ca3af',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
      marginBottom: '16px',
    },
    grid2: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
    },
    group: { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
    label: { fontSize: '12px', fontWeight: '500', color: '#9ca3af' },
    input: {
      backgroundColor: '#161616',
      border: '1px solid #252525',
      borderRadius: '8px',
      color: '#e5e7eb',
      fontSize: '14px',
      padding: '10px 12px',
      outline: 'none',
      transition: 'border-color 0.15s',
      width: '100%',
      boxSizing: 'border-box' as const,
    },
    select: {
      backgroundColor: '#161616',
      border: '1px solid #252525',
      borderRadius: '8px',
      color: '#e5e7eb',
      fontSize: '14px',
      padding: '10px 12px',
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box' as const,
      cursor: 'pointer',
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 14px',
      backgroundColor: '#161616',
      border: '1px solid #252525',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      color: '#9ca3af',
    },
    btn: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#16a34a',
      border: 'none',
      borderRadius: '10px',
      color: '#fff',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'background 0.15s',
      marginTop: '8px',
    },
    erroBox: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      padding: '12px 14px',
      backgroundColor: '#1f0909',
      border: '1px solid #3b1212',
      borderRadius: '8px',
      color: '#f87171',
      fontSize: '13px',
      marginBottom: '16px',
    },
    sucessoBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '16px',
      backgroundColor: '#052e16',
      border: '1px solid #166534',
      borderRadius: '10px',
      color: '#4ade80',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '16px',
    },
    required: { color: '#ef4444', marginLeft: '2px' },
  };

  if (carregando) {
    return (
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={24} color="#22c55e" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#4ade80', fontSize: '18px', fontWeight: '600' }}>Cadastro completo!</p>
          <p style={{ color: '#6b7280', fontSize: '13px' }}>Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      {/* Topbar */}
      <div style={s.topbar}>
        <button
          onClick={() => router.push('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', padding: '2px' }}
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <span style={s.logo}>D<span style={s.dot}>-</span>CAD</span>
        <span style={{ fontSize: '13px', color: '#4b5563', marginLeft: '4px' }}>/ Completar cadastro</span>
      </div>

      <div style={s.container}>
        <h1 style={s.heading}>Complete seu cadastro</h1>
        <p style={s.subheading}>
          Precisamos de mais algumas informações para liberar seus pedidos.
        </p>

        {erro && (
          <div style={s.erroBox}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
            {erro}
          </div>
        )}

        <form onSubmit={salvar}>

          {/* ── Dados pessoais ── */}
          <div style={s.section}>
            <div style={s.sectionTitle}>
              <User size={14} /> Dados pessoais
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={s.group}>
                <label style={s.label}>Nome completo<span style={s.required}>*</span></label>
                <input
                  style={s.input}
                  value={form.nome}
                  onChange={e => set('nome', e.target.value)}
                  placeholder="Dr. João Silva"
                  required
                />
              </div>
              <div style={s.grid2}>
                <div style={s.group}>
                  <label style={s.label}>WhatsApp<span style={s.required}>*</span></label>
                  <input
                    style={s.input}
                    value={form.telefone}
                    onChange={e => set('telefone', formatarTelefone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    inputMode="tel"
                    required
                  />
                </div>
                <div style={s.group}>
                  <label style={s.label}>CRO<span style={s.required}>*</span></label>
                  <input
                    style={s.input}
                    value={form.cro}
                    onChange={e => set('cro', e.target.value)}
                    placeholder="SP-123456"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Dados da clínica ── */}
          <div style={s.section}>
            <div style={s.sectionTitle}>
              <Building2 size={14} /> Clínica / Consultório
            </div>
            <div style={s.group}>
              <label style={s.label}>Nome da clínica ou consultório<span style={s.required}>*</span></label>
              <input
                style={s.input}
                value={form.nome_clinica}
                onChange={e => set('nome_clinica', e.target.value)}
                placeholder="Clínica Odontológica Silva"
                required
              />
            </div>
          </div>

          {/* ── Endereço principal ── */}
          <div style={s.section}>
            <div style={s.sectionTitle}>
              <MapPin size={14} /> Endereço principal
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={s.grid2}>
                <div style={s.group}>
                  <label style={s.label}>CEP<span style={s.required}>*</span></label>
                  <input
                    style={s.input}
                    value={form.cep}
                    onChange={e => set('cep', formatarCep(e.target.value))}
                    placeholder="00000-000"
                    inputMode="numeric"
                    required
                  />
                </div>
                <div style={s.group}>
                  <label style={s.label}>Estado<span style={s.required}>*</span></label>
                  <select
                    style={s.select}
                    value={form.estado}
                    onChange={e => set('estado', e.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    {ESTADOS_BR.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={s.group}>
                <label style={s.label}>Rua / Avenida<span style={s.required}>*</span></label>
                <input
                  style={s.input}
                  value={form.rua}
                  onChange={e => set('rua', e.target.value)}
                  placeholder="Rua das Flores"
                  required
                />
              </div>
              <div style={s.grid2}>
                <div style={s.group}>
                  <label style={s.label}>Número<span style={s.required}>*</span></label>
                  <input
                    style={s.input}
                    value={form.numero}
                    onChange={e => set('numero', e.target.value)}
                    placeholder="123"
                    required
                  />
                </div>
                <div style={s.group}>
                  <label style={s.label}>Complemento</label>
                  <input
                    style={s.input}
                    value={form.complemento}
                    onChange={e => set('complemento', e.target.value)}
                    placeholder="Sala 5, Andar 2"
                  />
                </div>
              </div>
              <div style={s.grid2}>
                <div style={s.group}>
                  <label style={s.label}>Bairro<span style={s.required}>*</span></label>
                  <input
                    style={s.input}
                    value={form.bairro}
                    onChange={e => set('bairro', e.target.value)}
                    placeholder="Centro"
                    required
                  />
                </div>
                <div style={s.group}>
                  <label style={s.label}>Cidade<span style={s.required}>*</span></label>
                  <input
                    style={s.input}
                    value={form.cidade}
                    onChange={e => set('cidade', e.target.value)}
                    placeholder="São Paulo"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Endereço de entrega ── */}
          <div style={s.section}>
            <div style={s.sectionTitle}>
              <Award size={14} /> Endereço de entrega
            </div>

            <label style={s.checkbox}>
              <input
                type="checkbox"
                checked={form.entregaIgualPrincipal}
                onChange={e => set('entregaIgualPrincipal', e.target.checked)}
                style={{ accentColor: '#22c55e', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Igual ao endereço principal
            </label>

            {!form.entregaIgualPrincipal && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <div style={s.grid2}>
                  <div style={s.group}>
                    <label style={s.label}>CEP<span style={s.required}>*</span></label>
                    <input
                      style={s.input}
                      value={form.entrega_cep}
                      onChange={e => set('entrega_cep', formatarCep(e.target.value))}
                      placeholder="00000-000"
                      inputMode="numeric"
                    />
                  </div>
                  <div style={s.group}>
                    <label style={s.label}>Estado<span style={s.required}>*</span></label>
                    <select style={s.select} value={form.entrega_estado} onChange={e => set('entrega_estado', e.target.value)}>
                      <option value="">Selecione</option>
                      {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                </div>
                <div style={s.group}>
                  <label style={s.label}>Rua / Avenida<span style={s.required}>*</span></label>
                  <input style={s.input} value={form.entrega_rua} onChange={e => set('entrega_rua', e.target.value)} placeholder="Rua das Flores" />
                </div>
                <div style={s.grid2}>
                  <div style={s.group}>
                    <label style={s.label}>Número<span style={s.required}>*</span></label>
                    <input style={s.input} value={form.entrega_numero} onChange={e => set('entrega_numero', e.target.value)} placeholder="123" />
                  </div>
                  <div style={s.group}>
                    <label style={s.label}>Complemento</label>
                    <input style={s.input} value={form.entrega_complemento} onChange={e => set('entrega_complemento', e.target.value)} placeholder="Sala 5" />
                  </div>
                </div>
                <div style={s.grid2}>
                  <div style={s.group}>
                    <label style={s.label}>Bairro<span style={s.required}>*</span></label>
                    <input style={s.input} value={form.entrega_bairro} onChange={e => set('entrega_bairro', e.target.value)} placeholder="Centro" />
                  </div>
                  <div style={s.group}>
                    <label style={s.label}>Cidade<span style={s.required}>*</span></label>
                    <input style={s.input} value={form.entrega_cidade} onChange={e => set('entrega_cidade', e.target.value)} placeholder="São Paulo" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botão */}
          <button type="submit" style={s.btn} disabled={salvando}>
            {salvando ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Salvar e liberar acesso
                <ChevronRight size={15} />
              </>
            )}
          </button>

        </form>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        input::placeholder { color: #4b5563; }
        input:focus, select:focus { border-color: #22c55e !important; box-shadow: 0 0 0 3px rgba(34,197,94,0.1); }
        @media (max-width: 480px) {
          .grid2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
