export const dynamic = "force-dynamic";

// Security: Block private IP ranges and localhost to prevent SSRF attacks
const BLOCKED_IP_RANGES = [
  /^127\./, // 127.0.0.0/8 (loopback)
  /^10\./, // 10.0.0.0/8 (private)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12 (private)
  /^192\.168\./, // 192.168.0.0/16 (private)
  /^169\.254\./, // 169.254.0.0/16 (link-local)
  /^0\./, // 0.0.0.0/8
  /^fc00:/i, // fc00::/7 (IPv6 private)
  /^fe80:/i, // fe80::/10 (IPv6 link-local)
  /^::1$/i, // IPv6 loopback
];

const BLOCKED_HOSTNAMES = [
  /^localhost$/i,
  /\.local$/i,
  /\.internal$/i,
  /^169\.254\.169\.254$/i, // AWS metadata endpoint
];

const MAX_RESPONSE_SIZE = 10 * 1024 * 1024; // 10MB
const UPSTREAM_TIMEOUT = 10000; // 10 seconds

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

function isPrivateIp(hostname: string): boolean {
  // Check if hostname is an IP address
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Pattern = /^[0-9a-fA-F:]+$/;
  
  if (!ipv4Pattern.test(hostname) && !ipv6Pattern.test(hostname)) {
    return false; // Not an IP address, check hostnames instead
  }
  
  return BLOCKED_IP_RANGES.some(pattern => pattern.test(hostname));
}

function isBlockedHostname(hostname: string): boolean {
  return BLOCKED_HOSTNAMES.some(pattern => pattern.test(hostname));
}

function isAllowedUrl(raw: string): { allowed: boolean; error?: string } {
  try {
    const u = new URL(raw);
    
    // Only allow HTTPS (no HTTP for security)
    if (u.protocol !== "https:") {
      return { allowed: false, error: "Only HTTPS URLs are allowed" };
    }
    
    // Block private IP ranges
    if (isPrivateIp(u.hostname)) {
      return { allowed: false, error: "Private IP addresses are not allowed" };
    }
    
    // Block internal hostnames
    if (isBlockedHostname(u.hostname)) {
      return { allowed: false, error: "Internal hostnames are not allowed" };
    }
    
    return { allowed: true };
  } catch {
    return { allowed: false, error: "Invalid URL format" };
  }
}

export async function GET(req: Request) {
  const raw = getUrlParam(req);

  if (!raw) {
    return new Response("Missing URL parameter", { status: 400 });
  }

  const urlCheck = isAllowedUrl(raw);
  if (!urlCheck.allowed) {
    return new Response(urlCheck.error || "Invalid URL", { status: 400 });
  }

  let upstream: Response;
  try {
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT);
    
    upstream = await fetch(raw, {
      redirect: "manual", // Don't automatically follow redirects for security
      signal: controller.signal,
      headers: {
        // Helps some hosts that block non-browser UAs.
        "user-agent": "Mozilla/5.0",
        accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      cache: "no-store",
    });
    
    clearTimeout(timeoutId);
    
    // Handle redirects manually to validate the destination
    if (upstream.status >= 300 && upstream.status < 400) {
      const location = upstream.headers.get("location");
      if (location) {
        const redirectCheck = isAllowedUrl(location);
        if (!redirectCheck.allowed) {
          return new Response(`Redirect blocked: ${redirectCheck.error}`, { status: 400 });
        }
        // Re-fetch from the redirect location
        const redirectController = new AbortController();
        const redirectTimeoutId = setTimeout(() => redirectController.abort(), UPSTREAM_TIMEOUT);
        
        upstream = await fetch(location, {
          redirect: "manual",
          signal: redirectController.signal,
          headers: {
            "user-agent": "Mozilla/5.0",
            accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
          },
          cache: "no-store",
        });
        
        clearTimeout(redirectTimeoutId);
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return new Response("Request timeout", { status: 504 });
    }
    return new Response("Upstream fetch failed", { status: 502 });
  }

  if (!upstream.ok) {
    return new Response(`Upstream error: ${upstream.status}`, { status: 502 });
  }

  // Check content length
  const contentLength = upstream.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_SIZE) {
    return new Response("Response too large", { status: 413 });
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  
  // Validate content type is an image
  if (!contentType.startsWith("image/")) {
    return new Response("Invalid content type: only images are allowed", { status: 400 });
  }

  // Note: we buffer because some hosting setups have trouble streaming cross-origin bodies.
  const body = await upstream.arrayBuffer();
  
  // Double-check actual size after buffering
  if (body.byteLength > MAX_RESPONSE_SIZE) {
    return new Response("Response too large", { status: 413 });
  }

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
