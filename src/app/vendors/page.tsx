import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { createSupabaseServerClient } from "../../lib/supabaseServer";
import CategoryBrowser, { CategoryBrowserSkeleton } from "../components/CategoryBrowser";
import VendorsSearchBar, { VendorsSearchBarSkeleton } from "./VendorsSearchBar";
import VendorsListWithSaved from "./VendorsListWithSaved";
import VendorsScrollToResults from "./VendorsScrollToResults";
import type { VendorListItem } from "../../features/vendors/types";
import { buildVendorsQuery } from "../../features/vendors/queries.server";
import { VendorCardSkeleton } from "../../features/vendors/components/VendorCard";

import type { VendorWithSortFields, SortKey } from "../../lib/vendorUtils";
import { getCachedVendorLocations } from "../../lib/vendorUtils";

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

// Cache cities for 1 hour (rarely change)
const getCachedCities = unstable_cache(
  async () => {
    const supabase = createSupabaseServerClient();
    const [part1, part2] = await Promise.all([
      supabase.from("cities").select("id,name,region_id").order("name", { ascending: true }).range(0, 999),
      supabase.from("cities").select("id,name,region_id").order("name", { ascending: true }).range(1000, 1999),
    ]);
    return [
      ...(part1.data ?? []),
      ...(part2.data ?? [])
    ] as { id: number; name: string; region_id: number }[];
  },
  ["cities"],
  { revalidate: 3600 }
);

// Cache default vendor list (no filters, rating sort) for 5 minutes
const getCachedDefaultVendors = unstable_cache(
  async (limit: number) => {
    const supabase = createSupabaseServerClient();
    const { vendors, total } = await buildVendorsQuery({
      supabase,
      filters: {},
      sort: "rating",
      from: 0,
      to: limit - 1,
    });
    return { vendors, total };
  },
  ["default-vendors-v2"],
  { revalidate: 300 } // 5 minutes
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

function VendorsPageSkeleton() {
  return (
    <>
      <VendorsSearchBarSkeleton />
      <CategoryBrowserSkeleton />
      <div id="vendors-results" />
      <section className="mt-16 sm:mt-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.01em] text-[#2c2c2c] animate-pulse">
              Vendors
            </h2>
            <p className="mt-2 text-[13px] text-black/55 max-w-xl font-[family-name:var(--font-plus-jakarta)] animate-pulse">
              Browse suppliers — keep scrolling to load more.
            </p>
          </div>
          <div className="text-[12px] font-semibold text-black/45 font-[family-name:var(--font-plus-jakarta)] h-4 w-28 bg-stone-100 rounded animate-pulse" />
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <VendorCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </>
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

  const [regionsList, vendorLocations, affiliationsList, categoriesList, themesList, citiesList] = await Promise.all([
    getCachedRegions(),
    getCachedVendorLocations(),
    getCachedAffiliations(),
    getCachedCategories(),
    getThemes(),
    getCachedCities(),
  ]);

  // Use offset pagination for initial load
  const from = 0;
  const to = limit - 1;

  // Use the cached default fetch when no filters are active, otherwise query live
  const isDefaultQuery = !q && !category && !location && !region && !affiliation && !theme && sort === "rating";
  const { vendors, total: vendorTotal } = isDefaultQuery
    ? await getCachedDefaultVendors(limit)
    : await buildVendorsQuery({
        supabase,
        filters: { q, category, location, region, affiliation, theme },
        sort,
        from,
        to,
      });
  const loadedCount = (vendors ?? []).length;
  const hasMore = loadedCount > 0 && from + loadedCount < (vendorTotal ?? 0);

  const vendorAllItemsWithCovers = (vendors ?? []) as VendorListItem[];

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
        cities={citiesList.map((c) => ({ id: c.id, name: c.name, region_id: c.region_id }))}
        affiliations={affiliationsList}
        categories={categoriesList}
        themes={themesList}
      />

      <CategoryBrowser categories={categoriesList} />

      <div id="vendors-results" />
      <VendorsListWithSaved
        initialVendors={vendorAllItemsWithCovers as any}
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

  const limit = 30;
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
