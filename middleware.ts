import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { updateSession } from "./src/lib/supabase-server";
import { findSupabaseToken } from "./src/lib/editorAuth";
import { rateLimitMiddleware, RATE_LIMITS } from "./src/lib/rateLimit";

const VENDOR_PUBLIC_PATHS = ["/vendor/signin", "/vendor/signup", "/vendor/signup-link"];

function isVendorPublicPath(pathname: string): boolean {
  return VENDOR_PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

const EDITOR_PUBLIC_PATHS = ["/editor/signin", "/editor/signup", "/editor/verify"];

function isEditorPublicPath(pathname: string): boolean {
  return EDITOR_PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

const EDITOR_ALLOWED_PATHS = ["/superadmin/promos", "/superadmin/vendors"];

function isEditorAllowedPath(pathname: string): boolean {
  return EDITOR_ALLOWED_PATHS.some((path) => pathname.startsWith(path));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Enforce browser-wide/global rate limiting (skip static assets/internal routes)
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.includes("/favicon.ico") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|css|js)$/);

  if (!isStaticAsset) {
    let configKey: keyof typeof RATE_LIMITS = "DEFAULT_READ";
    const endpoint = pathname;

    if (pathname.startsWith("/superadmin") || pathname.startsWith("/admin")) {
      configKey = "ADMIN";
    } else if (pathname.startsWith("/vendor")) {
      configKey = "VENDOR_API";
    } else if (req.method !== "GET") {
      configKey = "DEFAULT_WRITE";
    }

    const { allowed, response } = await rateLimitMiddleware(req, endpoint, RATE_LIMITS[configKey]);
    if (!allowed && response) {
      return response;
    }
  }

  // Handle vendor public paths (signin, signup)
  if (isVendorPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Handle editor public paths (signin, signup, verify)
  if (isEditorPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Handle vendor dashboard (protected)
  if (pathname.startsWith("/vendor/dashboard")) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const token = findSupabaseToken(cookieHeader);
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/vendor/signin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Handle editor dashboard (protected)
  if (pathname.startsWith("/editor/dashboard")) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const token = findSupabaseToken(cookieHeader);
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/editor/signin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/superadmin")) {
    return NextResponse.next();
  }

  // /admin is an alias entrypoint; send users to the actual dashboard.
  if (pathname === "/admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/superadmin";
    return NextResponse.redirect(url);
  }

  if (pathname === "/admin/login" || pathname === "/admin/bootstrap") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/superadmin")) {
    const isPrefetch = req.headers.get("purpose") === "prefetch" || req.headers.get("x-middleware-preflight") === "1";

    if (isPrefetch) {
      const cookieHeader = req.headers.get("cookie") ?? "";
      const token = findSupabaseToken(cookieHeader);
      if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
      }

      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-pathname", pathname);
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        }
      });
    }

    // First, update the session and get the user
    const sessionResult = await updateSession(req);
    
    // If no user, redirect to admin login
    if (!('user' in sessionResult) || !sessionResult.user) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    
    const { supabaseResponse, user } = sessionResult;
    
    // Forward pathname via request headers to server layout/components
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-pathname", pathname);

    // Sync updated session cookies from supabaseResponse to the forward request
    supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
      requestHeaders.set("cookie", `${name}=${value}`);
    });

    const nextResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });

    // Copy the updated cookies to the final response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      const { name, value, ...options } = cookie;
      nextResponse.cookies.set(name, value, options);
    });

    return nextResponse;
  }

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("redirect", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
