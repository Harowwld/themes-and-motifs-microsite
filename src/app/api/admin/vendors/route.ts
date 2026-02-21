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

    const [{ data: vendors, error }, { data: plans, error: plansErr }] = await Promise.all([
      supabase
        .from("vendors")
        .select("id,business_name,slug,is_active,is_featured,average_rating,review_count,updated_at,plan_id,plan:plans(id,name)")
        .order("is_featured", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(limit),
      supabase.from("plans").select("id,name").order("id", { ascending: true }).limit(50),
    ]);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (plansErr) {
      return Response.json({ error: plansErr.message }, { status: 500 });
    }

    return Response.json({ vendors: vendors ?? [], plans: plans ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    assertAdmin(req);

    const { id, is_active, is_featured, plan_id } = (await req.json()) ?? {};

    if (typeof id !== "number") {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const patch: Record<string, any> = {};
    if (typeof is_active === "boolean") patch.is_active = is_active;
    if (typeof is_featured === "boolean") patch.is_featured = is_featured;
    if (typeof plan_id === "number" || plan_id === null) patch.plan_id = plan_id;

    if (Object.keys(patch).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("vendors")
      .update(patch)
      .eq("id", id)
      .select("id,business_name,slug,is_active,is_featured,average_rating,review_count,updated_at,plan_id,plan:plans(id,name)")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ vendor: data }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
