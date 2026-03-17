"use client";

import { useEffect, useMemo, useState } from "react";

type Promo = {
  id: number;
  vendor_id: number;
  title: string;
  summary: string | null;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  updated_at: string;
  vendors?: { business_name?: string; slug?: string } | null;
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

function fmtDate(iso: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

export default function SuperadminPromosPage() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [promos, setPromos] = useState<Promo[]>([]);
  const [query, setQuery] = useState("");

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ promos: Promo[] }>("/api/admin/promos?limit=500");
      setPromos(res.promos ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load promos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return promos;
    return promos.filter((p) => {
      return (
        String(p.title ?? "").toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        String(p.vendor_id).includes(q) ||
        String(p.vendors?.business_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [promos, query]);

  async function patchPromo(id: number, patch: Partial<Promo>) {
    setError(null);
    setSavingId(id);
    try {
      const res = await apiFetch<{ promo: Promo }>("/api/admin/promos", {
        method: "PATCH",
        body: JSON.stringify({ id, ...patch }),
      });
      setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, ...(res.promo as any) } : p)));
    } catch (e: any) {
      setError(e?.message ?? "Failed to update promo.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Promos</div>
          <div className="mt-1 text-[12px] text-black/45">Manage active promos and featured deals.</div>
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
                placeholder="Search by title, vendor, id"
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
            <div className="grid grid-cols-[70px_1.6fr_1.2fr_120px_120px_200px] gap-0 bg-[#fcfbf9] text-[11px] font-semibold text-black/55 border-b border-black/5">
              <div className="px-3 py-2">ID</div>
              <div className="px-3 py-2">Promo</div>
              <div className="px-3 py-2">Vendor</div>
              <div className="px-3 py-2">Active</div>
              <div className="px-3 py-2">Featured</div>
              <div className="px-3 py-2">Validity</div>
            </div>

            {loading ? (
              <div className="p-4 text-[13px] text-black/50">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-[13px] text-black/50">No promos found.</div>
            ) : (
              <div className="divide-y divide-black/5">
                {filtered.map((p) => {
                  const isSaving = savingId === p.id;
                  return (
                    <div key={p.id} className="grid grid-cols-[70px_1.6fr_1.2fr_120px_120px_200px]">
                      <div className="px-3 py-3 text-[13px] text-black/60">{p.id}</div>
                      <div className="px-3 py-3">
                        <div className="text-[13px] font-semibold text-[#2c2c2c]">{p.title}</div>
                        {p.summary ? <div className="mt-1 text-[12px] text-black/50">{p.summary}</div> : null}
                      </div>
                      <div className="px-3 py-3">
                        <div className="text-[13px] text-black/70">{p.vendors?.business_name ?? `Vendor #${p.vendor_id}`}</div>
                        {p.vendors?.slug ? (
                          <a
                            className="mt-1 block text-[11px] text-[#6e4f33] hover:underline"
                            href={`/vendors/${p.vendors.slug}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            /vendors/{p.vendors.slug}
                          </a>
                        ) : null}
                      </div>
                      <div className="px-3 py-3">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => patchPromo(p.id, { is_active: !Boolean(p.is_active) })}
                          className={`h-8 w-full rounded-[3px] border text-[12px] font-semibold transition-colors disabled:opacity-60 ${
                            p.is_active
                              ? "border-[#027a48]/20 bg-[#ecfdf3] text-[#027a48] hover:bg-[#d1fadf]"
                              : "border-black/10 bg-white text-black/60 hover:bg-black/5"
                          }`}
                        >
                          {p.is_active ? "Active" : "Inactive"}
                        </button>
                      </div>
                      <div className="px-3 py-3">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => patchPromo(p.id, { is_featured: !Boolean(p.is_featured) })}
                          className={`h-8 w-full rounded-[3px] border text-[12px] font-semibold transition-colors disabled:opacity-60 ${
                            p.is_featured
                              ? "border-[#b54708]/20 bg-[#fff7ed] text-[#b54708] hover:bg-[#ffead5]"
                              : "border-black/10 bg-white text-black/60 hover:bg-black/5"
                          }`}
                        >
                          {p.is_featured ? "Featured" : "Not featured"}
                        </button>
                      </div>
                      <div className="px-3 py-3 text-[12px] text-black/60">
                        {fmtDate(p.valid_from)} {p.valid_to ? `→ ${fmtDate(p.valid_to)}` : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
