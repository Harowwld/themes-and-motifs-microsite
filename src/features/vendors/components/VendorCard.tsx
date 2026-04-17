"use client";

import type { VendorCardVendor } from "../types";

type Props = {
  vendor: VendorCardVendor;
  toneSeed?: number;
  fixedHeight?: boolean;
  featured?: boolean;
};

function proxiedImageUrl(url: string | null | undefined) {
  const u = (url ?? "").trim();
  if (!u) return null;
  if (u.includes("drive.google.com")) {
    return `/api/image-proxy?url=${encodeURIComponent(u)}`;
  }
  return u;
}

export default function VendorCard({ vendor, toneSeed, fixedHeight, featured }: Props) {
  const seed = toneSeed ?? vendor.id;
  const tone = seed % 2 === 0 ? "#a68b6a" : "#957a5c";
  const rating = vendor.average_rating ?? 0;
  const reviews = vendor.review_count ?? 0;
  const location = vendor.city ?? vendor.location_text;

  const planName = String((Array.isArray(vendor.plan) ? vendor.plan?.[0]?.name : vendor.plan?.name) ?? "")
    .trim()
    .toLowerCase();
  const isPremium = planName.includes("premium");

  const coverUrl = proxiedImageUrl(vendor.cover_image_url);
  const logoUrl = proxiedImageUrl(vendor.logo_url);

  const focusX = Number.isFinite(Number(vendor.cover_focus_x)) ? Number(vendor.cover_focus_x) : 50;
  const focusY = Number.isFinite(Number(vendor.cover_focus_y)) ? Number(vendor.cover_focus_y) : 50;
  const coverObjectPosition = `${Math.max(0, Math.min(100, focusX))}% ${Math.max(0, Math.min(100, focusY))}%`;
  const zoomRaw = Number.isFinite(Number(vendor.cover_zoom)) ? Number(vendor.cover_zoom) : 1;
  const coverZoom = Math.max(1, Math.min(3, zoomRaw));

  const rootClassName = fixedHeight
    ? "h-[240px] rounded-xl border border-black/5 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col hover:shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.04)] hover:scale-[1.01] transition-all duration-300"
    : "block rounded-xl border border-black/5 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.04)] hover:scale-[1.01] transition-all duration-300 cursor-pointer";

  return (
    <a
      href={`/vendors/${encodeURIComponent(vendor.slug)}`}
      className={rootClassName}
      aria-label={`View ${vendor.business_name}`}
    >
      <div className={`relative ${featured ? 'h-48' : 'h-28'} overflow-hidden`}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: coverObjectPosition, transformOrigin: coverObjectPosition, transform: `scale(${coverZoom})` }}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${tone}22, #ffffff 65%)` }} />
        )}
        {!coverUrl ? (
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(166,124,82,0.22), rgba(255,255,255,0.88))",
            }}
          />
        ) : null}
      </div>

      <div className="relative px-4 pt-0 pb-4">
        <div className="relative -mt-10 mb-2 flex items-end justify-between">
          <div className="h-20 w-20 rounded-2xl border-4 border-white bg-[#fcfbf9] shadow-lg overflow-hidden flex items-center justify-center shrink-0 -ml-1">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${vendor.business_name} logo`}
                className="h-full w-full object-contain"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                draggable={false}
              />
            ) : (
              <div className="h-full w-full bg-[#fcfbf9]" />
            )}
          </div>
          <span className="text-[12px] font-semibold text-[#a68b6a] hover:text-[#957a5c] transition-colors">Explore</span>
        </div>

        <div className="flex items-center gap-1 text-[15px] font-semibold text-neutral-800 leading-5 line-clamp-1 mb-1">
          <span className="truncate">{vendor.business_name}</span>
          {isPremium ? (
            <span
              className="inline-flex items-center justify-center h-3.75 w-3.75 shrink-0"
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
        </div>

        <div className="flex items-center gap-1 text-[12px] text-neutral-500">
          <span className="font-semibold text-[#a68b6a]">{rating.toFixed(1)}</span>
          <span className="text-neutral-300">•</span>
          <span className="truncate">{reviews} reviews</span>
          {location ? (
            <>
              <span className="text-neutral-300">•</span>
              <span className="truncate">{location}</span>
            </>
          ) : null}
        </div>
      </div>
    </a>
  );
}
