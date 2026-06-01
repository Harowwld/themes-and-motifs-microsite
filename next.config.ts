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
      "frame-ancestors 'self'", // Allow framing on same origin
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
    value: "SAMEORIGIN",
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
    // Note: localPatterns is intentionally NOT set here.
    // When omitted, next/image allows ALL local paths — including
    // /api/image-proxy?url=... which is how we proxy external images.
    // Setting localPatterns forces strict matching, which breaks the proxy.
    //
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
      {
        protocol: "https",
        hostname: "thepennyslo.com",
      },
      {
        protocol: "https",
        hostname: "themesnmotifs.com",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "kasal.com",
      },
      {
        protocol: "https",
        hostname: "eventtreeph.wordpress.com",
      },
      {
        protocol: "https",
        hostname: "**.bing.net",
      },
      {
        protocol: "https",
        hostname: "img1.wsimg.com",
      },
      {
        protocol: "https",
        hostname: "www.taocommunity.com",
      },
      {
        protocol: "https",
        hostname: "frankandcarols.ph",
      },
      {
        protocol: "https",
        hostname: "inspirations.ph",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "www.magpiewedding.com",
      },
      {
        protocol: "https",
        hostname: "static.where-e.com",
      },
      {
        protocol: "https",
        hostname: "niceprintphoto.com",
      },
      {
        protocol: "https",
        hostname: "amycakesbakes.com",
      },
      {
        protocol: "https",
        hostname: "www.bakingo.com",
      },
      {
        protocol: "https",
        hostname: "blogger.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },
      {
        protocol: "https",
        hostname: "**.ftcdn.net",
      },
    ],
    // Image formats for automatic optimization
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for srcset
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache TTL for optimized images (in seconds)
    // 24 hours — vendor images are stable assets that don't change frequently.
    // Previously 60s caused constant re-validation churn.
    minimumCacheTTL: 86400,
    // Allowed image qualities
    qualities: [75, 85],
    // Disable image optimization for compatibility with Cloudflare Workers
    // (Cloudflare Image Resizing is a paid feature).
    unoptimized: true,
  },

  // Router cache configuration - keep pages cached in both dev and prod.
  // Without staleTimes, every navigation back to a page triggers a full server re-render.
  experimental: {
    staleTimes: {
      dynamic: 300,   // 5 minutes for dynamic pages
      static: 3600,   // 1 hour for static pages
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
        // Vendor list API — anonymous users get edge-cached results;
        // Vary: Cookie ensures logged-in users see their own data.
        source: "/api/vendors",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=30, stale-while-revalidate=300",
          },
          {
            key: "Vary",
            value: "Cookie, Accept-Encoding",
          },
        ],
      },
    ];
  },

  // 301 Permanent Redirects from vendors to suppliers for SEO and Nice Marketing
  async redirects() {
    return [
      {
        source: "/vendors",
        destination: "/suppliers",
        permanent: true,
      },
      {
        source: "/vendors/:path+",
        destination: "/suppliers/:path+",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
