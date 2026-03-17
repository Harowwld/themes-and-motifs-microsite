import { createSupabaseAdminClient } from "./supabaseAdmin";

export const SUPERADMIN_COOKIE_NAME = "tm_superadmin";

function parseCookies(cookieHeader: string | null) {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (!k) continue;
    out[k] = decodeURIComponent(rest.join("=") ?? "");
  }
  return out;
}

export function getSuperadminTokenFromRequest(req: Request): string | null {
  const cookies = parseCookies(req.headers.get("cookie"));
  const raw = cookies[SUPERADMIN_COOKIE_NAME];
  if (!raw) return null;
  const v = String(raw).trim();
  return v ? v : null;
}

export async function assertSuperadminRequest(req: Request) {
  const token = getSuperadminTokenFromRequest(req);
  if (!token) {
    const err = new Error("Unauthorized") as Error & { statusCode?: number };
    err.statusCode = 401;
    throw err;
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("superadmin_sessions")
    .select("id,superadmin_id,expires_at")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle<{ id: string; superadmin_id: string; expires_at: string }>();

  if (error || !data) {
    const err = new Error("Unauthorized") as Error & { statusCode?: number };
    err.statusCode = 401;
    throw err;
  }

  return { sessionId: data.id, superadminId: data.superadmin_id };
}
