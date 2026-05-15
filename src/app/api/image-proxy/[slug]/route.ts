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

async function getUrlParam(req: Request, props: { params: Promise<{ url: string[] }> }) {
  const { url: segments } = await props.params;
  if (!segments || segments.length < 2) return "";
  
  // Reconstruct: ["https", "example.com", "path"] -> "https://example.com/path"
  // Note: segments[0] might be "https:" or "https"
  const protocol = segments[0].replace(":", "");
  const rest = segments.slice(1).join("/");
  const { search } = new URL(req.url);
  const raw = `${protocol}://${rest}${search}`;
  
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

export async function GET(req: Request, props: { params: Promise<{ url: string[] }> }) {
  const raw = await getUrlParam(req, props);

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
        // More realistic browser headers to avoid blocking
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "dnt": "1",
        "sec-fetch-dest": "image",
        "sec-fetch-mode": "no-cors",
        "sec-fetch-site": "cross-site",
        "referer": "https://themes-and-motifs.harolddelapena-11.workers.dev/",
        "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
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
            // More realistic browser headers to avoid blocking
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "accept-language": "en-US,en;q=0.9",
            "accept-encoding": "gzip, deflate, br",
            "dnt": "1",
            "sec-fetch-dest": "image",
            "sec-fetch-mode": "no-cors",
            "sec-fetch-site": "cross-site",
            "referer": "https://themes-and-motifs.harolddelapena-11.workers.dev/",
            "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
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
    console.error("Image proxy fetch error:", error);
    
    // For Cloudflare Workers, return a placeholder image response instead of 502
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

  if (!upstream.ok) {
    console.error("Upstream error:", upstream.status, upstream.statusText);
    
    // For Cloudflare Workers, return a placeholder image response instead of 502
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
      // Cache in Cloudflare CDN for 1 hour, allow browser caching
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
