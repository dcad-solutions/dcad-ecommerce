'use client'
import Wizard from '@/components/Wizard'

// Impede prerender estático: o Wizard inicializa Supabase,
// que requer env vars disponíveis apenas em runtime.
export const dynamic = 'force-dynamic'

export default function Home() {
  return <Wizard />
}