import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";

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

  // Save inquiry to database
  const { data: inquiry, error: insertError } = await supabase
    .from("inquiries")
    .insert({
      vendor_id: vendorId,
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

  // Send email notification using SMTP (same as bug report)
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM;

  if (smtpHost && smtpPort && smtpUser && smtpPass && smtpFrom) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: parseInt(smtpPort, 10) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      // Get vendor's contact email for sending notification
      const { data: vendorWithEmail } = await supabase
        .from("vendors")
        .select("contact_email")
        .eq("id", vendorId)
        .single();

      if (vendorWithEmail?.contact_email) {
        const subject = `New Inquiry for ${vendor.business_name}`;
        const text = [
          `Vendor: ${vendor.business_name}`,
          `From: ${fromName} <${fromEmail}>`,
          "",
          message,
        ].join("\n");

        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Inquiry</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-spacing: 0; border-collapse: collapse; }
    td { padding: 0; }
    img { border: 0; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f4; padding-bottom: 40px; }
    .main-table { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #ffffff; padding: 40px 0 20px; text-align: center; border-bottom: 3px solid #C5A059; }
    .logo-text { font-family: 'Georgia', serif; font-size: 28px; color: #333333; letter-spacing: 1px; text-transform: uppercase; text-decoration: none; }
    .content { padding: 40px 40px; color: #555555; }
    .h1 { font-family: 'Georgia', serif; font-size: 24px; color: #333333; margin-bottom: 20px; }
    .detail-row { margin-bottom: 15px; }
    .detail-label { font-weight: bold; color: #333333; }
    .detail-value { color: #555555; }
    .message-box { background-color: #f9f9f9; border-left: 3px solid #C5A059; padding: 20px; margin-top: 20px; }
    .message-text { font-size: 16px; line-height: 24px; color: #555555; white-space: pre-wrap; }
    .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999999; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" align="center">
      <tr>
        <td class="header">
          <a href="#" class="logo-text">Themes & Motifs</a>
        </td>
      </tr>
      <tr>
        <td class="content">
          <h1 class="h1">New Inquiry Received</h1>
          <div class="detail-row">
            <span class="detail-label">Vendor:</span>
            <span class="detail-value">${escapeHtml(vendor.business_name)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">From:</span>
            <span class="detail-value">${escapeHtml(fromName)} &lt;${escapeHtml(fromEmail)}&gt;</span>
          </div>
          <div class="message-box">
            <div class="message-text">${escapeHtml(message)}</div>
          </div>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p>View this inquiry in your vendor dashboard.</p>
          <p>&copy; 2026 Themes & Motifs. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

        await transporter.sendMail({
          from: smtpFrom,
          to: vendorWithEmail.contact_email,
          replyTo: fromEmail,
          subject,
          text,
          html,
        });
      }
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't fail the request if email fails - inquiry is already saved
    }
  }

  return NextResponse.json({ ok: true, inquiryId: inquiry?.id }, { status: 200 });
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
