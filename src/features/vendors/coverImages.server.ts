import type { SupabaseClient } from "@supabase/supabase-js";

import type { VendorCoverImageRow } from "./types";

type AffiliationRow = {
  id: number;
  name: string;
  slug: string;
};

type VendorAffiliationJoinRow = {
  vendor_id: number;
  affiliation: AffiliationRow | AffiliationRow[] | null;
};

export async function getAffiliationsByVendorId(
  supabase: SupabaseClient,
  vendorIds: number[]
): Promise<Map<number, AffiliationRow[]>> {
  const ids = Array.from(new Set(vendorIds)).filter((id) => Number.isFinite(id));

  const affiliationsByVendorId = new Map<number, AffiliationRow[]>();
  if (ids.length === 0) return affiliationsByVendorId;

  const CHUNK_SIZE = 500;
  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const chunk = ids.slice(i, i + CHUNK_SIZE);
    const { data: rows } = await supabase
      .from("vendor_affiliations")
      .select("vendor_id,affiliation:affiliations(id,name,slug)")
      .in("vendor_id", chunk)
      .limit(Math.min(5000, chunk.length * 10));

    for (const row of ((rows ?? []) as VendorAffiliationJoinRow[])) {
      const aff = row.affiliation
        ? Array.isArray(row.affiliation)
          ? row.affiliation
          : [row.affiliation]
        : [];
      const existing = affiliationsByVendorId.get(row.vendor_id) ?? [];
      affiliationsByVendorId.set(row.vendor_id, [...existing, ...aff]);
    }
  }

  return affiliationsByVendorId;
}

export async function attachAffiliations<T extends { id: number }>(
  supabase: SupabaseClient,
  vendors: T[]
): Promise<Array<T & { affiliations: AffiliationRow[] }>> {
  const affiliationsByVendorId = await getAffiliationsByVendorId(
    supabase,
    vendors.map((v) => v.id)
  );

  return vendors.map((v) => ({
    ...v,
    affiliations: affiliationsByVendorId.get(v.id) ?? [],
  }));
}

export async function getCoverImagesByVendorId(
  supabase: SupabaseClient,
  vendorIds: number[]
): Promise<Map<number, string>> {
  const ids = Array.from(new Set(vendorIds)).filter((id) => Number.isFinite(id));

  const coverByVendorId = new Map<number, string>();
  if (ids.length === 0) return coverByVendorId;

  const CHUNK_SIZE = 500;
  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const chunk = ids.slice(i, i + CHUNK_SIZE);
    const { data: imageRows } = await supabase
      .from("vendor_images")
      .select("vendor_id,image_url,is_cover,display_order")
      .in("vendor_id", chunk)
      .order("is_cover", { ascending: false })
      .order("display_order", { ascending: true })
      .limit(Math.min(5000, chunk.length * 50));

    for (const row of ((imageRows ?? []) as VendorCoverImageRow[])) {
      if (!coverByVendorId.has(row.vendor_id)) {
        coverByVendorId.set(row.vendor_id, row.image_url);
      }
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
