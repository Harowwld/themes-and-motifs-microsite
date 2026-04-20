export type SortKey = "alpha" | "rating" | "newest" | "saves" | "views";

export type VendorWithSortFields = {
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
  cover_image_url?: string | null;
};

export function hasImages(vendor: { cover_image_url?: string | null; logo_url?: string | null }) {
  return Boolean((vendor.cover_image_url ?? "").trim() || (vendor.logo_url ?? "").trim());
}

export function sortVendors<T extends VendorWithSortFields>(vendors: T[], sort: SortKey): T[] {
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
