"use client";

import { useMemo, useRef, useState } from "react";

type Category = {
  id: number;
  name: string;
  slug: string;
};

function getCategoryIcon(categoryName: string, categorySlug: string) {
  const v = `${categoryName} ${categorySlug}`.toLowerCase();
  const base = "h-5 w-5 text-black/55 group-hover:text-[#2c2c2c] transition-colors";
  const common = {
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: base,
    "aria-hidden": true,
  };

  if (v.includes("photo") || v.includes("video") || v.includes("camera")) {
    return (
      <svg {...common}>
        <path d="M6 7h3l2-2h2l2 2h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
        <path d="M12 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      </svg>
    );
  }

  if (v.includes("venue") || v.includes("hotel") || v.includes("church") || v.includes("reception")) {
    return (
      <svg {...common}>
        <path d="M4 21V10l8-6 8 6v11" />
        <path d="M9 21v-6h6v6" />
      </svg>
    );
  }

  if (v.includes("cake") || v.includes("dessert") || v.includes("catering") || v.includes("food")) {
    return (
      <svg {...common}>
        <path d="M7 11h10" />
        <path d="M6 11v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7" />
        <path d="M8 11V9a4 4 0 0 1 8 0v2" />
        <path d="M12 6v-2" />
      </svg>
    );
  }

  if (v.includes("dress") || v.includes("gown") || v.includes("apparel") || v.includes("suit") || v.includes("wear")) {
    return (
      <svg {...common}>
        <path d="M9 4h6l1 3-2 2v11H10V9L8 7l1-3Z" />
        <path d="M10 9h4" />
      </svg>
    );
  }

  if (v.includes("makeup") || v.includes("hair") || v.includes("beauty") || v.includes("stylist")) {
    return (
      <svg {...common}>
        <path d="M7 3h10" />
        <path d="M9 3v9a3 3 0 1 0 6 0V3" />
        <path d="M12 21v-6" />
      </svg>
    );
  }

  if (v.includes("flowers") || v.includes("flor") || v.includes("bouquet") || v.includes("decor")) {
    return (
      <svg {...common}>
        <path d="M12 21V9" />
        <path d="M12 9c2.5-3 6-3 7 0-1 3.5-4.5 3.5-7 0Z" />
        <path d="M12 9c-2.5-3-6-3-7 0 1 3.5 4.5 3.5 7 0Z" />
      </svg>
    );
  }

  if (v.includes("invitation") || v.includes("print") || v.includes("stationery")) {
    return (
      <svg {...common}>
        <path d="M4 6h16v12H4z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  if (v.includes("rings") || v.includes("jewel")) {
    return (
      <svg {...common}>
        <path d="M12 7c2.8 0 5 2.2 5 5s-2.2 6-5 6-5-3.2-5-6 2.2-5 5-5Z" />
        <path d="M9.4 7.6 7 5" />
        <path d="M14.6 7.6 17 5" />
      </svg>
    );
  }

  if (v.includes("music") || v.includes("dj") || v.includes("band") || v.includes("entertain")) {
    return (
      <svg {...common}>
        <path d="M9 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M15 16V6l6-2v10" />
        <path d="M15 6l6-2" />
        <path d="M15 16a2 2 0 1 0 0-4" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
    </svg>
  );
}

export default function CategoryBrowser({ categories }: { categories: Category[] }) {
  const [expanded, setExpanded] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const items = useMemo(() => {
    const safe = categories ?? [];
    return expanded ? safe : safe;
  }, [categories, expanded]);

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(240, Math.floor(el.clientWidth * 0.85));
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="mt-7 sm:mt-10">
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="text-[12px] font-semibold text-black/45">Browse</div>
          <h2 className="mt-1 text-[16px] sm:text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
            Categories
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-[13px] font-semibold text-[#6e4f33] hover:underline"
        >
          {expanded ? "Collapse" : "See all"}
        </button>
      </div>

      <div className="mt-4">
        {items.length === 0 ? (
          <div className="text-[13px] text-black/55">No categories loaded.</div>
        ) : expanded ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((c) => (
              <a
                key={c.id}
                href="#discover"
                className="group rounded-[3px] border border-black/10 bg-white shadow-sm hover:shadow-md hover:border-black/15 transition-all px-4 py-4 text-center"
                aria-label={`Browse ${c.name}`}
              >
                <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-[999px] bg-white border border-black/10 shadow-sm">
                  {getCategoryIcon(c.name, c.slug)}
                </div>
                <div className="mt-3 text-[13px] font-semibold text-[#6e4f33] group-hover:text-[#2c2c2c]">
                  {c.name}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-linear-to-r from-[#fcfbf9] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-[#fcfbf9] to-transparent" />

            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-[999px] border border-black/10 bg-white shadow-sm hover:shadow-md transition-shadow"
              aria-label="Scroll categories left"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-4 w-4 mx-auto text-black/60"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div
              ref={scrollerRef}
              className="flex gap-3 overflow-x-auto scroll-smooth pb-2 px-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {items.map((c) => (
                <a
                  key={c.id}
                  href="#discover"
                  className="group shrink-0 rounded-[3px] border border-black/10 bg-white shadow-sm hover:shadow-md hover:border-black/15 transition-all px-4 py-4 text-center w-45"
                  aria-label={`Browse ${c.name}`}
                  title={c.name}
                >
                  <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-[999px] bg-white border border-black/10 shadow-sm">
                    {getCategoryIcon(c.name, c.slug)}
                  </div>
                  <div className="mt-3 text-[13px] font-semibold text-[#6e4f33] group-hover:text-[#2c2c2c] line-clamp-2">
                    {c.name}
                  </div>
                </a>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-[999px] border border-black/10 bg-white shadow-sm hover:shadow-md transition-shadow"
              aria-label="Scroll categories right"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-4 w-4 mx-auto text-black/60"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        )}

        <div className="mt-3 text-[12px] text-black/45">
          Tip: set a category first, then refine by location.
        </div>
      </div>
    </section>
  );
}
