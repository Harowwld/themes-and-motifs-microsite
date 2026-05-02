import { createBrowserClient as createSBBrowserClient } from '@supabase/ssr'

let browserClient: ReturnType<typeof createSBBrowserClient> | null = null

/**
 * Create a Supabase client for browser components.
 * 
 * Use this in:
 * - Client Components ("use client")
 * - Auth flows (signin, signup, password reset)
 * - Pages that need real-time auth state
 * 
 * Features:
 * - Cookie-based session storage (persists across tabs)
 * - PKCE flow support (password reset links)
 * - Singleton pattern (reuses existing client)
 * 
 * @example
 * ```tsx
 * "use client"
 * import { createBrowserClient } from "@/lib/supabase-browser"
 * 
 * export default function MyComponent() {
 *   const supabase = createBrowserClient()
 *   // ...
 * }
 * ```
 */
export function createBrowserClient() {
  // Only create the client on the client side
  if (typeof window === 'undefined') {
    // Server-side - return a dummy object that won't be used
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
  
  // Client-side - create or return cached client
  if (!browserClient) {
    browserClient = createSBBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(key) {
            if (typeof document === 'undefined') {
              return undefined
            }
            const cookie = document.cookie
              .split('; ')
              .find((row) => row.startsWith(`${key}=`))
            return cookie ? cookie.split('=')[1] : undefined
          },
          set(key, value, options) {
            if (typeof document === 'undefined') {
              return
            }
            let cookie = `${key}=${value}`
            if (options?.maxAge) cookie += `; Max-Age=${options.maxAge}`
            if (options?.expires) cookie += `; Expires=${options.expires.toUTCString()}`
            if (options?.path) cookie += `; Path=${options.path}`
            if (options?.domain) cookie += `; Domain=${options.domain}`
            if (options?.secure) cookie += '; Secure'
            if (options?.sameSite) cookie += `; SameSite=${options.sameSite}`
            document.cookie = cookie
          },
          remove(key, options) {
            if (typeof document === 'undefined') {
              return
            }
            document.cookie = `${key}=; Max-Age=0${options?.path ? `; Path=${options.path}` : ''}`
          },
        },
      }
    )
  }
  
  return browserClient
}
