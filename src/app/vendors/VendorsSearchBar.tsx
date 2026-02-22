"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type RegionOption = {
  id: number;
  name: string;
};

type AffiliationOption = {
  id: number;
  name: string;
  slug: string;
};

type SortKey = "rating" | "alpha" | "newest" | "saves" | "views";

type Props = {
  initialQ: string;
  initialCategory: string;
  initialLocation: string;
  initialRegion: string;
  initialAffiliation: string;
  initialSort: SortKey;
  regions: RegionOption[];
  affiliations: AffiliationOption[];
};

function buildHref({
  q,
  category,
  location,
  region,
  affiliation,
  sort,
}: {
  q: string;
  category: string;
  location: string;
  region: string;
  affiliation: string;
  sort: SortKey;
}) {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (category) params.set("category", category);
  if (location.trim()) params.set("location", location.trim());
  if (region) params.set("region", region);
  if (affiliation) params.set("affiliation", affiliation);
  if (sort !== "rating") params.set("vendorsSort", sort);
  params.set("scroll", "results");
  const qs = params.toString();
  return `/vendors${qs ? `?${qs}` : ""}`;
}

export default function VendorsSearchBar({
  initialQ,
  initialCategory,
  initialLocation,
  initialRegion,
  initialAffiliation,
  initialSort,
  regions,
  affiliations,
}: Props) {
  const router = useRouter();

  const [q, setQ] = useState(initialQ);
  const [location, setLocation] = useState(initialLocation);
  const [region, setRegion] = useState(initialRegion);
  const [affiliation, setAffiliation] = useState(initialAffiliation);
  const [sort, setSort] = useState<SortKey>(initialSort);

  const regionOptions = useMemo(() => regions ?? [], [regions]);
  const affiliationOptions = useMemo(() => affiliations ?? [], [affiliations]);

  const submit = () => {
    router.push(
      buildHref({
        q,
        category: initialCategory,
        location,
        region,
        affiliation,
        sort,
      }),
      { scroll: false }
    );
  };

  return (
    <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-black/5">
        <div className="text-[13px] font-semibold text-[#2c2c2c]">Search vendors</div>
        <div className="mt-1 text-[12px] text-black/50">Refine by keyword, region, location, or affiliation.</div>
      </div>

      <div className="p-5 grid gap-3">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr_0.7fr_auto] items-end">
          <label className="grid gap-1">
            <span className="text-[12px] font-semibold text-black/55">Keyword</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search vendor name"
              className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-[12px] font-semibold text-black/55">Area</span>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-black/70 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
            >
              <option value="">All areas</option>
              {regionOptions.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-[12px] font-semibold text-black/55">Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or venue"
              className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-[12px] font-semibold text-black/55">Affiliation</span>
            <select
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-black/70 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
            >
              <option value="">Any affiliation</option>
              {affiliationOptions.map((a) => (
                <option key={a.id} value={a.slug}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-[12px] font-semibold text-black/55">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-black/70 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
            >
              <option value="rating">Top rated</option>
              <option value="alpha">A–Z</option>
              <option value="newest">Newest</option>
              <option value="saves">Most saved</option>
              <option value="views">Most viewed</option>
            </select>
          </label>

          <button
            type="button"
            onClick={submit}
            className="h-10 inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[14px] font-semibold hover:bg-[#8e6a46] transition-colors shadow-sm"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
