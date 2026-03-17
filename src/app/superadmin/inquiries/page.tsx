"use client";

import { useEffect, useMemo, useState } from "react";

type Inquiry = {
  id: number;
  vendor_id: number;
  user_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  wedding_date: string | null;
  message: string;
  status: "new" | "read" | "replied" | "archived" | string;
  created_at: string;
  updated_at: string;
  vendor?: { id: number; business_name: string; slug: string } | null;
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

function fmtDate(iso: any) {
  const s = String(iso ?? "");
  if (!s) return "";
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
}

export default function SuperadminInquiriesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Inquiry[]>([]);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ inquiries: Inquiry[] }>("/api/admin/inquiries?limit=500");
      setItems(res.inquiries ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load inquiries.");
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
        String(x.name ?? "").toLowerCase().includes(q) ||
        String(x.email ?? "").toLowerCase().includes(q) ||
        String(x.phone ?? "").toLowerCase().includes(q) ||
        String(x.message ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  async function updateStatus(id: number, status: string) {
    setError(null);
    setSavingId(id);
    try {
      const res = await apiFetch<{ inquiry: Inquiry }>("/api/admin/inquiries", {
        method: "PATCH",
        body: JSON.stringify({ id, status }),
      });
      setItems((prev) => prev.map((x) => (x.id === id ? res.inquiry : x)));
    } catch (e: any) {
      setError(e?.message ?? "Failed to update inquiry.");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteInquiry(id: number) {
    if (!window.confirm("Delete this inquiry?")) return;
    setError(null);
    try {
      await apiFetch<{ ok: boolean }>(`/api/admin/inquiries?id=${encodeURIComponent(String(id))}`, { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete inquiry.");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Inquiries</div>
          <div className="mt-1 text-[12px] text-black/45">View inquiries sent to vendors.</div>
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
            <div className="grid grid-cols-[70px_160px_1.2fr_1.2fr_120px_120px] gap-0 bg-[#fcfbf9] text-[11px] font-semibold text-black/55 border-b border-black/5">
              <div className="px-3 py-2">ID</div>
              <div className="px-3 py-2">Created</div>
              <div className="px-3 py-2">Vendor</div>
              <div className="px-3 py-2">From / Message</div>
              <div className="px-3 py-2">Status</div>
              <div className="px-3 py-2">Actions</div>
            </div>

            {loading ? (
              <div className="p-4 text-[13px] text-black/50">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-[13px] text-black/50">No inquiries found.</div>
            ) : (
              <div className="divide-y divide-black/5">
                {filtered.map((x) => (
                  <div key={x.id} className="grid grid-cols-[70px_160px_1.2fr_1.2fr_120px_120px]">
                    <div className="px-3 py-3 text-[13px] text-black/60">{x.id}</div>
                    <div className="px-3 py-3 text-[12px] text-black/60">{fmtDate(x.created_at)}</div>

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
                      <div className="text-[12px] text-black/70">
                        {x.name ? <span className="font-semibold text-[#2c2c2c]">{x.name}</span> : null}
                        {x.email ? <span className="ml-2 text-black/55">{x.email}</span> : null}
                      </div>
                      {x.phone ? <div className="mt-1 text-[12px] text-black/50">{x.phone}</div> : null}
                      {x.wedding_date ? <div className="mt-1 text-[11px] text-black/45">Wedding date: {x.wedding_date}</div> : null}
                      <div className="mt-2 text-[12px] text-black/60 line-clamp-3">{x.message}</div>
                    </div>

                    <div className="px-3 py-3">
                      <select
                        value={String(x.status ?? "")}
                        disabled={savingId === x.id}
                        onChange={(e) => updateStatus(x.id, e.target.value)}
                        className="h-9 w-full rounded-[3px] border border-black/10 bg-white px-2 text-[12px] text-black/70 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15 disabled:opacity-60"
                      >
                        <option value="new">new</option>
                        <option value="read">read</option>
                        <option value="replied">replied</option>
                        <option value="archived">archived</option>
                      </select>
                    </div>

                    <div className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => deleteInquiry(x.id)}
                        className="h-9 w-full rounded-[3px] border border-[#b42318]/20 bg-[#fff1f3] text-[12px] font-semibold text-[#b42318] hover:bg-[#ffe4e8] transition-colors"
                      >
                        Delete
                      </button>
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
