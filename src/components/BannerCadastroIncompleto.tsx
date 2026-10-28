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
      backgroundColor: '#1c2f1a',
      borderBottom: '1px solid #2d4d2a',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
    }}>
      <AlertCircle size={16} color="#4ade80" style={{ flexShrink: 0 }} />
      <span style={{ fontSize: '13px', color: '#bbf7d0', flex: 1, lineHeight: '1.4' }}>
        <strong>Complete seu cadastro</strong> para realizar compras — precisamos de mais alguns dados.
      </span>
      <a
        href="/perfil"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '5px 12px',
          backgroundColor: '#166534',
          border: '1px solid #15803d',
          borderRadius: '6px',
          color: '#bbf7d0',
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
          color: '#4b7c4b',
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
