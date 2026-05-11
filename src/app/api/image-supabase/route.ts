export const dynamic = "force-dynamic";

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const imagePath = searchParams.get("path");
  
  if (!imagePath) {
    return new Response("Missing image path", { status: 400 });
  }

  try {
    const { data, error } = await supabase.storage
      .from('vendor-images')
      .download(imagePath);

    if (error) {
      throw new Error(`Supabase Storage error: ${error.message}`);
    }

    if (!data) {
      throw new Error('Image not found');
    }

    const imageBuffer = await data.arrayBuffer();
    
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "content-type": "image/jpeg", // Adjust based on your needs
        "cache-control": "public, max-age=31536000",
        "cross-origin-resource-policy": "cross-origin",
      },
    });
  } catch (error) {
    console.error("Supabase Storage error:", error);
    
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
