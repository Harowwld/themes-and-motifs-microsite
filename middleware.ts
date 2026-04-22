import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SUPERADMIN_COOKIE_NAME } from "./src/lib/superadminAuth";
import { findSupabaseToken, getAdminOrEditorAuth } from "./src/lib/editorAuth";

const VENDOR_PUBLIC_PATHS = ["/vendor/signin", "/vendor/signup", "/vendor/signup-link"];

function isVendorPublicPath(pathname: string): boolean {
  return VENDOR_PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

const EDITOR_ALLOWED_PATHS = ["/superadmin/promos"];

function isEditorAllowedPath(pathname: string): boolean {
  return EDITOR_ALLOWED_PATHS.some((path) => pathname.startsWith(path));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/vendor/dashboard")) {
    if (isVendorPublicPath(pathname)) {
      return NextResponse.next();
    }
    const cookieHeader = req.headers.get("cookie") ?? "";
    const token = findSupabaseToken(cookieHeader);
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/vendor/signin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/superadmin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/superadmin")) {
    const token = req.cookies.get(SUPERADMIN_COOKIE_NAME)?.value ?? "";
    if (token) {
      return NextResponse.next();
    }

    if (isEditorAllowedPath(pathname)) {
      const cookieHeader = req.headers.get("cookie") ?? "";
      const supabaseToken = findSupabaseToken(cookieHeader);
      if (supabaseToken) {
        const authReq = new Request(req.url, {
          headers: { cookie: req.headers.get("cookie") ?? "" },
        });
        const auth = await getAdminOrEditorAuth(authReq);
        if (auth && auth.type === "editor") {
          return NextResponse.next();
        }
      }
    }

    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/superadmin/:path*", "/vendor/dashboard/:path*", "/vendor/dashboard"],
};
