"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

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

function proxiedImageUrl(url: string) {
  const u = (url ?? "").trim();
  if (!u) return u;
  if (u.includes("drive.google.com")) {
    return `/api/image-proxy?url=${encodeURIComponent(u)}`;
  }
  return u;
}

export default function VendorPhotosCarousel({ images, intervalMs = 4500 }: Props) {
  const normalized = useMemo(
    () => images.filter((i) => Boolean(i?.image_url)).map((i) => ({ ...i, image_url: proxiedImageUrl(i.image_url) })),
    [images]
  );
  const initialIndex = useMemo(() => {
    const coverIdx = normalized.findIndex((i) => i.is_cover);
    return coverIdx >= 0 ? coverIdx : 0;
  }, [normalized]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [ratiosById, setRatiosById] = useState<Record<number, number>>({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const intervalRef = useRef<number | null>(null);
  const mainMediaRef = useRef<HTMLDivElement | null>(null);

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
    const el = mainMediaRef.current;
    if (!el) return;
    window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  }, [activeIndex]);

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

  const activeRatio = ratiosById[active.id] ?? 16 / 9;

  const openLightbox = useCallback(
    (idx: number) => {
      setLightboxIndex(idx);
      setIsLightboxOpen(true);
      stopAutoplay();
    },
    [stopAutoplay]
  );

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i - 1 + normalized.length) % normalized.length);
  }, [normalized.length]);

  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % normalized.length);
  }, [normalized.length]);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    restartAutoplay();
  }, [restartAutoplay]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [closeLightbox, goNext, goPrev, isLightboxOpen]);

  return (
    <section className="mt-8">
      <h2 className="text-[16px] font-semibold text-[#2c2c2c]">Photos</h2>

      <div ref={mainMediaRef} className="mt-3 rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="w-full bg-[#fcfbf9]" style={{ aspectRatio: String(activeRatio) }}>
          <button
            type="button"
            className="block h-full w-full"
            onClick={() => openLightbox(activeIndex)}
            aria-label="Open full photo view"
          >
            <img
              src={active.image_url}
              alt={active.caption ?? "Vendor photo"}
              className="h-full w-full object-contain"
              loading="lazy"
              referrerPolicy="no-referrer"
              onLoad={(e) => {
                const el = e.currentTarget;
                const w = el.naturalWidth;
                const h = el.naturalHeight;
                if (!w || !h) return;
                const ratio = w / h;
                setRatiosById((prev) => (prev[active.id] === ratio ? prev : { ...prev, [active.id]: ratio }));
              }}
            />
          </button>
        </div>
        {active.caption ? <div className="px-4 py-3 text-[12px] text-black/55">{active.caption}</div> : null}
      </div>

      {normalized.length > 1 ? (
        <div className="mt-3">
          <div
            ref={stripRef}
            className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
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
                  <img
                    src={img.image_url}
                    alt={img.caption ?? `Vendor photo ${idx + 1}`}
                    className="h-16 w-24 sm:h-20 sm:w-32 object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  {isActive ? <div className="pointer-events-none absolute inset-0 ring-2 ring-[#a67c52]/55" /> : null}
                </button>
              );
            })}
          </div>
          <div className="mt-1 text-[12px] text-black/45">{activeIndex + 1} / {normalized.length}</div>
        </div>
      ) : null}

      {isLightboxOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-9999"
              role="dialog"
              aria-modal="true"
              aria-label="Full photo view"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) closeLightbox();
              }}
            >
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative w-full max-w-6xl flex items-center justify-center">
                  <button
                    type="button"
                    onClick={closeLightbox}
                    aria-label="Close"
                    className="absolute right-0 top-0 inline-flex h-9 w-9 items-center justify-center rounded-[3px] bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    <span className="text-[22px] leading-none">×</span>
                  </button>

                  {normalized.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={goPrev}
                        aria-label="Previous photo"
                        className="absolute left-0 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-[3px] bg-white/10 text-white hover:bg-white/20 transition-colors"
                      >
                        <span className="text-[26px] leading-none">‹</span>
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        aria-label="Next photo"
                        className="absolute right-0 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-[3px] bg-white/10 text-white hover:bg-white/20 transition-colors"
                      >
                        <span className="text-[26px] leading-none">›</span>
                      </button>
                    </>
                  ) : null}

                  <div className="w-full flex flex-col items-center justify-center">
                    <img
                      src={normalized[lightboxIndex]?.image_url}
                      alt={normalized[lightboxIndex]?.caption ?? "Vendor photo"}
                      className="max-h-[85vh] w-auto max-w-full object-contain"
                      loading="eager"
                      referrerPolicy="no-referrer"
                    />
                    <div className="mt-3 text-center text-[12px] text-white/70">
                      {lightboxIndex + 1} / {normalized.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
