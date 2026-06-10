import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { assertSuperadminRequest } from "../../../../lib/superadminAuth";
import { revalidatePath } from "next/cache";

export async function GET(req: Request) {
  try {
    await assertSuperadminRequest(req);

    const { searchParams } = new URL(req.url);
    const limitRaw = searchParams.get("limit");
    const limit = Math.max(1, Math.min(500, Number(limitRaw ?? 200) || 200));

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("wedding_moments")
      .select(`
        *,
        users (
          id,
          email
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ posts: data ?? [] }, { status: 200 });
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
    for (const k of ["is_active", "is_archived"]) {
      if (k in (body ?? {})) patch[k] = (body as any)[k];
    }

    if (Object.keys(patch).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from("wedding_moments")
      .update(patch)
      .eq("id", id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const { data: updatedPost, error: fetchError } = await supabase
      .from("wedding_moments")
      .select(`
        *,
        users (
          id,
          email
        )
      `)
      .eq("id", id)
      .single();

    if (fetchError) {
      return Response.json({ error: fetchError.message }, { status: 500 });
    }

        try {
          revalidatePath("/", "layout");
        } catch (err) {
          console.error("[Admin API] Cache revalidation failed:", err);
        }


    return Response.json({ post: updatedPost }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
