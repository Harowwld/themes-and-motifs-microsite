"use client";

import { useEffect, useRef } from "react";

interface PreloadImageOptions {
  priority?: "high" | "low" | "auto";
  fetchPriority?: "high" | "low" | "auto";
}

/**
 * Preload images for instant loading using latest best practices
 * - Uses link rel="preload" for critical images
 * - Supports fetchPriority for browser scheduling
 * - Uses requestIdleCallback for non-critical images
 */
export function useImagePreloader() {
  const preloadedImages = useRef(new Set<string>());

  const preloadImage = (src: string, options: PreloadImageOptions = {}) => {
    if (!src || preloadedImages.current.has(src)) return;

    preloadedImages.current.add(src);

    const fetchPriority = options.fetchPriority || options.priority || "auto";

    // Method 1: Link preload for critical images (modern approach)
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    link.fetchPriority = fetchPriority;
    document.head.appendChild(link);

    // Method 2: Image object preloading for immediate decoding
    const img = new Image();
    img.src = src;
    img.decoding = "async";
    img.fetchPriority = fetchPriority;
    
    return new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
  };

  const preloadImages = (urls: string[], options: PreloadImageOptions = {}) => {
    urls.forEach(url => preloadImage(url, options));
  };

  const preloadCriticalImages = (urls: string[]) => {
    // Preload critical images with high priority
    preloadImages(urls, { priority: "high", fetchPriority: "high" });
  };

  const preloadOnIdle = (urls: string[]) => {
    if (typeof window === "undefined") return;

    const scheduleWork =
      "requestIdleCallback" in window
        ? window.requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 1);

    scheduleWork(() => {
      urls.forEach(url => preloadImage(url, { priority: "low", fetchPriority: "low" }));
    });
  };

  // Preload images on hover with delay to avoid unnecessary requests
  const preloadOnHover = (urls: string[], delayMs = 200) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return {
      onMouseEnter: () => {
        timeoutId = setTimeout(() => {
          preloadImages(urls, { priority: "auto", fetchPriority: "high" });
        }, delayMs);
      },
      onMouseLeave: () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      },
    };
  };

  return {
    preloadImage,
    preloadImages,
    preloadCriticalImages,
    preloadOnIdle,
    preloadOnHover,
  };
}

/**
 * Preload images when user hovers over links
 */
export function preloadOnHover(preloadFn: () => void, delayMs = 200) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return {
    onMouseEnter: () => {
      timeoutId = setTimeout(() => {
        preloadFn();
      }, delayMs);
    },
    onMouseLeave: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
  };
}
