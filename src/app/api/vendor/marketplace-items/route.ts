import { NextResponse } from "next/server";
import { assertVendor, getVendorForUser } from "../_auth";

export const dynamic = "force-dynamic";

type MarketplaceItemRow = {
  id: number;
  vendor_id: number;
  title: string;
  summary: string | null;
  price: number;
  price_text: string | null;
  is_active: boolean | null;
  image_url: string | null;
  image_focus_x: number | null;
  image_focus_y: number | null;
  image_zoom: number | null;
  updated_at: string;
};

type CreateBody = {
  title: string;
  summary?: string | null;
  price?: number;
  price_text?: string | null;
  is_active?: boolean;
  image_url?: string | null;
  image_focus_x?: number | null;
  image_focus_y?: number | null;
  image_zoom?: number | null;
};

type PatchBody = {
  id: number;
  title?: string;
  summary?: string | null;
  price?: number;
  price_text?: string | null;
  is_active?: boolean;
  image_url?: string | null;
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

export async function GET(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const { data, error } = await supabase
      .from("marketplace_items")
      .select(
        "id,vendor_id,title,summary,price,price_text,is_active,image_url,image_focus_x,image_focus_y,image_zoom,updated_at"
      )
      .eq("vendor_id", vendor.id)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ marketplaceItems: (data ?? []) as MarketplaceItemRow[] }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const body = ((await req.json()) ?? {}) as CreateBody;

    const title = String(body.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const price = typeof body.price === "number" ? body.price : 0;

    const focusX = typeof body.image_focus_x === "number" ? clampPct(body.image_focus_x) : body.image_focus_x === null ? null : 50;
    const focusY = typeof body.image_focus_y === "number" ? clampPct(body.image_focus_y) : body.image_focus_y === null ? null : 50;
    const zoom = typeof body.image_zoom === "number" ? clampZoom(body.image_zoom) : body.image_zoom === null ? null : 1;

    const { data, error } = await supabase
      .from("marketplace_items")
      .insert({
        vendor_id: vendor.id,
        title,
        summary: typeof body.summary === "string" ? body.summary.trim() : body.summary ?? null,
        price,
        price_text: typeof body.price_text === "string" ? body.price_text.trim() : body.price_text ?? null,
        image_url: typeof body.image_url === "string" ? body.image_url.trim() : body.image_url ?? null,
        image_focus_x: focusX,
        image_focus_y: focusY,
        image_zoom: zoom,
        is_active: typeof body.is_active === "boolean" ? body.is_active : true,
      })
      .select(
        "id,vendor_id,title,summary,price,price_text,is_active,image_url,image_focus_x,image_focus_y,image_zoom,updated_at"
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ marketplaceItem: data as MarketplaceItemRow }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const body = ((await req.json()) ?? {}) as PatchBody;

    if (typeof body.id !== "number") {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const patch: Record<string, any> = {};
    if (typeof body.title === "string") patch.title = body.title.trim();
    if (typeof body.summary === "string" || body.summary === null) patch.summary = typeof body.summary === "string" ? body.summary.trim() : null;
    if (typeof body.price === "number") patch.price = body.price;
    if (typeof body.price_text === "string" || body.price_text === null) patch.price_text = typeof body.price_text === "string" ? body.price_text.trim() : null;
    if (typeof body.is_active === "boolean") patch.is_active = body.is_active;
    if (typeof body.image_url === "string" || body.image_url === null) patch.image_url = typeof body.image_url === "string" ? body.image_url.trim() : null;

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
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("marketplace_items")
      .update(patch)
      .eq("id", body.id)
      .eq("vendor_id", vendor.id)
      .select(
        "id,vendor_id,title,summary,price,price_text,is_active,image_url,image_focus_x,image_focus_y,image_zoom,updated_at"
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ marketplaceItem: data as MarketplaceItemRow }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    const { supabase, user } = await assertVendor(req);
    const vendor = await getVendorForUser(supabase, user.id);

    const { searchParams } = new URL(req.url);
    const idRaw = searchParams.get("id");
    const id = Number(idRaw);

    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { data: item, error: fetchErr } = await supabase
      .from("marketplace_items")
      .select("image_url")
      .eq("id", id)
      .eq("vendor_id", vendor.id)
      .single();

    if (fetchErr && fetchErr.code !== "PGRST116") {
      console.error("Error fetching marketplace_item for deletion:", fetchErr);
    }

    const { error } = await supabase.from("marketplace_items").delete().eq("id", id).eq("vendor_id", vendor.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (item?.image_url) {
      try {
        const url = new URL(item.image_url);
        const pathMatch = url.pathname.match(/\/(promos)\/(.+)$/);
        if (pathMatch) {
          const storagePath = `${pathMatch[1]}/${pathMatch[2]}`;
          const { error: storageError } = await supabase.storage
            .from("promo-assets")
            .remove([storagePath]);

          if (storageError) {
            console.error("Failed to delete marketplace image from storage:", storageError);
          }
        }
      } catch {
        if (item.image_url.includes("/promos/")) {
          const pathMatch = item.image_url.match(/promos\/.+$/);
          if (pathMatch) {
            const { error: storageError } = await supabase.storage
              .from("promo-assets")
              .remove([pathMatch[0]]);

            if (storageError) {
              console.error("Failed to delete marketplace image from storage:", storageError);
            }
          }
        }
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status });
  }
}
