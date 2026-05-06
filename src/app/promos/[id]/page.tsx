import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabaseServer";
import FadeInOnView from "../../components/FadeInOnView";
import ShareDeal from "./ShareDeal";
import PromoCTACard from "./PromoCTACard";

type Vendor = {
  id: number;
  business_name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  city: string | null;
  location_text: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
};

type Promo = {
  id: number;
  title: string;
  summary: string | null;
  terms?: string | null;
  valid_from: string | null;
  valid_to: string | null;
  image_url: string | null;
  discount_percentage: number | null;
  image_focus_x: number | null;
  image_focus_y: number | null;
  image_zoom: number | null;
  created_at?: string;
  vendor: Vendor | Vendor[] | null;
};

function clampPct(v: number) {
  if (!Number.isFinite(v)) return 50;
  return Math.max(0, Math.min(100, v));
}

function clampZoom(v: number) {
  if (!Number.isFinite(v)) return 1;
  return Math.max(1, Math.min(3, v));
}

function proxiedImageUrl(url: string | null | undefined) {
  const u = (url ?? "").trim();
  if (!u) return "";
  if (u.includes("drive.google.com")) {
    return `/api/image-proxy?url=${encodeURIComponent(u)}`;
  }
  return u;
}

function isPromoCurrentlyValid(promo: Pick<Promo, "valid_from" | "valid_to">) {
  const now = new Date();
  const from = promo.valid_from ? new Date(`${promo.valid_from}T00:00:00Z`) : null;
  const to = promo.valid_to ? new Date(`${promo.valid_to}T23:59:59Z`) : null;
  if (from && now < from) return false;
  if (to && now > to) return false;
  return true;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatDateShort(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PromoDetailPage({ params }: Props) {
  const { id: idStr } = await params;
  const id = Number(idStr);

  if (!Number.isFinite(id)) {
    notFound();
  }

  const supabase = createSupabaseServerClient();

  const { data: promoData } = await supabase
    .from("promos")
    .select(
      `id,title,summary,terms,valid_from,valid_to,image_url,discount_percentage,image_focus_x,image_focus_y,image_zoom,is_active,created_at,
      vendor:vendor_id(id,business_name,slug,logo_url,description,city,location_text,contact_email,contact_phone,website_url)`
    )
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!promoData) {
    notFound();
  }

  const promo = promoData as unknown as Promo;

  if (!isPromoCurrentlyValid(promo)) {
    notFound();
  }

  const coverUrl = proxiedImageUrl(promo.image_url);
  const fx = clampPct(Number(promo.image_focus_x ?? 50));
  const fy = clampPct(Number(promo.image_focus_y ?? 50));
  const z = clampZoom(Number(promo.image_zoom ?? 1));

  const vendorRaw = promo.vendor;
  const vendor = Array.isArray(vendorRaw) ? vendorRaw[0] ?? null : vendorRaw;
  const location = vendor?.city ?? vendor?.location_text;

  return (
    <div style={{ background: "#fafafa" }}>
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <main className="py-10 sm:py-14">
          <FadeInOnView>
            {/* Breadcrumb */}
            <div className="mb-6 text-[13px] text-black/50">
              <a href="/promos" className="hover:underline text-[#6e4f33]">Promos</a>
              <span className="mx-2">/</span>
              <span className="text-black/70">Deal #{promo.id}</span>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              {/* Main Content */}
              <div>
                {/* Promo Card */}
                <div className="rounded-md border border-black/10 bg-linear-to-br from-[#fff7ed] to-white overflow-hidden relative">
                  {/* Promo Badge */}
                  <div className="absolute top-0 left-0 z-10">
                    <div className="bg-[#c17a4e] text-white text-[12px] font-bold px-4 py-1.5 rounded-br-md">
                      EXCLUSIVE PROMO
                    </div>
                  </div>

                  {/* Large Cover Image */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        style={{ transformOrigin: `${fx}% ${fy}%`, transform: `scale(${z})` }}
                        loading="eager"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        draggable={false}
                      />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{
                          background: "linear-gradient(135deg, #c17a4e33, #a67c5211)",
                        }}
                      />
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />

                    {/* Discount badge on image */}
                    {typeof promo.discount_percentage === "number" ? (
                      <div className="absolute bottom-4 right-4">
                        <div className="bg-[#c17a4e] text-white px-4 py-2 rounded-md shadow-lg">
                          <div className="text-[11px] font-semibold uppercase tracking-wide">Save</div>
                          <div className="text-[24px] font-bold leading-none">{promo.discount_percentage}%</div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Content */}
                  <div className="p-6 sm:p-8">
                    {/* Vendor link */}
                    {vendor ? (
                      <a
                        href={`/vendors/${vendor.slug}`}
                        className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#a67c52] hover:text-[#8e6a46] hover:underline"
                      >
                        {vendor.logo_url ? (
                          <img
                            src={proxiedImageUrl(vendor.logo_url)}
                            alt=""
                            className="h-6 w-6 rounded-[3px] object-contain border border-black/10"
                          />
                        ) : null}
                        {vendor.business_name}
                        {location ? <span className="text-black/40 font-normal">· {location}</span> : null}
                      </a>
                    ) : null}

                    <h1 className="mt-3 text-[24px] sm:text-[28px] font-bold text-[#2c2c2c] leading-tight">
                      {promo.title}
                    </h1>

                    {promo.summary ? (
                      <p className="mt-3 text-[16px] text-black/65 leading-relaxed">
                        {promo.summary}
                      </p>
                    ) : null}

                    {/* Validity */}
                    <div className="mt-5 flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 text-[13px] text-black/55">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {promo.valid_from ? `Valid from ${formatDate(promo.valid_from)}` : "Limited time offer"}
                          {promo.valid_to ? ` until ${formatDate(promo.valid_to)}` : null}
                        </span>
                      </div>

                      {promo.valid_from || promo.valid_to ? (
                        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#c17a4e]">
                          <span className="h-2 w-2 rounded-full bg-[#c17a4e] animate-pulse" />
                          Currently Active
                        </div>
                      ) : null}
                    </div>

                    {/* Terms */}
                    {promo.terms ? (
                      <div className="mt-6 pt-6 border-t border-[#c17a4e]/20">
                        <h3 className="text-[14px] font-semibold text-[#2c2c2c] mb-3">Terms & Conditions</h3>
                        <div className="text-[14px] text-black/60 leading-relaxed whitespace-pre-line">
                          {promo.terms}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <PromoCTACard
                  vendorId={vendor?.id ?? null}
                  vendorName={vendor?.business_name ?? null}
                  vendorEmail={vendor?.contact_email ?? null}
                  vendorPhone={vendor?.contact_phone ?? null}
                  vendorSlug={vendor?.slug ?? null}
                  promoTitle={promo.title}
                />

                {/* Vendor Mini Card */}
                {vendor ? (
                  <div className="rounded-md border border-black/10 bg-white p-5 shadow-sm">
                    <h4 className="text-[13px] font-semibold text-black/50 uppercase tracking-wide mb-3">About the Vendor</h4>

                    <a href={`/vendors/${vendor.slug}`} className="flex items-center gap-3 group">
                      <div className="h-14 w-14 rounded-[3px] border border-black/10 bg-[#fcfbf9] overflow-hidden flex items-center justify-center shrink-0">
                        {vendor.logo_url ? (
                          <img
                            src={proxiedImageUrl(vendor.logo_url)}
                            alt=""
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="text-[11px] text-black/30">No logo</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[15px] font-semibold text-[#2c2c2c] group-hover:text-[#6e4f33] transition-colors truncate">
                          {vendor.business_name}
                        </div>
                        {location ? (
                          <div className="text-[12px] text-black/50">{location}</div>
                        ) : null}
                      </div>
                    </a>

                    {vendor.description ? (
                      <p className="mt-3 text-[13px] text-black/55 line-clamp-3">{vendor.description}</p>
                    ) : null}

                    <a
                      href={`/vendors/${vendor.slug}`}
                      className="mt-4 inline-flex items-center text-[13px] font-semibold text-[#6e4f33] hover:underline"
                    >
                      View full profile →
                    </a>
                  </div>
                ) : null}

                {/* Share */}
                <div className="rounded-md border border-black/10 bg-white p-5 shadow-sm">
                  <h4 className="text-[13px] font-semibold text-black/50 uppercase tracking-wide mb-3">Share this deal</h4>
                  <ShareDeal />
                </div>
              </div>
            </div>

            {/* More Promos */}
            <div className="mt-12">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[18px] font-semibold text-[#2c2c2c]">More Deals You Might Like</h2>
                <a href="/promos" className="text-[13px] font-semibold text-[#6e4f33] hover:underline">
                  Browse all promos
                </a>
              </div>

              <MorePromos currentId={promo.id} />
            </div>
          </FadeInOnView>
        </main>
      </div>
    </div>
  );
}

async function MorePromos({ currentId }: { currentId: number }) {
  const supabase = createSupabaseServerClient();

  const { data: promosData } = await supabase
    .from("promos")
    .select(
      "id,title,summary,valid_from,valid_to,image_url,discount_percentage,image_focus_x,image_focus_y,image_zoom,vendor:vendor_id(id,business_name,slug,logo_url,city,location_text)"
    )
    .eq("is_active", true)
    .neq("id", currentId)
    .order("updated_at", { ascending: false })
    .limit(3);

  const promos = ((promosData ?? []) as unknown as Promo[]).filter(isPromoCurrentlyValid);

  if (promos.length === 0) {
    return (
      <div className="mt-4 rounded-md border border-black/10 bg-white p-6 text-center">
        <p className="text-[14px] text-black/55">Check back soon for more exclusive deals!</p>
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {promos.map((promo, i) => {
        const tone = i % 3 === 0 ? "#a67c52" : i % 3 === 1 ? "#c17a4e" : "#8e6a46";
        const vendorRaw = promo.vendor;
        const vendor = Array.isArray(vendorRaw) ? vendorRaw[0] ?? null : vendorRaw;
        const vendorName = vendor?.business_name;
        const coverUrl = proxiedImageUrl(promo.image_url);
        const fx = clampPct(Number(promo.image_focus_x ?? 50));
        const fy = clampPct(Number(promo.image_focus_y ?? 50));
        const z = clampZoom(Number(promo.image_zoom ?? 1));

        return (
          <a
            key={promo.id}
            href={`/promos/${promo.id}`}
            className="rounded-md border border-black/10 bg-linear-to-br from-[#fff7ed] to-white overflow-hidden relative block hover:border-black/20 transition-colors"
          >
            <div className="absolute top-0 left-0 z-10">
              <div className="bg-[#c17a4e] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-br-md">
                PROMO
              </div>
            </div>

            <div className="flex">
              <div className="w-24 sm:w-28 shrink-0 relative overflow-hidden">
                <div className="h-full min-h-25">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{ transformOrigin: `${fx}% ${fy}%`, transform: `scale(${z})` }}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="h-full w-full"
                      style={{ background: `linear-gradient(135deg, ${tone}33, ${tone}11)` }}
                    />
                  )}
                </div>
              </div>

              <div className="flex-1 p-3.5">
                <div className="text-[11px] font-semibold text-[#a67c52] uppercase tracking-wide truncate">
                  {vendorName}
                </div>
                <div className="mt-0.5 text-[14px] font-bold text-[#2c2c2c] leading-tight line-clamp-2">
                  {promo.title}
                </div>
                {typeof promo.discount_percentage === "number" ? (
                  <span className="mt-2 inline-flex items-center rounded-sm bg-[#c17a4e] px-1.5 py-0.5 text-[11px] font-bold text-white">
                    {promo.discount_percentage}% OFF
                  </span>
                ) : (
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#c17a4e]">
                    <span className="h-1 w-1 rounded-full bg-[#c17a4e] animate-pulse" />
                    Limited Time
                  </span>
                )}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
