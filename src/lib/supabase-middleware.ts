import { createServerClient as createSBServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Update session in Next.js middleware.
 * 
 * Use this ONLY in:
 * - middleware.ts (Next.js middleware)
 * 
 * This function handles:
 * - Cookie synchronization between client and server
 * - Session refresh on page navigation
 * - Auth state persistence
 * 
 * IMPORTANT: Avoid writing logic between createServerClient and
 * supabase.auth.getUser(). A simple mistake could make it so that
 * users are randomly logged out or logged in.
 * 
 * @example
 * ```ts
 * // middleware.ts
 * import { type NextRequest } from 'next/server'
 * import { updateSession } from '@/lib/supabase-middleware'
 * 
 * export async function middleware(request: NextRequest) {
 *   const result = await updateSession(request)
 *   // Handle result.user, result.supabaseResponse...
 * }
 * ```
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createSBServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it so that
  // users are randomly logged out or logged in.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Return the myNewResponse object.
  // 
  // If you don't have a user, return the supabaseResponse so the middleware
  // can handle the redirect.
  if (!user) {
    return supabaseResponse
  }

  return { supabaseResponse, user }
}
