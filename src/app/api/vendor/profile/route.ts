import { assertVendor, getVendorForUser } from "../_auth";

export const dynamic = "force-dynamic";

type PatchBody = {
  business_name?: string;
  logo_url?: string | null;
  description?: string | null;
  location_text?: string | null;
  city?: string | null;
  address?: string | null;
  website_url?: string | null;
  contact_phone?: string | null;
};

export async function GET(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const [socialsRes, imagesRes] = await Promise.all([
      supabase
        .from("vendor_social_links")
        .select("id,platform,url")
        .eq("vendor_id", vendor.id)
        .order("platform", { ascending: true })
        .limit(50),
      supabase
        .from("vendor_images")
        .select("id,image_url,caption,is_cover,display_order")
        .eq("vendor_id", vendor.id)
        .order("is_cover", { ascending: false })
        .order("display_order", { ascending: true })
        .limit(50),
    ]);

    if (socialsRes.error) return Response.json({ error: socialsRes.error.message }, { status: 500 });
    if (imagesRes.error) return Response.json({ error: imagesRes.error.message }, { status: 500 });

    return Response.json(
      {
        vendor,
        socials: socialsRes.data ?? [],
        images: imagesRes.data ?? [],
      },
      { status: 200 }
    );
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const body = ((await req.json()) ?? {}) as PatchBody;

    const planName = String((vendor as any)?.plan?.name ?? "").trim().toLowerCase();
    const isPremium = planName.includes("premium");

    const patch: Record<string, any> = {};
    if (typeof body.business_name === "string") patch.business_name = body.business_name.trim();
    if (typeof body.logo_url === "string" || body.logo_url === null) patch.logo_url = body.logo_url;
    if (typeof body.description === "string" || body.description === null) patch.description = body.description;
    if (typeof body.location_text === "string" || body.location_text === null) patch.location_text = body.location_text;
    if (typeof body.city === "string" || body.city === null) patch.city = body.city;
    if (typeof body.address === "string" || body.address === null) patch.address = body.address;
    if (typeof body.website_url === "string" || body.website_url === null) patch.website_url = body.website_url;
    if (typeof body.contact_phone === "string" || body.contact_phone === null) patch.contact_phone = body.contact_phone;

    if (!isPremium) {
      delete patch.logo_url;
      delete patch.website_url;
      delete patch.contact_phone;
    }

    if (Object.keys(patch).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("vendors")
      .update(patch)
      .eq("id", vendor.id)
      .select(
        "id,user_id,business_name,slug,logo_url,description,location_text,region_id,city,address,contact_email,contact_phone,website_url,plan_id,is_active,verified_status"
      )
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ vendor: data }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
