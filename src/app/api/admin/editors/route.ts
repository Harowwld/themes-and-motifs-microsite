import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { assertSuperadminOnly } from "../../../../lib/editorAuth";

export async function GET(req: Request) {
  try {
    await assertSuperadminOnly(req);

    const { searchParams } = new URL(req.url);
    const limitRaw = searchParams.get("limit");
    const pending = searchParams.get("pending") === "true";
    const limit = Math.max(1, Math.min(500, Number(limitRaw ?? 200) || 200));

    const supabase = createSupabaseAdminClient();

    // Get editors without user join (cross-schema FK doesn't work with PostgREST)
    const { data: editorsData, error } = await supabase
      .from("editors")
      .select("id, user_id, can_edit_photos, can_edit_entries, created_at")
      .is("vendor_id", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Get user IDs to fetch user data
    const userIds = (editorsData ?? []).map((e: any) => e.user_id).filter(Boolean);

    // Fetch user data from auth.users via admin client
    const userMap = new Map<string, { email: string | null; name: string | null }>();
    for (const uid of userIds) {
      try {
        const { data: user } = await supabase.auth.admin.getUserById(uid);
        if (user?.user) {
          const meta = user.user.user_metadata || {};
          userMap.set(uid, {
            email: user.user.email ?? null,
            name: meta.name ?? meta.full_name ?? null,
          });
        }
      } catch {
        // Ignore errors for individual users
      }
    }

    // Format the response
    const editors = (editorsData ?? []).map((row: any) => {
      const userData = userMap.get(row.user_id);
      return {
        id: row.id,
        user_id: row.user_id,
        email: userData?.email ?? null,
        name: userData?.name ?? null,
        can_edit_photos: row.can_edit_photos,
        can_edit_entries: row.can_edit_entries,
        created_at: row.created_at,
      };
    });

    // If pending=true, return users who signed up but aren't in editors table
    if (pending) {
      // Get all user IDs that already have editor records
      const existingEditorUserIds = new Set((editorsData ?? []).map((e: any) => e.user_id).filter(Boolean));

      // List users from auth (recently created first)
      const { data: allUsers, error: listError } = await supabase.auth.admin.listUsers();

      if (listError) {
        return Response.json({ error: listError.message }, { status: 500 });
      }

      // Filter to users who signed up via editor signup (have email) but don't have editor record
      const pendingEditors = (allUsers.users ?? [])
        .filter((u) => u.email && !existingEditorUserIds.has(u.id))
        .slice(0, limit)
        .map((u) => ({
          user_id: u.id,
          email: u.email,
          name: u.user_metadata?.name ?? u.user_metadata?.full_name ?? null,
          created_at: u.created_at,
        }));

      return Response.json({ pendingEditors }, { status: 200 });
    }

    return Response.json({ editors }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function POST(req: Request) {
  try {
    await assertSuperadminOnly(req);

    const body = (await req.json().catch(() => null)) as any;
    const email = String(body?.email ?? "").trim().toLowerCase();
    const canEditPhotos = Boolean(body?.can_edit_photos ?? true);
    const canEditEntries = Boolean(body?.can_edit_entries ?? true);

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Find user by email
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .limit(1);

    if (userError) {
      return Response.json({ error: userError.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return Response.json({ error: "User not found with that email" }, { status: 404 });
    }

    const userId = users[0].id;

    // Check if editor already exists (global editor with null vendor_id)
    const { data: existing } = await supabase
      .from("editors")
      .select("id")
      .eq("user_id", userId)
      .is("vendor_id", null)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return Response.json({ error: "User is already an editor" }, { status: 409 });
    }

    // Create the editor record (global editor - vendor_id is null)
    const { data: editor, error: insertError } = await supabase
      .from("editors")
      .insert({
        user_id: userId,
        vendor_id: null,
        can_edit_photos: canEditPhotos,
        can_edit_entries: canEditEntries,
      })
      .select("id, user_id, can_edit_photos, can_edit_entries, created_at")
      .single();

    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 });
    }

    // Fetch user data for response
    let userEmail = users[0].email ?? null;
    let userName = null;
    try {
      const { data: user } = await supabase.auth.admin.getUserById(userId);
      if (user?.user) {
        const meta = user.user.user_metadata || {};
        userEmail = user.user.email ?? userEmail;
        userName = meta.name ?? meta.full_name ?? null;
      }
    } catch {
      // Use email from public.users as fallback
    }

    // Format response
    const result = {
      id: editor.id,
      user_id: editor.user_id,
      email: userEmail,
      name: userName,
      can_edit_photos: editor.can_edit_photos,
      can_edit_entries: editor.can_edit_entries,
      created_at: editor.created_at,
    };

    return Response.json({ editor: result }, { status: 201 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    await assertSuperadminOnly(req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("user_id");

    const supabase = createSupabaseAdminClient();

    // If user_id is provided, delete the auth user (for pending editors)
    if (userId) {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
      return Response.json({ ok: true }, { status: 200 });
    }

    // Otherwise, delete the editor record (for approved editors)
    if (!id) {
      return Response.json({ error: "Editor ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("editors")
      .delete()
      .eq("id", id)
      .is("vendor_id", null); // Only delete global editors via this endpoint

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
