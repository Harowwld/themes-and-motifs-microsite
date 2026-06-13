import { assertVendor, getVendorForUser } from "../_auth";

export const dynamic = "force-dynamic";

// GET - fetch vendor themes and all available themes
export async function GET(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const [vendorThemesRes, allThemesRes] = await Promise.all([
      supabase
        .from("vendor_themes")
        .select("id, theme:themes(id, name, slug)")
        .eq("vendor_id", vendor.id),
      supabase
        .from("themes")
        .select("id, name, slug")
        .order("name", { ascending: true }),
    ]);

    if (vendorThemesRes.error) {
      return Response.json({ error: vendorThemesRes.error.message }, { status: 500 });
    }
    if (allThemesRes.error) {
      return Response.json({ error: allThemesRes.error.message }, { status: 500 });
    }

    return Response.json({
      themes: vendorThemesRes.data ?? [],
      allThemes: allThemesRes.data ?? [],
    }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

// PUT - update vendor themes (replace all)
export async function PUT(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const body = (await req.json().catch(() => null)) ?? {};
    const themes = body.themes ?? [];

    if (!Array.isArray(themes)) {
      return Response.json({ error: "Invalid themes array" }, { status: 400 });
    }

    // Limit to max 10 themes
    if (themes.length > 10) {
      return Response.json({ error: "Maximum 10 themes allowed" }, { status: 400 });
    }

    // Only allow selecting existing themes (no custom theme creation)
    const themeIds: number[] = [];

    for (const theme of themes) {
      // Only accept positive IDs (existing themes from database)
      if (theme.id && theme.id > 0) {
        themeIds.push(theme.id);
      }
    }

    // Delete existing vendor themes
    const { error: deleteError } = await supabase
      .from("vendor_themes")
      .delete()
      .eq("vendor_id", vendor.id);

    if (deleteError) {
      return Response.json({ error: deleteError.message }, { status: 500 });
    }

    // Insert new vendor themes
    if (themeIds.length > 0) {
      const vendorThemesToInsert = themeIds.map((themeId: number) => ({
        vendor_id: vendor.id,
        theme_id: themeId,
      }));

      const { error: insertError } = await supabase
        .from("vendor_themes")
        .insert(vendorThemesToInsert);

      if (insertError) {
        return Response.json({ error: insertError.message }, { status: 500 });
      }

      // Auto-unselect themes from photos and albums if they are no longer in the pool
      await supabase
        .from("vendor_images")
        .update({ theme_id: null })
        .eq("vendor_id", vendor.id)
        .not("theme_id", "in", `(${themeIds.join(",")})`);
      
      await supabase
        .from("vendor_albums")
        .update({ theme_id: null })
        .eq("vendor_id", vendor.id)
        .not("theme_id", "in", `(${themeIds.join(",")})`);
    } else {
      // If no themes selected, clear all theme associations
      await supabase
        .from("vendor_images")
        .update({ theme_id: null })
        .eq("vendor_id", vendor.id);
        
      await supabase
        .from("vendor_albums")
        .update({ theme_id: null })
        .eq("vendor_id", vendor.id);
    }

    // Fetch updated themes for this vendor
    const { data: updatedThemes, error: fetchError } = await supabase
      .from("vendor_themes")
      .select("id, theme:themes(id, name, slug)")
      .eq("vendor_id", vendor.id);

    if (fetchError) {
      return Response.json({ error: fetchError.message }, { status: 500 });
    }

    // Fetch all themes for the dropdown
    const { data: allThemes, error: allThemesError } = await supabase
      .from("themes")
      .select("id, name, slug")
      .order("name", { ascending: true });

    if (allThemesError) {
      return Response.json({ error: allThemesError.message }, { status: 500 });
    }

    return Response.json({
      themes: updatedThemes ?? [],
      allThemes: allThemes ?? [],
    }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
