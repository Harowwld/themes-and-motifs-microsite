import { Suspense } from "react";
import { createSupabaseServerClient } from "../../lib/supabaseServer";
import SiteHeader from "../sections/SiteHeader";
import SiteFooter from "../sections/SiteFooter";
import FadeInOnView from "../components/FadeInOnView";

type Promo = {
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
  vendors: {
    id: number;
    business_name: string;
    slug: string;
    logo_url: string | null;
    city: string | null;
    location_text: string | null;
  }[];
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
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function PromosSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="rounded-md border-2 border-dashed border-[#c17a4e]/20 bg-linear-to-br from-[#fff7ed]/50 to-white overflow-hidden">
          <div className="flex">
            <div className="w-28 sm:w-32 shrink-0">
              <div className="h-full min-h-30 bg-black/10 animate-pulse" />
            </div>
            <div className="flex-1 p-4">
              <div className="h-3 w-20 rounded bg-black/10 animate-pulse" />
              <div className="mt-2 h-5 w-3/4 rounded bg-black/10 animate-pulse" />
              <div className="mt-2 h-4 w-full rounded bg-black/10 animate-pulse" />
              <div className="mt-3 h-6 w-16 rounded bg-black/10 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function PromosList({ query }: { query: string }) {
  const supabase = createSupabaseServerClient();

  const { data: promosData } = await supabase
    .from("promos")
    .select(
      "id,title,summary,terms,valid_from,valid_to,image_url,discount_percentage,image_focus_x,image_focus_y,image_zoom,is_active,vendors(id,business_name,slug,logo_url,city,location_text)"
    )
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(100);

  let promos = ((promosData ?? []) as Promo[]).filter(isPromoCurrentlyValid);

  // Filter by search query
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    promos = promos.filter((p) => {
      const vendorName = p.vendors?.[0]?.business_name ?? "";
      return (
        p.title.toLowerCase().includes(q) ||
        (p.summary?.toLowerCase() ?? "").includes(q) ||
        vendorName.toLowerCase().includes(q)
      );
    });
  }

  if (promos.length === 0) {
    return (
      <div className="rounded-md border border-black/10 bg-white p-8 text-center">
        <div className="text-[16px] font-semibold text-[#2c2c2c]">No promos found</div>
        <div className="mt-2 text-[14px] text-black/55">
          {query.trim()
            ? "Try adjusting your search terms."
            : "Check back later for exclusive deals from our vendors."}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {promos.map((promo, i) => {
        const tone = i % 3 === 0 ? "#a67c52" : i % 3 === 1 ? "#c17a4e" : "#8e6a46";
        const vendor = promo.vendors?.[0];
        const vendorName = vendor?.business_name ?? "Featured Deal";
        const coverUrl = proxiedImageUrl(promo.image_url);
        const fx = clampPct(Number(promo.image_focus_x ?? 50));
        const fy = clampPct(Number(promo.image_focus_y ?? 50));
        const z = clampZoom(Number(promo.image_zoom ?? 1));
        const location = vendor?.city ?? vendor?.location_text;

        return (
          <a
            key={promo.id}
            href={`/promos/${promo.id}`}
            className="rounded-md border-2 border-dashed border-[#c17a4e]/40 bg-linear-to-br from-[#fff7ed] to-white overflow-hidden relative block hover:border-[#c17a4e]/60 transition-colors"
          >
            {/* Promo Badge */}
            <div className="absolute top-0 left-0 z-10">
              <div className="bg-[#c17a4e] text-white text-[11px] font-bold px-3 py-1 rounded-br-md">
                PROMO
              </div>
            </div>

            <div className="flex">
              {/* Left: Image */}
              <div className="w-28 sm:w-32 shrink-0 relative overflow-hidden">
                <div className="h-full min-h-30">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{ transformOrigin: `${fx}% ${fy}%`, transform: `scale(${z})` }}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      draggable={false}
                    />
                  ) : (
                    <div
                      className="h-full w-full"
                      style={{
                        background: `linear-gradient(135deg, ${tone}33, ${tone}11)`,
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Right: Content */}
              <div className="flex-1 p-4">
                {/* Vendor name with optional logo */}
                <div className="flex items-center gap-2">
                  {vendor?.logo_url ? (
                    <img
                      src={proxiedImageUrl(vendor.logo_url)}
                      alt=""
                      className="h-5 w-5 rounded-[3px] object-contain border border-black/10"
                    />
                  ) : null}
                  <div className="text-[11px] font-semibold text-[#a67c52] uppercase tracking-wide truncate">
                    {vendorName}
                  </div>
                </div>

                <div className="mt-1 text-[15px] font-bold text-[#2c2c2c] leading-tight">
                  {promo.title}
                </div>

                {promo.summary ? (
                  <div className="mt-1.5 text-[12px] text-black/60 line-clamp-2">
                    {promo.summary}
                  </div>
                ) : null}

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {typeof promo.discount_percentage === "number" ? (
                      <span className="inline-flex items-center rounded-sm bg-[#c17a4e] px-2 py-0.5 text-[12px] font-bold text-white">
                        {promo.discount_percentage}% OFF
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#c17a4e]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c17a4e] animate-pulse" aria-hidden />
                        Limited Time
                      </span>
                    )}
                  </div>
                </div>

                {(promo.valid_from || promo.valid_to || location) ? (
                  <div className="mt-2 text-[11px] text-black/45">
                    {promo.valid_from ? `From ${formatDate(promo.valid_from)}` : null}
                    {promo.valid_from && promo.valid_to ? " · " : null}
                    {promo.valid_to ? `Until ${formatDate(promo.valid_to)}` : null}
                    {location && (promo.valid_from || promo.valid_to) ? " · " : null}
                    {location ? location : null}
                  </div>
                ) : null}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}

export default async function PromosPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const resolvedParams = (await searchParams) ?? {};
  const query = resolvedParams.q ?? "";

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
          <FadeInOnView>
            <div className="mb-8">
              <h1 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
                Exclusive Promos & Deals
              </h1>
              <p className="mt-2 text-[14px] text-black/55 max-w-xl">
                Browse time-bound offers from our wedding suppliers. These deals are perfect for
                booking your preferred vendors at special rates.
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <form className="flex gap-3" action="/promos" method="GET">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder="Search promos by title, vendor, or keywords..."
                    className="w-full h-11 rounded-[3px] border border-black/10 bg-white px-4 text-[14px] placeholder:text-black/40 focus:outline-none focus:border-[#a67c52]/50"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-3 rounded-[3px] bg-[#a67c52] text-white text-[12px] font-semibold hover:bg-[#8e6a46] transition-colors"
                  >
                    Search
                  </button>
                </div>
                {query ? (
                  <a
                    href="/promos"
                    className="h-11 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/60 hover:bg-black/5 flex items-center transition-colors"
                  >
                    Clear
                  </a>
                ) : null}
              </form>
            </div>

            <Suspense fallback={<PromosSkeleton />}>
              <PromosList query={query} />
            </Suspense>
          </FadeInOnView>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
