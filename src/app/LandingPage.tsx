import { Suspense } from "react";
import { createSupabaseServerClient } from "../lib/supabaseServer";
import CategoryBrowser from "./CategoryBrowser";
import SiteHeader from "./sections/SiteHeader";
import HeroSection from "./sections/HeroSection";
import FeaturedVendorsSection from "./sections/FeaturedVendorsSection";
import PromosSection from "./sections/PromosSection";
import VendorsSection from "./sections/VendorsSection";
import VendorPlansSection from "./sections/VendorPlansSection";
import SiteFooter from "./sections/SiteFooter";

type FeaturedVendor = {
  id: number;
  business_name: string;
  slug: string;
  average_rating: number | null;
  review_count: number | null;
  location_text: string | null;
  city: string | null;
};

type FeaturedPromo = {
  id: number;
  title: string;
  summary: string | null;
  valid_from: string | null;
  valid_to: string | null;
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

type VendorListItem = {
  id: number;
  business_name: string;
  slug: string;
  average_rating: number | null;
  review_count: number | null;
  location_text: string | null;
  city: string | null;
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

export default async function LandingPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const supabase = createSupabaseServerClient();

  const resolvedSearchParams = searchParams ?? {};

  const pageSize = 9;
  const rawPage = (resolvedSearchParams.vendorsPage as string | undefined) ?? "1";
  const rawSort = (resolvedSearchParams.vendorsSort as string | undefined) ?? "rating";
  const page = Math.max(1, Number(rawPage) || 1);
  const sort: SortKey = rawSort === "alpha" ? "alpha" : "rating";

  const planFeatures = [
    { label: "Company name + address + contact person", free: true, premium: true },
    { label: "Up to 3 categories (searchable)", free: true, premium: true },
    { label: "Ratings + reviews (from couples)", free: true, premium: true },
    { label: "Affiliations/associations", free: true, premium: true },
    { label: "Public email via contact form", free: true, premium: true },
    { label: "Admin email", free: false, premium: true },
    { label: "Phone numbers (public)", free: false, premium: true },
    { label: "Phone numbers (admin)", free: false, premium: true },
    { label: "Logo", free: false, premium: true },
    { label: "Website", free: false, premium: true },
    {
      label: "Social links (Facebook, Instagram, TikTok, X, Pinterest, YouTube)",
      free: false,
      premium: true,
    },
    { label: "Album: 1 album (max 10 photos)", free: true, premium: false },
    { label: "Album: unlimited (album + posts)", free: false, premium: true },
    { label: "Exclusive deal: 1 promo/day (text + image)", free: true, premium: false },
    { label: "Exclusive deals/marketplace: unlimited promos", free: false, premium: true },
  ];

  const [
    { data: featuredVendors },
    { data: featuredPromos },
    { data: categoriesData },
    { data: locationRows },
    { data: pagedVendors, count: pagedVendorsCount },
  ] = await Promise.all([
      supabase
        .from("vendors")
        .select("id,business_name,slug,average_rating,review_count,location_text,city")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("average_rating", { ascending: false })
        .limit(6),
      supabase
        .from("promos")
        .select("id,title,summary,valid_from,valid_to,vendors(business_name,slug)")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("updated_at", { ascending: false })
        .limit(24),
      supabase
        .from("categories")
        .select("id,name,slug,display_order")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true })
        .limit(200),
      supabase.from("vendors").select("city,location_text").eq("is_active", true).limit(2000),
      (() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let q = supabase
          .from("vendors")
          .select("id,business_name,slug,average_rating,review_count,location_text,city", { count: "exact" })
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

        return q.range(from, to);
      })(),
    ]);

  const vendors = (featuredVendors ?? []) as FeaturedVendor[];
  const vendorPageItems = (pagedVendors ?? []) as VendorListItem[];
  const vendorTotal = pagedVendorsCount ?? 0;
  const promos = ((featuredPromos ?? []) as FeaturedPromo[]).filter(isPromoCurrentlyValid).slice(0, 4);
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
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(circle at 20% 10%, #fff7ed, #fcfbf9 42%, #f6f1ea 92%)",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SiteHeader />

        <main className="py-10 sm:py-14">
          <HeroSection categories={categories} locations={locations} />
          <Suspense fallback={null}>
            <CategoryBrowser categories={categories} />
          </Suspense>
          <FeaturedVendorsSection vendors={vendors} />
          <PromosSection promos={promos} />
          <VendorsSection vendors={vendorPageItems} total={vendorTotal} page={page} pageSize={pageSize} sort={sort} />
          <VendorPlansSection planFeatures={planFeatures} />
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
