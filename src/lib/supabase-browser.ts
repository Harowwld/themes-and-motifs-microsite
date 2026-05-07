import { createBrowserClient as createSBBrowserClient } from '@supabase/ssr'

let browserClient: ReturnType<typeof createSBBrowserClient> | null = null

export function createBrowserClient() {
  if (typeof window === 'undefined') {
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Server side') }),
        signOut: () => Promise.resolve({ error: new Error('Server side') }),
        resetPasswordForEmail: () => Promise.resolve({ error: new Error('Server side') }),
        verifyOtp: () => Promise.resolve({ error: new Error('Server side') }),
        exchangeCodeForSession: () => Promise.resolve({ error: new Error('Server side') }),
      }
    } as any
  }
  
  if (!browserClient) {
    browserClient = createSBBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  
  return browserClient
}
