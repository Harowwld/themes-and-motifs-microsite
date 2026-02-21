"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";

type SortKey = "alpha" | "rating" | "newest" | "saves" | "views";

type VendorListItem = {
  id: number;
  business_name: string;
  slug: string;
  logo_url?: string | null;
  average_rating: number | null;
  review_count: number | null;
  location_text: string | null;
  city: string | null;
  cover_image_url?: string | null;
};

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

function VendorCard({ vendor }: { vendor: VendorListItem }) {
  const tone = vendor.id % 3 === 0 ? "#a67c52" : vendor.id % 3 === 1 ? "#c17a4e" : "#8e6a46";
  const rating = vendor.average_rating ?? 0;
  const reviews = vendor.review_count ?? 0;
  const location = vendor.city ?? vendor.location_text;

  return (
    <a
      href={`/vendors/${encodeURIComponent(vendor.slug)}`}
      className="h-[200px] rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
      aria-label={`View ${vendor.business_name}`}
    >
      <div
        className="h-24"
        style={{
          background: vendor.cover_image_url
            ? `linear-gradient(135deg, rgba(166,124,82,0.22), rgba(255,255,255,0.88)), url(${vendor.cover_image_url}) center/cover no-repeat`
            : `linear-gradient(135deg, ${tone}22, #ffffff 65%)`,
        }}
      />
      <div className="p-5 flex-1 flex flex-col min-h-0">
        <div className="text-[12px] font-semibold text-black/45">{location ? location : "Philippines"}</div>
        <div className="mt-1 flex items-center gap-2">
          {vendor.logo_url ? (
            <img
              src={vendor.logo_url}
              alt={`${vendor.business_name} logo`}
              className="h-8 w-8 rounded-[3px] border border-black/10 bg-white object-contain"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : null}
          <div className="text-[15px] font-semibold text-[#2c2c2c]">{vendor.business_name}</div>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="inline-flex items-center gap-1 text-[12px] font-semibold text-black/55">
            <span className="text-[#a67c52]">{rating.toFixed(1)}</span>
            <span className="text-black/30">•</span>
            <span>{reviews} reviews</span>
          </div>
          <span className="text-[13px] font-semibold text-[#6e4f33] hover:underline">
            Explore
          </span>
        </div>
      </div>
    </a>
  );
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
    rowVirtualizer.scrollToIndex(0, { align: "start" });
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
                    <VendorCard key={v.id} vendor={v} />
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
