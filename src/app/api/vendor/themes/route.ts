import { assertVendor, getVendorForUser } from "../_auth";

export const dynamic = "force-dynamic";

function slugify(input: string) {
  const s = (input ?? "").trim().toLowerCase();
  const cleaned = s
    .replace(/['']g/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "theme";
}

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

    // Get existing themes to check for new ones
    const { data: existingThemes } = await supabase
      .from("themes")
      .select("id, name, slug")
      .order("name", { ascending: true });

    const existingByName = new Map((existingThemes ?? []).map((t) => [t.name.toLowerCase(), t]));
    const existingBySlug = new Map((existingThemes ?? []).map((t) => [t.slug, t]));

    // Process themes - create new ones if needed
    const themeIds: number[] = [];
    const createdThemes: { id: number; name: string; slug: string }[] = [];

    for (const theme of themes) {
      const name = (theme.name ?? "").trim();
      if (!name) continue;

      const nameLower = name.toLowerCase();
      let themeId: number | null = null;

      // Check if theme already exists by name
      const existingByNameMatch = existingByName.get(nameLower);
      if (existingByNameMatch) {
        themeId = existingByNameMatch.id;
      } else if (theme.id && theme.id > 0) {
        // Use provided ID if it's a positive number (existing theme)
        themeId = theme.id;
      } else {
        // Create new theme
        const slug = slugify(name);
        // Ensure unique slug
        let uniqueSlug = slug;
        let counter = 1;
        while (existingBySlug.has(uniqueSlug)) {
          uniqueSlug = `${slug}-${counter}`;
          counter++;
        }

        const { data: newTheme, error: createError } = await supabase
          .from("themes")
          .insert({ name, slug: uniqueSlug })
          .select("id, name, slug")
          .single();

        if (createError) {
          return Response.json({ error: createError.message }, { status: 500 });
        }

        if (newTheme) {
          themeId = newTheme.id;
          createdThemes.push(newTheme);
          // Add to maps for subsequent iterations
          existingByName.set(nameLower, newTheme);
          existingBySlug.set(uniqueSlug, newTheme);
        }
      }

      if (themeId) {
        themeIds.push(themeId);
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
      created: createdThemes,
    }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
