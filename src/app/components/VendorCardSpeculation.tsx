"use client";

import { ReactNode } from "react";
import { useVendorSpeculation } from "@/hooks/useVendorSpeculation";

/**
 * VendorCardSpeculation - Wrapper for vendor cards with hover-based prerendering
 *
 * Wraps vendor cards to enable speculation rules on hover.
 * This works alongside the global speculation rules for more targeted prerendering.
 */
interface VendorCardSpeculationProps {
  vendorSlug: string;
  children: ReactNode;
  className?: string;
}

export default function VendorCardSpeculation({
  vendorSlug,
  children,
  className,
}: VendorCardSpeculationProps) {
  const { onMouseEnter, onMouseLeave } = useVendorSpeculation(vendorSlug);

  return (
    <div
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}
