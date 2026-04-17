"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import VendorCard from "../../features/vendors/components/VendorCard";
import type { VendorListItem } from "../../features/vendors/types";

type SortKey = "alpha" | "rating" | "newest" | "saves" | "views";

type Props = {
  initialVendors: VendorListItem[];
  total: number;
  pageSize: number;
  initialPage: number;
  sort: SortKey;
  query: {
    q: string;
    category: string;
    location: string;
    region: string;
    affiliation: string;
  };
};

function VendorCardSkeleton() {
  return (
    <div className="rounded-xl border border-black/5 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="h-28 w-full bg-black/5 animate-pulse" />
      <div className="relative px-4 pt-0 pb-4">
        <div className="relative -mt-10 mb-2 flex items-end justify-between">
          <div className="h-20 w-20 rounded-2xl border-4 border-white bg-black/5 shadow-lg overflow-hidden shrink-0 -ml-1" />
          <div className="h-3.5 w-14 bg-black/5 rounded animate-pulse" />
        </div>
        <div className="h-5 w-3/4 rounded bg-black/5 animate-pulse mb-2" />
        <div className="flex items-center gap-2">
          <div className="h-3 w-10 rounded bg-black/5 animate-pulse" />
          <div className="h-3 w-2 rounded bg-black/5 animate-pulse" />
          <div className="h-3 w-16 rounded bg-black/5 animate-pulse" />
          <div className="h-3 w-2 rounded bg-black/5 animate-pulse" />
          <div className="h-3 w-20 rounded bg-black/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function getCols(width: number) {
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

export default function VirtualizedVendorsList({
  initialVendors,
  total,
  pageSize,
  sort,
  query,
  initialPage,
}: Props) {
  const [vendors, setVendors] = useState<VendorListItem[]>(initialVendors);
  const [loadedPages, setLoadedPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const loadedPagesRef = useRef(1);
  const hasMoreRef = useRef(true);
  const vendorIdsRef = useRef(new Set(initialVendors.map((v) => v.id)));

  const [cols, setCols] = useState(() => (typeof window === "undefined" ? 3 : getCols(window.innerWidth)));

  useEffect(() => {
    const onResize = () => setCols(getCols(window.innerWidth));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setVendors(initialVendors);
    setLoadedPages(Math.max(1, initialPage));
    setLoading(false);
    setLoadError(null);
    loadingRef.current = false;
    vendorIdsRef.current = new Set(initialVendors.map((v) => v.id));
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [initialPage, initialVendors, total, pageSize, sort, query.q, query.category, query.location, query.region, query.affiliation]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasMore = loadedPages < totalPages;
  hasMoreRef.current = hasMore;
  loadedPagesRef.current = loadedPages;

  const loadNext = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setLoadError(null);

    try {
      const nextPage = loadedPagesRef.current + 1;
      const params = new URLSearchParams();
      if (query.q.trim()) params.set("q", query.q.trim());
      if (query.category) params.set("category", query.category);
      if (query.location.trim()) params.set("location", query.location.trim());
      if (query.region) params.set("region", query.region);
      if (query.affiliation) params.set("affiliation", query.affiliation);
      if (sort !== "rating") params.set("vendorsSort", sort);
      params.set("vendorsPage", String(nextPage));
      params.set("pageSize", String(pageSize));

      const res = await fetch(`/api/vendors?${params.toString()}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || `Request failed (${res.status})`);
      }

      const json = (await res.json()) as { vendors: VendorListItem[] };
      const newVendors = json.vendors ?? [];

      const uniqueNewVendors = newVendors.filter((v) => !vendorIdsRef.current.has(v.id));
      if (uniqueNewVendors.length > 0) {
        for (const v of uniqueNewVendors) {
          vendorIdsRef.current.add(v.id);
        }
        setVendors((prev) => [...prev, ...uniqueNewVendors]);
      }
      setLoadedPages(nextPage);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load more vendors");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [pageSize, query, sort]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMoreRef.current && !loadingRef.current) {
          void loadNext();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNext]);

  const rows: VendorListItem[][] = [];
  for (let i = 0; i < vendors.length; i += cols) {
    rows.push(vendors.slice(i, i + cols));
  }

  return (
    <section className="mt-16 sm:mt-20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Vendors</h2>
          <p className="mt-2 text-[13px] text-black/55 max-w-xl">Browse suppliers keep scrolling to load more.</p>
        </div>

        <div className="text-[12px] font-semibold text-black/45">
          Showing {Math.min(vendors.length, total)} of {total}
        </div>
      </div>

      {vendors.length === 0 ? (
        <div className="mt-8 rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
          <div className="text-[13px] font-semibold text-[#2c2c2c]">No vendors found</div>
          <div className="mt-1 text-[13px] text-black/55">Try changing filters or check back later.</div>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-4" />

      {loadError ? (
        <div className="py-6 text-center">
          <button type="button" className="text-[#6e4f33] hover:underline" onClick={() => void loadNext()}>
            Retry loading
          </button>
        </div>
      ) : loading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: pageSize }).map((_, i) => (
            <VendorCardSkeleton key={`loading-${i}`} />
          ))}
        </div>
      ) : hasMore ? (
        <div className="py-6 text-center text-[13px] font-semibold text-black/45">Scroll for more</div>
      ) : null}

      {loadError ? <div className="mt-4 text-[13px] font-semibold text-[#b42318]">{loadError}</div> : null}
    </section>
  );
}
