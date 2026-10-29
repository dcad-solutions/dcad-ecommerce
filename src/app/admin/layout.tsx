import { redirect } from 'next/navigation';
import { supabaseAdmin, clienteAtual } from '@/lib/supabase-server';
import AdminNav from '@/components/AdminNav';

export const metadata = {
  title: 'D-CAD Admin',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificação server-side redundante (middleware já bloqueia, mas defense-in-depth)
  const { user, cliente } = await clienteAtual();

  if (!user) {
    redirect('/login');
  }

  if (!cliente?.is_admin) {
    redirect('/acesso-negado');
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
    }}>
      <AdminNav />
      <main style={{
        flex: 1,
        overflow: 'auto',
        color: '#e5e7eb',
      }}>
        {children}
      </main>
    </div>
  );
}
