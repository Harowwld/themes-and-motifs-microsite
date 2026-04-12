import { createSupabaseAdminClient } from "../../../../../../lib/supabaseAdmin";
import { assertAdminOrEditorRequest } from "../../../../../../lib/editorAuth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminOrEditorRequest(req);

    const { id } = await params;
    const vendorId = Number(id);
    if (!Number.isFinite(vendorId)) {
      return Response.json({ error: "Invalid vendor ID" }, { status: 400 });
    }

    const body = (await req.json().catch(() => null)) ?? {};
    const images = body.images ?? [];

    if (!Array.isArray(images)) {
      return Response.json({ error: "Invalid images array" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Delete existing images for this vendor
    await supabase.from("vendor_images").delete().eq("vendor_id", vendorId);

    // Insert new images
    const imagesToInsert = images
      .filter((img: any) => img.image_url?.trim())
      .map((img: any, idx: number) => ({
        vendor_id: vendorId,
        image_url: img.image_url.trim(),
        caption: img.caption?.trim() || null,
        is_cover: Boolean(img.is_cover),
        display_order: img.display_order ?? idx + 1,
        focus_x: typeof img.focus_x === 'number' ? img.focus_x : 50,
        focus_y: typeof img.focus_y === 'number' ? img.focus_y : 50,
        zoom: typeof img.zoom === 'number' ? img.zoom : 1,
      }));

    if (imagesToInsert.length > 0) {
      const { error } = await supabase.from("vendor_images").insert(imagesToInsert);
      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
    }

    // Fetch updated images
    const { data: updatedImages } = await supabase
      .from("vendor_images")
      .select("id, image_url, caption, is_cover, display_order, focus_x, focus_y, zoom")
      .eq("vendor_id", vendorId)
      .order("display_order", { ascending: true });

    return Response.json({ images: updatedImages ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
