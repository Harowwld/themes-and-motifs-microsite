import { Suspense } from "react";
import SiteHeader from "../sections/SiteHeader";
import { createSupabaseServerClient } from "../../lib/supabaseServer";
import CategoryBrowser from "../CategoryBrowser";
import VendorsSearchBar from "./VendorsSearchBar";
import VirtualizedVendorsList from "./VirtualizedVendorsList";
import VendorsScrollToResults from "./VendorsScrollToResults";
import { attachCoverImages } from "../../features/vendors/coverImages.server";
import type { VendorListItem } from "../../features/vendors/types";
import { buildVendorsQuery } from "../../features/vendors/queries.server";
import FadeInOnView from "../components/FadeInOnView";

type SortKey = "alpha" | "rating" | "newest" | "saves" | "views";

type VendorWithSortFields = {
  id: number;
  business_name: string;
  slug: string;
  logo_url: string | null;
  average_rating: number | null;
  review_count: number | null;
  location_text: string | null;
  city: string | null;
  cover_focus_x: number | null;
  cover_focus_y: number | null;
  cover_zoom: number | null;
  plan: { id: number; name: string } | { id: number; name: string }[] | null;
  save_count: number | null;
  view_count: number | null;
  updated_at: string | null;
  cover_image_url?: string | null;
};

function hasImages(vendor: { cover_image_url?: string | null; logo_url?: string | null }) {
  return Boolean((vendor.cover_image_url ?? "").trim() || (vendor.logo_url ?? "").trim());
}

function sortVendors<T extends VendorWithSortFields>(vendors: T[], sort: SortKey): T[] {
  return [...vendors].sort((a, b) => {
    const aHas = hasImages(a);
    const bHas = hasImages(b);
    if (aHas !== bHas) return aHas ? -1 : 1;

    let primaryCmp = 0;

    switch (sort) {
      case "alpha":
        primaryCmp = (a.business_name ?? "").localeCompare(b.business_name ?? "");
        if (primaryCmp === 0) primaryCmp = a.id - b.id;
        break;
      case "newest":
        const aDate = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const bDate = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        primaryCmp = bDate - aDate || b.id - a.id;
        break;
      case "saves":
        primaryCmp = (b.save_count ?? 0) - (a.save_count ?? 0) || b.id - a.id;
        break;
      case "views":
        primaryCmp = (b.view_count ?? 0) - (a.view_count ?? 0) || b.id - a.id;
        break;
      case "rating":
      default:
        primaryCmp = (b.average_rating ?? 0) - (a.average_rating ?? 0);
        if (primaryCmp === 0) primaryCmp = (b.review_count ?? 0) - (a.review_count ?? 0);
        if (primaryCmp === 0) primaryCmp = (a.business_name ?? "").localeCompare(b.business_name ?? "");
        if (primaryCmp === 0) primaryCmp = a.id - b.id;
        break;
    }

    return primaryCmp;
  });
}

type CategoryListItem = {
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
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr_0.7fr_auto] items-end">
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">Keyword</span>
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
  page,
  pageSize,
  sort,
}: {
  q: string;
  category: string;
  location: string;
  region: string;
  affiliation: string;
  page: number;
  pageSize: number;
  sort: SortKey;
}) {
  const supabase = createSupabaseServerClient();

  const [regionsRes, vendorLocationsRes, affiliationsRes, categoriesRes] = await Promise.all([
    supabase.from("regions").select("id,name").is("parent_id", null).order("name", { ascending: true }).limit(200),
    supabase
      .from("vendors")
      .select("region_id,city,location_text")
      .eq("is_active", true)
      .limit(5000),
    supabase.from("affiliations").select("id,name,slug").order("name", { ascending: true }).limit(200),
    supabase.from("categories").select("id,name,slug").order("name", { ascending: true }).limit(200),
  ]);

  const regionsList = (regionsRes.data ?? []) as RegionRow[];
  const vendorLocations = (vendorLocationsRes.data ?? []) as {
    region_id: number | null;
    city: string | null;
    location_text: string | null;
  }[];
  const citiesList = Array.from(
    new Map(
      vendorLocations
        .map((r) => ({
          region_id: typeof r.region_id === "number" ? r.region_id : 0,
          name: (r.city ?? r.location_text ?? "").trim(),
        }))
        .filter((r) => Boolean(r.name))
        .map((r) => [`${r.region_id}::${r.name.toLowerCase()}`, r] as const)
    ).values()
  );
  const affiliationsList = (affiliationsRes.data ?? []) as AffiliationRow[];
  const categoriesList = (categoriesRes.data ?? []) as CategoryListItem[];

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { query } = await buildVendorsQuery({
    supabase,
    filters: { q, category, location, region, affiliation },
    sort,
  });

  const MAX_FETCH = 5000;
  const { data: vendors, count } = await query.limit(MAX_FETCH);
  const vendorAllItems = (vendors ?? []) as VendorListItem[];
  const vendorTotal = count ?? 0;

  const vendorAllItemsWithCovers = await attachCoverImages(supabase, vendorAllItems);
  const vendorAllItemsSorted = sortVendors(vendorAllItemsWithCovers as VendorWithSortFields[], sort);
  const vendorPageItemsSorted = vendorAllItemsSorted.slice(from, to + 1);

  return (
    <>
      <FadeInOnView>
        <VendorsScrollToResults />
        <VendorsSearchBar
          initialQ={q}
          initialCategory={category}
          initialLocation={location}
          initialRegion={region}
          initialAffiliation={affiliation}
          initialSort={sort}
          regions={regionsList}
          cities={Array.from(citiesList).map((c, i) => ({ id: i + 1, name: c.name, region_id: c.region_id }))}
          affiliations={affiliationsList}
        />
      </FadeInOnView>

      <FadeInOnView>
        <CategoryBrowser categories={categoriesList} />
      </FadeInOnView>

      <div id="vendors-results" />
      <FadeInOnView>
        <VirtualizedVendorsList
          initialVendors={vendorPageItemsSorted as any}
          total={vendorTotal}
          pageSize={pageSize}
          initialPage={page}
          sort={sort}
          query={{ q, category, location, region, affiliation }}
        />
      </FadeInOnView>
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

  const pageSize = 12;
  const rawPage = (sp.vendorsPage as string | undefined) ?? "1";
  const rawSort = (sp.vendorsSort as string | undefined) ?? "rating";
  const page = Math.max(1, Number(rawPage) || 1);
  const sort: SortKey =
    rawSort === "alpha" || rawSort === "newest" || rawSort === "saves" || rawSort === "views" ? rawSort : "rating";

  return (
    <div
      className="min-h-screen bg-[#fafafa]"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SiteHeader />

        <main className="py-10 sm:py-14">
          <Suspense fallback={<VendorsPageSkeleton />}>
            <VendorsPageData
              q={q}
              category={category}
              location={location}
              region={region}
              affiliation={affiliation}
              page={page}
              pageSize={pageSize}
              sort={sort}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
