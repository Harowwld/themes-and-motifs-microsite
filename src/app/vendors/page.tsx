import SiteHeader from "../sections/SiteHeader";
import SiteFooter from "../sections/SiteFooter";
import { createSupabaseServerClient } from "../../lib/supabaseServer";
import CategoryBrowser from "../CategoryBrowser";
import VendorsSearchBar from "./VendorsSearchBar";
import VirtualizedVendorsList from "./VirtualizedVendorsList";

type SortKey = "alpha" | "rating" | "newest" | "saves" | "views";

type VendorListItem = {
  id: number;
  business_name: string;
  slug: string;
  average_rating: number | null;
  review_count: number | null;
  location_text: string | null;
  city: string | null;
};

type CategoryRow = {
  id: number;
};

type CategoryListItem = {
  id: number;
  name: string;
  slug: string;
};

type VendorCategoryRow = {
  vendor_id: number;
};

type RegionRow = {
  id: number;
  name: string;
};

type AffiliationRow = {
  id: number;
  name: string;
  slug: string;
};

type VendorAffiliationRow = {
  vendor_id: number;
};

export default async function VendorsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = createSupabaseServerClient();
  const sp = (await searchParams) ?? {};

  const q = (sp.q as string | undefined)?.trim() || "";
  const category = (sp.category as string | undefined)?.trim() || "";
  const location = (sp.location as string | undefined)?.trim() || "";
  const region = (sp.region as string | undefined)?.trim() || "";
  const affiliation = (sp.affiliation as string | undefined)?.trim() || "";

  const pageSize = 12;
  const rawPage = (sp.vendorsPage as string | undefined) ?? "1";
  const rawSort = (sp.vendorsSort as string | undefined) ?? "rating";
  const page = Math.max(1, Number(rawPage) || 1);
  const sort: SortKey =
    rawSort === "alpha" || rawSort === "newest" || rawSort === "saves" || rawSort === "views" ? rawSort : "rating";

  const [regionsRes, affiliationsRes, categoriesRes] = await Promise.all([
    supabase.from("regions").select("id,name").is("parent_id", null).order("name", { ascending: true }).limit(200),
    supabase.from("affiliations").select("id,name,slug").order("name", { ascending: true }).limit(200),
    supabase.from("categories").select("id,name,slug").order("name", { ascending: true }).limit(200),
  ]);

  const regionsList = (regionsRes.data ?? []) as RegionRow[];
  const affiliationsList = (affiliationsRes.data ?? []) as AffiliationRow[];
  const categoriesList = (categoriesRes.data ?? []) as CategoryListItem[];

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

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("vendors")
    .select("id,business_name,slug,average_rating,review_count,location_text,city", { count: "exact" })
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
    query = query.or(`city.ilike.%${location}%,location_text.ilike.%${location}%`);
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

  const { data: vendors, count } = await query.range(from, to);

  const vendorPageItems = (vendors ?? []) as VendorListItem[];
  const vendorTotal = count ?? 0;

  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(circle at 20% 10%, #fff7ed, #fcfbf9 42%, #f6f1ea 92%)",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SiteHeader />

        <main className="py-10 sm:py-14">
          <VendorsSearchBar
            initialQ={q}
            initialCategory={category}
            initialLocation={location}
            initialRegion={region}
            initialAffiliation={affiliation}
            initialSort={sort}
            regions={regionsList}
            affiliations={affiliationsList}
          />

          <CategoryBrowser categories={categoriesList} />

          <VirtualizedVendorsList
            initialVendors={vendorPageItems}
            total={vendorTotal}
            pageSize={pageSize}
            initialPage={page}
            sort={sort}
            query={{ q, category, location, region, affiliation }}
          />
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
