"use client";

import { motion } from "framer-motion";
import InfiniteVendorCarousel from "../components/InfiniteVendorCarousel";
import type { FeaturedVendor } from "../types";

const EASE_OUT = [0.23, 1, 0.32, 1] as [number, number, number, number];

export default function FeaturedVendorsSection({ vendors }: { vendors: FeaturedVendor[] }) {
  return (
    <section id="featured" className="mt-4 sm:mt-16 scroll-mt-20">
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.01em] text-[#2c2c2c]"
        >
          Featured Suppliers
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
          className="mt-1 text-[13px] text-black/55 max-w-xl mx-auto font-[family-name:var(--font-plus-jakarta)]"
        >
          Handpicked suppliers for your special day.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}
        className="mt-4 sm:mt-8 max-w-5xl mx-auto py-2 sm:py-12 px-0 sm:px-6 lg:px-8"
      >
        <InfiniteVendorCarousel vendors={vendors} />
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
          href="/suppliers"
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#a68b6a] hover:text-[#957a5c] transition-colors font-[family-name:var(--font-plus-jakarta)]"
        >
          View All Suppliers
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden className="w-5 h-4">
            <path d="M2 8h16M12 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.a>
      </motion.div>
    </section>
  );
}
