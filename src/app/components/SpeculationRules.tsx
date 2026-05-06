"use client";

import { useEffect, useState } from "react";

/**
 * SpeculationRules - Site-wide prerendering for instant navigation
 *
 * Implements the gold standard Speculation Rules API with:
 * - `prerender`: Full page rendering before click (not just prefetch)
 * - `eagerness: "moderate"`: Triggers on hover (sweet spot for performance)
 *
 * Browser support:
 * - Chrome 109+: Full prerender support
 * - Safari/Firefox: Falls back to instant.page (see layout.tsx)
 *
 * Zero JavaScript overhead - browser handles everything declaratively.
 */
export default function SpeculationRules() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render on client to avoid SSR issues with script injection
  if (!isClient) return null;

  const speculationRules = {
    prerender: [
      {
        source: "document",
        eagerness: "moderate",
      },
    ],
  };

  return (
    <script
      type="speculationrules"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(speculationRules),
      }}
    />
  );
}
