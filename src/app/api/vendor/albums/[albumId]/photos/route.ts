import { assertVendor, getVendorForUser } from "../../../_auth";

export const dynamic = "force-dynamic";

type AlbumPhotoRow = {
  id: number;
  vendor_id: number;
  album_id: number;
  image_url: string;
  display_order: number;
  created_at: string;
};

type AlbumRow = {
  id: number;
  vendor_id: number;
  title: string;
  slug: string;
  created_at: string;
};

export async function GET(req: Request, { params }: { params: Promise<{ albumId: string }> }) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const { albumId } = await params;
    const albumIdNum = Number(albumId);
    if (!Number.isFinite(albumIdNum)) {
      return Response.json({ error: "Invalid album ID" }, { status: 400 });
    }

    const { data: album, error: albumErr } = await supabase
      .from("vendor_albums")
      .select("id,vendor_id,title,slug,created_at")
      .eq("id", albumIdNum)
      .eq("vendor_id", vendor.id)
      .maybeSingle();

    if (albumErr) return Response.json({ error: albumErr.message }, { status: 500 });
    if (!album) return Response.json({ error: "Album not found" }, { status: 404 });

    const { data, error } = await supabase
      .from("vendor_album_photos")
      .select("id,vendor_id,album_id,image_url,display_order,created_at")
      .eq("album_id", albumIdNum)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ album, photos: data ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

type PutBody = { photos: Array<{ image_url: string; display_order?: number }> };

export async function PUT(req: Request, { params }: { params: Promise<{ albumId: string }> }) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const { albumId } = await params;
    const albumIdNum = Number(albumId);
    if (!Number.isFinite(albumIdNum)) {
      return Response.json({ error: "Invalid album ID" }, { status: 400 });
    }

    const body = ((await req.json().catch(() => null)) ?? {}) as PutBody;
    const photos = Array.isArray(body.photos) ? body.photos : [];

    const { data: album, error: albumErr } = await supabase
      .from("vendor_albums")
      .select("id,vendor_id")
      .eq("id", albumIdNum)
      .eq("vendor_id", vendor.id)
      .maybeSingle();

    if (albumErr) return Response.json({ error: albumErr.message }, { status: 500 });
    if (!album) return Response.json({ error: "Album not found" }, { status: 404 });

    const cleaned = photos
      .map((p, idx) => ({
        image_url: String(p.image_url ?? "").trim(),
        display_order: Number.isFinite(Number(p.display_order)) ? Number(p.display_order) : idx,
      }))
      .filter((p) => p.image_url);

    // Fetch existing photos to identify which ones are being removed
    const { data: existingPhotos, error: fetchExistingErr } = await supabase
      .from("vendor_album_photos")
      .select("image_url")
      .eq("album_id", albumIdNum);

    if (fetchExistingErr) {
      console.error("Error fetching existing album photos:", fetchExistingErr);
    }

    // Identify photos being removed (exist in DB but not in new list)
    const newUrls = new Set(cleaned.map((p) => p.image_url));
    const photosToDeleteFromStorage: string[] = [];

    if (existingPhotos) {
      for (const photo of existingPhotos) {
        if (photo.image_url && !newUrls.has(photo.image_url)) {
          // This photo is being removed
          try {
            const url = new URL(photo.image_url);
            const pathMatch = url.pathname.match(/\/(gallery|logos)\/(.+)$/);
            if (pathMatch) {
              photosToDeleteFromStorage.push(`${pathMatch[1]}/${pathMatch[2]}`);
            }
          } catch {
            if (photo.image_url.includes("/gallery/") || photo.image_url.includes("/logos/")) {
              const pathMatch = photo.image_url.match(/(gallery|logos)\/.+$/);
              if (pathMatch) {
                photosToDeleteFromStorage.push(pathMatch[0]);
              }
            }
          }
        }
      }
    }

    // Delete from DB first, then insert new photos
    const { error: delErr } = await supabase
      .from("vendor_album_photos")
      .delete()
      .eq("album_id", albumIdNum);

    if (delErr) return Response.json({ error: delErr.message }, { status: 500 });

    if (cleaned.length > 0) {
      const insertData = cleaned.map((p) => ({
        vendor_id: vendor.id,
        album_id: albumIdNum,
        image_url: p.image_url,
        display_order: p.display_order,
      }));

      const { error: insErr } = await supabase
        .from("vendor_album_photos")
        .insert(insertData);

      if (insErr) return Response.json({ error: insErr.message }, { status: 500 });
    }

    // Delete removed photos from Supabase Storage after successful DB update
    if (photosToDeleteFromStorage.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("vendor-assets")
        .remove(photosToDeleteFromStorage);

      if (storageError) {
        console.error("Failed to delete some album photos from storage:", storageError);
      }
    }

    const { data: updatedPhotos, error: fetchErr } = await supabase
      .from("vendor_album_photos")
      .select("id,vendor_id,album_id,image_url,display_order,created_at")
      .eq("album_id", albumIdNum)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (fetchErr) return Response.json({ error: fetchErr.message }, { status: 500 });

    return Response.json({ photos: updatedPhotos ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
