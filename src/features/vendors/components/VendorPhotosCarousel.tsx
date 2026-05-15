"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { proxiedImageUrl } from "@/lib/imageSizes";

// Type declarations for video APIs
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
    Vimeo?: any;
  }
}

type VendorImage = {
  id: number;
  image_url: string;
  caption: string | null;
  is_cover?: boolean | null;
  display_order?: number | null;
  media_type?: 'image' | 'video';
};

type Props = {
  images: VendorImage[];
  intervalMs?: number;
};


function getVideoEmbedUrl(url: string, enableApi: boolean = false): string | null {
  const u = url.trim();
  if (!u) return null;

  // YouTube URLs
  const youtubeMatch = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    const baseUrl = `https://www.youtube.com/embed/${videoId}`;
    if (enableApi) {
      return `${baseUrl}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&rel=0&modestbranding=1`;
    }
    return `${baseUrl}?rel=0&modestbranding=1`;
  }

  // Vimeo URLs
  const vimeoMatch = u.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    const baseUrl = `https://player.vimeo.com/video/${videoId}`;
    if (enableApi) {
      return `${baseUrl}?api=1&origin=${encodeURIComponent(window.location.origin)}`;
    }
    return baseUrl;
  }

  // Direct video URLs (mp4, webm, etc.)
  if (u.match(/\.(mp4|webm|ogg|mov)$/i)) {
    return u;
  }

  return null;
}

function getVideoThumbnailUrl(url: string): string | null {
  const u = url.trim();
  if (!u) return null;

  // YouTube thumbnails
  const youtubeMatch = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) {
    return `https://img.youtube.com/vi/${youtubeMatch[1]}/mqdefault.jpg`;
  }

  // Vimeo thumbnails
  const vimeoMatch = u.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://vumbnail.com/vimeo/video_${vimeoMatch[1]}.jpg`;
  }

  return null;
};

function isVideoUrl(url: string): boolean {
  return getVideoEmbedUrl(url) !== null;
}

export default function VendorPhotosCarousel({ images, intervalMs = 4500 }: Props) {
  const normalized = useMemo(
    () => images.filter((i) => Boolean(i?.image_url)).map((i) => {
      const isActuallyVideo = i.media_type === 'video' || isVideoUrl(i.image_url);
      return {
        ...i,
        image_url: isActuallyVideo ? i.image_url : (proxiedImageUrl(i.image_url) ?? i.image_url),
        media_type: isActuallyVideo ? 'video' : 'image' as const
      };
    }),
    [images]
  );
  const initialIndex = useMemo(() => {
    const coverIdx = normalized.findIndex((i) => i.is_cover);
    return coverIdx >= 0 ? coverIdx : 0;
  }, [normalized]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [userInteractedWithVideo, setUserInteractedWithVideo] = useState(false);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const intervalRef = useRef<number | null>(null);
  const mainMediaRef = useRef<HTMLDivElement | null>(null);
  const userInitiatedRef = useRef(false);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current == null) return;
    window.clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const hasVideos = useMemo(() => normalized.some((i) => i.media_type === 'video'), [normalized]);
  const currentIsVideo = normalized[activeIndex]?.media_type === 'video';

  const startAutoplay = useCallback(() => {
    if (typeof window === "undefined") return;
    if (normalized.length <= 1) return;
    if (intervalRef.current != null) return;
    // Don't auto-advance if user is interacting with video or video is playing
    if (userInteractedWithVideo || isVideoPlaying) return;
    intervalRef.current = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % normalized.length);
    }, intervalMs);
  }, [intervalMs, normalized.length, userInteractedWithVideo, isVideoPlaying]);

  const restartAutoplay = useCallback(() => {
    stopAutoplay();
    startAutoplay();
  }, [startAutoplay, stopAutoplay]);

  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

  // Simple video interaction detection
  useEffect(() => {
    // Reset interaction state when switching away from video
    if (!currentIsVideo) {
      setUserInteractedWithVideo(false);
      setIsVideoPlaying(false);
    }
  }, [currentIsVideo]);

  // Restart autoplay when interaction/playing state changes
  useEffect(() => {
    restartAutoplay();
  }, [userInteractedWithVideo, isVideoPlaying, currentIsVideo]);

  useEffect(() => {
    stopAutoplay();
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  useEffect(() => {
    if (!userInitiatedRef.current) return;
    const el = mainMediaRef.current;
    if (!el) return;
    window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
    userInitiatedRef.current = false;
  }, [activeIndex]);

  useEffect(() => {
    if (!userInitiatedRef.current) return;
    const container = stripRef.current;
    const el = thumbRefs.current[normalized[activeIndex]?.id ?? activeIndex];
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


  const activeRatio = 4 / 6;

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
    <section className="flex flex-col w-full max-w-full min-w-0 overflow-hidden">
      <h2 className="text-[16px] font-semibold text-[#2c2c2c]">Photos & Videos</h2>

      <div ref={mainMediaRef} className="mt-3 rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="w-full bg-[#fcfbf9]" style={{ aspectRatio: String(activeRatio) }}>
          {active.media_type === 'video' ? (
            <div
              ref={videoContainerRef}
              className="relative h-full w-full"
              onClick={() => setUserInteractedWithVideo(true)}
              onMouseEnter={() => setUserInteractedWithVideo(true)}
              onFocus={() => setUserInteractedWithVideo(true)}
            >
              {getVideoEmbedUrl(active.image_url) ? (
                <iframe
                  key={`video-${active.id}`}
                  src={getVideoEmbedUrl(active.image_url)!}
                  className="h-full w-full border-0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title={active.caption ?? "Vendor video"}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-black/40">
                  <div className="text-center">
                    <div className="text-[24px] mb-2">🎥</div>
                    <div className="text-[12px]">Unsupported video format</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="block h-full w-full relative"
              onClick={() => openLightbox(activeIndex)}
              aria-label="Open full photo view"
            >
              <Image
                src={active.image_url}
                alt={active.caption ?? "Vendor photo"}
                fill
                sizes="(max-width: 640px) 100vw, 800px"
                className="object-contain"
                priority={activeIndex === 0}
              />
            </button>
          )}
        </div>
        {active.caption ? <div className="px-4 py-3 text-[12px] text-black/55">{active.caption}</div> : null}
      </div>

      {normalized.length > 1 && (
        <div className="mt-3 w-full min-w-0">
          <div
            ref={stripRef}
            className="flex gap-2 overflow-x-auto pb-3 sleek-scrollbar snap-x snap-mandatory scroll-smooth"
          >
            {normalized.map((img, idx) => {
              const isActive = idx === activeIndex;

              return (
                <button
                  key={img.id ?? idx}
                  type="button"
                  ref={(node) => {
                    thumbRefs.current[img.id ?? idx] = node;
                  }}
                  onClick={() => {
                    userInitiatedRef.current = true;
                    setActiveIndex(idx);
                    restartAutoplay();
                  }}
                  className={
                    "relative shrink-0 rounded-[3px] border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a67c52]/60 snap-start " +
                    (isActive ? "border-[#a67c52]" : "border-black/10 hover:border-black/20")
                  }
                  aria-label={img.caption ?? `Vendor photo ${idx + 1}`}
                >
                  <div className="relative h-16 w-24 sm:h-20 sm:w-32 shrink-0 overflow-hidden bg-black/5">
                    {img.media_type === 'video' ? (
                      (() => {
                        const thumb = getVideoThumbnailUrl(img.image_url);
                        return thumb ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={thumb}
                              alt={img.caption ?? `Vendor video ${idx + 1}`}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow">
                                <svg className="h-3.5 w-3.5 text-black/70 translate-x-[1px]" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/10">
                            <svg className="h-5 w-5 text-black/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                          </div>
                        );
                      })()
                    ) : (
                      <Image
                        src={img.image_url}
                        alt={img.caption ?? `Vendor photo ${idx + 1}`}
                        fill
                        sizes="(max-width: 640px) 96px, 128px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  {isActive ? <div className="pointer-events-none absolute inset-0 ring-2 ring-[#a67c52]/55" /> : null}
                </button>
              );
            })}
          </div>
          <div className="mt-1 text-[12px] text-black/45">{activeIndex + 1} / {normalized.length}</div>
        </div>
      )}

      {isLightboxOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-label="Full photo view"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) closeLightbox();
              }}
            >
              {/* Close Button - Top Right */}
              <button
                type="button"
                onClick={closeLightbox}
                className="absolute top-6 right-6 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 hover:scale-110 transition-all duration-200 focus:outline-none"
                aria-label="Close lightbox"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="relative flex h-full w-full max-w-[95vw] items-center justify-center overflow-hidden px-4 sm:px-12">
                {/* Navigation - Left */}
                {normalized.length > 1 && (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-4 sm:left-8 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white/80 hover:bg-white/15 hover:text-white hover:scale-105 transition-all duration-300 backdrop-blur-sm focus:outline-none"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                )}

                {/* Main Media Content */}
                <div className="flex h-full w-full max-w-6xl flex-col items-center justify-center py-20">
                  <div className="relative h-full w-full">
                    {normalized[lightboxIndex]?.media_type === 'video' ? (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="w-full max-w-4xl aspect-video shadow-2xl">
                          {getVideoEmbedUrl(normalized[lightboxIndex]?.image_url!) ? (
                            <iframe
                              src={getVideoEmbedUrl(normalized[lightboxIndex]?.image_url!)!}
                              className="h-full w-full border-0 rounded-[3px]"
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              title={normalized[lightboxIndex]?.caption ?? "Vendor video"}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-white/5 rounded-[3px]">
                              <div className="text-center text-white/60">
                                <div className="text-[48px] mb-2">🎥</div>
                                <div className="text-[16px]">Unsupported video format</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-full w-full flex items-center justify-center">
                        <Image
                          src={normalized[lightboxIndex]?.image_url}
                          alt={normalized[lightboxIndex]?.caption ?? "Vendor photo"}
                          fill
                          sizes="95vw"
                          className="object-contain drop-shadow-2xl"
                          priority
                        />
                      </div>
                    )}
                  </div>

                  {/* Caption & Counter */}
                  <div className="mt-6 flex flex-col items-center gap-2">
                    {normalized[lightboxIndex]?.caption && (
                      <p className="max-w-2xl px-6 text-center text-[15px] font-medium text-white/90">
                        {normalized[lightboxIndex].caption}
                      </p>
                    )}
                    <span className="rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-semibold text-white/80 backdrop-blur-md">
                      {lightboxIndex + 1} / {normalized.length}
                    </span>
                  </div>
                </div>

                {/* Navigation - Right */}
                {normalized.length > 1 && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-4 sm:right-8 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white/80 hover:bg-white/15 hover:text-white hover:scale-105 transition-all duration-300 backdrop-blur-sm focus:outline-none"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                )}
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
