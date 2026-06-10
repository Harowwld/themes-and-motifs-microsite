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
      .from("reviews")
      .select(
        "id,vendor_id,user_id,rating,review_text,status,helpful_count,created_at,updated_at,vendor:vendors(id,business_name,slug),user:users(id,email)"
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ reviews: data ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    await assertSuperadminRequest(req);

    const body = (await req.json().catch(() => null)) as any;
    const id = Number(body?.id);

    if (!Number.isFinite(id)) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const patch: Record<string, any> = {};
    if (typeof body?.status === "string") {
      patch.status = body.status;
    }

    if (Object.keys(patch).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("reviews")
      .update(patch)
      .eq("id", id)
      .select(
        "id,vendor_id,user_id,rating,review_text,status,helpful_count,created_at,updated_at,vendor:vendors(id,business_name,slug),user:users(id,email)"
      )
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Recalculate average rating and review count for this vendor
    const vendorId = data?.vendor_id;

        try {
          revalidatePath("/", "layout");
        } catch (err) {
          console.error("[Admin API] Cache revalidation failed:", err);
        }

    if (vendorId) {
      const { data: allRatings, error: ratingsErr } = await supabase
        .from("reviews")
        .select("rating")
        .eq("vendor_id", vendorId)
        .eq("status", "published")
        .limit(5000);

      if (!ratingsErr) {
        const rs = (allRatings ?? []) as Array<{ rating: number }>;
        const count = rs.length;
        const avg = count === 0 ? 0 : rs.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / count;
        await supabase
          .from("vendors")
          .update({ average_rating: Number(avg.toFixed(2)), review_count: count })
          .eq("id", vendorId);
      }
    }

    return Response.json({ review: data }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
