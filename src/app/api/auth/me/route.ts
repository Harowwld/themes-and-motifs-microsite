import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") ?? "";
    const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";

    if (!token) {
      return NextResponse.json({ user: null, isVendor: false, isSoonToWed: false }, { status: 200 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return NextResponse.json({ user: null, isVendor: false, isSoonToWed: false }, { status: 200 });
    }

    const user = data.user;

    const [vendorRes, userRes] = await Promise.all([
      supabase.from("vendors").select("id").eq("user_id", user.id).maybeSingle<{ id: number }>(),
      supabase.from("users").select("role").eq("id", user.id).maybeSingle<{ role: string }>(),
    ]);

    const vendorRow = vendorRes.data ?? null;
    const appUserRow = userRes.data ?? null;

    return NextResponse.json(
      {
        user: { id: user.id, email: user.email ?? null },
        isVendor: Boolean(vendorRow?.id),
        isSoonToWed: String(appUserRow?.role ?? "").trim().toLowerCase() === "soon_to_wed",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ user: null, isVendor: false, isSoonToWed: false }, { status: 200 });
  }
}
