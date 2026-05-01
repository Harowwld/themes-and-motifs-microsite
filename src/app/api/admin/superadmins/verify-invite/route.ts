import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "../../../../../lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Look up the invitation
    const { data: invite, error } = await supabase
      .from("superadmin_invitations")
      .select("email, expires_at, used_at")
      .eq("token", token)
      .single();

    if (error || !invite) {
      return NextResponse.json({ error: "Invalid invitation token." }, { status: 404 });
    }

    // Check if already used
    if (invite.used_at) {
      return NextResponse.json(
        { error: "This invitation has already been used. Please sign in instead.", used: true },
        { status: 410 }
      );
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(invite.expires_at);
    if (now > expiresAt) {
      return NextResponse.json(
        { error: "This invitation has expired. Please contact an admin for a new invite.", expired: true },
        { status: 410 }
      );
    }

    // Check if email already has superadmin access
    const { data: existingSuperadmin } = await supabase
      .from("superadmins")
      .select("id")
      .eq("username", invite.email)
      .maybeSingle();

    if (existingSuperadmin) {
      return NextResponse.json(
        { error: "This email already has superadmin access. Please sign in.", exists: true },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        email: invite.email,
        valid: true,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
