import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { assertAdminOrEditorRequest } from "../../../../lib/editorAuth";

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
