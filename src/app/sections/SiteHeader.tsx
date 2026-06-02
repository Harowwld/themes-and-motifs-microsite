"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";

import { createSupabaseBrowserClient } from "../../lib/supabaseBrowser";
import { authCache } from "../../lib/cache";

// Custom easings from emil-design-eng skill
const EASE_OUT = [0.23, 1, 0.32, 1] as [number, number, number, number];
const EASE_DRAWER = [0.32, 0.72, 0, 1] as [number, number, number, number];

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
    >
      <motion.line
        initial={{ x1: 3, y1: 6, x2: 21, y2: 6 }}
        animate={open ? { x1: 18, y1: 6, x2: 6, y2: 18 } : { x1: 3, y1: 6, x2: 21, y2: 6 }}
        transition={{ duration: 0.2, ease: EASE_OUT }}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <motion.line
        initial={{ x1: 3, y1: 12, x2: 21, y2: 12, opacity: 1 }}
        animate={open ? { x1: 12, y1: 12, x2: 12, y2: 12, opacity: 0 } : { x1: 3, y1: 12, x2: 21, y2: 12, opacity: 1 }}
        transition={{ duration: 0.2, ease: EASE_OUT }}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <motion.line
        initial={{ x1: 3, y1: 18, x2: 21, y2: 18 }}
        animate={open ? { x1: 18, y1: 18, x2: 6, y2: 6 } : { x1: 3, y1: 18, x2: 21, y2: 18 }}
        transition={{ duration: 0.2, ease: EASE_OUT }}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const NavLink = ({
  href,
  children,
  onClick,
  className = "",
  prefetch = true,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  prefetch?: boolean;
}) => {
  const pathname = usePathname();
  const cleanHref = href.split("?")[0];
  const isActive = cleanHref === "/"
    ? pathname === "/"
    : cleanHref === "/suppliers"
    ? pathname === "/suppliers" || (pathname.startsWith("/suppliers/") && !pathname.startsWith("/suppliers/plans"))
    : pathname === cleanHref || pathname.startsWith(cleanHref + "/");

  const isMobile = (className.includes("px-3") || className.includes("py-3")) && !className.includes("hidden");

  if (isMobile) {
    return (
      <motion.div whileTap={{ scale: 0.97 }} transition={{ duration: 0.15, ease: EASE_OUT }}>
        <Link
          href={href}
          onClick={onClick}
          prefetch={prefetch}
          className={`${className} transition-colors ${
            isActive
              ? "text-[#a68b6a] font-semibold bg-[#a68b6a]/5 border-l-2 border-[#a68b6a] pl-2.5"
              : "text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50"
          }`}
        >
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      whileTap={{ scale: 0.97 }} 
      transition={{ duration: 0.15, ease: EASE_OUT }}
      className={`relative py-1 flex flex-col items-center ${
        className.includes("hidden") ? "hidden sm:flex" : ""
      }`}
    >
      <Link
        href={href}
        onClick={onClick}
        prefetch={prefetch}
        className={`${className} transition-colors ${isActive ? "text-[#a68b6a] font-semibold" : "text-gray-500 hover:text-[#a68b6a]"}`}
      >
        {children}
      </Link>
      {isActive && (
        <motion.div
          layoutId="activeHeaderUnderline"
          className={`absolute h-[3px] bg-[#a68b6a] rounded-full ${
            className.includes("h-9") ? "-bottom-[8px]" : "-bottom-[16px]"
          }`}
          style={{ width: "24px" }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
    </motion.div>
  );
};

const NavButton = ({
  children,
  onClick,
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    transition={{ duration: 0.15, ease: EASE_OUT }}
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={className}
  >
    {children}
  </motion.button>
);

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
  const [mounted, setMounted] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const dashboardHref = useMemo(() => {
    if (isVendor) return "/vendor/dashboard";
    if (accountType === "superadmin") return "/superadmin";
    if (accountType === "editor") return "/editor/dashboard";
    return "/dashboard";
  }, [isVendor, accountType]);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      const target = e.target as Node;
      if (
        mobileMenuRef.current && !mobileMenuRef.current.contains(target) &&
        menuButtonRef.current && !menuButtonRef.current.contains(target)
      ) {
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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -4 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT } },
  };

  return (
    <header className="sticky top-0 z-50 inset-x-0 backdrop-blur-md bg-white/90 supports-backdrop-filter:bg-white/90 border-b border-gray-100">
      <div className="mx-auto h-16 flex items-center justify-between sm:grid sm:grid-cols-[20%_60%_20%] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="flex items-center justify-start"
        >
          <Link
            className="flex items-center"
            href="/"
            aria-label="Themes & Motifs"
            prefetch={true}
          >
            <img
              src="https://themesnmotifs.com/wp-content/uploads/elementor/thumbs/T_M-Logo-1-qzxx62xvcaywvxz23bwwe4nm1tu4exw9i42ghzw8g6.png"
              alt="Themes & Motifs"
              className="h-7 sm:h-8 w-auto"
              loading="eager"
              referrerPolicy="no-referrer"
            />
          </Link>
        </motion.div>

        <motion.nav
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="hidden sm:flex items-center justify-center gap-8 text-[13px] font-medium text-gray-500 font-[family-name:var(--font-plus-jakarta)]"
        >
          <motion.div variants={itemVariants}>
            <NavLink className="hover:text-[#a68b6a] transition-colors" href="/?home=true">
              Home
            </NavLink>
          </motion.div>

          <motion.div variants={itemVariants}>
            <NavLink className="hover:text-[#a68b6a] transition-colors" href="/suppliers">
              Suppliers
            </NavLink>
          </motion.div>

          <motion.div variants={itemVariants}>
            <NavLink className="hover:text-[#a68b6a] transition-colors" href="/about-us">
              About us
            </NavLink>
          </motion.div>

          <motion.div variants={itemVariants}>
            <NavLink className="hover:text-[#a68b6a] transition-colors" href="/contact-us">
              Contact us
            </NavLink>
          </motion.div>

          {/* For suppliers - do not render for logged in couples */}
          {mounted && (!signedIn || !isSoonToWed) && (
            <motion.div variants={itemVariants}>
              <NavLink className="hover:text-[#a68b6a] transition-colors" href="/suppliers/plans">
                For suppliers
              </NavLink>
            </motion.div>
          )}

          {/* Moments for couples (Dashboard is in the floating profile widget) */}
          {mounted && signedIn && isSoonToWed && !isVendor && (
            <motion.div variants={itemVariants}>
              <NavLink className="hover:text-[#a68b6a] transition-colors" href="/moments">
                Couples
              </NavLink>
            </motion.div>
          )}

          {/* Public Moments for non-couples */}
          {mounted && (!signedIn || isVendor) ? (
            <motion.div variants={itemVariants}>
              <NavLink className="hover:text-[#a68b6a] transition-colors" href="/moments">
                Couples
              </NavLink>
            </motion.div>
          ) : null}
        </motion.nav>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="flex items-center justify-end gap-3"
        >
          {/* Desktop nav items - Left side for Sign in */}
          {mounted && !signedIn && (
            <NavLink
              className="hidden sm:inline-flex h-9 items-center justify-center px-3 rounded-md text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors font-[family-name:var(--font-plus-jakarta)]"
              href="/soon-to-wed/signin"
              prefetch={false}
            >
              Sign in
            </NavLink>
          )}

          {/* Desktop nav items - Right side */}
          {mounted && signedIn && (
            <>
              <NavLink
                className="hidden sm:inline-flex h-9 items-center justify-center px-3 rounded-md text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors font-[family-name:var(--font-plus-jakarta)]"
                href={dashboardHref}
              >
                Dashboard
              </NavLink>
              <NavButton
                disabled={signingOut}
                onClick={() => void signOut()}
                className="hidden sm:inline-flex h-9 items-center justify-center px-3 rounded-md text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-60 font-[family-name:var(--font-plus-jakarta)]"
              >
                {signingOut ? "Signing out.." : "Sign out"}
              </NavButton>
            </>
          )}

          {/* Mobile menu button */}
          <motion.button
            ref={menuButtonRef}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="sm:hidden h-10 w-10 inline-flex items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <MenuIcon open={mobileMenuOpen} />
          </motion.button>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: EASE_DRAWER }}
            className="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg overflow-hidden"
          >
            <nav className="px-4 py-4 space-y-1">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05, duration: 0.3, ease: EASE_OUT }}
              >
                <NavLink
                  className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors"
                  href="/?home=true"
                >
                  Home
                </NavLink>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3, ease: EASE_OUT }}
              >
                <NavLink
                  className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors"
                  href="/suppliers"
                >
                  Discover
                </NavLink>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.3, ease: EASE_OUT }}
              >
                <NavLink
                  className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors"
                  href="/#featured"
                  onClick={(e) => {
                    e.preventDefault();
                    goToHomeSection("featured");
                  }}
                >
                  Featured
                </NavLink>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3, ease: EASE_OUT }}
              >
                <NavLink
                  className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors"
                  href="/suppliers/plans"
                >
                  For suppliers
                </NavLink>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22, duration: 0.3, ease: EASE_OUT }}
              >
                <NavLink
                  className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors"
                  href="/about-us"
                >
                  About us
                </NavLink>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.24, duration: 0.3, ease: EASE_OUT }}
              >
                <NavLink
                  className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors"
                  href="/contact-us"
                >
                  Contact us
                </NavLink>
              </motion.div>

              {/* Dashboard for all signed-in users */}
              {mounted && signedIn && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25, duration: 0.3, ease: EASE_OUT }}
                >
                  <NavLink
                    className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors"
                    href={dashboardHref}
                  >
                    Dashboard
                  </NavLink>
                </motion.div>
              )}

              {/* Moments / Couples tab for couples specifically */}
              {mounted && signedIn && isSoonToWed && !isVendor && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.3, ease: EASE_OUT }}
                >
                  <NavLink
                    className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors"
                    href="/moments"
                  >
                    Couples
                  </NavLink>
                </motion.div>
              )}

              {/* Public Moments for non-couples */}
              {mounted && (!signedIn || isVendor) ? (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25, duration: 0.3, ease: EASE_OUT }}
                >
                  <NavLink
                    className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors"
                    href="/moments"
                  >
                    Couples
                  </NavLink>
                </motion.div>
              ) : null}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="border-t border-gray-100 my-2"
              />

              {/* Account info in mobile menu */}
              {mounted && signedIn && email && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3, ease: EASE_OUT }}
                  className="flex items-center gap-2 px-3 py-3 rounded-md bg-gray-50 border border-gray-200"
                >
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
                        ? "bg-[#fff1f3] text-[#b42318] border border-[#b42318]/20"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}>
                      {accountType === "soon_to_wed" ? "Couple" : accountType.charAt(0).toUpperCase() + accountType.slice(1)}
                    </span>
                  )}
                </motion.div>
              )}

              {/* Sign out or Start Searching */}
              {mounted && signedIn ? (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45, duration: 0.3, ease: EASE_OUT }}
                >
                  <NavButton
                    disabled={signingOut}
                    onClick={() => void signOut()}
                    className="w-full flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors disabled:opacity-60 text-left"
                  >
                    {signingOut ? "Signing out…" : "Sign out"}
                  </NavButton>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45, duration: 0.3, ease: EASE_OUT }}
                >
                  <NavLink
                    className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-[#a68b6a] hover:text-[#957a5c] hover:bg-gray-50 transition-colors"
                    href="/suppliers"
                  >
                    Start Searching
                  </NavLink>
                </motion.div>
              )}

              {mounted && !signedIn ? (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.3, ease: EASE_OUT }}
                >
                  <NavLink
                    className="flex items-center px-3 py-3 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#a68b6a] hover:bg-gray-50 transition-colors"
                    href="/soon-to-wed/signin"
                    prefetch={false}
                  >
                    Sign in
                  </NavLink>
                </motion.div>
              ) : null}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.4, ease: EASE_DRAWER }}
              >
                <Link
                  className="flex items-center justify-center mt-3 px-3 py-3 rounded-md bg-[#a68b6a] text-white text-[14px] font-medium hover:bg-[#957a5c] transition-colors shadow-sm"
                  href="/suppliers"
                  prefetch={true}
                >
                  Start searching
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
