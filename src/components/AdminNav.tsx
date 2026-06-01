"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EditorSignOutButton } from "../app/superadmin/EditorSignOutButton";
import { Menu, X } from "lucide-react";

interface AdminNavProps {
  isSuperadmin: boolean;
  isEditor: boolean;
  email: string | null;
  accountType: "superadmin" | "editor" | null;
}

export function AdminNav({ isSuperadmin, isEditor, email, accountType }: AdminNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close the mobile menu on path changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isActive = (href: string) => {
    if (href === "/superadmin") {
      return pathname === href || pathname === "/superadmin/";
    }
    return pathname.startsWith(href);
  };

  const navLinkClass = (href: string) => {
    const active = isActive(href);
    return `relative rounded-[3px] px-3 py-2.5 text-[13px] transition-all flex items-center gap-2 ${
      active
        ? "text-[#a68b6a] font-bold"
        : "text-black/75 hover:text-[#a68b6a] hover:bg-black/[0.04]"
    } ${active ? "before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-6 before:h-[3px] before:bg-[#a68b6a] before:rounded-full" : ""}`;
  };

  // Nav links group component to keep code DRY and maintainable
  const NavLinks = () => (
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
          <Link className={navLinkClass("/superadmin/claims")} href="/superadmin/claims">
            Claims
          </Link>
          <Link className={navLinkClass("/superadmin/inquiries")} href="/superadmin/inquiries">
            Inquiries
          </Link>
          <Link className={navLinkClass("/superadmin/reviews")} href="/superadmin/reviews">
            Reviews
          </Link>
          <Link className={navLinkClass("/superadmin/posts")} href="/superadmin/posts">
            Posts
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
          <Link className={navLinkClass("/superadmin/events")} href="/superadmin/events">
            Events Banners
          </Link>
          <Link className={navLinkClass("/superadmin/editors")} href="/superadmin/editors">
            Editors
          </Link>
          <Link className={navLinkClass("/superadmin/storage-cleanup")} href="/superadmin/storage-cleanup">
            Storage Cleanup
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
            className="h-9 w-full inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a68b6a] text-white text-[13px] font-semibold hover:bg-[#957a5c] transition-colors"
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
  );

  return (
    <>
      {/* 1. Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between border border-black/10 bg-white shadow-sm p-4 rounded-[3px] w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
            className="p-2 -ml-2 text-black/75 hover:bg-black/[0.06] rounded-[3px] transition-colors cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <div className="text-[13px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
              {isEditor ? "Editor Portal" : "Superadmin Portal"}
            </div>
            <div className="text-[11px] text-black/45">
              {isEditor ? "Edit vendor data" : "Manage the site"}
            </div>
          </div>
        </div>

        {/* Small account badge/indicator */}
        {email && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            accountType === "superadmin"
              ? "bg-[#fff1f3] text-[#b42318] border border-[#b42318]/20"
              : "bg-purple-50 text-purple-600 border border-purple-200"
          }`}>
            {accountType === "superadmin" ? "Admin" : "Editor"}
          </span>
        )}
      </div>

      {/* 2. Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[999] lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 3. Mobile Drawer Panel */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[1000] shadow-2xl flex flex-col lg:hidden transition-transform duration-300 ease-out transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ visibility: isOpen ? "visible" : "hidden" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
          <div>
            <div className="text-[14px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
              {isEditor ? "Editor" : "Superadmin"}
            </div>
            <div className="mt-1 text-[12px] text-black/45">
              {isEditor ? "Edit vendor data." : "Manage the site."}
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="p-2 -mr-2 text-black/75 hover:bg-black/[0.06] rounded-[3px] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Account Info */}
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

        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
      </div>

      {/* 4. Desktop Sidebar View */}
      <aside className="hidden lg:block rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden h-fit self-start sticky top-10 w-[240px]">
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

        <NavLinks />
      </aside>
    </>
  );
}
