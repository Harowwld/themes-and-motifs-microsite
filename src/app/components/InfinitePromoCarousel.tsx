"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { proxiedImageUrl } from "@/lib/imageSizes";

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

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(false);
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsTablet(w >= 640 && w < 1024);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isTablet;
}

type FeaturedPromo = {
  id: number;
  title: string;
  summary: string | null;
  valid_from: string | null;
  valid_to: string | null;
  image_url?: string | null;
  discount_percentage?: number | null;
  image_focus_x?: number | null;
  image_focus_y?: number | null;
  image_zoom?: number | null;
  vendors: {
    id: number;
    business_name: string;
    slug: string;
    logo_url?: string | null;
  }[];
};

function clampPct(v: number) {
  if (!Number.isFinite(v)) return 50;
  return Math.max(0, Math.min(100, v));
}

function clampZoom(v: number) {
  if (!Number.isFinite(v)) return 1;
  return Math.max(1, Math.min(3, v));
}


function PromoCard({
  promo,
  index,
  tone,
  isGrid = false,
}: {
  promo: FeaturedPromo;
  index: number;
  tone: string;
  isGrid?: boolean;
}) {
  const vendorsRaw = promo.vendors;
  let vendor = null;
  if (Array.isArray(vendorsRaw)) {
    vendor = vendorsRaw[0];
  } else if (vendorsRaw && typeof vendorsRaw === 'object') {
    vendor = vendorsRaw as any;
  }
  const vendorName = vendor?.business_name;
  const vendorLogo = vendor?.logo_url;
  const coverUrl = promo.image_url ? proxiedImageUrl(promo.image_url) ?? "" : "";
  const fx = clampPct(Number(promo.image_focus_x ?? 50));
  const fy = clampPct(Number(promo.image_focus_y ?? 50));
  const z = clampZoom(Number(promo.image_zoom ?? 1));

  // Grid card classes (mobile 2x3)
  const gridClasses = "rounded-[10px] aspect-[3/4] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-500 w-full";
  // Carousel card classes (desktop)
  const carouselClasses = "rounded-[12px] aspect-[3/4] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.04)] hover:-translate-y-3 transition-all duration-500 flex-shrink-0 w-[320px]";

  return (
    <a
      key={`${promo.id}-${index}`}
      href={`/promos/${promo.id}`}
      className={`group block overflow-hidden relative ${isGrid ? gridClasses : carouselClasses}`}
    >
      <div className="absolute inset-0">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            sizes={isGrid ? "(max-width: 640px) 50vw, 320px" : "320px"}
            className="object-cover"
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

      <div className={`absolute z-20 flex items-end justify-between ${isGrid ? 'bottom-2 left-2 right-2 gap-2' : 'bottom-3 left-3 right-3 gap-2'}`}>
        <div className={`backdrop-blur-md bg-white/75 border border-white/40 shadow-lg flex-1 min-w-0 ${isGrid ? 'rounded-[6px] p-2' : 'rounded-[6px] p-3'}`}>
          <div className={`font-semibold text-[#a68b6a] uppercase tracking-wide truncate font-[family-name:var(--font-plus-jakarta)] ${isGrid ? 'text-[9px]' : 'text-[10px]'}`}>
            {vendorName}
          </div>
          <div className={`font-bold text-[#2c2c2c] leading-tight line-clamp-2 font-[family-name:var(--font-plus-jakarta)] ${isGrid ? 'mt-0.5 text-[11px]' : 'mt-1 text-[14px]'}`}>
            {promo.title}
          </div>
          <div className={isGrid ? 'mt-1' : 'mt-2'}>
            {typeof promo.discount_percentage === "number" ? (
              <span className={`inline-flex items-center rounded-sm bg-[#a68b6a] font-bold text-white font-[family-name:var(--font-plus-jakarta)] ${isGrid ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[11px]'}`}>
                {isGrid ? `${promo.discount_percentage}%` : `${promo.discount_percentage}% OFF`}
              </span>
            ) : (
              <span className={`inline-flex items-center font-semibold text-[#a68b6a] font-[family-name:var(--font-plus-jakarta)] ${isGrid ? 'gap-1 text-[9px]' : 'gap-1.5 text-[10px]'}`}>
                <span className={`rounded-full bg-[#a68b6a] animate-pulse ${isGrid ? 'h-1 w-1' : 'h-1.5 w-1.5'}`} aria-hidden />
                Limited Time
              </span>
            )}
          </div>
        </div>
        {vendorLogo ? (
          <div className={`rounded-[6px] border border-white/40 bg-white/50 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-lg ${isGrid ? 'h-10 w-10' : 'h-16 w-16'}`}>
            <Image
              src={proxiedImageUrl(vendorLogo) ?? vendorLogo}
              alt=""
              fill
              sizes={isGrid ? "40px" : "64px"}
              className="object-cover"
            />
          </div>
        ) : null}
      </div>
    </a>
  );
}

export default function InfinitePromoCarousel({ promos }: { promos: FeaturedPromo[] }) {
  const [currentIndex, setCurrentIndex] = useState(promos.length);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  // Mobile-specific state (always defined, but only used on mobile)
  const [currentPage, setCurrentPage] = useState(0);
  const [isFading, setIsFading] = useState(false);
  
  const promosPerPage = 6;
  const totalPages = Math.ceil(promos.length / promosPerPage);

  const duplicatedPromos = [...promos, ...promos, ...promos];
  const cardWidth = 320;
  const gap = 24;

  // Desktop carousel hooks
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
    if (currentIndex >= promos.length * 2) {
      goToSlide(promos.length, true);
    } else if (currentIndex < promos.length) {
      goToSlide(promos.length + currentIndex % promos.length, true);
    }
  }, [currentIndex, promos.length, goToSlide]);

  const handleDotClick = (dotIndex: number) => {
    goToSlide(promos.length + dotIndex);
  };

  // Desktop carousel auto-advance
  useEffect(() => {
    if (isPaused || promos.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, promos.length]);

  // Mobile carousel functions (defined but only used on mobile)
  const getPagePromos = useCallback((page: number) => {
    const startIndex = page * promosPerPage;
    const endIndex = startIndex + promosPerPage;
    let pagePromos = promos.slice(startIndex, endIndex);
    
    // If we have less than 6 promos on this page, fill from previous pages
    if (pagePromos.length < promosPerPage && promos.length > promosPerPage) {
      const needed = promosPerPage - pagePromos.length;
      let fillStart = startIndex - needed;
      if (fillStart < 0) fillStart = promos.length + fillStart; // Wrap around
      const fillPromos = promos.slice(fillStart, fillStart + needed);
      pagePromos = [...pagePromos, ...fillPromos];
    }
    
    return pagePromos;
  }, [promos, promosPerPage]);

  const currentPromos = getPagePromos(currentPage);

  // Mobile carousel auto-advance
  useEffect(() => {
    if (!isMobile || isPaused || totalPages <= 1) return;
    
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
        setIsFading(false);
      }, 300); // Fade duration
    }, 5000); // Time between pages
    
    return () => clearInterval(interval);
  }, [isMobile, isPaused, totalPages]);

  // Mobile touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold && totalPages > 1) {
      setIsFading(true);
      setTimeout(() => {
        if (diff > 0) {
          // Swipe left - next page
          setCurrentPage((prev) => (prev + 1) % totalPages);
        } else {
          // Swipe right - previous page
          setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
        }
        setIsFading(false);
      }, 300);
    }
    
    setTimeout(() => setIsPaused(false), 1000);
  }, [totalPages]);

  const handleMobileDotClick = useCallback((pageIndex: number) => {
    if (pageIndex === currentPage) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentPage(pageIndex);
      setIsFading(false);
    }, 300);
  }, [currentPage]);

  
  if (promos.length === 0) {
    return (
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
        <div className="text-[13px] font-semibold text-[#2c2c2c]">No featured promos yet</div>
        <div className="mt-1 text-[13px] text-black/55">Feature a promo to have it appear here.</div>
      </div>
    );
  }

  // Mobile: Show fade carousel with 2x3 grid (6 promos per page)
  if (isMobile) {
    const currentPromos = getPagePromos(currentPage);
    
    return (
      <div className="pt-4">
        <div
          className={`transition-opacity duration-300 ${
            isFading ? 'opacity-0' : 'opacity-100'
          }`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="grid grid-cols-2 gap-3">
            {currentPromos.map((promo, i) => (
              <PromoCard
                key={`${promo.id}-${currentPage}-${i}`}
                promo={promo}
                index={i}
                tone={i % 2 === 0 ? "#a68b6a" : "#957a5c"}
                isGrid={true}
              />
            ))}
          </div>
        </div>
        
        {/* Dot indicators */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => handleMobileDotClick(i)}
                className={`transition-all duration-300 min-h-[6px] min-w-[6px] ${
                  currentPage === i
                    ? "w-4 h-1.5 bg-[#a68b6a] rounded-full"
                    : "w-1.5 h-1.5 bg-[#a68b6a]/30 rounded-full hover:bg-[#a68b6a]/50"
                }`}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>
        )}
        

      </div>
    );
  }

  // Tablet/Desktop: Show carousel
  return (
    <div
      className="relative overflow-x-hidden overflow-y-visible pt-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={containerRef}
        className="flex gap-6 cursor-grab active:cursor-grabbing"
        style={{
          transform: `translateX(-${currentIndex * (cardWidth + gap)}px)`,
          transition: isTransitioning ? "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)" : "none",
        }}
        onTransitionEnd={handleTransitionEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {duplicatedPromos.map((promo, i) => (
          <PromoCard
            key={`${promo.id}-${i}`}
            promo={promo}
            index={i}
            tone={i % 2 === 0 ? "#a68b6a" : "#957a5c"}
            isGrid={false}
          />
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-8">
        {promos.map((_, i) => {
          const actualIndex = currentIndex % promos.length;
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
