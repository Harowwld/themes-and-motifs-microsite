import { createSupabaseAdminClient } from "../../../../../../lib/supabaseAdmin";
import { assertAdminOrEditorRequest } from "../../../../../../lib/editorAuth";
import { createErrorResponse } from "../../../../../../lib/errors";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminOrEditorRequest(req);

    const { id } = await params;
    const vendorId = Number(id);
    if (!Number.isFinite(vendorId)) {
      return Response.json({ error: "Invalid vendor ID" }, { status: 400 });
    }

    const body = (await req.json().catch(() => null)) ?? {};
    if (typeof body.expiry_date !== "undefined" && typeof body.expiry_date !== "string" && body.expiry_date !== null) {
      return Response.json({ error: "Invalid expiry_date" }, { status: 400 });
    }
    if (typeof body.tin !== "undefined" && typeof body.tin !== "string" && body.tin !== null) {
      return Response.json({ error: "Invalid tin" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Check if subscription exists
    const { data: sub } = await supabase
      .from("vendor_subscriptions")
      .select("id")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const patchObj: any = { updated_at: new Date().toISOString() };
    if (typeof body.expiry_date !== "undefined") {
      patchObj.expiry_date = body.expiry_date;
    }
    if (typeof body.tin !== "undefined") {
      patchObj.tin = body.tin;
    }

    let result;
    if (sub) {
      const { data, error } = await supabase
        .from("vendor_subscriptions")
        .update(patchObj)
        .eq("id", sub.id)
        .select()
        .single();
      if (error) return createErrorResponse(error, 500, { source: "admin_subscription_update", vendorId });
      result = data;
    } else {
      const insertObj: any = {
        vendor_id: vendorId,
        status: 'pending_verification'
      };
      if (typeof body.expiry_date !== "undefined") {
        insertObj.expiry_date = body.expiry_date;
      }
      if (typeof body.tin !== "undefined") {
        insertObj.tin = body.tin;
      }

      const { data, error } = await supabase
        .from("vendor_subscriptions")
        .insert(insertObj)
        .select()
        .single();
      if (error) return createErrorResponse(error, 500, { source: "admin_subscription_insert", vendorId });
      result = data;
    }

    return Response.json({ subscription: result }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return createErrorResponse(e, status, { source: "admin_subscription_patch", vendorId: (await params).id });
  }
}
