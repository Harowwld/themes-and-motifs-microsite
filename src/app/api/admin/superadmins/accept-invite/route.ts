import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "../../../../../lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as any;
    const token = String(body?.token ?? "");
    const password = String(body?.password ?? "");

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Look up the invitation
    const { data: invite, error: inviteError } = await supabase
      .from("superadmin_invitations")
      .select("id, email, invited_by, expires_at, used_at")
      .eq("token", token)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: "Invalid invitation token." }, { status: 404 });
    }

    // Check if already used
    if (invite.used_at) {
      return NextResponse.json(
        { error: "This invitation has already been used. Please sign in instead." },
        { status: 410 }
      );
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(invite.expires_at);
    if (now > expiresAt) {
      return NextResponse.json(
        { error: "This invitation has expired. Please contact an admin for a new invite." },
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
        { error: "This email already has superadmin access. Please sign in." },
        { status: 409 }
      );
    }

    // Create the Supabase Auth user
    const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
      email: invite.email,
      password,
      email_confirm: true, // Auto-confirm since they clicked the invite link
      user_metadata: {
        role: "superadmin",
      },
    });

    if (createError) {
      // Handle case where user already exists in auth.users
      if (createError.message?.includes("already been registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    if (!authUser.user) {
      return NextResponse.json({ error: "Failed to create user account." }, { status: 500 });
    }

    // Create the superadmin record
    const { error: superadminError } = await supabase.from("superadmins").insert({
      username: invite.email,
      password_hash: "", // Not used - we use Supabase Auth
      is_active: true,
      auth_user_id: authUser.user.id,
    });

    if (superadminError) {
      // Rollback: delete the auth user we just created
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json({ error: "Failed to create superadmin record." }, { status: 500 });
    }

    // Mark invitation as used
    const { error: updateError } = await supabase
      .from("superadmin_invitations")
      .update({ used_at: new Date().toISOString() })
      .eq("id", invite.id);

    if (updateError) {
      // Non-fatal error - log it but don't fail the request
      console.error("Failed to mark invitation as used:", updateError);
    }

    // Sign in the user to get a session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: invite.email,
      password,
    });

    if (signInError || !signInData.session) {
      // Return success but without session - user can sign in manually
      return NextResponse.json(
        {
          ok: true,
          message: "Account created successfully. Please sign in.",
          autoSignIn: false,
        },
        { status: 200 }
      );
    }

    // Return success with session info
    return NextResponse.json(
      {
        ok: true,
        message: "Account created successfully.",
        autoSignIn: true,
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
        },
        session: {
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
          expires_at: signInData.session.expires_at,
        },
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
