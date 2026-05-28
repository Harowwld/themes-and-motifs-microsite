"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, LayoutDashboard, Sparkles } from "lucide-react";
import { createSupabaseBrowserClient } from "../../lib/supabaseBrowser";

export default function ProfileWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const widgetRef = useRef<HTMLDivElement>(null);

  // Sync auth state
  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const { data } = await supabase.auth.getSession();
      const session = data.session ?? null;
      const newSignedIn = Boolean(session?.user);

      if (cancelled) return;
      setSignedIn(newSignedIn);

      if (!session?.access_token) {
        setEmail(null);
        setAccountType(null);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            authorization: `Bearer ${session.access_token}`,
          },
        });
        const json = (await res.json().catch(() => null)) as {
          email?: string | null;
          accountType?: string | null;
        } | null;

        if (!cancelled && json) {
          setEmail(json.email ?? session.user.email ?? null);
          setAccountType(json.accountType ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setEmail(session.user.email ?? null);
          setAccountType(null);
        }
      }
    }

    void refresh();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        if (typeof window !== "undefined") {
          localStorage.removeItem("tm_profile_welcome_expanded");
        }
      }
      void refresh();
    });

    // Check if we just redirected from sign-in pages to clear expansion lock
    if (typeof window !== "undefined" && document.referrer) {
      const fromAuth = document.referrer.includes("/signin") || document.referrer.includes("/signup");
      if (fromAuth) {
        localStorage.removeItem("tm_profile_welcome_expanded");
      }
    }

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  // Handle expand upon login (welcome bubble) - exactly matching BugReportButton timers & localStorage refresh safety
  useEffect(() => {
    if (!signedIn) {
      setIsExpanded(false);
      return;
    }

    if (typeof window !== "undefined") {
      const hasExpanded = localStorage.getItem("tm_profile_welcome_expanded");
      if (hasExpanded === "true") {
        return;
      }
    }

    const expandTimer = setTimeout(() => {
      setIsAnimating(true);
      setIsExpanded(true);
    }, 1000);

    const collapseTimer = setTimeout(() => {
      setIsCollapsing(true);
      setIsAnimating(false);
      setTimeout(() => {
        setIsExpanded(false);
        setIsCollapsing(false);
        if (typeof window !== "undefined") {
          localStorage.setItem("tm_profile_welcome_expanded", "true");
        }
      }, 500);
    }, 4000);

    return () => {
      clearTimeout(expandTimer);
      clearTimeout(collapseTimer);
    };
  }, [signedIn]);

  // Close popover on outside click
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (widgetRef.current && !widgetRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  const signOut = async () => {
    setSigningOut(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("tm_profile_welcome_expanded");
      }
      await supabase.auth.signOut();
    } finally {
      setSigningOut(false);
      setIsOpen(false);
      router.push("/", { scroll: false });
    }
  };

  const displayName = useMemo(() => {
    if (!email) return "User";
    return email.split("@")[0];
  }, [email]);

  const initials = useMemo(() => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  }, [email]);

  const dashboardPath = useMemo(() => {
    if (accountType === "vendor") return "/vendor/dashboard";
    return "/dashboard";
  }, [accountType]);

  const displayAccountType = useMemo(() => {
    if (!accountType) return "Member";
    if (accountType === "soon_to_wed") return "Couple";
    return accountType.charAt(0).toUpperCase() + accountType.slice(1);
  }, [accountType]);

  const expandedLabel = useMemo(() => {
    if (!accountType) return "Member Account";
    if (accountType === "soon_to_wed") return "Couple Account";
    if (accountType === "vendor") return "Vendor Account";
    if (accountType === "editor") return "Editor Account";
    if (accountType === "superadmin") return "Admin Account";
    return `${accountType.charAt(0).toUpperCase() + accountType.slice(1)} Account`;
  }, [accountType]);

  if (!signedIn) return null;

  return (
    <div ref={widgetRef} className="fixed top-36 right-4 z-[100]">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-lg border border-black/10 w-72 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header section matching Report a Bug */}
          <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#2c2c2c]">Your Account</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
          {/* Content section */}
          <div className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#a68b6a]/10 flex items-center justify-center text-[#a68b6a] font-bold text-lg mb-2">
                {email ? email.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="text-sm font-bold text-gray-800 capitalize leading-tight">
                {displayName}
              </div>
              <div className="text-xs text-gray-500 truncate max-w-full px-2 mt-0.5" title={email ?? ""}>
                {email}
              </div>
              <span className={`mt-2 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${
                accountType === "vendor"
                  ? "bg-blue-50 text-blue-600 border-blue-100"
                  : accountType === "soon_to_wed"
                  ? "bg-[#a68b6a]/5 text-[#a68b6a] border-[#a68b6a]/10"
                  : accountType === "editor"
                  ? "bg-purple-50 text-purple-600 border-purple-100"
                  : accountType === "superadmin"
                  ? "bg-rose-50 text-rose-600 border-rose-100"
                  : "bg-gray-50 text-gray-500 border-gray-100"
              }`}>
                {displayAccountType}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className={`
            group relative flex items-center justify-center w-12 h-12 rounded-full bg-white text-[#a68b6a] shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:bg-[#f5f5f5] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:scale-105 transition-all duration-300 border border-black/10 z-[101] overflow-hidden
            ${isExpanded ? "w-40 px-4 justify-start" : ""}
            ${isAnimating && isExpanded ? "animate-bounce-expand" : ""}
            ${isCollapsing ? "animate-bounce-collapse" : ""}
          `}
        >
          <span className={`text-[13px] font-extrabold uppercase tracking-wider text-[#a68b6a] select-none ${isExpanded ? "flex-shrink-0" : ""}`}>
            {initials}
          </span>
          {isExpanded && (
            <span className="ml-3 text-xs font-semibold text-gray-700 whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
              {expandedLabel}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
