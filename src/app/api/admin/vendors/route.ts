import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { assertAdminOrEditorRequest } from "../../../../lib/editorAuth";

export async function GET(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const { searchParams } = new URL(req.url);
    const limitRaw = searchParams.get("limit");
    const query = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const limit = Math.max(1, Math.min(2000, Number(limitRaw ?? 1000) || 1000));

    const supabase = createSupabaseAdminClient();

    let vendorsQuery = supabase
      .from("vendors")
      .select("id,business_name,slug,is_active,is_featured,average_rating,review_count,updated_at,plan_id,verified_status,plan:plans(id,name)")
      .order("is_featured", { ascending: false })
      .order("updated_at", { ascending: false });

    if (query) {
      vendorsQuery = vendorsQuery.or(`business_name.ilike.*${query}*,slug.ilike.*${query}*`);
    }

    if (status) {
      vendorsQuery = vendorsQuery.eq("verified_status", status);
    }

    const [{ data: vendors, error }, { data: plans, error: plansErr }] = await Promise.all([
      query ? vendorsQuery.limit(limit) : vendorsQuery.limit(limit),
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
    await assertAdminOrEditorRequest(req);

    const { id, is_active, is_featured, plan_id, verified_status } = (await req.json()) ?? {};

    if (typeof id !== "number") {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const patch: Record<string, any> = {};
    if (typeof is_active === "boolean") patch.is_active = is_active;
    if (typeof is_featured === "boolean") patch.is_featured = is_featured;
    if (typeof plan_id === "number" || plan_id === null) patch.plan_id = plan_id;
    if (typeof verified_status === "string" && ["pending", "verified", "rejected"].includes(verified_status)) {
      patch.verified_status = verified_status;
    }

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
