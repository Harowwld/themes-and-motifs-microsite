import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "../../../lib/supabaseServer";
import { attachCoverImages } from "../../../features/vendors/coverImages.server";
import { buildVendorsQuery } from "../../../features/vendors/queries.server";

export const dynamic = "force-dynamic";

type SortKey = "alpha" | "rating" | "newest" | "saves" | "views";

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
  });

  const { data: vendors, count, error } = await query.range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const withCovers = await attachCoverImages(supabase, (vendors ?? []) as Array<{ id: number }>);

  return NextResponse.json({
    vendors: withCovers,
    total: count ?? 0,
    page,
    pageSize,
  });
}
