"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "../sections/SiteHeader";
import SiteFooter from "../sections/SiteFooter";

const HIDDEN_ROUTES = [
  "/admin",
  "/superadmin",
  "/editor",
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/soon-to-wed/signin",
  "/soon-to-wed/signup",
];

export default function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if current path should hide nav
  const shouldHideNav = HIDDEN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (shouldHideNav) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
