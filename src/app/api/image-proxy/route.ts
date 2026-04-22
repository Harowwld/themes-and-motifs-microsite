export const dynamic = "force-dynamic";

function convertGoogleDriveUrl(url: string): string {
  // Convert sharing URL format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // To direct image URL: https://drive.google.com/uc?export=view&id=FILE_ID
  const fileIdMatch = url.match(/\/file\/d\/([^\/\?]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    // Use the thumbnail endpoint which is more reliable for images
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  return url;
}

function getUrlParam(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("url") ?? "").trim();
  if (raw.includes("drive.google.com/file/d/")) {
    return convertGoogleDriveUrl(raw);
  }
  return raw;
}

function isAllowedUrl(raw: string) {
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const raw = getUrlParam(req);

  if (!raw || !isAllowedUrl(raw)) {
    return new Response("Invalid url", { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(raw, {
      redirect: "follow",
      headers: {
        // Helps some hosts that block non-browser UAs.
        "user-agent": "Mozilla/5.0",
        accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      cache: "no-store",
    });
  } catch {
    return new Response("Upstream fetch failed", { status: 502 });
  }

  if (!upstream.ok) {
    return new Response(`Upstream error: ${upstream.status}`, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";

  // Note: we buffer because some hosting setups have trouble streaming cross-origin bodies.
  const body = await upstream.arrayBuffer();

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": contentType,
      // Make it embeddable
      "cross-origin-resource-policy": "cross-origin",
      // Cache lightly in browser; adjust later if needed
      "cache-control": "public, max-age=3600",
    },
  });
}
