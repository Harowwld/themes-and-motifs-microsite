"use client";

import type { VendorCardVendor } from "../types";

type Props = {
  vendor: VendorCardVendor;
  toneSeed?: number;
  fixedHeight?: boolean;
};

function proxiedImageUrl(url: string | null | undefined) {
  const u = (url ?? "").trim();
  if (!u) return null;
  if (u.includes("drive.google.com")) {
    return `/api/image-proxy?url=${encodeURIComponent(u)}`;
  }
  return u;
}

export default function VendorCard({ vendor, toneSeed, fixedHeight }: Props) {
  const seed = toneSeed ?? vendor.id;
  const tone = seed % 3 === 0 ? "#a67c52" : seed % 3 === 1 ? "#c17a4e" : "#8e6a46";
  const rating = vendor.average_rating ?? 0;
  const reviews = vendor.review_count ?? 0;
  const location = vendor.city ?? vendor.location_text;

  const coverUrl = proxiedImageUrl(vendor.cover_image_url);
  const logoUrl = proxiedImageUrl(vendor.logo_url);

  const rootClassName = fixedHeight
    ? "h-[220px] rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
    : "block rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow";

  const contentClassName = fixedHeight ? "px-3 pt-2 pb-2 flex-1 flex flex-col min-h-0" : "p-5";

  return (
    <a
      href={`/vendors/${encodeURIComponent(vendor.slug)}`}
      className={rootClassName}
      aria-label={`View ${vendor.business_name}`}
    >
      <div className="relative h-[154px] overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
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

        {location ? (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="inline-flex max-w-full items-center rounded-[999px] bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-black/60 shadow-sm backdrop-blur">
              <span className="truncate">{location}</span>
            </div>
          </div>
        ) : null}
      </div>
      <div className={contentClassName}>
        <div className="mt-1 flex items-center gap-2 min-h-0">
          <div className="h-7 w-7 rounded-[3px] border border-black/10 bg-white overflow-hidden flex items-center justify-center shrink-0">
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
          <div className="text-[14px] font-semibold text-[#2c2c2c] leading-4 line-clamp-2">{vendor.business_name}</div>
        </div>
        <div className={fixedHeight ? "mt-auto flex items-center justify-between pt-1" : "mt-2 flex items-center justify-between"}>
          <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-black/55">
            <span className="text-[#a67c52]">{rating.toFixed(1)}</span>
            <span className="text-black/30">•</span>
            <span className="truncate">{reviews} reviews</span>
          </div>
          <span className="text-[12px] font-semibold text-[#6e4f33] hover:underline">Explore</span>
        </div>
      </div>
    </a>
  );
}
