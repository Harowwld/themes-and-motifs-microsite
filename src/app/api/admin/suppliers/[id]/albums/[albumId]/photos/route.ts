import { createSupabaseAdminClient } from "../../../../../../../lib/supabaseAdmin";
import { assertAdminOrEditorRequest } from "../../../../../../../lib/editorAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string; albumId: string }> }) {
  try {
    await assertAdminOrEditorRequest(req);
    const { id, albumId } = await params;
    const vendorId = Number(id);
    const aId = Number(albumId);

    const supabase = createSupabaseAdminClient();

    const { data: album, error: albumErr } = await supabase
      .from("vendor_albums")
      .select("id,vendor_id,title,slug,created_at,theme_id,theme:themes(id,name,slug)")
      .eq("id", aId)
      .eq("vendor_id", vendorId)
      .maybeSingle();

    if (albumErr) return Response.json({ error: albumErr.message }, { status: 500 });
    if (!album) return Response.json({ error: "Album not found" }, { status: 404 });

    const { data: photos, error: photoErr } = await supabase
      .from("vendor_album_photos")
      .select("id,album_id,image_url,display_order")
      .eq("album_id", aId)
      .order("display_order", { ascending: true });

    if (photoErr) return Response.json({ error: photoErr.message }, { status: 500 });

    return Response.json({ album, photos: photos ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string; albumId: string }> }) {
  try {
    await assertAdminOrEditorRequest(req);
    const { id, albumId } = await params;
    const vendorId = Number(id);
    const aId = Number(albumId);

    const body = await req.json().catch(() => null);
    const urls = Array.isArray(body?.urls) ? body.urls : [];

    const supabase = createSupabaseAdminClient();

    const { data: album, error: albumErr } = await supabase
      .from("vendor_albums")
      .select("id")
      .eq("id", aId)
      .eq("vendor_id", vendorId)
      .maybeSingle();

    if (albumErr) return Response.json({ error: albumErr.message }, { status: 500 });
    if (!album) return Response.json({ error: "Album not found" }, { status: 404 });

    await supabase.from("vendor_album_photos").delete().eq("album_id", aId);

    if (urls.length > 0) {
      const inserts = urls.map((url: string, i: number) => ({
        vendor_id: vendorId,
        album_id: aId,
        image_url: url,
        display_order: i + 1,
      }));
      const { error: insErr } = await supabase.from("vendor_album_photos").insert(inserts);
      if (insErr) return Response.json({ error: insErr.message }, { status: 500 });
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
