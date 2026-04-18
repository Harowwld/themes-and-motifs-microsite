"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import VendorCard from "../components/VendorCard";
import type { VendorListItem } from "../types";

function VendorCardSkeleton() {
  return (
    <div className="h-[240px] rounded-xl border border-black/5 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">
      <div className="h-28 w-full bg-black/5 animate-pulse" />
      <div className="relative px-4 pt-0 pb-4">
        <div className="relative -mt-10 mb-2 flex items-end justify-between">
          <div className="h-20 w-20 rounded-2xl border-4 border-white bg-[#fcfbf9] shadow-lg animate-pulse -ml-1" />
          <div className="h-3.5 w-14 bg-black/5 animate-pulse rounded" />
        </div>
        <div className="h-5 w-3/4 rounded bg-black/5 animate-pulse mb-2" />
        <div className="h-3.5 w-1/2 rounded bg-black/5 animate-pulse" />
      </div>
    </div>
  );
}

type SortKey = "alpha" | "rating" | "newest" | "saves" | "views" | "photos";

type VendorsSectionProps = {
  vendors: VendorListItem[];
  total: number;
  page: number;
  pageSize: number;
  sort: SortKey;
  basePath?: string;
  extraParams?: Record<string, string | undefined>;
};

function makeHref({
  page,
  sort,
  basePath,
  extraParams,
}: {
  page: number;
  sort: SortKey;
  basePath?: string;
  extraParams?: Record<string, string | undefined>;
}) {
  const params = new URLSearchParams();
  if (extraParams) {
    for (const [k, v] of Object.entries(extraParams)) {
      if (v) params.set(k, v);
    }
  }
  if (page > 1) params.set("vendorsPage", String(page));
  params.set("vendorsSort", sort);
  const qs = params.toString();
  return `${basePath ?? ""}${qs ? `?${qs}` : "?"}`;
}

export default function VendorsSection({
  vendors,
  total,
  page,
  pageSize,
  sort,
  basePath,
  extraParams,
}: VendorsSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const navigate = (href: string) => {
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  };

  return (
    <section className="mt-12 sm:mt-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
            Vendors
          </h2>
          <p className="mt-1 text-[13px] text-black/55 max-w-xl">
            Browse suppliers—sort by name or ratings, then page through the list.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-black/10 shadow-sm">
          {([
            { value: "rating", label: "Top rated" },
            { value: "alpha", label: "A-Z" },
            { value: "photos", label: "With photos" },
            { value: "newest", label: "Newest" },
          ] as const).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => navigate(makeHref({ page: 1, sort: option.value as SortKey, basePath, extraParams }))}
              className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                sort === option.value
                  ? "bg-[#a68b6a] text-white shadow-sm"
                  : "text-black/60 hover:text-black/80 hover:bg-black/[0.02]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {isPending ? (
          Array.from({ length: pageSize }).map((_, i) => (
            <VendorCardSkeleton key={`skeleton-${i}`} />
          ))
        ) : vendors.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
            <div className="text-[13px] font-semibold text-[#2c2c2c]">No vendors found</div>
            <div className="mt-1 text-[13px] text-black/55">Try another sort or check back later.</div>
          </div>
        ) : (
          vendors.map((vendor, i) => {
            return <VendorCard key={vendor.id} vendor={vendor} toneSeed={i} fixedHeight />;
          })
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[12px] font-semibold text-black/45">
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <a
            className={`h-9 inline-flex items-center justify-center px-3 rounded-[3px] border text-[13px] font-semibold transition-colors ${
              hasPrev
                ? "border-black/10 bg-white text-black/70 hover:bg-black/[0.02]"
                : "border-black/10 bg-white/50 text-black/30 pointer-events-none"
            }`}
            href={makeHref({ page: Math.max(1, page - 1), sort, basePath, extraParams })}
            onClick={(e) => {
              if (!hasPrev) return;
              e.preventDefault();
              navigate(makeHref({ page: Math.max(1, page - 1), sort, basePath, extraParams }));
            }}
            aria-disabled={!hasPrev}
          >
            Prev
          </a>
          <a
            className={`h-9 inline-flex items-center justify-center px-3 rounded-[3px] border text-[13px] font-semibold transition-colors ${
              hasNext
                ? "border-black/10 bg-white text-black/70 hover:bg-black/[0.02]"
                : "border-black/10 bg-white/50 text-black/30 pointer-events-none"
            }`}
            href={makeHref({ page: Math.min(totalPages, page + 1), sort, basePath, extraParams })}
            onClick={(e) => {
              if (!hasNext) return;
              e.preventDefault();
              navigate(makeHref({ page: Math.min(totalPages, page + 1), sort, basePath, extraParams }));
            }}
            aria-disabled={!hasNext}
          >
            Next
          </a>
        </div>
      </div>
    </section>
  );
}
