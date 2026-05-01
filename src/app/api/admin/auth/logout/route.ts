import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { createSupabaseAdminClient } from "../../../../../lib/supabaseAdmin";
import { SUPERADMIN_COOKIE_NAME, getSuperadminTokenFromRequest, getSupabaseAuthToken } from "../../../../../lib/superadminAuth";

async function handleLogout(req: Request) {
  const adminSupabase = createSupabaseAdminClient();

  // Sign out from Supabase Auth (if using Supabase Auth)
  const supabaseToken = getSupabaseAuthToken(req);
  const redirectUrl = new URL("/admin/login", req.url);
  const res = NextResponse.redirect(redirectUrl, { status: 302 });

  if (supabaseToken) {
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                res.cookies.set(name, value, options);
              });
            },
          },
        }
      );

      // This will clear Supabase auth cookies via setAll.
      await supabase.auth.signOut();
    } catch {
      // Ignore errors during sign out
    }
  }

  // Clear legacy session if exists
  const legacyToken = getSuperadminTokenFromRequest(req);
  if (legacyToken) {
    await adminSupabase.from("superadmin_sessions").delete().eq("token", legacyToken);
  }

  // Also explicitly expire any sb-* cookies to avoid stale sessions across tabs.
  try {
    const cookieStore = await cookies();
    for (const c of cookieStore.getAll()) {
      if (c.name.startsWith("sb-")) {
        res.cookies.set({
          name: c.name,
          value: "",
          path: "/",
          expires: new Date(0),
        });
      }
    }
  } catch {
    // Ignore
  }
  
  // Clear legacy cookie
  res.cookies.set({
    name: SUPERADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });

  return res;
}

export async function POST(req: Request) {
  try {
    return await handleLogout(req);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    return await handleLogout(req);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
