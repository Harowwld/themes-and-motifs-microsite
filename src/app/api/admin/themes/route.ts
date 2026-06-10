import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { assertAdminOrEditorRequest } from "../../../../lib/editorAuth";
import { revalidatePath } from "next/cache";

// GET - fetch all themes
export async function GET(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const supabase = createSupabaseAdminClient();

    const { data: themes, error } = await supabase
      .from("themes")
      .select("id, name, slug, created_at")
      .order("name", { ascending: true });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ themes: themes ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

// DELETE - delete a theme
export async function DELETE(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Theme ID is required" }, { status: 400 });
    }

    const themeId = Number(id);
    if (!Number.isFinite(themeId)) {
      return Response.json({ error: "Invalid theme ID" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Check if theme is in use by any vendors
    const { data: usage, error: usageError } = await supabase
      .from("vendor_themes")
      .select("id")
      .eq("theme_id", themeId)
      .limit(1);

    if (usageError) {
      return Response.json({ error: usageError.message }, { status: 500 });
    }

    const isInUse = (usage ?? []).length > 0;

    // Delete the theme (vendor_themes entries will be cascade deleted due to ON DELETE CASCADE)

        try {
          revalidatePath("/", "layout");
        } catch (err) {
          console.error("[Admin API] Cache revalidation failed:", err);
        }

    const { error } = await supabase
      .from("themes")
      .delete()
      .eq("id", themeId);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: isInUse
        ? "Theme deleted. It was removed from all vendors that were using it."
        : "Theme deleted successfully.",
      wasInUse: isInUse,
    }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

// POST - create a new theme
export async function POST(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const body = await req.json().catch(() => ({}));
    const { name, description } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "Theme name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    // Generate slug: lowercase, replace non-alphanumeric with hyphen, strip duplicate hyphens & leading/trailing hyphens
    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) {
      return Response.json({ error: "Invalid theme name for generating a slug" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Check if slug already exists to prevent duplicate key errors
    const { data: existing, error: checkError } = await supabase
      .from("themes")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (checkError) {
      return Response.json({ error: checkError.message }, { status: 500 });
    }

    if (existing) {
      return Response.json({ error: `A theme with slug "${slug}" already exists.` }, { status: 400 });
    }

        try {
          revalidatePath("/", "layout");
        } catch (err) {
          console.error("[Admin API] Cache revalidation failed:", err);
        }


    const { data: newTheme, error: insertError } = await supabase
      .from("themes")
      .insert({
        name: trimmedName,
        slug,
        description: description?.trim() || null,
      })
      .select()
      .single();

    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 });
    }

    return Response.json({ success: true, theme: newTheme }, { status: 201 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

