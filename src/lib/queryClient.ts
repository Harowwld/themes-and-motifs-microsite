import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";

/**
 * Enhanced QueryClient with aggressive caching for previously loaded content
 *
 * Cache Strategy:
 * - staleTime: 5 minutes (data considered fresh)
 * - gcTime: 30 minutes (keep in memory even when inactive)
 * - refetchOnWindowFocus: false (don't refetch when tab regains focus)
 * - refetchOnReconnect: true (refetch when network reconnects)
 * - retry: 2 (retry failed requests twice)
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error(`Query error [${query.queryKey}]:`, error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      console.error(`Mutation error [${mutation.options.mutationKey}]:`, error);
    },
  }),
  defaultOptions: {
    queries: {
      // 10 minutes — most data is stable enough to avoid unnecessary refetches
      staleTime: 1000 * 60 * 10,
      // 60 minutes — keep inactive queries in memory across tab switches
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false, // Don't refetch when user returns to tab
      refetchOnReconnect: true,    // Refetch when network reconnects
      refetchOnMount: false,       // Use cached data on component mount if available
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Prefetch helper for preloading data before navigation
 * Use this with speculation rules for instant page transitions
 */
export async function prefetchVendorData(vendorSlug: string) {
  await queryClient.prefetchQuery({
    queryKey: ["vendor", vendorSlug],
    queryFn: async () => {
      const res = await fetch(`/api/suppliers?slug=${encodeURIComponent(vendorSlug)}`);
      if (!res.ok) throw new Error("Failed to fetch vendor");
      return res.json();
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Preload vendors list data for instant search results
 */
export async function prefetchVendorsList() {
  await queryClient.prefetchQuery({
    queryKey: ["vendors", "list"],
    queryFn: async () => {
      const res = await fetch("/api/suppliers");
      if (!res.ok) throw new Error("Failed to fetch vendors");
      return res.json();
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Preload categories for instant filter/hero rendering
 * Call this on app mount or before navigating to search
 */
export async function prefetchCategories() {
  await queryClient.prefetchQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/suppliers?limit=1"); // categories come from SSR, but keep client copy fresh
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    // Categories are very stable — 30 minute staleTime
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Preload featured vendors for instant landing page display
 * Call on hover of the home nav link to warm the cache before navigation
 */
export async function prefetchFeaturedVendors() {
  await queryClient.prefetchQuery({
    queryKey: ["vendors", "featured"],
    queryFn: async () => {
      const res = await fetch("/api/suppliers?limit=6");
      if (!res.ok) throw new Error("Failed to fetch featured vendors");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
}
