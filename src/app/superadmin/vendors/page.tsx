"use client";

import { useEffect, useMemo, useState } from "react";

type Plan = { id: number; name: string };

type Vendor = {
  id: number;
  business_name: string;
  slug: string;
  is_active: boolean | null;
  is_featured: boolean | null;
  average_rating: number | null;
  review_count: number | null;
  updated_at: string;
  plan_id: number | null;
  plan?: { id: number; name: string } | { id: number; name: string }[] | null;
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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[3px] border border-black/10 bg-white px-2 py-0.5 text-[11px] font-semibold text-black/60">
      {children}
    </span>
  );
}

export default function SuperadminVendorsPage() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [query, setQuery] = useState("");

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ vendors: Vendor[]; plans: Plan[] }>("/api/admin/vendors?limit=500");
      setVendors(res.vendors ?? []);
      setPlans(res.plans ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v) => {
      return (
        String(v.business_name ?? "").toLowerCase().includes(q) ||
        String(v.slug ?? "").toLowerCase().includes(q) ||
        String(v.id).includes(q)
      );
    });
  }, [vendors, query]);

  async function patchVendor(id: number, patch: Partial<Pick<Vendor, "is_active" | "is_featured" | "plan_id">>) {
    setError(null);
    setSavingId(id);
    try {
      const res = await apiFetch<{ vendor: Vendor }>("/api/admin/vendors", {
        method: "PATCH",
        body: JSON.stringify({ id, ...patch }),
      });
      const next = res.vendor;
      setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...next } : v)));
    } catch (e: any) {
      setError(e?.message ?? "Failed to update vendor.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Vendors</div>
          <div className="mt-1 text-[12px] text-black/45">Activate, feature, and assign plans.</div>
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
                placeholder="Search by name, slug, or id"
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
            <div className="grid grid-cols-[70px_1.6fr_1.1fr_120px_120px_1fr] gap-0 bg-[#fcfbf9] text-[11px] font-semibold text-black/55 border-b border-black/5">
              <div className="px-3 py-2">ID</div>
              <div className="px-3 py-2">Vendor</div>
              <div className="px-3 py-2">Slug</div>
              <div className="px-3 py-2">Active</div>
              <div className="px-3 py-2">Featured</div>
              <div className="px-3 py-2">Plan</div>
            </div>

            {loading ? (
              <div className="p-4 text-[13px] text-black/50">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-[13px] text-black/50">No vendors found.</div>
            ) : (
              <div className="divide-y divide-black/5">
                {filtered.map((v) => {
                  const planName = String(
                    (Array.isArray(v.plan) ? v.plan?.[0]?.name : v.plan?.name) ??
                      plans.find((p) => p.id === v.plan_id)?.name ??
                      ""
                  );

                  const isSaving = savingId === v.id;

                  return (
                    <div key={v.id} className="grid grid-cols-[70px_1.6fr_1.1fr_120px_120px_1fr]">
                      <div className="px-3 py-3 text-[13px] text-black/60">{v.id}</div>
                      <div className="px-3 py-3">
                        <div className="text-[13px] font-semibold text-[#2c2c2c]">{v.business_name}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge>{(v.review_count ?? 0).toString()} reviews</Badge>
                          <Badge>{(v.average_rating ?? 0).toFixed(1)} rating</Badge>
                        </div>
                      </div>
                      <div className="px-3 py-3">
                        <a
                          href={`/vendors/${v.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[13px] text-[#6e4f33] hover:underline"
                        >
                          {v.slug}
                        </a>
                      </div>
                      <div className="px-3 py-3">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => patchVendor(v.id, { is_active: !Boolean(v.is_active) })}
                          className={`h-8 w-full rounded-[3px] border text-[12px] font-semibold transition-colors disabled:opacity-60 ${
                            v.is_active
                              ? "border-[#027a48]/20 bg-[#ecfdf3] text-[#027a48] hover:bg-[#d1fadf]"
                              : "border-black/10 bg-white text-black/60 hover:bg-black/5"
                          }`}
                        >
                          {v.is_active ? "Active" : "Inactive"}
                        </button>
                      </div>
                      <div className="px-3 py-3">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => patchVendor(v.id, { is_featured: !Boolean(v.is_featured) })}
                          className={`h-8 w-full rounded-[3px] border text-[12px] font-semibold transition-colors disabled:opacity-60 ${
                            v.is_featured
                              ? "border-[#b54708]/20 bg-[#fff7ed] text-[#b54708] hover:bg-[#ffead5]"
                              : "border-black/10 bg-white text-black/60 hover:bg-black/5"
                          }`}
                        >
                          {v.is_featured ? "Featured" : "Not featured"}
                        </button>
                      </div>
                      <div className="px-3 py-3">
                        <select
                          value={v.plan_id ?? ""}
                          disabled={isSaving}
                          onChange={(e) => {
                            const raw = e.target.value;
                            patchVendor(v.id, { plan_id: raw === "" ? null : Number(raw) });
                          }}
                          className="h-8 w-full rounded-[3px] border border-black/10 bg-white px-2 text-[12px] text-black/70 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15 disabled:opacity-60"
                        >
                          <option value="">(No plan)</option>
                          {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        {planName ? (
                          <div className="mt-1 text-[11px] text-black/45">Current: {planName}</div>
                        ) : null}
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
