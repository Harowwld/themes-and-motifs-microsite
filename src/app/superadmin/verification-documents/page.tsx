"use client";

import { useEffect, useMemo, useState } from "react";

type DocRow = {
  id: number;
  vendor_id: number | null;
  registration_id: number | null;
  doc_type: string;
  file_url: string;
  file_name: string | null;
  status: "pending" | "approved" | "rejected" | string;
  uploaded_at: string;
  reviewed_at: string | null;
  notes: string | null;
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

export default function SuperadminVerificationDocumentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<DocRow[]>([]);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ documents: DocRow[] }>("/api/admin/verification-documents?limit=500");
      setItems(res.documents ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load documents.");
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
        String(x.vendor_id ?? "").includes(q) ||
        String(x.registration_id ?? "").includes(q) ||
        String(x.doc_type ?? "").toLowerCase().includes(q) ||
        String(x.file_name ?? "").toLowerCase().includes(q) ||
        String(x.status ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  async function patchDoc(id: number, patch: Record<string, any>) {
    setError(null);
    setSavingId(id);
    try {
      const res = await apiFetch<{ document: DocRow }>("/api/admin/verification-documents", {
        method: "PATCH",
        body: JSON.stringify({ id, ...patch }),
      });
      setItems((prev) => prev.map((x) => (x.id === id ? (res.document as any) : x)));
    } catch (e: any) {
      setError(e?.message ?? "Failed to update document.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Verification documents</div>
          <div className="mt-1 text-[12px] text-black/45">Approve or reject vendor documents.</div>
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
            <div className="grid grid-cols-[70px_140px_120px_1.2fr_200px_240px] gap-0 bg-[#fcfbf9] text-[11px] font-semibold text-black/55 border-b border-black/5">
              <div className="px-3 py-2">ID</div>
              <div className="px-3 py-2">Uploaded</div>
              <div className="px-3 py-2">Type</div>
              <div className="px-3 py-2">File</div>
              <div className="px-3 py-2">Status</div>
              <div className="px-3 py-2">Notes</div>
            </div>

            {loading ? (
              <div className="p-4 text-[13px] text-black/50">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-[13px] text-black/50">No documents found.</div>
            ) : (
              <div className="divide-y divide-black/5">
                {filtered.map((x) => (
                  <div key={x.id} className="grid grid-cols-[70px_140px_120px_1.2fr_200px_240px]">
                    <div className="px-3 py-3 text-[13px] text-black/60">{x.id}</div>
                    <div className="px-3 py-3 text-[12px] text-black/60">{fmtDate(x.uploaded_at)}</div>
                    <div className="px-3 py-3">
                      <div className="text-[13px] font-semibold text-[#2c2c2c]">{x.doc_type}</div>
                      <div className="mt-1 text-[11px] text-black/45">
                        vendor: {x.vendor_id ?? "-"} · reg: {x.registration_id ?? "-"}
                      </div>
                    </div>
                    <div className="px-3 py-3">
                      <a
                        href={x.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[12px] text-[#6e4f33] hover:underline"
                      >
                        {x.file_name ?? "Open file"}
                      </a>
                      <div className="mt-1 text-[11px] text-black/45 truncate">{x.file_url}</div>
                    </div>
                    <div className="px-3 py-3">
                      <select
                        value={String(x.status ?? "")}
                        disabled={savingId === x.id}
                        onChange={(e) =>
                          patchDoc(x.id, {
                            status: e.target.value,
                            reviewed_at: new Date().toISOString(),
                          })
                        }
                        className="h-9 w-full rounded-[3px] border border-black/10 bg-white px-2 text-[12px] text-black/70 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15 disabled:opacity-60"
                      >
                        <option value="pending">pending</option>
                        <option value="approved">approved</option>
                        <option value="rejected">rejected</option>
                      </select>
                      {x.reviewed_at ? <div className="mt-1 text-[11px] text-black/45">Reviewed: {fmtDate(x.reviewed_at)}</div> : null}
                    </div>
                    <div className="px-3 py-3 grid gap-2">
                      <div className="text-[12px] text-black/60 line-clamp-3">{x.notes ?? ""}</div>
                      <button
                        type="button"
                        disabled={savingId === x.id}
                        onClick={() => {
                          const notes = window.prompt("Notes (optional)", x.notes ?? "") ?? "";
                          patchDoc(x.id, {
                            notes: notes.trim() ? notes.trim() : null,
                            reviewed_at: new Date().toISOString(),
                          });
                        }}
                        className="h-9 w-full rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/5 transition-colors disabled:opacity-60"
                      >
                        Edit notes
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
