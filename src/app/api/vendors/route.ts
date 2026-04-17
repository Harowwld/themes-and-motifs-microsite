import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "../../../lib/supabaseServer";
import { attachCoverImages } from "../../../features/vendors/coverImages.server";
import { buildVendorsQuery } from "../../../features/vendors/queries.server";

export const dynamic = "force-dynamic";

type SortKey = "alpha" | "rating" | "newest" | "saves" | "views";

type VendorWithSortFields = {
  id: number;
  business_name: string;
  slug: string;
  logo_url: string | null;
  average_rating: number | null;
  review_count: number | null;
  location_text: string | null;
  city: string | null;
  cover_focus_x: number | null;
  cover_focus_y: number | null;
  cover_zoom: number | null;
  plan: { id: number; name: string } | { id: number; name: string }[] | null;
  save_count: number | null;
  view_count: number | null;
  updated_at: string | null;
};

type VendorWithCoverImage = VendorWithSortFields & { cover_image_url: string | null };

function hasImages(vendor: { cover_image_url?: string | null; logo_url?: string | null | null }) {
  return Boolean((vendor.cover_image_url ?? "").trim() || (vendor.logo_url ?? "").trim());
}

function sortVendors<T extends VendorWithSortFields>(vendors: T[], sort: SortKey): T[] {
  return [...vendors].sort((a, b) => {
    const aHas = hasImages(a);
    const bHas = hasImages(b);
    if (aHas !== bHas) return aHas ? -1 : 1;

    let primaryCmp = 0;

    switch (sort) {
      case "alpha":
        primaryCmp = (a.business_name ?? "").localeCompare(b.business_name ?? "");
        if (primaryCmp === 0) primaryCmp = a.id - b.id;
        break;
      case "newest":
        const aDate = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const bDate = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        primaryCmp = bDate - aDate || b.id - a.id;
        break;
      case "saves":
        primaryCmp = (b.save_count ?? 0) - (a.save_count ?? 0) || b.id - a.id;
        break;
      case "views":
        primaryCmp = (b.view_count ?? 0) - (a.view_count ?? 0) || b.id - a.id;
        break;
      case "rating":
      default:
        primaryCmp = (b.average_rating ?? 0) - (a.average_rating ?? 0);
        if (primaryCmp === 0) primaryCmp = (b.review_count ?? 0) - (a.review_count ?? 0);
        if (primaryCmp === 0) primaryCmp = (a.business_name ?? "").localeCompare(b.business_name ?? "");
        if (primaryCmp === 0) primaryCmp = a.id - b.id;
        break;
    }

    return primaryCmp;
  });
}

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

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { query } = await buildVendorsQuery({
    supabase,
    filters: { q, category, location, region, affiliation },
    sort,
    from,
    to,
  });

  const { data: vendors, count: vendorTotal, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const vendorAllItems = (vendors ?? []) as VendorWithSortFields[];

  const withCovers = await attachCoverImages(supabase, vendorAllItems) as VendorWithCoverImage[];
  const sorted = sortVendors(withCovers, sort);

  return NextResponse.json({
    vendors: sorted,
    total: vendorTotal,
    page,
    pageSize,
  });
}
