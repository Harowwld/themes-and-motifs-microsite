import { createBrowserClient as createSBBrowserClient } from '@supabase/ssr'

export function createBrowserClient() {
  return createSBBrowserClient(
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
