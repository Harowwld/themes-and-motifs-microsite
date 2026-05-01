import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "../../../../../lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as any;
    const email = String(body?.email ?? body?.username ?? "").trim();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      // Check if this is a legacy superadmin that needs migration
      // Legacy users have password_hash but no auth_user_id
      const { data: legacySuperadmin, error: legacyError } = await supabase
        .from("superadmins")
        .select("id, username, password_hash, is_active, auth_user_id")
        .eq("username", email)
        .is("auth_user_id", null)
        .limit(1)
        .maybeSingle<{ 
          id: string; 
          username: string; 
          password_hash: string; 
          is_active: boolean;
          auth_user_id: string | null;
        }>();

      if (legacyError) {
        console.error("Legacy superadmin query error:", legacyError);
        return NextResponse.json({ error: `Error checking superadmin status: ${legacyError.message}` }, { status: 500 });
      }

      if (!legacySuperadmin) {
        // No legacy user found either
        return NextResponse.json(
          { error: authError?.message ?? "Invalid email or password." },
          { status: 401 }
        );
      }

      // Verify legacy password using the RPC function
      const { data: passwordValid, error: verifyError } = await supabase.rpc("superadmin_verify_password", {
        p_superadmin_id: legacySuperadmin.id as string,
        p_password: password,
      });

      if (verifyError || !passwordValid) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }

      if (!legacySuperadmin.is_active) {
        return NextResponse.json(
          { error: "Your superadmin account is inactive." },
          { status: 403 }
        );
      }

      // Check if username is in email format (required for Supabase Auth migration)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const canAutoMigrate = emailRegex.test(legacySuperadmin.username);

      if (!canAutoMigrate) {
        // Non-email username - create legacy session without migrating
        // User should use /admin/bootstrap to create a new email-based admin
        const { data: sessionData, error: sessionError } = await supabase
          .from("superadmin_sessions")
          .insert({
            superadmin_id: legacySuperadmin.id,
            token: crypto.randomUUID(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          })
          .select("token")
          .single();

        if (sessionError || !sessionData) {
          return NextResponse.json(
            { error: "Failed to create session. Please contact support." },
            { status: 500 }
          );
        }

        const res = NextResponse.json(
          {
            ok: true,
            legacy: true,
            message: "Please create a new admin account with email format at /admin/bootstrap",
            user: {
              superadminId: legacySuperadmin.id,
            },
          },
          { status: 200 }
        );

        // Set legacy cookie
        res.cookies.set({
          name: "tm_superadmin",
          value: sessionData.token,
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 24 * 60 * 60, // 24 hours
        });

        return res;
      }

      // Auto-migrate: Create Supabase Auth user
      const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
        email: legacySuperadmin.username,
        password,
        email_confirm: true,
        user_metadata: {
          role: "superadmin",
        },
      });

      if (createError || !newAuthUser.user) {
        return NextResponse.json(
          { error: "Failed to migrate your account. Please contact support." },
          { status: 500 }
        );
      }

      // Link the superadmin record to the new auth user
      const { error: updateError } = await supabase
        .from("superadmins")
        .update({ auth_user_id: newAuthUser.user.id })
        .eq("id", legacySuperadmin.id);

      if (updateError) {
        // Rollback: delete the auth user we just created
        await supabase.auth.admin.deleteUser(newAuthUser.user.id);
        return NextResponse.json(
          { error: "Failed to link your account. Please contact support." },
          { status: 500 }
        );
      }

      // Sign in the newly created user
      const { data: newSession, error: signInError } = await supabase.auth.signInWithPassword({
        email: legacySuperadmin.username,
        password,
      });

      if (signInError || !newSession.user || !newSession.session) {
        return NextResponse.json(
          { error: "Account migrated but failed to sign in. Please try again." },
          { status: 500 }
        );
      }

      // Return success with session info
      return NextResponse.json(
        {
          ok: true,
          migrated: true,
          user: {
            id: newSession.user.id,
            email: newSession.user.email,
            superadminId: legacySuperadmin.id,
          },
          session: {
            access_token: newSession.session.access_token,
            refresh_token: newSession.session.refresh_token,
            expires_at: newSession.session.expires_at,
          },
        },
        { status: 200 }
      );
    }

    // Check if this user is linked to a superadmin record
    const { data: superadminData, error: superadminError } = await supabase
      .from("superadmins")
      .select("id, auth_user_id, is_active")
      .eq("auth_user_id", authData.user.id)
      .limit(1)
      .maybeSingle<{ id: string; auth_user_id: string; is_active: boolean }>();

    if (superadminError) {
      console.error("Superadmin link check error:", superadminError);
      return NextResponse.json({ error: `Error checking superadmin status: ${superadminError.message}` }, { status: 500 });
    }

    if (!superadminData) {
      // User exists but is not a superadmin
      return NextResponse.json(
        { error: "Access denied. You are not authorized as a superadmin." },
        { status: 403 }
      );
    }

    if (!superadminData.is_active) {
      return NextResponse.json(
        { error: "Your superadmin account is inactive." },
        { status: 403 }
      );
    }

    // Return success with session info
    // The Supabase client on the frontend will handle the session cookie
    return NextResponse.json(
      {
        ok: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          superadminId: superadminData.id,
        },
        session: {
          access_token: authData.session?.access_token,
          refresh_token: authData.session?.refresh_token,
          expires_at: authData.session?.expires_at,
        },
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
