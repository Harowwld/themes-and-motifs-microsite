"use client";

import { motion } from "framer-motion";
import InfiniteIdeaCarousel from "../components/InfiniteIdeaCarousel";

const EASE_OUT = [0.23, 1, 0.32, 1] as [number, number, number, number];

export type ThemedIdea = {
  id: number;
  image_url: string;
  caption: string | null;
  themes: { id: number; name: string; slug: string };
  vendors: { business_name: string; slug: string; logo_url?: string | null };
};

export default function FeaturedThemesSection({ ideas = [], isLoading }: { ideas?: ThemedIdea[], isLoading?: boolean }) {
  if (!isLoading && (!ideas || ideas.length === 0)) return null;

  return (
    <section id="featured-themes" className="mt-6 sm:mt-12">
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.01em] text-[#2c2c2c]"
        >
          Featured Themes
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
          className="mt-2 text-[13px] text-black/55 max-w-xl mx-auto font-[family-name:var(--font-plus-jakarta)]"
        >
          Be inspired with our community’s themed ideas.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}
        className="mt-4 sm:mt-8 max-w-5xl mx-auto py-4 sm:py-12 px-0"
      >
        {isLoading ? (
          <div className="flex gap-6 overflow-hidden px-5 sm:px-12 -mx-5 sm:-mx-12 py-12 -my-12 pointer-events-none">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 aspect-[4/5] sm:aspect-[3/4] w-[calc(100vw-32px)] sm:w-[calc((100%-48px)/3)] rounded-2xl bg-black/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <InfiniteIdeaCarousel ideas={ideas} />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 text-center"
      >
        <motion.a
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.97 }}
          href="/themes"
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#a68b6a] hover:text-[#957a5c] transition-colors font-[family-name:var(--font-plus-jakarta)]"
        >
          View All Themes
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden className="w-5 h-4">
            <path d="M2 8h16M12 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.a>
      </motion.div>
    </section>
  );
}
