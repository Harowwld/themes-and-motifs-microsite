import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type Body = {
  message?: unknown;
  url?: unknown;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;

const rateLimitState: Map<string, number[]> = new Map();

function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
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
  if (!rateLimitOk(`bugreport:${ip}`)) {
    return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
  }

  const message = String(body.message ?? "").trim();
  const url = String(body.url ?? "").trim();

  let fromName = "Anonymous";
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
    if (token) {
      const supabase = createSupabaseAdminClient();
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.email) {
        fromName = user.email;
      }
    }
  } catch (authError) {
    console.error("Failed to get user from session:", authError);
  }

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpFrom) {
    return NextResponse.json({ error: "Missing SMTP configuration. Please contact the administrator." }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort, 10),
    secure: parseInt(smtpPort, 10) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const subject = "Bug Report - Themes & Motifs";
  const text = [
    `From: ${fromName}`,
    `URL: ${url || "N/A"}`,
    `IP: ${ip}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bug Report</title>
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
          <h1 class="h1">Bug Report Received</h1>
          <div class="detail-row">
            <span class="detail-label">From:</span>
            <span class="detail-value">${escapeHtml(fromName)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">URL:</span>
            <span class="detail-value">${escapeHtml(url || "N/A")}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">IP:</span>
            <span class="detail-value">${escapeHtml(ip)}</span>
          </div>
          <div class="message-box">
            <div class="message-text">${escapeHtml(message)}</div>
          </div>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p>You received this email because you are the site administrator.</p>
          <p>&copy; 2026 Themes & Motifs. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to: "harolddelapena.11@gmail.com",
      subject,
      text,
      html,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to send email" }, { status: 500 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("bug_comments").insert({ comment: message, name: fromName });
  } catch (dbError) {
    console.error("Failed to save bug comment to database:", dbError);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
