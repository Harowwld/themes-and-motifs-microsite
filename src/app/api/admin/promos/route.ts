import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";

function assertAdmin(req: Request) {
  const token = req.headers.get("x-admin-token");
  const expected = process.env.ADMIN_TOKEN;

  if (!expected) {
    throw new Error("Missing env var: ADMIN_TOKEN");
  }

  if (typeof token !== "string" || token.length === 0 || token !== expected) {
    const err = new Error("Unauthorized") as Error & { statusCode?: number };
    err.statusCode = 401;
    throw err;
  }
}

export async function GET(req: Request) {
  try {
    assertAdmin(req);

    const { searchParams } = new URL(req.url);
    const limitRaw = searchParams.get("limit");
    const limit = Math.max(1, Math.min(500, Number(limitRaw ?? 200) || 200));

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("promos")
      .select("id,vendor_id,title,summary,valid_from,valid_to,is_active,is_featured,updated_at,vendors(business_name,slug)")
      .order("is_featured", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ promos: data ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    assertAdmin(req);

    const { id, is_active, is_featured, valid_from, valid_to, title, summary, image_url } = (await req.json()) ?? {};

    if (typeof id !== "number") {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const patch: Record<string, any> = {};
    if (typeof is_active === "boolean") patch.is_active = is_active;
    if (typeof is_featured === "boolean") patch.is_featured = is_featured;
    if (typeof title === "string") patch.title = title;
    if (typeof summary === "string" || summary === null) patch.summary = summary;
    if (typeof image_url === "string" || image_url === null) patch.image_url = image_url;
    if (typeof valid_from === "string" || valid_from === null) patch.valid_from = valid_from;
    if (typeof valid_to === "string" || valid_to === null) patch.valid_to = valid_to;

    if (Object.keys(patch).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("promos")
      .update(patch)
      .eq("id", id)
      .select("id,vendor_id,title,summary,valid_from,valid_to,is_active,is_featured,updated_at,vendors(business_name,slug)")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ promo: data }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
