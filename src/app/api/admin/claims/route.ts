import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { assertSuperadminRequest } from "../../../../lib/superadminAuth";

export async function GET(req: Request) {
  try {
    await assertSuperadminRequest(req);

    const { searchParams } = new URL(req.url);
    const limitRaw = searchParams.get("limit");
    const statusFilter = searchParams.get("status");
    const limit = Math.max(1, Math.min(500, Number(limitRaw ?? 200) || 200));

    const supabase = createSupabaseAdminClient();

    let query = supabase
      .from("vendor_claims")
      .select("id,vendor_id,contact_email,contact_phone,business_name,status,admin_notes,documents,reviewed_by,reviewed_at,created_at,vendor:vendors(id,business_name,slug)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (statusFilter && ["pending", "approved", "rejected"].includes(statusFilter)) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ claims: data ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

type PatchBody =
  | { id: number; action: "approve"; admin_notes?: string | null }
  | { id: number; action: "reject"; admin_notes?: string | null };

export async function PATCH(req: Request) {
  try {
    await assertSuperadminRequest(req);

    const body = ((await req.json()) ?? {}) as PatchBody;

    if (typeof (body as any)?.id !== "number") {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    if ((body as any)?.action !== "approve" && (body as any)?.action !== "reject") {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { data: claim, error: claimErr } = await supabase
      .from("vendor_claims")
      .select("id,vendor_id,contact_email,status")
      .eq("id", body.id)
      .single();

    if (claimErr) {
      return Response.json({ error: claimErr.message }, { status: 500 });
    }

    if (!claim) {
      return Response.json({ error: "Claim not found" }, { status: 404 });
    }

    if (claim.status !== "pending") {
      return Response.json({ error: "Claim is not pending" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const adminNotes = typeof (body as any)?.admin_notes === "string" || (body as any)?.admin_notes === null ? (body as any).admin_notes : undefined;

    if (body.action === "reject") {
      const { data: updated, error: updErr } = await supabase
        .from("vendor_claims")
        .update({
          status: "rejected",
          admin_notes: adminNotes,
          reviewed_at: now,
        })
        .eq("id", body.id)
        .select("id,vendor_id,status")
        .single();

      if (updErr) {
        return Response.json({ error: updErr.message }, { status: 500 });
      }

      return Response.json({ claim: updated }, { status: 200 });
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", claim.contact_email)
      .maybeSingle();

    let userId = existingUser?.id;

    if (!userId) {
      const redirectTo = getRedirectTo();
      const inviteRes = await supabase.auth.admin.inviteUserByEmail(claim.contact_email, {
        redirectTo,
      });

      if (inviteRes.error || !inviteRes.data?.user?.id) {
        const message = inviteRes.error?.message ?? "";
        const looksLikeAlreadyExists = /already\s*(registered|exists)|user\s*already/i.test(message);

        if (!looksLikeAlreadyExists) {
          return Response.json({ error: inviteRes.error?.message ?? "Failed to invite user" }, { status: 500 });
        }

        const linkRes = await supabase.auth.admin.generateLink({
          type: "magiclink",
          email: claim.contact_email,
          options: { redirectTo },
        });

        if (linkRes.error || !linkRes.data?.user?.id) {
          return Response.json({ error: linkRes.error?.message ?? "Failed to generate login link" }, { status: 500 });
        }

        userId = linkRes.data.user.id;
      } else {
        userId = inviteRes.data.user.id;
      }

      await supabase.from("users").insert({
        id: userId,
        email: claim.contact_email,
        role: "supplier",
      });
    }

    const { data: vendor, error: vendorErr } = await supabase
      .from("vendors")
      .update({
        user_id: userId,
        verified_status: "pending",
      })
      .eq("id", claim.vendor_id)
      .select("id,slug")
      .single();

    if (vendorErr) {
      return Response.json({ error: vendorErr.message }, { status: 500 });
    }

    const { data: updated, error: updErr } = await supabase
      .from("vendor_claims")
      .update({
        status: "approved",
        user_id: userId,
        admin_notes: adminNotes,
        reviewed_at: now,
      })
      .eq("id", body.id)
      .select("id,vendor_id,status")
      .single();

    if (updErr) {
      return Response.json({ error: updErr.message }, { status: 500 });
    }

    return Response.json({ claim: updated, vendor }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

function getRedirectTo() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "").trim();
  if (!base) return undefined;
  const url = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${url}/vendor/signup`;
}
