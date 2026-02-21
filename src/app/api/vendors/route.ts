import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "../../../lib/supabaseServer";

export const dynamic = "force-dynamic";

type SortKey = "alpha" | "rating" | "newest" | "saves" | "views";

type CategoryRow = {
  id: number;
};

type VendorCategoryRow = {
  vendor_id: number;
};

type VendorAffiliationRow = {
  vendor_id: number;
};

type VendorImageRow = {
  vendor_id: number;
  image_url: string;
  is_cover: boolean | null;
  display_order: number | null;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") ?? "").trim();
  const category = (searchParams.get("category") ?? "").trim();
  const location = (searchParams.get("location") ?? "").trim();
  const region = (searchParams.get("region") ?? "").trim();
  const affiliation = (searchParams.get("affiliation") ?? "").trim();

  const rawPage = searchParams.get("vendorsPage") ?? "1";
  const rawSort = searchParams.get("vendorsSort") ?? "rating";
  const rawPageSize = searchParams.get("pageSize") ?? "12";

  const pageSize = Math.max(1, Math.min(30, Number(rawPageSize) || 12));
  const page = Math.max(1, Number(rawPage) || 1);

  const sort: SortKey =
    rawSort === "alpha" || rawSort === "newest" || rawSort === "saves" || rawSort === "views" ? rawSort : "rating";

  const supabase = createSupabaseServerClient();

  let vendorIds: number[] | undefined;
  let affiliationVendorIds: number[] | undefined;

  if (category) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", category).maybeSingle<CategoryRow>();

    if (cat?.id) {
      const { data: vcRows } = await supabase
        .from("vendor_categories")
        .select("vendor_id")
        .eq("category_id", cat.id)
        .limit(5000);

      vendorIds = ((vcRows ?? []) as VendorCategoryRow[]).map((r) => r.vendor_id);
      if (vendorIds.length === 0) vendorIds = [-1];
    } else {
      vendorIds = [-1];
    }
  }

  if (affiliation) {
    const { data: aff } = await supabase.from("affiliations").select("id").eq("slug", affiliation).maybeSingle<{ id: number }>();

    if (aff?.id) {
      const { data: vaRows } = await supabase
        .from("vendor_affiliations")
        .select("vendor_id")
        .eq("affiliation_id", aff.id)
        .limit(5000);

      affiliationVendorIds = ((vaRows ?? []) as VendorAffiliationRow[]).map((r) => r.vendor_id);
      if (affiliationVendorIds.length === 0) affiliationVendorIds = [-1];
    } else {
      affiliationVendorIds = [-1];
    }
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("vendors")
    .select("id,business_name,slug,logo_url,average_rating,review_count,location_text,city", { count: "exact" })
    .eq("is_active", true);

  if (vendorIds) {
    query = query.in("id", vendorIds);
  }

  if (affiliationVendorIds) {
    query = query.in("id", affiliationVendorIds);
  }

  if (q) {
    query = query.ilike("business_name", `%${q}%`);
  }

  if (location) {
    const locationLike = location
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .join("%");
    query = query.or(`city.ilike.%${locationLike}%,location_text.ilike.%${locationLike}%,address.ilike.%${locationLike}%`);
  }

  if (region) {
    const regionId = Number(region);
    if (!Number.isNaN(regionId)) {
      query = query.eq("region_id", regionId);
    }
  }

  if (sort === "alpha") {
    query = query.order("business_name", { ascending: true }).order("id", { ascending: true });
  } else if (sort === "newest") {
    query = query.order("updated_at", { ascending: false }).order("id", { ascending: false });
  } else if (sort === "saves") {
    query = query.order("save_count", { ascending: false }).order("id", { ascending: true });
  } else if (sort === "views") {
    query = query.order("view_count", { ascending: false }).order("id", { ascending: true });
  } else {
    query = query
      .order("average_rating", { ascending: false, nullsFirst: false })
      .order("review_count", { ascending: false, nullsFirst: false })
      .order("business_name", { ascending: true })
      .order("id", { ascending: true });
  }

  const { data: vendors, count, error } = await query.range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const vendorRows = (vendors ?? []) as Array<{ id: number }>;
  const ids = vendorRows.map((v) => v.id);

  const coverByVendorId = new Map<number, string>();
  if (ids.length > 0) {
    const { data: imageRows } = await supabase
      .from("vendor_images")
      .select("vendor_id,image_url,is_cover,display_order")
      .in("vendor_id", ids)
      .order("is_cover", { ascending: false })
      .order("display_order", { ascending: true })
      .limit(Math.min(500, ids.length * 3));

    for (const row of ((imageRows ?? []) as VendorImageRow[])) {
      if (!coverByVendorId.has(row.vendor_id)) {
        coverByVendorId.set(row.vendor_id, row.image_url);
      }
    }
  }

  const withCovers = (vendors ?? []).map((v: any) => ({
    ...v,
    cover_image_url: coverByVendorId.get(v.id) ?? null,
  }));

  return NextResponse.json({
    vendors: withCovers,
    total: count ?? 0,
    page,
    pageSize,
  });
}
