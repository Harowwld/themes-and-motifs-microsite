import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { assertAdminOrEditorRequest } from "../../../../lib/editorAuth";

// GET - fetch all categories
export async function GET(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const supabase = createSupabaseAdminClient();

    const { data: categories, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, display_order, icon, created_at")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ categories: categories ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

// DELETE - delete a category
export async function DELETE(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return Response.json({ error: "Category ID is required" }, { status: 400 });

    const categoryId = Number(id);
    if (!Number.isFinite(categoryId)) return Response.json({ error: "Invalid ID" }, { status: 400 });

    const supabase = createSupabaseAdminClient();

    // Delete the category
    const { error } = await supabase.from("categories").delete().eq("id", categoryId);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, message: "Category deleted successfully." }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

// POST - create a new category
export async function POST(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const body = await req.json().catch(() => ({}));
    const { name, description, display_order, icon } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "Category name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    if (!slug) return Response.json({ error: "Invalid category name" }, { status: 400 });

    const supabase = createSupabaseAdminClient();

    const { data: existing, error: checkError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (checkError) return Response.json({ error: checkError.message }, { status: 500 });
    if (existing) return Response.json({ error: `A category with slug "${slug}" already exists.` }, { status: 400 });

    const { data: newCategory, error: insertError } = await supabase
      .from("categories")
      .insert({
        name: trimmedName,
        slug,
        description: description?.trim() || null,
        display_order: display_order ? Number(display_order) : null,
        icon: icon?.trim() || null,
      })
      .select()
      .single();

    if (insertError) return Response.json({ error: insertError.message }, { status: 500 });

    return Response.json({ success: true, category: newCategory }, { status: 201 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

// PUT - update an existing category
export async function PUT(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const body = await req.json().catch(() => ({}));
    const { id, name, description, display_order, icon } = body;

    if (!id || !Number.isFinite(Number(id))) {
      return Response.json({ error: "Invalid category ID" }, { status: 400 });
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "Category name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    if (!slug) return Response.json({ error: "Invalid category name" }, { status: 400 });

    const supabase = createSupabaseAdminClient();

    const { data: existing, error: checkError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();

    if (checkError) return Response.json({ error: checkError.message }, { status: 500 });
    if (existing) return Response.json({ error: `Another category with slug "${slug}" already exists.` }, { status: 400 });

    const { data: updatedCategory, error: updateError } = await supabase
      .from("categories")
      .update({
        name: trimmedName,
        slug,
        description: description?.trim() || null,
        display_order: display_order ? Number(display_order) : null,
        icon: icon?.trim() || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) return Response.json({ error: updateError.message }, { status: 500 });

    return Response.json({ success: true, category: updatedCategory }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
