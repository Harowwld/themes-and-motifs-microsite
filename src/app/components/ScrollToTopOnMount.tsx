"use client";

import { useEffect } from "react";

export default function ScrollToTopOnMount() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Preserve hash-based navigation like /#discover.
    if (window.location.hash) return;

    // Prevent the browser from restoring scroll position on refresh/back.
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {
      // ignore
    }

    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, []);

  return null;
}
