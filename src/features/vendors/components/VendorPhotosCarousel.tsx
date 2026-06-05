/* eslint-disable react-doctor/iframe-missing-sandbox */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { proxiedImageUrl } from "@/lib/imageSizes";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

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
  vendorId?: number;
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

export default function VendorPhotosCarousel({ images, intervalMs = 4500, vendorId }: Props) {
  const normalized = useMemo<VendorImage[]>(
    () => images.filter((i) => Boolean(i?.image_url)).map((i) => {
      const isActuallyVideo = i.media_type === 'video' || isVideoUrl(i.image_url);
      return {
        ...i,
        image_url: isActuallyVideo ? i.image_url : (proxiedImageUrl(i.image_url) ?? i.image_url),
        media_type: (isActuallyVideo ? 'video' : 'image') as 'video' | 'image'
      };
    }),
    [images]
  );

  const [albums, setAlbums] = useState<{ id: number; title: string; slug: string; photos: VendorImage[] }[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | number>("all");

  useEffect(() => {
    if (!vendorId) return;
    const supabase = createSupabaseBrowserClient();
    async function loadAlbums() {
      try {
        const { data: albumsData } = await supabase
          .from("vendor_albums")
          .select("id, title, slug")
          .eq("vendor_id", vendorId)
          .order("created_at", { ascending: true });

        const { data: photosData } = await supabase
          .from("vendor_album_photos")
          .select("id, album_id, image_url, display_order")
          .eq("vendor_id", vendorId)
          .order("display_order", { ascending: true });

        if (albumsData && photosData) {
          const mapped = albumsData
            .map((album) => {
              const albumPhotos: VendorImage[] = photosData
                .filter((p) => p.album_id === album.id)
                .map((p) => ({
                  id: p.id,
                  image_url: proxiedImageUrl(p.image_url) ?? p.image_url,
                  caption: null,
                  media_type: "image" as const,
                }));
              return {
                ...album,
                photos: albumPhotos,
              };
            })
            .filter((album) => album.photos.length > 0);

          setAlbums(mapped);
        }
      } catch (err) {
        console.error("Error loading vendor albums:", err);
      }
    }
    loadAlbums();
  }, [vendorId]);

  const displayedImages = useMemo<VendorImage[]>(() => {
    if (selectedAlbumId === "all") {
      return normalized;
    }
    const album = albums.find((a) => a.id === selectedAlbumId);
    return album ? album.photos : [];
  }, [selectedAlbumId, normalized, albums]);

  const initialIndex = useMemo(() => {
    const coverIdx = displayedImages.findIndex((i: VendorImage) => i.is_cover);
    return coverIdx >= 0 ? coverIdx : 0;
  }, [displayedImages]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [userInteractedWithVideo, setUserInteractedWithVideo] = useState(false);

  const changeActiveIndex = useCallback((idx: number) => {
    setActiveIndex(idx);
    setUserInteractedWithVideo(false);
    setIsVideoPlaying(false);
  }, []);

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

  const hasVideos = useMemo(() => displayedImages.some((i: VendorImage) => i.media_type === 'video'), [displayedImages]);
  const currentIsVideo = displayedImages[activeIndex]?.media_type === 'video';

  const startAutoplay = useCallback(() => {
    if (typeof window === "undefined") return;
    if (displayedImages.length <= 1) return;
    if (intervalRef.current != null) return;
    // Don't auto-advance if user is interacting with video or video is playing
    if (userInteractedWithVideo || isVideoPlaying) return;
    intervalRef.current = window.setInterval(() => {
      setActiveIndex((i: number) => (i + 1) % displayedImages.length);
    }, intervalMs);
  }, [intervalMs, displayedImages.length, userInteractedWithVideo, isVideoPlaying]);

  const restartAutoplay = useCallback(() => {
    stopAutoplay();
    startAutoplay();
  }, [startAutoplay, stopAutoplay]);



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
    const el = thumbRefs.current[displayedImages[activeIndex]?.id ?? activeIndex];
    if (!container || !el) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    if (elRect.left < containerRect.left || elRect.right > containerRect.right) {
      const left = el.offsetLeft - (container.clientWidth - el.clientWidth) / 2;
      container.scrollTo({ left, behavior: "smooth" });
    }
  }, [activeIndex, displayedImages]);

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
    setLightboxIndex((i) => (i - 1 + displayedImages.length) % displayedImages.length);
  }, [displayedImages.length]);

  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % displayedImages.length);
  }, [displayedImages.length]);

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

  const active = displayedImages[activeIndex] ?? displayedImages[0];
  if (!active) return null;

  return (
    <section className="flex flex-col w-full max-w-full min-w-0 overflow-hidden">
      <h2 className="text-[16px] font-semibold text-[#2c2c2c]">Photos & Videos</h2>

      {/* Album Tabs (if any are created and have photos) */}
      {albums.length > 0 && (
        <div className="relative select-none mt-3">
          <div className="flex gap-2 overflow-x-auto flex-nowrap scrollbar-none scroll-smooth pb-2 touch-manipulation">
            <button
              type="button"
              onClick={() => {
                setSelectedAlbumId("all");
                const coverIdx = normalized.findIndex((i) => i.is_cover);
                changeActiveIndex(coverIdx >= 0 ? coverIdx : 0);
              }}
              className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-bold transition-all duration-300 cursor-pointer ${
                selectedAlbumId === "all"
                  ? "bg-[#a67c52] text-white shadow-sm"
                  : "bg-white border border-black/5 text-black/55 hover:border-black/15 hover:text-black"
              }`}
            >
              All Portfolio
            </button>
            {albums.map((album) => (
              <button
                key={album.id}
                type="button"
                onClick={() => {
                  setSelectedAlbumId(album.id);
                  const coverIdx = album.photos.findIndex((i) => i.is_cover);
                  changeActiveIndex(coverIdx >= 0 ? coverIdx : 0);
                }}
                className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                  selectedAlbumId === album.id
                    ? "bg-[#a67c52] text-white shadow-sm"
                    : "bg-white border border-black/5 text-black/55 hover:border-black/15 hover:text-black"
                }`}
              >
                {album.title}
                <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.25 ${
                  selectedAlbumId === album.id
                    ? "bg-white/20 text-white"
                    : "bg-black/5 text-black/40"
                }`}>
                  {album.photos.length}
                </span>
              </button>
            ))}
          </div>
          {/* Subtle horizontal fade overlays */}
          <div className="pointer-events-none absolute top-0 bottom-2 left-0 w-6 bg-gradient-to-r from-[#fcfbf9] via-[#fcfbf9]/80 to-transparent z-10" />
          <div className="pointer-events-none absolute top-0 bottom-2 right-0 w-6 bg-gradient-to-l from-[#fcfbf9] via-[#fcfbf9]/80 to-transparent z-10" />
        </div>
      )}

      <div ref={mainMediaRef} className="mt-3 rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
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
                  sandbox="allow-scripts allow-same-origin allow-presentation"
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

      {displayedImages.length > 1 && (
        <div className="mt-3 w-full min-w-0">
          <div
            ref={stripRef}
            className="flex gap-2 overflow-x-auto pb-3 sleek-scrollbar snap-x snap-mandatory scroll-smooth"
          >
            {displayedImages.map((img: VendorImage, idx: number) => {
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
                    changeActiveIndex(idx);
                    restartAutoplay();
                  }}
                  className={
                    "relative shrink-0 rounded-xl border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a67c52]/60 snap-start active:scale-[0.95] transition-[transform,border-color,box-shadow] duration-200 ease-out " +
                    (isActive ? "border-[#a67c52]" : "border-black/10 hover:border-black/20")
                  }
                  aria-label={img.caption ?? `Vendor photo ${idx + 1}`}
                >
                  <div className="relative h-16 w-24 sm:h-20 sm:w-32 shrink-0 overflow-hidden rounded-[10px] bg-black/5">
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
                  {isActive ? <div className="pointer-events-none absolute inset-0 ring-2 ring-[#a67c52]/55 rounded-[10px]" /> : null}
                </button>
              );
            })}
          </div>
          <div className="mt-1 text-[12px] text-black/45">{activeIndex + 1} / {displayedImages.length}</div>
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
                className="absolute top-6 right-6 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-[0.92] transition-[transform,background-color] duration-200 ease-out focus:outline-none"
                aria-label="Close lightbox"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="relative flex h-full w-full max-w-[95vw] items-center justify-center overflow-hidden px-4 sm:px-12">
                {/* Navigation - Left */}
                {displayedImages.length > 1 && (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-4 sm:left-8 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white/80 hover:bg-white/15 hover:text-white active:scale-[0.92] transition-[transform,background-color,color] duration-200 ease-out backdrop-blur-sm focus:outline-none"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                )}

                {/* Main Media Content */}
                <div className="flex h-full w-full max-w-6xl flex-col items-center justify-center py-20">
                  <div className="relative h-full w-full">
                    {displayedImages[lightboxIndex]?.media_type === 'video' ? (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="w-full max-w-4xl aspect-video shadow-2xl">
                          {getVideoEmbedUrl(displayedImages[lightboxIndex]?.image_url!) ? (
                            <iframe
                              src={getVideoEmbedUrl(displayedImages[lightboxIndex]?.image_url!)!}
                              className="h-full w-full border-0 rounded-2xl"
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              title={displayedImages[lightboxIndex]?.caption ?? "Vendor video"}
                              sandbox="allow-scripts allow-same-origin allow-presentation"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-white/5 rounded-2xl">
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
                          src={displayedImages[lightboxIndex]?.image_url}
                          alt={displayedImages[lightboxIndex]?.caption ?? "Vendor photo"}
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
                    {displayedImages[lightboxIndex]?.caption && (
                      <p className="max-w-2xl px-6 text-center text-[15px] font-medium text-white/90">
                        {displayedImages[lightboxIndex].caption}
                      </p>
                    )}
                    <span className="rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-semibold text-white/80 backdrop-blur-md">
                      {lightboxIndex + 1} / {displayedImages.length}
                    </span>
                  </div>
                </div>

                {/* Navigation - Right */}
                {displayedImages.length > 1 && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-4 sm:right-8 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white/80 hover:bg-white/15 hover:text-white active:scale-[0.92] transition-[transform,background-color,color] duration-200 ease-out backdrop-blur-sm focus:outline-none"
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
