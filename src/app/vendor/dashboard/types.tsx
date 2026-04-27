import type React from "react";

export type VendorProfile = {
  id: number;
  user_id: string;
  business_name: string;
  slug: string;
  logo_url?: string | null;
  description: string | null;
  location_text: string | null;
  city: string | null;
  address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  cover_focus_x?: number | null;
  cover_focus_y?: number | null;
  cover_zoom?: number | null;
  plan_id: number | null;
  is_active: boolean | null;
  verified_status: string | null;
  plan?: { id: number; name: string } | { id: number; name: string }[] | null;
};

export type SocialLink = { id: number; platform: string; url: string };

export type VendorImage = {
  id: number;
  image_url: string;
  caption: string | null;
  is_cover: boolean | null;
  display_order: number | null;
};

export type VendorAlbum = {
  id: number;
  vendor_id: number;
  title: string;
  slug: string;
  photo_count: number;
  created_at: string;
};

export type AlbumPhoto = {
  id: number;
  vendor_id: number;
  album_id: number;
  image_url: string;
  display_order: number;
  created_at: string;
};

export type VendorPromo = {
  id: number;
  vendor_id: number;
  title: string;
  summary: string | null;
  terms: string | null;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean | null;
  image_url: string | null;
  discount_percentage: number | null;
  image_focus_x: number | null;
  image_focus_y: number | null;
  image_zoom: number | null;
  updated_at: string;
};

export const SOCIAL_PLATFORM_OPTIONS = ["facebook", "instagram", "tiktok", "x", "pinterest", "youtube", "website"] as const;
export type SocialPlatformOption = (typeof SOCIAL_PLATFORM_OPTIONS)[number] | "other";

export function isKnownPlatform(p: string) {
  return SOCIAL_PLATFORM_OPTIONS.includes((p ?? "").trim().toLowerCase() as any);
}

export function clampPct(v: number) {
  if (!Number.isFinite(v)) return 50;
  return Math.max(0, Math.min(100, v));
}

export function clampZoom(v: number) {
  if (!Number.isFinite(v)) return 1;
  return Math.max(1, Math.min(3, v));
}

export function ensureSingleCover<T extends { is_cover: boolean }>(rows: T[]) {
  let used = false;
  const normalized = rows.map((r) => {
    const v = Boolean((r as any).is_cover) && !used;
    if (v) used = true;
    return { ...r, is_cover: v };
  });
  if (!used && normalized.length > 0) {
    (normalized[0] as any).is_cover = true;
  }
  return normalized;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[12px] font-semibold text-black/55">{label}</span>
      {children}
    </label>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden="true"
    />
  );
}

export async function apiFetch<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((json as any)?.error ?? "Request failed");
  }
  return json as T;
}
