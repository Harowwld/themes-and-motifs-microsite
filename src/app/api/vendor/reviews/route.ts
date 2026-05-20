import { assertVendor, getVendorForUser } from "../_auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("id,vendor_id,user_id,rating,review_text,status,helpful_count,created_at,updated_at,vendor_reply_text,vendor_reply_at,users(email)")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ reviews: reviews ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const body = await req.json();
    const reviewId = Number(body.reviewId);
    const replyText = typeof body.replyText === "string" ? body.replyText.trim() : null;

    if (!Number.isFinite(reviewId) || reviewId <= 0) {
      return Response.json({ error: "Invalid reviewId" }, { status: 400 });
    }

    // Verify ownership of review
    const { data: review, error: selectErr } = await supabase
      .from("reviews")
      .select("id,vendor_id")
      .eq("id", reviewId)
      .maybeSingle();

    if (selectErr) {
      return Response.json({ error: selectErr.message }, { status: 500 });
    }

    if (!review) {
      return Response.json({ error: "Review not found" }, { status: 404 });
    }

    if (review.vendor_id !== vendor.id) {
      return Response.json({ error: "Unauthorized: You do not own this review listing." }, { status: 403 });
    }

    const { data: updated, error: updateErr } = await supabase
      .from("reviews")
      .update({
        vendor_reply_text: replyText || null,
        vendor_reply_at: replyText ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", reviewId)
      .select("id,vendor_id,user_id,rating,review_text,status,helpful_count,created_at,updated_at,vendor_reply_text,vendor_reply_at")
      .single();

    if (updateErr) {
      return Response.json({ error: updateErr.message }, { status: 500 });
    }

    return Response.json({ review: updated }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
