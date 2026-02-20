"use client";

import { useEffect, useMemo, useState } from "react";

type VendorRow = {
  id: number;
  business_name: string;
  slug: string;
  is_active: boolean | null;
  is_featured: boolean | null;
  average_rating: number | null;
  review_count: number | null;
  updated_at?: string;
};

type PromoRow = {
  id: number;
  vendor_id: number;
  title: string;
  summary: string | null;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  updated_at?: string;
  vendors?: { business_name: string; slug: string } | { business_name: string; slug: string }[] | null;
};

type RegistrationRow = {
  id: number;
  business_name: string;
  contact_email: string;
  contact_phone: string | null;
  category_id: number | null;
  location: string | null;
  website_url: string | null;
  plan_id: number | null;
  status: string | null;
  created_at?: string;
};

function normalizeVendorRef(v: PromoRow["vendors"]) {
  if (!v) return null;
  if (Array.isArray(v)) return v[0] ?? null;
  return v;
}

async function apiFetch<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      "content-type": "application/json",
      "x-admin-token": token,
    },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error ?? "Request failed");
  }
  return json as T;
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [promos, setPromos] = useState<PromoRow[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("tm_admin_token");
    if (saved) setToken(saved);
  }, []);

  const filteredVendors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v) => `${v.business_name} ${v.slug}`.toLowerCase().includes(q));
  }, [vendors, query]);

  const filteredPromos = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return promos;
    return promos.filter((p) => {
      const vr = normalizeVendorRef(p.vendors);
      return `${p.title} ${vr?.business_name ?? ""} ${vr?.slug ?? ""}`.toLowerCase().includes(q);
    });
  }, [promos, query]);

  const filteredRegistrations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return registrations;
    return registrations.filter((r) => `${r.business_name} ${r.contact_email} ${r.status ?? ""}`.toLowerCase().includes(q));
  }, [registrations, query]);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const [v, p, r] = await Promise.all([
        apiFetch<{ vendors: VendorRow[] }>("/api/admin/vendors?limit=300", token),
        apiFetch<{ promos: PromoRow[] }>("/api/admin/promos?limit=300", token),
        apiFetch<{ registrations: RegistrationRow[] }>("/api/admin/registrations?limit=300", token),
      ]);
      setVendors(v.vendors ?? []);
      setPromos(p.promos ?? []);
      setRegistrations(r.registrations ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function patchRegistration(id: number, action: "approve" | "reject") {
    setError(null);
    const prev = registrations;
    setRegistrations((rows) =>
      rows.map((r) => (r.id === id ? ({ ...r, status: action === "approve" ? "approved" : "rejected" } as RegistrationRow) : r))
    );

    try {
      const res = await apiFetch<{ registration: RegistrationRow; vendor?: { id: number; slug: string } }>(
        "/api/admin/registrations",
        token,
        {
          method: "PATCH",
          body: JSON.stringify({ id, action }),
        }
      );

      setRegistrations((rows) => rows.map((r) => (r.id === id ? res.registration : r)));

      if (action === "approve") {
        await refresh();
      }
    } catch (e: any) {
      setRegistrations(prev);
      setError(e?.message ?? "Update failed");
    }
  }

  async function patchVendor(id: number, patch: Partial<Pick<VendorRow, "is_active" | "is_featured">>) {
    setError(null);
    const prev = vendors;
    setVendors((rows) => rows.map((r) => (r.id === id ? ({ ...r, ...patch } as VendorRow) : r)));
    try {
      const res = await apiFetch<{ vendor: VendorRow }>("/api/admin/vendors", token, {
        method: "PATCH",
        body: JSON.stringify({ id, ...patch }),
      });
      setVendors((rows) => rows.map((r) => (r.id === id ? res.vendor : r)));
    } catch (e: any) {
      setVendors(prev);
      setError(e?.message ?? "Update failed");
    }
  }

  async function patchPromo(
    id: number,
    patch: Partial<Pick<PromoRow, "is_active" | "is_featured" | "valid_from" | "valid_to">>
  ) {
    setError(null);
    const prev = promos;
    setPromos((rows) => rows.map((r) => (r.id === id ? ({ ...r, ...patch } as PromoRow) : r)));
    try {
      const res = await apiFetch<{ promo: PromoRow }>("/api/admin/promos", token, {
        method: "PATCH",
        body: JSON.stringify({ id, ...patch }),
      });
      setPromos((rows) => rows.map((r) => (r.id === id ? res.promo : r)));
    } catch (e: any) {
      setPromos(prev);
      setError(e?.message ?? "Update failed");
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(circle at 20% 10%, #fff7ed, #fcfbf9 42%, #f6f1ea 92%)",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 py-10">
        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-black/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-[14px] font-semibold text-[#2c2c2c]">Admin</div>
              <div className="mt-1 text-[12px] text-black/50">Manage featured vendors and promos</div>
            </div>
            <button
              onClick={refresh}
              disabled={loading || token.trim().length === 0}
              className="h-9 inline-flex items-center justify-center px-3.5 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] disabled:opacity-60 transition-colors shadow-sm"
            >
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>

          <div className="p-5 grid gap-4">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="grid gap-1">
                <span className="text-[12px] font-semibold text-black/55">Admin token</span>
                <input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  onBlur={() => window.localStorage.setItem("tm_admin_token", token)}
                  placeholder="Enter token"
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-[12px] font-semibold text-black/55">Search</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter vendors/promos"
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                />
              </label>
            </div>

            {error ? (
              <div className="rounded-[3px] border border-[#c17a4e]/30 bg-[#fff7ed] px-4 py-3 text-[13px] text-[#6e4f33]">
                {error}
              </div>
            ) : null}

            <div className="grid gap-3">
              <div className="text-[13px] font-semibold text-[#2c2c2c]">Featured vendors</div>
              <div className="overflow-auto rounded-[3px] border border-black/10">
                <table className="min-w-[900px] w-full text-left text-[13px]">
                  <thead className="bg-[#fcfbf9] border-b border-black/10">
                    <tr>
                      <th className="px-3 py-2 font-semibold text-black/60">Vendor</th>
                      <th className="px-3 py-2 font-semibold text-black/60">Slug</th>
                      <th className="px-3 py-2 font-semibold text-black/60">Rating</th>
                      <th className="px-3 py-2 font-semibold text-black/60">Active</th>
                      <th className="px-3 py-2 font-semibold text-black/60">Featured</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVendors.map((v) => (
                      <tr key={v.id} className="border-b border-black/5">
                        <td className="px-3 py-2 font-semibold text-[#2c2c2c]">{v.business_name}</td>
                        <td className="px-3 py-2 text-black/60">{v.slug}</td>
                        <td className="px-3 py-2 text-black/60">
                          {v.average_rating ?? 0} ({v.review_count ?? 0})
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={Boolean(v.is_active)}
                            onChange={(e) => patchVendor(v.id, { is_active: e.target.checked })}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={Boolean(v.is_featured)}
                            onChange={(e) => patchVendor(v.id, { is_featured: e.target.checked })}
                          />
                        </td>
                      </tr>
                    ))}
                    {filteredVendors.length === 0 ? (
                      <tr>
                        <td className="px-3 py-8 text-black/50" colSpan={5}>
                          No vendors.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-3 pt-2">
              <div className="text-[13px] font-semibold text-[#2c2c2c]">Featured promos</div>
              <div className="overflow-auto rounded-[3px] border border-black/10">
                <table className="min-w-[1100px] w-full text-left text-[13px]">
                  <thead className="bg-[#fcfbf9] border-b border-black/10">
                    <tr>
                      <th className="px-3 py-2 font-semibold text-black/60">Promo</th>
                      <th className="px-3 py-2 font-semibold text-black/60">Vendor</th>
                      <th className="px-3 py-2 font-semibold text-black/60">Active</th>
                      <th className="px-3 py-2 font-semibold text-black/60">Featured</th>
                      <th className="px-3 py-2 font-semibold text-black/60">Valid from</th>
                      <th className="px-3 py-2 font-semibold text-black/60">Valid to</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPromos.map((p) => {
                      const vr = normalizeVendorRef(p.vendors);
                      return (
                        <tr key={p.id} className="border-b border-black/5">
                          <td className="px-3 py-2 font-semibold text-[#2c2c2c]">{p.title}</td>
                          <td className="px-3 py-2 text-black/60">{vr?.business_name ?? ""}</td>
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={Boolean(p.is_active)}
                              onChange={(e) => patchPromo(p.id, { is_active: e.target.checked })}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={Boolean(p.is_featured)}
                              onChange={(e) => patchPromo(p.id, { is_featured: e.target.checked })}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="date"
                              value={p.valid_from ?? ""}
                              onChange={(e) => patchPromo(p.id, { valid_from: e.target.value || null })}
                              className="h-9 rounded-[3px] border border-black/10 bg-white px-2 text-[13px] text-[#2c2c2c]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="date"
                              value={p.valid_to ?? ""}
                              onChange={(e) => patchPromo(p.id, { valid_to: e.target.value || null })}
                              className="h-9 rounded-[3px] border border-black/10 bg-white px-2 text-[13px] text-[#2c2c2c]"
                            />
                          </td>
                        </tr>
                      );
                    })}
                    {filteredPromos.length === 0 ? (
                      <tr>
                        <td className="px-3 py-8 text-black/50" colSpan={6}>
                          No promos.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-3 pt-2">
              <div className="text-[13px] font-semibold text-[#2c2c2c]">Registrations</div>
              <div className="overflow-auto rounded-[3px] border border-black/10">
                <table className="min-w-[1100px] w-full text-left text-[13px]">
                  <thead className="bg-[#fcfbf9] border-b border-black/10">
                    <tr>
                      <th className="px-3 py-2 font-semibold text-black/60">Business</th>
                      <th className="px-3 py-2 font-semibold text-black/60">Email</th>
                      <th className="px-3 py-2 font-semibold text-black/60">Phone</th>
                      <th className="px-3 py-2 font-semibold text-black/60">Status</th>
                      <th className="px-3 py-2 font-semibold text-black/60">Created</th>
                      <th className="px-3 py-2 font-semibold text-black/60">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map((r) => (
                      <tr key={r.id} className="border-b border-black/5">
                        <td className="px-3 py-2 font-semibold text-[#2c2c2c]">{r.business_name}</td>
                        <td className="px-3 py-2 text-black/60">{r.contact_email}</td>
                        <td className="px-3 py-2 text-black/60">{r.contact_phone ?? ""}</td>
                        <td className="px-3 py-2 text-black/60">{r.status ?? ""}</td>
                        <td className="px-3 py-2 text-black/60">
                          {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={loading || token.trim().length === 0 || r.status === "approved"}
                              onClick={() => patchRegistration(r.id, "approve")}
                              className="h-8 px-3 rounded-[3px] bg-[#a67c52] text-white text-[12px] font-semibold hover:bg-[#8e6a46] disabled:opacity-60 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={loading || token.trim().length === 0 || r.status === "rejected"}
                              onClick={() => patchRegistration(r.id, "reject")}
                              className="h-8 px-3 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-[#6e4f33] hover:bg-black/[0.02] disabled:opacity-60 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td className="px-3 py-8 text-black/50" colSpan={6}>
                          No registrations.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
