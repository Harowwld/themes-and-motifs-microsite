import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { assertSuperadminRequest } from "../../../../lib/superadminAuth";

export async function GET(req: Request) {
  try {
    await assertSuperadminRequest(req);

    const { searchParams } = new URL(req.url);
    const limitRaw = searchParams.get("limit");
    const limit = Math.max(1, Math.min(500, Number(limitRaw ?? 200) || 200));

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

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

    if (Object.keys(patch).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("users").update(patch).eq("id", id).select("*").single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ user: data }, { status: 200 });
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
