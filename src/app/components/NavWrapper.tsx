"use client";

import React from "react";
import { usePathname } from "next/navigation";
import SiteHeader from "../sections/SiteHeader";
import SiteFooter from "../sections/SiteFooter";

const HIDDEN_ROUTES = [
  "/admin",
  "/superadmin",
  "/editor",
  "/signin",
  "/signup",
  "/soon-to-wed/signin",
  "/soon-to-wed/signup",
  "/rsvp",
];

export default function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [inIframe, setInIframe] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.self !== window.top) {
      setInIframe(true);
    }
  }, []);

  // Check if current path should hide nav
  const shouldHideNav = HIDDEN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  ) || inIframe;

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
