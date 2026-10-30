'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Home, Package, User, LogOut, Menu, X } from 'lucide-react';

const LOGO_SVG = (
  <svg width="72" height="20" viewBox="0 0 72 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="16" fontFamily="Geist, Inter, system-ui, sans-serif" fontWeight="800" fontSize="18" fill="#E52229">D-CAD</text>
  </svg>
);

const LINKS = [
  { href: '/',        label: 'Início',    icon: Home },
  { href: '/pedidos', label: 'Pedidos',   icon: Package },
  { href: '/perfil',  label: 'Perfil',    icon: User },
];

export default function ClientNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [nome, setNome] = useState<string | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.from('dcad_clientes').select('nome').maybeSingle().then(({ data }) => {
      if (data?.nome) setNome(data.nome.split(' ')[0]);
    });
  }, []);

  async function sair() {
    const sb = supabaseBrowser();
    await sb.auth.signOut();
    router.push('/login');
  }

  // ── Desktop nav (horizontal, topo) ───────────────────────────────────────
  return (
    <>
      {/* Desktop / tablet */}
      <nav style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #EBEBEB',
        padding: '0 max(20px, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(20px, env(safe-area-inset-right, 0px))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        position: 'sticky',
        top: 0,
        zIndex: 20,
        boxShadow: '0 1px 0 #EBEBEB',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <span style={{
            fontFamily: 'Geist, Inter, system-ui, sans-serif',
            fontWeight: 800,
            fontSize: 20,
            color: '#E52229',
            letterSpacing: '-0.01em',
          }}>D-CAD</span>
        </Link>

        {/* Links centrais — visíveis apenas ≥640px */}
        <div style={{
          display: 'flex',
          gap: 4,
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }} className="dcad-nav-links">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const ativa = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: ativa ? 700 : 500,
                  color: ativa ? '#E52229' : '#555',
                  backgroundColor: ativa ? '#FEF2F2' : 'transparent',
                  minHeight: 36,
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Lado direito: nome + sair | hamburger mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Nome + botão sair — visível ≥640px */}
          <div className="dcad-nav-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {nome && (
              <span style={{ fontSize: 13, color: '#777', fontWeight: 500 }}>
                Olá, <strong style={{ color: '#1A1A1A' }}>{nome}</strong>
              </span>
            )}
            <button
              onClick={sair}
              title="Sair"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: '1px solid #EBEBEB',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                color: '#777',
                minHeight: 36,
                minWidth: 44,
                justifyContent: 'center',
              }}
            >
              <LogOut size={14} />
              <span className="dcad-nav-sair-label">Sair</span>
            </button>
          </div>

          {/* Hamburger — visível <640px */}
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="dcad-hamburger"
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            style={{
              display: 'none', // sobrescrito por @media abaixo
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              border: '1px solid #EBEBEB',
              borderRadius: 8,
              background: 'transparent',
              cursor: 'pointer',
              color: '#555',
            }}
          >
            {menuAberto ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Menu mobile dropdown */}
      {menuAberto && (
        <div style={{
          position: 'fixed',
          top: 56,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 19,
        }}>
          {/* Overlay para fechar */}
          <div
            onClick={() => setMenuAberto(false)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.25)',
            }}
          />
          {/* Drawer */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            padding: '8px 0 16px',
          }}>
            {LINKS.map(({ href, label, icon: Icon }) => {
              const ativa = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuAberto(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 20px',
                    textDecoration: 'none',
                    fontSize: 15,
                    fontWeight: ativa ? 700 : 500,
                    color: ativa ? '#E52229' : '#1A1A1A',
                    backgroundColor: ativa ? '#FEF2F2' : 'transparent',
                    minHeight: 52,
                  }}
                >
                  <Icon size={18} color={ativa ? '#E52229' : '#777'} />
                  {label}
                  {ativa && (
                    <span style={{
                      marginLeft: 'auto',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: '#E52229',
                    }} />
                  )}
                </Link>
              );
            })}
            <div style={{ borderTop: '1px solid #F0F0F0', margin: '8px 0 0' }}>
              <button
                onClick={sair}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 20px',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 15,
                  color: '#E52229',
                  fontWeight: 600,
                  minHeight: 52,
                  textAlign: 'left',
                }}
              >
                <LogOut size={18} color="#E52229" />
                Sair da conta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos responsivos */}
      <style>{`
        @media (max-width: 639px) {
          .dcad-nav-links { display: none !important; }
          .dcad-nav-right { display: none !important; }
          .dcad-hamburger { display: flex !important; }
        }
        @media (min-width: 640px) {
          .dcad-hamburger { display: none !important; }
          .dcad-nav-right { display: flex !important; }
          .dcad-nav-links { display: flex !important; }
        }
        @media (max-width: 768px) {
          .dcad-nav-sair-label { display: none; }
        }
      `}</style>
    </>
  );
}
