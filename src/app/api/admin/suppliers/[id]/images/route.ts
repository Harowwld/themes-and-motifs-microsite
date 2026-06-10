import { createSupabaseAdminClient } from "../../../../../../lib/supabaseAdmin";
import { assertAdminOrEditorRequest } from "../../../../../../lib/editorAuth";
import { revalidatePath } from "next/cache";

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

    // Fetch existing images to identify which ones are being removed
    const { data: existingImages, error: fetchErr } = await supabase
      .from("vendor_images")
      .select("image_url")
      .eq("vendor_id", vendorId);

    if (fetchErr) {
      console.error("Error fetching existing vendor images:", fetchErr);
    }

    // Identify images being removed (exist in DB but not in new list)
    const newUrls = new Set(images.map((img: any) => img.image_url?.trim()).filter(Boolean));
    const imagesToDeleteFromStorage: string[] = [];

    if (existingImages) {
      for (const img of existingImages) {
        if (img.image_url && !newUrls.has(img.image_url)) {
          // This image is being removed
          try {
            const url = new URL(img.image_url);
            const pathMatch = url.pathname.match(/\/(gallery|logos|promos)\/(.+)$/);
            if (pathMatch) {
              imagesToDeleteFromStorage.push(`${pathMatch[1]}/${pathMatch[2]}`);
            }
          } catch {
            if (img.image_url.includes("/gallery/") || img.image_url.includes("/logos/") || img.image_url.includes("/promos/")) {
              const pathMatch = img.image_url.match(/(gallery|logos|promos)\/.+$/);
              if (pathMatch) {
                imagesToDeleteFromStorage.push(pathMatch[0]);
              }
            }
          }
        }
      }
    }

    // Delete existing images for this vendor
    await supabase.from("vendor_images").delete().eq("vendor_id", vendorId);

    // Insert new images

        try {
          revalidatePath("/", "layout");
        } catch (err) {
          console.error("[Admin API] Cache revalidation failed:", err);
        }

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
        theme_id: typeof img.theme_id === 'number' ? img.theme_id : null,
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
      .select("id, image_url, caption, is_cover, display_order, focus_x, focus_y, zoom, theme_id")
      .eq("vendor_id", vendorId)
      .order("display_order", { ascending: true });

    // Delete removed images from Supabase Storage after successful DB operations
    if (imagesToDeleteFromStorage.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("vendor-assets")
        .remove(imagesToDeleteFromStorage);

      if (storageError) {
        console.error("Failed to delete some vendor images from storage:", storageError);
      }
    }

    return Response.json({ images: updatedImages ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
