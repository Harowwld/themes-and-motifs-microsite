import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";
import { checkRateLimit, RATE_LIMITS } from "../../../lib/rateLimit";

export const dynamic = "force-dynamic";

type Body = {
  vendorId?: unknown;
  fromName?: unknown;
  fromEmail?: unknown;
  message?: unknown;
  company?: unknown;
  startedAt?: unknown;
};

function isEmailLike(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(req: Request) {
  let body: Body;

  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Redis-backed rate limiting — persists across Cloudflare Worker isolates & cold starts
  const { allowed } = await checkRateLimit(req, "contact", RATE_LIMITS.DEFAULT_WRITE);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
  }

  const vendorId = typeof body.vendorId === "number" ? body.vendorId : Number(body.vendorId);
  const fromName = String(body.fromName ?? "").trim();
  const fromEmail = String(body.fromEmail ?? "").trim();
  const message = String(body.message ?? "").trim();
  const company = String(body.company ?? "").trim();

  const startedAt = typeof body.startedAt === "number" ? body.startedAt : body.startedAt ? Number(body.startedAt) : null;
  const durationMs = startedAt ? Date.now() - startedAt : null;

  if (!Number.isFinite(vendorId) || vendorId <= 0) {
    return NextResponse.json({ error: "Invalid vendor." }, { status: 400 });
  }

  if (!fromName) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (!fromEmail || !isEmailLike(fromEmail)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  // Honeypot check - if company field is filled, it's likely a bot
  if (company) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Simple timing check - if submitted too fast, likely a bot
  if (durationMs !== null && durationMs < 3000) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const supabase = createSupabaseAdminClient();

  // Verify vendor exists and is active
  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id,business_name")
    .eq("id", vendorId)
    .eq("is_active", true)
    .maybeSingle();

  if (vendorError) {
    return NextResponse.json({ error: vendorError.message }, { status: 500 });
  }

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found." }, { status: 404 });
  }

  // Identify inquiring user if authenticated
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  let userId: string | null = null;
  let weddingDate: string | null = null;

  if (token) {
    const { data: userRes } = await supabase.auth.getUser(token);
    if (userRes?.user) {
      userId = userRes.user.id;
      const { data: profile } = await supabase
        .from("soon_to_wed_profiles")
        .select("wedding_date")
        .eq("user_id", userId)
        .maybeSingle();
      if (profile?.wedding_date) {
        weddingDate = profile.wedding_date;
      }
    }
  }

  // Save inquiry to database.
  // The send-inquiry-email Supabase Edge Function fires automatically via
  // Database Webhook on INSERT and delivers the email via nodemailer (Gmail SMTP).
  const { data: inquiry, error: insertError } = await supabase
    .from("inquiries")
    .insert({
      vendor_id: vendorId,
      user_id: userId,
      wedding_date: weddingDate,
      name: fromName,
      email: fromEmail,
      message: message,
      status: "new",
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, inquiryId: inquiry?.id }, { status: 200 });
}
