"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type RegionOption = {
  id: number;
  name: string;
};

type CityOption = {
  id: number;
  name: string;
  region_id: number;
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
  cities: CityOption[];
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
  cities,
  affiliations,
}: Props) {
  const router = useRouter();

  const [q, setQ] = useState(initialQ);
  const [location, setLocation] = useState(initialLocation);
  const [region, setRegion] = useState(initialRegion);
  const [affiliation, setAffiliation] = useState(initialAffiliation);
  const [sort, setSort] = useState<SortKey>(initialSort);

  const regionOptions = useMemo(() => regions ?? [], [regions]);
  const cityOptions = useMemo(() => {
    const regionIdNum = Number(region);
    const base = cities ?? [];
    const filtered = Number.isFinite(regionIdNum) ? base.filter((c) => c.region_id === regionIdNum) : base;
    return filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [cities, region]);
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
    <div className="rounded-lg border border-stone-200/60 bg-white/80 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="px-6 py-5 border-b border-stone-100">
        <div className="text-lg font-semibold text-stone-800 font-headline font-[family-name:var(--font-plus-jakarta)]">Search vendors</div>
        <div className="mt-1 text-sm text-stone-500 font-[family-name:var(--font-plus-jakarta)]">Refine by keyword, region, location, or affiliation.</div>
      </div>

      <div className="p-6">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr_0.7fr_auto] items-end">
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide font-[family-name:var(--font-plus-jakarta)]">Keyword</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search vendor name"
              className="h-11 rounded-md border border-stone-200 bg-stone-50 px-4 text-sm text-stone-700 placeholder:text-stone-400 outline-none transition-all focus:border-[#a68b6a] focus:bg-white focus:ring-2 focus:ring-[#a68b6a]/10 font-[family-name:var(--font-plus-jakarta)]"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide font-[family-name:var(--font-plus-jakarta)]">Area</span>
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setLocation("");
              }}
              className="h-11 rounded-md border border-stone-200 bg-stone-50 px-4 text-sm text-stone-700 outline-none transition-all focus:border-[#a68b6a] focus:bg-white focus:ring-2 focus:ring-[#a68b6a]/10 appearance-none cursor-pointer font-[family-name:var(--font-plus-jakarta)]"
            >
              <option value="" className="font-[family-name:var(--font-plus-jakarta)]">All areas</option>
              {regionOptions.map((r) => (
                <option key={r.id} value={String(r.id)} className="font-[family-name:var(--font-plus-jakarta)]">
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide font-[family-name:var(--font-plus-jakarta)]">City</span>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-11 rounded-md border border-stone-200 bg-stone-50 px-4 text-sm text-stone-700 outline-none transition-all focus:border-[#a68b6a] focus:bg-white focus:ring-2 focus:ring-[#a68b6a]/10 appearance-none cursor-pointer font-[family-name:var(--font-plus-jakarta)]"
            >
              <option value="" className="font-[family-name:var(--font-plus-jakarta)]">All cities</option>
              {cityOptions.map((c) => (
                <option key={c.id} value={c.name} className="font-[family-name:var(--font-plus-jakarta)]">
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide font-[family-name:var(--font-plus-jakarta)]">Affiliation</span>
            <select
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              className="h-11 rounded-md border border-stone-200 bg-stone-50 px-4 text-sm text-stone-700 outline-none transition-all focus:border-[#a68b6a] focus:bg-white focus:ring-2 focus:ring-[#a68b6a]/10 appearance-none cursor-pointer font-[family-name:var(--font-plus-jakarta)]"
            >
              <option value="" className="font-[family-name:var(--font-plus-jakarta)]">Any affiliation</option>
              {affiliationOptions.map((a) => (
                <option key={a.id} value={a.slug} className="font-[family-name:var(--font-plus-jakarta)]">
                  {a.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide font-[family-name:var(--font-plus-jakarta)]">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-11 rounded-md border border-stone-200 bg-stone-50 px-4 text-sm text-stone-700 outline-none transition-all focus:border-[#a68b6a] focus:bg-white focus:ring-2 focus:ring-[#a68b6a]/10 appearance-none cursor-pointer font-[family-name:var(--font-plus-jakarta)]"
            >
              <option value="rating" className="font-[family-name:var(--font-plus-jakarta)]">Top rated</option>
              <option value="alpha" className="font-[family-name:var(--font-plus-jakarta)]">A-Z</option>
              <option value="newest" className="font-[family-name:var(--font-plus-jakarta)]">Newest</option>
              <option value="saves" className="font-[family-name:var(--font-plus-jakarta)]">Most saved</option>
              <option value="views" className="font-[family-name:var(--font-plus-jakarta)]">Most viewed</option>
            </select>
          </label>

          <button
            type="button"
            onClick={submit}
            className="h-11 inline-flex items-center justify-center px-6 rounded-md bg-[#a68b6a] text-white text-sm font-medium hover:bg-[#957a5c] transition-colors shadow-sm hover:shadow-md"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
