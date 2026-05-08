import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Rate limit configuration
export type RateLimitConfig = {
  requests: number; // Number of requests allowed
  window: number; // Time window in seconds
};

// Default rate limits per endpoint type
export const RATE_LIMITS = {
  // Read operations
  DEFAULT_READ: { requests: 100, window: 60 },
  
  // Write operations
  DEFAULT_WRITE: { requests: 20, window: 60 },
  
  // Upload operations
  UPLOAD: { requests: 5, window: 60 },
  
  // Specific endpoints
  MOMENTS_POST: { requests: 10, window: 60 },
  MOMENTS_PHOTOS_POST: { requests: 5, window: 60 },
  REVIEWS_POST: { requests: 10, window: 60 },
  SAVED_VENDORS_POST: { requests: 20, window: 60 },
  MOMENTS_PATCH_DELETE: { requests: 20, window: 60 },
  
  // Admin operations
  ADMIN: { requests: 60, window: 60 },
  VENDOR_API: { requests: 60, window: 60 },
};

// Generate rate limit key
function getKey(identifier: string, endpoint: string): string {
  return `ratelimit:${identifier}:${endpoint}`;
}

// Get client identifier (IP or user ID)
export function getIdentifier(req: Request): string {
  // Try to get user ID from auth header
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (token) {
    // Use token hash as identifier for authenticated users
    // In production, you might want to decode the JWT to get the user ID
    return `token:${token.slice(0, 16)}`;
  }
  
  // Fall back to IP address
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return `ip:${ip}`;
}

// Check rate limit
export async function checkRateLimit(
  req: Request,
  endpoint: string,
  config: RateLimitConfig = RATE_LIMITS.DEFAULT_READ
): Promise<{ allowed: boolean; limit: number; remaining: number; reset: number }> {
  const identifier = getIdentifier(req);
  const key = getKey(identifier, endpoint);
  const now = Date.now();
  const windowMs = config.window * 1000;
  const reset = Math.ceil((now + windowMs) / 1000);

  try {
    // Use Redis pipeline for atomic increment and expiry
    const multi = redis.pipeline();
    
    // Get current count
    multi.get(key);
    // Increment count
    multi.incr(key);
    
    const results = await multi.exec<[string | null, number]>();
    const currentCount = results[0] ? parseInt(results[0], 10) : 0;
    const newCount = results[1];

    // Set expiry on first request
    if (currentCount === 0) {
      await redis.expire(key, config.window);
    }

    const allowed = newCount <= config.requests;
    const remaining = Math.max(0, config.requests - newCount);

    return {
      allowed,
      limit: config.requests,
      remaining,
      reset,
    };
  } catch (error) {
    // If Redis fails, allow the request but log the error
    console.error("Rate limit check failed:", error);
    return {
      allowed: true,
      limit: config.requests,
      remaining: config.requests,
      reset,
    };
  }
}

// Rate limit wrapper for API routes
export function withRateLimit(
  handler: (req: Request) => Promise<Response>,
  endpoint: string,
  config: RateLimitConfig = RATE_LIMITS.DEFAULT_READ
) {
  return async (req: Request): Promise<Response> => {
    const result = await checkRateLimit(req, endpoint, config);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": String(result.limit),
            "X-RateLimit-Remaining": String(result.remaining),
            "X-RateLimit-Reset": String(result.reset),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = await handler(req);
    const newHeaders = new Headers(response.headers);
    newHeaders.set("X-RateLimit-Limit", String(result.limit));
    newHeaders.set("X-RateLimit-Remaining", String(result.remaining));
    newHeaders.set("X-RateLimit-Reset", String(result.reset));

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}

// Middleware-friendly rate limit check
export async function rateLimitMiddleware(
  req: Request,
  endpoint: string,
  config: RateLimitConfig = RATE_LIMITS.DEFAULT_READ
): Promise<{ allowed: boolean; response?: Response }> {
  const result = await checkRateLimit(req, endpoint, config);

  if (!result.allowed) {
    return {
      allowed: false,
      response: new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": String(result.limit),
            "X-RateLimit-Remaining": String(result.remaining),
            "X-RateLimit-Reset": String(result.reset),
          },
        }
      ),
    };
  }

  return { allowed: true };
}
