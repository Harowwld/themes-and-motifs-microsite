import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "../../../lib/supabaseServer";
import { attachCoverImages } from "../../../features/vendors/coverImages.server";
import { buildVendorsQuery } from "../../../features/vendors/queries.server";
import { sortVendors, VendorWithSortFields, SortKey } from "../../../lib/vendorUtils";

export const dynamic = "force-dynamic";

type VendorWithCoverImage = VendorWithSortFields & { cover_image_url: string | null };

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
