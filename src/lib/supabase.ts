import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton lazy: só instancia na primeira chamada, nunca no nível do módulo.
// Isso evita "supabaseUrl is required" durante prerender estático do Next.js.
let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error('[D-CAD] Supabase env vars não configuradas.')
    }
    _client = createClient(url, key)
  }
  return _client
}

// Mantém compatibilidade com código antigo que importa `supabase` diretamente.
// Usa Proxy para adiar a inicialização até o primeiro acesso ao objeto.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop]
  },
})