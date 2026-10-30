'use client';

import { usePathname } from 'next/navigation';
import ClientNav from './ClientNav';

// Rotas públicas onde a nav NÃO deve aparecer
const ROTAS_PUBLICAS = [
  '/login',
  '/cadastro',
  '/recuperar-senha',
  '/nova-senha',
  '/acesso-negado',
];

export default function ClientNavWrapper() {
  const pathname = usePathname();

  // Verifica se a rota atual é pública (ou começa com /admin)
  const ocultar =
    ROTAS_PUBLICAS.some(r => pathname === r || pathname.startsWith(r + '/')) ||
    pathname.startsWith('/admin');

  if (ocultar) return null;

  return <ClientNav />;
}
