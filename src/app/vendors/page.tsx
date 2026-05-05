import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { createSupabaseServerClient } from "../../lib/supabaseServer";
import CategoryBrowser from "../components/CategoryBrowser";
import VendorsSearchBar from "./VendorsSearchBar";
import VirtualizedVendorsList from "./VirtualizedVendorsList";
import VendorsScrollToResults from "./VendorsScrollToResults";
import { attachCoverImages } from "../../features/vendors/coverImages.server";
import type { VendorListItem } from "../../features/vendors/types";
import { buildVendorsQuery } from "../../features/vendors/queries.server";
import { sortVendors, VendorWithSortFields, SortKey, getCachedVendorLocations } from "../../lib/vendorUtils";

// Cache regions for 1 hour (3600 seconds)
const getCachedRegions = unstable_cache(
  async () => {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("regions").select("id,name").is("parent_id", null).order("name", { ascending: true }).limit(200);
    return (data ?? []) as RegionRow[];
  },
  ["regions"],
  { revalidate: 3600 }
);

// Cache affiliations for 1 hour (3600 seconds)
const getCachedAffiliations = unstable_cache(
  async () => {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("affiliations").select("id,name,slug").order("name", { ascending: true }).limit(200);
    return (data ?? []) as AffiliationRow[];
  },
  ["affiliations"],
  { revalidate: 3600 }
);

// Cache categories for 1 hour (3600 seconds)
const getCachedCategories = unstable_cache(
  async () => {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("categories").select("id,name,slug").order("name", { ascending: true }).limit(200);
    return (data ?? []) as CategoryListItem[];
  },
  ["categories"],
  { revalidate: 3600 }
);

// Don't cache themes - they can be added dynamically by vendors
async function getThemes() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("themes").select("id,name,slug").order("name", { ascending: true }).limit(200);
  return (data ?? []) as ThemeListItem[];
}

type CategoryListItem = {
  id: number;
  name: string;
  slug: string;
};

type ThemeListItem = {
  id: number;
  name: string;
  slug: string;
};

type RegionRow = {
  id: number;
  name: string;
};

type AffiliationRow = {
  id: number;
  name: string;
  slug: string;
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

function CategoryCardSkeleton() {
  return (
    <div className="shrink-0 w-45 min-h-24 rounded-lg bg-white shadow-sm px-3 py-3 text-center">
      <div className="mx-auto inline-flex h-10 w-10 items-center justify-center">
        <div className="h-10 w-10 rounded bg-black/10 animate-pulse" />
      </div>
      <div className="mt-1 h-3 w-16 mx-auto rounded bg-black/10 animate-pulse" />
    </div>
  );
}

function VendorsSearchBarSkeleton() {
  return (
    <div className="rounded-lg border border-stone-200/60 bg-white/80 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="px-6 py-5 border-b border-stone-100">
        <div className="h-6 w-32 rounded bg-black/10 animate-pulse" />
        <div className="mt-2 h-4 w-64 rounded bg-black/10 animate-pulse" />
      </div>
      <div className="p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_0.9fr_0.9fr_0.9fr_0.7fr_auto] items-end">
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">Keyword</span>
            <div className="h-11 rounded-md border border-stone-200 bg-stone-50 animate-pulse" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">Category</span>
            <div className="h-11 rounded-md border border-stone-200 bg-stone-50 animate-pulse" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">Theme</span>
            <div className="h-11 rounded-md border border-stone-200 bg-stone-50 animate-pulse" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">Area</span>
            <div className="h-11 rounded-md border border-stone-200 bg-stone-50 animate-pulse" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">City</span>
            <div className="h-11 rounded-md border border-stone-200 bg-stone-50 animate-pulse" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">Affiliation</span>
            <div className="h-11 rounded-md border border-stone-200 bg-stone-50 animate-pulse" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">Sort</span>
            <div className="h-11 rounded-md border border-stone-200 bg-stone-50 animate-pulse" />
          </label>
          <div className="h-11 w-20 rounded-md bg-black/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function VendorsPageSkeleton() {
  return (
    <div className="grid gap-8">
      <VendorsSearchBarSkeleton />

      <section className="mt-10 sm:mt-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="h-3.5 w-14 rounded bg-black/10 animate-pulse" />
            <div className="mt-1 h-5 w-32 rounded bg-black/10 animate-pulse" />
          </div>
          <div className="h-4 w-16 rounded bg-black/10 animate-pulse" />
        </div>
        <div className="mt-6">
          <div className="flex gap-3 overflow-x-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 sm:mt-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="h-5 w-20 rounded bg-black/10 animate-pulse" />
            <div className="mt-2 h-4 w-64 rounded bg-black/10 animate-pulse" />
          </div>
          <div className="h-3 w-24 rounded bg-black/10 animate-pulse" />
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <VendorCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

async function VendorsPageData({
  q,
  category,
  location,
  region,
  affiliation,
  theme,
  limit,
  sort,
}: {
  q: string;
  category: string;
  location: string;
  region: string;
  affiliation: string;
  theme: string;
  limit: number;
  sort: SortKey;
}) {
  const supabase = createSupabaseServerClient();

  const [regionsList, vendorLocations, affiliationsList, categoriesList, themesList] = await Promise.all([
    getCachedRegions(),
    getCachedVendorLocations(),
    getCachedAffiliations(),
    getCachedCategories(),
    getThemes(),
  ]);

  // Build cities list from city field only (not location_text) to avoid duplicates
  // Deduplicate by city name only, keeping the first region_id encountered
  const citiesList = Array.from(
    new Map(
      (vendorLocations as { region_id: number | null; city: string | null }[])
        .filter((r) => Boolean(r.city?.trim()))
        .map((r) => {
          const name = r.city!.trim();
          return [name.toLowerCase(), { region_id: typeof r.region_id === "number" ? r.region_id : 0, name }] as const;
        })
    ).values()
  );

  // Use offset pagination for initial load
  const from = 0;
  const to = limit - 1;
  const { query } = await buildVendorsQuery({
    supabase,
    filters: { q, category, location, region, affiliation, theme },
    sort,
    from,
    to,
  });
  const { data: vendors, count: vendorTotal } = await query;
  const hasMore = (vendorTotal ?? 0) > limit;

  const vendorAllItems = (vendors ?? []) as VendorListItem[];

  const vendorAllItemsWithCovers = await attachCoverImages(supabase, vendorAllItems);
  const vendorPageItemsSorted = sortVendors(vendorAllItemsWithCovers as VendorWithSortFields[], sort);

  return (
    <>
      <VendorsScrollToResults />
      <VendorsSearchBar
        initialQ={q}
        initialCategory={category}
        initialLocation={location}
        initialRegion={region}
        initialAffiliation={affiliation}
        initialSort={sort}
        initialTheme={theme}
        regions={regionsList}
        cities={Array.from(citiesList).map((c, i) => ({ id: i + 1, name: c.name, region_id: c.region_id }))}
        affiliations={affiliationsList}
        categories={categoriesList}
        themes={themesList}
      />

      <CategoryBrowser categories={categoriesList} />

      <div id="vendors-results" />
      <VirtualizedVendorsList
        initialVendors={vendorPageItemsSorted as any}
        initialPage={1}
        hasMore={hasMore}
        limit={limit}
        total={vendorTotal ?? 0}
        sort={sort}
        query={{ q, category, location, region, affiliation, theme }}
      />
    </>
  );
}

export default async function VendorsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};

  const q = (sp.q as string | undefined)?.trim() || "";
  const category = (sp.category as string | undefined)?.trim() || "";
  const location = (sp.location as string | undefined)?.trim() || "";
  const region = (sp.region as string | undefined)?.trim() || "";
  const affiliation = (sp.affiliation as string | undefined)?.trim() || "";
  const theme = (sp.theme as string | undefined)?.trim() || "";

  const limit = 50;
  const rawSort = (sp.vendorsSort as string | undefined) ?? "rating";
  const sort: SortKey =
    rawSort === "alpha" || rawSort === "newest" || rawSort === "saves" || rawSort === "views" ? rawSort : "rating";

  return (
    <div
      style={{
        background: "#fafafa",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <main className="py-10 sm:py-14">
          <Suspense fallback={<VendorsPageSkeleton />}>
            <VendorsPageData
              q={q}
              category={category}
              location={location}
              region={region}
              affiliation={affiliation}
              theme={theme}
              limit={limit}
              sort={sort}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
