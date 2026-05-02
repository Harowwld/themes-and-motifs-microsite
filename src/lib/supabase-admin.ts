import { createClient } from "@supabase/supabase-js";

/**
 * Create a Supabase admin client with service role privileges.
 * 
 * Use this in:
 * - API routes that bypass RLS (e.g., user management, admin operations)
 * - Background jobs that need full database access
 * - Seed scripts and migrations
 * 
 * ⚠️ SECURITY WARNING:
 * - This client bypasses Row Level Security (RLS)
 * - Never expose this client to the browser
 * - Only use server-side in API routes or Server Components
 * 
 * Required env vars:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * 
 * @example
 * ```ts
 * import { createSupabaseAdminClient } from "@/lib/supabase-admin"
 * 
 * export async function POST(req: Request) {
 *   const supabase = createSupabaseAdminClient()
 *   // Can read/write any table regardless of RLS policies
 *   const { data } = await supabase.auth.admin.listUsers()
 *   // ...
 * }
 * ```
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
