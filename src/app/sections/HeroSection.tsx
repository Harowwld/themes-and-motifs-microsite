"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";

type Category = {
  id: number;
  name: string;
  slug: string;
};

// Custom easings from emil-design-eng skill
const EASE_OUT = [0.23, 1, 0.32, 1] as [number, number, number, number];

function SelectMenu({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [menuRect, setMenuRect] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(
    null
  );

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      const menuEl = menuRef.current;
      if (!el) return;
      const target = e.target as Node;
      // Don't close if clicking inside the button or the menu (portal)
      if (el.contains(target)) return;
      if (menuEl && menuEl.contains(target)) return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMenuRect(null);
      return;
    }

    const updateRect = () => {
      const btn = buttonRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();

      const isOffscreen = r.bottom < 0 || r.top > window.innerHeight;
      if (isOffscreen) {
        setOpen(false);
        setMenuRect(null);
        return;
      }

      const margin = 8;
      const gap = 4;
      const left = Math.max(margin, Math.min(r.left, window.innerWidth - margin - r.width));
      const width = Math.min(r.width, window.innerWidth - margin * 2);

      const availableBelow = Math.max(0, window.innerHeight - (r.bottom + gap) - margin);
      const availableAbove = Math.max(0, r.top - gap - margin);

      const defaultMax = 320;
      const minUsable = 180;

      const shouldFlip = availableBelow < minUsable && availableAbove > availableBelow;
      const maxHeight = Math.min(defaultMax, shouldFlip ? availableAbove : availableBelow);
      const rawTop = shouldFlip ? r.top - gap - maxHeight : r.bottom + gap;
      const top = Math.max(margin, Math.min(rawTop, window.innerHeight - margin - Math.max(120, maxHeight)));

      setMenuRect({ top, left, width, maxHeight });
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [open]);

  const currentLabel = value ? options.find((o) => o.value === value)?.label : "";
  const hasValue = Boolean(value);

  return (
    <div ref={rootRef} className="grid gap-1 min-w-0 relative">
      <span className="text-[12px] font-medium text-white/70 font-[family-name:var(--font-plus-jakarta)]">{label}</span>
      <motion.button
        whileTap={{ scale: 0.97 }}
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`h-10 w-full rounded-md border border-white/20 bg-white/15 backdrop-blur-sm px-3 text-left text-[14px] outline-none transition-colors focus:border-white/50 focus:ring-1 focus:ring-white/30 ${hasValue ? "text-white" : "text-white/50"
          }`}
      >
        <span className="block truncate font-[family-name:var(--font-plus-jakarta)]">{currentLabel || placeholder}</span>
      </motion.button>

      <AnimatePresence>
        {open && menuRect && typeof document !== "undefined" && (
          createPortal(
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              ref={menuRef}
              role="listbox"
              className="fixed z-1000 rounded-lg border border-white/20 bg-white/90 backdrop-blur-lg shadow-xl overflow-hidden"
              style={{
                top: menuRect.top,
                left: menuRect.left,
                width: menuRect.width,
                transformOrigin: "top", // Simplified origin for better reliability with portals
              }}
            >
              <div className="overflow-auto py-1" style={{ maxHeight: menuRect.maxHeight }}>
                <button
                  type="button"
                  className={`w-full px-3 py-2 text-left text-[14px] leading-5 whitespace-normal wrap-break-word text-gray-700 hover:bg-gray-100 transition-colors font-[family-name:var(--font-plus-jakarta)] ${value === "" ? "bg-gray-100" : ""
                    }`}
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  {placeholder}
                </button>
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`w-full px-3 py-2 text-left text-[14px] leading-5 whitespace-normal wrap-break-word text-gray-700 hover:bg-gray-100 transition-colors font-[family-name:var(--font-plus-jakarta)] ${opt.value === value ? "bg-gray-100" : ""
                      }`}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>,
            document.body
          )
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HeroSection({
  categories,
  locations,
}: {
  categories: Category[];
  locations: string[];
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const categoryOptions = useMemo(() => categories ?? [], [categories]);
  const locationOptions = useMemo(() => locations ?? [], [locations]);

  const categoryMenuOptions = useMemo(
    () => categoryOptions.map((c) => ({ value: c.slug, label: c.name })),
    [categoryOptions]
  );

  const locationMenuOptions = useMemo(
    () => locationOptions.map((loc) => ({ value: loc, label: loc })),
    [locationOptions]
  );

  const onSearch = () => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (category) params.set("category", category);
    if (location) params.set("location", location);
    params.set("scroll", "results");
    params.set("from", "landing");
    const qs = params.toString();
    router.push(`/suppliers${qs ? `?${qs}` : ""}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASE_OUT },
    },
  };

  return (
    <section className="relative overflow-hidden rounded-xl p-5 sm:p-6 lg:p-8 grid gap-6 sm:gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start shadow-2xl">
      <div aria-hidden className="absolute inset-0 hidden md:block">
        <Image
          src="https://tedsezmxctrgghyabjjb.supabase.co/storage/v1/object/public/vendor-assets/hero/desktop-hero.webp"
          alt="Hero background"
          fill
          priority
          quality={85}
          className="object-cover object-center scale-105"
        />
      </div>
      <div aria-hidden className="absolute inset-0 md:hidden">
        <Image
          src="/hero-bg.jpg"
          alt="Hero background mobile"
          fill
          priority
          quality={85}
          className="object-cover object-center scale-105"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.3) 100%)",
        }}
      />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 pt-1 sm:pt-2"
      >
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 rounded-[999px] border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-1 text-[11px] sm:text-[12px] font-medium text-white shadow-sm font-[family-name:var(--font-plus-jakarta)]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white/60 animate-pulse" aria-hidden />
          25 Years of Wedding Excellence
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="mt-4 sm:mt-5 text-[32px] leading-[1.08] sm:text-[38px] sm:leading-[1.06] lg:text-[52px] font-medium tracking-[-0.02em] text-white"
        >
          Build your Wedding Dream Team.
        </motion.h1>
        
        <motion.p
          variants={itemVariants}
          className="mt-2 text-lg sm:text-xl block text-white/80 italic leading-snug"
        >
          Verified Suppliers • Real Couple Reviews • Nationwide Network
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="mt-3 sm:mt-4 max-w-xl text-[14px] sm:text-[15px] lg:text-[16px] leading-6 sm:leading-7 text-white/75 font-[family-name:var(--font-plus-jakarta)]"
        >
          Plan with confidence—find trusted wedding pros and manage every detail of your Big Day: budgets, checklists, RSVPs, guest lists, and seating plans.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap"
        >
          <motion.a
            whileTap={{ scale: 0.97 }}
            className="h-11 sm:h-12 inline-flex items-center justify-center px-5 sm:px-6 rounded-md text-white text-[14px] sm:text-[15px] font-medium transition-colors shadow-lg touch-manipulation"
            style={{ backgroundColor: 'var(--muted-brown)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted-brown-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--muted-brown)'}
            href="/suppliers"
          >
            Discover Suppliers
          </motion.a>
          <motion.a
            whileTap={{ scale: 0.97 }}
            className="h-11 sm:h-12 inline-flex items-center justify-center px-5 sm:px-6 rounded-md border border-white/30 bg-white/10 backdrop-blur-sm text-white text-[14px] sm:text-[15px] font-medium hover:bg-white/20 transition-colors shadow-lg touch-manipulation"
            href="/suppliers/plans"
          >
            Be A Verified Supplier
          </motion.a>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-5 sm:mt-7 grid grid-cols-3 gap-1.5 sm:gap-3 max-w-xl"
        >
          {[
            { label: "Unlock", value: "Great Deals" },
            { label: "Read", value: "Reviews" },
            { label: "Start", value: "Planning" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md px-2 sm:px-3 py-2 sm:py-3 transition-colors"
            >
              <div className="text-[10px] sm:text-[12px] font-medium text-white/60 font-[family-name:var(--font-plus-jakarta)]">{stat.label}</div>
              <div className="mt-0.5 text-[12px] sm:text-[14px] font-medium text-white font-[family-name:var(--font-plus-jakarta)]">{stat.value}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: EASE_OUT }}
        className="relative z-10 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md overflow-visible shadow-2xl"
      >
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-white/10">
          <div className="text-[13px] font-medium text-white font-[family-name:var(--font-plus-jakarta)]">Quick search</div>
          <div className="mt-1 text-[11px] sm:text-[12px] text-white/60 font-[family-name:var(--font-plus-jakarta)]">
            Keyword + filters (category, city, affiliation)
          </div>
        </div>

        <div className="p-4 sm:p-5 grid gap-3 relative">
          <motion.label
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="grid gap-1"
          >
            <span className="text-[12px] font-medium text-white/70">Keyword</span>
            <input
              placeholder="Search vendor name (e.g. Nice Print)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSearch();
                }
              }}
              className="h-10 rounded-md border border-white/20 bg-white/15 px-3 text-[14px] text-white placeholder:text-white/40 outline-none transition-colors focus:border-white/50 focus:ring-1 focus:ring-white/30 touch-manipulation font-[family-name:var(--font-plus-jakarta)]"
            />
          </motion.label>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="grid gap-3 sm:grid-cols-2 sm:items-start min-w-0"
          >
            <SelectMenu
              label="Category"
              value={category}
              placeholder="All categories"
              options={categoryMenuOptions}
              onChange={setCategory}
            />
            <SelectMenu
              label="City"
              value={location}
              placeholder="All cities"
              options={locationMenuOptions}
              onChange={setLocation}
            />
          </motion.div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            type="button"
            className="mt-1 h-11 inline-flex items-center justify-center rounded-md text-white text-[14px] font-medium transition-colors touch-manipulation shadow-lg"
            style={{ backgroundColor: 'var(--muted-brown)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted-brown-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--muted-brown)'}
            onClick={() => onSearch()}
          >
            Search
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="flex items-center justify-between text-[11px] sm:text-[12px] text-white/50 font-[family-name:var(--font-plus-jakarta)]"
          >
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" aria-hidden />
              Tip: start with a category
            </span>
            <span className="font-medium opacity-50">T&M Platform</span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
