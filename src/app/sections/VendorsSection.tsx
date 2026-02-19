"use client";

import { useRouter } from "next/navigation";

type VendorListItem = {
  id: number;
  business_name: string;
  slug: string;
  average_rating: number | null;
  review_count: number | null;
  location_text: string | null;
  city: string | null;
};

type SortKey = "alpha" | "rating" | "newest" | "saves" | "views";

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
  if (sort !== "rating") params.set("vendorsSort", sort);
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
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const navigate = (href: string) => {
    router.push(href, { scroll: false });
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

        <div className="flex items-center gap-2">
          <div className="text-[12px] font-semibold text-black/45">Sort</div>
          <select
            value={sort}
            onChange={(e) => {
              navigate(makeHref({ page: 1, sort: e.target.value as SortKey, basePath, extraParams }));
            }}
            className="h-9 rounded-[3px] border border-black/10 bg-white px-2 text-[13px] font-semibold text-black/70 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
            aria-label="Sort vendors"
          >
            <option value="rating">Top rated</option>
            <option value="alpha">A–Z</option>
            <option value="newest">Newest</option>
            <option value="saves">Most saved</option>
            <option value="views">Most viewed</option>
          </select>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vendors.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
            <div className="text-[13px] font-semibold text-[#2c2c2c]">No vendors found</div>
            <div className="mt-1 text-[13px] text-black/55">Try another sort or check back later.</div>
          </div>
        ) : (
          vendors.map((vendor, i) => {
            const tone = i % 3 === 0 ? "#7a8b6e" : i % 3 === 1 ? "#a67c52" : "#c17a4e";
            const rating = vendor.average_rating ?? 0;
            const reviews = vendor.review_count ?? 0;
            const location = vendor.city ?? vendor.location_text;

            return (
              <div
                key={vendor.id}
                className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden"
              >
                <div
                  className="h-24"
                  style={{
                    background: `linear-gradient(135deg, ${tone}22, #ffffff 65%)`,
                  }}
                />
                <div className="p-5">
                  <div className="text-[12px] font-semibold text-black/45">{location ? location : "Philippines"}</div>
                  <div className="mt-1 text-[15px] font-semibold text-[#2c2c2c]">{vendor.business_name}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1 text-[12px] font-semibold text-black/55">
                      <span className="text-[#7a8b6e]">{rating.toFixed(1)}</span>
                      <span className="text-black/30">•</span>
                      <span>{reviews} reviews</span>
                    </div>
                    <a className="text-[13px] font-semibold text-[#6e4f33] hover:underline" href="#discover">
                      Explore
                    </a>
                  </div>
                </div>
              </div>
            );
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
