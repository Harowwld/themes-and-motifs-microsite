import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const cache = new Map<string, { data: ReturnType<typeof getResponse>; timestamp: number }>();
const CACHE_TTL_MS = 30_000;

function getResponse(userId: string, email: string | null, vendorId: number | null, role: string | null) {
  return {
    user: { id: userId, email },
    isVendor: Boolean(vendorId),
    isSoonToWed: String(role ?? "").trim().toLowerCase() === "soon_to_wed",
  };
}

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") ?? "";
    const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";

    if (!token) {
      return NextResponse.json({ user: null, isVendor: false, isSoonToWed: false }, { status: 200 });
    }

    const cached = cache.get(token);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data, { status: 200 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      cache.delete(token);
      return NextResponse.json({ user: null, isVendor: false, isSoonToWed: false }, { status: 200 });
    }

    const user = data.user;

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

    const response = getResponse(user.id, user.email ?? null, vendorId, role);
    cache.set(token, { data: response, timestamp: Date.now() });

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json({ user: null, isVendor: false, isSoonToWed: false }, { status: 200 });
  }
}
