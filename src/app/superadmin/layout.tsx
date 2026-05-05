import { cookies, headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createServerClient } from '@supabase/ssr'
import { createSupabaseAdminClient } from "../../lib/supabaseAdmin";
import { EditorSignOutButton } from "./EditorSignOutButton";

async function getPathname(): Promise<string> {
  try {
    const headersList = await headers();
    return headersList.get("x-invoke-path") ?? "";
  } catch {
    return "";
  }
}

async function getCurrentUser(): Promise<{ isSuperadmin: boolean; isEditor: boolean; email: string | null }> {
  const cookieStore = await cookies();
  
  // Create Supabase client with SSR
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

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { isSuperadmin: false, isEditor: false, email: null }
  }

  // Check if this user is a superadmin
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

  // Check if this user is an editor
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

  // If no user at all, redirect to admin login
  if (!user.email) {
    redirect("/admin/login");
  }

  // If user is a superadmin, show superadmin layout
  if (user.isSuperadmin) {
    return (
      <LayoutContent isSuperadmin={true} isEditor={false} email={user.email} accountType="superadmin">
        {children}
      </LayoutContent>
    );
  }

  // If user is an editor, redirect editors from dashboard to vendors page
  if (user.isEditor) {
    const pathname = await getPathname();
    if (pathname === "/superadmin" || pathname === "/superadmin/") {
      redirect("/superadmin/vendors");
    }

    return (
      <LayoutContent isSuperadmin={false} isEditor={true} email={user.email} accountType="editor">
        {children}
      </LayoutContent>
    );
  }

  // User is authenticated but not authorized for superadmin access
  redirect("/admin/login");
}

function LayoutContent({
  children,
  isSuperadmin,
  isEditor,
  email,
  accountType,
}: {
  children: React.ReactNode;
  isSuperadmin: boolean;
  isEditor: boolean;
  email: string | null;
  accountType: "superadmin" | "editor" | null;
}) {

  return (
    <div
      className="min-h-screen bg-[#fafafa]"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 py-10">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden h-fit">
            <div className="px-5 py-4 border-b border-black/5">
              <div className="text-[14px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
                {isEditor ? "Editor" : "Superadmin"}
              </div>
              <div className="mt-1 text-[12px] text-black/45">
                {isEditor ? "Edit vendor data." : "Manage the site."}
              </div>
            </div>

            {/* Account info display */}
            {email && (
              <div className="px-5 py-3 border-b border-black/5 bg-gray-50">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-[12px] text-gray-600 font-medium truncate" title={email}>
                    {email}
                  </span>
                </div>
                {accountType && (
                  <div className="mt-2">
                    <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      accountType === "superadmin"
                        ? "bg-[#fff1f3] text-[#b42318] border border-[#b42318]/20"
                        : "bg-purple-50 text-purple-600 border border-purple-200"
                    }`}>
                      {accountType.charAt(0).toUpperCase() + accountType.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <nav className="p-2 grid gap-1 text-[13px]">
              {isSuperadmin && (
                <Link className="rounded-[3px] px-3 py-2 hover:bg-black/[0.03] text-black/75" href="/superadmin">
                  Dashboard
                </Link>
              )}
              <Link className="rounded-[3px] px-3 py-2 hover:bg-black/[0.03] text-black/75" href="/superadmin/vendors">
                Vendors
              </Link>
              <Link className="rounded-[3px] px-3 py-2 hover:bg-black/[0.03] text-black/75" href="/superadmin/promos">
                Promos
              </Link>
              {isSuperadmin && (
                <>
                  <Link className="rounded-[3px] px-3 py-2 hover:bg-black/[0.03] text-black/75" href="/superadmin/registrations">
                    Registrations
                  </Link>
                  <Link className="rounded-[3px] px-3 py-2 hover:bg-black/[0.03] text-black/75" href="/superadmin/claims">
                    Claims
                  </Link>
                  <Link className="rounded-[3px] px-3 py-2 hover:bg-black/[0.03] text-black/75" href="/superadmin/inquiries">
                    Inquiries
                  </Link>
                  <Link className="rounded-[3px] px-3 py-2 hover:bg-black/[0.03] text-black/75" href="/superadmin/reviews">
                    Reviews
                  </Link>
                  <Link className="rounded-[3px] px-3 py-2 hover:bg-black/[0.03] text-black/75" href="/superadmin/verification-documents">
                    Verification docs
                  </Link>
                  <Link className="rounded-[3px] px-3 py-2 hover:bg-black/[0.03] text-black/75" href="/superadmin/users">
                    Users
                  </Link>
                  <Link className="rounded-[3px] px-3 py-2 hover:bg-black/[0.03] text-black/75" href="/superadmin/editors">
                    Editors
                  </Link>
                  <Link className="rounded-[3px] px-3 py-2 hover:bg-black/[0.03] text-black/75" href="/superadmin/settings">
                    Settings
                  </Link>
                </>
              )}

              <div className="my-1 border-t border-black/5" />

              {isSuperadmin ? (
                <form action="/api/admin/auth/logout" method="post" className="p-1">
                  <button
                    type="submit"
                    className="h-9 w-full inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors"
                  >
                    Sign out
                  </button>
                </form>
              ) : (
                <div className="p-1">
                  <EditorSignOutButton />
                </div>
              )}
            </nav>
          </aside>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
