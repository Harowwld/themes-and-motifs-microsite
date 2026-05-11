export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const imageId = searchParams.get("id");
  
  if (!imageId) {
    return new Response("Missing image ID", { status: 400 });
  }

  try {
    // Use Cloudflare Images API
    const response = await fetch(
      `https://imagedelivery.net/ACCOUNT_HASH/${imageId}/public`,
      {
        headers: {
          "Authorization": `Bearer ${process.env.CLOUDFLARE_IMAGES_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudflare Images error: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "content-type": response.headers.get("content-type") || "image/jpeg",
        "cache-control": "public, max-age=31536000",
        "cross-origin-resource-policy": "cross-origin",
      },
    });
  } catch (error) {
    console.error("Cloudflare Images error:", error);
    
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
