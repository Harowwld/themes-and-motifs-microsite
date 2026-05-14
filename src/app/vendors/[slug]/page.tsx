import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createSupabaseServerClient } from "../../../lib/supabaseServer";
import VendorProfileUI from "../../../features/vendors/components/VendorProfileUI";

export const dynamic = "force-dynamic";

type VendorRow = {
  id: number;
  business_name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  location_text: string | null;
  city: string | null;
  address: string | null;
  website_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  sec_dti_number: string | null;
  average_rating: number | null;
  review_count: number | null;
  save_count: number | null;
  verified_status: boolean | null;
  document_verified: string | null;
  user_id: string | null;
  updated_at: string;
  plan?: { id: number; name: string } | { id: number; name: string }[] | null;
};

type VendorImageRow = {
  id: number;
  image_url: string;
  caption: string | null;
  is_cover: boolean | null;
  display_order: number | null;
  media_type: 'image' | 'video' | null;
};

type VendorSocialLinkRow = {
  id: number;
  platform: string;
  url: string;
};

type PromoRow = {
  id: number;
  title: string;
  summary: string | null;
  terms: string | null;
  valid_from: string | null;
  valid_to: string | null;
  image_url: string | null;
  discount_percentage: number | null;
  image_focus_x: number | null;
  image_focus_y: number | null;
  image_zoom: number | null;
};

type ReviewRow = {
  id: number;
  rating: number;
  review_text: string | null;
  created_at: string;
  users?: {
    email: string;
  }[] | null;
};

type ThemeRow = {
  id: number;
  name: string;
  slug: string;
};

type Props = {
  params: Promise<{ slug: string }>;
};



function isPromoCurrentlyValid(promo: Pick<PromoRow, "valid_from" | "valid_to">) {
  const now = new Date();
  const from = promo.valid_from ? new Date(`${promo.valid_from}T00:00:00Z`) : null;
  const to = promo.valid_to ? new Date(`${promo.valid_to}T23:59:59Z`) : null;
  if (from && now < from) return false;
  if (to && now > to) return false;
  return true;
}

function VendorDetailSkeleton() {
  return (
    <main className="py-10 sm:py-14">
      <section className="rounded-xl border border-black/6 bg-[#fcfbf9] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="h-56 sm:h-72 bg-gradient-to-br from-[#a68b6a]/20 to-[#a68b6a]/5 animate-pulse" />
        <div className="p-6">
          <div className="h-4 w-40 rounded bg-black/10 animate-pulse" />
          <div className="mt-3 h-8 w-2/3 rounded bg-black/10 animate-pulse" />
          <div className="mt-4 grid gap-2">
            <div className="h-4 w-full rounded bg-black/10 animate-pulse" />
            <div className="h-4 w-11/12 rounded bg-black/10 animate-pulse" />
            <div className="h-4 w-9/12 rounded bg-black/10 animate-pulse" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-7 w-24 rounded-full bg-black/10 animate-pulse" />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 w-9 rounded-lg bg-black/10 animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="h-6 w-32 rounded bg-black/10 animate-pulse" />
        <div className="mt-2 h-4 w-72 rounded bg-black/10 animate-pulse" />
        <div className="mt-4 grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-black/6 bg-[#fcfbf9] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] p-5">
              <div className="h-4 w-40 rounded bg-black/10 animate-pulse" />
              <div className="mt-3 h-4 w-full rounded bg-black/10 animate-pulse" />
              <div className="mt-2 h-4 w-10/12 rounded bg-black/10 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

async function VendorDetailData({ slug }: { slug: string }) {
  const supabase = createSupabaseServerClient();

  const { data: vendor } = await supabase
    .from("vendors")
    .select(
      "id,business_name,slug,logo_url,description,location_text,city,address,website_url,contact_email,contact_phone,sec_dti_number,average_rating,review_count,save_count,verified_status,document_verified,user_id,updated_at,plan:plans(id,name)"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle<VendorRow>();

  if (!vendor?.id) notFound();

  // Add cache-busting timestamp for images
const cacheBuster = Date.now();
const [categoriesRes, affiliationsRes, imagesRes, socialsRes, reviewsRes, promosRes, themesRes] = await Promise.all([
    supabase
      .from("vendor_categories")
      .select("category:categories(id,name,slug)")
      .eq("vendor_id", vendor.id)
      .limit(10),
    supabase
      .from("vendor_affiliations")
      .select("affiliation:affiliations(id,name,slug)")
      .eq("vendor_id", vendor.id)
      .limit(50),
    supabase
      .from("vendor_images")
      .select("id,image_url,caption,is_cover,display_order,media_type")
      .eq("vendor_id", vendor.id)
      .order("is_cover", { ascending: false })
      .order("display_order", { ascending: true })
      .limit(24),
    supabase
      .from("vendor_social_links")
      .select("id,platform,url")
      .eq("vendor_id", vendor.id)
      .order("platform", { ascending: true })
      .limit(20),
    supabase
      .from("reviews")
      .select("id,rating,review_text,created_at,users(email)")
      .eq("vendor_id", vendor.id)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("promos")
      .select("id,title,summary,terms,valid_from,valid_to,image_url,discount_percentage,image_focus_x,image_focus_y,image_zoom,is_active")
      .eq("vendor_id", vendor.id)
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(24),
    supabase
      .from("vendor_themes")
      .select("theme:themes(id,name,slug)")
      .eq("vendor_id", vendor.id)
      .limit(20),
  ]);

  const categoryLinks = (categoriesRes.data ?? []) as unknown as {
    category: { id: number; name: string; slug: string } | { id: number; name: string; slug: string }[] | null;
  }[];
  const affiliationLinks = (affiliationsRes.data ?? []) as unknown as {
    affiliation: { id: number; name: string; slug: string } | { id: number; name: string; slug: string }[] | null;
  }[];
  const images = (imagesRes.data ?? []) as VendorImageRow[];
  const socials = (socialsRes.data ?? []) as VendorSocialLinkRow[];
  const reviews = (reviewsRes.data ?? []) as unknown as ReviewRow[];
  const promos = ((promosRes.data ?? []) as PromoRow[]).filter(isPromoCurrentlyValid).slice(0, 12);
  const themeLinks = (themesRes.data ?? []) as unknown as {
    theme: { id: number; name: string; slug: string } | { id: number; name: string; slug: string }[] | null;
  }[];

  const categories = categoryLinks
    .flatMap((r) => (Array.isArray(r.category) ? r.category : r.category ? [r.category] : []))
    .filter(Boolean);

  const affiliations = affiliationLinks
    .flatMap((r) => (Array.isArray(r.affiliation) ? r.affiliation : r.affiliation ? [r.affiliation] : []))
    .filter(Boolean);

  const themes = themeLinks
    .flatMap((r) => (Array.isArray(r.theme) ? r.theme : r.theme ? [r.theme] : []))
    .filter(Boolean);

  const planName = String((Array.isArray(vendor.plan) ? vendor.plan?.[0]?.name : vendor.plan?.name) ?? "")
    .trim()
    .toLowerCase();

  return (
    <VendorProfileUI
      vendor={{
        id: vendor.id,
        business_name: vendor.business_name,
        slug: vendor.slug,
        logo_url: vendor.logo_url,
        description: vendor.description,
        location_text: vendor.location_text,
        city: vendor.city,
        address: vendor.address,
        website_url: vendor.website_url,
        contact_email: vendor.contact_email,
        contact_phone: vendor.contact_phone,
        average_rating: vendor.average_rating,
        review_count: vendor.review_count,
        save_count: vendor.save_count,
        document_verified: vendor.document_verified,
        user_id: vendor.user_id,
        updated_at: vendor.updated_at,
        plan_name: planName,
      }}
      categories={categories as any}
      affiliations={affiliations as any}
      themes={themes as any}
      images={images as any}
      socials={socials}
      reviews={reviews as any}
      promos={promos}
    />
  );
}

export default async function VendorDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <div
      className="min-h-screen bg-[#fafafa]"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Suspense fallback={<VendorDetailSkeleton />}>
          <VendorDetailData slug={slug} />
        </Suspense>
      </div>
    </div>
  );
}


