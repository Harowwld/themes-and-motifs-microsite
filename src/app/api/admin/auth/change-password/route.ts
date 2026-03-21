import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "../../../../../lib/supabaseAdmin";
import { assertSuperadminRequest, getSuperadminTokenFromRequest } from "../../../../../lib/superadminAuth";

export async function POST(req: Request) {
  try {
    const { superadminId } = await assertSuperadminRequest(req);

    const body = (await req.json().catch(() => null)) as any;
    const currentPassword = String(body?.current_password ?? "");
    const newPassword = String(body?.new_password ?? "");

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new passwords are required." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { data: adminRow, error: fetchErr } = await supabase
      .from("superadmins")
      .select("id,password_hash")
      .eq("id", superadminId)
      .maybeSingle<{ id: string; password_hash: string }>();

    if (fetchErr || !adminRow) {
      return NextResponse.json({ error: fetchErr?.message ?? "Superadmin not found." }, { status: 404 });
    }

    const { data: ok, error: verifyErr } = await supabase.rpc("superadmin_verify_password", {
      p_superadmin_id: superadminId,
      p_password: currentPassword,
    });

    if (verifyErr) {
      return NextResponse.json({ error: verifyErr.message }, { status: 500 });
    }

    if (!ok) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    const { error: updErr } = await supabase.rpc("superadmin_change_password", {
      p_superadmin_id: superadminId,
      p_new_password: newPassword,
    });

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    const token = getSuperadminTokenFromRequest(req);
    if (token) {
      await supabase.from("superadmin_sessions").delete().eq("superadmin_id", superadminId).neq("token", token);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
