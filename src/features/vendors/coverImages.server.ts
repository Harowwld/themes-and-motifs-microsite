import type { SupabaseClient } from "@supabase/supabase-js";

import type { VendorCoverImageRow } from "./types";

export async function getCoverImagesByVendorId(
  supabase: SupabaseClient,
  vendorIds: number[]
): Promise<Map<number, string>> {
  const ids = Array.from(new Set(vendorIds)).filter((id) => Number.isFinite(id));

  const coverByVendorId = new Map<number, string>();
  if (ids.length === 0) return coverByVendorId;

  const { data: imageRows } = await supabase
    .from("vendor_images")
    .select("vendor_id,image_url,is_cover,display_order")
    .in("vendor_id", ids)
    .order("is_cover", { ascending: false })
    .order("display_order", { ascending: true })
    .limit(Math.min(500, ids.length * 3));

  for (const row of ((imageRows ?? []) as VendorCoverImageRow[])) {
    if (!coverByVendorId.has(row.vendor_id)) {
      coverByVendorId.set(row.vendor_id, row.image_url);
    }
  }

  return coverByVendorId;
}

export async function attachCoverImages<T extends { id: number }>(
  supabase: SupabaseClient,
  vendors: T[]
): Promise<Array<T & { cover_image_url: string | null }>> {
  const coverByVendorId = await getCoverImagesByVendorId(
    supabase,
    vendors.map((v) => v.id)
  );

  return vendors.map((v) => ({
    ...v,
    cover_image_url: coverByVendorId.get(v.id) ?? null,
  }));
}
