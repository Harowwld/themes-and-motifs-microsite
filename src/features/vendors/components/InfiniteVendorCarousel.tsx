"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

  const planName = String((Array.isArray(vendor.plan) ? vendor.plan?.[0]?.name : vendor.plan?.name) ?? "")
    .trim()
    .toLowerCase();
  const isPremium = planName.includes("premium");

  return (
    <a
      key={`${vendor.id}-${index}`}
      href={`/vendors/${encodeURIComponent(vendor.slug)}`}
      className="group block rounded-[12px] overflow-hidden relative aspect-[3/4] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.04)] hover:-translate-y-3 transition-all duration-500 flex-shrink-0 w-[280px] sm:w-[320px]"
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
}

export default function InfiniteVendorCarousel({ vendors }: { vendors: FeaturedVendor[] }) {
  const [currentIndex, setCurrentIndex] = useState(vendors.length);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const duplicatedVendors = [...vendors, ...vendors, ...vendors];
  const cardWidth = 320;
  const gap = 24;

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
        className="flex gap-6 cursor-grab active:cursor-grabbing overflow-visible"
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

      <div className="flex justify-center gap-2 mt-8">
        {vendors.map((_, i) => {
          const actualIndex = currentIndex % vendors.length;
          const isActive = actualIndex === i;
          return (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`transition-all duration-300 ${
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
