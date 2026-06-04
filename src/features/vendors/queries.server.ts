import type { SupabaseClient } from "@supabase/supabase-js";

export type VendorsSortKey = "alpha" | "rating" | "newest" | "saves" | "views" | "verified";

// Sanitize search input to prevent SQL injection
function sanitizeSearchInput(input: string): { sanitized: string; isValid: boolean } {
  // Limit query length
  if (input.length > 100) {
    return { sanitized: "", isValid: false };
  }
  
  // Validate input is a string (NoSQL injection check)
  if (typeof input !== "string") {
    return { sanitized: "", isValid: false };
  }
  
  // Remove SQL wildcards and dangerous characters
  // Keep alphanumeric, spaces, and basic punctuation for search
  const sanitized = input
    .replace(/[%_]/g, "") // Remove SQL wildcards
    .replace(/[<>'"&]/g, "") // Remove HTML/special chars that could cause issues
    .trim();
  
  return { sanitized, isValid: true };
}

export type CursorPaginationResult = {
  vendors: Omit<SearchVendorsRow, "total_count">[];
  nextCursor: number | null;
  hasMore: boolean;
};

export type VendorsQueryFilters = {
  q?: string;
  category?: string;
  location?: string;
  region?: string;
  affiliation?: string;
  theme?: string;
};

type SearchVendorsRow = {
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
  plan: { id: number | null; name: string | null } | null;
  save_count: number | null;
  view_count: number | null;
  updated_at: string | null;
  cover_image_url: string | null;
  document_verified: string | null;
  total_count: number | null;
};

type VendorsQueryResult = {
  vendors: Omit<SearchVendorsRow, "total_count">[];
  total: number;
};

export async function buildVendorsQuery({
  supabase,
  filters,
  sort,
  from,
  to,
}: {
  supabase: SupabaseClient;
  filters: VendorsQueryFilters;
  sort: VendorsSortKey;
  from?: number;
  to?: number;
}): Promise<VendorsQueryResult> {
  const q = (filters.q ?? "").trim();
  const category = (filters.category ?? "").trim();
  const location = (filters.location ?? "").trim();
  const region = (filters.region ?? "").trim();
  const affiliation = (filters.affiliation ?? "").trim();
  const theme = (filters.theme ?? "").trim();

  const safeQ = q ? sanitizeSearchInput(q).sanitized : "";
  const safeLocation = location ? sanitizeSearchInput(location).sanitized : "";

  const fromI = Math.max(0, from ?? 0);
  const toI = Math.max(fromI, to ?? fromI + 59);
  const regionId = region ? Number(region) : NaN;

  const { data, error } = await supabase.rpc("search_vendors", {
    p_q: safeQ || null,
    p_category_slug: category || null,
    p_affiliation_slug: affiliation || null,
    p_theme_slug: theme || null,
    p_location: safeLocation || null,
    p_region_id: Number.isFinite(regionId) ? regionId : null,
    p_sort: sort,
    p_from: fromI,
    p_to: toI,
  });

  if (error) throw error;

  const rows = (data ?? []) as SearchVendorsRow[];
  const total = rows.length > 0 ? Number(rows[0]?.total_count ?? 0) : 0;

  const vendors = rows.map(({ total_count: _total_count, ...rest }) => rest);
  return { vendors, total };
}

export async function buildVendorsQueryWithCursor({
  supabase,
  filters,
  sort,
  cursor,
  limit,
}: {
  supabase: SupabaseClient;
  filters: VendorsQueryFilters;
  sort: VendorsSortKey;
  cursor?: number;
  limit: number;
}): Promise<CursorPaginationResult> {
  const offset = Math.max(0, cursor ?? 0);
  const { vendors, total } = await buildVendorsQuery({
    supabase,
    filters,
    sort,
    from: offset,
    to: offset + limit - 1,
  });

  const hasMore = offset + vendors.length < total;
  const nextCursor = hasMore ? offset + vendors.length : null;

  return { vendors, nextCursor, hasMore };
}
