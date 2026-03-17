"use client";

import { useEffect, useMemo, useState } from "react";

type Registration = {
  id: number;
  business_name: string;
  contact_email: string;
  contact_phone: string | null;
  category_id: number | null;
  location: string | null;
  website_url: string | null;
  plan_id: number | null;
  status: string;
  created_at: string;
  extra?: any;
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

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function SuperadminRegistrationsPage() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ registrations: Registration[] }>("/api/admin/registrations?limit=500");
      setRegistrations(res.registrations ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load registrations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return registrations.filter((r) => {
      if (statusFilter && String(r.status) !== statusFilter) return false;
      if (!q) return true;
      return (
        String(r.business_name ?? "").toLowerCase().includes(q) ||
        String(r.contact_email ?? "").toLowerCase().includes(q) ||
        String(r.id).includes(q)
      );
    });
  }, [registrations, query, statusFilter]);

  async function act(id: number, action: "approve" | "reject") {
    const admin_notes = window.prompt(action === "approve" ? "Admin notes (optional)" : "Reason / admin notes (optional)") ?? "";
    setError(null);
    setSavingId(id);
    try {
      const res = await apiFetch<{ registration: Registration }>("/api/admin/registrations", {
        method: "PATCH",
        body: JSON.stringify({ id, action, admin_notes: admin_notes.trim() ? admin_notes.trim() : null }),
      });
      setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, ...(res.registration as any) } : r)));
    } catch (e: any) {
      setError(e?.message ?? "Failed to update registration.");
    } finally {
      setSavingId(null);
    }
  }

  const uniqueStatuses = useMemo(() => {
    const s = new Set<string>();
    for (const r of registrations) s.add(String(r.status ?? ""));
    return Array.from(s).filter(Boolean).sort();
  }, [registrations]);

  return (
    <div className="grid gap-6">
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Registrations</div>
          <div className="mt-1 text-[12px] text-black/45">Approve or reject new vendor signups.</div>
        </div>

        <div className="p-6 grid gap-4">
          {error ? (
            <div className="rounded-[3px] border border-[#c17a4e]/30 bg-[#fff7ed] px-4 py-3 text-[13px] text-[#6e4f33]">
              {error}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-[1fr_200px_auto] sm:items-end">
            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                placeholder="Search by business name, email, or id"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
              >
                <option value="">All</option>
                {uniqueStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
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
            <div className="grid grid-cols-[80px_1.5fr_1.2fr_140px_190px] gap-0 bg-[#fcfbf9] text-[11px] font-semibold text-black/55 border-b border-black/5">
              <div className="px-3 py-2">ID</div>
              <div className="px-3 py-2">Business</div>
              <div className="px-3 py-2">Contact</div>
              <div className="px-3 py-2">Status</div>
              <div className="px-3 py-2">Actions</div>
            </div>

            {loading ? (
              <div className="p-4 text-[13px] text-black/50">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-[13px] text-black/50">No registrations found.</div>
            ) : (
              <div className="divide-y divide-black/5">
                {filtered.map((r) => {
                  const isSaving = savingId === r.id;
                  return (
                    <div key={r.id} className="grid grid-cols-[80px_1.5fr_1.2fr_140px_190px]">
                      <div className="px-3 py-3 text-[13px] text-black/60">{r.id}</div>
                      <div className="px-3 py-3">
                        <div className="text-[13px] font-semibold text-[#2c2c2c]">{r.business_name}</div>
                        <div className="mt-1 text-[11px] text-black/45">Created: {fmtDate(r.created_at)}</div>
                        {r.website_url ? (
                          <a
                            className="mt-1 block text-[11px] text-[#6e4f33] hover:underline"
                            href={r.website_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {r.website_url}
                          </a>
                        ) : null}
                      </div>
                      <div className="px-3 py-3">
                        <div className="text-[13px] text-black/70">{r.contact_email}</div>
                        {r.contact_phone ? <div className="mt-1 text-[12px] text-black/50">{r.contact_phone}</div> : null}
                      </div>
                      <div className="px-3 py-3">
                        <span className="inline-flex items-center rounded-[3px] border border-black/10 bg-white px-2 py-0.5 text-[11px] font-semibold text-black/60">
                          {r.status}
                        </span>
                      </div>
                      <div className="px-3 py-3 flex gap-2">
                        <button
                          type="button"
                          disabled={isSaving || r.status === "approved"}
                          onClick={() => act(r.id, "approve")}
                          className="h-8 px-3 rounded-[3px] border border-[#027a48]/20 bg-[#ecfdf3] text-[12px] font-semibold text-[#027a48] hover:bg-[#d1fadf] transition-colors disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={isSaving || r.status === "rejected"}
                          onClick={() => act(r.id, "reject")}
                          className="h-8 px-3 rounded-[3px] border border-[#b42318]/20 bg-[#fff1f3] text-[12px] font-semibold text-[#b42318] hover:bg-[#ffe4e8] transition-colors disabled:opacity-60"
                        >
                          Reject
                        </button>
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
