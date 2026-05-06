"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * PageCacheProvider - Manages page-level caching behavior
 *
 * This component:
 * 1. Tracks visited pages for smart prefetching
 * 2. Manages cache warming for frequently accessed content
 * 3. Handles cache invalidation on route changes
 */
export default function PageCacheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    // Track visited pages in session storage
    // This helps identify which pages to keep warm in cache
    const visitedPages = JSON.parse(sessionStorage.getItem("visitedPages") || "[]");
    if (!visitedPages.includes(pathname)) {
      visitedPages.push(pathname);
      // Keep only last 20 pages
      if (visitedPages.length > 20) {
        visitedPages.shift();
      }
      sessionStorage.setItem("visitedPages", JSON.stringify(visitedPages));
    }

    // Preload common assets for frequently visited page types
    if (pathname.startsWith("/vendors/")) {
      // Preload vendor detail assets if user is browsing vendors
      preloadVendorAssets();
    }
  }, [pathname]);

  return <>{children}</>;
}

/**
 * Preload common assets for vendor pages
 */
function preloadVendorAssets() {
  // Use requestIdleCallback to preload during browser idle time
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      // Preload common vendor detail images/styles
      const preloadLinks = [
        { rel: "prefetch", href: "/Icons/hd-blue-badge-verified-tick-mark-png-704081694710438adyvtbqafw.png" },
      ];

      preloadLinks.forEach(({ rel, href }) => {
        const link = document.createElement("link");
        link.rel = rel;
        link.href = href;
        document.head.appendChild(link);
      });
    });
  }
}

/**
 * Get list of frequently visited pages from cache
 */
export function getFrequentlyVisitedPages(): string[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(sessionStorage.getItem("visitedPages") || "[]");
}

/**
 * Check if a page has been visited in this session
 */
export function hasVisitedPage(pathname: string): boolean {
  if (typeof window === "undefined") return false;
  const visited = JSON.parse(sessionStorage.getItem("visitedPages") || "[]");
  return visited.includes(pathname);
}
