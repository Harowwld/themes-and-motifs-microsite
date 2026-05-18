"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useAnimationControls, Variants } from "framer-motion";
import { proxiedImageUrl } from "@/lib/imageSizes";

// Custom easings from emil-design-eng skill
const EASE_OUT = [0.23, 1, 0.32, 1] as [number, number, number, number];
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

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: EASE_OUT } 
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

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
    vendor = vendorsRaw as unknown as { id: number; business_name: string; slug: string; logo_url?: string | null };
  }
  const vendorName = vendor?.business_name;
  const vendorLogo = vendor?.logo_url;
  const coverUrl = promo.image_url ? proxiedImageUrl(promo.image_url) ?? "" : "";
  const fx = clampPct(Number(promo.image_focus_x ?? 50));
  const fy = clampPct(Number(promo.image_focus_y ?? 50));
  const z = clampZoom(Number(promo.image_zoom ?? 1));

  const gridClasses = "rounded-[10px] aspect-[3/4] shadow-[0_1px_3px_rgba(0,0,0,0.04)] w-full";
  const carouselClasses = "rounded-[12px] aspect-[3/4] shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex-shrink-0 w-[calc((100%-48px)/3)]";

  return (
    <motion.a
      variants={isGrid ? itemVariants : undefined}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      key={`${promo.id}-${index}`}
      href={`/promos/${promo.id}`}
      className={`group block overflow-hidden relative border border-gray-50 bg-white transition-shadow hover:shadow-xl ${isGrid ? gridClasses : carouselClasses}`}
    >
      <div className="absolute inset-0 overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            sizes={isGrid ? "(max-width: 640px) 50vw, 320px" : "320px"}
            className="object-cover transition-transform duration-700 group-hover:scale-110"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
      </div>

      <div className={`absolute z-20 flex items-end justify-between ${isGrid ? 'bottom-2 left-2 right-2 gap-2' : 'bottom-3 left-3 right-3 gap-3'}`}>
        <div className={`backdrop-blur-md bg-white/80 border border-white/40 shadow-sm flex-1 min-w-0 ${isGrid ? 'rounded-lg p-2' : 'rounded-xl p-3'}`}>
          <div className={`font-semibold text-[#a68b6a] uppercase tracking-wider truncate font-[family-name:var(--font-plus-jakarta)] ${isGrid ? 'text-[8px]' : 'text-[10px]'}`}>
            {vendorName}
          </div>
          <div className={`font-bold text-[#1a1a1a] leading-tight line-clamp-2 font-[family-name:var(--font-plus-jakarta)] ${isGrid ? 'mt-0.5 text-[10px]' : 'mt-1 text-[13px]'}`}>
            {promo.title}
          </div>
          <div className={isGrid ? 'mt-1' : 'mt-2'}>
            {typeof promo.discount_percentage === "number" ? (
              <span className={`inline-flex items-center rounded bg-[#a68b6a] font-bold text-white font-[family-name:var(--font-plus-jakarta)] ${isGrid ? 'px-1.5 py-0.5 text-[8px]' : 'px-2 py-0.5 text-[10px]'}`}>
                {isGrid ? `${promo.discount_percentage}%` : `${promo.discount_percentage}% OFF`}
              </span>
            ) : (
              <span className={`inline-flex items-center font-semibold text-[#a68b6a] font-[family-name:var(--font-plus-jakarta)] ${isGrid ? 'gap-1 text-[8px]' : 'gap-1.5 text-[10px]'}`}>
                <span className={`rounded-full bg-[#a68b6a] animate-pulse ${isGrid ? 'h-1 w-1' : 'h-1.5 w-1.5'}`} aria-hidden />
                Limited
              </span>
            )}
          </div>
        </div>
        {vendorLogo ? (
          <div className={`relative rounded-lg border border-white/40 bg-white/60 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-sm ${isGrid ? 'h-8 w-8' : 'h-12 w-12'}`}>
            <Image
              src={proxiedImageUrl(vendorLogo) ?? vendorLogo}
              alt=""
              fill
              sizes={isGrid ? "32px" : "48px"}
              className="object-cover"
            />
          </div>
        ) : null}
      </div>
    </motion.a>
  );
}

export default function InfinitePromoCarousel({ promos }: { promos: FeaturedPromo[] }) {
  const [currentIndex, setCurrentIndex] = useState(promos.length);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const controls = useAnimationControls();
  const isResetting = useRef(false);

  const [currentPage, setCurrentPage] = useState(0);
  const promosPerPage = 6;
  const totalPages = Math.ceil(promos.length / promosPerPage);

  const duplicatedPromos = useMemo(() => [...promos, ...promos, ...promos], [promos]);
  const [containerWidth, setContainerWidth] = useState(0);
  const gap = isMobile ? 16 : 24;

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

  const cardWidth = containerWidth > 0 ? (containerWidth - (gap * 2)) / 3 : 320;

  const handleAnimationComplete = useCallback(() => {
    if (promos.length === 0) return;
    
    if (currentIndex >= promos.length * 2) {
      isResetting.current = true;
      const targetIndex = promos.length;
      controls.set({ 
        transform: `translateX(${-targetIndex * (cardWidth + gap)}px)` 
      });
      setCurrentIndex(targetIndex);
    } else if (currentIndex < promos.length) {
      isResetting.current = true;
      const targetIndex = promos.length + (currentIndex % promos.length);
      controls.set({ 
        transform: `translateX(${-targetIndex * (cardWidth + gap)}px)` 
      });
      setCurrentIndex(targetIndex);
    }
  }, [currentIndex, promos.length, cardWidth, gap, controls]);

  useEffect(() => {
    if (isMobile) return;
    if (isResetting.current) {
      isResetting.current = false;
      return;
    }
    controls.start({
      transform: `translateX(${-currentIndex * (cardWidth + gap)}px)`,
      transition: SPRING
    });
  }, [currentIndex, controls, cardWidth, gap, isMobile]);

  useEffect(() => {
    if (isPaused || promos.length === 0 || isMobile) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, promos.length, isMobile]);

  const getPagePromos = useCallback((page: number) => {
    const startIndex = page * promosPerPage;
    const endIndex = startIndex + promosPerPage;
    let pagePromos = promos.slice(startIndex, endIndex);
    
    if (pagePromos.length < promosPerPage && promos.length > promosPerPage) {
      const needed = promosPerPage - pagePromos.length;
      let fillStart = startIndex - needed;
      if (fillStart < 0) fillStart = promos.length + fillStart;
      const fillPromos = promos.slice(fillStart, fillStart + needed);
      pagePromos = [...pagePromos, ...fillPromos];
    }
    
    return pagePromos;
  }, [promos, promosPerPage]);

  useEffect(() => {
    if (!isMobile || isPaused || totalPages <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isMobile, isPaused, totalPages]);

  if (promos.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-8 text-center">
        <div className="text-[14px] font-semibold text-gray-900">No featured promos yet</div>
        <div className="mt-1 text-[13px] text-gray-500">Feature a promo to have it appear here.</div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
              exit: { opacity: 0, transition: { duration: 0.2 } }
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-2 gap-3"
          >
            {getPagePromos(currentPage).map((promo: FeaturedPromo, i: number) => (
              <PromoCard
                key={`${promo.id}-${currentPage}-${i}`}
                promo={promo}
                index={i}
                tone={i % 2 === 0 ? "#a68b6a" : "#957a5c"}
                isGrid={true}
              />
            ))}
          </motion.div>
        </AnimatePresence>
        
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className="group p-2"
                aria-label={`Go to page ${i + 1}`}
              >
                <motion.div 
                  animate={{
                    width: currentPage === i ? 24 : 6,
                    backgroundColor: currentPage === i ? "#a68b6a" : "rgba(166, 139, 106, 0.3)"
                  }}
                  className="h-1.5 rounded-full transition-colors group-hover:bg-[#a68b6a]/50"
                />
              </button>
            ))}
          </div>
        )}
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
          className="flex gap-6 cursor-grab active:cursor-grabbing"
          onAnimationComplete={handleAnimationComplete}
        >
          {duplicatedPromos.map((promo: FeaturedPromo, i: number) => (
            <PromoCard
              key={`${promo.id}-${i}`}
              promo={promo}
              index={i}
              tone={i % 2 === 0 ? "#a68b6a" : "#957a5c"}
            />
          ))}
        </motion.div>
      </div>

      <div className="flex justify-center gap-2 mt-10">
        {promos.map((_, i) => {
          const actualIndex = currentIndex % promos.length;
          const isActive = actualIndex === i;
          return (
            <button
              key={i}
              onClick={() => setCurrentIndex(promos.length + i)}
              className="group p-2"
              aria-label={`Go to slide ${i + 1}`}
            >
              <motion.div 
                animate={{
                  width: isActive ? 32 : 8,
                  backgroundColor: isActive ? "#a68b6a" : "rgba(166, 139, 106, 0.3)"
                }}
                className="h-2 rounded-full transition-colors group-hover:bg-[#a68b6a]/50"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
