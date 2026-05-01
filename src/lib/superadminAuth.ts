import { createSupabaseAdminClient } from "./supabaseAdmin";

// Legacy cookie name - TO BE REMOVED after confirming all users migrated
// This was used for the custom session system before Supabase Auth migration
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

/**
 * Find Supabase Auth token from cookies
 * New @supabase/ssr uses base64-encoded JSON: base64-<base64encoded>
 * Old format was: sb-<project-ref>-auth-token (JSON containing access_token)
 */
function findSupabaseToken(cookieHeader: string): string | null {
  const cookies = parseCookies(cookieHeader);

  // Look for auth token cookies (sb-<ref>-auth-token)
  // New @supabase/ssr stores base64-encoded JSON with format: base64-<base64encoded>
  for (const [name, value] of Object.entries(cookies)) {
    if (name.startsWith("sb-") && name.includes("-auth-token")) {
      try {
        // Check if it's the new base64 format
        if (value.startsWith("base64-")) {
          const base64Data = value.slice(7); // Remove "base64-" prefix
          const decoded = globalThis.atob(base64Data);
          const parsed = JSON.parse(decoded);
          if (parsed.access_token) {
            return parsed.access_token;
          }
        } else {
          // Old format: direct JSON
          const parsed = JSON.parse(value);
          if (parsed.access_token) {
            return parsed.access_token;
          }
        }
      } catch {
        // Not valid format, return as-is (might be raw token)
      }
      return value;
    }
  }

  return null;
}

/**
 * Get Supabase Auth token from request (cookies or Authorization header)
 */
export function getSupabaseAuthToken(req: Request): string | null {
  // Try cookies first
  const cookieHeader = req.headers.get("cookie") ?? "";
  let token = findSupabaseToken(cookieHeader);

  // Also try Authorization header (bearer token)
  if (!token) {
    const authHeader = req.headers.get("authorization") ?? "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  return token;
}

/**
 * Legacy: Get custom superadmin token from request
 * @deprecated Use getSupabaseAuthToken instead
 */
export function getSuperadminTokenFromRequest(req: Request): string | null {
  const cookies = parseCookies(req.headers.get("cookie"));
  const raw = cookies[SUPERADMIN_COOKIE_NAME];
  if (!raw) return null;
  const v = String(raw).trim();
  return v ? v : null;
}

/**
 * Check if user is a superadmin via Supabase Auth
 * Returns superadmin record if authenticated, null otherwise
 */
export async function getSuperadminFromSupabaseAuth(req: Request): Promise<{ superadminId: string; userId: string } | null> {
  const token = getSupabaseAuthToken(req);
  if (!token) return null;

  const supabase = createSupabaseAdminClient();

  try {
    // Verify the token and get user
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return null;

    // Check if this user is linked to a superadmin record
    const { data: superadminData, error: superadminError } = await supabase
      .from("superadmins")
      .select("id, auth_user_id")
      .eq("auth_user_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle<{ id: string; auth_user_id: string }>();

    if (superadminError || !superadminData) {
      return null;
    }

    return { superadminId: superadminData.id, userId: user.id };
  } catch {
    return null;
  }
}

/**
 * Legacy: Check superadmin via custom session
 * @deprecated Use getSuperadminFromSupabaseAuth instead
 */
async function getSuperadminFromLegacySession(req: Request): Promise<{ superadminId: string; userId: string } | null> {
  const token = getSuperadminTokenFromRequest(req);
  if (!token) return null;

  const supabase = createSupabaseAdminClient();

  const { data } = await supabase
    .from("superadmin_sessions")
    .select("id,superadmin_id,expires_at")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle<{ id: string; superadmin_id: string; expires_at: string }>();

  if (!data) return null;

  // For legacy sessions, we don't have a userId from Supabase Auth
  return { superadminId: data.superadmin_id, userId: "" };
}

/**
 * Assert that the request is from a superadmin
 * Uses Supabase Auth only (legacy sessions removed after migration)
 */
export async function assertSuperadminRequest(req: Request): Promise<{ superadminId: string; userId: string }> {
  const supabaseAuth = await getSuperadminFromSupabaseAuth(req);
  if (supabaseAuth) {
    return supabaseAuth;
  }

  const err = new Error("Unauthorized") as Error & { statusCode?: number };
  err.statusCode = 401;
  throw err;
}

/**
 * Check if request is from an authenticated superadmin (for middleware/components)
 * Uses Supabase Auth only (legacy sessions removed after migration)
 */
export async function isSuperadminAuthenticated(req: Request): Promise<boolean> {
  const supabaseAuth = await getSuperadminFromSupabaseAuth(req);
  return !!supabaseAuth;
}
