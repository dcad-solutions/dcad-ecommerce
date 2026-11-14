import Link from 'next/link';
import PagamentoBox from '@/components/PagamentoBox';

// Volta do checkout da InfinitePay (cartão). A caixa confere a situação até o aviso do pagamento chegar.
export default async function RetornoPagamento({ searchParams }: { searchParams: Promise<{ os?: string }> }) {
  const { os } = await searchParams;
  const valido = !!os && /^[0-9a-f-]{36}$/i.test(os);
  return (
    <main style={{ minHeight: '100dvh', background: 'var(--dcad-bg)', color: 'var(--dcad-text)', paddingBlock: 32, paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Pagamento do pedido</h1>
        {valido ? (
          <>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--dcad-text-sec)' }}>Estamos confirmando com a operadora. Isso costuma levar poucos segundos.</p>
            <PagamentoBox osId={os!} forma="cartao" temaDoPortal />
          </>
        ) : (
          <p style={{ margin: 0, fontSize: 14, color: 'var(--dcad-text-sec)' }}>Pedido não identificado.</p>
        )}
        <Link href="/pedidos" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, borderRadius: 10, border: '1px solid var(--dcad-border)', color: 'var(--dcad-text)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
          Ver meus pedidos
        </Link>
      </div>
    </main>
  );
}
