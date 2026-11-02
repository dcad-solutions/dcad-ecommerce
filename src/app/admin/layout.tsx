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

  if (!user) redirect('/login');
  if (!cliente?.is_admin) redirect('/acesso-negado');

  return (
    <div style={{
      display: 'flex',
      minHeight: '100dvh',
      backgroundColor: '#0a0a0a',
      fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
    }}>
      <AdminNav />
      {/*
        Em mobile a sidebar some e aparece uma top bar fixa de 52px.
        O padding-top empurra o conteúdo para baixo dessa barra.
        Em desktop (≥768px) a sidebar está visível e o padding-top é 0.
      */}
      <main
        className="admin-main"
        style={{
          flex: 1,
          overflow: 'auto',
          color: '#e5e7eb',
        }}
      >
        {children}
      </main>

      <style>{`
        @media (max-width: 767px) {
          .admin-main { padding-top: 52px; }
        }
      `}</style>
    </div>
  );
}
