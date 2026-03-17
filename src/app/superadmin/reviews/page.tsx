"use client";

import { useEffect, useMemo, useState } from "react";

type Review = {
  id: number;
  vendor_id: number;
  user_id: string;
  rating: number;
  review_text: string | null;
  status: "published" | "pending" | "flagged" | "removed" | string;
  helpful_count: number | null;
  created_at: string;
  updated_at: string;
  vendor?: { id: number; business_name: string; slug: string } | null;
  user?: { id: string; email: string } | null;
};

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.headers ?? {}),
      "content-type": "application/json",
    },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((json as any)?.error ?? "Request failed");
  }
  return json as T;
}

export default function SuperadminReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Review[]>([]);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ reviews: Review[] }>("/api/admin/reviews?limit=500");
      setItems(res.reviews ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => {
      return (
        String(x.id).includes(q) ||
        String(x.vendor?.business_name ?? "").toLowerCase().includes(q) ||
        String(x.vendor?.slug ?? "").toLowerCase().includes(q) ||
        String(x.user?.email ?? "").toLowerCase().includes(q) ||
        String(x.review_text ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  async function setStatus(id: number, status: string) {
    setError(null);
    setSavingId(id);
    try {
      const res = await apiFetch<{ review: Review }>("/api/admin/reviews", {
        method: "PATCH",
        body: JSON.stringify({ id, status }),
      });
      setItems((prev) => prev.map((x) => (x.id === id ? (res.review as any) : x)));
    } catch (e: any) {
      setError(e?.message ?? "Failed to update review.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Reviews</div>
          <div className="mt-1 text-[12px] text-black/45">Moderate reviews and status.</div>
        </div>

        <div className="p-6 grid gap-4">
          {error ? (
            <div className="rounded-[3px] border border-[#c17a4e]/30 bg-[#fff7ed] px-4 py-3 text-[13px] text-[#6e4f33]">
              {error}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                placeholder="Search"
              />
            </label>
            <button
              type="button"
              onClick={refresh}
              className="h-10 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="rounded-[3px] border border-black/10 overflow-hidden">
            <div className="grid grid-cols-[70px_1.2fr_1.1fr_90px_1.6fr_200px] gap-0 bg-[#fcfbf9] text-[11px] font-semibold text-black/55 border-b border-black/5">
              <div className="px-3 py-2">ID</div>
              <div className="px-3 py-2">Vendor</div>
              <div className="px-3 py-2">User</div>
              <div className="px-3 py-2">Rating</div>
              <div className="px-3 py-2">Review</div>
              <div className="px-3 py-2">Status</div>
            </div>

            {loading ? (
              <div className="p-4 text-[13px] text-black/50">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-[13px] text-black/50">No reviews found.</div>
            ) : (
              <div className="divide-y divide-black/5">
                {filtered.map((x) => (
                  <div key={x.id} className="grid grid-cols-[70px_1.2fr_1.1fr_90px_1.6fr_200px]">
                    <div className="px-3 py-3 text-[13px] text-black/60">{x.id}</div>

                    <div className="px-3 py-3">
                      <div className="text-[13px] font-semibold text-[#2c2c2c]">{x.vendor?.business_name ?? `Vendor #${x.vendor_id}`}</div>
                      {x.vendor?.slug ? (
                        <a
                          className="mt-1 block text-[11px] text-[#6e4f33] hover:underline"
                          href={`/vendors/${x.vendor.slug}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          /vendors/{x.vendor.slug}
                        </a>
                      ) : null}
                    </div>

                    <div className="px-3 py-3">
                      <div className="text-[13px] text-black/70">{x.user?.email ?? x.user_id}</div>
                    </div>

                    <div className="px-3 py-3 text-[13px] font-semibold text-black/70">{x.rating}</div>

                    <div className="px-3 py-3">
                      <div className="text-[12px] text-black/65 line-clamp-4">{x.review_text ?? ""}</div>
                      <div className="mt-1 text-[11px] text-black/45">Helpful: {x.helpful_count ?? 0}</div>
                    </div>

                    <div className="px-3 py-3 grid gap-2">
                      <select
                        value={String(x.status ?? "")}
                        disabled={savingId === x.id}
                        onChange={(e) => setStatus(x.id, e.target.value)}
                        className="h-9 w-full rounded-[3px] border border-black/10 bg-white px-2 text-[12px] text-black/70 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15 disabled:opacity-60"
                      >
                        <option value="published">published</option>
                        <option value="pending">pending</option>
                        <option value="flagged">flagged</option>
                        <option value="removed">removed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
