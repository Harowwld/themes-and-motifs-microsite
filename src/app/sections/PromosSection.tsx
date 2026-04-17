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
    <section id="promos" className="mt-16 sm:mt-20">
      <div className="text-center">
        <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
          Discover exciting promos
        </h2>
        <p className="mt-2 text-[13px] text-black/55 max-w-xl mx-auto">
          Time-bound deals from suppliers-great for shortlisting with confidence.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {promos.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
            <div className="text-[13px] font-semibold text-[#2c2c2c]">No featured promos yet</div>
            <div className="mt-1 text-[13px] text-black/55">Feature a promo to have it appear here.</div>
          </div>
        ) : (
          promos.map((promo, i) => {
            const tone = i % 2 === 0 ? "#a68b6a" : "#957a5c";
            const vendorName = promo.vendors?.[0]?.business_name;
            const coverUrl = promo.image_url ? proxiedImageUrl(promo.image_url) : "";
            const fx = clampPct(Number(promo.image_focus_x ?? 50));
            const fy = clampPct(Number(promo.image_focus_y ?? 50));
            const z = clampZoom(Number(promo.image_zoom ?? 1));

            return (
              <a
                key={promo.id}
                href={`/promos/${promo.id}`}
                className="group block rounded-[12px] overflow-hidden relative aspect-[3/4] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.04)] hover:-translate-y-3 pt-3 transition-all duration-500"
              >
                {/* Full-bleed cover image */}
                <div className="absolute inset-0">
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

                {/* Promo badge */}
                <div className="absolute top-3 left-3 z-10">
                  <div className="bg-[#a68b6a] text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                    PROMO
                  </div>
                </div>

                {/* Glass morphism details panel - lower left, ~3/5 of card width */}
                <div className="absolute bottom-3 left-3 z-20 w-[60%]">
                  <div className="backdrop-blur-md bg-white/75 border border-white/40 rounded-[6px] p-3 shadow-lg">
                    {/* Vendor name */}
                    <div className="text-[10px] font-semibold text-[#a68b6a] uppercase tracking-wide truncate">
                      {vendorName ? vendorName : "Featured Deal"}
                    </div>

                    {/* Title */}
                    <div className="mt-1 text-[14px] font-bold text-[#2c2c2c] leading-tight line-clamp-2">
                      {promo.title}
                    </div>

                    {/* Discount badge */}
                    <div className="mt-2">
                      {typeof promo.discount_percentage === "number" ? (
                        <span className="inline-flex items-center rounded-sm bg-[#a68b6a] px-2 py-0.5 text-[11px] font-bold text-white">
                          {promo.discount_percentage}% OFF
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#a68b6a]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#a68b6a] animate-pulse" aria-hidden />
                          Limited Time
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            );
          })
        )}
      </div>

      <div className="mt-6 text-center">
        <a
          href="/promos"
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#a68b6a] hover:text-[#957a5c] transition-colors"
        >
          View All Promos
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden className="w-5 h-4">
            <path d="M2 8h16M12 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </section>
  );
}
