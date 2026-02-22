"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function VendorsScrollToResults() {
  const sp = useSearchParams();

  useEffect(() => {
    if (!sp) return;
    if (sp.get("scroll") !== "results") return;

    const el = document.getElementById("vendors-results");
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [sp]);

  return null;
}
