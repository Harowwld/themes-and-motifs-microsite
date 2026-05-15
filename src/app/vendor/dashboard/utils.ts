export function clampPct(v: number) {
  if (!Number.isFinite(v)) return 50;
  return Math.max(0, Math.min(100, v));
}

export function clampZoom(v: number) {
  if (!Number.isFinite(v)) return 1;
  return Math.max(1, Math.min(3, v));
}

export function ensureSingleCover<T extends { is_cover: boolean | null }>(rows: T[]) {
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

export const SOCIAL_PLATFORM_OPTIONS = ["facebook", "instagram", "tiktok", "x", "pinterest", "youtube", "website", "linkedin", "other"] as const;

export function isKnownPlatform(p: string) {
  return SOCIAL_PLATFORM_OPTIONS.includes((p ?? "").trim().toLowerCase() as any);
}
