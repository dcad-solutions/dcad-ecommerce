import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await sb.auth.getUser();
  const { pathname } = request.nextUrl;

  // Rotas públicas: login, cadastro, callback de email, API pública de cadastro
  const rotasPublicas = ['/login', '/cadastro', '/auth/callback', '/api/cadastro', '/recuperar-senha', '/nova-senha'];
  const ehPublica = rotasPublicas.some(r => pathname.startsWith(r));

  if (ehPublica) {
    // Se já está logado e tenta acessar login/cadastro, redireciona para home
    if (user && (pathname.startsWith('/login') || pathname.startsWith('/cadastro'))) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return response;
  }

  // Todo o resto exige login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
