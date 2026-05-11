"use client";

import { useEffect, useRef } from "react";

interface PreloadImageOptions {
  priority?: "high" | "low" | "auto";
}

/**
 * Preload images for instant loading
 */
export function useImagePreloader() {
  const preloadedImages = useRef(new Set<string>());

  const preloadImage = (src: string, options: PreloadImageOptions = {}) => {
    if (!src || preloadedImages.current.has(src)) return;

    preloadedImages.current.add(src);

    // Method 1: Link preload for critical images
    if (options.priority === "high") {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      link.fetchPriority = "high";
      document.head.appendChild(link);
    }

    // Method 2: Image object preloading for all images
    const img = new Image();
    img.src = src;
    
    return new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
  };

  const preloadImages = (urls: string[], options: PreloadImageOptions = {}) => {
    urls.forEach(url => preloadImage(url, options));
  };

  const preloadCriticalImages = () => {
    // Preload hero section and first viewport images
    const criticalImages: string[] = [
      // Add hero image URLs here
    ];
    
    preloadImages(criticalImages, { priority: "high" });
  };

  const preloadOnIdle = (urls: string[]) => {
    if (typeof window === "undefined") return;

    const scheduleWork =
      "requestIdleCallback" in window
        ? window.requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 1);

    scheduleWork(() => {
      urls.forEach(url => preloadImage(url, { priority: "low" }));
    });
  };

  return {
    preloadImage,
    preloadImages,
    preloadCriticalImages,
    preloadOnIdle,
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
