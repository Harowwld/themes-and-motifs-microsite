import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createServerClient } from '@supabase/ssr'
import { createSupabaseAdminClient } from "../../lib/supabaseAdmin";
import { AdminNav } from "../../components/AdminNav";

export const dynamic = "force-dynamic";

async function getCurrentUser(): Promise<{ isSuperadmin: boolean; isEditor: boolean; email: string | null }> {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { isSuperadmin: false, isEditor: false, email: null }
  }

  const adminSupabase = createSupabaseAdminClient()
  const { data: superadminData } = await adminSupabase
    .from("superadmins")
    .select("id, is_active")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .maybeSingle()

  if (superadminData) {
    return { isSuperadmin: true, isEditor: false, email: user.email ?? null }
  }

  const { data: editorData } = await adminSupabase
    .from("editors")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (editorData) {
    return { isSuperadmin: false, isEditor: true, email: user.email ?? null }
  }

  return { isSuperadmin: false, isEditor: false, email: null }
}

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  
  if (!user.email) {
    redirect("/admin/login");
  }

  const accountType = user.isSuperadmin ? "superadmin" : user.isEditor ? "editor" : null;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 py-10">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <AdminNav 
            isSuperadmin={user.isSuperadmin} 
            isEditor={user.isEditor} 
            email={user.email} 
            accountType={accountType} 
          />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
