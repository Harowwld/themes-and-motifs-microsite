export const dynamic = "force-dynamic";

const CACHE = caches.open("image-cache");

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  
  if (!url) {
    return new Response("Missing URL parameter", { status: 400 });
  }

  try {
    // Check cache first
    const cache = await CACHE;
    const cached = await cache.match(url);
    
    if (cached) {
      return new Response(cached.body, {
        status: 200,
        headers: {
          "content-type": cached.headers.get("content-type") || "image/jpeg",
          "cache-control": "public, max-age=86400",
          "cross-origin-resource-policy": "cross-origin",
        },
      });
    }

    // Fetch with retry logic
    let response: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await fetch(url, {
          headers: {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "accept": "image/*",
            "referer": "https://drive.google.com/",
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

    // Cache the response
    const imageBuffer = await response.arrayBuffer();
    const cacheResponse = new Response(imageBuffer, {
      headers: {
        "content-type": response.headers.get("content-type") || "image/jpeg",
        "cache-control": "public, max-age=86400",
      },
    });
    
    await cache.put(url, cacheResponse.clone());

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "content-type": response.headers.get("content-type") || "image/jpeg",
        "cache-control": "public, max-age=86400",
        "cross-origin-resource-policy": "cross-origin",
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
