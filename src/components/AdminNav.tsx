"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EditorSignOutButton } from "../app/superadmin/EditorSignOutButton";

interface AdminNavProps {
  isSuperadmin: boolean;
  isEditor: boolean;
  email: string | null;
  accountType: "superadmin" | "editor" | null;
}

export function AdminNav({ isSuperadmin, isEditor, email, accountType }: AdminNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/superadmin") {
      return pathname === href || pathname === "/superadmin/";
    }
    return pathname.startsWith(href);
  };

  const navLinkClass = (href: string) => {
    const active = isActive(href);
    return `relative rounded-[3px] px-3 py-2 text-[13px] transition-all flex items-center gap-2 ${
      active
        ? "bg-[#a67c52]/15 text-[#a67c52] font-bold"
        : "text-black/75 hover:bg-black/[0.06]"
    } ${active ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[4px] before:h-5 before:bg-[#a67c52] before:rounded-r-full" : ""}`;
  };

  return (
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

      <nav className="p-2 grid gap-1">
        {isSuperadmin && (
          <Link className={navLinkClass("/superadmin")} href="/superadmin">
            Analytics
          </Link>
        )}
        <Link className={navLinkClass("/superadmin/vendors")} href="/superadmin/vendors">
          Vendors
        </Link>
        <Link className={navLinkClass("/superadmin/promos")} href="/superadmin/promos">
          Promos
        </Link>
        {isSuperadmin && (
          <>
            <Link className={navLinkClass("/superadmin/registrations")} href="/superadmin/registrations">
              Registrations
            </Link>
            <Link className={navLinkClass("/superadmin/claims")} href="/superadmin/claims">
              Claims
            </Link>
            <Link className={navLinkClass("/superadmin/inquiries")} href="/superadmin/inquiries">
              Inquiries
            </Link>
            <Link className={navLinkClass("/superadmin/reviews")} href="/superadmin/reviews">
              Reviews
            </Link>
            <Link className={navLinkClass("/superadmin/verification-documents")} href="/superadmin/verification-documents">
              Verification docs
            </Link>
            <Link className={navLinkClass("/superadmin/themes")} href="/superadmin/themes">
              Themes
            </Link>
            <Link className={navLinkClass("/superadmin/users")} href="/superadmin/users">
              Soon to Weds
            </Link>
            <Link className={navLinkClass("/superadmin/editors")} href="/superadmin/editors">
              Editors
            </Link>
            <Link className={navLinkClass("/superadmin/settings")} href="/superadmin/settings">
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
  );
}
