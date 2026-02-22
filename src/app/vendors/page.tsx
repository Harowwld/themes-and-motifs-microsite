import { Suspense } from "react";
import SiteHeader from "../sections/SiteHeader";
import SiteFooter from "../sections/SiteFooter";
import { createSupabaseServerClient } from "../../lib/supabaseServer";
import CategoryBrowser from "../CategoryBrowser";
import VendorsSearchBar from "./VendorsSearchBar";
import VirtualizedVendorsList from "./VirtualizedVendorsList";
import VendorsScrollToResults from "./VendorsScrollToResults";
import { attachCoverImages } from "../../features/vendors/coverImages.server";
import type { VendorListItem } from "../../features/vendors/types";
import { buildVendorsQuery } from "../../features/vendors/queries.server";

type SortKey = "alpha" | "rating" | "newest" | "saves" | "views";

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

function VendorsPageSkeleton() {
  return (
    <div className="grid gap-8">
      <section className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="h-6 w-44 rounded bg-black/10 animate-pulse" />
          <div className="mt-2 h-4 w-80 rounded bg-black/10 animate-pulse" />
        </div>
        <div className="p-6 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="h-10 w-full rounded-[3px] bg-black/10 animate-pulse" />
            <div className="h-10 w-full rounded-[3px] bg-black/10 animate-pulse" />
            <div className="h-10 w-full rounded-[3px] bg-black/10 animate-pulse" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 rounded-[3px] bg-black/10 animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="h-5 w-40 rounded bg-black/10 animate-pulse" />
        </div>
        <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-[3px] border border-black/10 bg-white overflow-hidden">
              <div className="h-28 w-full bg-black/10 animate-pulse" />
              <div className="p-4 grid gap-2">
                <div className="h-4 w-2/3 rounded bg-black/10 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-black/10 animate-pulse" />
              </div>
            </div>
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

  const [regionsRes, affiliationsRes, categoriesRes] = await Promise.all([
    supabase.from("regions").select("id,name").is("parent_id", null).order("name", { ascending: true }).limit(200),
    supabase.from("affiliations").select("id,name,slug").order("name", { ascending: true }).limit(200),
    supabase.from("categories").select("id,name,slug").order("name", { ascending: true }).limit(200),
  ]);

  const regionsList = (regionsRes.data ?? []) as RegionRow[];
  const affiliationsList = (affiliationsRes.data ?? []) as AffiliationRow[];
  const categoriesList = (categoriesRes.data ?? []) as CategoryListItem[];

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { query } = await buildVendorsQuery({
    supabase,
    filters: { q, category, location, region, affiliation },
    sort,
  });

  const { data: vendors, count } = await query.range(from, to);
  const vendorPageItems = (vendors ?? []) as VendorListItem[];
  const vendorTotal = count ?? 0;

  const vendorPageItemsWithCovers = await attachCoverImages(supabase, vendorPageItems);

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
        regions={regionsList}
        affiliations={affiliationsList}
      />

      <CategoryBrowser categories={categoriesList} />

      <div id="vendors-results" />
      <VirtualizedVendorsList
        initialVendors={vendorPageItemsWithCovers}
        total={vendorTotal}
        pageSize={pageSize}
        initialPage={page}
        sort={sort}
        query={{ q, category, location, region, affiliation }}
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

  const pageSize = 12;
  const rawPage = (sp.vendorsPage as string | undefined) ?? "1";
  const rawSort = (sp.vendorsSort as string | undefined) ?? "rating";
  const page = Math.max(1, Number(rawPage) || 1);
  const sort: SortKey =
    rawSort === "alpha" || rawSort === "newest" || rawSort === "saves" || rawSort === "views" ? rawSort : "rating";

  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(circle at 20% 10%, #fff7ed, #fcfbf9 42%, #f6f1ea 92%)",
      }}
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

        <SiteFooter />
      </div>
    </div>
  );
}
