import { assertVendor, getVendorForUser } from "../_auth";

export const dynamic = "force-dynamic";

type AlbumRow = {
  id: number;
  vendor_id: number;
  title: string;
  slug: string;
  created_at: string;
};

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

export async function GET(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const { data, error } = await supabase
      .from("vendor_albums")
      .select("id,vendor_id,title,slug,created_at")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false });

    if (error) return Response.json({ error: error.message }, { status: 500 });

    const albumRows = (data ?? []) as AlbumRow[];

    const { data: counts, error: countErr } = await supabase
      .from("vendor_album_photos")
      .select("album_id")
      .eq("vendor_id", vendor.id);

    if (countErr) return Response.json({ error: countErr.message }, { status: 500 });

    const countsByAlbumId = new Map<number, number>();
    for (const row of (counts ?? []) as Array<{ album_id: number }>) {
      countsByAlbumId.set(row.album_id, (countsByAlbumId.get(row.album_id) ?? 0) + 1);
    }

    return Response.json(
      {
        albums: albumRows.map((a) => ({ ...a, photo_count: countsByAlbumId.get(a.id) ?? 0 })),
      },
      { status: 200 }
    );
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

type PostBody = { title?: string };

export async function POST(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const body = ((await req.json().catch(() => null)) ?? {}) as PostBody;
    const title = String(body.title ?? "").trim();
    if (!title) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    const base = slugify(title);
    const slug = await ensureUniqueAlbumSlug(supabase, vendor.id, base);

    const { data, error } = await supabase
      .from("vendor_albums")
      .insert({ vendor_id: vendor.id, title, slug })
      .select("id,vendor_id,title,slug,created_at")
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ album: data }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

type PatchBody = { id?: number; title?: string };

export async function PATCH(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const body = ((await req.json().catch(() => null)) ?? {}) as PatchBody;
    const id = Number(body.id);
    const title = String(body.title ?? "").trim();

    if (!Number.isFinite(id)) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }
    if (!title) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("vendor_albums")
      .update({ title })
      .eq("id", id)
      .eq("vendor_id", vendor.id)
      .select("id,vendor_id,title,slug,created_at")
      .maybeSingle();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    if (!data) return Response.json({ error: "Album not found" }, { status: 404 });

    return Response.json({ album: data }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!Number.isFinite(id)) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("vendor_albums")
      .delete()
      .eq("id", id)
      .eq("vendor_id", vendor.id);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
