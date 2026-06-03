import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";
import { checkRateLimit, RATE_LIMITS } from "../../../lib/rateLimit";

export const dynamic = "force-dynamic";

type Body = {
  message?: unknown;
  url?: unknown;
};

export async function POST(req: Request) {
  let body: Body;

  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Redis-backed rate limiting — persists across Cloudflare Worker isolates & cold starts
  const { allowed } = await checkRateLimit(req, "bugreport", RATE_LIMITS.BUG_REPORT);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again in 15 minutes." }, { status: 429 });
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

  // Save bug report to database.
  // The send-bug-report-email Supabase Edge Function fires automatically via
  // Database Webhook on INSERT and sends the admin notification via nodemailer (Gmail SMTP).
  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("bug_comments").insert({ comment: message, name: fromName });
  } catch (dbError) {
    console.error("Failed to save bug comment to database:", dbError);
    return NextResponse.json({ error: "Failed to submit bug report." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
