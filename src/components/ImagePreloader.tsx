"use client";

import { useEffect } from "react";
import { useImagePreloader } from "@/hooks/useImagePreloader";

interface ImagePreloaderProps {
  images: string[];
  priority?: boolean;
  children?: React.ReactNode;
}

/**
 * Component that preloads images when mounted
 * Use for critical above-fold images
 * Updated to use latest preloading strategy with fetchPriority
 */
export default function ImagePreloader({ images, priority = false }: ImagePreloaderProps) {
  const { preloadImages, preloadOnIdle } = useImagePreloader();

  useEffect(() => {
    if (priority) {
      // Preload immediately for priority images with high fetchPriority
      preloadImages(images, { priority: "high", fetchPriority: "high" });
    } else {
      // Preload during idle time for non-critical images with low fetchPriority
      preloadOnIdle(images);
    }
  }, [images, priority, preloadImages, preloadOnIdle]);

  return null; // This component doesn't render anything
}

/**
 * Hook to preload images for vendor pages
 * Updated to use latest preloading strategy
 */
export function useVendorImagePreload(vendorSlug: string, imageUrl?: string) {
  const { preloadImage } = useImagePreloader();

  useEffect(() => {
    if (imageUrl) {
      // Preload the main vendor image with high priority
      preloadImage(imageUrl, { priority: "high", fetchPriority: "high" });
    }
  }, [imageUrl, preloadImage]);

  const preloadVendorImages = (imageUrls: string[]) => {
    // Preload first 3 images immediately, rest on idle
    const priority = imageUrls.slice(0, 3);
    const remaining = imageUrls.slice(3);

    priority.forEach(url => preloadImage(url, { priority: "high", fetchPriority: "high" }));
    
    // Preload remaining images during idle time with low priority
    setTimeout(() => {
      remaining.forEach(url => preloadImage(url, { priority: "low", fetchPriority: "low" }));
    }, 1000);
  };

  return { preloadVendorImages };
}
