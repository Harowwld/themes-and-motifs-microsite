import { Suspense } from "react";
import { unstable_cache as next_unstable_cache } from "next/cache";
import { headers } from "next/headers";

const unstable_cache = process.env.NODE_ENV === "development"
  ? <T extends (...args: any[]) => Promise<any>>(fn: T) => fn
  : next_unstable_cache;
import { createSupabaseServerClient } from "../lib/supabaseServer";
import CategoryBrowser from "./components/CategoryBrowser";
import HeroSection from "./sections/HeroSection";
import FeaturedVendorsSection from "../features/vendors/sections/FeaturedVendorsSection";
import PromosSection from "./sections/PromosSection";
import VendorsSection from "../features/vendors/sections/VendorsSection";
import { attachCoverImages, attachAffiliations } from "../features/vendors/coverImages.server";
import SavedVendorsProvider from "../features/vendors/components/SavedVendorsProvider";
import type { FeaturedVendor, VendorListItem } from "../features/vendors/types";
import { getCachedVendorLocations } from "../lib/vendorUtils";
import ScrollToTopOnMount from "./components/ScrollToTopOnMount";
import FeaturedThemesSection from "./sections/FeaturedThemesSection";

// Cache categories for 1 hour (3600 seconds)
const getCachedCategories = unstable_cache(
  async () => {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("categories").select("id,name,slug,display_order").order("display_order", { ascending: true }).order("name", { ascending: true }).limit(200);
    return (data ?? []) as Category[];
  },
  ["categories"],
  { revalidate: 3600 }
);

// Cache featured vendors + promos for 5 minutes (300 seconds)
// These two queries + attachCoverImages + attachAffiliations previously ran
// fresh on every SSR render. Now served from the cache between revalidations.
  const getCachedFeaturedData = unstable_cache(
  async () => {
    const supabase = createSupabaseServerClient();
    const [{ data: featuredVendors }, { data: featuredPromos }, { data: recentImages }] = await Promise.all([
      supabase
        .from("vendors")
        .select(
          "id,business_name,slug,logo_url,average_rating,review_count,location_text,city,document_verified,cover_focus_x,cover_focus_y,cover_zoom,card_cover_focus_x,card_cover_focus_y,card_cover_zoom,portrait_cover_focus_x,portrait_cover_focus_y,portrait_cover_zoom,plan:plans(id,name)"
        )
        .eq("is_active", true)
        .eq("is_featured", true),
      supabase
        .from("promos")
        .select(
          "id,title,summary,valid_from,valid_to,image_url,discount_percentage,image_focus_x,image_focus_y,image_zoom,vendors(id,business_name,slug,logo_url)"
        )
        .eq("is_active", true)
        .eq("is_featured", true)
        .limit(20),
      supabase
        .from("vendor_images")
        .select("id, image_url, caption, themes!inner(id, name, slug), vendors!inner(business_name, slug)")
        .not("theme_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

    const vendors = (featuredVendors ?? []) as FeaturedVendor[];
    const promos = (featuredPromos ?? []) as FeaturedPromo[];

    const [vendorsWithCovers, vendorsWithAffiliations] = await Promise.all([
      attachCoverImages(supabase, vendors),
      attachAffiliations(supabase, vendors),
    ]);

    const vendorsWithData = vendors.map((v, index) => ({
      ...v,
      cover_image_url: vendorsWithCovers[index]?.cover_image_url ?? null,
      affiliations: vendorsWithAffiliations[index]?.affiliations ?? [],
    }));

    return { vendors: vendorsWithData, promos, themedIdeas: recentImages ?? [] };
  },
  ["featured-data-v3"],
  { revalidate: 300 }
);


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
    id: number;
    business_name: string;
    slug: string;
    logo_url?: string | null;
  }[];
};

type Category = {
  id: number;
  name: string;
  slug: string;
  display_order: number | null;
};

type SortKey = "alpha" | "rating" | "photos" | "newest";

function isPromoCurrentlyValid(promo: FeaturedPromo) {
  const now = new Date();
  const from = promo.valid_from ? new Date(`${promo.valid_from}T00:00:00Z`) : null;
  const to = promo.valid_to ? new Date(`${promo.valid_to}T23:59:59Z`) : null;

  if (from && now < from) return false;
  if (to && now > to) return false;
  return true;
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);

  const pageSize = isMobile ? 10 : 9;
  const rawPage = (resolvedSearchParams.vendorsPage as string | undefined) ?? "1";
  const rawSort = (resolvedSearchParams.vendorsSort as string | undefined) ?? "photos";
  const page = Math.max(1, Number(rawPage) || 1);
  const sort: SortKey = rawSort === "alpha" ? "alpha" : rawSort === "photos" ? "photos" : rawSort === "newest" ? "newest" : "rating";

  // Fetch data directly - cached so this is fast, no Suspense needed
  const [categoriesData, locationRows] = await Promise.all([
    getCachedCategories(),
    getCachedVendorLocations(),
  ]);

  const categories = categoriesData;
  const locations = Array.from(
    new Set(
      (locationRows as { region_id: number | null; city: string | null; location_text: string | null }[])
        .flatMap((r) => [r.city, r.location_text])
        .map((v) => (v ?? "").trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div
      style={{
        background: "#fafafa",
      }}
    >
      <ScrollToTopOnMount />

      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <main className="pt-6 pb-12 sm:py-14">
          {/* Top section - cached, no Suspense */}
          <HeroSection categories={categories} locations={locations} />
          <CategoryBrowser categories={categories} />

          <div className="my-6 sm:my-12 h-px bg-gradient-to-r from-transparent via-black/15 to-transparent" />

          {/* Featured section - now with Suspense for streaming */}
          <Suspense fallback={<div className="h-64 animate-pulse bg-gray-200 rounded-lg" />}>
            <LandingFeaturedDirect />
          </Suspense>

          <div className="my-6 sm:my-12 h-px bg-gradient-to-r from-transparent via-black/15 to-transparent" />

          {/* Vendors section - now with Suspense for streaming */}
          <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 rounded-lg" />}>
            <LandingVendorsDirect page={page} pageSize={pageSize} sort={sort} />
          </Suspense>

        </main>
      </div>
    </div>
  );
}

// Shuffle utility (pure — no side effects)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Direct data fetching component for featured section
// Data is served from getCachedFeaturedData() — zero DB round-trips for 5 min.
async function LandingFeaturedDirect() {
  const { vendors: cachedVendors, promos: cachedPromos, themedIdeas } = await getCachedFeaturedData();

  // Shuffle after reading from cache (so display order rotates on each render
  // without invalidating the cache).
  const vendors = shuffle(cachedVendors as FeaturedVendor[]);
  const promos = shuffle(cachedPromos).filter(isPromoCurrentlyValid);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const featuredSorted = sortWithImagesFirst(vendors as any);

  return (
    <>
      <PromosSection promos={promos} />
      <div className="my-6 sm:my-12 h-px bg-gradient-to-r from-transparent via-black/15 to-transparent" />
      <FeaturedThemesSection ideas={themedIdeas as any[]} />
      <div className="my-6 sm:my-12 h-px bg-gradient-to-r from-transparent via-black/15 to-transparent" />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <FeaturedVendorsSection vendors={featuredSorted as any} />
    </>
  );
}

// Direct data fetching component for vendors section
async function LandingVendorsDirect({ page, pageSize, sort }: { page: number; pageSize: number; sort: SortKey }) {
  const supabase = createSupabaseServerClient();

  // Fetch up to 6 pages of data (current + 5 pages ahead) to allow instant client-side paging
  const from = (page - 1) * pageSize;
  const to = from + (pageSize * 6) - 1;

  let q = supabase
    .from("vendors")
    .select(
      "id,business_name,slug,logo_url,average_rating,review_count,location_text,city,document_verified,cover_focus_x,cover_focus_y,cover_zoom,card_cover_focus_x,card_cover_focus_y,card_cover_zoom,portrait_cover_focus_x,portrait_cover_focus_y,portrait_cover_zoom,plan:plans(id,name)",
      { count: "exact" }
    )
    .eq("is_active", true);

  if (sort === "alpha") {
    q = q.order("business_name", { ascending: true }).order("id", { ascending: true });
  } else if (sort === "photos") {
    // Optimized: Use an inner join select to filter vendors that have a cover image in a single query
    q = supabase
      .from("vendors")
      .select(
        "id,business_name,slug,logo_url,average_rating,review_count,location_text,city,document_verified,cover_focus_x,cover_focus_y,cover_zoom,card_cover_focus_x,card_cover_focus_y,card_cover_zoom,portrait_cover_focus_x,portrait_cover_focus_y,portrait_cover_zoom,plan:plans(id,name),vendor_images!inner(id)",
        { count: "exact" }
      )
      .eq("is_active", true)
      .eq("vendor_images.is_cover", true)
      .order("business_name", { ascending: true })
      .order("id", { ascending: true }) as any;
  } else if (sort === "newest") {
    q = q.order("created_at", { ascending: false }).order("id", { ascending: true });
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageSorted = sortWithImagesFirst(allWithCovers as any);

  return (
    <SavedVendorsProvider>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <VendorsSection vendors={pageSorted as any} total={vendorTotalCount} page={page} pageSize={pageSize} sort={sort} />
    </SavedVendorsProvider>
  );
}
