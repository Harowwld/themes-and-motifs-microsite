import { createSupabaseAdminClient } from "./supabaseAdmin";
import { getSuperadminTokenFromRequest } from "./superadminAuth";

export type AuthResult =
  | { type: "superadmin"; superadminId: string }
  | { type: "editor"; userId: string; editorId: string }
  | null;

/**
 * Checks if the request is from a superadmin OR an editor.
 * Returns the auth context if authorized, null otherwise.
 */
export async function getAdminOrEditorAuth(req: Request): Promise<AuthResult> {
  // First check if it's a superadmin
  const token = getSuperadminTokenFromRequest(req);

  if (token) {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("superadmin_sessions")
      .select("id,superadmin_id,expires_at")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .maybeSingle<{ id: string; superadmin_id: string; expires_at: string }>();

    if (data) {
      return { type: "superadmin", superadminId: data.superadmin_id };
    }
  }

  // Check for editor session (via Supabase auth cookie)
  // Supabase uses cookie names like: sb-<project-ref>-auth-token
  const cookieHeader = req.headers.get("cookie") ?? "";
  const supabaseToken = findSupabaseToken(cookieHeader);

  if (supabaseToken) {
    try {
      const supabase = createSupabaseAdminClient();
      // Verify the token and get user
      const { data: { user }, error } = await supabase.auth.getUser(supabaseToken);

      if (user && !error) {
        // Check if this user is an editor (global editor with null vendor_id)
        const { data: editorData } = await supabase
          .from("editors")
          .select("id, can_edit_entries")
          .eq("user_id", user.id)
          .is("vendor_id", null)
          .eq("can_edit_entries", true)
          .limit(1)
          .maybeSingle<{ id: string; can_edit_entries: boolean }>();

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

function parseCookies(cookieHeader: string): Record<string, string> {
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

function findSupabaseToken(cookieHeader: string): string | null {
  const cookies = parseCookies(cookieHeader);
  for (const [name, value] of Object.entries(cookies)) {
    if (name.startsWith("sb-") && (name.endsWith("-auth-token") || name === "sb-access-token")) {
      return value;
    }
  }
  return null;
}
