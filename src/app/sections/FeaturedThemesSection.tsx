"use client";

import { motion } from "framer-motion";
import InfiniteIdeaCarousel from "../components/InfiniteIdeaCarousel";

const EASE_OUT = [0.23, 1, 0.32, 1] as [number, number, number, number];

export type ThemedIdea = {
  id: number;
  image_url: string;
  caption: string | null;
  themes: { id: number; name: string; slug: string };
  vendors: { business_name: string; slug: string };
};

export default function FeaturedThemesSection({ ideas }: { ideas?: ThemedIdea[] }) {
  if (!ideas || ideas.length === 0) return null;

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
        <InfiniteIdeaCarousel ideas={ideas} />
      </motion.div>
    </section>
  );
}
