import { Suspense } from "react";
import { Metadata } from "next";
 
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Wedding Marketplace | Themes & Motifs",
  description: "Evaluate, inquire, or book exclusive deals and special offers from trusted wedding suppliers.",
};
 
import { createSupabaseServerClient } from "../../lib/supabaseServer";
import FadeInOnView from "../components/FadeInOnView";
import { proxiedImageUrl } from "../../lib/imageSizes";
import SavePromoButton from "@/features/promos/components/SavePromoButton";

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
    province: { name: string } | null;
    city_rel: { name: string } | null;
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

type MarketplaceItem = {
  id: number;
  title: string;
  summary: string | null;
  price: number;
  price_text: string | null;
  image_url: string | null;
  image_focus_x: number | null;
  image_focus_y: number | null;
  image_zoom: number | null;
  vendors: {
    id: number;
    business_name: string;
    slug: string;
    logo_url: string | null;
    city: string | null;
    province: { name: string } | null;
    city_rel: { name: string } | null;
  }[];
};


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
        <div key={i} className="rounded-2xl border border-black/5 bg-linear-to-b from-white to-[#fff7ed]/5 shadow-xs overflow-hidden flex flex-row items-stretch min-h-[150px]">
          <div className="w-28 sm:w-32 shrink-0 relative overflow-hidden self-stretch">
            <div className="absolute inset-0 bg-black/10 animate-pulse" />
          </div>
          <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
            <div>
              <div className="h-3 w-20 rounded-md bg-black/10 animate-pulse" />
              <div className="mt-2 h-5 w-3/4 rounded-md bg-black/10 animate-pulse" />
              <div className="mt-2 h-4 w-full rounded-md bg-black/10 animate-pulse" />
            </div>
            <div className="mt-4">
              <div className="h-6 w-16 rounded-md bg-black/10 animate-pulse" />
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
      "id,title,summary,terms,valid_from,valid_to,image_url,discount_percentage,image_focus_x,image_focus_y,image_zoom,is_active,vendors(id,business_name,slug,logo_url,city,province:provinces(name),city_rel:cities(name))"
    )
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(100);

  let promos = ((promosData ?? []) as unknown as Promo[]).filter(isPromoCurrentlyValid);

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
        const vendorName = vendor?.business_name;
        const coverUrl = proxiedImageUrl(promo.image_url) ?? "";
        const fx = clampPct(Number(promo.image_focus_x ?? 50));
        const fy = clampPct(Number(promo.image_focus_y ?? 50));
        const z = clampZoom(Number(promo.image_zoom ?? 1));
        const location = vendor?.city_rel?.name ?? vendor?.city ?? vendor?.province?.name;

        return (
          <div
            key={promo.id}
            className="group relative rounded-2xl border border-black/5 bg-linear-to-b from-white to-[#fff7ed]/10 shadow-xs hover:border-[#c17a4e]/25 hover:-translate-y-1 hover:shadow-md transition-all duration-300 ease-out overflow-hidden flex flex-row items-stretch min-h-[150px]"
          >
            {/* Save Button */}
            <div className="absolute top-2.5 right-2.5 z-20">
              <SavePromoButton promoId={promo.id} />
            </div>

            <a
              href={`/promos/${promo.id}`}
              className="flex flex-row items-stretch w-full min-h-[150px] z-10"
            >
              {/* Promo Badge */}
              <div className="absolute top-0 left-0 z-10">
                <div className="bg-[#c17a4e] text-white text-[11px] font-bold px-3 py-1 rounded-br-xl">
                  {vendorName || "PROMO"}
                </div>
              </div>

            {/* Left: Image */}
            <div className="w-28 sm:w-32 shrink-0 relative overflow-hidden self-stretch bg-[#fcfbf9]">
              <div className="absolute inset-0">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt=""
                    className="w-full h-auto min-h-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
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
            <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
              <div>
                {/* Vendor name with optional logo */}
                <div className="flex items-center gap-2">
                  {vendor?.logo_url ? (
                    <img
                      src={proxiedImageUrl(vendor.logo_url) ?? vendor.logo_url ?? ""}
                      alt=""
                      className="h-5 w-5 rounded-md object-cover border border-black/10"
                    />
                  ) : null}
                  <div className="text-[11px] font-semibold text-[#a67c52] uppercase tracking-wide truncate">
                    {vendorName}
                  </div>
                </div>

                <div className="mt-1 text-[15px] font-bold text-[#2c2c2c] leading-tight line-clamp-3">
                  {promo.title}
                </div>

                {promo.summary ? (
                  <div className="mt-1.5 text-[12px] text-black/60 line-clamp-2">
                    {promo.summary}
                  </div>
                ) : null}
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2">
                  {typeof promo.discount_percentage === "number" ? (
                    <span className="inline-flex items-center rounded-lg bg-[#c17a4e] px-2 py-0.5 text-[12px] font-bold text-white">
                      {promo.discount_percentage}% OFF
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#c17a4e]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#c17a4e] animate-pulse" aria-hidden />
                      Limited Time
                    </span>
                  )}
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
          </div>
        );
      })}
    </div>
  );
}

async function MarketplaceList({ query }: { query: string }) {
  const supabase = createSupabaseServerClient();

  const { data: itemsData } = await supabase
    .from("marketplace_items")
    .select(
      "id,title,summary,price,price_text,image_url,image_focus_x,image_focus_y,image_zoom,is_active,vendors(id,business_name,slug,logo_url,city,province:provinces(name),city_rel:cities(name))"
    )
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(100);

  let items = ((itemsData ?? []) as unknown as MarketplaceItem[]);

  if (query.trim()) {
    const q = query.trim().toLowerCase();
    items = items.filter((p) => {
      const vendorName = p.vendors?.[0]?.business_name ?? "";
      return (
        p.title.toLowerCase().includes(q) ||
        (p.summary?.toLowerCase() ?? "").includes(q) ||
        vendorName.toLowerCase().includes(q)
      );
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-black/10 bg-white p-8 text-center">
        <div className="text-[16px] font-semibold text-[#2c2c2c]">No items found</div>
        <div className="mt-2 text-[14px] text-black/55">
          {query.trim()
            ? "Try adjusting your search terms."
            : "Check back later for products and packages from our vendors."}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => {
        const tone = i % 3 === 0 ? "#a67c52" : i % 3 === 1 ? "#c17a4e" : "#8e6a46";
        const vendor = item.vendors?.[0];
        const vendorName = vendor?.business_name;
        const coverUrl = proxiedImageUrl(item.image_url) ?? "";
        const fx = clampPct(Number(item.image_focus_x ?? 50));
        const fy = clampPct(Number(item.image_focus_y ?? 50));
        const z = clampZoom(Number(item.image_zoom ?? 1));
        const location = vendor?.city_rel?.name ?? vendor?.city ?? vendor?.province?.name;

        return (
          <div
            key={item.id}
            className="group relative rounded-2xl border border-black/5 bg-linear-to-b from-white to-[#fff7ed]/10 shadow-xs hover:border-[#c17a4e]/25 hover:-translate-y-1 hover:shadow-md transition-all duration-300 ease-out overflow-hidden flex flex-row items-stretch min-h-[150px]"
          >
            <a
              href={`/promos/marketplace/${item.id}`}
              className="flex flex-row items-stretch w-full min-h-[150px] z-10"
            >
              <div className="absolute top-0 left-0 z-10">
                <div className="bg-[#a67c52] text-white text-[11px] font-bold px-3 py-1 rounded-br-xl">
                  MARKETPLACE
                </div>
              </div>

            <div className="w-28 sm:w-32 shrink-0 relative overflow-hidden self-stretch bg-[#fcfbf9]">
              <div className="absolute inset-0">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt=""
                    className="w-full h-auto min-h-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
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

            <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-center gap-2">
                  {vendor?.logo_url ? (
                    <img
                      src={proxiedImageUrl(vendor.logo_url) ?? vendor.logo_url ?? ""}
                      alt=""
                      className="h-5 w-5 rounded-md object-cover border border-black/10"
                    />
                  ) : null}
                  <div className="text-[11px] font-semibold text-[#a67c52] uppercase tracking-wide truncate">
                    {vendorName}
                  </div>
                </div>

                <div className="mt-1 text-[15px] font-bold text-[#2c2c2c] leading-tight line-clamp-3">
                  {item.title}
                </div>

                {item.summary ? (
                  <div className="mt-1.5 text-[12px] text-black/60 line-clamp-2">
                    {item.summary}
                  </div>
                ) : null}
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-lg bg-[#a67c52] px-2 py-0.5 text-[12px] font-bold text-white">
                    {item.price_text ? item.price_text : `₱${item.price.toLocaleString()}`}
                  </span>
                </div>

                {location ? (
                  <div className="mt-2 text-[11px] text-black/45">
                    {location}
                  </div>
                ) : null}
              </div>
            </div>
            </a>
          </div>
        );
      })}
    </div>
  );
}

export default async function PromosPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; tab?: string }>;
}) {
  const resolvedParams = (await searchParams) ?? {};
  const query = resolvedParams.q ?? "";
  const tab = resolvedParams.tab === "marketplace" ? "marketplace" : "promos";

  return (
    <div style={{ background: "#fafafa" }}>
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <main className="py-10 sm:py-14">
          <FadeInOnView>
            <div className="mb-8">
              <h1 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
                The Wedding Marketplace
              </h1>
              <p className="mt-2 text-[14px] text-black/55 max-w-xl">
                Evaluate, inquire, or book exclusive deals and special offers from trusted wedding suppliers.
              </p>
            </div>

            <div className="flex items-center gap-6 border-b border-black/10 mb-8">
              <a href={`/promos?tab=promos${query ? `&q=${query}` : ""}`} className={`pb-3 text-[14px] tracking-wide uppercase transition-all duration-300 ${tab === 'promos' ? 'border-b-2 border-[#a67c52] text-[#a67c52] font-black' : 'border-b-2 border-transparent text-black/40 hover:text-black/60 font-bold'}`}>
                Deals & Offers
              </a>
              <a href={`/promos?tab=marketplace${query ? `&q=${query}` : ""}`} className={`pb-3 text-[14px] tracking-wide uppercase transition-all duration-300 ${tab === 'marketplace' ? 'border-b-2 border-[#a67c52] text-[#a67c52] font-black' : 'border-b-2 border-transparent text-black/40 hover:text-black/60 font-bold'}`}>
                Marketplace
              </a>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <form className="flex gap-3" action="/promos" method="GET">
                <input type="hidden" name="tab" value={tab} />
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder="Search promos by title, vendor, or keywords..."
                    className="w-full h-11 rounded-xl border border-black/10 bg-white px-4 text-[14px] placeholder:text-black/40 focus:outline-none focus:border-[#a67c52] focus:ring-2 focus:ring-[#a67c52]/20 transition-all duration-200"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-3 rounded-lg bg-[#a67c52] text-white text-[12px] font-semibold hover:bg-[#8e6a46] hover:-translate-y-[0.5px] active:scale-[0.97] hover:shadow-xs transition-[transform,background-color,box-shadow] duration-200 ease-out"
                  >
                    Search
                  </button>
                </div>
                {query ? (
                  <a
                    href="/promos"
                    className="h-11 px-4 rounded-xl border border-black/10 bg-white text-[13px] font-semibold text-black/60 hover:bg-black/5 hover:-translate-y-[1px] active:scale-[0.97] hover:shadow-sm flex items-center transition-[transform,background-color,box-shadow] duration-200 ease-out"
                  >
                    Clear
                  </a>
                ) : null}
              </form>
            </div>

            <Suspense fallback={<PromosSkeleton />}>
              {tab === "promos" ? <PromosList query={query} /> : <MarketplaceList query={query} />}
            </Suspense>
          </FadeInOnView>
        </main>
      </div>
    </div>
  );
}
