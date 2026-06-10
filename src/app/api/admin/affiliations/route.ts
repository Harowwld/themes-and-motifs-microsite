import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { assertAdminOrEditorRequest } from "../../../../lib/editorAuth";

// GET - fetch all affiliations
export async function GET(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const supabase = createSupabaseAdminClient();

    const { data: affiliations, error } = await supabase
      .from("affiliations")
      .select("id, name, slug, description, badge_icon, created_at")
      .order("name", { ascending: true });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ affiliations: affiliations ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

// DELETE - delete an affiliation
export async function DELETE(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return Response.json({ error: "Affiliation ID is required" }, { status: 400 });

    const affiliationId = Number(id);
    if (!Number.isFinite(affiliationId)) return Response.json({ error: "Invalid ID" }, { status: 400 });

    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.from("affiliations").delete().eq("id", affiliationId);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, message: "Affiliation deleted successfully." }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

// POST - create a new affiliation
export async function POST(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const body = await req.json().catch(() => ({}));
    const { name, description, badge_icon } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "Affiliation name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    if (!slug) return Response.json({ error: "Invalid affiliation name" }, { status: 400 });

    const supabase = createSupabaseAdminClient();

    const { data: existing, error: checkError } = await supabase
      .from("affiliations")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (checkError) return Response.json({ error: checkError.message }, { status: 500 });
    if (existing) return Response.json({ error: `An affiliation with slug "${slug}" already exists.` }, { status: 400 });

    const { data: newAffiliation, error: insertError } = await supabase
      .from("affiliations")
      .insert({
        name: trimmedName,
        slug,
        description: description?.trim() || null,
        badge_icon: badge_icon?.trim() || null,
      })
      .select()
      .single();

    if (insertError) return Response.json({ error: insertError.message }, { status: 500 });

    return Response.json({ success: true, affiliation: newAffiliation }, { status: 201 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

// PUT - update an existing affiliation
export async function PUT(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const body = await req.json().catch(() => ({}));
    const { id, name, description, badge_icon } = body;

    if (!id || !Number.isFinite(Number(id))) {
      return Response.json({ error: "Invalid affiliation ID" }, { status: 400 });
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "Affiliation name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    if (!slug) return Response.json({ error: "Invalid affiliation name" }, { status: 400 });

    const supabase = createSupabaseAdminClient();

    const { data: existing, error: checkError } = await supabase
      .from("affiliations")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();

    if (checkError) return Response.json({ error: checkError.message }, { status: 500 });
    if (existing) return Response.json({ error: `Another affiliation with slug "${slug}" already exists.` }, { status: 400 });

    const { data: updatedAffiliation, error: updateError } = await supabase
      .from("affiliations")
      .update({
        name: trimmedName,
        slug,
        description: description?.trim() || null,
        badge_icon: badge_icon?.trim() || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) return Response.json({ error: updateError.message }, { status: 500 });

    return Response.json({ success: true, affiliation: updatedAffiliation }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
