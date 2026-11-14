'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Phone, MapPin, Building2, Award,
  CheckCircle, AlertCircle, Loader2,
  RefreshCw, MessageCircle
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import ConsentimentoWhatsapp from '@/components/ConsentimentoWhatsapp';

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
  celular: string;
  tem_whatsapp: boolean;
  cro: string;
  nome_clinica: string;
  cpf: string;
  onde_conheceu: string;
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

function formatarCpf(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

export const dynamic = 'force-dynamic';

export default function PerfilPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [cadastroCompleto, setCadastroCompleto] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [buscandoCepEntrega, setBuscandoCepEntrega] = useState(false);

  const [form, setForm] = useState<FormData>({
    nome: '',
    celular: '',
    tem_whatsapp: false,
    cro: '',
    nome_clinica: '',
    cpf: '',
    onde_conheceu: '',
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

        setCadastroCompleto(!!cliente.cadastro_completo);
        setForm(f => ({
          ...f,
          nome: cliente.nome || '',
          // Suporte a campo legado 'telefone' e novo 'celular'
          celular: cliente.celular
            ? formatarTelefone(cliente.celular)
            : (cliente.telefone ? formatarTelefone(cliente.telefone) : ''),
          tem_whatsapp: cliente.tem_whatsapp ?? false,
          cro: cliente.cro || '',
          nome_clinica: cliente.nome_clinica || '',
          cpf: cliente.cpf ? formatarCpf(cliente.cpf) : '',
          onde_conheceu: cliente.onde_conheceu || '',
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

  const buscarCep = useCallback(async (cep: string, isEntrega = false) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    isEntrega ? setBuscandoCepEntrega(true) : setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        if (isEntrega) {
          setForm(f => ({
            ...f,
            entrega_rua: data.logradouro || f.entrega_rua,
            entrega_bairro: data.bairro || f.entrega_bairro,
            entrega_cidade: data.localidade || f.entrega_cidade,
            entrega_estado: data.uf || f.entrega_estado,
          }));
        } else {
          setForm(f => ({
            ...f,
            rua: data.logradouro || f.rua,
            bairro: data.bairro || f.bairro,
            cidade: data.localidade || f.cidade,
            estado: data.uf || f.estado,
          }));
        }
      }
    } catch { /* ignora erros de rede */ }
    isEntrega ? setBuscandoCepEntrega(false) : setBuscandoCep(false);
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setSucesso(false);

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
        celular: form.celular.replace(/\D/g, '') || null,
        tem_whatsapp: form.tem_whatsapp,
        // Mantém campo legado em sync
        telefone: form.celular.replace(/\D/g, '') || null,
        cro: form.cro.trim().toUpperCase(),
        nome_clinica: form.nome_clinica.trim(),
        cpf: form.cpf.trim() ? form.cpf.replace(/\D/g, '') : null,
        onde_conheceu: form.onde_conheceu.trim() || null,
        endereco: enderecoPrincipal,
        endereco_entrega: enderecoEntrega,
        cadastro_completo: true,
      };

      const { error: errUpdate } = await sb
        .from('dcad_clientes')
        .update(update)
        .eq('id', userId!);

      if (errUpdate) throw errUpdate;

      setSucesso(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Se era o primeiro cadastro, redireciona para home após 2s
      if (!cadastroCompleto) {
        setTimeout(() => router.push('/'), 2000);
      }
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
      minHeight: '100dvh',
      backgroundColor: 'var(--dcad-bg)',
      color: 'var(--dcad-text)',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    },
    container: {
      maxWidth: '640px',
      margin: '0 auto',
      paddingTop: '32px',
      paddingBottom: '60px',
      paddingLeft: 'max(20px, env(safe-area-inset-left, 0px))',
      paddingRight: 'max(20px, env(safe-area-inset-right, 0px))',
    },
    heading: {
      fontSize: '22px',
      fontWeight: '700',
      color: 'var(--dcad-text)',
      margin: '0 0 6px 0',
    },
    subheading: {
      fontSize: '14px',
      color: 'var(--dcad-text-sec)',
      margin: '0 0 32px 0',
    },
    section: {
      backgroundColor: 'var(--dcad-card)',
      border: '1px solid var(--dcad-border)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    },
    sectionTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '12px',
      fontWeight: '700',
      color: 'var(--dcad-accent)',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      marginBottom: '16px',
    },
    group: { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
    label: { fontSize: '12px', fontWeight: '500', color: 'var(--dcad-text-sec)' },
    input: {
      backgroundColor: 'var(--dcad-bg)',
      border: '1px solid var(--dcad-border)',
      borderRadius: '8px',
      color: 'var(--dcad-text)',
      fontSize: '14px',
      padding: '10px 12px',
      outline: 'none',
      transition: 'border-color 0.15s',
      width: '100%',
      boxSizing: 'border-box' as const,
    },
    inputWithIcon: {
      backgroundColor: 'var(--dcad-bg)',
      border: '1px solid var(--dcad-border)',
      borderRadius: '8px',
      color: 'var(--dcad-text)',
      fontSize: '14px',
      padding: '10px 36px 10px 12px',
      outline: 'none',
      transition: 'border-color 0.15s',
      width: '100%',
      boxSizing: 'border-box' as const,
    },
    select: {
      backgroundColor: 'var(--dcad-bg)',
      border: '1px solid var(--dcad-border)',
      borderRadius: '8px',
      color: 'var(--dcad-text)',
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
      backgroundColor: 'var(--dcad-bg)',
      border: '1px solid var(--dcad-border)',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      color: 'var(--dcad-text-sec)',
    },
    btn: {
      width: '100%',
      padding: '14px',
      backgroundColor: 'var(--dcad-accent)',
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
      backgroundColor: 'rgba(229,34,41,0.08)',
      border: '1px solid rgba(229,34,41,0.25)',
      borderRadius: '8px',
      color: 'var(--dcad-accent)',
      fontSize: '13px',
      marginBottom: '16px',
    },
    sucessoBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '16px',
      backgroundColor: 'rgba(34,197,94,0.1)',
      border: '1px solid rgba(34,197,94,0.3)',
      borderRadius: '10px',
      color: '#22C55E',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '16px',
    },
    required: { color: '#ef4444', marginLeft: '2px' },
    optional: { color: 'var(--dcad-text-sec)', marginLeft: '4px', fontSize: '11px', fontWeight: '400' },
    cepWrapper: { position: 'relative' as const },
    cepIcon: {
      position: 'absolute' as const,
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--dcad-text-sec)',
      pointerEvents: 'none' as const,
    },
    // Modal LGPD
    overlay: {
      position: 'fixed' as const,
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    modalBox: {
      background: 'var(--dcad-card)',
      borderRadius: '16px 16px 0 0',
      padding: '24px max(20px, env(safe-area-inset-left, 0px))',
      paddingRight: 'max(20px, env(safe-area-inset-right, 0px))',
      paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))',
      maxWidth: '480px',
      width: '100%',
      maxHeight: '80dvh',
      overflowY: 'auto' as const,
    },
    modalTitle: {
      fontSize: '16px',
      fontWeight: '700',
      color: 'var(--dcad-text)',
      marginBottom: '12px',
    },
    modalText: {
      fontSize: '13px',
      color: 'var(--dcad-text-sec)',
      lineHeight: '1.6',
      marginBottom: '20px',
    },
    modalBtn: {
      width: '100%',
      padding: '12px',
      backgroundColor: 'var(--dcad-accent)',
      border: 'none',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
    },
  };

  if (carregando) {
    return (
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={24} color="#E52229" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        <h1 style={s.heading}>
          {cadastroCompleto ? 'Meus Dados' : 'Complete seu cadastro'}
        </h1>
        <p style={s.subheading}>
          {cadastroCompleto
            ? 'Mantenha suas informações atualizadas para receber seus pedidos.'
            : 'Precisamos de mais algumas informações para liberar seus pedidos.'}
        </p>

        {sucesso && (
          <div style={s.sucessoBox}>
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            {cadastroCompleto
              ? 'Dados atualizados com sucesso!'
              : 'Cadastro completo! Redirecionando...'}
          </div>
        )}

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
              <div className="dcad-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                <div style={s.group}>
                  <label style={s.label}>CPF<span style={s.optional}>(opcional)</span></label>
                  <input
                    style={s.input}
                    value={form.cpf}
                    onChange={e => set('cpf', formatarCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Clínica ── */}
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

          {/* ── Contato ── */}
          <div style={s.section}>
            <div style={s.sectionTitle}>
              <Phone size={14} /> Contato
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={s.group}>
                <label style={s.label}>Celular<span style={s.required}>*</span></label>
                <input
                  style={s.input}
                  value={form.celular}
                  onChange={e => set('celular', formatarTelefone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  inputMode="tel"
                  required
                />
              </div>

              {/* Checkbox WhatsApp */}
              <label style={s.checkbox}>
                <input
                  type="checkbox"
                  checked={form.tem_whatsapp}
                  onChange={e => set('tem_whatsapp', e.target.checked)}
                  style={{ accentColor: '#E52229', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageCircle size={14} color="#25D366" />
                  <span>Este número tem WhatsApp</span>
                </div>
              </label>

              {/* O aceite das comunicações é separado do "tem WhatsApp" e grava na hora (com data, IP e termo) */}
              <ConsentimentoWhatsapp tema="claro" />

              <div style={s.group}>
                <label style={s.label}>Como nos conheceu<span style={s.optional}>(opcional)</span></label>
                <select
                  style={s.select}
                  value={form.onde_conheceu}
                  onChange={e => set('onde_conheceu', e.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="instagram">Instagram</option>
                  <option value="indicacao">Indicação</option>
                  <option value="google">Google</option>
                  <option value="congresso">Congresso / Evento</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Endereço principal ── */}
          <div style={s.section}>
            <div style={s.sectionTitle}>
              <MapPin size={14} /> Endereço principal
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="dcad-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={s.group}>
                  <label style={s.label}>CEP<span style={s.required}>*</span></label>
                  <div style={s.cepWrapper}>
                    <input
                      style={s.inputWithIcon}
                      value={form.cep}
                      onChange={e => {
                        const v = formatarCep(e.target.value);
                        set('cep', v);
                        buscarCep(v, false);
                      }}
                      placeholder="00000-000"
                      inputMode="numeric"
                      required
                    />
                    <span style={s.cepIcon}>
                      {buscandoCep
                        ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        : <MapPin size={14} />}
                    </span>
                  </div>
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
              <div className="dcad-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
              <div className="dcad-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                style={{ accentColor: '#E52229', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Igual ao endereço principal
            </label>

            {!form.entregaIgualPrincipal && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <div className="dcad-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={s.group}>
                    <label style={s.label}>CEP<span style={s.required}>*</span></label>
                    <div style={s.cepWrapper}>
                      <input
                        style={s.inputWithIcon}
                        value={form.entrega_cep}
                        onChange={e => {
                          const v = formatarCep(e.target.value);
                          set('entrega_cep', v);
                          buscarCep(v, true);
                        }}
                        placeholder="00000-000"
                        inputMode="numeric"
                      />
                      <span style={s.cepIcon}>
                        {buscandoCepEntrega
                          ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                          : <MapPin size={14} />}
                      </span>
                    </div>
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
                <div className="dcad-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={s.group}>
                    <label style={s.label}>Número<span style={s.required}>*</span></label>
                    <input style={s.input} value={form.entrega_numero} onChange={e => set('entrega_numero', e.target.value)} placeholder="123" />
                  </div>
                  <div style={s.group}>
                    <label style={s.label}>Complemento</label>
                    <input style={s.input} value={form.entrega_complemento} onChange={e => set('entrega_complemento', e.target.value)} placeholder="Sala 5" />
                  </div>
                </div>
                <div className="dcad-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                {cadastroCompleto ? 'Salvar alterações' : 'Salvar e liberar acesso'}
              </>
            )}
          </button>

        </form>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        input::placeholder { color: var(--dcad-border); }
        input:focus, select:focus { border-color: var(--dcad-accent) !important; box-shadow: 0 0 0 3px rgba(229,34,41,0.1); }
        @media (max-width: 480px) {
          .dcad-grid2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
