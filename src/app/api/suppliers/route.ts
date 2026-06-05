import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "../../../lib/supabaseServer";
import { attachCoverImages } from "../../../features/vendors/coverImages.server";
import { buildVendorsQuery } from "../../../features/vendors/queries.server";
import type { VendorWithSortFields, SortKey } from "../../../lib/vendorUtils";

export const dynamic = "force-dynamic";

// Cache-control helpers
// We keep force-dynamic because the vendors list can reflect saved-vendor state,
// but we still add Vary: Cookie so CDN layers correctly segment cached responses
// by session. Anonymous users (no cookie) will get full CDN cache hits.
const LIST_CACHE = "public, s-maxage=30, stale-while-revalidate=300, must-revalidate";
const SINGLE_CACHE = "public, s-maxage=120, stale-while-revalidate=600, must-revalidate";
const VARY = "Cookie, Accept-Encoding";

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
          "id,business_name,slug,logo_url,average_rating,review_count,location_text,city,document_verified,cover_focus_x,cover_focus_y,cover_zoom,card_cover_focus_x,card_cover_focus_y,card_cover_zoom,portrait_cover_focus_x,portrait_cover_focus_y,portrait_cover_zoom,plan:plans(id,name)"
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!vendor) {
        return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
      }

      const [vendorWithCover] = await attachCoverImages(supabase, [vendor as any]);
      return NextResponse.json(vendorWithCover, {
        headers: { "Cache-Control": SINGLE_CACHE, "Vary": VARY },
      });
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

    return NextResponse.json(
      { vendors: vendorAllItems, nextPage: hasMore ? page + 1 : null, hasMore, total },
      { headers: { "Cache-Control": LIST_CACHE, "Vary": VARY } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}
