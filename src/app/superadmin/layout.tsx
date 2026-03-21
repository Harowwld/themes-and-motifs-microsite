import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "../../lib/supabaseAdmin";
import { SUPERADMIN_COOKIE_NAME } from "../../lib/superadminAuth";

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SUPERADMIN_COOKIE_NAME)?.value ?? "";

  if (!token) {
    redirect("/admin/login");
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("superadmin_sessions")
    .select("id")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();

  if (!data) {
    redirect("/admin/login");
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(circle at 20% 10%, #fff7ed, #fcfbf9 42%, #f6f1ea 92%)",
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 py-10">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden h-fit">
            <div className="px-5 py-4 border-b border-black/5">
              <div className="text-[14px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Superadmin</div>
              <div className="mt-1 text-[12px] text-black/45">Manage the site.</div>
            </div>

            <nav className="p-2 grid gap-1 text-[13px]">
              <Link className="rounded-[3px] px-3 py-2 hover:bg-black/[0.03] text-black/75" href="/superadmin">
                Dashboard
              </Link>
              <Link className="rounded-[3px] px-3 py-2 hover:bg-black/[0.03] text-black/75" href="/superadmin/vendors">
                Vendors
              </Link>
              <Link className="rounded-[3px] px-3 py-2 hover:bg-black/[0.03] text-black/75" href="/superadmin/registrations">
                Registrations
              </Link>
              <Link className="rounded-[3px] px-3 py-2 hover:bg-black/[0.03] text-black/75" href="/superadmin/promos">
                Promos
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
              <Link className="rounded-[3px] px-3 py-2 hover:bg-black/[0.03] text-black/75" href="/superadmin/settings">
                Settings
              </Link>

              <div className="my-1 border-t border-black/5" />

              <form action="/api/admin/auth/logout" method="post" className="p-1">
                <button
                  type="submit"
                  className="h-9 w-full inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors"
                >
                  Sign out
                </button>
              </form>
            </nav>
          </aside>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
