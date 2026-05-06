import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";

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
  if (!rateLimitOk(`promo-inquiry:${ip}`)) {
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

  // Save inquiry to database (same schema as contact form)
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

  // Send email notification using SMTP
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

      const subject = `New Promo Inquiry: ${promoTitle || "Untitled Promo"}`;
      const text = [
        `New inquiry about a promo from ${vendorName || "a vendor"}`,
        "",
        `Promo: ${promoTitle || "Untitled Promo"}`,
        `From: ${name} <${email}>`,
        "",
        "Message:",
        message,
      ].join("\n");

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Promo Inquiry</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-spacing: 0; border-collapse: collapse; }
    td { padding: 0; }
    img { border: 0; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f4; padding-bottom: 40px; }
    .main-table { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #ffffff; padding: 40px 0 20px; text-align: center; border-bottom: 3px solid #a68b6a; }
    .logo-text { font-family: 'Georgia', serif; font-size: 28px; color: #333333; letter-spacing: 1px; text-transform: uppercase; text-decoration: none; }
    .content { padding: 40px 40px; color: #555555; }
    .h1 { font-family: 'Georgia', serif; font-size: 24px; color: #333333; margin-bottom: 20px; }
    .detail-row { margin-bottom: 15px; }
    .detail-label { font-weight: bold; color: #333333; }
    .detail-value { color: #555555; }
    .message-box { background-color: #f9f9f9; border-left: 3px solid #a68b6a; padding: 20px; margin-top: 20px; }
    .message-text { font-size: 16px; line-height: 24px; color: #555555; white-space: pre-wrap; }
    .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999999; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" align="center">
      <tr>
        <td class="header">
          <span class="logo-text">Themes &amp; Motifs</span>
        </td>
      </tr>
      <tr>
        <td class="content">
          <h1 class="h1">New Promo Inquiry</h1>
          <div class="detail-row">
            <span class="detail-label">Vendor:</span>
            <span class="detail-value">${escapeHtml(vendorName || "Unknown")}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Promo:</span>
            <span class="detail-value">${escapeHtml(promoTitle || "Untitled Promo")}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">From:</span>
            <span class="detail-value">${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</span>
          </div>
          <div class="message-box">
            <div class="message-text">${escapeHtml(message)}</div>
          </div>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p>&copy; 2026 Themes &amp; Motifs. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

      await transporter.sendMail({
        from: smtpFrom,
        to: vendorEmail,
        replyTo: email,
        subject,
        text,
        html,
      });
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
