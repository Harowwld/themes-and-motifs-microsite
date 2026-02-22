import { notFound } from "next/navigation";
import { Suspense } from "react";

import SiteHeader from "../../sections/SiteHeader";
import SiteFooter from "../../sections/SiteFooter";
import { createSupabaseServerClient } from "../../../lib/supabaseServer";
import VendorPhotosCarousel from "../../../features/vendors/components/VendorPhotosCarousel";
import ContactVendorForm from "../../../features/vendors/components/ContactVendorForm";

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
  average_rating: number | null;
  review_count: number | null;
  plan?: { id: number; name: string } | { id: number; name: string }[] | null;
};

type VendorImageRow = {
  id: number;
  image_url: string;
  caption: string | null;
  is_cover: boolean | null;
  display_order: number | null;
};

type VendorSocialLinkRow = {
  id: number;
  platform: string;
  url: string;
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

type Props = {
  params: Promise<{ slug: string }>;
};

function VendorDetailSkeleton() {
  return (
    <main className="py-10 sm:py-14">
      <section className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="h-32 sm:h-40 bg-black/10 animate-pulse" />
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
              <div key={i} className="h-7 w-24 rounded-[999px] bg-black/10 animate-pulse" />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 w-9 rounded bg-black/10 animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="h-6 w-32 rounded bg-black/10 animate-pulse" />
        <div className="mt-2 h-4 w-72 rounded bg-black/10 animate-pulse" />
        <div className="mt-4 grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[3px] border border-black/10 bg-white shadow-sm p-5">
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
      "id,business_name,slug,logo_url,description,location_text,city,address,website_url,contact_email,contact_phone,average_rating,review_count,plan:plans(id,name)"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle<VendorRow>();

  if (!vendor?.id) notFound();

  const [categoriesRes, affiliationsRes, imagesRes, socialsRes, reviewsRes] = await Promise.all([
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
      .select("id,image_url,caption,is_cover,display_order")
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

  const categories = categoryLinks
    .flatMap((r) => (Array.isArray(r.category) ? r.category : r.category ? [r.category] : []))
    .filter(Boolean);

  const affiliations = affiliationLinks
    .flatMap((r) => (Array.isArray(r.affiliation) ? r.affiliation : r.affiliation ? [r.affiliation] : []))
    .filter(Boolean);

  const location = vendor.city ?? vendor.location_text;
  const cover = images.find((i) => i.is_cover) ?? images[0];

  const planName = String((Array.isArray(vendor.plan) ? vendor.plan?.[0]?.name : vendor.plan?.name) ?? "")
    .trim()
    .toLowerCase();
  const isPremium = planName.includes("premium");

  return (
    <main className="py-10 sm:py-14">
      <section className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div
          className="h-32 sm:h-40"
          style={{
            background: cover
              ? `linear-gradient(135deg, rgba(166,124,82,0.18), rgba(255,255,255,0.9)), url(${cover.image_url}) center/cover no-repeat`
              : "linear-gradient(135deg, rgba(166,124,82,0.18), rgba(255,255,255,0.9))",
          }}
        />

        <div className="p-6">
          <div className="text-[12px] font-semibold text-black/45">{location ? location : "Philippines"}</div>
          <div className="mt-1 flex items-center gap-3">
            {isPremium && vendor.logo_url ? (
              <img
                src={vendor.logo_url}
                alt={`${vendor.business_name} logo`}
                className="h-12 w-12 rounded-[3px] border border-black/10 bg-white object-contain"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : null}
            <h1 className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.02em] text-[#2c2c2c]">{vendor.business_name}</h1>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-semibold text-black/55">
            <span>
              <span className="text-[#a67c52]">{(vendor.average_rating ?? 0).toFixed(1)}</span> · {vendor.review_count ?? 0} reviews
            </span>
            {isPremium && vendor.website_url ? (
              <a className="text-[#6e4f33] hover:underline" href={withProtocol(vendor.website_url)} target="_blank" rel="noreferrer">
                Website
              </a>
            ) : null}
            {isPremium && vendor.contact_phone ? (
              <a className="text-[#6e4f33] hover:underline" href={`tel:${vendor.contact_phone}`}>
                Call
              </a>
            ) : null}
            {vendor.contact_email ? (
              <ContactVendorForm vendorId={vendor.id} vendorName={vendor.business_name} />
            ) : null}
          </div>

          {vendor.description ? <p className="mt-4 text-[14px] leading-7 text-black/60">{vendor.description}</p> : null}

          {categories.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((c) => (
                <a
                  key={c.id}
                  className="inline-flex items-center rounded-[999px] border border-[#a67c52]/35 bg-[#fffaf5] px-3 py-1 text-[12px] font-semibold text-[#6e4f33] hover:bg-[#f8f1e8] transition-colors"
                  href={`/vendors?category=${encodeURIComponent(c.slug)}`}
                >
                  {c.name}
                </a>
              ))}
            </div>
          ) : null}

          {affiliations.length > 0 ? (
            <div className="mt-4 text-[13px] text-black/60">
              <span className="font-semibold text-black/45">Affiliations:</span> {affiliations.map((a) => a.name).join(", ")}
            </div>
          ) : null}

          {isPremium && socials.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {socials.map((s) => (
                <a
                  key={s.id}
                  className="inline-flex h-9 w-9 items-center justify-center text-[#6e4f33] hover:text-[#a67c52] transition-colors"
                  href={withProtocol(s.url)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={formatPlatform(s.platform)}
                  title={formatPlatform(s.platform)}
                >
                  <span className="sr-only">{formatPlatform(s.platform)}</span>
                  {getPlatformIcon(s.platform)}
                </a>
              ))}
            </div>
          ) : null}

          {vendor.address ? (
            <div className="mt-4 text-[13px] text-black/60">
              <span className="font-semibold text-black/45">Address:</span> {vendor.address}
            </div>
          ) : null}
        </div>
      </section>

      {images.length > 0 ? <VendorPhotosCarousel images={images} /> : null}

      <section className="mt-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Reviews</h2>
            <p className="mt-1 text-[13px] text-black/55 max-w-xl">Recent reviews from couples.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          {reviews.length === 0 ? (
            <div className="rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
              <div className="text-[13px] font-semibold text-[#2c2c2c]">No reviews yet</div>
              <div className="mt-1 text-[13px] text-black/55">Be the first to review this vendor.</div>
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="rounded-[3px] border border-black/10 bg-white shadow-sm p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[12px] font-semibold text-black/45">{r.users?.[0]?.email ? maskEmail(r.users[0].email) : "Verified couple"}</div>
                  <div className="text-[12px] font-semibold text-black/55">{r.rating} / 5</div>
                </div>
                {r.review_text ? <div className="mt-3 text-[13px] leading-7 text-black/60">{r.review_text}</div> : null}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default async function VendorDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(circle at 20% 10%, #fff7ed, #fcfbf9 42%, #f6f1ea 92%)",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SiteHeader />

        <Suspense fallback={<VendorDetailSkeleton />}>
          <VendorDetailData slug={slug} />
        </Suspense>

        <SiteFooter />
      </div>
    </div>
  );
}

function withProtocol(url: string) {
  const v = url.trim();
  if (!v) return v;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
}

function formatPlatform(platform: string) {
  const v = (platform ?? "").trim();
  if (!v) return "Social";
  return v.charAt(0).toUpperCase() + v.slice(1);
}

function normalizePlatform(platform: string) {
  return (platform ?? "").trim().toLowerCase();
}

function getPlatformIcon(platform: string) {
  const p = normalizePlatform(platform);
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (p === "facebook" || p === "fb") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          fill="currentColor"
          d="M13.5 22v-8h2.7l.4-3H13.5V9.1c0-.9.2-1.5 1.5-1.5h1.6V5c-.3 0-1.4-.1-2.6-.1-2.6 0-4.3 1.6-4.3 4.5V11H7v3h2.1v8h4.4Z"
        />
      </svg>
    );
  }

  if (p === "instagram" || p === "ig") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" {...common}>
        <rect x="7" y="7" width="10" height="10" rx="3" />
        <path d="M16.5 7.5h.01" />
        <path d="M12 10.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z" />
      </svg>
    );
  }

  if (p === "x" || p === "twitter") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          fill="currentColor"
          d="M18.8 4H20l-6.6 7.5L21 20h-6.2l-3.8-4.5L6.9 20H4l7.1-8.1L3 4h6.4l3.4 4.1L18.8 4Zm-2.2 14.4h1.7L9.3 5.5H7.5l9.1 12.9Z"
        />
      </svg>
    );
  }

  if (p === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" {...common}>
        <path d="M14 6c1 1.5 2.3 2.4 4 2.6" />
        <path d="M14 6v9.5a3.5 3.5 0 1 1-3-3.5" />
      </svg>
    );
  }

  if (p === "youtube") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" {...common}>
        <path d="M22 12s0-3.1-.4-4.5a3 3 0 0 0-2.1-2.1C18 5 12 5 12 5s-6 0-7.5.4A3 3 0 0 0 2.4 7.5C2 8.9 2 12 2 12s0 3.1.4 4.5a3 3 0 0 0 2.1 2.1C6 19 12 19 12 19s6 0 7.5-.4a3 3 0 0 0 2.1-2.1c.4-1.4.4-4.5.4-4.5Z" />
        <path d="M10 15V9l5 3-5 3Z" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (p === "pinterest") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" {...common}>
        <path d="M12 21c3.9 0 7-3.1 7-7 0-4-3.1-7-7-7s-7 3-7 7c0 3 1.8 5.5 4.4 6.5" />
        <path d="M10.6 19.2 12 13.4" />
        <path d="M14.5 10.4c.4 2-1 3.9-2.7 3.9-1.3 0-2.1-1.1-1.7-2.4.3-1.1.9-2.3.9-3.1 0-.7-.4-1.3-1.3-1.3-1 0-1.9 1-1.9 2.4" />
      </svg>
    );
  }

  if (p === "website" || p === "site" || p === "link") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c2.5 2.6 4 5.7 4 9s-1.5 6.4-4 9" />
        <path d="M12 3c-2.5 2.6-4 5.7-4 9s1.5 6.4 4 9" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" {...common}>
      <path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1" />
      <path d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1" />
    </svg>
  );
}

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "User";
  const maskedUser = user.length <= 2 ? `${user[0]}*` : `${user.slice(0, 2)}***`;
  return `${maskedUser}@${domain}`;
}
