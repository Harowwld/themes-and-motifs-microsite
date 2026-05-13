import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Security headers
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Required for Next.js
      "style-src 'self' 'unsafe-inline'", // Required for styled-jsx
      "img-src 'self' https: data: blob:", // Allow HTTPS images and data URIs
      "font-src 'self'",
      "connect-src 'self' https:", // Allow API calls to HTTPS
      "frame-src 'self' https://www.youtube.com https://player.vimeo.com", // Allow YouTube and Vimeo embeds
      "frame-ancestors 'none'", // Equivalent to X-Frame-Options: DENY
      "form-action 'self'",
      "base-uri 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload", // 2 years
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig: NextConfig = {
  // allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.1.6"],

  // Image optimization configuration
  images: {
    // Enable remote image optimization
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
    ],
    // Image formats for automatic optimization
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for srcset
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache TTL for optimized images (in seconds)
    minimumCacheTTL: 60,
  },

  // Router cache configuration - disabled in dev to prevent stale content
  experimental: isDev
    ? {} // No experiments in dev (no stale caching)
    : {
        // Production: keep pages in router cache for performance
        staleTimes: {
          dynamic: 300,   // 5 minutes
          static: 3600,   // 1 hour
        },
      },

  // Headers for HTTP caching and security
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Cache static assets aggressively
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache vendor images (proxied)
        source: "/api/image-proxy",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
