import { createBrowserClient as createBrowserClientImpl } from '@supabase/ssr'

export function createBrowserClient() {
  return createBrowserClientImpl(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
