"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";

type Category = {
  id: number;
  name: string;
  slug: string;
};

// Custom easings from emil-design-eng skill
const EASE_OUT = [0.23, 1, 0.32, 1] as [number, number, number, number];

function getCategoryIconSrc(categoryName: string, categorySlug: string) {
  const v = `${categoryName} ${categorySlug}`.toLowerCase();
  const tokens = v.split(/[^a-z0-9]+/g).filter(Boolean);
  const hasToken = (t: string) => tokens.includes(t);

  if (v.includes("photographer")) return "/Icons/Photographers.png";
  if (v.includes("videograph") || v.includes("videographer")) return "/Icons/Videographer.png";
  if (v.includes("photo") || v.includes("video")) return "/Icons/Photo & video.png";
  if (v.includes("studio") || v.includes("shoot")) return "/Icons/Studio.png";

  if (v.includes("flor") || v.includes("flower") || v.includes("styl") || v.includes("decor"))
    return "/Icons/Florists & Event Stylists.png";

  if (v.includes("hair") || v.includes("makeup") || v.includes("beauty") || v.includes("mua")) return "/Icons/Hait & Makeup.png";

  if (v.includes("apparel") || v.includes("dress") || v.includes("gown") || v.includes("suit")) return "/Icons/Wedding Apparel.png";

  if (v.includes("planner") || v.includes("coord") || v.includes("organizer")) return "/Icons/Wedding Planner.png";

  if (v.includes("ring") || v.includes("jewel")) return "/Icons/Wedding & Engagement Rings.png";

  if (v.includes("cater") || v.includes("food")) return "/Icons/Caterers.png";
  if (hasToken("cake") || hasToken("cakes")) return "/Icons/cake-1.png";
  if (v.includes("dessert") || v.includes("coffee") || v.includes("bar") || v.includes("cocktail"))
    return "/Icons/Desserts, Coffee, Mobuile Bars.png";

  if (v.includes("invitation") || v.includes("stationery")) return "/Icons/Invitations & Staionery.png";
  if (v.includes("souvenir") || v.includes("keepsake")) return "/Icons/Souvenirs & keepsakes.png";
  if (v.includes("gift") || v.includes("registry")) return "/Icons/Gifts & Gifts Registry.png";

  if (v.includes("transport") || v.includes("car") || v.includes("limo") || v.includes("van")) return "/Icons/Transportation.png";

  if (
    v.includes("voiceover") ||
    (hasToken("voice") && hasToken("over")) ||
    v.includes("voice-over") ||
    v.includes("emcee")
  )
    return "/Icons/Voiceover.png";

  if (v.includes("entertain") || v.includes("dj") || v.includes("music") || v.includes("band") || v.includes("host") || v.includes("mc"))
    return "/Icons/Entertainment.png";

  if (v.includes("lights") || v.includes("sound") || v.includes("audio")) return "/Icons/lights-sounds.png";
  if (v.includes("special effect") || v.includes("fx")) return "/Icons/Special Effects.png";
  if (v.includes("equip") || v.includes("rental")) return "/Icons/Equipment Rental.png";

  if (v.includes("venue") || v.includes("hall")) return "/Icons/Venue.png";
  if (v.includes("hotel")) return "/Icons/Hotels.png";
  if (v.includes("resort")) return "/Icons/Resort.png";
  if (v.includes("travel") || v.includes("tour")) return "/Icons/Travel & Tours.png";
  if (v.includes("honeymoon") || v.includes("destination")) return "/Icons/Wedding & Honeymoon Destinations.png";

  if (v.includes("real estate")) return "/Icons/Real estate.gif";
  if (v.includes("financial") || v.includes("finance")) return "/Icons/Financial Services.png";
  if (v.includes("health") || v.includes("wellness")) return "/Icons/Health & Wellness.png";
  if (v.includes("advoc")) return "/Icons/T&M Advocacies.png";

  return "/Icons/Others.png";
}

export default function CategoryBrowser({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const activeCategory = (searchParams?.get("category") ?? "").trim().toLowerCase();

  // Clear pending state when URL actually updates
  useEffect(() => {
    setPendingCategory(null);
  }, [searchParams?.get("category")]);

  const prefetchCategory = (slug: string) => {
    router.prefetch(`/vendors?category=${encodeURIComponent(slug)}`);
  };

  const items = useMemo(() => {
    return categories ?? [];
  }, [categories]);

  const isCategoryActive = (slug: string) => {
    const normalizedSlug = slug.trim().toLowerCase();
    // Show pending state immediately when clicked
    if (pendingCategory === normalizedSlug) return true;
    // Fall back to URL state
    return activeCategory === normalizedSlug;
  };

  const handleCategoryClick = (e: React.MouseEvent, slug: string, isActive: boolean) => {
    e.preventDefault();
    if (isActive) {
      setPendingCategory(null);
      router.push("/vendors", { scroll: false });
    } else {
      setPendingCategory(slug.trim().toLowerCase());
      router.push(`/vendors?category=${encodeURIComponent(slug)}`, { scroll: false });
      // Auto-collapse when expanded to show results
      if (expanded) {
        setExpanded(false);
        // Scroll to selected category after collapsing
        setTimeout(() => {
          const categoryElement = document.querySelector(`[data-category-slug="${slug}"]`);
          if (categoryElement && scrollerRef.current) {
            categoryElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        }, 100);
      }
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3, ease: EASE_OUT },
    },
  };

  return (
    <section className="mt-8 sm:mt-10 lg:mt-14">
      <div className="flex items-end justify-between gap-4 sm:gap-6">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-[11px] sm:text-[12px] font-medium text-gray-400 uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)]"
          >
            Browse
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-1 text-[15px] sm:text-[16px] lg:text-[18px] font-medium tracking-[-0.01em] text-gray-900"
          >
            Categories
          </motion.h2>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors touch-manipulation font-[family-name:var(--font-plus-jakarta)]"
        >
          {expanded ? "Collapse" : "See all"}
        </motion.button>
      </div>

      <div className="mt-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[13px] text-gray-500"
            >
              No categories loaded.
            </motion.div>
          ) : expanded ? (
            <motion.div
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            >
              {items.map((c) => {
                const isActive = isCategoryActive(c.slug);
                const isPending = pendingCategory === (c.slug ?? "").trim().toLowerCase();
                return (
                  <motion.a
                    key={c.id}
                    variants={itemVariants}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    href={`/vendors?category=${encodeURIComponent(c.slug)}`}
                    onClick={(e) => handleCategoryClick(e, c.slug, isActive)}
                    onMouseEnter={() => !isActive && prefetchCategory(c.slug)}
                    data-category-slug={c.slug}
                    className={
                      isActive
                        ? `group rounded-lg bg-[#a68b6a]/10 shadow-sm transition-colors px-3 py-3 text-center min-h-24 touch-manipulation ${isPending ? "opacity-70 animate-pulse" : ""}`
                        : "group rounded-lg bg-white shadow-sm hover:shadow-md transition-colors px-3 py-3 text-center min-h-24 touch-manipulation border border-gray-50"
                    }
                    aria-label={`Browse ${c.name}`}
                  >
                    <div className="mx-auto inline-flex h-10 w-10 items-center justify-center">
                      <img
                        src={getCategoryIconSrc(c.name, c.slug)}
                        alt=""
                        aria-hidden
                        className="h-10 w-10 object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div
                      className={
                        isActive
                          ? "mt-1 text-[12px] font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis font-[family-name:var(--font-plus-jakarta)]"
                          : "mt-1 text-[12px] font-medium text-gray-600 group-hover:text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis font-[family-name:var(--font-plus-jakarta)]"
                      }
                    >
                      {c.name}
                    </div>
                  </motion.a>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="scroller"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative -mx-4 px-4 sm:-mx-0 sm:px-0"
            >
              <div className="pointer-events-none absolute top-0 bottom-3 left-0 w-8 bg-linear-to-r from-[#fcfbf9] to-transparent z-10" />
              <div className="pointer-events-none absolute top-0 bottom-3 right-0 w-8 bg-linear-to-l from-[#fcfbf9] to-transparent z-10" />

              <motion.div
                ref={scrollerRef}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex gap-3 overflow-x-auto flex-nowrap scrollbar-none scroll-smooth pb-3 touch-manipulation snap-x snap-mandatory"
              >
                {items.map((c) => {
                  const isActive = isCategoryActive(c.slug);
                  const isPending = pendingCategory === (c.slug ?? "").trim().toLowerCase();
                  return (
                    <motion.a
                      key={c.id}
                      variants={itemVariants}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      href={`/vendors?category=${encodeURIComponent(c.slug)}`}
                      onClick={(e) => handleCategoryClick(e, c.slug, isActive)}
                      onMouseEnter={() => !isActive && prefetchCategory(c.slug)}
                      data-category-slug={c.slug}
                      className={
                        isActive
                          ? `group shrink-0 rounded-lg bg-[#a68b6a]/10 shadow-sm transition-colors px-3 py-3 text-center w-[calc(45vw-1rem)] max-w-[180px] min-h-24 snap-start touch-manipulation ${isPending ? "opacity-70 animate-pulse" : ""}`
                          : "group shrink-0 rounded-lg bg-white shadow-sm hover:shadow-md transition-colors px-3 py-3 text-center w-[calc(45vw-1rem)] max-w-[180px] min-h-24 snap-start touch-manipulation border border-gray-50"
                      }
                      aria-label={`Browse ${c.name}`}
                      title={c.name}
                    >
                      <div className="mx-auto inline-flex h-10 w-10 items-center justify-center">
                        <img
                          src={getCategoryIconSrc(c.name, c.slug)}
                          alt=""
                          aria-hidden
                          className="h-10 w-10 object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div
                        className={
                          isActive
                            ? "mt-1 text-[12px] font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis font-[family-name:var(--font-plus-jakarta)]"
                            : "mt-1 text-[12px] font-medium text-gray-600 group-hover:text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis font-[family-name:var(--font-plus-jakarta)]"
                        }
                      >
                        {c.name}
                      </div>
                    </motion.a>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
