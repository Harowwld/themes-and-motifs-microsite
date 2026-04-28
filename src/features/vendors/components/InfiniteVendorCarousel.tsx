"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { FeaturedVendor } from "../types";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

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

function VendorCard({
  vendor,
  index,
  tone,
}: {
  vendor: FeaturedVendor;
  index: number;
  tone: string;
}) {
  const coverUrl = proxiedImageUrl(vendor.cover_image_url);
  const logoUrl = proxiedImageUrl(vendor.logo_url);
  const fx = clampPct(Number(vendor.cover_focus_x ?? 50));
  const fy = clampPct(Number(vendor.cover_focus_y ?? 50));
  const z = clampZoom(Number(vendor.cover_zoom ?? 1));
  const rating = vendor.average_rating ?? 0;
  const reviews = vendor.review_count ?? 0;
  const location = vendor.city ?? vendor.location_text;
  const affiliations = vendor.affiliations ?? [];

  const planName = String((Array.isArray(vendor.plan) ? vendor.plan?.[0]?.name : vendor.plan?.name) ?? "")
    .trim()
    .toLowerCase();
  const isPremium = planName.includes("premium");

  return (
    <a
      key={`${vendor.id}-${index}`}
      href={`/vendors/${encodeURIComponent(vendor.slug)}`}
      className="group block rounded-[12px] relative aspect-[3/4] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.04)] hover:-translate-y-3 transition-all duration-500 flex-shrink-0 w-[280px] sm:w-[320px]"
    >
      {/* Inner clip wrapper - handles border-radius clipping without breaking backdrop-filter */}
      <div className="absolute inset-0 rounded-[12px] overflow-hidden">
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

        <div className="absolute inset-x-0 bottom-0 z-20 h-[35%] sm:h-[32%]">
        {/* Glass blur - clip-path + webkit prefix for Safari */}
        <div
          className="absolute inset-0 bg-white/70 border-t border-white/40"
          style={{
            clipPath: "polygon(0 12%, 100% 0, 100% 100%, 0 100%)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        />
        {/* Content layer */}
        <div className="absolute inset-x-0 bottom-0 px-3 sm:px-4 pb-3 sm:pb-4 pt-2">
          {/* Top row: Logo aligned with Name + Rating */}
          <div className="flex items-center gap-2 sm:gap-3">
            {logoUrl && (
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-md overflow-hidden bg-white shrink-0 shadow-sm">
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
              <div className="text-[14px] sm:text-[16px] font-semibold text-[#a68b6a] uppercase tracking-wide truncate font-[family-name:var(--font-plus-jakarta)]">
                {vendor.business_name}
              </div>
              <div className="flex items-center gap-1 text-[13px] sm:text-[15px] text-neutral-600 font-[family-name:var(--font-plus-jakarta)]">
                <span className="font-semibold text-[#a68b6a]">{rating.toFixed(1)}</span>
                <span className="text-neutral-300">·</span>
                <span className="truncate">{reviews} reviews</span>
              </div>
            </div>
          </div>

          {/* Second row: Location and Affiliations (full width, below logo) */}
          {(location || affiliations.length > 0) && (
            <div className="mt-2 flex items-center gap-1.5 text-[12px] sm:text-[13px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)]">
              {location && (
                <span className="inline-flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="truncate">{location}</span>
                </span>
              )}
              {location && affiliations.length > 0 && (
                <span className="text-neutral-300">·</span>
              )}
              {affiliations.length > 0 && (
                <span className="truncate">
                  {affiliations.map(a => a.name).join(" · ")}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}

export default function InfiniteVendorCarousel({ vendors }: { vendors: FeaturedVendor[] }) {
  const [currentIndex, setCurrentIndex] = useState(vendors.length);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isMobile = useIsMobile();

  const duplicatedVendors = [...vendors, ...vendors, ...vendors];
  const cardWidth = isMobile ? 280 : 320;
  const gap = isMobile ? 16 : 24;

  const goToSlide = useCallback(
    (index: number, instant = false) => {
      if (instant) {
        setIsTransitioning(false);
      }
      setCurrentIndex(index);
    },
    []
  );

  const handleTransitionEnd = useCallback(() => {
    if (currentIndex >= vendors.length * 2) {
      goToSlide(vendors.length, true);
    } else if (currentIndex < vendors.length) {
      goToSlide(vendors.length + currentIndex % vendors.length, true);
    }
  }, [currentIndex, vendors.length, goToSlide]);

  const handleDotClick = (dotIndex: number) => {
    goToSlide(vendors.length + dotIndex);
  };

  useEffect(() => {
    if (isPaused || vendors.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, vendors.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      setIsTransitioning(true);
      if (diff > 0) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setCurrentIndex((prev) => prev - 1);
      }
    }

    setTimeout(() => setIsPaused(false), 1000);
  };

  if (vendors.length === 0) {
    return (
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
        <div className="text-[13px] font-semibold text-[#2c2c2c]">No featured vendors yet</div>
        <div className="mt-1 text-[13px] text-black/55">Mark vendors as featured to have them appear here.</div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-x-hidden overflow-y-visible pt-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={containerRef}
        className="flex gap-4 sm:gap-6 cursor-grab active:cursor-grabbing overflow-visible pl-4 sm:pl-0"
        style={{
          transform: `translateX(-${currentIndex * (cardWidth + gap)}px)`,
          transition: isTransitioning ? "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)" : "none",
        }}
        onTransitionEnd={handleTransitionEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {duplicatedVendors.map((vendor, i) => (
          <VendorCard
            key={`${vendor.id}-${i}`}
            vendor={vendor}
            index={i}
            tone={i % 2 === 0 ? "#a68b6a" : "#957a5c"}
          />
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-6 sm:mt-8">
        {vendors.map((_, i) => {
          const actualIndex = currentIndex % vendors.length;
          const isActive = actualIndex === i;
          return (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`transition-all duration-300 min-h-[8px] min-w-[8px] ${
                isActive
                  ? "w-6 h-2 bg-[#a68b6a] rounded-full"
                  : "w-2 h-2 bg-[#a68b6a]/30 rounded-full hover:bg-[#a68b6a]/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
