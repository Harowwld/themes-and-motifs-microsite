import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "../../../lib/supabaseServer";
import { attachCoverImages } from "../../../features/vendors/coverImages.server";
import { buildVendorsQuery } from "../../../features/vendors/queries.server";
import type { VendorWithSortFields, SortKey } from "../../../lib/vendorUtils";

export const dynamic = "force-dynamic";

type VendorWithCoverImage = VendorWithSortFields & { cover_image_url: string | null };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const slug = (searchParams.get("slug") ?? "").trim();

  const q = (searchParams.get("q") ?? "").trim();
  const category = (searchParams.get("category") ?? "").trim();
  const location = (searchParams.get("location") ?? "").trim();
  const region = (searchParams.get("region") ?? "").trim();
  const affiliation = (searchParams.get("affiliation") ?? "").trim();
  const theme = (searchParams.get("theme") ?? "").trim();

  const rawPage = searchParams.get("page") ?? "1";
  const rawSort = searchParams.get("vendorsSort") ?? "rating";
  const rawLimit = searchParams.get("limit") ?? "30";

  const limit = Math.max(1, Math.min(30, Number(rawLimit) || 30));
  const page = Math.max(1, Number(rawPage) || 1);

  const sort: SortKey =
    rawSort === "alpha" || rawSort === "newest" || rawSort === "saves" || rawSort === "views" ? rawSort : "rating";

  const supabase = createSupabaseServerClient();

  try {
    if (slug) {
      const { data: vendor, error } = await supabase
        .from("vendors")
        .select(
          "id,business_name,slug,logo_url,average_rating,review_count,location_text,city,verified_status,cover_focus_x,cover_focus_y,cover_zoom,plan:plans(id,name)"
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!vendor) {
        return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
      }

      const [vendorWithCover] = await attachCoverImages(supabase, [vendor as any]);
      return NextResponse.json(vendorWithCover);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { vendors, total } = await buildVendorsQuery({
      supabase,
      filters: { q, category, location, region, affiliation, theme },
      sort,
      from,
      to,
    });

    const vendorAllItems = (vendors ?? []) as VendorWithCoverImage[];
    const hasMore = from + vendorAllItems.length < total;

    return NextResponse.json({
      vendors: vendorAllItems,
      nextPage: hasMore ? page + 1 : null,
      hasMore,
      total,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}
