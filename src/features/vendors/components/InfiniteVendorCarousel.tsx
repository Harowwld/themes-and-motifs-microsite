"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { motion, useAnimationControls } from "framer-motion";
import type { FeaturedVendor } from "../types";
import { proxiedImageUrl } from "@/lib/imageSizes";

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

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

  return (
    <motion.a
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      key={`${vendor.id}-${index}`}
      href={`/vendors/${encodeURIComponent(vendor.slug)}`}
      className="group block rounded-2xl relative aspect-[3/4] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-xl transition-shadow duration-500 flex-shrink-0 w-[280px] sm:w-[calc((100%-48px)/3)] bg-white border border-gray-50 overflow-hidden"
    >
      <div className="absolute inset-0">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 280px, 320px"
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            style={{ transformOrigin: `${fx}% ${fy}%`, transform: `scale(${z})` }}
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

      <div className="absolute inset-x-0 bottom-0 z-20 h-[38%] overflow-hidden"> {/* ← overflow-hidden does the clipping */}
        <div
          className="absolute inset-0 bg-white/80 border-t border-white/40"
          style={{
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            transform: "skewY(-4.35deg)",      // ← blur region IS the skewed shape now
            transformOrigin: "top right",       // ← right edge stays flush, left lifts
          }}
        />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
          <div className="flex items-center gap-3">
            {logoUrl && (
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm border border-gray-100">
                <div className="relative h-full w-full">
                  <Image
                    src={logoUrl}
                    alt={`${vendor.business_name} logo`}
                    fill
                    sizes="(max-width: 640px) 48px, 56px"
                    className="object-cover"
                    draggable={false}
                  />
                </div>
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="text-[14px] sm:text-[16px] font-bold text-gray-900 uppercase tracking-tight truncate font-[family-name:var(--font-plus-jakarta)] flex-1 min-w-0">
                  {vendor.business_name}
                </div>
                {vendor.document_verified === "verified" && (
                  <span className="inline-flex items-center justify-center h-5 w-5 shrink-0" aria-label="Verified">
                    <div className="relative h-full w-full">
                      <Image
                        src="/cropped-vecteezy_verification-badge-set-guaranteed-stamp-or-verified-badge_23900241.svg"
                        alt="Verified"
                        fill
                        sizes="20px"
                      />
                    </div>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] sm:text-[14px] text-gray-500 font-[family-name:var(--font-plus-jakarta)]">
                <span className="font-bold text-[#a68b6a]">{rating.toFixed(1)}</span>
                <span className="text-gray-300">·</span>
                <span className="truncate">{reviews} reviews</span>
              </div>
            </div>
          </div>

          {(location || affiliations.length > 0) && (
            <div className="mt-3 flex items-center gap-2 text-[11px] sm:text-[12px] text-gray-400 font-[family-name:var(--font-plus-jakarta)]">
              {location && (
                <span className="inline-flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="truncate">{location}</span>
                </span>
              )}
              {location && affiliations.length > 0 && (
                <span className="text-gray-200">·</span>
              )}
              {affiliations.length > 0 && (
                <span className="truncate uppercase tracking-wider font-semibold text-[10px]">
                  {affiliations.map(a => a.name).join(" · ")}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.a>
  );
}

export default function InfiniteVendorCarousel({ vendors }: { vendors: FeaturedVendor[] }) {
  const [currentIndex, setCurrentIndex] = useState(vendors.length);
  const [isPaused, setIsPaused] = useState(false);
  const isMobile = useIsMobile();
  const controls = useAnimationControls();
  const isResetting = useRef(false);

  const duplicatedVendors = useMemo(() => [...vendors, ...vendors, ...vendors], [vendors]);
  const gap = isMobile ? 16 : 24;
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const cardWidth = isMobile
    ? 280
    : containerWidth > 0 ? (containerWidth - (gap * 2)) / 3 : 320;

  const handleAnimationComplete = useCallback(() => {
    if (vendors.length === 0) return;
    
    if (currentIndex >= vendors.length * 2) {
      isResetting.current = true;
      const targetIndex = vendors.length;
      controls.set({ 
        transform: `translateX(${-targetIndex * (cardWidth + gap)}px)` 
      });
      setCurrentIndex(targetIndex);
    } else if (currentIndex < vendors.length) {
      isResetting.current = true;
      const targetIndex = vendors.length + (currentIndex % vendors.length);
      controls.set({ 
        transform: `translateX(${-targetIndex * (cardWidth + gap)}px)` 
      });
      setCurrentIndex(targetIndex);
    }
  }, [currentIndex, vendors.length, cardWidth, gap, controls]);

  useEffect(() => {
    if (isResetting.current) {
      isResetting.current = false;
      return;
    }
    controls.start({
      transform: `translateX(${-currentIndex * (cardWidth + gap)}px)`,
      transition: SPRING
    });
  }, [currentIndex, controls, cardWidth, gap]);

  useEffect(() => {
    if (isPaused || vendors.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, vendors.length]);

  if (vendors.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-8 text-center">
        <div className="text-[14px] font-semibold text-gray-900">No featured vendors yet</div>
        <div className="mt-1 text-[13px] text-gray-500">Mark vendors as featured to have them appear here.</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-visible pt-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="overflow-hidden -mx-5 px-5 sm:-mx-12 sm:px-12 py-12 -my-12">
        <motion.div
          animate={controls}
          className="flex gap-4 sm:gap-6 cursor-grab active:cursor-grabbing"
          onAnimationComplete={handleAnimationComplete}
        >
          {duplicatedVendors.map((vendor, i) => (
            <VendorCard
              key={`${vendor.id}-${i}`}
              vendor={vendor}
              index={i}
              tone={i % 2 === 0 ? "#a68b6a" : "#957a5c"}
            />
          ))}
        </motion.div>
      </div>

      <div className="flex justify-center gap-2 mt-10">
        {vendors.map((_, i) => {
          const actualIndex = currentIndex % vendors.length;
          const isActive = actualIndex === i;
          return (
            <button
              key={i}
              onClick={() => setCurrentIndex(vendors.length + i)}
              className="group p-2"
              aria-label={`Go to slide ${i + 1}`}
            >
              <motion.div
                animate={{
                  width: isActive ? 32 : 8,
                  backgroundColor: isActive ? "#a68b6a" : "rgba(166, 139, 106, 0.2)"
                }}
                className="h-1.5 rounded-full transition-colors group-hover:bg-[#a68b6a]/50"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
