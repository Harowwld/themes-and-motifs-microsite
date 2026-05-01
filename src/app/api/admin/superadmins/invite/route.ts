import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

import { createSupabaseAdminClient } from "../../../../../lib/supabaseAdmin";
import { assertSuperadminRequest } from "../../../../../lib/superadminAuth";

export async function POST(req: Request) {
  try {
    // Verify the request is from an authenticated superadmin
    const { superadminId } = await assertSuperadminRequest(req);

    const body = (await req.json().catch(() => null)) as any;
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Check if email already has a superadmin record
    const { data: existingSuperadmin, error: checkError } = await supabase
      .from("superadmins")
      .select("id")
      .eq("username", email)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json({ error: "Error checking existing user." }, { status: 500 });
    }

    if (existingSuperadmin) {
      return NextResponse.json(
        { error: "This email already has superadmin access." },
        { status: 409 }
      );
    }

    // Check if there's already an active invitation for this email
    const { data: existingInvite, error: inviteCheckError } = await supabase
      .from("superadmin_invitations")
      .select("id, expires_at")
      .eq("email", email)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (inviteCheckError) {
      return NextResponse.json({ error: "Error checking existing invitation." }, { status: 500 });
    }

    // Delete any existing unused/expired invites for this email
    if (existingInvite) {
      await supabase.from("superadmin_invitations").delete().eq("id", existingInvite.id);
    }

    // Generate a secure token
    const token = randomBytes(32).toString("hex");

    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: insertError } = await supabase.from("superadmin_invitations").insert({
      email,
      invited_by: superadminId,
      token,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      return NextResponse.json({ error: "Failed to create invitation." }, { status: 500 });
    }

    // Generate the invite link
    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/invite/accept?token=${token}`;

    // Send email via Supabase Auth's email service
    // Note: In production, you should customize the email template in Supabase Dashboard
    // to handle invite links properly, or use a custom email service
    const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: inviteUrl,
      data: {
        invite_type: "superadmin",
        invited_by: superadminId,
      },
    });

    if (emailError) {
      // Don't fail if email fails, just log it
      console.error("Failed to send invite email:", emailError);
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Invitation sent successfully.",
        email,
        // Only return inviteUrl in development for testing
        ...(process.env.NODE_ENV === "development" ? { inviteUrl } : {}),
      },
      { status: 200 }
    );
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
