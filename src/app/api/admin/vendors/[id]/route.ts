import { createSupabaseAdminClient } from "../../../../../lib/supabaseAdmin";
import { assertAdminOrEditorRequest } from "../../../../../lib/editorAuth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminOrEditorRequest(req);

    const { id } = await params;
    const vendorId = Number(id);
    if (!Number.isFinite(vendorId)) {
      return Response.json({ error: "Invalid vendor ID" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const [vendorRes, imagesRes, socialsRes, affiliationsRes, allAffiliationsRes] = await Promise.all([
      supabase
        .from("vendors")
        .select("*")
        .eq("id", vendorId)
        .single(),
      supabase
        .from("vendor_images")
        .select("id, image_url, caption, is_cover, display_order")
        .eq("vendor_id", vendorId)
        .order("display_order", { ascending: true }),
      supabase
        .from("vendor_social_links")
        .select("id, platform, url")
        .eq("vendor_id", vendorId)
        .order("id", { ascending: true }),
      supabase
        .from("vendor_affiliations")
        .select("id, affiliation:affiliations(id, name, slug)")
        .eq("vendor_id", vendorId),
      supabase
        .from("affiliations")
        .select("id, name, slug")
        .order("name", { ascending: true }),
    ]);

    if (vendorRes.error) {
      return Response.json({ error: vendorRes.error.message }, { status: 500 });
    }

    if (!vendorRes.data) {
      return Response.json({ error: "Vendor not found" }, { status: 404 });
    }

    return Response.json({
      vendor: vendorRes.data,
      images: imagesRes.data ?? [],
      socials: socialsRes.data ?? [],
      affiliations: affiliationsRes.data ?? [],
      allAffiliations: allAffiliationsRes.data ?? [],
    }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminOrEditorRequest(req);

    const { id } = await params;
    const vendorId = Number(id);
    if (!Number.isFinite(vendorId)) {
      return Response.json({ error: "Invalid vendor ID" }, { status: 400 });
    }

    const body = (await req.json().catch(() => null)) ?? {};

    // Allow updating all vendor profile fields
    const allowedFields = [
      "business_name",
      "slug",
      "description",
      "location_text",
      "city",
      "address",
      "contact_email",
      "contact_phone",
      "website_url",
      "logo_url",
      "is_active",
      "is_featured",
      "plan_id",
      "verified_status",
    ];

    const patch: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in body) {
        patch[field] = body[field];
      }
    }

    if (Object.keys(patch).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Auto-update verified_status based on plan_id changes
    if ("plan_id" in patch) {
      const newPlanId = patch.plan_id;
      let isPremium = false;

      if (newPlanId !== null) {
        const { data: plan } = await supabase
          .from("plans")
          .select("name")
          .eq("id", newPlanId)
          .maybeSingle();
        const planName = String(plan?.name ?? "").toLowerCase();
        isPremium = planName.includes("premium");
      }

      // Set verified_status: verified if premium, pending if not premium
      patch.verified_status = isPremium ? "verified" : "pending";
    }

    const { data, error } = await supabase
      .from("vendors")
      .update(patch)
      .eq("id", vendorId)
      .select("*")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ vendor: data }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
