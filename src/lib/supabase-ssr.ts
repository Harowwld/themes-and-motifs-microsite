import { createBrowserClient as createSBBrowserClient } from '@supabase/ssr'

export function createBrowserClient() {
  return createSBBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
