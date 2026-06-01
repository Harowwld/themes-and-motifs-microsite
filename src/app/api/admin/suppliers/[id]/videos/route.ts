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
    const videos = body.videos ?? [];

    if (!Array.isArray(videos)) {
      return Response.json({ error: "Invalid videos array" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Delete existing videos for this vendor
    await supabase.from("vendor_videos").delete().eq("vendor_id", vendorId);

    // Insert new videos
    const videosToInsert = videos
      .filter((v: any) => v.video_url?.trim())
      .map((v: any, idx: number) => ({
        vendor_id: vendorId,
        video_url: v.video_url.trim(),
        title: v.title?.trim() || null,
        display_order: v.display_order ?? idx + 1,
      }));

    if (videosToInsert.length > 0) {
      const { error } = await supabase.from("vendor_videos").insert(videosToInsert);
      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
    }

    // Fetch updated videos
    const { data: updatedVideos } = await supabase
      .from("vendor_videos")
      .select("id, video_url, title, display_order")
      .eq("vendor_id", vendorId)
      .order("display_order", { ascending: true });

    return Response.json({ videos: updatedVideos ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
