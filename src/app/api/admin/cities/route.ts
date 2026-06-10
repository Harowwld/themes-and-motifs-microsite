import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { assertAdminOrEditorRequest } from "../../../../lib/editorAuth";

// GET - fetch all cities
export async function GET(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const supabase = createSupabaseAdminClient();

    const [part1, part2] = await Promise.all([
      supabase.from("cities").select("id, name, province_id, created_at").order("name", { ascending: true }).range(0, 999),
      supabase.from("cities").select("id, name, province_id, created_at").order("name", { ascending: true }).range(1000, 1999),
    ]);

    if (part1.error) return Response.json({ error: part1.error.message }, { status: 500 });
    if (part2.error) return Response.json({ error: part2.error.message }, { status: 500 });

    const cities = [...(part1.data ?? []), ...(part2.data ?? [])];

    return Response.json({ cities }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

// DELETE - delete a city
export async function DELETE(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return Response.json({ error: "City ID is required" }, { status: 400 });

    const cityId = Number(id);
    if (!Number.isFinite(cityId)) return Response.json({ error: "Invalid ID" }, { status: 400 });

    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.from("cities").delete().eq("id", cityId);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, message: "City deleted successfully." }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

// POST - create a new city
export async function POST(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const body = await req.json().catch(() => ({}));
    const { name, province_id } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "City name is required" }, { status: 400 });
    }

    if (!province_id || !Number.isFinite(Number(province_id))) {
      return Response.json({ error: "Valid Region ID is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const supabase = createSupabaseAdminClient();

    // Prevent duplicate city name within the same region
    const { data: existing, error: checkError } = await supabase
      .from("cities")
      .select("id")
      .eq("name", trimmedName)
      .eq("province_id", province_id)
      .maybeSingle();

    if (checkError) return Response.json({ error: checkError.message }, { status: 500 });
    if (existing) return Response.json({ error: `A city/center with name "${trimmedName}" already exists in this region.` }, { status: 400 });

    const { data: newCity, error: insertError } = await supabase
      .from("cities")
      .insert({
        name: trimmedName,
        province_id: Number(province_id),
      })
      .select()
      .single();

    if (insertError) return Response.json({ error: insertError.message }, { status: 500 });

    return Response.json({ success: true, city: newCity }, { status: 201 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

// PUT - update an existing city
export async function PUT(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const body = await req.json().catch(() => ({}));
    const { id, name, province_id } = body;

    if (!id || !Number.isFinite(Number(id))) {
      return Response.json({ error: "Invalid city ID" }, { status: 400 });
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "City name is required" }, { status: 400 });
    }

    if (!province_id || !Number.isFinite(Number(province_id))) {
      return Response.json({ error: "Valid Region ID is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const supabase = createSupabaseAdminClient();

    const { data: existing, error: checkError } = await supabase
      .from("cities")
      .select("id")
      .eq("name", trimmedName)
      .eq("province_id", province_id)
      .neq("id", id)
      .maybeSingle();

    if (checkError) return Response.json({ error: checkError.message }, { status: 500 });
    if (existing) return Response.json({ error: `Another city/center with name "${trimmedName}" already exists in this region.` }, { status: 400 });

    const { data: updatedCity, error: updateError } = await supabase
      .from("cities")
      .update({
        name: trimmedName,
        province_id: Number(province_id),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) return Response.json({ error: updateError.message }, { status: 500 });

    return Response.json({ success: true, city: updatedCity }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
