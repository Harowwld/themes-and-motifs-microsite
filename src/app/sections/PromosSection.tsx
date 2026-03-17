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

function clampPct(v: number) {
  if (!Number.isFinite(v)) return 50;
  return Math.max(0, Math.min(100, v));
}

function clampZoom(v: number) {
  if (!Number.isFinite(v)) return 1;
  return Math.max(1, Math.min(3, v));
}

function proxiedImageUrl(url: string) {
  const u = (url ?? "").trim();
  if (!u) return u;
  if (u.includes("drive.google.com")) {
    return `/api/image-proxy?url=${encodeURIComponent(u)}`;
  }
  return u;
}

export default function PromosSection({ promos }: { promos: FeaturedPromo[] }) {
  return (
    <section id="promos" className="mt-12 sm:mt-16">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
            Promos
          </h2>
          <p className="mt-1 text-[13px] text-black/55 max-w-xl">
            Time-bound deals from suppliers—great for shortlisting with confidence.
          </p>
        </div>
        <a className="text-[13px] font-semibold text-[#6e4f33] hover:underline" href="/promos">
          View all
        </a>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promos.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
            <div className="text-[13px] font-semibold text-[#2c2c2c]">No featured promos yet</div>
            <div className="mt-1 text-[13px] text-black/55">Feature a promo to have it appear here.</div>
          </div>
        ) : (
          promos.map((promo, i) => {
            const tone = i % 3 === 0 ? "#a67c52" : i % 3 === 1 ? "#c17a4e" : "#8e6a46";
            const vendorName = promo.vendors?.[0]?.business_name;
            const coverUrl = promo.image_url ? proxiedImageUrl(promo.image_url) : "";
            const fx = clampPct(Number(promo.image_focus_x ?? 50));
            const fy = clampPct(Number(promo.image_focus_y ?? 50));
            const z = clampZoom(Number(promo.image_zoom ?? 1));

            return (
              <div
                key={promo.id}
                className="rounded-md border-2 border-dashed border-[#c17a4e]/40 bg-linear-to-br from-[#fff7ed] to-white overflow-hidden relative"
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
                    {/* Vendor name above title */}
                    <div className="text-[11px] font-semibold text-[#a67c52] uppercase tracking-wide">
                      {vendorName ? vendorName : "Featured Deal"}
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
                      {/* Discount badge or time indicator */}
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

                      <a
                        href={`/promos/${promo.id}`}
                        className="text-[12px] font-bold text-[#6e4f33] hover:text-[#8e6a46] hover:underline"
                      >
                        View Deal →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
