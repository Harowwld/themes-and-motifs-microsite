import type { SupabaseClient } from "@supabase/supabase-js";

export type VendorsSortKey = "alpha" | "rating" | "newest" | "saves" | "views";

export type CursorPaginationResult = {
  vendors: any[];
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

type CategoryRow = {
  id: number;
};

type VendorCategoryRow = {
  vendor_id: number;
};

type VendorAffiliationRow = {
  vendor_id: number;
};

type VendorThemeRow = {
  vendor_id: number;
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
}): Promise<{ query: any; count: number }> {
  const q = (filters.q ?? "").trim();
  const category = (filters.category ?? "").trim();
  const location = (filters.location ?? "").trim();
  const region = (filters.region ?? "").trim();
  const affiliation = (filters.affiliation ?? "").trim();
  const theme = (filters.theme ?? "").trim();

  const [categoryLookup, affiliationLookup, themeLookup] = await Promise.all([
    category
      ? (async () => {
          const { data: cat } = await supabase
            .from("categories")
            .select("id")
            .eq("slug", category)
            .maybeSingle<CategoryRow>();
          if (!cat?.id) return [-1];
          const { data: vcRows } = await supabase
            .from("vendor_categories")
            .select("vendor_id")
            .eq("category_id", cat.id)
            .limit(5000);
          const ids = ((vcRows ?? []) as VendorCategoryRow[]).map((r) => r.vendor_id);
          return ids.length > 0 ? ids : [-1];
        })()
      : Promise.resolve<number[] | undefined>(undefined),
    affiliation
      ? (async () => {
          const { data: aff } = await supabase
            .from("affiliations")
            .select("id")
            .eq("slug", affiliation)
            .maybeSingle<{ id: number }>();
          if (!aff?.id) return [-1];
          const { data: vaRows } = await supabase
            .from("vendor_affiliations")
            .select("vendor_id")
            .eq("affiliation_id", aff.id)
            .limit(5000);
          const ids = ((vaRows ?? []) as VendorAffiliationRow[]).map((r) => r.vendor_id);
          return ids.length > 0 ? ids : [-1];
        })()
      : Promise.resolve<number[] | undefined>(undefined),
    theme
      ? (async () => {
          const { data: thm } = await supabase
            .from("themes")
            .select("id")
            .eq("slug", theme)
            .maybeSingle<{ id: number }>();
          if (!thm?.id) return [-1];
          const { data: vtRows } = await supabase
            .from("vendor_themes")
            .select("vendor_id")
            .eq("theme_id", thm.id)
            .limit(5000);
          const ids = ((vtRows ?? []) as VendorThemeRow[]).map((r) => r.vendor_id);
          return ids.length > 0 ? ids : [-1];
        })()
      : Promise.resolve<number[] | undefined>(undefined),
  ]);

  const vendorIds = categoryLookup;
  const affiliationVendorIds = affiliationLookup;
  const themeVendorIds = themeLookup;

  let query = supabase
    .from("vendors")
    .select(
      "id,business_name,slug,logo_url,average_rating,review_count,location_text,city,cover_focus_x,cover_focus_y,cover_zoom,plan:plans(id,name),save_count,view_count,updated_at",
      {
      count: "exact",
      }
    )
    .eq("is_active", true);

  if (vendorIds) {
    query = query.in("id", vendorIds);
  }
  if (affiliationVendorIds) {
    query = query.in("id", affiliationVendorIds);
  }
  if (themeVendorIds) {
    query = query.in("id", themeVendorIds);
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

    query = query.or(
      `city.ilike.%${locationLike}%,location_text.ilike.%${locationLike}%,address.ilike.%${locationLike}%`
    );
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

  if (from !== undefined && to !== undefined) {
    query = query.range(from, to);
  }

  return { query, count: 0 };
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
  const q = (filters.q ?? "").trim();
  const category = (filters.category ?? "").trim();
  const location = (filters.location ?? "").trim();
  const region = (filters.region ?? "").trim();
  const affiliation = (filters.affiliation ?? "").trim();
  const theme = (filters.theme ?? "").trim();

  const [categoryLookup, affiliationLookup, themeLookup] = await Promise.all([
    category
      ? (async () => {
          const { data: cat } = await supabase
            .from("categories")
            .select("id")
            .eq("slug", category)
            .maybeSingle<CategoryRow>();
          if (!cat?.id) return [-1];
          const { data: vcRows } = await supabase
            .from("vendor_categories")
            .select("vendor_id")
            .eq("category_id", cat.id)
            .limit(5000);
          const ids = ((vcRows ?? []) as VendorCategoryRow[]).map((r) => r.vendor_id);
          return ids.length > 0 ? ids : [-1];
        })()
      : Promise.resolve<number[] | undefined>(undefined),
    affiliation
      ? (async () => {
          const { data: aff } = await supabase
            .from("affiliations")
            .select("id")
            .eq("slug", affiliation)
            .maybeSingle<{ id: number }>();
          if (!aff?.id) return [-1];
          const { data: vaRows } = await supabase
            .from("vendor_affiliations")
            .select("vendor_id")
            .eq("affiliation_id", aff.id)
            .limit(5000);
          const ids = ((vaRows ?? []) as VendorAffiliationRow[]).map((r) => r.vendor_id);
          return ids.length > 0 ? ids : [-1];
        })()
      : Promise.resolve<number[] | undefined>(undefined),
    theme
      ? (async () => {
          const { data: thm } = await supabase
            .from("themes")
            .select("id")
            .eq("slug", theme)
            .maybeSingle<{ id: number }>();
          if (!thm?.id) return [-1];
          const { data: vtRows } = await supabase
            .from("vendor_themes")
            .select("vendor_id")
            .eq("theme_id", thm.id)
            .limit(5000);
          const ids = ((vtRows ?? []) as VendorThemeRow[]).map((r) => r.vendor_id);
          return ids.length > 0 ? ids : [-1];
        })()
      : Promise.resolve<number[] | undefined>(undefined),
  ]);

  const vendorIds = categoryLookup;
  const affiliationVendorIds = affiliationLookup;
  const themeVendorIds = themeLookup;

  let query = supabase
    .from("vendors")
    .select(
      "id,business_name,slug,logo_url,average_rating,review_count,location_text,city,cover_focus_x,cover_focus_y,cover_zoom,plan:plans(id,name),save_count,view_count,updated_at",
      { count: "exact" }
    )
    .eq("is_active", true);

  if (vendorIds) {
    query = query.in("id", vendorIds);
  }
  if (affiliationVendorIds) {
    query = query.in("id", affiliationVendorIds);
  }
  if (themeVendorIds) {
    query = query.in("id", themeVendorIds);
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

    query = query.or(
      `city.ilike.%${locationLike}%,location_text.ilike.%${locationLike}%,address.ilike.%${locationLike}%`
    );
  }

  if (region) {
    const regionId = Number(region);
    if (!Number.isNaN(regionId)) {
      query = query.eq("region_id", regionId);
    }
  }

  // Apply cursor filter
  if (cursor && cursor > 0) {
    query = query.gt("id", cursor);
  }

  // Apply sorting - must be consistent for cursor pagination
  if (sort === "alpha") {
    query = query.order("business_name", { ascending: true }).order("id", { ascending: true });
  } else if (sort === "newest") {
    query = query.order("updated_at", { ascending: false }).order("id", { ascending: false });
  } else if (sort === "saves") {
    query = query.order("save_count", { ascending: false }).order("id", { ascending: true });
  } else if (sort === "views") {
    query = query.order("view_count", { ascending: false }).order("id", { ascending: true });
  } else {
    // rating (default)
    query = query
      .order("average_rating", { ascending: false, nullsFirst: false })
      .order("review_count", { ascending: false, nullsFirst: false })
      .order("business_name", { ascending: true })
      .order("id", { ascending: true });
  }

  // Get one extra to determine if there's more
  query = query.limit(limit + 1);

  const { data: vendors, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const vendorList = (vendors ?? []) as any[];
  const hasMore = vendorList.length > limit;
  
  // Remove the extra item used for checking hasMore
  const resultVendors = hasMore ? vendorList.slice(0, limit) : vendorList;
  
  // Get the last ID as next cursor
  const nextCursor = hasMore && resultVendors.length > 0 
    ? resultVendors[resultVendors.length - 1].id 
    : null;

  return {
    vendors: resultVendors,
    nextCursor,
    hasMore,
  };
}
