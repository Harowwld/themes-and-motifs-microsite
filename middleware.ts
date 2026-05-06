import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { updateSession } from "./src/lib/supabase-server";
import { findSupabaseToken, getAdminOrEditorAuth } from "./src/lib/editorAuth";
import { createSupabaseAdminClient } from "./src/lib/supabaseAdmin";

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
    // First, update the session and get the user
    const sessionResult = await updateSession(req);
    
    // If no user, redirect to admin login
    if (!('user' in sessionResult)) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    
    const { supabaseResponse, user } = sessionResult;
    
    // Check if this user is a superadmin via the database
    const { data: superadminData } = await createSupabaseAdminClient()
      .from("superadmins")
      .select("id, auth_user_id, is_active")
      .eq("auth_user_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle<{ id: string; auth_user_id: string; is_active: boolean }>();
    
    if (superadminData) {
      // User is a superadmin, allow access
      supabaseResponse.headers.set("x-pathname", pathname);
      return supabaseResponse;
    }
    
    // Check if user is an editor and trying to access allowed paths
    if (isEditorAllowedPath(pathname)) {
      const { data: editorData } = await createSupabaseAdminClient()
        .from("editors")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle<{ id: string }>();
      
      if (editorData) {
        supabaseResponse.headers.set("x-pathname", pathname);
        return supabaseResponse;
      }
    }
    
    // User is not authorized for superadmin access
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("redirect", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/superadmin/:path*", "/vendor/:path*", "/editor/:path*"],
};
