import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";

/**
 * EMERGENCY BOOTSTRAP - One-time use to create first superadmin
 * Only works if no superadmins exist in the system
 * Should be removed after first use
 */
export async function POST(req: Request) {
  try {
    const supabase = createSupabaseAdminClient();

    // SECURITY: Only allow if no superadmins exist
    const { data: existingAdmins, error: countError } = await supabase
      .from("superadmins")
      .select("id")
      .limit(1);

    if (countError) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json(
        { error: "Bootstrap not allowed - superadmins already exist. Use invite flow instead." },
        { status: 403 }
      );
    }

    const body = (await req.json().catch(() => null)) as any;
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Create Supabase Auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "superadmin" },
    });

    if (authError || !authUser.user) {
      return NextResponse.json(
        { error: authError?.message || "Failed to create auth user" },
        { status: 500 }
      );
    }

    // Create superadmin record
    const { error: superadminError } = await supabase.from("superadmins").insert({
      username: email,
      password_hash: "",
      is_active: true,
      auth_user_id: authUser.user.id,
    });

    if (superadminError) {
      // Rollback
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json({ error: "Failed to create superadmin record" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "First superadmin created successfully. You can now log in at /admin/login",
      email,
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
