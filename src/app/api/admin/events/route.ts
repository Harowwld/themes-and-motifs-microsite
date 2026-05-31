import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { assertAdminOrEditorRequest } from "../../../../lib/editorAuth";

export const dynamic = "force-dynamic";

// GET - fetch all bridal fair events
export async function GET(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const supabase = createSupabaseAdminClient();

    const { data: events, error } = await supabase
      .from("bridal_fairs")
      .select("*")
      .order("start_date", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ events: events ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

// POST - create a new bridal fair event
export async function POST(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const body = await req.json().catch(() => ({}));
    const {
      title,
      description,
      start_date,
      end_date,
      venue,
      venue_address,
      venue_map_url,
      image_url,
      registration_url,
      is_featured,
      is_active
    } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return Response.json({ error: "Event title is required" }, { status: 400 });
    }

    if (!start_date) {
      return Response.json({ error: "Start date is required" }, { status: 400 });
    }

    if (!venue || typeof venue !== "string" || !venue.trim()) {
      return Response.json({ error: "Venue is required" }, { status: 400 });
    }

    const trimmedTitle = title.trim();
    // Generate unique slug
    let slug = trimmedTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) {
      return Response.json({ error: "Invalid title for generating a slug" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Check duplicate slug
    const { data: existing } = await supabase
      .from("bridal_fairs")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      // Append random suffix to slug to make it unique if duplicate exists
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const { data: newEvent, error: insertError } = await supabase
      .from("bridal_fairs")
      .insert({
        title: trimmedTitle,
        slug,
        description: description?.trim() || null,
        start_date,
        end_date: end_date || null,
        venue: venue.trim(),
        venue_address: venue_address?.trim() || null,
        venue_map_url: venue_map_url?.trim() || null,
        image_url: image_url?.trim() || null,
        registration_url: registration_url?.trim() || null,
        is_featured: !!is_featured,
        is_active: is_active !== false
      })
      .select()
      .single();

    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 });
    }

    return Response.json({ success: true, event: newEvent }, { status: 201 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

// PATCH - update an event
export async function PATCH(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const body = await req.json().catch(() => ({}));
    const { id, ...patch } = body;

    if (!id) {
      return Response.json({ error: "Event ID is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // If title is changing, we should regenerate the slug
    const updateData: Record<string, any> = { ...patch };
    if (patch.title && typeof patch.title === "string" && patch.title.trim()) {
      const trimmedTitle = patch.title.trim();
      let newSlug = trimmedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      
      // Check duplicate slug (excluding this ID)
      const { data: existing } = await supabase
        .from("bridal_fairs")
        .select("id")
        .eq("slug", newSlug)
        .neq("id", id)
        .maybeSingle();

      if (existing) {
        newSlug = `${newSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      updateData.slug = newSlug;
      updateData.title = trimmedTitle;
    }

    // Set updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    const { data: updatedEvent, error } = await supabase
      .from("bridal_fairs")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, event: updatedEvent }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

// DELETE - delete an event
export async function DELETE(req: Request) {
  try {
    await assertAdminOrEditorRequest(req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Event ID is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from("bridal_fairs")
      .delete()
      .eq("id", Number(id));

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, message: "Event deleted successfully." }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
