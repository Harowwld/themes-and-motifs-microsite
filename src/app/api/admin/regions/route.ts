import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { assertAdminOrEditorRequest } from "../../../../lib/editorAuth";

// GET - fetch all regions
export async function GET(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const supabase = createSupabaseAdminClient();

    const { data: regions, error } = await supabase
      .from("provinces")
      .select("id, name, created_at")
      .order("name", { ascending: true });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ regions: regions ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

// DELETE - delete a region
export async function DELETE(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return Response.json({ error: "Region ID is required" }, { status: 400 });

    const regionId = Number(id);
    if (!Number.isFinite(regionId)) return Response.json({ error: "Invalid ID" }, { status: 400 });

    const supabase = createSupabaseAdminClient();

    // Check if region has cities attached to it
    const { data: cities, error: citiesError } = await supabase
      .from("cities")
      .select("id")
      .eq("province_id", regionId)
      .limit(1);

    if (citiesError) return Response.json({ error: citiesError.message }, { status: 500 });
    if (cities && cities.length > 0) {
      return Response.json({ error: "Cannot delete a region that contains cities. Delete its cities first." }, { status: 400 });
    }

    const { error } = await supabase.from("provinces").delete().eq("id", regionId);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, message: "Region deleted successfully." }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

// POST - create a new region
export async function POST(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const body = await req.json().catch(() => ({}));
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "Region name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const supabase = createSupabaseAdminClient();

    const { data: existing, error: checkError } = await supabase
      .from("provinces")
      .select("id")
      .eq("name", trimmedName)
      .maybeSingle();

    if (checkError) return Response.json({ error: checkError.message }, { status: 500 });
    if (existing) return Response.json({ error: `A region with name "${trimmedName}" already exists.` }, { status: 400 });

    const { data: newRegion, error: insertError } = await supabase
      .from("provinces")
      .insert({
        name: trimmedName,
      })
      .select()
      .single();

    if (insertError) return Response.json({ error: insertError.message }, { status: 500 });

    return Response.json({ success: true, region: newRegion }, { status: 201 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

// PUT - update an existing region
export async function PUT(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const body = await req.json().catch(() => ({}));
    const { id, name } = body;

    if (!id || !Number.isFinite(Number(id))) {
      return Response.json({ error: "Invalid region ID" }, { status: 400 });
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "Region name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const supabase = createSupabaseAdminClient();

    const { data: existing, error: checkError } = await supabase
      .from("provinces")
      .select("id")
      .eq("name", trimmedName)
      .neq("id", id)
      .maybeSingle();

    if (checkError) return Response.json({ error: checkError.message }, { status: 500 });
    if (existing) return Response.json({ error: `Another region with name "${trimmedName}" already exists.` }, { status: 400 });

    const { data: updatedRegion, error: updateError } = await supabase
      .from("provinces")
      .update({
        name: trimmedName,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) return Response.json({ error: updateError.message }, { status: 500 });

    return Response.json({ success: true, region: updatedRegion }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
