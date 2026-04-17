import { Suspense, cache } from "react";
import { createSupabaseServerClient } from "../lib/supabaseServer";
import CategoryBrowser from "./CategoryBrowser";
import SiteHeader from "./sections/SiteHeader";
import HeroSection from "./sections/HeroSection";
import FeaturedVendorsSection from "../features/vendors/sections/FeaturedVendorsSection";
import PromosSection from "./sections/PromosSection";
import VendorsSection from "../features/vendors/sections/VendorsSection";
import SiteFooter from "./sections/SiteFooter";
import { attachCoverImages } from "../features/vendors/coverImages.server";
import type { FeaturedVendor, VendorListItem } from "../features/vendors/types";
import FadeInOnView from "./components/FadeInOnView";
import ScrollToTopOnMount from "./components/ScrollToTopOnMount";

const getCachedCategories = cache(async () => {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("categories").select("id,name,slug,display_order").order("display_order", { ascending: true }).order("name", { ascending: true }).limit(200);
  return (data ?? []) as Category[];
});

const getCachedVendorLocations = cache(async () => {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("vendors").select("city,location_text").eq("is_active", true).limit(2000);
  return data ?? [];
});

function sortWithImagesFirst<T extends { cover_image_url?: string | null; logo_url?: string | null }>(vendors: T[]) {
  return [...vendors].sort((a, b) => {
    const aHas = Boolean((a.cover_image_url ?? "").trim() || (a.logo_url ?? "").trim());
    const bHas = Boolean((b.cover_image_url ?? "").trim() || (b.logo_url ?? "").trim());
    if (aHas === bHas) return 0;
    return aHas ? -1 : 1;
  });
}

type FeaturedPromo = {
  id: number;
  title: string;
  summary: string | null;
  valid_from: string | null;
  valid_to: string | null;
  image_url?: string | null;
  discount_percentage?: number | null;
  image_focus_x?: number | null;
  image_focus_y?: number | null;
  image_zoom?: number | null;
  vendors: {
    business_name: string;
    slug: string;
  }[];
};

type Category = {
  id: number;
  name: string;
  slug: string;
  display_order: number | null;
};

type SortKey = "alpha" | "rating";

function isPromoCurrentlyValid(promo: FeaturedPromo) {
  const now = new Date();
  const from = promo.valid_from ? new Date(`${promo.valid_from}T00:00:00Z`) : null;
  const to = promo.valid_to ? new Date(`${promo.valid_to}T23:59:59Z`) : null;

  if (from && now < from) return false;
  if (to && now > to) return false;
  return true;
}

function LandingTopSkeleton() {
  return (
    <div className="grid gap-8">
      <section className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-6">
          <div className="h-8 w-2/3 rounded bg-black/10 animate-pulse" />
          <div className="mt-3 h-4 w-1/2 rounded bg-black/10 animate-pulse" />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="h-10 w-full rounded-[3px] bg-black/10 animate-pulse" />
            <div className="h-10 w-full rounded-[3px] bg-black/10 animate-pulse" />
            <div className="h-10 w-full rounded-[3px] bg-black/10 animate-pulse" />
          </div>
        </div>
      </section>

      <section className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="h-5 w-40 rounded bg-black/10 animate-pulse" />
        </div>
        <div className="p-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 rounded-[3px] bg-black/10 animate-pulse" />
          ))}
        </div>
      </section>
    </div>
  );
}

function FeaturedPromoSkeleton() {
  return (
    <div className="rounded-[12px] overflow-hidden relative aspect-[3/4] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#a68b6a]/20 to-[#a68b6a]/5" />
      <div className="absolute bottom-3 left-3 z-20 w-[60%]">
        <div className="backdrop-blur-md bg-white/40 border border-white/20 rounded-[6px] p-3">
          <div className="h-2.5 w-16 rounded bg-black/10 animate-pulse" />
          <div className="mt-1.5 h-4 w-full rounded bg-black/10 animate-pulse" />
          <div className="mt-2 h-5 w-14 rounded-sm bg-black/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function FeaturedVendorSkeleton() {
  return (
    <div className="rounded-[12px] overflow-hidden relative aspect-[3/4] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#a68b6a]/20 to-[#a68b6a]/5" />
      <div className="absolute bottom-3 left-3 z-20 w-[60%]">
        <div className="backdrop-blur-md bg-white/40 border border-white/20 rounded-[6px] p-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-black/10 animate-pulse shrink-0" />
            <div className="min-w-0">
              <div className="h-2.5 w-20 rounded bg-black/10 animate-pulse" />
              <div className="mt-1 h-2 w-24 rounded bg-black/10 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingFeaturedSkeleton() {
  return (
    <div className="grid gap-8">
      <section className="mt-12 sm:mt-16">
        <div className="text-center">
          <div className="h-5 w-40 mx-auto rounded bg-black/10 animate-pulse" />
          <div className="mt-1 h-4 w-64 mx-auto rounded bg-black/10 animate-pulse" />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <FeaturedPromoSkeleton key={`promo-${i}`} />
          ))}
        </div>
        <div className="mt-6 text-center">
          <div className="h-4 w-28 mx-auto rounded bg-black/10 animate-pulse" />
        </div>
      </section>

      <div className="my-12 h-px bg-gradient-to-r from-transparent via-black/15 to-transparent" />

      <section className="mt-12 sm:mt-16">
        <div className="text-center">
          <div className="h-5 w-40 mx-auto rounded bg-black/10 animate-pulse" />
          <div className="mt-1 h-4 w-64 mx-auto rounded bg-black/10 animate-pulse" />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <FeaturedVendorSkeleton key={`vendor-${i}`} />
          ))}
        </div>
        <div className="mt-6 text-center">
          <div className="h-4 w-28 mx-auto rounded bg-black/10 animate-pulse" />
        </div>
      </section>
    </div>
  );
}

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

function LandingVendorsSkeleton() {
  return (
    <section className="mt-12 sm:mt-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="h-5 w-20 rounded bg-black/10 animate-pulse" />
          <div className="mt-1 h-4 w-64 rounded bg-black/10 animate-pulse" />
        </div>
        <div className="h-9 w-24 rounded-md border border-black/10 bg-white animate-pulse" />
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {Array.from({ length: 9 }).map((_, i) => (
          <VendorCardSkeleton key={i} />
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="h-3 w-20 rounded bg-black/10 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 w-16 rounded-md border border-black/10 bg-white animate-pulse" />
          <div className="h-9 w-16 rounded-md border border-black/10 bg-white animate-pulse" />
        </div>
      </div>
    </section>
  );
}

async function LandingTopData() {
  const [categoriesData, locationRows] = await Promise.all([
    getCachedCategories(),
    getCachedVendorLocations(),
  ]);

  const categories = categoriesData;
  const locations = Array.from(
    new Set(
      (locationRows as { city: string | null; location_text: string | null }[])
        .flatMap((r) => [r.city, r.location_text])
        .map((v) => (v ?? "").trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  return (
    <>
      <FadeInOnView>
        <HeroSection categories={categories} locations={locations} />
      </FadeInOnView>
      <FadeInOnView delayMs={60}>
        <CategoryBrowser categories={categories} />
      </FadeInOnView>
    </>
  );
}

async function LandingFeaturedData() {
  const supabase = createSupabaseServerClient();

  const [{ data: featuredVendors }, { data: featuredPromos }] = await Promise.all([
    supabase
      .from("vendors")
      .select(
        "id,business_name,slug,logo_url,average_rating,review_count,location_text,city,cover_focus_x,cover_focus_y,cover_zoom,plan:plans(id,name)"
      )
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("average_rating", { ascending: false })
      .limit(6),
    supabase
      .from("promos")
      .select(
        "id,title,summary,valid_from,valid_to,image_url,discount_percentage,image_focus_x,image_focus_y,image_zoom,vendors(business_name,slug)"
      )
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("updated_at", { ascending: false })
      .limit(24),
  ]);

  const vendors = (featuredVendors ?? []) as FeaturedVendor[];
  const promos = ((featuredPromos ?? []) as FeaturedPromo[]).filter(isPromoCurrentlyValid).slice(0, 4);

  const featuredWithCovers = await attachCoverImages(supabase, vendors);
  const featuredSorted = sortWithImagesFirst(featuredWithCovers as any);

  return (
    <>
      <FadeInOnView>
        <PromosSection promos={promos} />
      </FadeInOnView>
      <div className="my-12 h-px bg-gradient-to-r from-transparent via-black/15 to-transparent" />
      <FadeInOnView delayMs={60}>
        <FeaturedVendorsSection vendors={featuredSorted as any} />
      </FadeInOnView>
    </>
  );
}

async function LandingVendorsData({ page, pageSize, sort }: { page: number; pageSize: number; sort: SortKey }) {
  const supabase = createSupabaseServerClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from("vendors")
    .select(
      "id,business_name,slug,logo_url,average_rating,review_count,location_text,city,cover_focus_x,cover_focus_y,cover_zoom,plan:plans(id,name)",
      { count: "exact" }
    )
    .eq("is_active", true);

  if (sort === "alpha") {
    q = q.order("business_name", { ascending: true }).order("id", { ascending: true });
  } else {
    q = q
      .order("average_rating", { ascending: false, nullsFirst: false })
      .order("review_count", { ascending: false, nullsFirst: false })
      .order("business_name", { ascending: true })
      .order("id", { ascending: true });
  }

  q = q.range(from, to);

  const { data: vendors, count: vendorTotal } = await q;
  const vendorAllItems = (vendors ?? []) as VendorListItem[];
  const vendorTotalCount = vendorTotal ?? 0;

  const allWithCovers = await attachCoverImages(supabase, vendorAllItems);
  const pageSorted = sortWithImagesFirst(allWithCovers as any);

  return (
    <FadeInOnView>
      <VendorsSection vendors={pageSorted as any} total={vendorTotalCount} page={page} pageSize={pageSize} sort={sort} />
    </FadeInOnView>
  );
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};

  const pageSize = 9;
  const rawPage = (resolvedSearchParams.vendorsPage as string | undefined) ?? "1";
  const rawSort = (resolvedSearchParams.vendorsSort as string | undefined) ?? "rating";
  const page = Math.max(1, Number(rawPage) || 1);
  const sort: SortKey = rawSort === "alpha" ? "alpha" : "rating";


  return (
    <div
      style={{
        background: "#fafafa",
      }}
    >
      <ScrollToTopOnMount />
      <SiteHeader />

      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <main className="py-10 sm:py-14">
          <Suspense fallback={<LandingTopSkeleton />}>
            <LandingTopData />
          </Suspense>

          <div className="my-12 h-px bg-gradient-to-r from-transparent via-black/15 to-transparent" />

          <Suspense fallback={<LandingFeaturedSkeleton />}>
            <LandingFeaturedData />
          </Suspense>

          <div className="my-12 h-px bg-gradient-to-r from-transparent via-black/15 to-transparent" />

          <Suspense fallback={<LandingVendorsSkeleton />}>
            <LandingVendorsData page={page} pageSize={pageSize} sort={sort} />
          </Suspense>

        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
