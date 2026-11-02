'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Users, LayoutDashboard, LogOut, ShoppingCart, Menu, X } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

const NAV_ITEMS = [
  { href: '/admin/cadastros', label: 'Cadastros',         icon: Users },
  { href: '/admin/clientes',  label: 'Clientes',          icon: LayoutDashboard },
  { href: '/admin/os',        label: 'Ordens de Serviço', icon: ShoppingCart },
];

// ── Conteúdo interno da nav (reutilizado em sidebar e drawer) ─────────────────
function NavContent({
  pathname,
  onLogout,
  onNavigate,
}: {
  pathname: string;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '4px 8px 20px',
        borderBottom: '1px solid #1a1a1a',
        marginBottom: 8,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          backgroundColor: '#E52229',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px',
          flexShrink: 0,
        }}>DC</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e5e7eb' }}>D-CAD</div>
          <div style={{ fontSize: 10, color: '#555', marginTop: -1 }}>Admin</div>
        </div>
      </div>

      {/* Links */}
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              color: active ? '#fff' : '#6b7280',
              backgroundColor: active ? '#1a1a1a' : 'transparent',
              textDecoration: 'none',
              borderLeft: active ? '2px solid #E52229' : '2px solid transparent',
              minHeight: 44,
            }}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* Sair */}
      <button
        onClick={onLogout}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 8,
          fontSize: 13, color: '#6b7280',
          cursor: 'pointer', border: 'none', background: 'none',
          width: '100%', minHeight: 44,
        }}
      >
        <LogOut size={15} />
        Sair
      </button>
    </>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerAberto, setDrawerAberto] = useState(false);

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push('/login');
  }

  const labelAtual = NAV_ITEMS.find(n => pathname.startsWith(n.href))?.label ?? 'Admin';

  return (
    <>
      {/* ── Sidebar — visível ≥768px ──────────────────────────────────────── */}
      <nav
        className="admin-sidebar"
        style={{
          width: 220, minWidth: 220,
          backgroundColor: '#0d0d0d',
          borderRight: '1px solid #1a1a1a',
          display: 'flex', flexDirection: 'column',
          padding: '20px 12px', gap: 4,
        }}
      >
        <NavContent pathname={pathname} onLogout={handleLogout} />
      </nav>

      {/* ── Top bar — visível <768px ──────────────────────────────────────── */}
      <header
        className="admin-topbar"
        style={{
          display: 'none', // sobrescrito por @media
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: 52,
          backgroundColor: '#0d0d0d',
          borderBottom: '1px solid #1a1a1a',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            backgroundColor: '#E52229',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: '#fff',
          }}>DC</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>
            {labelAtual}
          </span>
        </div>
        <button
          onClick={() => setDrawerAberto(true)}
          aria-label="Abrir menu"
          style={{
            background: 'none', border: '1px solid #1a1a1a',
            borderRadius: 8, color: '#9ca3af',
            cursor: 'pointer', padding: 8,
            minWidth: 44, minHeight: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Menu size={18} />
        </button>
      </header>

      {/* ── Drawer mobile ─────────────────────────────────────────────────── */}
      {drawerAberto && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          {/* Overlay */}
          <div
            onClick={() => setDrawerAberto(false)}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)' }}
          />
          {/* Painel */}
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            width: 260,
            backgroundColor: '#0d0d0d',
            borderRight: '1px solid #1a1a1a',
            display: 'flex', flexDirection: 'column',
            padding: '16px 12px',
            gap: 4,
          }}>
            {/* Botão fechar */}
            <button
              onClick={() => setDrawerAberto(false)}
              aria-label="Fechar menu"
              style={{
                alignSelf: 'flex-end',
                background: 'none', border: 'none',
                color: '#6b7280', cursor: 'pointer',
                padding: 6, minWidth: 44, minHeight: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
            <NavContent
              pathname={pathname}
              onLogout={handleLogout}
              onNavigate={() => setDrawerAberto(false)}
            />
          </div>
        </div>
      )}

      {/* Estilos responsivos */}
      <style>{`
        @media (max-width: 767px) {
          .admin-sidebar { display: none !important; }
          .admin-topbar  { display: flex !important; }
        }
        @media (min-width: 768px) {
          .admin-sidebar { display: flex !important; }
          .admin-topbar  { display: none !important; }
        }
      `}</style>
    </>
  );
}
