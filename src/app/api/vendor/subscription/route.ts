import { assertVendor, getVendorForUser } from "../_auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const body = await req.json();

    if (typeof body.verification_doc_url !== "string") {
      return Response.json({ error: "Missing verification_doc_url" }, { status: 400 });
    }

    // Upsert subscription
    const { data: sub, error: selectErr } = await supabase
      .from("vendor_subscriptions")
      .select("id")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (selectErr && selectErr.code !== 'PGRST116') {
      return Response.json({ error: selectErr.message }, { status: 500 });
    }

    let result;
    if (sub) {
      const { data, error } = await supabase
        .from("vendor_subscriptions")
        .update({ verification_doc_url: body.verification_doc_url, updated_at: new Date().toISOString() })
        .eq("id", sub.id)
        .select()
        .single();
      if (error) return Response.json({ error: error.message }, { status: 500 });
      result = data;
    } else {
      const { data, error } = await supabase
        .from("vendor_subscriptions")
        .insert({
          vendor_id: vendor.id,
          verification_doc_url: body.verification_doc_url,
          status: 'pending_verification'
        })
        .select()
        .single();
      if (error) return Response.json({ error: error.message }, { status: 500 });
      result = data;
    }

    return Response.json({ subscription: result }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
