'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, LayoutDashboard, LogOut, ShoppingCart } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

const NAV_ITEMS = [
  { href: '/admin/cadastros', label: 'Cadastros', icon: Users },
  { href: '/admin/clientes', label: 'Clientes', icon: LayoutDashboard },
  { href: '/admin/os', label: 'Ordens de Serviço', icon: ShoppingCart },
  // Sprint 1 — adicionar quando existirem:
  // { href: '/admin/catalogo', label: 'Catálogo', icon: Package },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push('/login');
  }

  const s: Record<string, React.CSSProperties> = {
    nav: {
      width: '220px',
      minWidth: '220px',
      backgroundColor: '#0d0d0d',
      borderRight: '1px solid #1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 12px',
      gap: '4px',
    },
    logoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '4px 8px 20px',
      borderBottom: '1px solid #1a1a1a',
      marginBottom: '8px',
    },
    logoBadge: {
      width: '28px',
      height: '28px',
      borderRadius: '7px',
      backgroundColor: '#E52229',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: '800',
      color: '#fff',
      letterSpacing: '-0.5px',
      flexShrink: 0,
    },
    logoText: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#e5e7eb',
    },
    logoSub: {
      fontSize: '10px',
      color: '#555',
      marginTop: '-1px',
    },
    spacer: {
      flex: 1,
    },
    logoutBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '9px 12px',
      borderRadius: '8px',
      fontSize: '13px',
      color: '#6b7280',
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      width: '100%',
      transition: 'background 0.15s, color 0.15s',
    },
  };

  return (
    <nav style={s.nav}>
      <div style={s.logoRow}>
        <div style={s.logoBadge}>DC</div>
        <div>
          <div style={s.logoText}>D-CAD</div>
          <div style={s.logoSub}>Admin</div>
        </div>
      </div>

      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: active ? '600' : '400',
              color: active ? '#fff' : '#6b7280',
              backgroundColor: active ? '#1a1a1a' : 'transparent',
              textDecoration: 'none',
              transition: 'background 0.15s, color 0.15s',
              borderLeft: active ? '2px solid #E52229' : '2px solid transparent',
            }}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}

      <div style={s.spacer} />

      <button style={s.logoutBtn} onClick={handleLogout}>
        <LogOut size={15} />
        Sair
      </button>
    </nav>
  );
}
