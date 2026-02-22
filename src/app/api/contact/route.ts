import { NextResponse } from "next/server";
import { Resend } from "resend";

import { createSupabaseServerClient } from "../../../lib/supabaseServer";

export const dynamic = "force-dynamic";

type Body = {
  vendorId?: unknown;
  fromName?: unknown;
  fromEmail?: unknown;
  message?: unknown;
  company?: unknown;
  startedAt?: unknown;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

const rateLimitState: Map<string, number[]> = new Map();

function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

function isEmailLike(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function rateLimitOk(key: string) {
  const now = Date.now();
  const rows = rateLimitState.get(key) ?? [];
  const fresh = rows.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (fresh.length >= RATE_LIMIT_MAX) {
    rateLimitState.set(key, fresh);
    return false;
  }
  fresh.push(now);
  rateLimitState.set(key, fresh);
  return true;
}

export async function POST(req: Request) {
  let body: Body;

  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ip = getClientIp(req);
  if (!rateLimitOk(`contact:${ip}`)) {
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

  if (company) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (durationMs !== null && durationMs < 3000) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const supabase = createSupabaseServerClient();

  const { data: vendor, error } = await supabase
    .from("vendors")
    .select("id,business_name,contact_email")
    .eq("id", vendorId)
    .eq("is_active", true)
    .maybeSingle<{ id: number; business_name: string; contact_email: string | null }>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!vendor?.contact_email) {
    return NextResponse.json({ error: "Vendor email is not available." }, { status: 404 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!resendKey) {
    return NextResponse.json({ error: "Missing env var: RESEND_API_KEY" }, { status: 500 });
  }

  if (!from) {
    return NextResponse.json({ error: "Missing env var: RESEND_FROM" }, { status: 500 });
  }

  const resend = new Resend(resendKey);

  const subject = `New inquiry for ${vendor.business_name}`;

  const text = [
    `Vendor: ${vendor.business_name}`,
    `From: ${fromName} <${fromEmail}>`,
    "",
    message,
  ].join("\n");

  const htmlMessage = escapeHtml(message).replace(/\n/g, "<br/>");

  const html = [
    `<div><strong>Vendor:</strong> ${escapeHtml(vendor.business_name)}</div>`,
    `<div><strong>From:</strong> ${escapeHtml(fromName)} &lt;${escapeHtml(fromEmail)}&gt;</div>`,
    "<hr/>",
    `<div style=\"white-space:normal\">${htmlMessage}</div>`,
  ].join("");

  try {
    await resend.emails.send({
      from,
      to: vendor.contact_email,
      replyTo: fromEmail,
      subject,
      text,
      html,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
