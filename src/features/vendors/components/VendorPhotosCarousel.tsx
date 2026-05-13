"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

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

function proxiedImageUrl(url: string) {
  const u = (url ?? "").trim();
  if (!u) return u;
  if (u.includes("drive.google.com")) {
    return `/api/image-proxy?url=${encodeURIComponent(u)}`;
  }
  return u;
}

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
    () => images.filter((i) => Boolean(i?.image_url)).map((i) => ({ 
      ...i, 
      image_url: i.media_type === 'video' ? i.image_url : proxiedImageUrl(i.image_url),
      media_type: i.media_type || 'image'
    })),
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
    <section>
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
              className="block h-full w-full"
              onClick={() => openLightbox(activeIndex)}
              aria-label="Open full photo view"
            >
              <img
                src={active.image_url}
                alt={active.caption ?? "Vendor photo"}
                className="h-full w-full object-contain"
                loading={activeIndex === 0 ? "eager" : "lazy"}
                referrerPolicy="no-referrer"
              />
            </button>
          )}
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
                    userInitiatedRef.current = true;
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
                    src={img.media_type === 'video' ? getVideoThumbnailUrl(img.image_url) || img.image_url : img.image_url}
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
                    {normalized[lightboxIndex]?.media_type === 'video' ? (
                      <div className="w-full max-w-4xl aspect-video">
                        {getVideoEmbedUrl(normalized[lightboxIndex]?.image_url!) ? (
                          <iframe
                            src={getVideoEmbedUrl(normalized[lightboxIndex]?.image_url!)!}
                            className="h-full w-full border-0 rounded-[3px]"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            title={normalized[lightboxIndex]?.caption ?? "Vendor video"}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-black/10 rounded-[3px]">
                            <div className="text-center">
                              <div className="text-[48px] mb-2">🎥</div>
                              <div className="text-[16px] text-black/60">Unsupported video format</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <img
                        src={normalized[lightboxIndex]?.media_type === 'video' ? getVideoThumbnailUrl(normalized[lightboxIndex]?.image_url!) || normalized[lightboxIndex]?.image_url : normalized[lightboxIndex]?.image_url}
                        alt={normalized[lightboxIndex]?.caption ?? "Vendor photo"}
                        className="max-h-[85vh] w-auto max-w-full object-contain"
                        loading="eager"
                        referrerPolicy="no-referrer"
                      />
                    )}
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
