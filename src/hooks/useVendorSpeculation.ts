"use client";

import { useCallback, useRef } from "react";

/**
 * useVendorSpeculation - Targeted prerendering for vendor detail pages
 *
 * Injects dynamic speculation rules when hovering over vendor cards.
 * This provides more granular control than the global document speculation.
 *
 * Usage:
 * ```tsx
 * const { onMouseEnter, onMouseLeave } = useVendorSpeculation(vendorSlug);
 * <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>...</div>
 * ```
 */
export function useVendorSpeculation(vendorSlug: string) {
  const ruleIdRef = useRef<string | null>(null);

  const onMouseEnter = useCallback(() => {
    // Only run in Chrome with speculation rules support
    if (typeof document === "undefined") return;
    if (!("speculationRules" in document)) return;

    const ruleId = `vendor-${vendorSlug}`;
    ruleIdRef.current = ruleId;

    // Check if rule already exists
    const existingScript = document.getElementById(ruleId);
    if (existingScript) return;

    // Create dynamic speculation rule for this vendor
    const script = document.createElement("script");
    script.type = "speculationrules";
    script.id = ruleId;

    const rules = {
      prerender: [
        {
          source: "list",
          urls: [`/vendors/${encodeURIComponent(vendorSlug)}`],
          eagerness: "immediate",
        },
      ],
    };

    script.textContent = JSON.stringify(rules);
    document.head.appendChild(script);
  }, [vendorSlug]);

  const onMouseLeave = useCallback(() => {
    // Optional: Could clean up rules here, but keeping them is fine
    // as the browser will manage memory automatically
  }, []);

  return { onMouseEnter, onMouseLeave };
}
