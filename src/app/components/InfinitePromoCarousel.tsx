"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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
    business_name: string;
    slug: string;
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

function proxiedImageUrl(url: string) {
  const u = (url ?? "").trim();
  if (!u) return u;
  if (u.includes("drive.google.com")) {
    return `/api/image-proxy?url=${encodeURIComponent(u)}`;
  }
  return u;
}

function PromoCard({
  promo,
  index,
  tone,
}: {
  promo: FeaturedPromo;
  index: number;
  tone: string;
}) {
  const vendorName = promo.vendors?.[0]?.business_name;
  const coverUrl = promo.image_url ? proxiedImageUrl(promo.image_url) : "";
  const fx = clampPct(Number(promo.image_focus_x ?? 50));
  const fy = clampPct(Number(promo.image_focus_y ?? 50));
  const z = clampZoom(Number(promo.image_zoom ?? 1));

  return (
    <a
      key={`${promo.id}-${index}`}
      href={`/promos/${promo.id}`}
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
          <div className="text-[10px] font-semibold text-[#a68b6a] uppercase tracking-wide truncate">
            {vendorName ? vendorName : "Featured Deal"}
          </div>
          <div className="mt-1 text-[14px] font-bold text-[#2c2c2c] leading-tight line-clamp-2">
            {promo.title}
          </div>
          <div className="mt-2">
            {typeof promo.discount_percentage === "number" ? (
              <span className="inline-flex items-center rounded-sm bg-[#a68b6a] px-2 py-0.5 text-[11px] font-bold text-white">
                {promo.discount_percentage}% OFF
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#a68b6a]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#a68b6a] animate-pulse" aria-hidden />
                Limited Time
              </span>
            )}
          </div>
        </div>
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

  const duplicatedPromos = [...promos, ...promos, ...promos];
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
    if (currentIndex >= promos.length * 2) {
      goToSlide(promos.length, true);
    } else if (currentIndex < promos.length) {
      goToSlide(promos.length + currentIndex % promos.length, true);
    }
  }, [currentIndex, promos.length, goToSlide]);

  const handleDotClick = (dotIndex: number) => {
    goToSlide(promos.length + dotIndex);
  };

  useEffect(() => {
    if (isPaused || promos.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, promos.length]);

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

  if (promos.length === 0) {
    return (
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
        <div className="text-[13px] font-semibold text-[#2c2c2c]">No featured promos yet</div>
        <div className="mt-1 text-[13px] text-black/55">Feature a promo to have it appear here.</div>
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
