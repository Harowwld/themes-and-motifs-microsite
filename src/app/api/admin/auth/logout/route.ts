import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "../../../../../lib/supabaseAdmin";
import { SUPERADMIN_COOKIE_NAME, getSuperadminTokenFromRequest } from "../../../../../lib/superadminAuth";

async function handleLogout(req: Request) {
  const token = getSuperadminTokenFromRequest(req);

  if (token) {
    const supabase = createSupabaseAdminClient();
    await supabase.from("superadmin_sessions").delete().eq("token", token);
  }

  const redirectUrl = new URL("/", req.url);
  const res = NextResponse.redirect(redirectUrl, { status: 302 });
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
