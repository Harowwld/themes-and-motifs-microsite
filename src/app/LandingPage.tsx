import { unstable_cache } from "next/cache";
import { createSupabaseServerClient } from "../lib/supabaseServer";
import CategoryBrowser from "./components/CategoryBrowser";
import HeroSection from "./sections/HeroSection";
import FeaturedVendorsSection from "../features/vendors/sections/FeaturedVendorsSection";
import PromosSection from "./sections/PromosSection";
import VendorsSection from "../features/vendors/sections/VendorsSection";
import { attachCoverImages, attachAffiliations } from "../features/vendors/coverImages.server";
import type { FeaturedVendor, VendorListItem } from "../features/vendors/types";
import { getCachedVendorLocations } from "../lib/vendorUtils";
import FadeInOnView from "./components/FadeInOnView";
import ScrollToTopOnMount from "./components/ScrollToTopOnMount";

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

  const pageSize = 9;
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
        <main className="py-10 sm:py-14">
          {/* Top section - cached, no Suspense */}
          <FadeInOnView>
            <HeroSection categories={categories} locations={locations} />
          </FadeInOnView>
          <FadeInOnView delayMs={60}>
            <CategoryBrowser categories={categories} />
          </FadeInOnView>

          <div className="my-12 h-px bg-gradient-to-r from-transparent via-black/15 to-transparent" />

          {/* Featured section - cached, no Suspense */}
          <LandingFeaturedDirect />

          <div className="my-12 h-px bg-gradient-to-r from-transparent via-black/15 to-transparent" />

          {/* Vendors section - cached, no Suspense */}
          <LandingVendorsDirect page={page} pageSize={pageSize} sort={sort} />

        </main>
      </div>
    </div>
  );
}

// Direct data fetching component for featured section
async function LandingFeaturedDirect() {
  const supabase = createSupabaseServerClient();

  const [{ data: featuredVendors }, { data: featuredPromos }] = await Promise.all([
    supabase
      .from("vendors")
      .select(
        "id,business_name,slug,logo_url,average_rating,review_count,location_text,city,cover_focus_x,cover_focus_y,cover_zoom,plan:plans(id,name)"
      )
      .eq("is_active", true)
      .eq("is_featured", true)
      .limit(20),
    supabase
      .from("promos")
      .select(
        "id,title,summary,valid_from,valid_to,image_url,discount_percentage,image_focus_x,image_focus_y,image_zoom,vendors(business_name,slug)"
      )
      .eq("is_active", true)
      .eq("is_featured", true)
      .limit(20),
  ]);

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const vendors = shuffle((featuredVendors ?? []) as FeaturedVendor[]).slice(0, 6);
  const promos = shuffle((featuredPromos ?? []) as FeaturedPromo[]).filter(isPromoCurrentlyValid).slice(0, 4);

  const featuredWithCovers = await attachCoverImages(supabase, vendors);
  const featuredWithAffiliations = await attachAffiliations(supabase, featuredWithCovers);
  const featuredSorted = sortWithImagesFirst(featuredWithAffiliations as any);

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

// Direct data fetching component for vendors section
async function LandingVendorsDirect({ page, pageSize, sort }: { page: number; pageSize: number; sort: SortKey }) {
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
  } else if (sort === "photos") {
    const { data: vendorIdsWithCover } = await supabase.from("vendor_images").select("vendor_id").eq("is_cover", true);
    const idsWithCover = (vendorIdsWithCover ?? []).map((r) => r.vendor_id);
    q = q.in("id", idsWithCover).order("business_name", { ascending: true }).order("id", { ascending: true });
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
  const pageSorted = sortWithImagesFirst(allWithCovers as any);

  return (
    <FadeInOnView>
      <VendorsSection vendors={pageSorted as any} total={vendorTotalCount} page={page} pageSize={pageSize} sort={sort} />
    </FadeInOnView>
  );
}
