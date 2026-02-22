import type { SupabaseClient } from "@supabase/supabase-js";

export type VendorsSortKey = "alpha" | "rating" | "newest" | "saves" | "views";

export type VendorsQueryFilters = {
  q?: string;
  category?: string;
  location?: string;
  region?: string;
  affiliation?: string;
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

export async function buildVendorsQuery({
  supabase,
  filters,
  sort,
}: {
  supabase: SupabaseClient;
  filters: VendorsQueryFilters;
  sort: VendorsSortKey;
}): Promise<{ query: any }> {
  const q = (filters.q ?? "").trim();
  const category = (filters.category ?? "").trim();
  const location = (filters.location ?? "").trim();
  const region = (filters.region ?? "").trim();
  const affiliation = (filters.affiliation ?? "").trim();

  let vendorIds: number[] | undefined;
  let affiliationVendorIds: number[] | undefined;

  if (category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .maybeSingle<CategoryRow>();

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
    const { data: aff } = await supabase
      .from("affiliations")
      .select("id")
      .eq("slug", affiliation)
      .maybeSingle<{ id: number }>();

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

  let query = supabase
    .from("vendors")
    .select("id,business_name,slug,logo_url,average_rating,review_count,location_text,city", {
      count: "exact",
    })
    .eq("is_active", true);

  if (vendorIds) query = query.in("id", vendorIds);
  if (affiliationVendorIds) query = query.in("id", affiliationVendorIds);

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

  return { query };
}
