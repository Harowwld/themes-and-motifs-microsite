import crypto from "crypto";
import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "../../../../../lib/supabaseAdmin";
import { SUPERADMIN_COOKIE_NAME } from "../../../../../lib/superadminAuth";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as any;
    const username = String(body?.username ?? "").trim();
    const password = String(body?.password ?? "");

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { data: superadminId, error: loginErr } = await supabase.rpc("superadmin_login", {
      p_username: username,
      p_password: password,
    });

    if (loginErr) {
      return NextResponse.json({ error: loginErr.message }, { status: 500 });
    }

    if (!superadminId) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const { error: sessErr } = await supabase.from("superadmin_sessions").insert({
      superadmin_id: superadminId,
      token,
      expires_at: expiresAt.toISOString(),
    });

    if (sessErr) {
      return NextResponse.json({ error: sessErr.message }, { status: 500 });
    }

    const res = NextResponse.json({ ok: true }, { status: 200 });
    res.cookies.set({
      name: SUPERADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt,
    });

    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
