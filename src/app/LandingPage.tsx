import { Suspense } from "react";
import { createSupabaseServerClient } from "../lib/supabaseServer";
import CategoryBrowser from "./CategoryBrowser";
import SiteHeader from "./sections/SiteHeader";
import HeroSection from "./sections/HeroSection";
import FeaturedVendorsSection from "../features/vendors/sections/FeaturedVendorsSection";
import PromosSection from "./sections/PromosSection";
import VendorsSection from "../features/vendors/sections/VendorsSection";
import VendorPlansSection from "./sections/VendorPlansSection";
import SiteFooter from "./sections/SiteFooter";
import { attachCoverImages } from "../features/vendors/coverImages.server";
import type { FeaturedVendor, VendorListItem } from "../features/vendors/types";
import FadeInOnView from "./components/FadeInOnView";
import ScrollToTopOnMount from "./components/ScrollToTopOnMount";

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

function LandingFeaturedSkeleton() {
  return (
    <div className="grid gap-8">
      <section className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="h-5 w-40 rounded bg-black/10 animate-pulse" />
        </div>
        <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
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

      <section className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="h-5 w-48 rounded bg-black/10 animate-pulse" />
        </div>
        <div className="p-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-[3px] border border-black/10 bg-[#fcfbf9] p-5">
              <div className="h-4 w-2/3 rounded bg-black/10 animate-pulse" />
              <div className="mt-2 h-3 w-full rounded bg-black/10 animate-pulse" />
              <div className="mt-2 h-3 w-4/5 rounded bg-black/10 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function LandingVendorsSkeleton() {
  return (
    <section className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-black/5">
        <div className="h-5 w-56 rounded bg-black/10 animate-pulse" />
        <div className="mt-2 h-4 w-72 rounded bg-black/10 animate-pulse" />
      </div>
      <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
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
  );
}

async function LandingTopData() {
  const supabase = createSupabaseServerClient();

  const [{ data: categoriesData }, { data: locationRows }] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name,slug,display_order")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true })
      .limit(200),
    supabase.from("vendors").select("city,location_text").eq("is_active", true).limit(2000),
  ]);

  const categories = (categoriesData ?? []) as Category[];
  const locations = Array.from(
    new Set(
      ((locationRows ?? []) as { city: string | null; location_text: string | null }[])
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

  const MAX_FETCH = 5000;
  const { data: allVendors, count: allCount } = await q.limit(MAX_FETCH);
  const vendorAllItems = (allVendors ?? []) as VendorListItem[];
  const vendorTotal = allCount ?? 0;

  const allWithCovers = await attachCoverImages(supabase, vendorAllItems);
  const allSorted = sortWithImagesFirst(allWithCovers as any);
  const pageSorted = allSorted.slice(from, to + 1);

  return (
    <FadeInOnView>
      <VendorsSection vendors={pageSorted as any} total={vendorTotal} page={page} pageSize={pageSize} sort={sort} />
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

  const planFeatures = [
    { label: "Company name, address & contact person", free: true, premium: true },
    { label: "Up to 3 searchable categories", free: true, premium: true },
    { label: "Ratings & reviews from couples", free: true, premium: true },
    { label: "Affiliations & associations", free: true, premium: true },
    { label: "Public email via contact form", free: true, premium: true },
    { label: "Admin email", free: false, premium: true },
    { label: "Public phone numbers", free: false, premium: true },
    { label: "Admin-only phone numbers", free: false, premium: true },
    { label: "Logo", free: false, premium: true },
    { label: "Website link", free: false, premium: true },
    { label: "Social media links", free: false, premium: true },
    { label: "1 photo album with up to 10 photos", free: true, premium: false },
    { label: "Unlimited albums & posts", free: false, premium: true },
    { label: "1 promotional deal per day", free: true, premium: false },
    { label: "Unlimited promotional deals", free: false, premium: true },
  ];

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

          <Suspense fallback={<LandingFeaturedSkeleton />}>
            <LandingFeaturedData />
          </Suspense>

          <Suspense fallback={<LandingVendorsSkeleton />}>
            <LandingVendorsData page={page} pageSize={pageSize} sort={sort} />
          </Suspense>

          <FadeInOnView>
            <VendorPlansSection planFeatures={planFeatures} />
          </FadeInOnView>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
