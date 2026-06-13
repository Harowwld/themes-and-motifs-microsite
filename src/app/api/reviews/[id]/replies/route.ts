import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "../../../../../lib/supabaseAdmin";
import { withRateLimit, RATE_LIMITS } from "../../../../../lib/rateLimit";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// ─── GET: fetch replies for a review ───────────────────────────────────────
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const reviewId = Number(id);
  if (!Number.isFinite(reviewId) || reviewId <= 0) {
    return NextResponse.json({ error: "Invalid reviewId" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("review_replies")
    .select("id,reply_text,created_at")
    .eq("review_id", reviewId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ replies: data ?? [] });
}

// ─── POST: add a reply (soon-to-wed only) ──────────────────────────────────
async function handlePost(req: Request, reviewId: number) {
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

  // Vendors cannot post replies
  const { data: vendorOwner } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle<{ id: number }>();
  if (vendorOwner?.id) {
    return NextResponse.json({ error: "Vendors cannot post replies." }, { status: 403 });
  }

  // Check the review exists and is published
  const { data: review } = await supabase
    .from("reviews")
    .select("id")
    .eq("id", reviewId)
    .eq("status", "published")
    .maybeSingle<{ id: number }>();
  if (!review?.id) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const body = ((await req.json().catch(() => null)) ?? {}) as { replyText?: string };
  const replyText = typeof body.replyText === "string" ? body.replyText.trim() : "";
  if (!replyText) {
    return NextResponse.json({ error: "Reply text is required" }, { status: 400 });
  }
  if (replyText.length > 1000) {
    return NextResponse.json({ error: "Reply must be 1000 characters or fewer" }, { status: 400 });
  }

  const { data: created, error: insertErr } = await supabase
    .from("review_replies")
    .insert({ review_id: reviewId, user_id: user.id, reply_text: replyText })
    .select("id,reply_text,created_at")
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ reply: created }, { status: 201 });
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const reviewId = Number(id);
  if (!Number.isFinite(reviewId) || reviewId <= 0) {
    return NextResponse.json({ error: "Invalid reviewId" }, { status: 400 });
  }

  // Apply rate limiting then delegate
  const limitedHandler = withRateLimit(
    (r) => handlePost(r, reviewId),
    "REVIEWS_POST",
    RATE_LIMITS.REVIEWS_POST
  );
  return limitedHandler(req);
}
