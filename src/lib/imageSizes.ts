/**
 * Responsive image sizes configuration
 * 
 * This file defines standard image sizes and responsive breakpoints
 * for consistent image optimization across the application.
 */

// Default responsive sizes for general use
export const DEFAULT_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

// Breakpoint definitions (in pixels)
export const BREAKPOINTS = {
  xs: 375,   // Extra small devices
  sm: 640,   // Small devices (landscape phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (desktops)
  xl: 1280,  // Extra large devices
  '2xl': 1536, // 2X large devices
};

// Standard image sizes for different use cases
export const IMAGE_SIZES = {
  // Thumbnail sizes
  thumbnail: {
    width: 64,
    height: 64,
    sizes: '(max-width: 640px) 64px, 64px',
  },
  small: {
    width: 128,
    height: 128,
    sizes: '(max-width: 640px) 128px, 128px',
  },
  
  // Avatar/profile sizes
  avatar: {
    width: 48,
    height: 48,
    sizes: '(max-width: 640px) 48px, 48px',
  },
  avatarLarge: {
    width: 96,
    height: 96,
    sizes: '(max-width: 640px) 96px, 96px',
  },
  
  // Card/cover sizes
  card: {
    width: 400,
    height: 300,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  },
  cardLarge: {
    width: 600,
    height: 450,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw',
  },
  
  // Hero/banner sizes
  hero: {
    width: 1920,
    height: 1080,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw',
  },
  banner: {
    width: 1200,
    height: 400,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw',
  },
  
  // Gallery sizes
  gallery: {
    width: 800,
    height: 600,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw',
  },
  galleryLarge: {
    width: 1200,
    height: 900,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 75vw',
  },
  
  // Vendor logo sizes
  logo: {
    width: 200,
    height: 200,
    sizes: '(max-width: 640px) 200px, 200px',
  },
  
  // Promo image sizes (3:4 aspect ratio)
  promo: {
    width: 600,
    height: 800,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  },
};

// Helper function to get sizes string based on column layout
export function getGridSizes(columns: number): string {
  const sizesMap: Record<number, string> = {
    1: '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw',
    2: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw',
    3: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    4: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
    5: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw',
    6: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw',
  };
  
  return sizesMap[columns] || sizesMap[3];
}

// Helper function to get responsive width based on container
export function getResponsiveWidth(containerWidth: number, maxWidth?: number): number {
  if (maxWidth && containerWidth > maxWidth) {
    return maxWidth;
  }
  return containerWidth;
}

// Quality settings for different image types
export const IMAGE_QUALITY = {
  thumbnail: 60,
  avatar: 75,
  card: 75,
  hero: 85,
  gallery: 80,
  logo: 90,
  promo: 80,
};

// Priority settings for different image types
export const IMAGE_PRIORITY = {
  hero: true,
  avatar: false,
  card: false,
  gallery: false,
  logo: false,
  promo: false,
  thumbnail: false,
};

// ---------------------------------------------------------------------------
// Proxy helper
// ---------------------------------------------------------------------------

/**
 * Routes external image URLs through the internal `/api/image-proxy` endpoint
 * so that `next/image` never needs per-domain `remotePatterns` entries.
 *
 * Pass-through cases (returned as-is):
 *  - empty / nullish values  → returns `null`
 *  - relative paths (`/…`)   → already on-origin, no proxy needed
 *  - data URIs               → inline, no proxy needed
 *  - Supabase Storage URLs   → already whitelisted in next.config.ts
 *
 * Everything else (http/https external URLs) is proxied.
 */
export function proxiedImageUrl(url: string | null | undefined): string | null {
  const u = (url ?? "").trim();
  if (!u) return null;
  if (u.startsWith("/") || u.startsWith("data:")) return u;
  if (u.includes(".supabase.co")) return u;
  // All other absolute URLs → route through proxy
  return `/api/image-proxy?url=${encodeURIComponent(u)}`;
}
