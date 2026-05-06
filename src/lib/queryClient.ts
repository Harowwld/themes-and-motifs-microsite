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
      staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
      gcTime: 1000 * 60 * 30, // 30 minutes - keep in memory cache
      refetchOnWindowFocus: false, // Don't refetch when user returns to tab
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: false, // Use cached data on component mount if available
      retry: 2, // Retry failed requests twice
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
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
      const res = await fetch(`/api/vendors?slug=${encodeURIComponent(vendorSlug)}`);
      if (!res.ok) throw new Error("Failed to fetch vendor");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Preload vendors list data for instant search results
 */
export async function prefetchVendorsList() {
  await queryClient.prefetchQuery({
    queryKey: ["vendors", "list"],
    queryFn: async () => {
      const res = await fetch("/api/vendors");
      if (!res.ok) throw new Error("Failed to fetch vendors");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
}
