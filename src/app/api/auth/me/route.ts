import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const cache = new Map<string, { data: ReturnType<typeof getResponse>; timestamp: number }>();
const CACHE_TTL_MS = 30_000;

type AccountType = "vendor" | "couple" | "editor" | "superadmin" | null;

function getAccountType(role: string | null, isVendor: boolean): AccountType {
  if (isVendor) return "vendor";
  const r = String(role ?? "").trim().toLowerCase();
  if (r === "soon_to_wed") return "couple";
  if (r === "editor") return "editor";
  if (r === "admin" || r === "superadmin") return "superadmin";
  return null;
}

function getResponse(
  userId: string,
  email: string | null,
  vendorId: number | null,
  role: string | null,
  isSuperadmin: boolean
) {
  const isVendor = Boolean(vendorId);
  const isSoonToWed = String(role ?? "").trim().toLowerCase() === "soon_to_wed";
  const accountType: AccountType = isSuperadmin ? "superadmin" : getAccountType(role, isVendor);

  return {
    user: { id: userId, email },
    email,
    accountType,
    isVendor,
    isSoonToWed,
    isSuperadmin,
  };
}

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") ?? "";
    const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";

    if (!token) {
      return NextResponse.json(
        { user: null, email: null, accountType: null, isVendor: false, isSoonToWed: false, isSuperadmin: false },
        { status: 200 }
      );
    }

    const cached = cache.get(token);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data, { status: 200 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      cache.delete(token);
      return NextResponse.json(
        { user: null, email: null, accountType: null, isVendor: false, isSoonToWed: false, isSuperadmin: false },
        { status: 200 }
      );
    }

    const user = data.user;

    // Check for superadmin
    const { data: superadminData } = await supabase
      .from("superadmins")
      .select("id")
      .eq("auth_user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();
    const isSuperadmin = Boolean(superadminData);

    // Check for editor (only if not superadmin)
    let isEditor = false;
    if (!isSuperadmin) {
      const { data: editorData } = await supabase
        .from("editors")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      isEditor = Boolean(editorData);
    }

    const { data: combinedData, error: combinedError } = await supabase.rpc("get_user_vendor_role", {
      p_user_id: user.id,
    });

    let vendorId: number | null = null;
    let role: string | null = null;

    if (!combinedError && combinedData) {
      // Function returns TABLE which comes as an array of rows
      const row = Array.isArray(combinedData) ? combinedData[0] : combinedData;
      vendorId = row?.vendor_id ?? null;
      role = row?.role ?? null;
    }

    // Override role for editor if found
    if (isEditor && !role) {
      role = "editor";
    }

    const response = getResponse(user.id, user.email ?? null, vendorId, role, isSuperadmin);
    cache.set(token, { data: response, timestamp: Date.now() });

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      { user: null, email: null, accountType: null, isVendor: false, isSoonToWed: false, isSuperadmin: false },
      { status: 200 }
    );
  }
}
