"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Aperture,
  BadgeCheck,
  Building2,
  Cake,
  Camera,
  Car,
  Church,
  ClipboardList,
  Crown,
  Diamond,
  Drum,
  Gift,
  Glasses,
  Handshake,
  Headphones,
  Hotel,
  IdCard,
  Image,
  MapPin,
  Mail,
  Martini,
  Mic,
  Music,
  Palette,
  PartyPopper,
  Printer,
  Scissors,
  Shirt,
  Sparkles,
  Ticket,
  Truck,
  UtensilsCrossed,
  Video,
} from "lucide-react";

type Category = {
  id: number;
  name: string;
  slug: string;
};

function getCategoryIcon(categoryName: string, categorySlug: string, active: boolean) {
  const v = `${categoryName} ${categorySlug}`.toLowerCase();
  const iconClassName = active
    ? "h-6 w-6 text-[#2c2c2c] transition-colors"
    : "h-6 w-6 text-[#6e4f33] group-hover:text-[#2c2c2c] transition-colors";
  const iconProps = { className: iconClassName, "aria-hidden": true as const, strokeWidth: 1.75 };

  if (v.includes("photo") || v.includes("photograph")) return <Camera {...iconProps} />;
  if (v.includes("video") || v.includes("cinema") || v.includes("film") || v.includes("videograph")) return <Video {...iconProps} />;
  if (v.includes("studio") || v.includes("shoot") || v.includes("shooting")) return <Aperture {...iconProps} />;

  if (v.includes("flor") || v.includes("flowers") || v.includes("bouquet")) return <Sparkles {...iconProps} />;
  if (v.includes("decor") || v.includes("styling") || v.includes("design")) return <Palette {...iconProps} />;

  if (v.includes("makeup") || v.includes("mua") || v.includes("beauty")) return <Sparkles {...iconProps} />;
  if (v.includes("hair") || v.includes("stylist") || v.includes("salon")) return <Scissors {...iconProps} />;

  if (v.includes("dress") || v.includes("gown") || v.includes("apparel") || v.includes("suit") || v.includes("wear")) return <Shirt {...iconProps} />;
  if (v.includes("accessor") || v.includes("veil") || v.includes("shoes")) return <Crown {...iconProps} />;

  if (v.includes("cake") || v.includes("dessert") || v.includes("pastry")) return <Cake {...iconProps} />;
  if (v.includes("catering") || v.includes("food")) return <UtensilsCrossed {...iconProps} />;
  if (v.includes("bar") || v.includes("cocktail") || v.includes("drink")) return <Martini {...iconProps} />;

  if (v.includes("invitation") || v.includes("invite")) return <Mail {...iconProps} />;
  if (v.includes("print") || v.includes("stationery") || v.includes("souvenir")) return <Printer {...iconProps} />;

  if (v.includes("rings") || v.includes("jewel") || v.includes("diamond")) return <Diamond {...iconProps} />;
  if (v.includes("gift") || v.includes("giveaway")) return <Gift {...iconProps} />;

  if (v.includes("music") || v.includes("band")) return <Music {...iconProps} />;
  if (v.includes("dj") || v.includes("host") || v.includes("emcee") || v.includes("mc")) return <Mic {...iconProps} />;
  if (v.includes("sound") || v.includes("lights") || v.includes("audio")) return <Headphones {...iconProps} />;
  if (v.includes("drum") || v.includes("percussion")) return <Drum {...iconProps} />;

  if (v.includes("transport") || v.includes("car") || v.includes("van") || v.includes("limo")) return <Car {...iconProps} />;
  if (v.includes("deliver") || v.includes("logistic")) return <Truck {...iconProps} />;

  if (v.includes("planner") || v.includes("coord") || v.includes("organizer") || v.includes("coordination")) return <ClipboardList {...iconProps} />;
  if (v.includes("package") || v.includes("bundle") || v.includes("promo")) return <Ticket {...iconProps} />;
  if (v.includes("affiliation") || v.includes("partner") || v.includes("supplier")) return <Handshake {...iconProps} />;

  if (v.includes("venue") || v.includes("reception") || v.includes("hall")) return <Building2 {...iconProps} />;
  if (v.includes("church") || v.includes("chapel")) return <Church {...iconProps} />;
  if (v.includes("hotel") || v.includes("resort")) return <Hotel {...iconProps} />;
  if (v.includes("location") || v.includes("city") || v.includes("area") || v.includes("region")) return <MapPin {...iconProps} />;

  if (v.includes("photo") || v.includes("gallery") || v.includes("album")) return <Image {...iconProps} />;
  if (v.includes("id") || v.includes("registration")) return <IdCard {...iconProps} />;
  if (v.includes("vip") || v.includes("premium")) return <BadgeCheck {...iconProps} />;
  if (v.includes("glasses") || v.includes("eyewear")) return <Glasses {...iconProps} />;
  if (v.includes("party") || v.includes("event")) return <PartyPopper {...iconProps} />;
  if (v.includes("balloon")) return <PartyPopper {...iconProps} />;

  return <Building2 {...iconProps} />;
}

export default function CategoryBrowser({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const activeCategory = (searchParams?.get("category") ?? "").trim().toLowerCase();

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
              (() => {
                const isActive = activeCategory === (c.slug ?? "").trim().toLowerCase();
                return (
              <a
                key={c.id}
                href={`/vendors?category=${encodeURIComponent(c.slug)}`}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/vendors?category=${encodeURIComponent(c.slug)}`, { scroll: false });
                }}
                className={
                  isActive
                    ? "group rounded-[3px] border border-black/20 bg-[#fffaf2] shadow-sm hover:shadow-md transition-all px-4 py-4 text-center"
                    : "group rounded-[3px] border border-black/10 bg-white shadow-sm hover:shadow-md hover:border-black/15 transition-all px-4 py-4 text-center"
                }
                aria-label={`Browse ${c.name}`}
              >
                <div className="mx-auto inline-flex h-10 w-10 items-center justify-center">
                  {getCategoryIcon(c.name, c.slug, isActive)}
                </div>
                <div
                  className={
                    isActive
                      ? "mt-3 text-[13px] font-semibold text-[#2c2c2c]"
                      : "mt-3 text-[13px] font-semibold text-[#6e4f33] group-hover:text-[#2c2c2c]"
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
                (() => {
                  const isActive = activeCategory === (c.slug ?? "").trim().toLowerCase();
                  return (
                <a
                  key={c.id}
                  href={`/vendors?category=${encodeURIComponent(c.slug)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/vendors?category=${encodeURIComponent(c.slug)}`, { scroll: false });
                  }}
                  className={
                    isActive
                      ? "group shrink-0 rounded-[3px] border border-black/20 bg-[#fffaf2] shadow-sm hover:shadow-md transition-all px-4 py-4 text-center w-45"
                      : "group shrink-0 rounded-[3px] border border-black/10 bg-white shadow-sm hover:shadow-md hover:border-black/15 transition-all px-4 py-4 text-center w-45"
                  }
                  aria-label={`Browse ${c.name}`}
                  title={c.name}
                >
                  <div className="mx-auto inline-flex h-10 w-10 items-center justify-center">
                    {getCategoryIcon(c.name, c.slug, isActive)}
                  </div>
                  <div
                    className={
                      isActive
                        ? "mt-3 text-[13px] font-semibold text-[#2c2c2c] line-clamp-2"
                        : "mt-3 text-[13px] font-semibold text-[#6e4f33] group-hover:text-[#2c2c2c] line-clamp-2"
                    }
                  >
                    {c.name}
                  </div>
                </a>
                  );
                })()
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
