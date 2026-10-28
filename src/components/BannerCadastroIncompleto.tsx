'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, X, ChevronRight } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function BannerCadastroIncompleto() {
  const [mostrar, setMostrar] = useState(false);
  const [dispensado, setDispensado] = useState(false);

  useEffect(() => {
    async function verificar() {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;

      const { data: cliente } = await sb
        .from('dcad_clientes')
        .select('cadastro_completo, tipo_cliente')
        .eq('id', user.id)
        .single();

      // Exibe banner apenas para dentistas/clínicas com cadastro incompleto
      if (cliente && !cliente.cadastro_completo && cliente.tipo_cliente === 'dentista_clinica') {
        setMostrar(true);
      }
    }
    verificar();
  }, []);

  if (!mostrar || dispensado) return null;

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: '#FEF2F2',
      borderBottom: '1px solid #FECACA',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <AlertCircle size={16} color="#E52229" style={{ flexShrink: 0 }} />
      <span style={{ fontSize: '13px', color: '#1A1A1A', flex: 1, lineHeight: '1.4' }}>
        <strong>Complete seu cadastro</strong> para realizar compras — precisamos de mais alguns dados.
      </span>
      <a
        href="/perfil"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '5px 12px',
          backgroundColor: '#E52229',
          border: '1px solid #C41920',
          borderRadius: '6px',
          color: '#fff',
          fontSize: '12px',
          fontWeight: '600',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Completar agora <ChevronRight size={12} />
      </a>
      <button
        onClick={() => setDispensado(true)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#999',
          padding: '2px',
          display: 'flex',
          flexShrink: 0,
        }}
        aria-label="Fechar aviso"
      >
        <X size={14} />
      </button>
    </div>
  );
}
