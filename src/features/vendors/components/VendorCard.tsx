"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useVendorSpeculation } from "@/hooks/useVendorSpeculation";
import { useSmartPrefetch, prefetchOnHover } from "@/hooks/useSmartPrefetch";
import { useSavedVendors } from "./SavedVendorsProvider";
import type { VendorCardVendor } from "../types";
import { proxiedImageUrl } from "@/lib/imageSizes";
import { shouldShowVerifiedBadge } from "@/lib/vendorUtils";
import { toast } from "@/lib/toast";

type Props = {
  vendor: VendorCardVendor;
  toneSeed?: number;
  fixedHeight?: boolean;
  featured?: boolean;
};

const EASE_OUT = [0.23, 1, 0.32, 1] as [number, number, number, number];

export default function VendorCard({ vendor, toneSeed, fixedHeight, featured }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { savedVendorIds, toggleSavedVendor } = useSavedVendors();
  const isSaved = savedVendorIds.has(vendor.id);
  const { onMouseEnter: onSpeculationEnter } = useVendorSpeculation(vendor.slug);
  const { prefetchVendor } = useSmartPrefetch();
  
  const { onMouseEnter: onPrefetchEnter, onMouseLeave: onPrefetchLeave } = prefetchOnHover(
    () => prefetchVendor(vendor.slug),
    150
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
    toggleSavedVendor(vendor.id, !isSaved);

    try {
      if (isSaved) {
        const res = await fetch(`/api/saved-suppliers?vendorId=${vendor.id}`, {
          method: "DELETE",
          headers: { authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error ?? "Failed to remove supplier.");
        }
        toast.success("Supplier removed from your list.");
      } else {
        const res = await fetch("/api/saved-suppliers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ vendorId: vendor.id }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error ?? "Failed to save supplier.");
        }
        toast.success("Supplier saved to your list.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update saved vendor.");
      toggleSavedVendor(vendor.id, isSaved);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.a
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      href={`/suppliers/${encodeURIComponent(vendor.slug)}`}
      className={`group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-2xl ${fixedHeight ? 'h-[200px] sm:h-[240px] flex flex-col' : 'block'}`}
      style={{ contentVisibility: "auto", containIntrinsicSize: "0 240px" }}
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
      <div className={`relative ${featured ? 'h-32 sm:h-48' : 'h-24 sm:h-28'} overflow-hidden`}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={handleSaveClick}
          disabled={isLoading}
          className={`absolute top-2.5 right-2.5 z-10 h-8 w-8 rounded-full flex items-center justify-center transition-colors shadow-md ${
            isSaved 
              ? "bg-[#a68b6a] text-white" 
              : "bg-white/80 backdrop-blur-md text-[#a68b6a] hover:bg-white"
          }`}
          aria-label={isSaved ? "Remove from saved" : "Save vendor"}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.svg
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </motion.svg>
            ) : (
              <motion.svg 
                key={isSaved ? "saved" : "unsaved"}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="h-4 w-4" 
                fill={isSaved ? "currentColor" : "none"} 
                stroke="currentColor" 
                strokeWidth="2" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>

        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-110"
            style={{ objectPosition: coverObjectPosition, transformOrigin: coverObjectPosition, transform: `scale(${coverZoom})` }}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${tone}11, #ffffff 80%)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-40" />
      </div>

      <div className="relative px-4 pt-0 pb-4">
        <div className="relative -mt-8 sm:-mt-10 mb-2 sm:mb-3 flex items-end justify-between">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white bg-white shadow-lg sm:shadow-xl overflow-hidden flex items-center justify-center shrink-0 -ml-1 transition-transform group-hover:-translate-y-1">
            {logoUrl ? (
              <div className="relative h-full w-full">
                <Image
                  src={logoUrl}
                  alt={`${vendor.business_name} logo`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-full w-full bg-gray-50 flex items-center justify-center text-gray-300">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <motion.span 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
            className="text-[11px] font-bold text-[#a68b6a] uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)] bg-[#a68b6a]/5 px-2 py-1 rounded-full"
          >
            Explore
          </motion.span>
        </div>

        <div className="flex items-center gap-1.5 mb-1.5">
          <h3 className="text-[13px] sm:text-[15px] font-bold text-gray-900 tracking-tight line-clamp-1 font-[family-name:var(--font-plus-jakarta)]">
            {vendor.business_name}
          </h3>
          {(() => {
            if (shouldShowVerifiedBadge(vendor.document_verified, isPremium)) {
              return (
                <span className="shrink-0" title={isPremium ? "Verified Premium Vendor" : "Verified Vendor"}>
                  <Image
                    src="/verified-badge.svg"
                    alt="Verified"
                    width={18}
                    height={18}
                    className="object-contain"
                  />
                </span>
              );
            }
            return null;
          })()}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-[12px] text-gray-500 font-[family-name:var(--font-plus-jakarta)]">
          <div className="flex items-center gap-1">
            <span className="font-bold text-[#a68b6a]">{rating.toFixed(1)}</span>
            <span className="text-gray-200">·</span>
            <span className="truncate">{reviews} reviews</span>
          </div>
          {location && (
            <>
              <span className="text-gray-200">·</span>
              <span className="truncate">{location}</span>
            </>
          )}
        </div>
      </div>
    </motion.a>
  );
}

export function VendorCardSkeleton({ fixedHeight, featured }: { fixedHeight?: boolean; featured?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm animate-pulse ${fixedHeight ? 'h-[200px] sm:h-[240px] flex flex-col' : 'block'}`}>
      <div className={`relative ${featured ? 'h-32 sm:h-48' : 'h-24 sm:h-28'} overflow-hidden bg-stone-100`} />
      <div className="relative px-4 pt-0 pb-4">
        <div className="relative -mt-8 sm:-mt-10 mb-2 sm:mb-3 flex items-end justify-between">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white bg-white shadow-lg sm:shadow-xl overflow-hidden flex items-center justify-center shrink-0 -ml-1">
            <div className="h-full w-full bg-stone-100" />
          </div>
          <div className="h-6 w-14 rounded-full bg-stone-100" />
        </div>

        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="h-4 w-2/3 bg-stone-100 rounded animate-pulse" />
        </div>

        <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-[12px] text-gray-500 font-[family-name:var(--font-plus-jakarta)]">
          <div className="flex items-center gap-1">
            <div className="h-3 w-6 bg-stone-100 rounded animate-pulse" />
            <span className="text-gray-200">·</span>
            <div className="h-3 w-14 bg-stone-100 rounded animate-pulse" />
          </div>
          <span className="text-gray-200">·</span>
          <div className="h-3 w-20 bg-stone-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

