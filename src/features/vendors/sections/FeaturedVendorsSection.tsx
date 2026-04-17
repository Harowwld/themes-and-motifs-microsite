"use client";

import type { FeaturedVendor } from "../types";

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
  if (!u) return null;
  if (u.includes("drive.google.com")) {
    return `/api/image-proxy?url=${encodeURIComponent(u)}`;
  }
  return u;
}

export default function FeaturedVendorsSection({ vendors }: { vendors: FeaturedVendor[] }) {
  return (
    <section id="featured" className="mt-12 sm:mt-16">
      <div className="text-center">
        <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
          Featured vendors
        </h2>
        <p className="mt-1 text-[13px] text-black/55 max-w-xl mx-auto">
          Handpicked suppliers for your special day.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {vendors.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
            <div className="text-[13px] font-semibold text-[#2c2c2c]">No featured vendors yet</div>
            <div className="mt-1 text-[13px] text-black/55">Mark vendors as featured to have them appear here.</div>
          </div>
        ) : (
          vendors.map((vendor, i) => {
            const tone = i % 2 === 0 ? "#a68b6a" : "#957a5c";
            const coverUrl = proxiedImageUrl(vendor.cover_image_url);
            const logoUrl = proxiedImageUrl(vendor.logo_url);
            const fx = clampPct(Number(vendor.cover_focus_x ?? 50));
            const fy = clampPct(Number(vendor.cover_focus_y ?? 50));
            const z = clampZoom(Number(vendor.cover_zoom ?? 1));
            const rating = vendor.average_rating ?? 0;
            const reviews = vendor.review_count ?? 0;
            const location = vendor.city ?? vendor.location_text;

            const planName = String((Array.isArray(vendor.plan) ? vendor.plan?.[0]?.name : vendor.plan?.name) ?? "")
              .trim()
              .toLowerCase();
            const isPremium = planName.includes("premium");

            return (
              <a
                key={vendor.id}
                href={`/vendors/${encodeURIComponent(vendor.slug)}`}
                className="group block rounded-[12px] overflow-hidden relative aspect-[3/4] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.04)] hover:-translate-y-3 pt-3 transition-all duration-500"
              >
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

                {isPremium && (
                  <div className="absolute top-3 left-3 z-10">
                    <div className="bg-[#a68b6a] text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                      PREMIUM
                    </div>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 z-20 w-[60%]">
                  <div className="backdrop-blur-md bg-white/75 border border-white/40 rounded-[6px] p-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      {logoUrl && (
                        <div className="h-8 w-8 rounded-md overflow-hidden bg-white shrink-0">
                          <img
                            src={logoUrl}
                            alt={`${vendor.business_name} logo`}
                            className="h-full w-full object-contain"
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            draggable={false}
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold text-[#a68b6a] uppercase tracking-wide truncate">
                          {vendor.business_name}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-neutral-600">
                          <span className="font-semibold text-[#a68b6a]">{rating.toFixed(1)}</span>
                          <span className="text-neutral-300">·</span>
                          <span>{reviews} reviews</span>
                          {location && (
                            <>
                              <span className="text-neutral-300">·</span>
                              <span className="truncate">{location}</span>
                            </>
                          )}
                        </div>
                      </div>
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
          href="/vendors"
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#a68b6a] hover:text-[#957a5c] transition-colors"
        >
          View All Vendors
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden className="w-5 h-4">
            <path d="M2 8h16M12 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </section>
  );
}
