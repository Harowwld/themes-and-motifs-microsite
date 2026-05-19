"use client";

import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaTiktok,
  FaYoutube,
  FaPinterestP,
  FaGlobe,
  FaLink,
} from "react-icons/fa6";
import Image from "next/image";
import { proxiedImageUrl } from "@/lib/imageSizes";

import VendorPhotosCarousel from "./VendorPhotosCarousel";
import ClaimVendorButton from "./ClaimVendorButton";
import VendorContactCTA from "./VendorContactCTA";
import SaveVendorCTA from "./SaveVendorCTA";
import VendorReviewForm from "../../../app/vendors/[slug]/VendorReviewForm";
import VendorQRCode from "../../../components/VendorQRCode";


function clampPct(v: number) {
  if (!Number.isFinite(v)) return 50;
  return Math.max(0, Math.min(100, v));
}

function clampZoom(v: number) {
  if (!Number.isFinite(v)) return 1;
  return Math.max(1, Math.min(3, v));
}

export default function VendorProfileUI({ vendor, categories, affiliations, themes, images, socials, reviews, promos }: any) {
  const locationParts = [];
  if (vendor.city) locationParts.push(vendor.city);
  if (vendor.location_text) locationParts.push(vendor.location_text);
  const location = locationParts.join(", ") || null;

  const cover = images.find((i: any) => i.is_cover) ?? images[0];
  const coverUrl = cover?.image_url ? proxiedImageUrl(cover.image_url) ?? "" : "";
  const logoUrl = vendor.logo_url ? proxiedImageUrl(vendor.logo_url) : null;

  const isPremium = (vendor.plan_name ?? "").toLowerCase().includes("premium");

  const verifiedStatuses = (vendor.document_verified ?? "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const hasVerified = verifiedStatuses.includes("verified");
  const hasInProgress = verifiedStatuses.includes("verification_in_progress");
  const hasCommunity = verifiedStatuses.includes("community_recognized");
  const hasEstablished = verifiedStatuses.includes("established_professional");

  function formatDate(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  }

  return (
    <main className="pb-10 sm:pb-14 w-full">
      {/* Hero Section with Cover */}
      <section className="relative">
        <div
          className="h-56 sm:h-72 w-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(166,139,106,0.2), rgba(166,139,106,0.05))",
          }}
        >
          {coverUrl && (
            <Image
              src={coverUrl}
              alt="Cover photo"
              fill
              sizes="100vw"
              priority
              className="object-cover object-center"
            />
          )}
        </div>
      </section>

      {/* Profile Header */}
      <section className="relative -mt-20 sm:-mt-24 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-end gap-4">
            {/* Logo */}
            <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-2xl border-4 border-white bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] overflow-hidden flex items-center justify-center shrink-0 -mb-2">
              {logoUrl ? (
                <div className="relative h-full w-full">
                  <Image
                    src={logoUrl}
                    alt={`${vendor.business_name} logo`}
                    fill
                    sizes="(max-width: 640px) 112px, 144px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="relative h-full w-full rounded-2xl bg-white flex items-center justify-center text-[28px] font-bold text-[#a68b6a]">
                  {vendor.business_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex-1 flex items-center justify-end gap-2 pb-2" />
          </div>

          {/* Business Info */}
          <div className="mt-5">
            <h1 className="font-serif text-[26px] sm:text-[34px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
              <span className="inline-flex items-center gap-2">
                <span>{vendor.business_name}</span>
                {/* 1. Verified Premium or Standard Verified */}
                {(hasVerified || (isPremium && !hasInProgress)) ? (
                  isPremium ? (
                    <span className="inline-flex items-center justify-center h-6 w-6 relative shrink-0" title="Verified Premium Vendor">
                      <Image
                        src="/cropped-vecteezy_verification-badge-set-guaranteed-stamp-or-verified-badge_23900241.svg"
                        alt="Verified Premium Vendor"
                        fill
                        sizes="24px"
                        className="object-contain"
                      />
                    </span>
                  ) : (
                    <div className="relative h-6 w-6 shrink-0 text-[#60a5fa]" title="Verified Professional">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                      </svg>
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute inset-0 h-full w-full p-1.5">
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                  )
                ) : hasInProgress ? (
                  <div className="h-6 w-6 shrink-0 flex items-center justify-center text-[#ffc067]" title="Verification In Progress">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                ) : null}

                {/* 2. Community Recognized */}
                {hasCommunity ? (
                  <div className="relative h-6 w-6 shrink-0" title="Community Recognized">
                    <svg viewBox="2296 283 599 599" className="h-full w-full select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="nonzero" fill="#e07a90" d="M 2890.210938 579.460938 C 2890.210938 603.738281 2857.238281 623.371094 2851.261719 645.769531 C 2845.058594 668.941406 2863.621094 702.390625 2851.878906 722.679688 C 2839.980469 743.261719 2801.621094 743.828125 2784.921875 760.53125 C 2768.210938 777.238281 2767.640625 815.589844 2747.058594 827.5 C 2726.769531 839.238281 2693.320312 820.679688 2670.148438 826.871094 C 2647.75 832.859375 2628.128906 865.828125 2603.839844 865.828125 C 2579.558594 865.828125 2559.929688 832.859375 2537.539062 826.871094 C 2514.359375 820.679688 2480.921875 839.238281 2460.628906 827.5 C 2440.050781 815.589844 2439.46875 777.238281 2422.769531 760.53125 C 2406.070312 743.828125 2367.710938 743.261719 2355.800781 722.679688 C 2344.070312 702.390625 2362.621094 668.941406 2356.429688 645.769531 C 2350.441406 623.371094 2317.46875 603.738281 2317.46875 579.460938 C 2317.46875 555.179688 2350.441406 535.550781 2356.429688 513.160156 C 2362.621094 489.980469 2344.070312 456.53125 2355.800781 436.238281 C 2367.710938 415.660156 2406.070312 415.089844 2422.769531 398.390625 C 2439.46875 381.679688 2440.050781 343.328125 2460.628906 331.421875 C 2480.921875 319.679688 2514.359375 338.238281 2537.539062 332.050781 C 2559.929688 326.058594 2579.558594 293.089844 2603.839844 293.089844 C 2628.128906 293.089844 2647.75 326.058594 2670.148438 332.050781 C 2693.320312 338.238281 2726.769531 319.679688 2747.058594 331.421875 C 2767.640625 343.328125 2768.210938 381.679688 2784.921875 398.390625 C 2801.621094 415.089844 2839.980469 415.660156 2851.878906 436.25 C 2863.621094 456.53125 2845.058594 489.980469 2851.261719 513.160156 C 2857.238281 535.550781 2890.210938 555.179688 2890.210938 579.460938 Z" />
                      <path fillRule="nonzero" fill="white" d="M 2749.328125 490.808594 C 2737.230469 478.710938 2717.621094 478.710938 2705.519531 490.808594 L 2578.648438 617.671875 L 2525.96875 564.988281 C 2513.871094 552.890625 2494.25 552.890625 2482.148438 564.988281 C 2470.050781 577.089844 2470.050781 596.710938 2482.148438 608.808594 L 2555.628906 682.28125 C 2561.960938 688.609375 2570.359375 691.628906 2578.648438 691.328125 C 2586.949219 691.628906 2595.339844 688.609375 2601.671875 682.28125 L 2749.328125 534.621094 C 2761.429688 522.519531 2761.429688 502.910156 2749.328125 490.808594 " />
                    </svg>
                  </div>
                ) : null}


                {/* 3. Established Professional */}
                {hasEstablished ? (
                  <div className="relative h-6 w-6 shrink-0 text-[#4ade80]" title="Established Professional">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">10</span>
                  </div>
                ) : null}
              </span>
            </h1>

            {/* Category Pills */}
            {categories.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((c: any) => (
                  <a
                    key={c.id}
                    className="inline-flex items-center rounded-full border border-[#a68b6a]/25 bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#6e4f33] hover:bg-[#fffaf5] transition-[transform,background-color,box-shadow,border-color] duration-200 ease-out hover:-translate-y-[1px] active:scale-[0.96] shadow-sm hover:shadow-md"
                    href={`/vendors?category=${encodeURIComponent(c.slug)}`}
                  >
                    {c.name}
                  </a>
                ))}
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[14px] text-black/55">
              {location ? (
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="h-4 w-4" />
                  {location}
                </span>
              ) : null}
              <span className="flex items-center gap-1">
                <StarIcon className="h-4 w-4 text-[#a68b6a]" />
                <span className="font-semibold text-[#a68b6a]">{(vendor.average_rating ?? 0).toFixed(1)}</span>
                <span>· {vendor.review_count ?? 0} reviews</span>
                {vendor.save_count && vendor.save_count > 0 ? (
                  <span className="text-black/40">· {vendor.save_count} saved</span>
                ) : null}
              </span>
              {affiliations.length > 0 ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-black/40">·</span>
                  <span className="inline-flex items-center gap-1 text-[#a68b6a]">
                    <svg className="h-4 w-4" viewBox="0 0 256 256" fill="currentColor">
                      <path d="M254.3,107.91,228.78,56.85a16,16,0,0,0-21.47-7.15L182.44,62.13,130.05,48.27a8.14,8.14,0,0,0-4.1,0L73.56,62.13,48.69,49.7a16,16,0,0,0-21.47,7.15L1.7,107.9a16,16,0,0,0,7.15,21.47l27,13.51,55.49,39.63a8.06,8.06,0,0,0,2.71,1.25l64,16a8,8,0,0,0,7.6-2.1l55.07-55.08,26.42-13.21a16,16,0,0,0,7.15-21.46Zm-54.89,33.37L165,113.72a8,8,0,0,0-10.68.61C136.51,132.27,116.66,130,104,122L147.24,80h31.81l27.21,54.41ZM41.53,64,62,74.22,36.43,125.27,16,115.06Zm116,119.13L99.42,168.61l-49.2-35.14,28-56L128,64.28l9.8,2.59-45,43.68-.08.09a16,16,0,0,0,2.72,24.81c20.56,13.13,45.37,11,64.91-5L188,152.66Zm62-57.87-25.52-51L214.47,64,240,115.06Zm-87.75,92.67a8,8,0,0,1-7.75,6.06,8.13,8.13,0,0,1-1.95-.24L80.41,213.33a7.89,7.89,0,0,1-2.71-1.25L51.35,193.26a8,8,0,0,1,9.3-13l25.11,17.94L126,208.24A8,8,0,0,1,131.82,217.94Z" />
                    </svg>
                  </span>
                  <span className="text-black/55">{affiliations.map((a: any) => a.name).join(" · ")}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="mt-8 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl grid gap-6 lg:grid-cols-[1fr_320px] lg:gap-8">
          {/* Main Content */}
          <div className="grid gap-6">
            {/* About */}
            {vendor.description ? (
              <div className="rounded-2xl border border-black/6 bg-[#fcfbf9] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow duration-300">
                <h2 className="font-serif text-[18px] font-semibold text-[#2c2c2c]">About</h2>
                <p className="mt-3 text-[14px] leading-7 text-black/65 whitespace-pre-line">
                  {vendor.description}
                </p>
              </div>
            ) : null}

            {/* Exclusive Deals / Marketplace */}
            {promos.length > 0 ? (
              <div className="rounded-2xl border border-black/6 bg-[#fcfbf9] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow duration-300">
                <h2 className="font-serif text-[18px] font-semibold text-[#2c2c2c]">Exclusive Deals</h2>
                <p className="mt-1 text-[13px] text-black/55">Promos and marketplace deals from this vendor.</p>
                <div className="mt-4 grid gap-3">
                  {promos.map((p: any) => (
                    <a
                      key={p.id}
                      href={`/promos/${p.id}`}
                      className="group relative block rounded-2xl border border-[#c17a4e]/20 bg-gradient-to-br from-[#fffdfa] via-white to-[#fffcf7] p-1.5 hover:-translate-y-[1px] active:scale-[0.99] hover:shadow-[0_8px_20px_-6px_rgba(193,122,78,0.15)] transition-[transform,box-shadow] duration-300 ease-out"
                    >
                      {/* Inner Dashed Border (signifying a premium ticket/coupon) */}
                      <div className="absolute inset-1.5 rounded-[10px] border border-dashed border-[#c17a4e]/35 pointer-events-none group-hover:border-[#c17a4e]/60 transition-colors duration-300" />

                      <div className="flex min-w-0 rounded-[10px] overflow-hidden relative bg-white/40">
                        {/* Promo Badge */}
                        <div className="absolute top-2 left-2 z-10">
                          <div className="bg-[#c17a4e] text-white text-[9px] font-bold tracking-widest px-2.5 py-0.5 rounded shadow-[0_2px_8px_rgba(193,122,78,0.25)] uppercase font-mono">
                            PROMO
                          </div>
                        </div>

                        {/* Left: Image */}
                        {p.image_url ? (
                          <div className="w-20 sm:w-24 md:w-28 shrink-0 relative overflow-hidden bg-[#fcfbf9]">
                            <div className="h-full min-h-20 sm:min-h-24 relative">
                              <img
                                src={proxiedImageUrl(p.image_url) ?? p.image_url}
                                alt=""
                                className="w-full h-auto min-h-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 group-hover:scale-105"
                                style={{
                                  transformOrigin: `${clampPct(Number(p.image_focus_x ?? 50))}% ${clampPct(Number(p.image_focus_y ?? 50))}%`,
                                  transform: `scale(${clampZoom(Number(p.image_zoom ?? 1))})`,
                                }}
                                draggable={false}
                                loading="lazy"
                              />
                            </div>
                          </div>
                        ) : null}

                        {/* Right: Content */}
                        <div className="flex-1 p-3 sm:p-4 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="text-[10px] font-semibold text-[#a67c52] uppercase tracking-wider">
                              Exclusive Deal
                            </div>

                            <div className="mt-0.5 text-[15px] font-bold text-[#2c2c2c] leading-snug line-clamp-2 group-hover:text-[#a67c52] transition-colors duration-200 font-serif">
                              {p.title}
                            </div>

                            {p.summary ? (
                              <div className="mt-1 text-[12px] leading-relaxed text-black/60 line-clamp-2">
                                {p.summary}
                              </div>
                            ) : null}
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-dashed border-[#c17a4e]/15">
                            {typeof p.discount_percentage === "number" ? (
                              <span className="inline-flex items-center rounded-sm bg-[#c17a4e]/10 px-2 py-0.5 text-[11px] font-bold text-[#c17a4e] border border-[#c17a4e]/20">
                                {p.discount_percentage}% OFF
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#c17a4e]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#c17a4e] animate-pulse" aria-hidden />
                                Limited Time
                              </span>
                            )}

                            {(p.valid_from || p.valid_to) ? (
                              <div className="text-[11px] text-black/45 font-medium">
                                {p.valid_from ? `From ${formatDate(p.valid_from)}` : null}
                                {p.valid_from && p.valid_to ? " · " : null}
                                {p.valid_to ? `Until ${formatDate(p.valid_to)}` : null}
                              </div>
                            ) : null}
                          </div>

                          {p.terms ? <div className="mt-2 text-[10px] leading-normal text-black/40 whitespace-pre-line line-clamp-2">{p.terms}</div> : null}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Photos & Videos */}
            {images.length > 0 ? (
              <div className="rounded-2xl border border-black/6 bg-[#fcfbf9] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow duration-300 min-w-0">
                <VendorPhotosCarousel images={images} vendorId={vendor.id} />
              </div>
            ) : null}

            {/* Reviews */}
            <div className="rounded-2xl border border-black/6 bg-[#fcfbf9] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-[18px] font-semibold text-[#2c2c2c]">Reviews</h2>
                  <p className="mt-1 text-[13px] text-black/55">Recent feedback from couples</p>
                </div>
                <div className="flex items-center gap-1 text-[20px] font-bold text-[#a68b6a]">
                  <StarIcon className="h-5 w-5" />
                  {(vendor.average_rating ?? 0).toFixed(1)}
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <VendorReviewForm vendorId={vendor.id} vendorSlug={vendor.slug} />
                {reviews.length === 0 ? (
                  <div className="rounded-xl border border-black/5 bg-white p-6 text-center">
                    <div className="text-[14px] font-semibold text-[#2c2c2c]">No reviews yet</div>
                    <div className="mt-1 text-[13px] text-black/55">Be the first to review this vendor.</div>
                  </div>
                ) : (
                  reviews.map((r: any) => (
                    <div key={r.id} className="rounded-xl border border-black/5 bg-white p-4 hover:-translate-y-[1px] hover:shadow-md active:scale-[0.99] transition-[transform,box-shadow] duration-200 ease-out">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-[#a68b6a]/10 flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-[#a68b6a]" />
                          </div>
                          <span className="text-[13px] font-semibold text-black/70">
                            {r.users?.[0]?.email ? maskEmail(r.users[0].email) : "Verified couple"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[13px] font-semibold text-[#a68b6a]">
                          <StarIcon className="h-3.5 w-3.5" />
                          {r.rating}
                        </div>
                      </div>
                      {r.review_text ? <div className="mt-3 text-[13px] leading-6 text-black/60 pl-10">{r.review_text}</div> : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="grid gap-4 content-start">
            {/* Professional Status */}
            <div className="rounded-2xl border border-black/6 bg-[#fcfbf9] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow duration-300">
              <h3 className="text-[14px] font-semibold text-[#2c2c2c]">Document Verification</h3>
              <div className="mt-3 flex flex-col gap-3">
                {/* 1. Verified */}
                {(hasVerified || (isPremium && !hasInProgress)) && (
                  <div className="flex items-center gap-2" title="VERIFIED (With DTI / SEC / BIR docs submitted)">
                    <div className="relative h-6 w-6 shrink-0" style={{ color: '#60a5fa' }}>
                      {isPremium ? (
                        <div className="relative h-6 w-6 shrink-0">
                          <Image
                            src="/cropped-vecteezy_verification-badge-set-guaranteed-stamp-or-verified-badge_23900241.svg"
                            alt="Verified Premium Vendor"
                            fill
                            sizes="24px"
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                          </svg>
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute inset-0 h-full w-full p-1.5">
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                        </>
                      )}
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: '#60a5fa' }}>
                      {isPremium ? "Verified Premium Vendor" : "Verified Professional"}
                    </span>
                  </div>
                )}

                {/* 2. Verification In Progress */}
                {hasInProgress && (
                  <div className="flex items-center gap-2" title="Verification In Progress (Awaiting submission of docs)">
                    <div className="h-6 w-6 shrink-0 flex items-center justify-center" style={{ color: '#ffc067' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: '#ffc067' }}>Verification In Progress</span>
                  </div>
                )}

                {/* 3. Community Recognized */}
                {hasCommunity && (
                  <div className="flex items-center gap-2" title="Community Recognized (Known in the community as legit/trustworthy)">
                    <div className="relative h-6 w-6 shrink-0">
                      <svg viewBox="2296 283 599 599" className="h-full w-full select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="nonzero" fill="#e07a90" d="M 2890.210938 579.460938 C 2890.210938 603.738281 2857.238281 623.371094 2851.261719 645.769531 C 2845.058594 668.941406 2863.621094 702.390625 2851.878906 722.679688 C 2839.980469 743.261719 2801.621094 743.828125 2784.921875 760.53125 C 2768.210938 777.238281 2767.640625 815.589844 2747.058594 827.5 C 2726.769531 839.238281 2693.320312 820.679688 2670.148438 826.871094 C 2647.75 832.859375 2628.128906 865.828125 2603.839844 865.828125 C 2579.558594 865.828125 2559.929688 832.859375 2537.539062 826.871094 C 2514.359375 820.679688 2480.921875 839.238281 2460.628906 827.5 C 2440.050781 815.589844 2439.46875 777.238281 2422.769531 760.53125 C 2406.070312 743.828125 2367.710938 743.261719 2355.800781 722.679688 C 2344.070312 702.390625 2362.621094 668.941406 2356.429688 645.769531 C 2350.441406 623.371094 2317.46875 603.738281 2317.46875 579.460938 C 2317.46875 555.179688 2350.441406 535.550781 2356.429688 513.160156 C 2362.621094 489.980469 2344.070312 456.53125 2355.800781 436.238281 C 2367.710938 415.660156 2406.070312 415.089844 2422.769531 398.390625 C 2439.46875 381.679688 2440.050781 343.328125 2460.628906 331.421875 C 2480.921875 319.679688 2514.359375 338.238281 2537.539062 332.050781 C 2559.929688 326.058594 2579.558594 293.089844 2603.839844 293.089844 C 2628.128906 293.089844 2647.75 326.058594 2670.148438 332.050781 C 2693.320312 338.238281 2726.769531 319.679688 2747.058594 331.421875 C 2767.640625 343.328125 2768.210938 381.679688 2784.921875 398.390625 C 2801.621094 415.089844 2839.980469 415.660156 2851.878906 436.25 C 2863.621094 456.53125 2845.058594 489.980469 2851.261719 513.160156 C 2857.238281 535.550781 2890.210938 555.179688 2890.210938 579.460938 Z" />
                        <path fillRule="nonzero" fill="white" d="M 2749.328125 490.808594 C 2737.230469 478.710938 2717.621094 478.710938 2705.519531 490.808594 L 2578.648438 617.671875 L 2525.96875 564.988281 C 2513.871094 552.890625 2494.25 552.890625 2482.148438 564.988281 C 2470.050781 577.089844 2470.050781 596.710938 2482.148438 608.808594 L 2555.628906 682.28125 C 2561.960938 688.609375 2570.359375 691.628906 2578.648438 691.328125 C 2586.949219 691.628906 2595.339844 688.609375 2601.671875 682.28125 L 2749.328125 534.621094 C 2761.429688 522.519531 2761.429688 502.910156 2749.328125 490.808594 " />
                      </svg>
                    </div>
                    <span className="text-[13px] font-semibold text-[#e07a90]">Community Recognized</span>
                  </div>
                )}

                {/* 4. Established Professional */}
                {hasEstablished && (
                  <div className="flex items-center gap-2" title="Established Professional (At least 10 years in business)">
                    <div className="relative h-6 w-6 shrink-0" style={{ color: '#4ade80' }}>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">10</span>
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: '#4ade80' }}>Established Professional</span>
                  </div>
                )}

                {/* Fallback */}
                {!hasVerified && !hasInProgress && !hasCommunity && !hasEstablished && !isPremium && (
                  <div className="text-[13px] text-black/45">Not verified</div>
                )}
              </div>
            </div>

            {/* Contact Card */}
            <div className="rounded-2xl border border-black/6 bg-[#fcfbf9] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow duration-300">
              <h3 className="text-[14px] font-semibold text-[#2c2c2c]">Contact Us!</h3>
              <p className="mt-2 text-[13px] text-black/55">
                Contact {vendor.business_name} directly to discuss your wedding needs.
              </p>
              <div className="mt-4">
                <VendorContactCTA
                  vendorId={vendor.id}
                  vendorName={vendor.business_name}
                  vendorPhone={vendor.contact_phone}
                  vendorEmail={vendor.contact_email}
                />
              </div>
              <div className="mt-3">
                <SaveVendorCTA
                  vendorId={vendor.id}
                  vendorSlug={vendor.slug}
                />
              </div>
              {vendor.website_url && isPremium ? (
                <div className="mt-3">
                  <a
                    href={withProtocol(vendor.website_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-[#a67c52] text-[14px] font-semibold text-[#a67c52] hover:bg-[#a67c52] hover:text-white bg-white hover:-translate-y-[1px] active:scale-[0.97] hover:shadow-sm transition-[transform,background-color,color,border-color,box-shadow] duration-200 ease-out"
                  >
                    <GlobeIcon className="h-4 w-4" />
                    Visit Website
                  </a>
                </div>
              ) : null}
              <div className="mt-4 grid gap-3">
                {vendor.address ? (
                  <div className="flex items-start gap-3 text-[13px] text-black/65">
                    <MapPinIcon className="h-4 w-4 shrink-0 mt-0.5 text-black/40" />
                    <span>{vendor.address}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-black/5">
                  <span className="text-black/50">Last updated</span>
                  <span className="font-semibold text-black/70">{vendor.updated_at ? formatDate(vendor.updated_at) : "—"}</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {socials.length > 0 ? (
              <div className="rounded-2xl border border-black/6 bg-[#fcfbf9] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow duration-300">
                <h3 className="text-[14px] font-semibold text-[#2c2c2c]">Social Media</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {socials.map((s: any) => (
                    <a
                      key={s.id}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-[#fcfbf9] p-0 text-[18px] text-[#6e4f33] hover:bg-[#a68b6a] hover:text-white hover:border-[#a68b6a] hover:-translate-y-[1px] active:scale-[0.95] hover:shadow-sm transition-[transform,background-color,color,border-color,box-shadow] duration-200 ease-out"
                      href={withProtocol(s.url)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={formatPlatform(s.platform)}
                      title={formatPlatform(s.platform)}
                    >
                      <span className="sr-only">{formatPlatform(s.platform)}</span>
                      {getPlatformIcon(s.platform)}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {/* QR Code */}
            <VendorQRCode
              vendorSlug={vendor.slug}
              vendorName={vendor.business_name}
            />

            {/* Themes */}
            {themes.length > 0 ? (
              <div className="rounded-2xl border border-black/6 bg-[#fcfbf9] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow duration-300">
                <h3 className="text-[14px] font-semibold text-[#2c2c2c]">Wedding Themes</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {themes.map((t: any) => (
                    <a
                      key={t.id}
                      className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50/50 px-3 py-1.5 text-[12px] font-medium text-purple-700 hover:bg-purple-50 hover:-translate-y-[1px] active:scale-[0.96] shadow-sm hover:shadow-md transition-[transform,background-color,box-shadow] duration-200 ease-out"
                      href={`/vendors?theme=${encodeURIComponent(t.slug)}`}
                    >
                      <SparklesIcon className="h-3 w-3 mr-1" />
                      {t.name}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Claim Button for unclaimed vendors */}
            {!vendor.user_id && (
              <div className="rounded-2xl border border-[#a68b6a]/30 bg-[#a68b6a]/5 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow duration-300">
                <h3 className="text-[14px] font-semibold text-[#2c2c2c]">Are you the owner?</h3>
                <p className="mt-2 text-xs text-black/60">
                  Claim this vendor listing to manage your business profile.
                </p>
                <div className="mt-4">
                  <ClaimVendorButton vendorId={vendor.id} vendorName={vendor.business_name} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function withProtocol(url: string) {
  const v = url.trim();
  if (!v) return v;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
}

function formatPlatform(platform: string) {
  const v = (platform ?? "").trim();
  if (!v) return "Social";
  return v.charAt(0).toUpperCase() + v.slice(1);
}

function normalizePlatform(platform: string) {
  return (platform ?? "").trim().toLowerCase();
}

function getPlatformIcon(platform: string) {
  const p = normalizePlatform(platform);

  if (p === "facebook" || p === "fb") return <FaFacebookF />;
  if (p === "instagram" || p === "ig") return <FaInstagram />;
  if (p === "x" || p === "twitter") return <FaXTwitter />;
  if (p === "tiktok") return <FaTiktok />;
  if (p === "youtube") return <FaYoutube />;
  if (p === "pinterest") return <FaPinterestP />;
  if (p === "website" || p === "site" || p === "link") return <FaGlobe />;
  return <FaLink />;
}

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "User";
  const maskedUser = user.length <= 2 ? `${user[0]}*` : `${user.slice(0, 2)}***`;
  return `${maskedUser}@${domain}`;
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M9 5H5" />
      <path d="M19 15v4" />
      <path d="M21 19h-4" />
    </svg>
  );
}
