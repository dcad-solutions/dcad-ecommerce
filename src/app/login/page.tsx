'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Esta rota foi unificada no Wizard em /
// Redireciona automaticamente para a tela unificada
export default function Login() {
  const router = useRouter();
  useEffect(() => { router.replace('/'); }, [router]);
  return null;
}
