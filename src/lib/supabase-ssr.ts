import { createBrowserClient as createSBBrowserClient } from '@supabase/ssr'

export function createBrowserClient() {
  // During build time, return a mock client to prevent errors
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Server side') }),
        signOut: () => Promise.resolve({ error: new Error('Server side') }),
        resetPasswordForEmail: () => Promise.resolve({ error: new Error('Server side') }),
        verifyOtp: () => Promise.resolve({ error: new Error('Server side') }),
        exchangeCodeForSession: () => Promise.resolve({ error: new Error('Server side') }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      }
    } as any
  }

  return createSBBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(key) {
          if (typeof document === 'undefined') {
            return undefined
          }
          const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${key}=`))
          if (!cookie) return undefined
          const rawValue = cookie.slice(key.length + 1)
          try {
            return decodeURIComponent(rawValue)
          } catch {
            return rawValue
          }
        },
        set(key, value, options) {
          if (typeof document === 'undefined') {
            return
          }
          const encodedValue = encodeURIComponent(value)
          let cookie = `${key}=${encodedValue}`
          if (options?.maxAge) cookie += `; Max-Age=${options.maxAge}`
          if (options?.expires) cookie += `; Expires=${options.expires.toUTCString()}`
          cookie += `; Path=${options?.path ?? '/'}`
          if (options?.domain) cookie += `; Domain=${options.domain}`
          const isHttps = typeof window !== 'undefined' && window.location?.protocol === 'https:'

          let sameSite = options?.sameSite ?? 'Lax'
          if (sameSite === 'none' && !isHttps) {
            sameSite = 'Lax'
          }

          const shouldSecure = (options?.secure || sameSite === 'none') && isHttps
          if (shouldSecure) cookie += '; Secure'
          cookie += `; SameSite=${sameSite}`
          document.cookie = cookie
        },
        remove(key, options) {
          if (typeof document === 'undefined') {
            return
          }
          const path = options?.path ?? '/'
          document.cookie = `${key}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=${path}`
        },
      },
    }
  )
}
