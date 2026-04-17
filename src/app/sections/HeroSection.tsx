"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

type Category = {
  id: number;
  name: string;
  slug: string;
};

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

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
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
      <span className="text-[12px] font-medium text-white/70">{label}</span>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`h-10 w-full rounded-md border border-white/20 bg-white/15 backdrop-blur-sm px-3 text-left text-[14px] outline-none focus:border-white/50 focus:ring-1 focus:ring-white/30 ${
          hasValue ? "text-white" : "text-white/50"
        }`}
      >
        <span className="block truncate">{currentLabel || placeholder}</span>
      </button>

      {open && menuRect && typeof document !== "undefined"
        ? createPortal(
            <div
              role="listbox"
              className="fixed z-1000 rounded-lg border border-white/20 bg-white/90 backdrop-blur-lg shadow-xl overflow-hidden"
              style={{ top: menuRect.top, left: menuRect.left, width: menuRect.width }}
            >
              <div className="overflow-auto py-1" style={{ maxHeight: menuRect.maxHeight }}>
                <button
                  type="button"
                  className={`w-full px-3 py-2 text-left text-[14px] leading-5 whitespace-normal wrap-break-word text-gray-700 hover:bg-gray-100 ${
                    value === "" ? "bg-gray-100" : ""
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
                    className={`w-full px-3 py-2 text-left text-[14px] leading-5 whitespace-normal wrap-break-word text-gray-700 hover:bg-gray-100 ${
                      opt.value === value ? "bg-gray-100" : ""
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
            </div>,
            document.body
          )
        : null}
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
    router.push(`/vendors${qs ? `?${qs}` : ""}`);
  };

  return (
    <section className="relative overflow-hidden rounded-xl p-5 sm:p-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(https://thepennyslo.com/wp-content/uploads/2024/03/5-The-Penny-San-Luis-Obispo.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.20) 100%)",
        }}
      />
      <div className="relative z-10 pt-2">
        <div className="inline-flex items-center gap-2 rounded-[999px] border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-1 text-[12px] font-medium text-white shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-white/60" aria-hidden />
          Verified vendors
        </div>

        <h1 className="mt-5 text-[38px] leading-[1.06] sm:text-[52px] font-medium tracking-[-0.02em] text-white">
          Plan your perfect day.
          <span className="block text-white/80 italic">Find the best suppliers.</span>
        </h1>

        <p className="mt-4 max-w-xl text-[15px] sm:text-[16px] leading-7 text-white/75">
          Search over 1,000 verified wedding vendors with real reviews.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <a
            className="h-11 inline-flex items-center justify-center px-5 rounded-md text-white text-[14px] font-medium transition-colors"
            style={{ backgroundColor: 'var(--muted-brown)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted-brown-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--muted-brown)'}
            href="#discover"
          >
            Discover vendors
          </a>
          <a
            className="h-11 inline-flex items-center justify-center px-5 rounded-md border border-white/30 bg-white/10 backdrop-blur-sm text-white text-[14px] font-medium hover:bg-white/20 transition-colors"
            href="#for-vendors"
          >
            Become a vendor
          </a>
        </div>

        <div className="mt-7 grid grid-cols-3 gap-3 max-w-xl">
          <div className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md px-3 py-3">
            <div className="text-[12px] font-medium text-white/60">Browse</div>
            <div className="mt-1 text-[14px] font-medium text-white">Categories</div>
          </div>
          <div className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md px-3 py-3">
            <div className="text-[12px] font-medium text-white/60">Compare</div>
            <div className="mt-1 text-[14px] font-medium text-white">Ratings</div>
          </div>
          <div className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md px-3 py-3">
            <div className="text-[12px] font-medium text-white/60">Save</div>
            <div className="mt-1 text-[14px] font-medium text-white">Promos</div>
          </div>
        </div>
      </div>

      <div className="relative z-10 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md overflow-visible">
        <div className="px-5 py-4 border-b border-white/10">
          <div className="text-[13px] font-medium text-white">Quick search</div>
          <div className="mt-1 text-[12px] text-white/60">
            Keyword + filters (category, city, affiliation)
          </div>
        </div>

        <div className="p-5 grid gap-3 relative">
          <label className="grid gap-1">
            <span className="text-[12px] font-medium text-white/70">Keyword</span>
            <input
              placeholder="Search vendor name (e.g. Nice Print)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-10 rounded-md border border-white/20 bg-white/15 px-3 text-[14px] text-white placeholder:text-white/40 outline-none focus:border-white/50 focus:ring-1 focus:ring-white/30"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2 sm:items-start min-w-0">
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
          </div>

          <a
            id="discover"
            className="mt-1 h-10 inline-flex items-center justify-center rounded-md text-white text-[14px] font-medium transition-colors"
            style={{ backgroundColor: 'var(--muted-brown)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted-brown-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--muted-brown)'}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSearch();
            }}
          >
            Search
          </a>

          <div className="flex items-center justify-between text-[12px] text-white/50">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" aria-hidden />
              Tip: start with a category
            </span>
            <span className="font-medium">Preview UI</span>
          </div>
        </div>
      </div>
    </section>
  );
}
