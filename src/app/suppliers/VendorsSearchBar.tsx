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
  province_id: number;
};

type AffiliationOption = {
  id: number;
  name: string;
  slug: string;
};

type SortKey = "rating" | "alpha" | "newest" | "saves" | "views" | "verified";

type CategoryOption = {
  id: number;
  name: string;
  slug: string;
};

type ThemeOption = {
  id: number;
  name: string;
  slug: string;
};

type Props = {
  initialQ: string;
  initialCategory: string;
  initialLocation: string;
  initialCity: string;
  initialRegion: string;
  initialAffiliation: string;
  initialSort: SortKey;
  initialTheme: string;
  regions: RegionOption[];
  cities: CityOption[];
  affiliations: AffiliationOption[];
  categories?: CategoryOption[];
  themes?: ThemeOption[];
};

function buildHref({
  q,
  category,
  location,
  city,
  region,
  affiliation,
  sort,
  theme,
}: {
  q: string;
  category: string;
  location: string;
  city: string;
  region: string;
  affiliation: string;
  sort: SortKey;
  theme: string;
}) {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (category) params.set("category", category);
  if (location.trim()) params.set("location", location.trim());
  if (city.trim()) params.set("city", city.trim());
  if (region) params.set("region", region);
  if (affiliation) params.set("affiliation", affiliation);
  if (theme) params.set("theme", theme);
  if (sort !== "rating") params.set("vendorsSort", sort);
  params.set("scroll", "results");
  const qs = params.toString();
  return `/suppliers${qs ? `?${qs}` : ""}`;
}

export default function VendorsSearchBar({
  initialQ,
  initialCategory,
  initialLocation,
  initialCity,
  initialRegion,
  initialAffiliation,
  initialSort,
  initialTheme,
  regions,
  cities,
  affiliations,
  categories,
  themes,
}: Props) {
  const router = useRouter();

  const [q, setQ] = useState(initialQ);
  const [location, setLocation] = useState(initialLocation);
  const [city, setCity] = useState(initialCity);
  const [region, setRegion] = useState(initialRegion);
  const [affiliation, setAffiliation] = useState(initialAffiliation);
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [category, setCategory] = useState(initialCategory);
  const [theme, setTheme] = useState(initialTheme);

  const regionOptions = useMemo(() => regions ?? [], [regions]);
  const cityOptions = useMemo(() => {
    const base = cities ?? [];
    // Only filter by region if a specific region is selected (not empty string)
    if (!region || region === "") {
      return base.slice().sort((a, b) => a.name.localeCompare(b.name));
    }
    const regionIdNum = Number(region);
    const filtered = Number.isFinite(regionIdNum) && regionIdNum > 0
      ? base.filter((c) => c.province_id === regionIdNum)
      : base;
    return filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [cities, region]);
  const affiliationOptions = useMemo(() => affiliations ?? [], [affiliations]);
  const categoryOptions = useMemo(() => categories ?? [], [categories]);
  const themeOptions = useMemo(() => themes ?? [], [themes]);



  const submit = () => {
    router.push(
      buildHref({
        q,
        category,
        location,
        city,
        region,
        affiliation,
        sort,
        theme,
      }),
      { scroll: false }
    );
  };

  return (
    <div className="rounded-lg border border-stone-200/60 bg-white/80 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="px-6 py-5 border-b border-stone-100">
        <div className="text-lg font-semibold text-stone-800 font-headline font-[family-name:var(--font-plus-jakarta)]">Search suppliers</div>
        <div className="mt-1 text-sm text-stone-500 font-[family-name:var(--font-plus-jakarta)]">Refine by keyword, category, region, city, affiliation, or theme.</div>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid gap-3 items-end grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide font-[family-name:var(--font-plus-jakarta)]">Keyword</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="Search supplier name"
              className="h-11 w-full rounded-md border border-stone-200 bg-stone-50 px-4 text-sm text-stone-700 placeholder:text-stone-400 outline-none transition-all focus:border-[#a68b6a] focus:bg-white focus:ring-2 focus:ring-[#a68b6a]/10 font-[family-name:var(--font-plus-jakarta)]"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide font-[family-name:var(--font-plus-jakarta)]">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-11 w-full rounded-md border border-stone-200 bg-stone-50 px-4 text-sm text-stone-700 outline-none transition-all focus:border-[#a68b6a] focus:bg-white focus:ring-2 focus:ring-[#a68b6a]/10 appearance-none cursor-pointer font-[family-name:var(--font-plus-jakarta)]"
            >
              <option value="" className="font-[family-name:var(--font-plus-jakarta)]">All categories</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.slug} className="font-[family-name:var(--font-plus-jakarta)]">
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide font-[family-name:var(--font-plus-jakarta)]">Region</span>
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setCity(""); // Clear city when region changes
              }}
              className="h-11 rounded-md border border-stone-200 bg-stone-50 px-4 text-sm text-stone-700 outline-none transition-all focus:border-[#a68b6a] focus:bg-white focus:ring-2 focus:ring-[#a68b6a]/10 appearance-none cursor-pointer font-[family-name:var(--font-plus-jakarta)] truncate overflow-hidden w-full"
            >
              <option value="" className="font-[family-name:var(--font-plus-jakarta)]">Select a Region</option>
              {regionOptions.map((r) => (
                <option key={r.id} value={r.id} className="font-[family-name:var(--font-plus-jakarta)]">
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          <label className={`grid gap-1.5 ${!region ? 'opacity-50 pointer-events-none' : ''}`}>
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide font-[family-name:var(--font-plus-jakarta)]">City / Wedding Center</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!region}
              className="h-11 w-full rounded-md border border-stone-200 bg-stone-50 px-4 text-sm text-stone-700 outline-none transition-all focus:border-[#a68b6a] focus:bg-white focus:ring-2 focus:ring-[#a68b6a]/10 appearance-none cursor-pointer font-[family-name:var(--font-plus-jakarta)] truncate overflow-hidden disabled:bg-stone-100 disabled:cursor-not-allowed"
            >
              <option value="" className="font-[family-name:var(--font-plus-jakarta)]">Select a City / Wedding Center</option>
              {cityOptions.map((c) => (
                <option key={c.id} value={c.id.toString()} className="font-[family-name:var(--font-plus-jakarta)]">
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
              className="h-11 w-full rounded-md border border-stone-200 bg-stone-50 px-4 text-sm text-stone-700 outline-none transition-all focus:border-[#a68b6a] focus:bg-white focus:ring-2 focus:ring-[#a68b6a]/10 appearance-none cursor-pointer font-[family-name:var(--font-plus-jakarta)]"
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
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide font-[family-name:var(--font-plus-jakarta)]">Theme</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="h-11 w-full rounded-md border border-stone-200 bg-stone-50 px-4 text-sm text-stone-700 outline-none transition-all focus:border-[#a68b6a] focus:bg-white focus:ring-2 focus:ring-[#a68b6a]/10 appearance-none cursor-pointer font-[family-name:var(--font-plus-jakarta)]"
            >
              <option value="" className="font-[family-name:var(--font-plus-jakarta)]">Any theme</option>
              {themeOptions.map((t) => (
                <option key={t.id} value={t.slug} className="font-[family-name:var(--font-plus-jakarta)]">
                  {t.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide font-[family-name:var(--font-plus-jakarta)]">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-11 w-full rounded-md border border-stone-200 bg-stone-50 px-4 text-sm text-stone-700 outline-none transition-all focus:border-[#a68b6a] focus:bg-white focus:ring-2 focus:ring-[#a68b6a]/10 appearance-none cursor-pointer font-[family-name:var(--font-plus-jakarta)]"
            >
              <option value="rating" className="font-[family-name:var(--font-plus-jakarta)]">Top rated</option>
              <option value="verified" className="font-[family-name:var(--font-plus-jakarta)]">Verified suppliers only</option>
              <option value="alpha" className="font-[family-name:var(--font-plus-jakarta)]">A-Z</option>
              <option value="newest" className="font-[family-name:var(--font-plus-jakarta)]">Newest</option>
              <option value="saves" className="font-[family-name:var(--font-plus-jakarta)]">Most saved</option>
              <option value="views" className="font-[family-name:var(--font-plus-jakarta)]">Most viewed</option>
            </select>
          </label>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={submit}
            className="h-11 w-full max-w-[200px] inline-flex items-center justify-center px-6 rounded-md bg-[#a68b6a] text-white text-sm font-medium hover:bg-[#957a5c] transition-colors shadow-lg hover:shadow-xl"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

export function VendorsSearchBarSkeleton() {
  return (
    <div className="rounded-lg border border-stone-200/60 bg-white/80 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="px-6 py-5 border-b border-stone-100">
        <div className="text-lg font-semibold text-stone-800 font-headline font-[family-name:var(--font-plus-jakarta)]">Search suppliers</div>
        <div className="mt-1 text-sm text-stone-500 font-[family-name:var(--font-plus-jakarta)]">Refine by keyword, category, region, city, affiliation, or theme.</div>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid gap-3 items-end grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {["Keyword", "Category", "Region", "City", "Affiliation", "Theme", "Sort"].map((label) => (
            <div key={label} className="grid gap-1.5 animate-pulse">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wide font-[family-name:var(--font-plus-jakarta)]">
                {label}
              </span>
              <div className="h-11 w-full rounded-md border border-stone-200 bg-stone-50/50" />
            </div>
          ))}
        </div>

        <div className="flex justify-center animate-pulse">
          <div className="h-11 w-full max-w-[200px] rounded-md bg-[#a68b6a]/20" />
        </div>
      </div>
    </div>
  );
}

