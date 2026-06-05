import { NextResponse } from "next/server";
import { assertVendor, getVendorForUser } from "../_auth";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

type VendorImageInput = {
  image_url: string;
  caption?: string | null;
  is_cover?: boolean | null;
  display_order?: number | null;
  theme_id?: number | null;
};

type PutBody = {
  images: VendorImageInput[];
};

export async function PUT(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const body = ((await req.json()) ?? {}) as PutBody;
    const images = Array.isArray(body.images) ? body.images : [];

    console.log("[API/vendor/images] Vendor:", vendor.id, "Images received:", images.length);
    console.log("[API/vendor/images] Raw body:", JSON.stringify(body).slice(0, 500));

    const cleaned = images
      .map((img, idx) => {
        const url = String((img as any)?.image_url ?? "").trim();
        const caption = typeof (img as any)?.caption === "string" ? (img as any).caption : null;
        const is_cover = Boolean((img as any)?.is_cover);
        const display_order = Number.isFinite(Number((img as any)?.display_order)) ? Number((img as any).display_order) : idx + 1;
        const theme_id = typeof (img as any)?.theme_id === "number" ? (img as any).theme_id : null;
        return { url, caption, is_cover, display_order, theme_id };
      })
      .filter((x) => x.url);

    console.log("[API/vendor/images] Cleaned:", cleaned);

    // If multiple covers provided, keep first as cover.
    let coverUsed = false;
    const normalized = cleaned.map((x) => {
      const isCover = x.is_cover && !coverUsed;
      if (isCover) coverUsed = true;
      return { ...x, is_cover: isCover };
    });

    if (normalized.length === 0) {
      return NextResponse.json({ error: "Cover photo is required." }, { status: 400 });
    }

    if (!normalized.some((x) => x.is_cover)) {
      return NextResponse.json({ error: "Cover photo is required." }, { status: 400 });
    }

    // Fetch existing images to identify which ones are being removed
    const { data: existingImages, error: fetchErr } = await supabase
      .from("vendor_images")
      .select("image_url")
      .eq("vendor_id", vendor.id);

    if (fetchErr) {
      console.error("[API/vendor/images] Error fetching existing images:", fetchErr);
    }

    // Identify images being removed (exist in DB but not in new list)
    const newUrls = new Set(normalized.map((x) => x.url));
    const imagesToDeleteFromStorage: string[] = [];

    if (existingImages) {
      for (const img of existingImages) {
        if (img.image_url && !newUrls.has(img.image_url)) {
          // This image is being removed
          try {
            const url = new URL(img.image_url);
            const pathMatch = url.pathname.match(/\/(gallery|logos)\/(.+)$/);
            if (pathMatch) {
              imagesToDeleteFromStorage.push(`${pathMatch[1]}/${pathMatch[2]}`);
            }
          } catch {
            if (img.image_url.includes("/gallery/") || img.image_url.includes("/logos/")) {
              const pathMatch = img.image_url.match(/(gallery|logos)\/.+$/);
              if (pathMatch) {
                imagesToDeleteFromStorage.push(pathMatch[0]);
              }
            }
          }
        }
      }
    }

    const { error: delErr } = await supabase.from("vendor_images").delete().eq("vendor_id", vendor.id);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

    if (normalized.length > 0) {
      const insertData = normalized.map((x) => ({
        vendor_id: vendor.id,
        image_url: x.url,
        caption: x.caption,
        is_cover: x.is_cover,
        display_order: x.display_order,
        theme_id: x.theme_id,
      }));
      console.log("[API/vendor/images] Inserting:", insertData);

      const { error: insErr } = await supabase.from("vendor_images").insert(insertData);

      if (insErr) {
        console.error("[API/vendor/images] Insert error:", insErr);
        return NextResponse.json({ error: insErr.message }, { status: 500 });
      }
      console.log("[API/vendor/images] Insert successful");
    }

    const { data, error } = await supabase
      .from("vendor_images")
      .select("id,image_url,caption,is_cover,display_order,theme_id")
      .eq("vendor_id", vendor.id)
      .order("is_cover", { ascending: false })
      .order("display_order", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Delete removed images from Supabase Storage after successful DB operations
    if (imagesToDeleteFromStorage.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("vendor-assets")
        .remove(imagesToDeleteFromStorage);

      if (storageError) {
        console.error("[API/vendor/images] Failed to delete some images from storage:", storageError);
      }
    }

    // Revalidate caching
    try {
      revalidatePath("/");
      revalidatePath("/suppliers");
      revalidatePath(`/suppliers/${vendor.slug}`);
    } catch (e) {
      console.error("[Vendor Images API] Cache revalidation failed:", e);
    }

    return NextResponse.json({ images: data ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
