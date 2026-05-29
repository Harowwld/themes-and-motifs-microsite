import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { checkRateLimit, RATE_LIMITS } from "../../../../lib/rateLimit";

export const dynamic = "force-dynamic";

type Body = {
  vendorId?: unknown;
  vendorEmail?: unknown;
  vendorName?: unknown;
  promoTitle?: unknown;
  name?: unknown;
  email?: unknown;
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
  const { allowed } = await checkRateLimit(req, "promo-inquiry", RATE_LIMITS.DEFAULT_WRITE);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
  }

  const vendorId = typeof body.vendorId === "number" ? body.vendorId : Number(body.vendorId);
  const vendorEmail = String(body.vendorEmail ?? "").trim();
  const vendorName = String(body.vendorName ?? "").trim();
  const promoTitle = String(body.promoTitle ?? "").trim();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  const company = String(body.company ?? "").trim();

  const startedAt = typeof body.startedAt === "number" ? body.startedAt : body.startedAt ? Number(body.startedAt) : null;
  const durationMs = startedAt ? Date.now() - startedAt : null;

  if (!Number.isFinite(vendorId) || vendorId <= 0) {
    return NextResponse.json({ error: "Invalid vendor." }, { status: 400 });
  }

  if (!vendorEmail || !isEmailLike(vendorEmail)) {
    return NextResponse.json({ error: "Vendor email is not available." }, { status: 400 });
  }

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (!email || !isEmailLike(email)) {
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

  // Save inquiry to database.
  // The send-inquiry-email Supabase Edge Function fires automatically via
  // Database Webhook on INSERT and delivers the email via nodemailer (Gmail SMTP).
  const { data: inquiry, error: insertError } = await supabase
    .from("inquiries")
    .insert({
      vendor_id: vendorId,
      name: name,
      email: email,
      message: `[Promo Inquiry: ${promoTitle}]\n\nVendor: ${vendorName}\nVendor Email: ${vendorEmail}\n\n${message}`,
      status: "new",
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, inquiryId: inquiry?.id }, { status: 200 });
}
