# Supabase Clients

This directory contains standardized Supabase client configurations for different use cases.

## Quick Reference

| File | Function | Use When |
|------|----------|----------|
| `supabase-browser.ts` | `createBrowserClient()` | Client Components, auth flows, real-time state |
| `supabase-server.ts` | `createSupabaseServerClient()` | Server Components, public data fetching |
| `supabase-server.ts` | `createSupabaseServerClientWithCookies()` | API routes needing auth/session |
| `supabase-middleware.ts` | `updateSession()` | Next.js middleware only |
| `supabase-admin.ts` | `createSupabaseAdminClient()` | Admin operations, bypasses RLS |

## Detailed Usage

### Browser Client (`supabase-browser.ts`)

For Client Components ("use client") and browser-side auth flows.

```tsx
"use client"
import { createBrowserClient } from "@/lib/supabase-browser"

export default function SignInPage() {
  const supabase = createBrowserClient()
  
  async function handleSignIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    // ...
  }
}
```

**Features:**
- Cookie-based session storage
- PKCE flow support (password reset links)
- Singleton pattern (reuses existing client)

### Server Client - Public (`supabase-server.ts`)

For Server Components and API routes that fetch public data.

```ts
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET() {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase.from("vendors").select("*")
  return Response.json({ data })
}
```

**Use for:**
- Public data (categories, vendors, listings)
- Inside `unstable_cache()`
- Background jobs

**Limitations:**
- No session/auth support
- Uses anon key only

### Server Client - Authenticated (`supabase-server.ts`)

For API routes and Server Components that need to verify the current user.

```ts
import { createSupabaseServerClientWithCookies } from "@/lib/supabase-server"

export async function GET() {
  const supabase = await createSupabaseServerClientWithCookies()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // User is authenticated, proceed...
}
```

**Use for:**
- API routes needing current user
- Server Components with auth checks

**Limitations:**
- Cannot be used inside `unstable_cache()`
- Must be called in async context

### Middleware Client (`supabase-middleware.ts`)

For Next.js middleware only.

```ts
// middleware.ts
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'

export async function middleware(request: NextRequest) {
  const result = await updateSession(request)
  
  if (result instanceof NextResponse) {
    // No user, return the response (may redirect)
    return result
  }
  
  // User is authenticated
  const { user, supabaseResponse } = result
  return supabaseResponse
}
```

**Use for:**
- Session refresh on navigation
- Route protection
- Cookie synchronization

### Admin Client (`supabase-admin.ts`)

For server-side operations that bypass RLS.

⚠️ **SECURITY:** This client bypasses all Row Level Security policies. Never expose to the browser.

```ts
import { createSupabaseAdminClient } from "@/lib/supabase-admin"

export async function POST(req: Request) {
  // Verify admin access first
  // ...
  
  const supabase = createSupabaseAdminClient()
  
  // Can read/write any table regardless of RLS
  const { data: users } = await supabase.auth.admin.listUsers()
  
  // Or query tables directly
  const { data: allVendors } = await supabase
    .from("vendors")
    .select("*") // Bypasses RLS policies
}
```

**Use for:**
- User management (invite, delete, update)
- Admin operations requiring full access
- Background jobs needing unrestricted access

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Environment Variables

All clients require these environment variables:

```bash
# Required by all clients
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Required only by admin client
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Common Patterns

### Protecting API Routes

```ts
import { createSupabaseAdminClient } from "@/lib/supabase-admin"

export async function GET(req: Request) {
  // Get token from header
  const auth = req.headers.get("authorization") ?? ""
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : ""
  
  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // Verify with admin client
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase.auth.getUser(token)
  
  if (error || !data?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // User is verified, proceed...
}
```

### Fetching with User Context (Server Component)

```tsx
import { createSupabaseServerClientWithCookies } from "@/lib/supabase-server"

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClientWithCookies()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/signin")
  }
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()
  
  return <Dashboard profile={profile} />
}
```

## Migration from Old Files

If you have code using the old file names, update your imports:

| Old Import | New Import |
|------------|------------|
| `from "@/lib/supabase-ssr"` | `from "@/lib/supabase-browser"` |
| `from "@/lib/supabaseBrowser"` | `from "@/lib/supabase-browser"` |
| `from "@/lib/supabaseServer"` | `from "@/lib/supabase-server"` |
| `from "@/lib/supabase-server"` (middleware) | `from "@/lib/supabase-middleware"` |
| `from "@/lib/supabaseAdmin"` | `from "@/lib/supabase-admin"` |
