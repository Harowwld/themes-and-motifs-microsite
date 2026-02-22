"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (normalized.length <= 1) return;

    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % normalized.length);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [intervalMs, normalized.length]);

  useEffect(() => {
    const el = thumbRefs.current[normalized[activeIndex]?.id ?? -1];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
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
        <div className="mt-3" ref={stripRef}>
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
                  onClick={() => setActiveIndex(idx)}
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
