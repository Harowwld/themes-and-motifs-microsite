import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SUPERADMIN_COOKIE_NAME } from "./src/lib/superadminAuth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/superadmin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/superadmin")) {
    const token = req.cookies.get(SUPERADMIN_COOKIE_NAME)?.value ?? "";
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/superadmin/:path*"],
};
