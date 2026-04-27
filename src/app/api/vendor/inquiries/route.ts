import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { assertVendor, getVendorForUser } from "../_auth";

export async function GET(req: Request) {
  try {
    const { user } = await assertVendor(req);
    const supabase = createSupabaseAdminClient();
    const vendor = await getVendorForUser(supabase, user.id);
    const vendorId = vendor.id;

    const { searchParams } = new URL(req.url);
    const limitRaw = searchParams.get("limit");
    const limit = Math.max(1, Math.min(500, Number(limitRaw ?? 200) || 200));

    const { data, error } = await supabase
      .from("inquiries")
      .select("id,vendor_id,user_id,name,email,phone,wedding_date,message,status,created_at,updated_at")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ inquiries: data ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const { user } = await assertVendor(req);
    const supabase = createSupabaseAdminClient();
    const vendor = await getVendorForUser(supabase, user.id);
    const vendorId = vendor.id;

    const body = (await req.json().catch(() => null)) as any;
    const id = Number(body?.id);

    if (!Number.isFinite(id)) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const patch: Record<string, any> = {};
    if (typeof body?.status === "string") patch.status = body.status;

    if (Object.keys(patch).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }
    
    // Verify the inquiry belongs to this vendor
    const { data: existing } = await supabase
      .from("inquiries")
      .select("id")
      .eq("id", id)
      .eq("vendor_id", vendorId)
      .single();
    
    if (!existing) {
      return Response.json({ error: "Inquiry not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("inquiries")
      .update(patch)
      .eq("id", id)
      .eq("vendor_id", vendorId)
      .select("id,vendor_id,user_id,name,email,phone,wedding_date,message,status,created_at,updated_at")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ inquiry: data }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
