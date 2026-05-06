"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useVendorSpeculation } from "@/hooks/useVendorSpeculation";
import { useSmartPrefetch, prefetchOnHover } from "@/hooks/useSmartPrefetch";
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
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { onMouseEnter: onSpeculationEnter } = useVendorSpeculation(vendor.slug);
  const { prefetchVendor } = useSmartPrefetch();
  
  // Combine speculation rules with data prefetching
  const { onMouseEnter: onPrefetchEnter, onMouseLeave: onPrefetchLeave } = prefetchOnHover(
    () => prefetchVendor(vendor.slug),
    150 // 150ms delay to avoid prefetching on quick mouse passes
  );
  
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

  useEffect(() => {
    const checkSavedStatus = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? "";
      
      if (!token) return;
      
      const res = await fetch(`/api/saved-vendors?vendorId=${vendor.id}`, {
        method: "PATCH",
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.isSaved) {
        setIsSaved(true);
      }
    };
    
    checkSavedStatus();
  }, [vendor.id]);

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? "";
    
    if (!token) {
      window.location.href = "/signin?redirect=" + encodeURIComponent(window.location.pathname);
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isSaved) {
        await fetch(`/api/saved-vendors?vendorId=${vendor.id}`, {
          method: "DELETE",
          headers: { authorization: `Bearer ${token}` },
        });
        setIsSaved(false);
      } else {
        await fetch("/api/saved-vendors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ vendorId: vendor.id }),
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error saving vendor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <a
      href={`/vendors/${encodeURIComponent(vendor.slug)}`}
      className={rootClassName}
      aria-label={`View ${vendor.business_name}`}
      onMouseEnter={() => {
        setIsHovered(true);
        onSpeculationEnter();
        onPrefetchEnter();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onPrefetchLeave();
      }}
    >
      <div className={`relative ${featured ? 'h-48' : 'h-28'} overflow-hidden`}>
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={isLoading}
          className={`absolute top-2 right-2 z-10 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isSaved 
              ? "bg-[#a68b6a] text-white" 
              : isHovered 
                ? "bg-white/90 text-[#a68b6a]" 
                : "bg-white/70 text-[#a68b6a]/60"
          } hover:bg-white shadow-md`}
          aria-label={isSaved ? "Remove from saved" : "Save vendor"}
        >
          {isLoading ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg 
              className="h-4 w-4" 
              fill={isSaved ? "currentColor" : "none"} 
              stroke="currentColor" 
              strokeWidth="2" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          )}
        </button>
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
          <span className="text-[12px] font-semibold text-[#a68b6a] hover:text-[#957a5c] transition-colors font-[family-name:var(--font-plus-jakarta)]">Explore</span>
        </div>

        <div className="flex items-center gap-1 text-[14px] sm:text-[15px] font-semibold text-neutral-800 leading-5 line-clamp-1 mb-1 font-[family-name:var(--font-plus-jakarta)]">
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

        <div className="flex items-center gap-1 text-[11px] sm:text-[12px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)]">
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
