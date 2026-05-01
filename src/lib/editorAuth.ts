import { createSupabaseAdminClient } from "./supabaseAdmin";
import { getSupabaseAuthToken, getSuperadminTokenFromRequest } from "./superadminAuth";

export type AuthResult =
  | { type: "superadmin"; superadminId: string; userId: string }
  | { type: "editor"; userId: string; editorId: string }
  | null;

/**
 * Check superadmin via Supabase Auth
 */
async function getSuperadminAuth(req: Request): Promise<AuthResult> {
  const token = getSupabaseAuthToken(req);
  if (!token) return null;

  const supabase = createSupabaseAdminClient();

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return null;

    // Check if this user is linked to a superadmin record
    const { data: superadminData } = await supabase
      .from("superadmins")
      .select("id, auth_user_id")
      .eq("auth_user_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle<{ id: string; auth_user_id: string }>();

    if (superadminData) {
      return { type: "superadmin", superadminId: superadminData.id, userId: user.id };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Legacy: Check superadmin via custom session
 * @deprecated Use getSuperadminAuth instead
 */
async function getSuperadminLegacyAuth(req: Request): Promise<AuthResult> {
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

  if (data) {
    return { type: "superadmin", superadminId: data.superadmin_id, userId: "" };
  }

  return null;
}

/**
 * Checks if the request is from a superadmin OR an editor.
 * Returns the auth context if authorized, null otherwise.
 */
export async function getAdminOrEditorAuth(req: Request): Promise<AuthResult> {
  // First check if it's a superadmin via Supabase Auth
  const superadminAuth = await getSuperadminAuth(req);
  if (superadminAuth) {
    return superadminAuth;
  }

  // Fallback to legacy superadmin session
  const legacySuperadmin = await getSuperadminLegacyAuth(req);
  if (legacySuperadmin) {
    return legacySuperadmin;
  }

  // Check for editor session (via Supabase auth cookie or Authorization header)
  const cookieHeader = req.headers.get("cookie") ?? "";
  let supabaseToken = findSupabaseToken(cookieHeader);

  // Also try Authorization header (bearer token)
  if (!supabaseToken) {
    const authHeader = req.headers.get("authorization") ?? "";
    if (authHeader.startsWith("Bearer ")) {
      supabaseToken = authHeader.slice(7);
    }
  }

  if (supabaseToken) {
    try {
      const supabase = createSupabaseAdminClient();
      // Verify the token and get user
      const { data: { user }, error } = await supabase.auth.getUser(supabaseToken);
      if (user && !error) {
        // Check if this user is an editor (any entry in editors table)
        const { data: editorData } = await supabase
          .from("editors")
          .select("id")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle<{ id: string }>();

        if (editorData) {
          return { type: "editor", userId: user.id, editorId: editorData.id };
        }
      }
    } catch {
      // Auth check failed
    }
  }
  return null;
}

/**
 * Asserts that the request is from a superadmin or editor.
 * Throws 401 error if not authorized.
 */
export async function assertAdminOrEditorRequest(req: Request): Promise<AuthResult> {
  const auth = await getAdminOrEditorAuth(req);
  if (!auth) {
    const err = new Error("Unauthorized") as Error & { statusCode?: number };
    err.statusCode = 401;
    throw err;
  }
  return auth;
}

/**
 * Asserts that the request is from a superadmin only.
 */
export async function assertSuperadminOnly(req: Request): Promise<{ superadminId: string }> {
  const auth = await getAdminOrEditorAuth(req);

  if (!auth || auth.type !== "superadmin") {
    const err = new Error("Unauthorized - Superadmin access required") as Error & { statusCode?: number };
    err.statusCode = 401;
    throw err;
  }

  return { superadminId: auth.superadminId };
}

export function parseCookies(cookieHeader: string): Record<string, string> {
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

export function findSupabaseToken(cookieHeader: string): string | null {
  const cookies = parseCookies(cookieHeader);

  for (const [name, value] of Object.entries(cookies)) {
    if (!name.startsWith("sb-") || !name.includes("-auth-token")) continue;

    try {
      if (value.startsWith("base64-")) {
        const base64Data = value.slice(7);
        const decoded = globalThis.atob(base64Data);
        const parsed = JSON.parse(decoded);
        if (parsed.access_token) return parsed.access_token;
      } else {
        const parsed = JSON.parse(value);
        if (parsed.access_token) return parsed.access_token;
      }
    } catch {
      // Fall through
    }

    // Some configs may store a raw access token string here
    return value;
  }

  return null;
}
