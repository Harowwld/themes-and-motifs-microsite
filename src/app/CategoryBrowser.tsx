"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Category = {
  id: number;
  name: string;
  slug: string;
};

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
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const activeCategory = (searchParams?.get("category") ?? "").trim().toLowerCase();

  const prefetchCategory = (slug: string) => {
    router.prefetch(`/vendors?category=${encodeURIComponent(slug)}`);
  };

  const items = useMemo(() => {
    const safe = categories ?? [];
    return expanded ? safe : safe;
  }, [categories, expanded]);

  return (
    <section className="mt-8 sm:mt-10 lg:mt-14">
      <div className="flex items-end justify-between gap-4 sm:gap-6">
        <div>
          <div className="text-[11px] sm:text-[12px] font-medium text-gray-400 uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)]">Browse</div>
          <h2 className="mt-1 text-[15px] sm:text-[16px] lg:text-[18px] font-medium tracking-[-0.01em] text-gray-900">
            Categories
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors touch-manipulation font-[family-name:var(--font-plus-jakarta)]"
        >
          {expanded ? "Collapse" : "See all"}
        </button>
      </div>

      <div className="mt-6">
        {items.length === 0 ? (
          <div className="text-[13px] text-gray-500">No categories loaded.</div>
        ) : expanded ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((c) => (
              (() => {
                const isActive = activeCategory === (c.slug ?? "").trim().toLowerCase();
                return (
              <a
                key={c.id}
                href={`/vendors?category=${encodeURIComponent(c.slug)}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (isActive) {
                    router.push("/vendors", { scroll: false });
                  } else {
                    router.push(`/vendors?category=${encodeURIComponent(c.slug)}`, { scroll: false });
                  }
                }}
                onMouseEnter={() => !isActive && prefetchCategory(c.slug)}
                className={
                  isActive
                    ? "group rounded-lg bg-[#a68b6a]/10 shadow-sm transition-all px-3 py-3 text-center min-h-24 touch-manipulation"
                    : "group rounded-lg bg-white shadow-sm hover:shadow-md transition-all px-3 py-3 text-center min-h-24 touch-manipulation"
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
              </a>
                );
              })()
            ))}
          </div>
        ) : (
          <div className="relative -mx-4 px-4 sm:-mx-0 sm:px-0">
            <div className="pointer-events-none absolute top-0 bottom-3 left-0 w-8 bg-linear-to-r from-[#fcfbf9] to-transparent z-10" />
            <div className="pointer-events-none absolute top-0 bottom-3 right-0 w-8 bg-linear-to-l from-[#fcfbf9] to-transparent z-10" />

            <div
              ref={scrollerRef}
              className="flex gap-3 overflow-x-auto scroll-smooth pb-3 sleek-scrollbar snap-x snap-mandatory"
            >
              {items.map((c) => (
                (() => {
                  const isActive = activeCategory === (c.slug ?? "").trim().toLowerCase();
                  return (
                <a
                  key={c.id}
                  href={`/vendors?category=${encodeURIComponent(c.slug)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (isActive) {
                      router.push("/vendors", { scroll: false });
                    } else {
                      router.push(`/vendors?category=${encodeURIComponent(c.slug)}`, { scroll: false });
                    }
                  }}
                  onMouseEnter={() => !isActive && prefetchCategory(c.slug)}
                  className={
                    isActive
                      ? "group shrink-0 rounded-lg bg-[#a68b6a]/10 shadow-sm transition-all px-3 py-3 text-center w-[calc(45vw-1rem)] max-w-[180px] min-h-24 snap-start touch-manipulation"
                      : "group shrink-0 rounded-lg bg-white shadow-sm hover:shadow-md transition-all px-3 py-3 text-center w-[calc(45vw-1rem)] max-w-[180px] min-h-24 snap-start touch-manipulation"
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
                </a>
                  );
                })()
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
