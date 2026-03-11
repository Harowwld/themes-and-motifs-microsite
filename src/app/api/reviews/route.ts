import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type PostBody = {
  vendorId?: number;
  rating?: number;
  reviewText?: string;
};

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") ?? "";
    const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: userRes, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userRes?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = userRes.user;

    const body = ((await req.json().catch(() => null)) ?? {}) as PostBody;
    const vendorId = Number(body.vendorId);
    const rating = Number(body.rating);
    const reviewText = typeof body.reviewText === "string" ? body.reviewText.trim() : "";

    if (!Number.isFinite(vendorId) || vendorId <= 0) {
      return NextResponse.json({ error: "Invalid vendorId" }, { status: 400 });
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const { data: vendorOwner } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle<{ id: number }>();

    if (vendorOwner?.id) {
      return NextResponse.json({ error: "Vendors cannot submit reviews." }, { status: 403 });
    }

    const { data: vendorExists } = await supabase
      .from("vendors")
      .select("id")
      .eq("id", vendorId)
      .eq("is_active", true)
      .maybeSingle<{ id: number }>();

    if (!vendorExists?.id) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const { data: created, error: createErr } = await supabase
      .from("reviews")
      .insert({
        vendor_id: vendorId,
        user_id: user.id,
        rating,
        review_text: reviewText || null,
        status: "published",
      })
      .select("id,vendor_id,user_id,rating,review_text,status,created_at")
      .single();

    if (createErr) {
      const msg = createErr.message || "Failed to create review";
      const status = msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("unique") ? 409 : 500;
      return NextResponse.json({ error: msg }, { status });
    }

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

    return NextResponse.json({ review: created }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
