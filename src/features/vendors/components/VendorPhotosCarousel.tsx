"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type VendorImage = {
  id: number;
  image_url: string;
  caption: string | null;
  is_cover?: boolean | null;
  display_order?: number | null;
};

type Props = {
  images: VendorImage[];
  intervalMs?: number;
};

export default function VendorPhotosCarousel({ images, intervalMs = 4500 }: Props) {
  const normalized = useMemo(() => images.filter((i) => Boolean(i?.image_url)), [images]);
  const initialIndex = useMemo(() => {
    const coverIdx = normalized.findIndex((i) => i.is_cover);
    return coverIdx >= 0 ? coverIdx : 0;
  }, [normalized]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const intervalRef = useRef<number | null>(null);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current == null) return;
    window.clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const startAutoplay = useCallback(() => {
    if (typeof window === "undefined") return;
    if (normalized.length <= 1) return;
    if (intervalRef.current != null) return;

    intervalRef.current = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % normalized.length);
    }, intervalMs);
  }, [intervalMs, normalized.length]);

  const restartAutoplay = useCallback(() => {
    stopAutoplay();
    startAutoplay();
  }, [startAutoplay, stopAutoplay]);

  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    stopAutoplay();
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  useEffect(() => {
    const container = stripRef.current;
    const el = thumbRefs.current[normalized[activeIndex]?.id ?? -1];
    if (!container || !el) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    if (elRect.left < containerRect.left || elRect.right > containerRect.right) {
      const left = el.offsetLeft - (container.clientWidth - el.clientWidth) / 2;
      container.scrollTo({ left, behavior: "smooth" });
    }
  }, [activeIndex, normalized]);

  const active = normalized[activeIndex];
  if (!active) return null;

  return (
    <section className="mt-8">
      <h2 className="text-[16px] font-semibold text-[#2c2c2c]">Photos</h2>

      <div className="mt-3 rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div
          className="h-64 sm:h-[340px]"
          style={{ background: `url(${active.image_url}) center/cover no-repeat` }}
          aria-label={active.caption ?? "Vendor photo"}
        />
        {active.caption ? <div className="px-4 py-3 text-[12px] text-black/55">{active.caption}</div> : null}
      </div>

      {normalized.length > 1 ? (
        <div className="mt-3">
          <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {normalized.map((img, idx) => {
              const isActive = idx === activeIndex;

              return (
                <button
                  key={img.id}
                  type="button"
                  ref={(node) => {
                    thumbRefs.current[img.id] = node;
                  }}
                  onClick={() => {
                    setActiveIndex(idx);
                    restartAutoplay();
                  }}
                  className={
                    "relative shrink-0 rounded-[3px] border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a67c52]/60 " +
                    (isActive ? "border-[#a67c52]" : "border-black/10 hover:border-black/20")
                  }
                  aria-label={img.caption ?? `Vendor photo ${idx + 1}`}
                >
                  <div
                    className="h-16 w-24 sm:h-20 sm:w-32"
                    style={{ background: `url(${img.image_url}) center/cover no-repeat` }}
                  />
                  {isActive ? <div className="pointer-events-none absolute inset-0 ring-2 ring-[#a67c52]/55" /> : null}
                </button>
              );
            })}
          </div>
          <div className="mt-1 text-[12px] text-black/45">{activeIndex + 1} / {normalized.length}</div>
        </div>
      ) : null}
    </section>
  );
}
