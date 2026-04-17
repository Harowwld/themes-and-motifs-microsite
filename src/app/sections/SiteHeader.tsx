"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "../../lib/supabaseBrowser";

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const meCacheRef = useRef<{ token: string; at: number; isVendor: boolean; isSoonToWed: boolean } | null>(null);
  const meInFlightRef = useRef<Promise<{ isVendor: boolean; isSoonToWed: boolean } | null> | null>(null);

  const [signedIn, setSignedIn] = useState(false);
  const [isVendor, setIsVendor] = useState(false);
  const [isSoonToWed, setIsSoonToWed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const { data } = await supabase.auth.getSession();
      const session = data.session ?? null;

      if (cancelled) return;

      setSignedIn(Boolean(session?.user));

      if (!session?.access_token) {
        setIsVendor(false);
        setIsSoonToWed(false);
        return;
      }

      const token = session.access_token;
      const now = Date.now();
      const cached = meCacheRef.current;
      const ttlMs = 30_000;
      if (cached && cached.token === token && now - cached.at < ttlMs) {
        setIsVendor(cached.isVendor);
        setIsSoonToWed(cached.isSoonToWed);
        return;
      }

      if (!meInFlightRef.current) {
        meInFlightRef.current = (async () => {
          try {
            const res = await fetch("/api/auth/me", {
              headers: {
                authorization: `Bearer ${token}`,
              },
            });
            const json = (await res.json().catch(() => null)) as { isVendor?: boolean; isSoonToWed?: boolean } | null;
            return { isVendor: Boolean(json?.isVendor), isSoonToWed: Boolean(json?.isSoonToWed) };
          } catch {
            return null;
          }
        })().finally(() => {
          meInFlightRef.current = null;
        });
      }

      try {
        const me = await meInFlightRef.current;
        if (!me) throw new Error("me fetch failed");
        meCacheRef.current = { token, at: Date.now(), isVendor: me.isVendor, isSoonToWed: me.isSoonToWed };
        if (!cancelled) {
          setIsVendor(me.isVendor);
          setIsSoonToWed(me.isSoonToWed);
        }
      } catch {
        if (!cancelled) {
          setIsVendor(false);
          setIsSoonToWed(false);
        }
      }
    }

    void refresh();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const goToHomeSection = (id: string) => {
    if (pathname === "/") {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }

    router.push(`/#${id}`);
  };

  const signOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setSigningOut(false);
      router.push("/", { scroll: false });
    }
  };

  return (
    <header className="sticky top-0 z-50 inset-x-0 backdrop-blur-md bg-white/90 supports-backdrop-filter:bg-white/90">
      <div className="mx-auto max-w-6xl h-16 flex items-center justify-between">
        <a
          className="flex items-center"
          href="/"
          aria-label="Themes & Motifs"
          onClick={(e) => {
            e.preventDefault();
            router.push("/", { scroll: false });
          }}
        >
          <img
            src="https://themesnmotifs.com/wp-content/uploads/elementor/thumbs/T_M-Logo-1-qzxx62xvcaywvxz23bwwe4nm1tu4exw9i42ghzw8g6.png"
            alt="Themes & Motifs"
            className="h-8 w-auto"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </a>

        <nav className="hidden sm:flex items-center gap-8 text-[13px] font-medium text-gray-500">
          <a
            className="hover:text-[#a68b6a] transition-colors"
            href="/#discover"
            onClick={(e) => {
              e.preventDefault();
              goToHomeSection("discover");
            }}
          >
            Discover
          </a>
          <a
            className="hover:text-[#a68b6a] transition-colors"
            href="/#featured"
            onClick={(e) => {
              e.preventDefault();
              goToHomeSection("featured");
            }}
          >
            Featured
          </a>
          <a
            className="hover:text-[#a68b6a] transition-colors"
            href="/vendors/plans"
          >
            For vendors
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {isVendor ? (
            <>
              <a
                className="hidden sm:inline-flex h-9 items-center justify-center px-3 rounded-md text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
                href="/vendor/dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/vendor/dashboard", { scroll: false });
                }}
              >
                Dashboard
              </a>
              <button
                type="button"
                disabled={signingOut}
                onClick={() => void signOut()}
                className="hidden sm:inline-flex h-9 items-center justify-center px-3 rounded-md text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-60"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </>
          ) : null}

          {signedIn && isSoonToWed && !isVendor ? (
            <button
              type="button"
              disabled={signingOut}
              onClick={() => void signOut()}
              className="hidden sm:inline-flex h-9 items-center justify-center px-3 rounded-md text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-60"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          ) : null}

          {!signedIn ? (
            <a
              className="hidden sm:inline-flex h-9 items-center justify-center px-3 rounded-md text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
              href="/soon-to-wed/signin"
            >
              Sign in
            </a>
          ) : null}
          <a
            className="h-9 inline-flex items-center justify-center px-3.5 rounded-md bg-[#a68b6a] text-white text-[13px] font-medium hover:bg-[#957a5c] transition-colors"
            href="/vendors"
            onClick={(e) => {
              e.preventDefault();
              router.push("/vendors");
            }}
          >
            Start searching
          </a>
        </div>
      </div>
    </header>
  );
}
