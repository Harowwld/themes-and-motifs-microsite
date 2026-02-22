"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useSearchParams } from "next/navigation";
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

const ROW_GAP_PX = 16;
const ROW_HEIGHT_PX = 200;
const ROW_SLOT_PX = ROW_HEIGHT_PX + ROW_GAP_PX;

export default function VirtualizedVendorsList({
  initialVendors,
  total,
  pageSize,
  sort,
  query,
  initialPage,
}: Props) {
  const sp = useSearchParams();
  const [vendors, setVendors] = useState<VendorListItem[]>(initialVendors);
  const [loadedPages, setLoadedPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

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
    if (sp?.get("scroll") === "results") {
      rowVirtualizer.scrollToIndex(0, { align: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialPage,
    initialVendors,
    total,
    pageSize,
    sort,
    query.q,
    query.category,
    query.location,
    query.region,
    query.affiliation,
    sp,
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasMore = loadedPages < totalPages;

  const rows = useMemo(() => {
    const out: VendorListItem[][] = [];
    for (let i = 0; i < vendors.length; i += cols) out.push(vendors.slice(i, i + cols));
    return out;
  }, [vendors, cols]);

  const parentRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length + (hasMore ? 1 : 0),
    estimateSize: () => ROW_SLOT_PX,
    overscan: 3,
    scrollMargin: parentRef.current?.offsetTop ?? 0,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const loadNext = async () => {
    if (loading || !hasMore) return;

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
    }
  };

  useEffect(() => {
    if (!hasMore) return;
    if (virtualItems.length === 0) return;

    const last = virtualItems[virtualItems.length - 1];
    if (last && last.index >= rows.length - 2) {
      void loadNext();
    }
  }, [virtualItems, rows.length, hasMore]);

  return (
    <section className="mt-12 sm:mt-16" ref={parentRef}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Vendors</h2>
          <p className="mt-1 text-[13px] text-black/55 max-w-xl">Browse suppliers—keep scrolling to load more.</p>
        </div>

        <div className="text-[12px] font-semibold text-black/45">
          Showing {Math.min(vendors.length, total)} of {total}
        </div>
      </div>

      {vendors.length === 0 ? (
        <div className="mt-5 rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
          <div className="text-[13px] font-semibold text-[#2c2c2c]">No vendors found</div>
          <div className="mt-1 text-[13px] text-black/55">Try changing filters or check back later.</div>
        </div>
      ) : (
        <div className="mt-5 relative" style={{ height: totalSize }}>
          {virtualItems.map((virtualRow) => {
            const rowIndex = virtualRow.index;
            const row = rows[rowIndex];
            const top = virtualRow.start - rowVirtualizer.options.scrollMargin;

            if (!row) {
              return (
                <div
                  key={virtualRow.key}
                  className="py-6 pb-10 text-center text-[13px] font-semibold text-black/45"
                  style={{ position: "absolute", top, left: 0, width: "100%" }}
                >
                  {loadError ? (
                    <button
                      type="button"
                      className="text-[#6e4f33] hover:underline"
                      onClick={() => void loadNext()}
                    >
                      Retry loading
                    </button>
                  ) : loading || hasMore ? (
                    "Loading more…"
                  ) : (
                    ""
                  )}
                </div>
              );
            }

            return (
              <div
                key={virtualRow.key}
                className="pb-4"
                style={{ position: "absolute", top, left: 0, width: "100%", height: ROW_SLOT_PX }}
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ height: ROW_HEIGHT_PX }}>
                  {row.map((v) => (
                    <VendorCard key={v.id} vendor={v} fixedHeight />
                  ))}
                  {cols > row.length
                    ? Array.from({ length: cols - row.length }).map((_, i) => <div key={`spacer-${rowIndex}-${i}`} />)
                    : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {loadError ? <div className="mt-4 text-[13px] font-semibold text-[#b42318]">{loadError}</div> : null}
    </section>
  );
}
