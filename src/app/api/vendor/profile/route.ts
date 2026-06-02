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
  cover_focus_x?: number | null;
  cover_focus_y?: number | null;
  cover_zoom?: number | null;
  contact_person_1_name?: string | null;
  contact_person_1_position?: string | null;
  contact_person_2_name?: string | null;
  contact_person_2_position?: string | null;
  admin_email_1?: string | null;
  admin_email_2?: string | null;
  admin_email_3?: string | null;
  admin_phone_1?: string | null;
  admin_phone_2?: string | null;
  admin_phone_3?: string | null;
  year_established?: string;
};

export async function GET(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const [
      socialsRes, 
      imagesRes, 
      themesRes, 
      allThemesRes, 
      subscriptionRes, 
      videosRes,
      categoriesRes,
      allCategoriesRes
    ] = await Promise.all([
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
      supabase
        .from("vendor_themes")
        .select("id, theme:themes(id, name, slug)")
        .eq("vendor_id", vendor.id),
      supabase
        .from("themes")
        .select("id, name, slug")
        .order("name", { ascending: true }),
      supabase
        .from("vendor_subscriptions")
        .select("*")
        .eq("vendor_id", vendor.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("vendor_videos")
        .select("id,video_url,title,display_order")
        .eq("vendor_id", vendor.id)
        .order("display_order", { ascending: true })
        .limit(20),
      supabase
        .from("vendor_categories")
        .select("category:categories(id, name, slug)")
        .eq("vendor_id", vendor.id),
      supabase
        .from("categories")
        .select("id, name, slug")
        .order("name", { ascending: true }),
    ]);

    if (socialsRes.error) return Response.json({ error: socialsRes.error.message }, { status: 500 });
    if (imagesRes.error) return Response.json({ error: imagesRes.error.message }, { status: 500 });
    if (themesRes.error) return Response.json({ error: themesRes.error.message }, { status: 500 });
    if (allThemesRes.error) return Response.json({ error: allThemesRes.error.message }, { status: 500 });
    if (subscriptionRes.error && subscriptionRes.error.code !== 'PGRST116') return Response.json({ error: subscriptionRes.error.message }, { status: 500 });
    if (videosRes.error) return Response.json({ error: videosRes.error.message }, { status: 500 });
    if (categoriesRes.error) return Response.json({ error: categoriesRes.error.message }, { status: 500 });
    if (allCategoriesRes.error) return Response.json({ error: allCategoriesRes.error.message }, { status: 500 });

    return Response.json(
      {
        vendor,
        socials: socialsRes.data ?? [],
        images: imagesRes.data ?? [],
        themes: themesRes.data ?? [],
        allThemes: allThemesRes.data ?? [],
        subscription: subscriptionRes.data ?? null,
        videos: videosRes.data ?? [],
        categories: categoriesRes.data ?? [],
        allCategories: allCategoriesRes.data ?? [],
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
    if (typeof body.cover_focus_x === "number" || body.cover_focus_x === null) {
      patch.cover_focus_x = body.cover_focus_x === null ? null : Math.max(0, Math.min(100, Math.round(body.cover_focus_x)));
    }
    if (typeof body.cover_focus_y === "number" || body.cover_focus_y === null) {
      patch.cover_focus_y = body.cover_focus_y === null ? null : Math.max(0, Math.min(100, Math.round(body.cover_focus_y)));
    }
    if (typeof body.cover_zoom === "number" || body.cover_zoom === null) patch.cover_zoom = body.cover_zoom;

    if (typeof body.contact_person_1_name === "string" || body.contact_person_1_name === null) patch.contact_person_1_name = body.contact_person_1_name;
    if (typeof body.contact_person_1_position === "string" || body.contact_person_1_position === null) patch.contact_person_1_position = body.contact_person_1_position;
    if (typeof body.contact_person_2_name === "string" || body.contact_person_2_name === null) patch.contact_person_2_name = body.contact_person_2_name;
    if (typeof body.contact_person_2_position === "string" || body.contact_person_2_position === null) patch.contact_person_2_position = body.contact_person_2_position;
    if (typeof body.admin_email_1 === "string" || body.admin_email_1 === null) patch.admin_email_1 = body.admin_email_1;
    if (typeof body.admin_email_2 === "string" || body.admin_email_2 === null) patch.admin_email_2 = body.admin_email_2;
    if (typeof body.admin_email_3 === "string" || body.admin_email_3 === null) patch.admin_email_3 = body.admin_email_3;
    if (typeof body.admin_phone_1 === "string" || body.admin_phone_1 === null) patch.admin_phone_1 = body.admin_phone_1;
    if (typeof body.admin_phone_2 === "string" || body.admin_phone_2 === null) patch.admin_phone_2 = body.admin_phone_2;
    if (typeof body.admin_phone_3 === "string" || body.admin_phone_3 === null) patch.admin_phone_3 = body.admin_phone_3;

    if (typeof body.year_established === "string") {
      const yearStr = body.year_established.trim();
      if (!yearStr) {
        return Response.json({ error: "Year established is required" }, { status: 400 });
      }
      const yearNum = Number(yearStr);
      if (!Number.isInteger(yearNum) || yearNum < 1800 || yearNum > 2100) {
        return Response.json({ error: "Year established must be a valid year between 1800 and 2100" }, { status: 400 });
      }
      patch.year_established = `${yearNum}-01-01`;
    }

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
        "id,user_id,business_name,slug,logo_url,description,location_text,region_id,city,address,contact_email,contact_phone,website_url,plan_id,is_active,document_verified,cover_focus_x,cover_focus_y,cover_zoom,contact_person_1_name,contact_person_1_position,contact_person_2_name,contact_person_2_position,admin_email_1,admin_email_2,admin_email_3,admin_phone_1,admin_phone_2,admin_phone_3,year_established,view_count,save_count,click_count,inquiry_count,average_rating,review_count"
      )
      .single();

    if (error) {
      const msg = String(error.message ?? "");
      const isMissingCoverCols =
        msg.toLowerCase().includes("column") &&
        (msg.includes("cover_focus_x") || msg.includes("cover_focus_y") || msg.includes("cover_zoom"));

      if (isMissingCoverCols) {
        return Response.json(
          {
            error:
              "Database schema missing cover crop fields. Add vendors.cover_focus_x, vendors.cover_focus_y, vendors.cover_zoom then retry.",
            detail: msg,
          },
          { status: 500 }
        );
      }

      return Response.json({ error: msg }, { status: 500 });
    }

    // Fetch plan separately to include in response
    let planData = null;
    if (data?.plan_id) {
      const { data: plan } = await supabase
        .from("plans")
        .select("id,name")
        .eq("id", data.plan_id)
        .single();
      planData = plan;
    }

    return Response.json({ vendor: { ...data, plan: planData } }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
