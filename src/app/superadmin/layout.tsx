import { cookies, headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "../../lib/supabaseAdmin";
import { SUPERADMIN_COOKIE_NAME } from "../../lib/superadminAuth";
import { EditorAuthCheck } from "./AuthCheck";

async function getPathname(): Promise<string> {
  try {
    const headersList = await headers();
    return headersList.get("x-invoke-path") ?? "";
  } catch {
    return "";
  }
}

async function checkSuperadmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const superadminToken = cookieStore.get(SUPERADMIN_COOKIE_NAME)?.value ?? "";

  if (!superadminToken) return false;

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("superadmin_sessions")
    .select("id")
    .eq("token", superadminToken)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();

  return Boolean(data);
}

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const isSuperadmin = await checkSuperadmin();

  // If not a superadmin, check if accessing dashboard and redirect to vendors
  if (!isSuperadmin) {
    const pathname = await getPathname();
    // Redirect editors from dashboard to vendors page
    if (pathname === "/superadmin" || pathname === "/superadmin/") {
      redirect("/superadmin/vendors");
    }

    return (
      <EditorAuthCheck>
        <LayoutContent isSuperadmin={false} isEditor={true}>
          {children}
        </LayoutContent>
      </EditorAuthCheck>
    );
  }

  return (
    <LayoutContent isSuperadmin={true} isEditor={false}>
      {children}
    </LayoutContent>
  );
}

function LayoutContent({
  children,
  isSuperadmin,
  isEditor,
}: {
  children: React.ReactNode;
  isSuperadmin: boolean;
  isEditor: boolean;
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
                <Link
                  href="/signin"
                  className="h-9 w-full inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors"
                >
                  Sign out
                </Link>
              )}
            </nav>
          </aside>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
