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
    const socials = body.socials ?? [];

    if (!Array.isArray(socials)) {
      return Response.json({ error: "Invalid socials array" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Delete existing socials for this vendor
    await supabase.from("vendor_socials").delete().eq("vendor_id", vendorId);

    // Insert new socials
    const socialsToInsert = socials
      .filter((s: any) => s.platform?.trim() && s.url?.trim())
      .map((s: any) => ({
        vendor_id: vendorId,
        platform: s.platform.trim().toLowerCase(),
        url: s.url.trim(),
      }));

    if (socialsToInsert.length > 0) {
      const { error } = await supabase.from("vendor_socials").insert(socialsToInsert);
      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
    }

    // Fetch updated socials
    const { data: updatedSocials } = await supabase
      .from("vendor_socials")
      .select("id, platform, url")
      .eq("vendor_id", vendorId)
      .order("id", { ascending: true });

    return Response.json({ socials: updatedSocials ?? [] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
