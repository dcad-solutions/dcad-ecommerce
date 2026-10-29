'use client';

import { useRouter } from 'next/navigation';
import { ShieldOff, ArrowLeft } from 'lucide-react';

export default function AcessoNegado() {
  const router = useRouter();

  const s: Record<string, React.CSSProperties> = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#e5e7eb',
      fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    },
    card: {
      backgroundColor: '#111',
      border: '1px solid #222',
      borderRadius: '16px',
      padding: '48px 40px',
      maxWidth: '420px',
      width: '100%',
      textAlign: 'center',
    },
    iconWrap: {
      width: '64px',
      height: '64px',
      borderRadius: '16px',
      backgroundColor: 'rgba(229,34,41,0.1)',
      border: '1px solid rgba(229,34,41,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px',
    },
    title: {
      fontSize: '20px',
      fontWeight: '700',
      marginBottom: '10px',
    },
    desc: {
      fontSize: '14px',
      color: '#6b7280',
      lineHeight: '1.6',
      marginBottom: '32px',
    },
    btn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      borderRadius: '8px',
      backgroundColor: '#1a1a1a',
      border: '1px solid #2a2a2a',
      color: '#e5e7eb',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background 0.15s',
    },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.iconWrap}>
          <ShieldOff size={28} color="#E52229" />
        </div>
        <h1 style={s.title}>Acesso restrito</h1>
        <p style={s.desc}>
          Esta área é exclusiva para a equipe D-CAD.<br />
          Se você acredita que deveria ter acesso, entre em contato com o administrador.
        </p>
        <button style={s.btn} onClick={() => router.push('/')}>
          <ArrowLeft size={15} />
          Voltar ao portal
        </button>
      </div>
    </div>
  );
}
