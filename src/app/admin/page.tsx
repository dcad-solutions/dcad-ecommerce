import { redirect } from 'next/navigation';

// Redireciona /admin → /admin/cadastros como página padrão
export default function AdminIndex() {
  redirect('/admin/cadastros');
}
