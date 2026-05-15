import { NextResponse } from "next/server";
import { assertVendor, getVendorForUser } from "../_auth";

export const dynamic = "force-dynamic";

type VendorVideoInput = {
  video_url: string;
  title?: string | null;
  display_order?: number | null;
};

type PutBody = {
  videos: VendorVideoInput[];
};

export async function PUT(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const body = ((await req.json()) ?? {}) as PutBody;
    const videos = Array.isArray(body.videos) ? body.videos : [];

    console.log("[API/vendor/videos] Vendor:", vendor.id, "Videos received:", videos.length);

    const cleaned = videos
      .map((vid, idx) => {
        const url = String((vid as any)?.video_url ?? "").trim();
        const title = typeof (vid as any)?.title === "string" ? (vid as any).title : null;
        const display_order = Number.isFinite(Number((vid as any)?.display_order)) 
          ? Number((vid as any).display_order) 
          : idx + 1;
        return { video_url: url, title, display_order };
      })
      .filter((x) => x.video_url);

    // Delete existing videos and insert new ones
    const { error: delErr } = await supabase
      .from("vendor_videos")
      .delete()
      .eq("vendor_id", vendor.id);

    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

    if (cleaned.length > 0) {
      const insertData = cleaned.map((x) => ({
        vendor_id: vendor.id,
        video_url: x.video_url,
        title: x.title,
        display_order: x.display_order,
      }));

      const { error: insErr } = await supabase.from("vendor_videos").insert(insertData);

      if (insErr) {
        console.error("[API/vendor/videos] Insert error:", insErr);
        return NextResponse.json({ error: insErr.message }, { status: 500 });
      }
    }

    const { data, error } = await supabase
      .from("vendor_videos")
      .select("id,video_url,title,display_order")
      .eq("vendor_id", vendor.id)
      .order("display_order", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ videos: data ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
