import { createSupabaseAdminClient } from "../../../../../../lib/supabaseAdmin";
import { assertAdminOrEditorRequest } from "../../../../../../lib/editorAuth";

type PromoRow = {
  id: number;
  vendor_id: number;
  title: string;
  summary: string | null;
  terms: string | null;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  image_url: string | null;
  discount_percentage: number | null;
  image_focus_x: number | null;
  image_focus_y: number | null;
  image_zoom: number | null;
  updated_at: string;
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminOrEditorRequest(req);

    const { id } = await params;
    const vendorId = Number(id);
    if (!Number.isFinite(vendorId)) {
      return Response.json({ error: "Invalid vendor ID" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("promos")
      .select(
        "id,vendor_id,title,summary,terms,valid_from,valid_to,is_active,is_featured,image_url,discount_percentage,image_focus_x,image_focus_y,image_zoom,updated_at"
      )
      .eq("vendor_id", vendorId)
      .order("updated_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ promos: (data ?? []) as PromoRow[] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminOrEditorRequest(req);

    const { id } = await params;
    const vendorId = Number(id);
    if (!Number.isFinite(vendorId)) {
      return Response.json({ error: "Invalid vendor ID" }, { status: 400 });
    }

    const body = (await req.json().catch(() => null)) ?? {};
    const { title, summary, terms, valid_from, valid_to, is_active, image_url, discount_percentage } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("promos")
      .insert({
        vendor_id: vendorId,
        title: title.trim(),
        summary: typeof summary === "string" ? summary.trim() || null : null,
        terms: typeof terms === "string" ? terms.trim() || null : null,
        valid_from: typeof valid_from === "string" ? valid_from : null,
        valid_to: typeof valid_to === "string" ? valid_to : null,
        is_active: typeof is_active === "boolean" ? is_active : true,
        image_url: typeof image_url === "string" ? image_url.trim() || null : null,
        discount_percentage: typeof discount_percentage === "number" && Number.isFinite(discount_percentage)
          ? Math.round(discount_percentage)
          : null,
        is_featured: false,
      })
      .select(
        "id,vendor_id,title,summary,terms,valid_from,valid_to,is_active,is_featured,image_url,discount_percentage,image_focus_x,image_focus_y,image_zoom,updated_at"
      )
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ promo: data as PromoRow }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminOrEditorRequest(req);

    const { id } = await params;
    const vendorId = Number(id);
    if (!Number.isFinite(vendorId)) {
      return Response.json({ error: "Invalid vendor ID" }, { status: 400 });
    }

    const body = (await req.json().catch(() => null)) ?? {};
    const { promo_id, title, summary, terms, valid_from, valid_to, is_active, is_featured, image_url, discount_percentage } = body;

    if (typeof promo_id !== "number") {
      return Response.json({ error: "Invalid promo_id" }, { status: 400 });
    }

    const patch: Record<string, any> = {};
    if (typeof title === "string") patch.title = title.trim();
    if (typeof summary === "string" || summary === null) patch.summary = typeof summary === "string" ? summary.trim() || null : null;
    if (typeof terms === "string" || terms === null) patch.terms = typeof terms === "string" ? terms.trim() || null : null;
    if (typeof valid_from === "string" || valid_from === null) patch.valid_from = valid_from;
    if (typeof valid_to === "string" || valid_to === null) patch.valid_to = valid_to;
    if (typeof is_active === "boolean") patch.is_active = is_active;
    if (typeof is_featured === "boolean") patch.is_featured = is_featured;
    if (typeof image_url === "string" || image_url === null) patch.image_url = typeof image_url === "string" ? image_url.trim() : null;
    if (typeof discount_percentage === "number" || discount_percentage === null) {
      patch.discount_percentage = typeof discount_percentage === "number" && Number.isFinite(discount_percentage)
        ? Math.round(discount_percentage)
        : null;
    }

    if (Object.keys(patch).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("promos")
      .update(patch)
      .eq("id", promo_id)
      .eq("vendor_id", vendorId)
      .select(
        "id,vendor_id,title,summary,terms,valid_from,valid_to,is_active,is_featured,image_url,discount_percentage,image_focus_x,image_focus_y,image_zoom,updated_at"
      )
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ promo: data as PromoRow }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminOrEditorRequest(req);

    const { id } = await params;
    const vendorId = Number(id);
    if (!Number.isFinite(vendorId)) {
      return Response.json({ error: "Invalid vendor ID" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const promoIdRaw = searchParams.get("promo_id");
    const promoId = Number(promoIdRaw);

    if (!Number.isFinite(promoId)) {
      return Response.json({ error: "Invalid promo_id" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.from("promos").delete().eq("id", promoId).eq("vendor_id", vendorId);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
