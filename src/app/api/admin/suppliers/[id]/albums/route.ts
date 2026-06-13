import { createSupabaseAdminClient } from "../../../../../../lib/supabaseAdmin";
import { assertAdminOrEditorRequest } from "../../../../../../lib/editorAuth";

export const dynamic = "force-dynamic";

function slugify(input: string) {
  const s = (input ?? "").trim().toLowerCase();
  const cleaned = s.replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || "album";
}

async function ensureUniqueAlbumSlug(supabase: any, vendorId: number, base: string) {
  let slug = base;
  for (let i = 0; i < 50; i++) {
    const { data, error } = await supabase
      .from("vendor_albums")
      .select("id")
      .eq("vendor_id", vendorId)
      .eq("slug", slug)
      .limit(1);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return slug;
    slug = `${base}-${i + 2}`;
  }
  return `${base}-${Date.now()}`;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminOrEditorRequest(req);
    const { id } = await params;
    const vendorId = Number(id);

    const body = await req.json().catch(() => null);
    const title = String(body?.title ?? "").trim();
    const theme_id = body?.theme_id;

    if (!title) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const base = slugify(title);
    const slug = await ensureUniqueAlbumSlug(supabase, vendorId, base);

    const { data, error } = await supabase
      .from("vendor_albums")
      .insert({ vendor_id: vendorId, title, slug, theme_id: theme_id || null })
      .select("id,vendor_id,title,slug,created_at,theme_id")
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ album: data }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminOrEditorRequest(req);
    const { id } = await params;
    const vendorId = Number(id);

    const body = await req.json().catch(() => null);
    const albumId = Number(body?.id);
    const title = String(body?.title ?? "").trim();

    if (!Number.isFinite(albumId)) {
      return Response.json({ error: "Invalid album id" }, { status: 400 });
    }
    if (!title) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const updatePayload: any = { title };
    if (body?.theme_id !== undefined) {
      updatePayload.theme_id = body.theme_id || null;
    }

    const { data, error } = await supabase
      .from("vendor_albums")
      .update(updatePayload)
      .eq("id", albumId)
      .eq("vendor_id", vendorId)
      .select("id,vendor_id,title,slug,created_at,theme_id")
      .maybeSingle();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    if (!data) return Response.json({ error: "Album not found" }, { status: 404 });

    return Response.json({ album: data }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminOrEditorRequest(req);
    const { id } = await params;
    const vendorId = Number(id);

    let albumId: number | null = null;
    const { searchParams } = new URL(req.url);
    const queryId = Number(searchParams.get("id"));
    if (Number.isFinite(queryId)) {
      albumId = queryId;
    } else {
      const body = await req.json().catch(() => null);
      if (body && typeof body.id === "number") {
        albumId = body.id;
      }
    }

    if (albumId === null || !Number.isFinite(albumId)) {
      return Response.json({ error: "Invalid album id" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("vendor_albums")
      .delete()
      .eq("id", albumId)
      .eq("vendor_id", vendorId);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
