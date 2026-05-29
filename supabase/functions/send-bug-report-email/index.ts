// @ts-nocheck — Deno runtime; npm: specifier used for nodemailer
import nodemailer from "npm:nodemailer@6";

const ADMIN_EMAIL = "harolddelapena.11@gmail.com";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const smtpHost = Deno.env.get("SMTP_HOST");
  const smtpPort = Deno.env.get("SMTP_PORT");
  const smtpUser = Deno.env.get("SMTP_USER");
  const smtpPass = Deno.env.get("SMTP_PASS");
  const smtpFrom = Deno.env.get("SMTP_FROM");

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpFrom) {
    console.error("Missing SMTP secrets in Edge Function environment");
    return new Response("Missing SMTP configuration", { status: 500 });
  }

  let payload: { record?: Record<string, unknown> };
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON payload", { status: 400 });
  }

  const record = payload.record;
  if (!record) {
    return new Response("No record in payload", { status: 400 });
  }

  const message = String(record.comment ?? "");
  const fromName = String(record.name ?? "Anonymous");

  if (!message) {
    return new Response("Empty bug report", { status: 400 });
  }

  const subject = "Bug Report — Themes & Motifs";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bug Report</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    table { border-spacing: 0; border-collapse: collapse; }
    td { padding: 0; }
    .wrapper { width: 100%; background-color: #f4f4f4; padding-bottom: 40px; }
    .main-table { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #ffffff; padding: 40px 0 20px; text-align: center; border-bottom: 3px solid #C5A059; }
    .logo-text { font-family: 'Georgia', serif; font-size: 28px; color: #333333; letter-spacing: 1px; text-transform: uppercase; }
    .content { padding: 40px; color: #555555; }
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
          <span class="logo-text">Themes &amp; Motifs</span>
        </td>
      </tr>
      <tr>
        <td class="content">
          <h1 class="h1">Bug Report Received</h1>
          <div class="detail-row">
            <span class="detail-label">From:</span>
            <span class="detail-value">${escapeHtml(fromName)}</span>
          </div>
          <div class="message-box">
            <div class="message-text">${escapeHtml(message)}</div>
          </div>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p>You received this email because you are the site administrator.</p>
          <p>&copy; 2026 Themes &amp; Motifs. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort, 10),
    secure: parseInt(smtpPort, 10) === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to: ADMIN_EMAIL,
      subject,
      html,
    });
  } catch (emailErr) {
    console.error("nodemailer sendMail error:", emailErr);
    return new Response(`Email delivery failed: ${emailErr}`, { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
