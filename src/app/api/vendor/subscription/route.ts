import { assertVendor, getVendorForUser } from "../_auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const body = await req.json();

    const sec_doc_url = typeof body.sec_doc_url === "string" ? body.sec_doc_url.trim() : null;
    const dti_doc_url = typeof body.dti_doc_url === "string" ? body.dti_doc_url.trim() : null;
    const expiry_date = typeof body.expiry_date === "string" && body.expiry_date.trim() !== "" ? body.expiry_date.trim() : null;
    const tin = typeof body.tin === "string" ? body.tin.trim() : null;
    const verification_doc_url = sec_doc_url || dti_doc_url || (typeof body.verification_doc_url === "string" ? body.verification_doc_url.trim() : null);

    if (!sec_doc_url && !dti_doc_url && !verification_doc_url) {
      return Response.json({ error: "At least one document (SEC Certificate or DTI Registration) is required." }, { status: 400 });
    }

    if (!expiry_date) {
      return Response.json({ error: "Document expiration date is required." }, { status: 400 });
    }

    if (!tin) {
      return Response.json({ error: "TIN is required." }, { status: 400 });
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
        .update({ 
          verification_doc_url, 
          sec_doc_url, 
          dti_doc_url, 
          expiry_date, 
          tin,
          updated_at: new Date().toISOString() 
        })
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
          verification_doc_url,
          sec_doc_url,
          dti_doc_url,
          expiry_date,
          tin,
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
