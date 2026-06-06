/**
 * import-stw-users.mjs
 *
 * Local bulk importer for Soon-to-Wed users from the cleaned bridal fair CSV.
 * Runs on your Mac — uses Node.js TCP directly so Gmail SMTP works fine.
 *
 * Usage:
 *   node import-stw-users.mjs [path/to/csv] [--dry-run] [--concurrency=5]
 *   node import-stw-users.mjs --mark-sent email1@x.com email2@x.com ...
 *   node import-stw-users.mjs --show-log
 *
 * Modes:
 *   (default)      Import CSV, create accounts, send emails.
 *   --dry-run      Preview only — no accounts created, no emails sent.
 *   --mark-sent    Mark specific emails as already emailed (backfill history).
 *   --show-log     Print the emailed log summary and exit.
 *
 * Email Tracking:
 *   Every successfully emailed address is recorded in emailed-log.json.
 *   On every run, anyone already in this log is SKIPPED (no duplicate emails).
 *   The log persists between runs and is safe to edit manually.
 *
 * Defaults:
 *   CSV:         /Users/harold/Downloads/Cleaned_Seeded_STWs.csv
 *   Concurrency: 5 users processed in parallel
 *   Site URL:    https://reviews.themesnmotifs.com
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";

// ─── Config ───────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env manually (no dotenv dependency needed)
function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    const val = rest.join("=").replace(/^"|"$/g, "").trim();
    if (key && !(key in process.env)) process.env[key] = val;
  }
}
loadEnv();

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SMTP_HOST        = process.env.SMTP_HOST ?? "smtp.gmail.com";
const SMTP_PORT        = parseInt(process.env.SMTP_PORT ?? "465", 10);
const SMTP_USER        = process.env.SMTP_USER;
const SMTP_PASS        = process.env.SMTP_PASS;
const SMTP_FROM        = process.env.SMTP_FROM ?? SMTP_USER;
const SITE_URL         = "https://reviews.themesnmotifs.com";

// ─── Email Log (persistent tracker) ──────────────────────────────────────────

/**
 * emailed-log.json structure:
 * {
 *   "email@example.com": {
 *     "emailedAt": "2026-06-06T13:02:00.000Z",
 *     "firstName": "Juan",
 *     "source": "script" | "manual"
 *   },
 *   ...
 * }
 */
const EMAIL_LOG_PATH = path.join(__dirname, "emailed-log.json");

function loadEmailLog() {
  if (!fs.existsSync(EMAIL_LOG_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(EMAIL_LOG_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function saveEmailLog(log) {
  fs.writeFileSync(EMAIL_LOG_PATH, JSON.stringify(log, null, 2));
}

function markEmailed(log, email, firstName, source = "script") {
  log[email.toLowerCase()] = {
    emailedAt: new Date().toISOString(),
    firstName:  firstName || "",
    source,
  };
}

// ─── CLI Arg Parsing ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN    = args.includes("--dry-run");
const SHOW_LOG   = args.includes("--show-log");
const MARK_SENT  = args.includes("--mark-sent");
const concArg    = args.find((a) => a.startsWith("--concurrency="));
const CONCURRENCY = concArg ? parseInt(concArg.split("=")[1], 10) : 5;
const csvArg     = args.find((a) => !a.startsWith("--"));
const CSV_PATH   = csvArg ?? "/Users/harold/Downloads/Cleaned_Seeded_STWs.csv";

// STW roles (case-insensitive prefix match)
const STW_PREFIXES = ["bride", "groom"];
const isStw = (role) =>
  STW_PREFIXES.some((p) => (role ?? "").toLowerCase().trim().startsWith(p));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NULL_VALUES = new Set([
  "", "na", "n/a", "none", "none yet", "not yet", "same",
  "this does not apply to me", "not applicable to me", "none yeat",
  "nope", "tbd",
]);
const clean = (v) => {
  const s = String(v ?? "").trim();
  return NULL_VALUES.has(s.toLowerCase()) ? "" : s;
};

const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ANSI colours
const c = {
  reset:  "\x1b[0m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  red:    "\x1b[31m",
  cyan:   "\x1b[36m",
  dim:    "\x1b[2m",
  bold:   "\x1b[1m",
  blue:   "\x1b[34m",
};

function log(symbol, color, msg) {
  console.log(`${color}${symbol}${c.reset} ${msg}`);
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────

function parseCSV(text) {
  const lines = [];
  let cur = "";
  let inQ = false;
  for (const ch of text) {
    if (ch === '"') { inQ = !inQ; cur += ch; }
    else if (ch === "\n" && !inQ) { lines.push(cur); cur = ""; }
    else { cur += ch; }
  }
  if (cur) lines.push(cur);

  const splitLine = (line) => {
    const cols = [];
    let field = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (q && line[i + 1] === '"') { field += '"'; i++; }
        else { q = !q; }
      } else if (ch === "," && !q) {
        cols.push(field);
        field = "";
      } else {
        field += ch;
      }
    }
    cols.push(field);
    return cols;
  };

  let headerIdx = -1;
  let headers = [];
  for (let i = 0; i < lines.length; i++) {
    const cols = splitLine(lines[i].replace(/\r$/, ""));
    const lower = cols.map((h) => h.toLowerCase().trim());
    if (lower.some((h) => h.includes("email") || h.includes("i am a"))) {
      headerIdx = i;
      headers = cols.map((h) => h.trim());
      break;
    }
  }
  if (headerIdx === -1) throw new Error("Could not find header row in CSV");

  const idx = (re) => headers.findIndex((h) => re.test(h.toLowerCase()));
  const colRole  = idx(/i am a/);
  const colFN    = idx(/^name - first name$/);
  const colLN    = idx(/^name - last name$/);
  const colDate  = idx(/^date$/);
  const colCerem = idx(/ceremony venue/);
  const colRecep = idx(/reception venue/);
  const colPFN   = idx(/partner.*first name/);
  const colPLN   = idx(/partner.*last name/);

  const allEmailIdx = headers.reduce((acc, h, i) =>
    /^email$/.test(h.toLowerCase().trim()) ? [...acc, i] : acc, []);
  const emailIdx = allEmailIdx[0] ?? -1;

  const rows = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = splitLine(lines[i].replace(/\r$/, ""));
    if (cols.every((ch) => !ch.trim())) continue;

    rows.push({
      email:           clean(cols[emailIdx] ?? "").toLowerCase(),
      firstName:       clean(cols[colFN]    ?? ""),
      lastName:        clean(cols[colLN]    ?? ""),
      role:            clean(cols[colRole]  ?? ""),
      partnerFirstName: clean(cols[colPFN] ?? ""),
      partnerLastName:  clean(cols[colPLN] ?? ""),
      weddingDate:     /^\d{4}-\d{2}-\d{2}$/.test(clean(cols[colDate] ?? ""))
                         ? clean(cols[colDate] ?? "") : null,
      ceremonyVenue:   clean(cols[colCerem] ?? "") || null,
      receptionVenue:  clean(cols[colRecep] ?? "") || null,
    });
  }
  return rows;
}

// ─── Email Template ───────────────────────────────────────────────────────────

function buildWelcomeEmail(firstName, resetUrl) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Themes &amp; Motifs</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-spacing: 0; border-collapse: collapse; }
    td { padding: 0; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f4; padding-bottom: 40px; }
    .main-table { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #ffffff; padding: 40px 0 20px; text-align: center; border-bottom: 3px solid #C5A059; }
    .logo-text { font-family: 'Georgia', serif; font-size: 28px; color: #333333; letter-spacing: 1px; text-transform: uppercase; text-decoration: none; }
    .content { padding: 40px; text-align: center; color: #555555; }
    .h1 { font-family: 'Georgia', serif; font-size: 24px; color: #333333; margin-bottom: 20px; }
    .text { font-size: 16px; line-height: 24px; margin-bottom: 30px; }
    .btn-container { margin: 30px 0; }
    .btn { background-color: #C5A059; color: #ffffff !important; display: inline-block; padding: 14px 30px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 4px; }
    .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999999; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" align="center">
      <tr>
        <td class="header">
          <a href="${SITE_URL}" class="logo-text">Themes &amp; Motifs</a>
        </td>
      </tr>
      <tr>
        <td class="content">
          <h1 class="h1">Welcome to the Philippines' Premier Wedding Marketplace</h1>
          <p class="text">
            Hi ${firstName || "there"}! Your account on Themes &amp; Motifs has been created.<br><br>
            We registered you using the information you shared at our bridal fair.
            To access your account and start planning your dream wedding,
            please set your password by clicking the button below.
          </p>
          <div class="btn-container">
            <a href="${resetUrl}" class="btn">Set My Password</a>
          </div>
          <p class="text" style="font-size: 14px; margin-top: 30px;">
            If the button above doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #C5A059; word-break: break-all;">${resetUrl}</a>
          </p>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p>You received this email because you registered at a Themes &amp; Motifs Bridal Fair.</p>
          <p>&copy; ${new Date().getFullYear()} Themes &amp; Motifs. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

// ─── Concurrency Limiter ──────────────────────────────────────────────────────

async function pLimit(tasks, limit) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

// ─── Modes ────────────────────────────────────────────────────────────────────

/** --show-log: print a summary of the email log and exit */
function showLog() {
  const emailLog = loadEmailLog();
  const entries  = Object.entries(emailLog);
  if (entries.length === 0) {
    console.log("\nNo emails recorded in emailed-log.json yet.\n");
    return;
  }

  // Group by source and date
  const bySource = {};
  for (const [email, data] of entries) {
    const src = data.source ?? "script";
    if (!bySource[src]) bySource[src] = [];
    bySource[src].push({ email, ...data });
  }

  console.log(`\n${c.bold}╔══════════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.bold}║   Email Log Summary                          ║${c.reset}`);
  console.log(`${c.bold}╠══════════════════════════════════════════════╣${c.reset}`);
  console.log(`${c.bold}║${c.reset}  ${c.green}Total emailed: ${String(entries.length).padEnd(29)}${c.reset}${c.bold}║${c.reset}`);
  for (const [src, items] of Object.entries(bySource)) {
    console.log(`${c.bold}║${c.reset}  ${c.dim}Source "${src}": ${String(items.length).padEnd(27)}${c.reset}${c.bold}║${c.reset}`);
  }
  console.log(`${c.bold}╚══════════════════════════════════════════════╝${c.reset}`);

  // Show last 10
  const last10 = entries.slice(-10).reverse();
  console.log(`\n${c.dim}Last 10 emailed:${c.reset}`);
  for (const [email, data] of last10) {
    const date = new Date(data.emailedAt).toLocaleString("en-PH", { timeZone: "Asia/Manila" });
    console.log(`  ${c.green}✓${c.reset} ${email.padEnd(40)} ${c.dim}${date}${c.reset}`);
  }
  console.log(`\n${c.dim}Full log: ${EMAIL_LOG_PATH}${c.reset}\n`);
}

/** --mark-sent: backfill already-sent emails into the log */
async function markSentMode() {
  const isFromDb = args.includes("--from-db");
  const emailLog = loadEmailLog();
  let added = 0;
  let already = 0;

  if (isFromDb) {
    console.log(`\n${c.cyan}⟳  Fetching existing users from DB to mark as emailed...${c.reset}`);
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: existingUsers, error: existErr } = await supabase
      .from("users")
      .select("email")
      .eq("role", "soon_to_wed");

    if (existErr) {
      log("✗", c.red, `Failed to fetch existing users: ${existErr.message}`);
      process.exit(1);
    }

    const emailsToMark = (existingUsers ?? []).map(u => u.email).filter(Boolean);
    for (const email of emailsToMark) {
      const key = email.toLowerCase();
      if (emailLog[key]) {
        already++;
      } else {
        markEmailed(emailLog, key, "", "backfill-existing-db");
        added++;
      }
    }
    console.log(`  Fetched ${emailsToMark.length} STW users from DB.`);
  } else {
    // Emails to mark come from args after --mark-sent
    const markSentIdx = args.indexOf("--mark-sent");
    const emailsToMark = args
      .slice(markSentIdx + 1)
      .filter((a) => !a.startsWith("--") && isEmail(a));

    if (emailsToMark.length === 0) {
      // If no emails passed, show usage
      console.error(`\n${c.red}Usage: node import-stw-users.mjs --mark-sent email1@x.com email2@x.com ...${c.reset}`);
      console.error(`\nOr to mark ALL accounts that already exist in the DB as emailed, run without emails:`);
      console.error(`  node import-stw-users.mjs --mark-sent --from-db\n`);
      process.exit(1);
    }

    for (const email of emailsToMark) {
      const key = email.toLowerCase();
      if (emailLog[key]) {
        already++;
        console.log(`${c.dim}  already logged: ${email}${c.reset}`);
      } else {
        markEmailed(emailLog, key, "", "manual");
        added++;
        log("  ✓", c.green, `marked as sent: ${email}`);
      }
    }
  }

  saveEmailLog(emailLog);
  console.log(`\n${c.green}Done.${c.reset} ${added} added, ${already} already in log.\n`);
}

// ─── Main Import ──────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${c.bold}╔══════════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.bold}║   Themes & Motifs — STW Bulk Importer        ║${c.reset}`);
  console.log(`${c.bold}╚══════════════════════════════════════════════╝${c.reset}\n`);

  // ── Handle special modes ──
  if (SHOW_LOG)  { showLog();            return; }
  if (MARK_SENT) { await markSentMode(); return; }

  if (DRY_RUN) {
    console.log(`${c.yellow}⚠  DRY RUN MODE — no users will be created or emailed${c.reset}\n`);
  }

  // Validate config
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error(`${c.red}✗ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env${c.reset}`);
    process.exit(1);
  }
  if (!SMTP_USER || !SMTP_PASS) {
    console.error(`${c.red}✗ Missing SMTP_USER or SMTP_PASS in .env${c.reset}`);
    process.exit(1);
  }
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`${c.red}✗ CSV not found: ${CSV_PATH}${c.reset}`);
    process.exit(1);
  }

  console.log(`${c.dim}CSV:         ${CSV_PATH}${c.reset}`);
  console.log(`${c.dim}Concurrency: ${CONCURRENCY}${c.reset}`);
  console.log(`${c.dim}Site URL:    ${SITE_URL}${c.reset}\n`);

  // ── Load email log ──
  const emailLog = loadEmailLog();
  const alreadyEmailed = new Set(Object.keys(emailLog));
  console.log(`${c.blue}📋 Email log: ${alreadyEmailed.size} address${alreadyEmailed.size !== 1 ? "es" : ""} already emailed (will be skipped)${c.reset}\n`);

  // ── Parse CSV ──
  console.log(`${c.cyan}⟳  Parsing CSV…${c.reset}`);
  const rawRows = parseCSV(fs.readFileSync(CSV_PATH, "utf-8"));
  console.log(`   ${rawRows.length} total rows read`);

  const stwRows   = rawRows.filter((r) => isStw(r.role));
  const validRows = stwRows.filter((r) => isEmail(r.email));
  const invalid   = stwRows.length - validRows.length;
  const nonStw    = rawRows.length - stwRows.length;

  if (invalid > 0) console.log(`   ${c.yellow}${invalid} skipped — invalid email${c.reset}`);
  if (nonStw  > 0) console.log(`   ${c.dim}${nonStw} skipped — non-STW role${c.reset}`);

  // Deduplicate by email
  const seen = new Set();
  const dedupedRows = validRows.filter((r) => {
    if (seen.has(r.email)) return false;
    seen.add(r.email);
    return true;
  });
  const dupes = validRows.length - dedupedRows.length;
  if (dupes > 0) console.log(`   ${c.dim}${dupes} deduplicated (same email twice in CSV)${c.reset}`);

  console.log(`\n${c.bold}→  ${dedupedRows.length} users to process${c.reset}\n`);

  if (dedupedRows.length === 0) {
    console.log("Nothing to import.");
    return;
  }

  // ── Init clients ──
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const mailer = nodemailer.createTransport({
    host:   SMTP_HOST,
    port:   SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth:   { user: SMTP_USER, pass: SMTP_PASS },
  });

  if (!DRY_RUN) {
    try {
      await mailer.verify();
      log("✓", c.green, "SMTP connection verified");
    } catch (err) {
      log("✗", c.red, `SMTP connection failed: ${err.message}`);
      process.exit(1);
    }
  }

  // ── Pre-fetch existing DB emails ──
  console.log(`\n${c.cyan}⟳  Checking existing accounts…${c.reset}`);
  const { data: existingUsers, error: existErr } = await supabase
    .from("users").select("email");
  if (existErr) {
    log("✗", c.red, `Failed to fetch existing users: ${existErr.message}`);
    process.exit(1);
  }
  const existingEmails = new Set(
    (existingUsers ?? []).map((u) => (u.email ?? "").toLowerCase())
  );
  console.log(`   ${existingEmails.size} existing accounts in DB\n`);

  // ── Process ──
  const results = { imported: 0, skipped: 0, alreadyEmailed: 0, emailFailed: 0, errors: [] };
  let done = 0;
  const total = dedupedRows.length;

  const tasks = dedupedRows.map((row) => async () => {
    const email = row.email;
    const num   = ++done;
    const tag   = `[${String(num).padStart(String(total).length, " ")}/${total}]`;

    // ① Skip if already emailed (tracked in log)
    if (alreadyEmailed.has(email)) {
      log(`${tag} 📧`, c.blue, `${c.dim}${email}  (already emailed, skipped)${c.reset}`);
      results.alreadyEmailed++;
      return;
    }

    if (DRY_RUN) {
      log(`${tag} ◎`, c.cyan, `${email}  ${c.dim}[dry run]${c.reset}`);
      results.imported++;
      return;
    }

    const accountExists = existingEmails.has(email);

    try {
      if (!accountExists) {
        // 1. Create Supabase Auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          email_confirm: false,
          user_metadata: { first_name: row.firstName, last_name: row.lastName },
        });

        if (authError) {
          if (authError.message?.toLowerCase().includes("already") ||
              authError.message?.toLowerCase().includes("duplicate")) {
            // Edge case: in Auth but not public.users
            throw new Error(`Auth exists but not in public DB`);
          }
          throw new Error(`Auth: ${authError.message}`);
        }

        const userId = authData.user.id;

        // 2. Insert into public.users
        const { error: userErr } = await supabase.from("users").insert({
          id: userId, email, role: "soon_to_wed",
          is_active: true, is_archived: false, email_verified: false,
        });
        if (userErr && !userErr.message?.toLowerCase().includes("duplicate")) {
          throw new Error(`DB users: ${userErr.message}`);
        }

        // 3. Upsert soon_to_wed_profiles
        const isBride = row.role.toLowerCase().startsWith("bride");
        const { error: profileErr } = await supabase
          .from("soon_to_wed_profiles")
          .upsert({
            user_id:           userId,
            bride_nickname:    (isBride ? row.firstName : row.partnerFirstName) || null,
            bride_last_name:   (isBride ? row.lastName  : row.partnerLastName)  || null,
            groom_nickname:    (isBride ? row.partnerFirstName : row.firstName) || null,
            groom_last_name:   (isBride ? row.partnerLastName  : row.lastName)  || null,
            wedding_date:       row.weddingDate    || null,
            wedding_venue_area: row.ceremonyVenue  || null,
            notes:              row.receptionVenue ? `Reception: ${row.receptionVenue}` : null,
          }, { onConflict: "user_id" });

        if (profileErr) {
          console.warn(`  ${c.yellow}⚠ Profile upsert failed for ${email}: ${profileErr.message}${c.reset}`);
        }
      }

      // 4. Generate password reset link
      const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
        type: "recovery", email,
        options: { redirectTo: `${SITE_URL}/reset-password` },
      });

      if (linkErr || !linkData?.properties?.action_link) {
        console.warn(`  ${c.yellow}⚠ Reset link failed for ${email}: ${linkErr?.message ?? "no link"}${c.reset}`);
        log(`${tag} ⤼`, c.dim, `${email}  ${c.dim}(account created, but link failed)${c.reset}`);
        results.emailFailed++;
        return;
      }

      // 5. Send welcome email
      try {
        await mailer.sendMail({
          from:    `"Themes & Motifs" <${SMTP_FROM}>`,
          to:      email,
          subject: "Welcome to Themes & Motifs – Set Your Password",
          html:    buildWelcomeEmail(row.firstName, linkData.properties.action_link),
        });

        // ✅ Record as emailed immediately after successful send
        markEmailed(emailLog, email, row.firstName, "script");
        saveEmailLog(emailLog); // save after every successful email (crash-safe)

        log(`${tag} ✓`, c.green, `${email} ${accountExists ? c.dim + "(retry email only)" : ""}${c.reset}`);
      } catch (mailErr) {
        console.warn(`  ${c.yellow}⚠ Email failed for ${email}: ${mailErr.message}${c.reset}`);
        results.emailFailed++;
        log(`${tag} ⤼`, c.dim, `${email}  ${c.dim}(account ready, but email failed to send)${c.reset}`);
      }

      results.imported++;
    } catch (err) {
      log(`${tag} ✗`, c.red, `${email}  — ${err.message}`);
      results.errors.push({ email, reason: err.message });
    }
  });

  await pLimit(tasks, CONCURRENCY);

  // ── Summary ──
  console.log(`\n${c.bold}╔══════════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.bold}║   Import Complete                            ║${c.reset}`);
  console.log(`${c.bold}╠══════════════════════════════════════════════╣${c.reset}`);
  console.log(`${c.bold}║${c.reset}  ${c.green}✓ Imported:        ${String(results.imported).padEnd(25)}${c.reset}${c.bold}║${c.reset}`);
  console.log(`${c.bold}║${c.reset}  ${c.blue}📧 Already emailed: ${String(results.alreadyEmailed).padEnd(24)}${c.reset}${c.bold}║${c.reset}`);
  console.log(`${c.bold}║${c.reset}  ${c.dim}⤼ Skipped (DB):    ${String(results.skipped).padEnd(24)}${c.reset}${c.bold}║${c.reset}`);
  if (results.emailFailed > 0)
    console.log(`${c.bold}║${c.reset}  ${c.yellow}⚠ Email failed:    ${String(results.emailFailed).padEnd(24)}${c.reset}${c.bold}║${c.reset}`);
  if (results.errors.length > 0)
    console.log(`${c.bold}║${c.reset}  ${c.red}✗ Errors:          ${String(results.errors.length).padEnd(24)}${c.reset}${c.bold}║${c.reset}`);
  const totalLogged = Object.keys(emailLog).length;
  console.log(`${c.bold}╠══════════════════════════════════════════════╣${c.reset}`);
  console.log(`${c.bold}║${c.reset}  ${c.blue}Total in email log: ${String(totalLogged).padEnd(24)}${c.reset}${c.bold}║${c.reset}`);
  console.log(`${c.bold}╚══════════════════════════════════════════════╝${c.reset}`);

  // ── Write run log ──
  const logPath = path.join(__dirname, "import-results.json");
  fs.writeFileSync(logPath, JSON.stringify({
    runAt: new Date().toISOString(), dryRun: DRY_RUN, csvPath: CSV_PATH,
    total, ...results,
  }, null, 2));
  console.log(`\n${c.dim}Run log:   ${logPath}${c.reset}`);
  console.log(`${c.dim}Email log: ${EMAIL_LOG_PATH}${c.reset}\n`);
}

main().catch((err) => {
  console.error(`\n${c.red}Fatal error: ${err.message}${c.reset}`);
  process.exit(1);
});
