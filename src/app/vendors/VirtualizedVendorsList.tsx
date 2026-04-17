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
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [initialPage, initialVendors, total, pageSize, sort, query.q, query.category, query.location, query.region, query.affiliation]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasMore = loadedPages < totalPages;

  const loadNext = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    setLoadError(null);

    try {
      const nextPage = loadedPages + 1;
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

      setVendors((prev) => {
        const seen = new Set(prev.map((v) => v.id));
        const merged = [...prev];
        for (const v of newVendors) {
          if (!seen.has(v.id)) merged.push(v);
        }
        return merged;
      });
      setLoadedPages(nextPage);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load more vendors");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [loadedPages, hasMore, pageSize, query, sort]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingRef.current) {
          void loadNext();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadNext]);

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
      ) : loading || hasMore ? (
        <div className="py-6 text-center text-[13px] font-semibold text-black/45">Loading more...</div>
      ) : null}

      {loadError ? <div className="mt-4 text-[13px] font-semibold text-[#b42318]">{loadError}</div> : null}
    </section>
  );
}
