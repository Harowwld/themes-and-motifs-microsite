import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabaseServer";
import FadeInOnView from "../../../components/FadeInOnView";
import ShareDeal from "../../[id]/ShareDeal";
import PromoCTACard from "../../[id]/PromoCTACard";
import { proxiedImageUrl } from "../../../../lib/imageSizes";

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

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MarketplaceItemDetailPage({ params }: Props) {
  const { id: idStr } = await params;
  const id = Number(idStr);

  if (!Number.isFinite(id)) {
    notFound();
  }

  const supabase = createSupabaseServerClient();

  const { data: itemData } = await supabase
    .from("marketplace_items")
    .select(
      `id,title,summary,price,price_text,image_url,image_focus_x,image_focus_y,image_zoom,is_active,created_at,
      vendor:vendor_id(id,business_name,slug,logo_url,description,city,location_text,contact_email,contact_phone,website_url)`
    )
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!itemData) {
    notFound();
  }

  const item = itemData as unknown as MarketplaceItem;

  const coverUrl = proxiedImageUrl(item.image_url) ?? "";
  const fx = clampPct(Number(item.image_focus_x ?? 50));
  const fy = clampPct(Number(item.image_focus_y ?? 50));
  const z = clampZoom(Number(item.image_zoom ?? 1));

  const vendorRaw = item.vendor;
  const vendor = Array.isArray(vendorRaw) ? vendorRaw[0] ?? null : vendorRaw;
  const location = vendor?.city ?? vendor?.location_text;

  return (
    <div style={{ background: "#fafafa" }}>
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <main className="py-10 sm:py-14">
          <FadeInOnView>
            {/* Breadcrumb */}
            <div className="mb-6 text-[13px] text-black/50">
              <a href="/promos?tab=marketplace" className="hover:underline text-[#6e4f33]">Marketplace</a>
              <span className="mx-2">/</span>
              <span className="text-black/70">Item #{item.id}</span>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              {/* Main Content */}
              <div>
                {/* Item Card */}
                <div className="rounded-2xl border border-black/10 bg-linear-to-br from-[#fff7ed] to-white overflow-hidden relative shadow-sm hover:shadow-md transition-shadow duration-300">
                  {/* Badge */}
                  <div className="absolute top-0 left-0 z-10">
                    <div className="bg-[#a67c52] text-white text-[12px] font-bold px-4 py-1.5 rounded-br-xl">
                      MARKETPLACE
                    </div>
                  </div>

                  {/* Large Cover Image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#fcfbf9]">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt=""
                        className="w-full h-auto min-h-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
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
                          background: "linear-gradient(135deg, #a67c5233, #8e6a4611)",
                        }}
                      />
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />

                    {/* Price badge on image */}
                    <div className="absolute bottom-4 right-4">
                      <div className="bg-[#a67c52] text-white px-4 py-2 rounded-xl shadow-lg">
                        <div className="text-[11px] font-semibold uppercase tracking-wide">{item.price_text ?? "Price"}</div>
                        <div className="text-[24px] font-bold leading-none">₱{item.price.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 sm:p-8">
                    {/* Vendor link */}
                    {vendor ? (
                      <a
                        href={`/suppliers/${vendor.slug}`}
                        className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#a67c52] hover:text-[#8e6a46] hover:underline"
                      >
                        {vendor.logo_url ? (
                          <img
                            src={proxiedImageUrl(vendor.logo_url) ?? vendor.logo_url ?? ""}
                            alt=""
                            className="h-6 w-6 rounded-md object-cover border border-black/10"
                          />
                        ) : null}
                        {vendor.business_name}
                        {location ? <span className="text-black/40 font-normal">· {location}</span> : null}
                      </a>
                    ) : null}

                    <h1 className="mt-3 text-[24px] sm:text-[28px] font-bold text-[#2c2c2c] leading-tight">
                      {item.title}
                    </h1>

                    {item.summary ? (
                      <p className="mt-3 text-[16px] text-black/65 leading-relaxed whitespace-pre-line">
                        {item.summary}
                      </p>
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
                  promoTitle={item.title}
                />

                {/* Vendor Mini Card */}
                {vendor ? (
                  <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <h4 className="text-[13px] font-semibold text-black/50 uppercase tracking-wide mb-3">About the Supplier</h4>

                    <a href={`/suppliers/${vendor.slug}`} className="flex items-center gap-3 group">
                      <div className="h-14 w-14 rounded-xl border border-black/10 bg-[#fcfbf9] overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                        {vendor.logo_url ? (
                          <img
                            src={proxiedImageUrl(vendor.logo_url) ?? vendor.logo_url ?? ""}
                            alt=""
                            className="h-full w-full object-cover"
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
                      href={`/suppliers/${vendor.slug}`}
                      className="mt-4 inline-flex items-center text-[13px] font-semibold text-[#6e4f33] hover:underline"
                    >
                      View full profile →
                    </a>
                  </div>
                ) : null}

                {/* Share */}
                <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h4 className="text-[13px] font-semibold text-black/50 uppercase tracking-wide mb-3">Share this item</h4>
                  <ShareDeal />
                </div>
              </div>
            </div>

            {/* More Items */}
            <div className="mt-12">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[18px] font-semibold text-[#2c2c2c]">More Marketplace Items</h2>
                <a href="/promos?tab=marketplace" className="text-[13px] font-semibold text-[#6e4f33] hover:underline">
                  Browse all items
                </a>
              </div>

              <MoreItems currentId={item.id} />
            </div>
          </FadeInOnView>
        </main>
      </div>
    </div>
  );
}

async function MoreItems({ currentId }: { currentId: number }) {
  const supabase = createSupabaseServerClient();

  const { data: itemsData } = await supabase
    .from("marketplace_items")
    .select(
      "id,title,summary,price,price_text,image_url,image_focus_x,image_focus_y,image_zoom,vendor:vendor_id(id,business_name,slug,logo_url,city,location_text)"
    )
    .eq("is_active", true)
    .neq("id", currentId)
    .order("updated_at", { ascending: false })
    .limit(3);

  const items = ((itemsData ?? []) as unknown as MarketplaceItem[]);

  if (items.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-black/10 bg-white p-6 text-center">
        <p className="text-[14px] text-black/55">Check back soon for more marketplace items!</p>
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => {
        const tone = i % 3 === 0 ? "#a67c52" : i % 3 === 1 ? "#c17a4e" : "#8e6a46";
        const vendorRaw = item.vendor;
        const vendor = Array.isArray(vendorRaw) ? vendorRaw[0] ?? null : vendorRaw;
        const vendorName = vendor?.business_name;
        const coverUrl = proxiedImageUrl(item.image_url) ?? "";
        const fx = clampPct(Number(item.image_focus_x ?? 50));
        const fy = clampPct(Number(item.image_focus_y ?? 50));
        const z = clampZoom(Number(item.image_zoom ?? 1));

        return (
          <a
            key={item.id}
            href={`/promos/marketplace/${item.id}`}
            className="rounded-2xl border border-black/10 bg-linear-to-br from-[#fff7ed] to-white overflow-hidden relative block hover:border-black/20 hover:shadow-md transition-[border-color,box-shadow] duration-300"
          >
            <div className="absolute top-0 left-0 z-10">
              <div className="bg-[#a67c52] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-br-xl">
                MARKETPLACE
              </div>
            </div>

            <div className="flex">
              <div className="w-24 sm:w-28 shrink-0 relative overflow-hidden bg-[#fcfbf9]">
                <div className="h-full min-h-25 relative">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt=""
                      className="w-full h-auto min-h-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
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
                  {item.title}
                </div>
                <span className="mt-2 inline-flex items-center rounded-md bg-[#a67c52] px-1.5 py-0.5 text-[11px] font-bold text-white">
                  {item.price_text ?? `₱${item.price.toLocaleString()}`}
                </span>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
