"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const EASE_OUT = [0.23, 1, 0.32, 1] as [number, number, number, number];

export default function FeaturedThemesSection() {
  // Placeholder themes for now
  const themes = [
    { id: 1, name: "Rustic Elegance", slug: "rustic-elegance" },
    { id: 2, name: "Modern Minimalist", slug: "modern-minimalist" },
    { id: 3, name: "Classic Romantic", slug: "classic-romantic" },
  ];

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
          Discover inspiration and vendors matching your dream aesthetic.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}
        className="mt-6 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 sm:px-0 max-w-5xl mx-auto"
      >
        {themes.map((theme) => (
          <Link href={`/themes/${theme.slug}`} key={theme.id} className="group relative h-48 sm:h-64 rounded-xl overflow-hidden block bg-[#f3f4f6]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <h3 className="text-white font-medium text-[16px]">{theme.name}</h3>
            </div>
          </Link>
        ))}
      </motion.div>
    </section>
  );
}
