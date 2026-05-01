"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "../../lib/supabaseBrowser";
import { authCache } from "../../lib/cache";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform duration-200"
    >
      {open ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </>
      )}
    </svg>
  );
}

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const meCacheRef = useRef<{ token: string; at: number; isVendor: boolean; isSoonToWed: boolean; email: string | null; accountType: string | null } | null>(null);
  const meInFlightRef = useRef<Promise<{ isVendor: boolean; isSoonToWed: boolean; email: string | null; accountType: string | null } | null> | null>(null);

  // Try to get cached auth state immediately for instant UI
  const cachedAuth = useMemo(() => authCache.get(), []);
  const [signedIn, setSignedIn] = useState(cachedAuth?.signedIn ?? false);
  const [isVendor, setIsVendor] = useState(cachedAuth?.isVendor ?? false);
  const [isSoonToWed, setIsSoonToWed] = useState(cachedAuth?.isSoonToWed ?? false);
  const [email, setEmail] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const { data } = await supabase.auth.getSession();
      const session = data.session ?? null;
      const newSignedIn = Boolean(session?.user);

      if (cancelled) return;

      setSignedIn(newSignedIn);

      if (!session?.access_token) {
        setIsVendor(false);
        setIsSoonToWed(false);
        setEmail(null);
        setAccountType(null);
        authCache.clear();
        return;
      }

      const token = session.access_token;
      const now = Date.now();
      const cached = meCacheRef.current;
      const ttlMs = 30_000;
      if (cached && cached.token === token && now - cached.at < ttlMs) {
        setIsVendor(cached.isVendor);
        setIsSoonToWed(cached.isSoonToWed);
        authCache.set(newSignedIn, cached.isVendor, cached.isSoonToWed);
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
            const json = (await res.json().catch(() => null)) as { isVendor?: boolean; isSoonToWed?: boolean; email?: string | null; accountType?: string | null } | null;
            return {
              isVendor: Boolean(json?.isVendor),
              isSoonToWed: Boolean(json?.isSoonToWed),
              email: json?.email ?? null,
              accountType: json?.accountType ?? null,
            };
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
        meCacheRef.current = { token, at: Date.now(), isVendor: me.isVendor, isSoonToWed: me.isSoonToWed, email: me.email, accountType: me.accountType };
        authCache.set(newSignedIn, me.isVendor, me.isSoonToWed);
        if (!cancelled) {
          setIsVendor(me.isVendor);
          setIsSoonToWed(me.isSoonToWed);
          setEmail(me.email);
          setAccountType(me.accountType);
        }
      } catch {
        if (!cancelled) {
          setIsVendor(false);
          setIsSoonToWed(false);
          setEmail(null);
          setAccountType(null);
          authCache.set(newSignedIn, false, false);
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
      setMobileMenuOpen(false);
      router.push("/", { scroll: false });
    }
  };

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 inset-x-0 backdrop-blur-md bg-white/90 supports-backdrop-filter:bg-white/90">
      <div className="mx-auto h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
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
            className="h-7 sm:h-8 w-auto"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </a>

        <nav className="hidden sm:flex items-center gap-8 text-[13px] font-medium text-gray-500 font-[family-name:var(--font-plus-jakarta)]">
          <a
            className="hover:text-[#a68b6a] transition-colors"
            href="/vendors"
            onClick={(e) => {
              e.preventDefault();
              router.push("/vendors");
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
          
          {/* Dashboard and Moments for couples */}
          {signedIn && isSoonToWed && !isVendor && (
            <>
              <a
                className="hover:text-[#a68b6a] transition-colors"
                href="/dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/dashboard", { scroll: false });
                }}
              >
                My Wedding
              </a>
              <a
                className="hover:text-[#a68b6a] transition-colors"
                href="/moments"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/moments", { scroll: false });
                }}
              >
                Moments
              </a>
            </>
          )}
          
          {/* Dashboard for vendors */}
          {isVendor && (
            <a
              className="hover:text-[#a68b6a] transition-colors"
              href="/vendor/dashboard"
              onClick={(e) => {
                e.preventDefault();
                router.push("/vendor/dashboard", { scroll: false });
              }}
            >
              Dashboard
            </a>
          )}
          
          {/* Public Moments for non-couples */}
          {!signedIn || isVendor ? (
            <a
              className="hover:text-[#a68b6a] transition-colors"
              href="/moments"
              onClick={(e) => {
                e.preventDefault();
                router.push("/moments", { scroll: false });
              }}
            >
              Wedding Moments
            </a>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          {/* Desktop nav items - Left side for Sign in */}
          {!signedIn && (
            <a
              className="hidden sm:inline-flex h-9 items-center justify-center px-3 rounded-md text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors font-[family-name:var(--font-plus-jakarta)]"
              href="/soon-to-wed/signin"
            >
              Sign in
            </a>
          )}

          {/* Desktop nav items - Right side */}
          {signedIn && (
            <button
              type="button"
              disabled={signingOut}
              onClick={() => void signOut()}
              className="hidden sm:inline-flex h-9 items-center justify-center px-3 rounded-md text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-60 font-[family-name:var(--font-plus-jakarta)]"
            >
              {signingOut ? "Signing out.." : "Sign out"}
            </button>
          )}

          {/* Account info for signed in users */}
          {signedIn && email && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 border border-gray-200">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[12px] text-gray-600 font-medium max-w-[120px] truncate" title={email}>
                {email}
              </span>
              {accountType && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  accountType === "vendor"
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : accountType === "couple"
                    ? "bg-[#a68b6a]/10 text-[#a68b6a] border border-[#a68b6a]/20"
                    : accountType === "editor"
                    ? "bg-purple-50 text-purple-600 border border-purple-200"
                    : accountType === "superadmin"
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-gray-100 text-gray-600 border border-gray-200"
                }`}>
                  {accountType === "soon_to_wed" ? "Couple" : accountType.charAt(0).toUpperCase() + accountType.slice(1)}
                </span>
              )}
            </div>
          )}

          <a
            href="/vendors"
            className="hidden sm:inline-flex h-9 items-center justify-center px-4 rounded-md bg-[#a68b6a] text-white text-[13px] font-medium hover:bg-[#957a5c] transition-colors font-[family-name:var(--font-plus-jakarta)]"
            onClick={(e) => {
              e.preventDefault();
              router.push("/vendors");
            }}
          >
            Start Searching
          </a>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="sm:hidden h-10 w-10 inline-flex items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <MenuIcon open={mobileMenuOpen} />
          </button>

                  </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg animate-fade-in"
        >
          <nav className="px-4 py-4 space-y-1">
            <a
              className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors"
              href="/vendors"
              onClick={(e) => {
                e.preventDefault();
                router.push("/vendors");
              }}
            >
              Discover
            </a>
            <a
              className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors"
              href="/#featured"
              onClick={(e) => {
                e.preventDefault();
                goToHomeSection("featured");
              }}
            >
              Featured
            </a>
            <a
              className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors"
              href="/vendors/plans"
            >
              For vendors
            </a>
            
            {/* Dashboard and Moments for couples */}
            {signedIn && isSoonToWed && !isVendor && (
              <>
                <a
                  className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors"
                  href="/dashboard"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/dashboard", { scroll: false });
                  }}
                >
                  My Wedding
                </a>
                <a
                  className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors"
                  href="/moments"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/moments", { scroll: false });
                  }}
                >
                  Moments
                </a>
              </>
            )}
            
            {/* Dashboard for vendors */}
            {isVendor && (
              <a
                className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors"
                href="/vendor/dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/vendor/dashboard", { scroll: false });
                }}
              >
                Dashboard
              </a>
            )}
            
            {/* Public Moments for non-couples */}
            {!signedIn || isVendor ? (
              <a
                className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors"
                href="/moments"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/moments", { scroll: false });
                }}
              >
                Wedding Moments
              </a>
            ) : null}

            <div className="border-t border-gray-100 my-2" />

            {/* Account info in mobile menu */}
            {signedIn && email && (
              <div className="flex items-center gap-2 px-3 py-3 rounded-md bg-gray-50 border border-gray-200">
                <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-[13px] text-gray-600 font-medium truncate flex-1" title={email}>
                  {email}
                </span>
                {accountType && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    accountType === "vendor"
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : accountType === "couple"
                      ? "bg-[#a68b6a]/10 text-[#a68b6a] border border-[#a68b6a]/20"
                      : accountType === "editor"
                      ? "bg-purple-50 text-purple-600 border border-purple-200"
                      : accountType === "superadmin"
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}>
                    {accountType === "soon_to_wed" ? "Couple" : accountType.charAt(0).toUpperCase() + accountType.slice(1)}
                  </span>
                )}
              </div>
            )}

            {/* Sign out or Start Searching */}
            {signedIn ? (
              <button
                type="button"
                disabled={signingOut}
                onClick={() => void signOut()}
                className="w-full flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors disabled:opacity-60 text-left"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            ) : (
              <a
                className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-[#a68b6a] hover:text-[#957a5c] hover:bg-gray-50 transition-colors"
                href="/vendors"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/vendors");
                }}
              >
                Start Searching
              </a>
            )}

            {!signedIn ? (
              <a
                className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors"
                href="/soon-to-wed/signin"
              >
                Sign in
              </a>
            ) : null}

            <a
              className="flex items-center justify-center mt-3 px-3 py-3 rounded-md bg-[#a68b6a] text-white text-[14px] font-medium hover:bg-[#957a5c] transition-colors"
              href="/vendors"
              onClick={(e) => {
                e.preventDefault();
                router.push("/vendors");
              }}
            >
              Start searching
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
