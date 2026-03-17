import { assertVendor, getVendorForUser } from "../_auth";

export const dynamic = "force-dynamic";

type PromoRow = {
  id: number;
  vendor_id: number;
  title: string;
  summary: string | null;
  terms: string | null;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean | null;
  image_url: string | null;
  discount_percentage: number | null;
  image_focus_x: number | null;
  image_focus_y: number | null;
  image_zoom: number | null;
  updated_at: string;
};

type CreateBody = {
  title: string;
  summary?: string | null;
  terms?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
  is_active?: boolean;
  image_url?: string | null;
  discount_percentage?: number | null;
  image_focus_x?: number | null;
  image_focus_y?: number | null;
  image_zoom?: number | null;
};

type PatchBody = {
  id: number;
  title?: string;
  summary?: string | null;
  terms?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
  is_active?: boolean;
  image_url?: string | null;
  discount_percentage?: number | null;
  image_focus_x?: number | null;
  image_focus_y?: number | null;
  image_zoom?: number | null;
};

function clampPct(v: number) {
  if (!Number.isFinite(v)) return 50;
  return Math.max(0, Math.min(100, v));
}

function clampZoom(v: number) {
  if (!Number.isFinite(v)) return 1;
  return Math.max(1, Math.min(3, v));
}

function requirePremium(vendor: any) {
  const planName = String((vendor as any)?.plan?.name ?? "").trim().toLowerCase();
  const isPremium = planName.includes("premium");
  if (!isPremium) {
    const err = new Error("Promos are available on Premium plans only.") as Error & { statusCode?: number };
    err.statusCode = 403;
    throw err;
  }
}

export async function GET(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const { data, error } = await supabase
      .from("promos")
      .select(
        "id,vendor_id,title,summary,terms,valid_from,valid_to,is_active,image_url,discount_percentage,image_focus_x,image_focus_y,image_zoom,updated_at"
      )
      .eq("vendor_id", vendor.id)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ promos: (data ?? []) as PromoRow[] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);
    requirePremium(vendor);

    const body = ((await req.json()) ?? {}) as CreateBody;

    const title = String(body.title ?? "").trim();
    if (!title) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    const discount = body.discount_percentage;
    const discountNum = typeof discount === "number" && Number.isFinite(discount) ? Math.round(discount) : null;

    const focusX = typeof body.image_focus_x === "number" ? clampPct(body.image_focus_x) : body.image_focus_x === null ? null : 50;
    const focusY = typeof body.image_focus_y === "number" ? clampPct(body.image_focus_y) : body.image_focus_y === null ? null : 50;
    const zoom = typeof body.image_zoom === "number" ? clampZoom(body.image_zoom) : body.image_zoom === null ? null : 1;

    const { data, error } = await supabase
      .from("promos")
      .insert({
        vendor_id: vendor.id,
        title,
        summary: typeof body.summary === "string" ? body.summary.trim() : body.summary ?? null,
        terms: typeof body.terms === "string" ? body.terms.trim() : body.terms ?? null,
        valid_from: typeof body.valid_from === "string" ? body.valid_from : null,
        valid_to: typeof body.valid_to === "string" ? body.valid_to : null,
        image_url: typeof body.image_url === "string" ? body.image_url.trim() : body.image_url ?? null,
        discount_percentage: discountNum,
        image_focus_x: focusX,
        image_focus_y: focusY,
        image_zoom: zoom,
        is_active: typeof body.is_active === "boolean" ? body.is_active : true,
        is_featured: false,
      })
      .select(
        "id,vendor_id,title,summary,terms,valid_from,valid_to,is_active,image_url,discount_percentage,image_focus_x,image_focus_y,image_zoom,updated_at"
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

export async function PATCH(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);
    requirePremium(vendor);

    const body = ((await req.json()) ?? {}) as PatchBody;

    if (typeof body.id !== "number") {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const patch: Record<string, any> = {};
    if (typeof body.title === "string") patch.title = body.title.trim();
    if (typeof body.summary === "string" || body.summary === null) patch.summary = typeof body.summary === "string" ? body.summary.trim() : null;
    if (typeof body.terms === "string" || body.terms === null) patch.terms = typeof body.terms === "string" ? body.terms.trim() : null;
    if (typeof body.valid_from === "string" || body.valid_from === null) patch.valid_from = body.valid_from;
    if (typeof body.valid_to === "string" || body.valid_to === null) patch.valid_to = body.valid_to;
    if (typeof body.is_active === "boolean") patch.is_active = body.is_active;
    if (typeof body.image_url === "string" || body.image_url === null) patch.image_url = typeof body.image_url === "string" ? body.image_url.trim() : null;
    if (typeof body.discount_percentage === "number" || body.discount_percentage === null) {
      patch.discount_percentage = typeof body.discount_percentage === "number" && Number.isFinite(body.discount_percentage) ? Math.round(body.discount_percentage) : null;
    }
    if (typeof body.image_focus_x === "number" || body.image_focus_x === null) {
      patch.image_focus_x = body.image_focus_x === null ? null : clampPct(body.image_focus_x);
    }
    if (typeof body.image_focus_y === "number" || body.image_focus_y === null) {
      patch.image_focus_y = body.image_focus_y === null ? null : clampPct(body.image_focus_y);
    }
    if (typeof body.image_zoom === "number" || body.image_zoom === null) {
      patch.image_zoom = body.image_zoom === null ? null : clampZoom(body.image_zoom);
    }

    if (Object.keys(patch).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("promos")
      .update(patch)
      .eq("id", body.id)
      .eq("vendor_id", vendor.id)
      .select(
        "id,vendor_id,title,summary,terms,valid_from,valid_to,is_active,image_url,discount_percentage,image_focus_x,image_focus_y,image_zoom,updated_at"
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

export async function DELETE(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);
    requirePremium(vendor);

    const { searchParams } = new URL(req.url);
    const idRaw = searchParams.get("id");
    const id = Number(idRaw);

    if (!Number.isFinite(id)) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const { error } = await supabase.from("promos").delete().eq("id", id).eq("vendor_id", vendor.id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return Response.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
