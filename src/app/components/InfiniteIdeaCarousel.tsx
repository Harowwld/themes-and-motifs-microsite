"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useAnimationControls, Variants } from "framer-motion";
import Link from "next/link";
import { Tag } from "lucide-react";
import { ThemedIdea } from "../sections/FeaturedThemesSection";

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

function IdeaCard({ idea, isGrid = false }: { idea: ThemedIdea, isGrid?: boolean }) {
  const gridClasses = "w-full";
  const carouselClasses = "flex-shrink-0 w-[calc((100%-48px)/3)]";

  return (
    <motion.div
      variants={isGrid ? itemVariants : undefined}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`relative group rounded-2xl overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-xl transition-shadow duration-500 border border-gray-50 ${isGrid ? gridClasses : carouselClasses}`}
    >
      <div className="relative overflow-hidden aspect-[4/5] sm:aspect-[3/4]">
        <Link href={`/suppliers/${idea.vendors.slug}`} className="block h-full w-full">
          <img 
            src={idea.image_url} 
            alt={idea.caption || idea.themes.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            loading="lazy"
            draggable={false}
          />
        </Link>
        {/* Theme Tag Badge */}
        <Link 
          href={`/themes/${idea.themes.slug}`}
          onClick={(e) => e.stopPropagation()} 
          className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase shadow-sm border border-black/5 text-[#2c2c2c] hover:bg-[#a67c52] hover:text-white hover:border-[#a67c52] transition-colors z-20"
        >
          <Tag size={12} />
          {idea.themes.name}
        </Link>
      </div>
      
      <div className="p-4">
        <Link href={`/suppliers/${idea.vendors.slug}`} className="inline-block">
          <span className="text-[14px] font-bold text-[#2c2c2c] hover:text-[#a67c52] transition-colors">
            {idea.vendors.business_name}
          </span>
        </Link>
        {idea.caption && (
          <p className="mt-1.5 text-[13px] text-black/60 line-clamp-2 leading-relaxed">
            {idea.caption}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function InfiniteIdeaCarousel({ ideas }: { ideas: ThemedIdea[] }) {
  const [currentIndex, setCurrentIndex] = useState(ideas.length);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const controls = useAnimationControls();
  const isResetting = useRef(false);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(ideas.length / itemsPerPage);

  const duplicatedIdeas = useMemo(() => [...ideas, ...ideas, ...ideas], [ideas]);
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
    if (ideas.length === 0) return;
    
    if (currentIndex >= ideas.length * 2) {
      isResetting.current = true;
      const targetIndex = ideas.length;
      controls.set({ 
        transform: `translateX(${-targetIndex * (cardWidth + gap)}px)` 
      });
      setCurrentIndex(targetIndex);
    } else if (currentIndex < ideas.length) {
      isResetting.current = true;
      const targetIndex = ideas.length + (currentIndex % ideas.length);
      controls.set({ 
        transform: `translateX(${-targetIndex * (cardWidth + gap)}px)` 
      });
      setCurrentIndex(targetIndex);
    }
  }, [currentIndex, ideas.length, cardWidth, gap, controls]);

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
    if (isPaused || ideas.length === 0 || isMobile) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, ideas.length, isMobile]);

  const getPageIdeas = useCallback((page: number) => {
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    let pageIdeas = ideas.slice(startIndex, endIndex);
    
    if (pageIdeas.length < itemsPerPage && ideas.length > itemsPerPage) {
      const needed = itemsPerPage - pageIdeas.length;
      let fillStart = startIndex - needed;
      if (fillStart < 0) fillStart = ideas.length + fillStart;
      const fillIdeas = ideas.slice(fillStart, fillStart + needed);
      pageIdeas = [...pageIdeas, ...fillIdeas];
    }
    
    return pageIdeas;
  }, [ideas, itemsPerPage]);

  useEffect(() => {
    if (!isMobile || isPaused || totalPages <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isMobile, isPaused, totalPages]);

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
            {getPageIdeas(currentPage).map((idea, i) => (
              <IdeaCard key={`${idea.id}-${currentPage}-${i}`} idea={idea} isGrid={true} />
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
          {duplicatedIdeas.map((idea, i) => (
            <IdeaCard key={`${idea.id}-${i}`} idea={idea} />
          ))}
        </motion.div>
      </div>

      <div className="flex justify-center gap-2 mt-10">
        {ideas.map((_, i) => {
          const actualIndex = currentIndex % ideas.length;
          const isActive = actualIndex === i;
          return (
            <button
              key={i}
              onClick={() => setCurrentIndex(ideas.length + i)}
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
