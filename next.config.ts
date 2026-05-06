import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.1.6"],

  // Router cache configuration for page-level caching
  // This caches previously loaded pages in the browser
  experimental: {
    // Keep pages in router cache for 5 minutes (300 seconds)
    // This means when users navigate back to a previously loaded page,
    // it will be served from cache instantly
    staleTimes: {
      dynamic: 300, // 5 minutes for dynamic pages
      static: 3600, // 1 hour for static pages
    },
  },

  // Headers for HTTP caching
  async headers() {
    return [
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
