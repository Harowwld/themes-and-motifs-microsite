export const dynamic = "force-dynamic";

// Only initialize cache in runtime environment
const getCache = () => {
  if (typeof caches !== 'undefined') {
    return caches.open("image-cache");
  }
  return null;
};

// Helper function to fetch image directly when cache is unavailable
async function fetchImageDirectly(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "accept-encoding": "gzip, deflate, br",
        "referer": "https://themes-and-motifs.harolddelapena-11.workers.dev/",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "cache-control": "public, max-age=3600",
        "content-type": contentType,
        "cross-origin-resource-policy": "cross-origin",
      },
    });
  } catch (error) {
    console.error("Direct fetch error:", error);
    return new Response("Failed to fetch image", { status: 500 });
  }
}

// Enhanced cache headers for Cloudflare CDN
const CACHE_HEADERS = {
  "cache-control": "public, max-age=31536000, immutable", // 1 year cache
  "cross-origin-resource-policy": "cross-origin",
  "vary": "Accept",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  
  if (!url) {
    return new Response("Missing URL parameter", { status: 400 });
  }

  try {
    // Check cache first
    const cache = await getCache();
    if (!cache) {
      // Cache not available, fetch directly
      return fetchImageDirectly(url);
    }
    
    const cached = await cache.match(url);
    
    if (cached) {
      return new Response(cached.body, {
        status: 200,
        headers: {
          ...CACHE_HEADERS,
          "content-type": cached.headers.get("content-type") || "image/jpeg",
        },
      });
    }

    // Fetch with retry logic
    let response: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // Request modern image formats with fallbacks
        const acceptHeader = req.headers.get("accept") || 
          "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8";
        
        response = await fetch(url, {
          headers: {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "accept": acceptHeader,
            "accept-encoding": "gzip, deflate, br",
            "referer": "https://themes-and-motifs.harolddelapena-11.workers.dev/",
          },
        });
        
        if (response.ok) break;
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      } catch (e) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    if (!response || !response.ok) {
      throw new Error(`Failed after 3 attempts: ${response?.status}`);
    }

    // Cache the response with optimized headers
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";
    
    const cacheResponse = new Response(imageBuffer, {
      headers: {
        ...CACHE_HEADERS,
        "content-type": contentType,
      },
    });
    
    // Only cache if cache is available
    const cacheStore = await getCache();
    if (cacheStore) {
      await cacheStore.put(url, cacheResponse.clone());
    }

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        ...CACHE_HEADERS,
        "content-type": contentType,
      },
    });

  } catch (error) {
    console.error("Image cache error:", error);
    
    // Fallback placeholder
    const placeholderSvg = `
      <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
          Image unavailable
        </text>
      </svg>
    `;
    
    return new Response(placeholderSvg.trim(), {
      status: 200,
      headers: {
        "content-type": "image/svg+xml",
        "cache-control": "public, max-age=3600",
        "cross-origin-resource-policy": "cross-origin",
      },
    });
  }
}
