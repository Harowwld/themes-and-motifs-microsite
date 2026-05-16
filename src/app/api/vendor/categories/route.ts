import { assertVendor, getVendorForUser } from "../_auth";

export const dynamic = "force-dynamic";

// GET - fetch vendor categories and all available categories
export async function GET(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const [vendorCategoriesRes, allCategoriesRes] = await Promise.all([
      supabase
        .from("vendor_categories")
        .select("category:categories(id, name, slug)")
        .eq("vendor_id", vendor.id),
      supabase
        .from("categories")
        .select("id, name, slug")
        .order("name", { ascending: true }),
    ]);

    if (vendorCategoriesRes.error) {
      return Response.json({ error: vendorCategoriesRes.error.message }, { status: 500 });
    }
    if (allCategoriesRes.error) {
      return Response.json({ error: allCategoriesRes.error.message }, { status: 500 });
    }

    return Response.json({
      categories: vendorCategoriesRes.data ?? [],
      allCategories: allCategoriesRes.data ?? [],
    }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

// PUT - update vendor categories (replace all)
export async function PUT(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const body = (await req.json().catch(() => null)) ?? {};
    const categories = body.categories ?? [];

    if (!Array.isArray(categories)) {
      return Response.json({ error: "Invalid categories array" }, { status: 400 });
    }

    // Limit to max 5 categories
    if (categories.length > 5) {
      return Response.json({ error: "Maximum 5 categories allowed" }, { status: 400 });
    }

    // Only allow selecting existing categories
    const categoryIds: number[] = [];

    for (const cat of categories) {
      if (cat.id && cat.id > 0) {
        categoryIds.push(cat.id);
      }
    }

    // Delete existing vendor categories
    const { error: deleteError } = await supabase
      .from("vendor_categories")
      .delete()
      .eq("vendor_id", vendor.id);

    if (deleteError) {
      return Response.json({ error: deleteError.message }, { status: 500 });
    }

    // Insert new vendor categories
    if (categoryIds.length > 0) {
      const vendorCategoriesToInsert = categoryIds.map((catId: number) => ({
        vendor_id: vendor.id,
        category_id: catId,
      }));

      const { error: insertError } = await supabase
        .from("vendor_categories")
        .insert(vendorCategoriesToInsert);

      if (insertError) {
        return Response.json({ error: insertError.message }, { status: 500 });
      }
    }

    // Fetch updated categories for this vendor
    const { data: updatedCategories, error: fetchError } = await supabase
      .from("vendor_categories")
      .select("category:categories(id, name, slug)")
      .eq("vendor_id", vendor.id);

    if (fetchError) {
      return Response.json({ error: fetchError.message }, { status: 500 });
    }

    // Fetch all categories for the dropdown
    const { data: allCategories, error: allCategoriesError } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name", { ascending: true });

    if (allCategoriesError) {
      return Response.json({ error: allCategoriesError.message }, { status: 500 });
    }

    return Response.json({
      categories: updatedCategories ?? [],
      allCategories: allCategories ?? [],
    }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
