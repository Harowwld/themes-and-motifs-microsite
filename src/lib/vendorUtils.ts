import { unstable_cache } from "next/cache";
import { createSupabaseServerClient } from "./supabaseServer";

export type SortKey = "alpha" | "rating" | "newest" | "saves" | "views" | "verified";

// Shared cached function for vendor locations - used by both LandingPage and VendorsPage
// Cache for 30 minutes (1800 seconds)
export const getCachedVendorLocations = unstable_cache(
  async () => {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("vendors").select("province_id,city,province:provinces(name),city_rel:cities(name)").eq("is_active", true).limit(5000);
    return data ?? [];
  },
  ["vendor-locations-v5"],
  { revalidate: 1800 }
);

export type VendorWithSortFields = {
  id: number;
  business_name: string;
  slug: string;
  logo_url: string | null;
  average_rating: number | null;
  review_count: number | null;
  city: string | null;
  province: { name: string } | null;
  city_rel: { name: string } | null;
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

export function isVerified(documentVerified: string | null | undefined): boolean {
  if (!documentVerified) return false;
  const statuses = documentVerified.split(",").map(s => s.trim());
  return statuses.includes("verified");
}

export function shouldShowVerifiedBadge(
  documentVerified: string | null | undefined,
  isPremium: boolean
): boolean {
  const statuses = (documentVerified ?? "").split(",").map(s => s.trim()).filter(Boolean);
  
  // 1. If explicitly verified, always show the blue checkmark
  if (statuses.includes("verified")) return true;

  // 2. If premium and has no verification statuses set (legacy/default fallback), show it
  if (isPremium && statuses.length === 0) {
    return true;
  }

  return false;
}


