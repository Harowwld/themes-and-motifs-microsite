import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { assertSuperadminRequest } from "../../../../lib/superadminAuth";

export async function GET(req: Request) {
  try {
    await assertSuperadminRequest(req);

    const { searchParams } = new URL(req.url);
    const limitRaw = searchParams.get("limit");
    const role = searchParams.get("role");
    const limit = Math.max(1, Math.min(500, Number(limitRaw ?? 200) || 200));

    const supabase = createSupabaseAdminClient();

    let querySelect = "*";
    if (role === "soon_to_wed") {
      querySelect = "*, soon_to_wed_profiles(*)";
    }

    let query = supabase
      .from("users")
      .select(querySelect)
      .order("created_at", { ascending: false });

    if (role) {
      query = query.eq("role", role);
    }

    const { data, error } = await query.limit(limit);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ users: data ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    await assertSuperadminRequest(req);

    const body = (await req.json().catch(() => null)) as any;
    const id = String(body?.id ?? "").trim();

    if (!id) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const patch: Record<string, any> = {};
    for (const k of ["role", "is_active", "email_verified"]) {
      if (k in (body ?? {})) patch[k] = (body as any)[k];
    }

    const profilePatch: Record<string, any> = {};
    const profileFields = [
      "bride_nickname",
      "groom_nickname",
      "wedding_date",
      "wedding_date_public",
      "wedding_venue_area",
      "wedding_venue_public",
      "location",
      "profile_visibility",
      "budget_range",
      "wedding_style",
      "notes",
      "is_premium",
      "profile_photo_url"
    ];
    for (const k of profileFields) {
      if (k in (body ?? {})) {
        profilePatch[k] = (body as any)[k];
      }
    }

    if (Object.keys(patch).length === 0 && Object.keys(profilePatch).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    if (Object.keys(profilePatch).length > 0) {
      const { error: profileError } = await supabase
        .from("soon_to_wed_profiles")
        .upsert({ user_id: id, ...profilePatch }, { onConflict: "user_id" });

      if (profileError) {
        return Response.json({ error: profileError.message }, { status: 500 });
      }
    }

    if (Object.keys(patch).length > 0) {
      const { error } = await supabase.from("users").update(patch).eq("id", id);
      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
    }

    const { data: updatedUser, error: fetchError } = await supabase
      .from("users")
      .select("*, soon_to_wed_profiles(*)")
      .eq("id", id)
      .single();

    if (fetchError) {
      return Response.json({ error: fetchError.message }, { status: 500 });
    }

    return Response.json({ user: updatedUser }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    await assertSuperadminRequest(req);

    const body = (await req.json().catch(() => null)) as any;
    const id = String(body?.id ?? "").trim();

    if (!id) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { error: dbError } = await supabase.from("users").delete().eq("id", id);

    if (dbError) {
      return Response.json({ error: dbError.message }, { status: 500 });
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) {
      return Response.json({ error: authError.message }, { status: 500 });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
