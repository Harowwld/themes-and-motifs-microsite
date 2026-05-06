"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * useSmartPrefetch - Intelligent data prefetching based on user behavior
 *
 * Features:
 * - Prefetch data when user hovers over links
 * - Cache warming for related content
 * - Priority-based prefetching (frequently accessed first)
 */
export function useSmartPrefetch() {
  const queryClient = useQueryClient();

  /**
   * Prefetch vendor data for instant navigation
   */
  const prefetchVendor = useCallback(
    async (vendorSlug: string) => {
      // Don't prefetch if already in cache
      if (queryClient.getQueryData(["vendor", vendorSlug])) {
        return;
      }

      // Prefetch with low priority (doesn't block main thread)
      await queryClient.prefetchQuery({
        queryKey: ["vendor", vendorSlug],
        queryFn: async () => {
          const res = await fetch(`/api/vendors?slug=${encodeURIComponent(vendorSlug)}`, {
            priority: "low",
          });
          if (!res.ok) throw new Error("Failed to fetch vendor");
          return res.json();
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
    },
    [queryClient]
  );

  /**
   * Prefetch vendors list with filters
   */
  const prefetchVendorsList = useCallback(
    async (filters?: { category?: string; location?: string }) => {
      const cacheKey = ["vendors", "list", filters || {}];

      if (queryClient.getQueryData(cacheKey)) {
        return;
      }

      const params = new URLSearchParams();
      if (filters?.category) params.set("category", filters.category);
      if (filters?.location) params.set("location", filters.location);

      await queryClient.prefetchQuery({
        queryKey: cacheKey,
        queryFn: async () => {
          const res = await fetch(`/api/vendors?${params.toString()}`, {
            priority: "low",
          });
          if (!res.ok) throw new Error("Failed to fetch vendors");
          return res.json();
        },
        staleTime: 1000 * 60 * 5,
      });
    },
    [queryClient]
  );

  /**
   * Prefetch moments data
   */
  const prefetchMoments = useCallback(async () => {
    if (queryClient.getQueryData(["moments"])) {
      return;
    }

    await queryClient.prefetchQuery({
      queryKey: ["moments"],
      queryFn: async () => {
        const res = await fetch("/api/moments", { priority: "low" });
        if (!res.ok) throw new Error("Failed to fetch moments");
        return res.json();
      },
      staleTime: 1000 * 60 * 5,
    });
  }, [queryClient]);

  /**
   * Warm cache for frequently accessed pages
   * Call this during idle time
   */
  const warmCache = useCallback(async () => {
    // Use requestIdleCallback if available
    const scheduleWork =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? window.requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 1);

    scheduleWork(() => {
      // Prefetch common data in priority order
      // Don't await - let them run in parallel
      prefetchVendorsList().catch(() => {
        // Silently fail - prefetching is best-effort
      });
    });
  }, [prefetchVendorsList]);

  return {
    prefetchVendor,
    prefetchVendorsList,
    prefetchMoments,
    warmCache,
  };
}

/**
 * Prefetch data on link hover
 * Usage: onMouseEnter={() => prefetchOnHover(() => prefetchVendor(slug))}
 */
export function prefetchOnHover(prefetchFn: () => Promise<void>, delayMs = 100) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return {
    onMouseEnter: () => {
      // Delay prefetch to avoid unnecessary requests on quick mouse passes
      timeoutId = setTimeout(() => {
        prefetchFn().catch(() => {
          // Silently fail - prefetching is best-effort
        });
      }, delayMs);
    },
    onMouseLeave: () => {
      // Cancel prefetch if user moves away quickly
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
  };
}
