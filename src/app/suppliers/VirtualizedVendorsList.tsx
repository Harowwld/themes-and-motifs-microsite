"use client";

import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import VendorCard, { VendorCardSkeleton } from "../../features/vendors/components/VendorCard";
import type { VendorListItem } from "../../features/vendors/types";

type SortKey = "alpha" | "rating" | "newest" | "saves" | "views";

type Props = {
  initialVendors: VendorListItem[];
  initialPage: number;
  hasMore: boolean;
  limit: number;
  total: number;
  sort: SortKey;
  query: {
    q: string;
    category: string;
    location: string;
    region: string;
    affiliation: string;
    theme: string;
  };
};


type VendorsApiResponse = {
  vendors: VendorListItem[];
  nextPage: number | null;
  hasMore: boolean;
  total: number;
};

async function fetchVendors(
  query: Props["query"],
  sort: SortKey,
  page: number,
  limit: number
): Promise<VendorsApiResponse> {
  const params = new URLSearchParams();
  if (query.q.trim()) params.set("q", query.q.trim());
  if (query.category) params.set("category", query.category);
  if (query.location.trim()) params.set("location", query.location.trim());
  if (query.region) params.set("region", query.region);
  if (query.affiliation) params.set("affiliation", query.affiliation);
  if (query.theme) params.set("theme", query.theme);
  if (sort !== "rating") params.set("vendorsSort", sort);
  params.set("page", String(page));
  params.set("limit", String(limit));

  const res = await fetch(`/api/suppliers?${params.toString()}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export default function VirtualizedVendorsList({
  initialVendors,
  initialPage,
  hasMore: initialHasMore,
  limit,
  total,
  sort,
  query,
}: Props) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["vendors", { ...query, sort }],
    queryFn: ({ pageParam }) => fetchVendors(query, sort, pageParam, limit),
    initialPageParam: initialPage + 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextPage ?? undefined : undefined,
    initialData: {
      pages: [
        {
          vendors: initialVendors,
          nextPage: initialPage + 1,
          hasMore: initialHasMore,
          total,
        },
      ],
      pageParams: [initialPage],
    },
  });

  // Flatten all vendors from all pages and deduplicate by ID
  const allVendors = Array.from(
    new Map(
      (data?.pages.flatMap((page) => page.vendors) ?? []).map((v) => [v.id, v])
    ).values()
  );

  // Ref for intersection observer
  const parentRef = useRef<HTMLDivElement>(null);

  // Intersection observer for infinite scroll trigger
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          fetchNextPage();
        }
      },
      { rootMargin: "800px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <section className="mt-16 sm:mt-20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
            Suppliers
          </h2>
          <p className="mt-2 text-[13px] text-black/55 max-w-xl font-[family-name:var(--font-plus-jakarta)]">
            Browse suppliers — keep scrolling to load more.
          </p>
        </div>

        <div className="text-[12px] font-semibold text-black/45 font-[family-name:var(--font-plus-jakarta)]">
          Showing {allVendors.length} of {data?.pages[0]?.total ?? allVendors.length}
        </div>
      </div>

      {allVendors.length === 0 ? (
        <div className="mt-8 rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
          <div className="text-[13px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-plus-jakarta)]">
            No suppliers found
          </div>
          <div className="mt-1 text-[13px] text-black/55 font-[family-name:var(--font-plus-jakarta)]">
            Try changing filters or check back later.
          </div>
        </div>
      ) : (
        <div ref={parentRef} className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {allVendors.map((vendor, index) => (
            <div
              key={vendor.id}
              ref={index === allVendors.length - 5 ? sentinelRef : undefined}
            >
              <VendorCard vendor={vendor} />
            </div>
          ))}
        </div>
      )}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-4" />

      {/* Error state */}
      {isError && (
        <div className="py-6 text-center">
          <div className="text-[13px] font-semibold text-[#b42318] mb-3">
            {error instanceof Error ? error.message : "Failed to load suppliers"}
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-[#6e4f33] hover:underline font-[family-name:var(--font-plus-jakarta)]"
          >
            Retry loading
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {isFetchingNextPage && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <VendorCardSkeleton key={`loading-${i}`} />
          ))}
        </div>
      )}

      {/* Load more button fallback */}
      {hasNextPage && !isFetchingNextPage && !isError && (
        <div className="py-8 text-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            className="inline-flex items-center justify-center px-6 h-10 rounded-md bg-[#a68b6a] text-white text-sm font-medium hover:bg-[#957a5c] transition-colors shadow-sm"
          >
            Load more suppliers
          </button>
        </div>
      )}

      {/* End of results */}
      {!hasNextPage && allVendors.length > 0 && (
        <div className="py-8 text-center">
          <span className="text-[13px] text-black/45 font-[family-name:var(--font-plus-jakarta)]">
            You&apos;ve reached the end
          </span>
        </div>
      )}
    </section>
  );
}
