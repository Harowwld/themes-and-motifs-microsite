"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // For above-fold images
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
}

function generateBlurHash(width: number, height: number): string {
  // Generate a simple SVG placeholder with matching aspect ratio
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function proxiedImageUrl(url: string): string {
  const u = (url ?? "").trim();
  if (!u) return u;
  if (u.includes("drive.google.com")) {
    return `/api/image-cache?url=${encodeURIComponent(u)}`;
  }
  return u;
}

export default function OptimizedImage({
  src,
  alt,
  className = "",
  width = 400,
  height = 300,
  priority = false,
  blurDataURL,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const optimizedSrc = proxiedImageUrl(src);
  const blurSrc = blurDataURL || generateBlurHash(width, height);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: "50px", // Start loading 50px before entering viewport
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Preload priority images
  useEffect(() => {
    if (priority && optimizedSrc) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = optimizedSrc;
      document.head.appendChild(link);
      
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, optimizedSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={Object.assign({ width, height }, style)}>
      {/* Blur placeholder */}
      <img
        src={blurSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
        style={{
          opacity: isLoaded ? 0 : 1,
        }}
        aria-hidden="true"
      />
      
      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}
