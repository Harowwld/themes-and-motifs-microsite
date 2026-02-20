import { assertVendor, getVendorForUser } from "../_auth";

export const dynamic = "force-dynamic";

type VendorImageInput = {
  image_url: string;
  caption?: string | null;
  is_cover?: boolean | null;
  display_order?: number | null;
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

    const cleaned = images
      .map((img, idx) => {
        const url = String((img as any)?.image_url ?? "").trim();
        const caption = typeof (img as any)?.caption === "string" ? (img as any).caption : null;
        const is_cover = Boolean((img as any)?.is_cover);
        const display_order = Number.isFinite(Number((img as any)?.display_order)) ? Number((img as any).display_order) : idx + 1;
        return { url, caption, is_cover, display_order };
      })
      .filter((x) => x.url);

    // If multiple covers provided, keep first as cover.
    let coverUsed = false;
    const normalized = cleaned.map((x) => {
      const isCover = x.is_cover && !coverUsed;
      if (isCover) coverUsed = true;
      return { ...x, is_cover: isCover };
    });

    const { error: delErr } = await supabase.from("vendor_images").delete().eq("vendor_id", vendor.id);
    if (delErr) return Response.json({ error: delErr.message }, { status: 500 });

    if (normalized.length > 0) {
      const { error: insErr } = await supabase.from("vendor_images").insert(
        normalized.map((x) => ({
          vendor_id: vendor.id,
          image_url: x.url,
          caption: x.caption,
          is_cover: x.is_cover,
          display_order: x.display_order,
        }))
      );

      if (insErr) return Response.json({ error: insErr.message }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("vendor_images")
      .select("id,image_url,caption,is_cover,display_order")
      .eq("vendor_id", vendor.id)
      .order("is_cover", { ascending: false })
      .order("display_order", { ascending: true });

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ images: data ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
