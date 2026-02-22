"use client";

import type { VendorCardVendor } from "../types";

type Props = {
  vendor: VendorCardVendor;
  toneSeed?: number;
  fixedHeight?: boolean;
};

export default function VendorCard({ vendor, toneSeed, fixedHeight }: Props) {
  const seed = toneSeed ?? vendor.id;
  const tone = seed % 3 === 0 ? "#a67c52" : seed % 3 === 1 ? "#c17a4e" : "#8e6a46";
  const rating = vendor.average_rating ?? 0;
  const reviews = vendor.review_count ?? 0;
  const location = vendor.city ?? vendor.location_text;

  const rootClassName = fixedHeight
    ? "h-[200px] rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
    : "block rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow";

  const contentClassName = fixedHeight ? "p-5 flex-1 flex flex-col min-h-0" : "p-5";

  return (
    <a
      href={`/vendors/${encodeURIComponent(vendor.slug)}`}
      className={rootClassName}
      aria-label={`View ${vendor.business_name}`}
    >
      <div
        className="h-24"
        style={{
          background: vendor.cover_image_url
            ? `linear-gradient(135deg, rgba(166,124,82,0.22), rgba(255,255,255,0.88)), url(${vendor.cover_image_url}) center/cover no-repeat`
            : `linear-gradient(135deg, ${tone}22, #ffffff 65%)`,
        }}
      />
      <div className={contentClassName}>
        <div className="text-[12px] font-semibold text-black/45">{location ? location : "Philippines"}</div>
        <div className="mt-1 flex items-center gap-2">
          {vendor.logo_url ? (
            <img
              src={vendor.logo_url}
              alt={`${vendor.business_name} logo`}
              className="h-8 w-8 rounded-[3px] border border-black/10 bg-white object-contain"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : null}
          <div className="text-[15px] font-semibold text-[#2c2c2c]">{vendor.business_name}</div>
        </div>
        <div className={fixedHeight ? "mt-auto flex items-center justify-between pt-3" : "mt-3 flex items-center justify-between"}>
          <div className="inline-flex items-center gap-1 text-[12px] font-semibold text-black/55">
            <span className="text-[#a67c52]">{rating.toFixed(1)}</span>
            <span className="text-black/30">•</span>
            <span>{reviews} reviews</span>
          </div>
          <span className="text-[13px] font-semibold text-[#6e4f33] hover:underline">Explore</span>
        </div>
      </div>
    </a>
  );
}
