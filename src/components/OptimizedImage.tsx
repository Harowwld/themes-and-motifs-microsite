"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DEFAULT_SIZES, proxiedImageUrl } from "@/lib/imageSizes";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
}

// CSS-based animated blur placeholder
const BlurPlaceholder = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse",
      className
    )}
    style={{
      backgroundSize: "200% 200%",
      animation: "shimmer 2s ease-in-out infinite",
    }}
  />
);


export default function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false,
  fill = false,
  sizes = DEFAULT_SIZES,
  quality = 75,
  placeholder = "empty",
  blurDataURL,
  onLoad,
  onError,
  style,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const optimizedSrc = proxiedImageUrl(src) ?? src;

  // Generate blur data URL if not provided and placeholder is blur
  const generateBlurDataURL = (w: number, h: number): string => {
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
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
  };

  const finalBlurDataURL = blurDataURL || (placeholder === "blur" && width && height 
    ? generateBlurDataURL(width, height) 
    : undefined);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Error state
  if (hasError) {
    return (
      <div 
        className={cn("flex items-center justify-center bg-gray-100", className)}
        style={style}
      >
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  // Image with skeleton loading
  return (
    <div 
      ref={imgRef}
      className={cn("relative overflow-hidden", className)}
      style={style}
    >
      {/* Skeleton/blur placeholder */}
      {!isLoaded && <BlurPlaceholder />}
      
      {/* Next.js Image with optimization */}
      <Image
        src={optimizedSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        quality={quality}
        priority={priority}
        placeholder={finalBlurDataURL ? "blur" : "empty"}
        blurDataURL={finalBlurDataURL}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={handleLoad}
        onError={handleError}
        // Performance optimizations
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </div>
  );
}

// Add shimmer animation to global styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes shimmer {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;
  document.head.appendChild(style);
}
