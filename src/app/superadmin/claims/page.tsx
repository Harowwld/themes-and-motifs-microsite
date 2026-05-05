"use client";

import { useEffect, useMemo, useState } from "react";

type Claim = {
  id: number;
  vendor_id: number;
  contact_email: string;
  contact_phone: string | null;
  business_name: string | null;
  status: string;
  admin_notes: string | null;
  documents: {
    dtiUrl?: string;
    secUrl?: string;
    businessPermitUrl?: string;
  } | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  vendor?: {
    id: number;
    business_name: string;
    slug: string;
  };
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

export default function SuperadminClaimsPage() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [claims, setClaims] = useState<Claim[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const statusParam = statusFilter ? `&status=${statusFilter}` : "";
      const res = await apiFetch<{ claims: Claim[] }>(`/api/admin/claims?limit=500${statusParam}`);
      setClaims(res.claims ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load claims.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [statusFilter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return claims.filter((c) => {
      if (!q) return true;
      return (
        String(c.vendor?.business_name ?? "").toLowerCase().includes(q) ||
        String(c.contact_email ?? "").toLowerCase().includes(q) ||
        String(c.id).includes(q)
      );
    });
  }, [claims, query]);

  async function act(id: number, action: "approve" | "reject" | "verify") {
    const admin_notes = action !== "verify" ? (window.prompt(action === "approve" ? "Admin notes (optional)" : "Reason / admin notes (optional)") ?? "") : undefined;
    setError(null);
    setSavingId(id);
    try {
      const res = await apiFetch<{ claim?: Claim; vendor?: { verified_status: string } }>("/api/admin/claims", {
        method: "PATCH",
        body: JSON.stringify({ id, action, admin_notes: admin_notes?.trim() ? admin_notes.trim() : null }),
      });
      if (action === "verify" && res.vendor) {
        setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, status: "verified" as const } : c)));
      } else if (res.claim) {
        setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, ...(res.claim as any) } : c)));
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to update claim.");
    } finally {
      setSavingId(null);
    }
  }

  const uniqueStatuses = useMemo(() => {
    const s = new Set<string>();
    for (const c of claims) s.add(String(c.status ?? ""));
    return Array.from(s).filter(Boolean).sort();
  }, [claims]);

  return (
    <div className="grid gap-6">
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Vendor Claims</div>
          <div className="mt-1 text-[12px] text-black/45">Approve or reject claims to link vendors to user accounts.</div>
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
                placeholder="Search by vendor, email, or id"
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
            <div className="grid grid-cols-[60px_1.2fr_1fr_1fr_120px_150px] gap-0 bg-[#fcfbf9] text-[11px] font-semibold text-black/55 border-b border-black/5">
              <div className="px-3 py-2">ID</div>
              <div className="px-3 py-2">Vendor</div>
              <div className="px-3 py-2">Contact</div>
              <div className="px-3 py-2">Documents</div>
              <div className="px-3 py-2">Status</div>
              <div className="px-3 py-2">Actions</div>
            </div>

            {loading ? (
              <div className="px-6 py-12 text-center text-[13px] text-black/40">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="px-6 py-12 text-center text-[13px] text-black/40">No claims found.</div>
            ) : (
              <div className="divide-y divide-black/5">
                {filtered.map((c) => (
                  <div key={c.id} className="grid grid-cols-[60px_1.2fr_1fr_1fr_120px_150px] gap-0 items-center text-[13px]">
                    <div className="px-3 py-3 text-black/50 font-mono">{c.id}</div>
                    <div className="px-3 py-3">
                      <div className="font-medium text-[#2c2c2c]">{c.vendor?.business_name ?? c.business_name ?? `Vendor #${c.vendor_id}`}</div>
                      <div className="text-[11px] text-black/40">vendor_id: {c.vendor_id}</div>
                    </div>
                    <div className="px-3 py-3">
                      <div className="text-[#2c2c2c]">{c.contact_email}</div>
                      {c.contact_phone && <div className="text-[11px] text-black/40">{c.contact_phone}</div>}
                    </div>
                    <div className="px-3 py-3">
                      {c.documents ? (
                        <div className="text-[11px] text-black/60">
                          {c.documents.dtiUrl && (
                            <a href={c.documents.dtiUrl} target="_blank" rel="noopener noreferrer" className="text-[#a67c52] hover:underline block">DTI</a>
                          )}
                          {c.documents.secUrl && (
                            <a href={c.documents.secUrl} target="_blank" rel="noopener noreferrer" className="text-[#a67c52] hover:underline block">SEC</a>
                          )}
                          {c.documents.businessPermitUrl && (
                            <a href={c.documents.businessPermitUrl} target="_blank" rel="noopener noreferrer" className="text-[#a67c52] hover:underline block">Permit</a>
                          )}
                          {!c.documents.dtiUrl && !c.documents.secUrl && !c.documents.businessPermitUrl && <span className="text-black/40">None</span>}
                        </div>
                      ) : (
                        <span className="text-[11px] text-black/40">None</span>
                      )}
                    </div>
                    <div className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          c.status === "pending"
                            ? "bg-[#fff7ed] text-[#6e4f33]"
                            : c.status === "approved"
                            ? "bg-[#ecfdf3] text-[#027a48]"
                            : c.status === "verified"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-[#fff1f3] text-[#b42318]"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <div className="px-3 py-3 flex gap-2">
                      {c.status === "pending" && (
                        <>
                          <button
                            type="button"
                            disabled={savingId === c.id}
                            onClick={() => act(c.id, "approve")}
                            className="px-3 h-8 rounded-[3px] bg-[#027a48] text-white text-[11px] font-medium hover:bg-[#046c4e] transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={savingId === c.id}
                            onClick={() => act(c.id, "reject")}
                            className="px-3 h-8 rounded-[3px] border border-[#b42318]/20 bg-white text-[#b42318] text-[11px] font-medium hover:bg-[#fff1f3] transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {c.status === "approved" && (
                        <button
                          type="button"
                          disabled={savingId === c.id}
                          onClick={() => act(c.id, "verify")}
                          className="px-3 h-8 rounded-[3px] bg-blue-600 text-white text-[11px] font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          Verify Business
                        </button>
                      )}
                      {(c.status === "rejected" || c.status === "verified") && (
                        <div className="text-[11px] text-black/40">
                          {c.reviewed_at ? fmtDate(c.reviewed_at) : "?"}
                        </div>
                      )}
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
