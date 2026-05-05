import { notFound } from "next/navigation";
import { Suspense } from "react";

import { createSupabaseServerClient } from "../../../lib/supabaseServer";
import VendorPhotosCarousel from "../../../features/vendors/components/VendorPhotosCarousel";
import ContactVendorForm from "../../../features/vendors/components/ContactVendorForm";
import SaveVendorButton from "../../../features/vendors/components/SaveVendorButton";
import ClaimVendorButton from "../../../features/vendors/components/ClaimVendorButton";
import VendorReviewForm from "./VendorReviewForm";
import FadeInOnView from "../../components/FadeInOnView";

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
  verified_status: string | null;
  document_verified: boolean | null;
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

function proxiedImageUrl(url: string) {
  const u = (url ?? "").trim();
  if (!u) return u;
  if (u.includes("drive.google.com")) {
    return `/api/image-proxy?url=${encodeURIComponent(u)}`;
  }
  return u;
}

function clampPct(v: number) {
  if (!Number.isFinite(v)) return 50;
  return Math.max(0, Math.min(100, v));
}

function clampZoom(v: number) {
  if (!Number.isFinite(v)) return 1;
  return Math.max(1, Math.min(3, v));
}

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

  const location = vendor.city ?? vendor.location_text;
  const cover = images.find((i) => i.is_cover) ?? images[0];
  const coverUrl = cover?.image_url ? proxiedImageUrl(cover.image_url) : "";
  const logoUrl = vendor.logo_url ? proxiedImageUrl(vendor.logo_url) : null;

  const planName = String((Array.isArray(vendor.plan) ? vendor.plan?.[0]?.name : vendor.plan?.name) ?? "")
    .trim()
    .toLowerCase();
  const isPremium = planName.includes("premium");
  const websiteTooltip = "Website link is available for Premium vendors.";

  function formatDate(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  }

  return (
    <main className="pb-10 sm:pb-14">
      {/* Hero Section with Cover */}
      <FadeInOnView>
        <section className="relative">
          <div
            className="h-56 sm:h-72 w-full shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
            style={{
              background: cover
                ? `url(${coverUrl}) center/cover no-repeat`
                : "linear-gradient(135deg, rgba(166,139,106,0.2), rgba(166,139,106,0.05))",
            }}
          />
        </section>
      </FadeInOnView>

      {/* Profile Header */}
      <FadeInOnView>
        <section className="relative -mt-20 sm:-mt-24 px-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-end gap-4">
              {/* Logo */}
              <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-2xl border-4 border-white bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] overflow-hidden flex items-center justify-center shrink-0 -mb-2">
                {logoUrl || vendor.logo_url ? (
                  <img
                    src={logoUrl ?? vendor.logo_url ?? ""}
                    alt={`${vendor.business_name} logo`}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-full w-full bg-[#fcfbf9] flex items-center justify-center text-[28px] font-bold text-[#a68b6a]">
                    {vendor.business_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex-1 flex items-center justify-end gap-2 pb-2" />
            </div>

            {/* Business Info */}
            <div className="mt-5">
              <h1 className="font-serif text-[26px] sm:text-[34px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
                <span className="inline-flex items-center gap-2">
                  <span>{vendor.business_name}</span>
                  {isPremium ? (
                    <span
                      className="inline-flex items-center justify-center h-5 w-5"
                      title="Verified Premium Vendor"
                      aria-label="Verified Premium Vendor"
                    >
                      <img
                        src="/Icons/hd-blue-badge-verified-tick-mark-png-704081694710438adyvtbqafw.png"
                        alt="Verified"
                        className="h-full w-full"
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                      />
                    </span>
                  ) : null}
                </span>
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[14px] text-black/55">
                {location ? (
                  <span className="flex items-center gap-1.5">
                    <MapPinIcon className="h-4 w-4" />
                    {location}
                  </span>
                ) : null}
                <span className="flex items-center gap-1">
                  <StarIcon className="h-4 w-4 text-[#a68b6a]" />
                  <span className="font-semibold text-[#a68b6a]">{(vendor.average_rating ?? 0).toFixed(1)}</span>
                  <span>· {vendor.review_count ?? 0} reviews</span>
                  {vendor.save_count && vendor.save_count > 0 ? (
                    <span className="text-black/40">· {vendor.save_count} saved</span>
                  ) : null}
                </span>
                {affiliations.length > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <span className="text-black/40">·</span>
                    <span className="text-black/55">affiliated with {affiliations.map(a => a.name).join(" · ")}</span>
                  </span>
                ) : null}
              </div>

              {/* Category Pills */}
              {categories.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <a
                      key={c.id}
                      className="inline-flex items-center rounded-full border border-[#a68b6a]/25 bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#6e4f33] hover:bg-[#fffaf5] transition-all duration-300 shadow-sm hover:shadow-md"
                      href={`/vendors?category=${encodeURIComponent(c.slug)}`}
                    >
                      {c.name}
                    </a>
                  ))}
                </div>
              ) : null}

              {/* Theme Pills */}
              {themes.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {themes.map((t) => (
                    <a
                      key={t.id}
                      className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50/50 px-3.5 py-1.5 text-[12px] font-medium text-purple-700 hover:bg-purple-50 transition-all duration-300 shadow-sm hover:shadow-md"
                      href={`/vendors?theme=${encodeURIComponent(t.slug)}`}
                    >
                      <SparklesIcon className="h-3 w-3 mr-1.5" />
                      {t.name}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </FadeInOnView>

      {/* Content Grid */}
      <FadeInOnView>
        <section className="mt-8 px-4 sm:px-6">
          <div className="mx-auto max-w-4xl grid gap-6 lg:grid-cols-[1fr_320px] lg:gap-8">
            {/* Main Content */}
            <div className="grid gap-6">
              {/* About */}
              {vendor.description ? (
                <div className="rounded-xl border border-black/6 bg-[#fcfbf9] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
                  <h2 className="font-serif text-[18px] font-semibold text-[#2c2c2c]">About</h2>
                  <p className="mt-3 text-[14px] leading-7 text-black/65 whitespace-pre-line">
                    {vendor.description}
                  </p>
                </div>
              ) : null}

              {/* Photos - no label, carousel has its own */}
              {images.length > 0 ? (
                <div className="rounded-xl border border-black/6 bg-[#fcfbf9] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
                  <VendorPhotosCarousel images={images} />
                </div>
              ) : null}

              {/* Exclusive Deals / Marketplace */}
              {promos.length > 0 ? (
                <div className="rounded-xl border border-black/6 bg-[#fcfbf9] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
                  <h2 className="font-serif text-[18px] font-semibold text-[#2c2c2c]">Exclusive Deals</h2>
                  <p className="mt-1 text-[13px] text-black/55">Promos and marketplace deals from this vendor.</p>
                  <div className="mt-4 grid gap-3">
                    {promos.map((p) => (
                      <div key={p.id} className="rounded-md border-2 border-dashed border-[#c17a4e]/40 bg-linear-to-br from-[#fff7ed] to-white overflow-hidden relative">
                        {/* Promo Badge */}
                        <div className="absolute top-0 left-0 z-10">
                          <div className="bg-[#c17a4e] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-br-md">
                            PROMO
                          </div>
                        </div>

                        <div className="flex">
                          {/* Left: Image */}
                          {p.image_url ? (
                            <div className="w-24 sm:w-28 shrink-0 relative overflow-hidden">
                              <div className="h-full min-h-25">
                                <img
                                  src={proxiedImageUrl(p.image_url)}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  style={{
                                    transformOrigin: `${clampPct(Number(p.image_focus_x ?? 50))}% ${clampPct(Number(p.image_focus_y ?? 50))}%`,
                                    transform: `scale(${clampZoom(Number(p.image_zoom ?? 1))})`,
                                  }}
                                  loading="lazy"
                                  decoding="async"
                                  referrerPolicy="no-referrer"
                                  draggable={false}
                                />
                              </div>
                            </div>
                          ) : null}

                          {/* Right: Content */}
                          <div className="flex-1 p-3.5">
                            <div className="text-[11px] font-semibold text-[#a67c52] uppercase tracking-wide">
                              Exclusive Deal
                            </div>

                            <div className="mt-0.5 text-[14px] font-bold text-[#2c2c2c] leading-tight">
                              {p.title}
                            </div>

                            {p.summary ? (
                              <div className="mt-1 text-[12px] text-black/60 line-clamp-2">
                                {p.summary}
                              </div>
                            ) : null}

                            <div className="mt-2 flex items-center justify-between">
                              {typeof p.discount_percentage === "number" ? (
                                <span className="inline-flex items-center rounded-sm bg-[#c17a4e] px-2 py-0.5 text-[11px] font-bold text-white">
                                  {p.discount_percentage}% OFF
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#c17a4e]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#c17a4e] animate-pulse" aria-hidden />
                                  Limited Time
                                </span>
                              )}
                            </div>

                            {(p.valid_from || p.valid_to) ? (
                              <div className="mt-2 text-[11px] text-black/45">
                                {p.valid_from ? `From ${formatDate(p.valid_from)}` : null}
                                {p.valid_from && p.valid_to ? " · " : null}
                                {p.valid_to ? `Until ${formatDate(p.valid_to)}` : null}
                              </div>
                            ) : null}

                            {p.terms ? <div className="mt-2 text-[11px] leading-5 text-black/50 whitespace-pre-line">{p.terms}</div> : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Reviews */}
              <div className="rounded-xl border border-black/6 bg-[#fcfbf9] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-[18px] font-semibold text-[#2c2c2c]">Reviews</h2>
                    <p className="mt-1 text-[13px] text-black/55">Recent feedback from couples</p>
                  </div>
                  <div className="flex items-center gap-1 text-[20px] font-bold text-[#a68b6a]">
                    <StarIcon className="h-5 w-5" />
                    {(vendor.average_rating ?? 0).toFixed(1)}
                  </div>
                </div>

                <div className="mt-5 grid gap-4">
                  <VendorReviewForm vendorId={vendor.id} vendorSlug={vendor.slug} />
                  {reviews.length === 0 ? (
                    <div className="rounded-lg border border-black/5 bg-white p-6 text-center">
                      <div className="text-[14px] font-semibold text-[#2c2c2c]">No reviews yet</div>
                      <div className="mt-1 text-[13px] text-black/55">Be the first to review this vendor.</div>
                    </div>
                  ) : (
                    reviews.map((r) => (
                      <div key={r.id} className="rounded-lg border border-black/5 bg-white p-4 hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-[#a68b6a]/10 flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-[#a68b6a]" />
                            </div>
                            <span className="text-[13px] font-semibold text-black/70">
                              {r.users?.[0]?.email ? maskEmail(r.users[0].email) : "Verified couple"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[13px] font-semibold text-[#a68b6a]">
                            <StarIcon className="h-3.5 w-3.5" />
                            {r.rating}
                          </div>
                        </div>
                        {r.review_text ? <div className="mt-3 text-[13px] leading-6 text-black/60 pl-10">{r.review_text}</div> : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="grid gap-4 content-start">
              {/* Contact Card */}
              <div className="rounded-xl border border-black/6 bg-[#fcfbf9] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
                <h3 className="text-[14px] font-semibold text-[#2c2c2c]">Contact Information</h3>
                
                {/* Quick Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <SaveVendorButton 
                    vendorId={vendor.id} 
                    vendorSlug={vendor.slug}
                    className="h-10 w-10"
                  />
                  <ContactVendorForm 
                    vendorId={vendor.id} 
                    vendorName={vendor.business_name}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#a68b6a] text-white hover:bg-[#957a5c] transition-all duration-300"
                  >
                    <ChatIcon className="h-4 w-4" />
                  </ContactVendorForm>
                </div>

                <div className="mt-4 grid gap-3">
                  {vendor.address ? (
                    <div className="flex items-start gap-3 text-[13px] text-black/65">
                      <MapPinIcon className="h-4 w-4 shrink-0 mt-0.5 text-black/40" />
                      <span>{vendor.address}</span>
                    </div>
                  ) : null}
                  {vendor.contact_phone ? (
                    <a
                      href={`tel:${vendor.contact_phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-3 text-[13px] text-[#6e4f33] hover:underline"
                    >
                      <PhoneIcon className="h-4 w-4 shrink-0" />
                      <span>{vendor.contact_phone}</span>
                    </a>
                  ) : null}
                  {vendor.website_url && isPremium ? (
                      <a
                        href={withProtocol(vendor.website_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 text-[13px] text-[#6e4f33] hover:underline min-w-0 overflow-hidden"
                      >
                        <GlobeIcon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{vendor.website_url}</span>
                      </a>
                  ) : null}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-black/5">
                    <span className="text-black/50">Last updated</span>
                    <span className="font-semibold text-black/70">{vendor.updated_at ? formatDate(vendor.updated_at) : "—"}</span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              {socials.length > 0 ? (
                <div className="rounded-xl border border-black/6 bg-[#fcfbf9] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
                  <h3 className="text-[14px] font-semibold text-[#2c2c2c]">Social Media</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {socials.map((s) => (
                      <a
                        key={s.id}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-[#fcfbf9] text-[#6e4f33] hover:bg-[#a68b6a] hover:text-white hover:border-[#a68b6a] transition-all duration-300"
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
                </div>
              ) : null}

              {/* Business Verification */}
              <div className="rounded-xl border border-black/6 bg-[#fcfbf9] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
                <h3 className="text-[14px] font-semibold text-[#2c2c2c]">Business Verification</h3>
                <div className="mt-3 flex items-center gap-2">
                  {vendor.document_verified === true ? (
                    <>
                      <span className="inline-flex h-5 w-5 items-center justify-center text-[#027a48]">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-[13px] font-semibold text-[#027a48]">Verified</span>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex h-5 w-5 items-center justify-center text-[#b42318]">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-[13px] font-semibold text-[#b42318]">Unreviewed</span>
                    </>
                  )}
                </div>
              </div>

              {/* Claim Button for unclaimed vendors */}
              {!vendor.user_id && (
                <div className="rounded-xl border border-[#a68b6a]/30 bg-[#a68b6a]/5 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
                  <h3 className="text-[14px] font-semibold text-[#2c2c2c]">Are you the owner?</h3>
                  <p className="mt-2 text-xs text-black/60">
                    Claim this vendor listing to manage your business profile.
                  </p>
                  <div className="mt-4">
                    <ClaimVendorButton vendorId={vendor.id} vendorName={vendor.business_name} />
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>
      </FadeInOnView>
    </main>
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
    strokeWidth: 1.6,
    strokeLinecap: "square" as const,
    strokeLinejoin: "miter" as const,
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

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M9 5H5"/>
      <path d="M19 15v4"/>
      <path d="M21 19h-4"/>
    </svg>
  );
}
