'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Home, Package, User, LogOut, Menu, X, Sun, Moon, ChevronLeft } from 'lucide-react';
import { DcadLogo } from '@/components/DcadLogo';
import { useWizardNav } from '@/contexts/WizardNavContext';

const LINKS = [
  { href: '/',        label: 'Início',    icon: Home },
  { href: '/pedidos', label: 'Pedidos',   icon: Package },
  { href: '/perfil',  label: 'Perfil',    icon: User },
];

// Hook para tema claro/escuro — persiste em localStorage
function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('dcad_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  });

  useEffect(() => {
    try { localStorage.setItem('dcad_theme', theme); } catch {}
    document.documentElement.setAttribute('data-dcad-theme', theme);
  }, [theme]);

  return [theme, setTheme] as const;
}

export default function ClientNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [nome, setNome] = useState<string | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [theme, setTheme] = useTheme();

  // Contexto do Wizard — fornece screen atual e nome do dentista quando o Wizard está ativo
  const { screen, setScreen, dentistNome } = useWizardNav();

  const dark = theme === 'dark';

  // Ocultar header completamente na tela de autenticação do Wizard
  if (screen === 'auth') return null;

  // Cores baseadas no tema
  const C = {
    bg:     dark ? '#0A0A0A' : '#FFFFFF',
    border: dark ? '#2A2A2A' : '#EBEBEB',
    text:   dark ? '#FFFFFF' : '#1A1A1A',
    textSec:dark ? '#8A8A8A' : '#777777',
    linkHover: dark ? 'rgba(229,34,41,0.15)' : '#FEF2F2',
    shadow: dark ? '0 1px 0 #2A2A2A' : '0 1px 0 #EBEBEB',
    drawerBg: dark ? '#111111' : '#FFFFFF',
  };

  // Nome exibido: prioriza nome do dentista vindo do Wizard; fallback para consulta Supabase
  const nomeExibido = dentistNome ?? nome;

  // Mostrar botão "← Dashboard" quando o Wizard está em tela interna (não auth/dashboard/pending)
  const mostrarDashboard = screen !== '' && screen !== 'auth' && screen !== 'dashboard' && screen !== 'pending';

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.from('dcad_clientes').select('nome').maybeSingle().then(({ data }) => {
      if (data?.nome) setNome(data.nome);
    });
  }, []);

  async function sair() {
    const sb = supabaseBrowser();
    await sb.auth.signOut();
    if (setScreen) setScreen('auth');
    else router.push('/');
  }

  function toggleTheme() {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  }

  return (
    <>
      {/* Desktop / tablet */}
      <nav style={{
        backgroundColor: C.bg,
        borderBottom: `1px solid ${C.border}`,
        padding: '0 max(20px, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(20px, env(safe-area-inset-right, 0px))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        position: 'sticky',
        top: 0,
        zIndex: 20,
        boxShadow: C.shadow,
        transition: 'background-color 0.2s, border-color 0.2s',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <DcadLogo size={32} variant="color" showText={true} />
        </Link>

        {/* Centro: botão ← Dashboard (quando Wizard está em tela interna) OU links de nav */}
        <div style={{
          display: 'flex',
          gap: 4,
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          alignItems: 'center',
        }} className="dcad-nav-links">
          {mostrarDashboard ? (
            <button
              onClick={() => setScreen('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                color: C.textSec,
                minHeight: 36,
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <ChevronLeft size={15} />
              Dashboard
            </button>
          ) : (
            LINKS.map(({ href, label, icon: Icon }) => {
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
                    color: ativa ? '#E52229' : C.textSec,
                    backgroundColor: ativa ? 'rgba(229,34,41,0.10)' : 'transparent',
                    minHeight: 36,
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })
          )}
        </div>

        {/* Lado direito: toggle + nome + sair | hamburger mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Toggle tema — visível sempre */}
          <button
            onClick={toggleTheme}
            title={dark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              background: 'transparent',
              cursor: 'pointer',
              color: C.textSec,
              transition: 'border-color 0.2s, color 0.2s',
              flexShrink: 0,
            }}
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Nome + botão sair — visível ≥640px */}
          <div className="dcad-nav-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {nomeExibido && (
              <span style={{ fontSize: 13, color: C.textSec, fontWeight: 500 }}>
                Olá, <strong style={{ color: C.text }}>{nomeExibido}</strong>
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
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                color: C.textSec,
                minHeight: 36,
                minWidth: 44,
                justifyContent: 'center',
                transition: 'border-color 0.2s, color 0.2s',
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
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              background: 'transparent',
              cursor: 'pointer',
              color: C.textSec,
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
            backgroundColor: C.drawerBg,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            padding: '8px 0 16px',
            transition: 'background-color 0.2s',
          }}>
            {/* Botão ← Dashboard no mobile quando Wizard está em tela interna */}
            {mostrarDashboard && (
              <button
                onClick={() => { setScreen('dashboard'); setMenuAberto(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 20px',
                  width: '100%',
                  background: 'rgba(229,34,41,0.08)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 15,
                  color: '#E52229',
                  fontWeight: 600,
                  minHeight: 52,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <ChevronLeft size={18} color="#E52229" />
                Voltar ao Dashboard
              </button>
            )}
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
                    color: ativa ? '#E52229' : C.text,
                    backgroundColor: ativa ? 'rgba(229,34,41,0.10)' : 'transparent',
                    minHeight: 52,
                  }}
                >
                  <Icon size={18} color={ativa ? '#E52229' : C.textSec} />
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

            {/* Toggle tema no mobile */}
            <div style={{ borderTop: `1px solid ${C.border}`, margin: '8px 0 0' }}>
              <button
                onClick={toggleTheme}
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
                  color: C.text,
                  fontWeight: 500,
                  minHeight: 52,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                {dark ? <Sun size={18} color={C.textSec} /> : <Moon size={18} color={C.textSec} />}
                {dark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              </button>
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
                  fontFamily: 'inherit',
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
