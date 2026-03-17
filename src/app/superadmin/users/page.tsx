"use client";

import { useEffect, useMemo, useState } from "react";

type UserRow = Record<string, any> & { id: string };

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

export default function SuperadminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<UserRow[]>([]);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ users: UserRow[] }>("/api/admin/users?limit=500");
      setItems(res.users ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load users.");
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
    return items.filter((x) => JSON.stringify(x).toLowerCase().includes(q));
  }, [items, query]);

  async function patchUser(id: string, patch: Record<string, any>) {
    setError(null);
    setSavingId(id);
    try {
      const res = await apiFetch<{ user: UserRow }>("/api/admin/users", {
        method: "PATCH",
        body: JSON.stringify({ id, ...patch }),
      });
      setItems((prev) => prev.map((x) => (x.id === id ? (res.user as any) : x)));
    } catch (e: any) {
      setError(e?.message ?? "Failed to update user.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Users</div>
          <div className="mt-1 text-[12px] text-black/45">View users and roles.</div>
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
            <div className="grid grid-cols-[1.2fr_120px_120px_120px] gap-0 bg-[#fcfbf9] text-[11px] font-semibold text-black/55 border-b border-black/5">
              <div className="px-3 py-2">User</div>
              <div className="px-3 py-2">Role</div>
              <div className="px-3 py-2">Active</div>
              <div className="px-3 py-2">Verified</div>
            </div>

            {loading ? (
              <div className="p-4 text-[13px] text-black/50">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-[13px] text-black/50">No users found.</div>
            ) : (
              <div className="divide-y divide-black/5">
                {filtered.map((x) => {
                  const isSaving = savingId === x.id;
                  return (
                    <div key={x.id} className="grid grid-cols-[1.2fr_120px_120px_120px]">
                      <div className="px-3 py-3">
                        <div className="text-[13px] font-semibold text-[#2c2c2c]">{String(x.email ?? "")}</div>
                        <div className="mt-1 text-[11px] text-black/45">{x.id}</div>
                      </div>
                      <div className="px-3 py-3">
                        <select
                          value={String((x as any).role ?? "")}
                          disabled={isSaving}
                          onChange={(e) => patchUser(x.id, { role: e.target.value })}
                          className="h-9 w-full rounded-[3px] border border-black/10 bg-white px-2 text-[12px] text-black/70 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15 disabled:opacity-60"
                        >
                          <option value="user">user</option>
                          <option value="soon_to_wed">soon_to_wed</option>
                          <option value="vendor">vendor</option>
                          <option value="admin">admin</option>
                        </select>
                      </div>
                      <div className="px-3 py-3">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => patchUser(x.id, { is_active: !Boolean((x as any).is_active) })}
                          className={`h-9 w-full rounded-[3px] border text-[12px] font-semibold transition-colors disabled:opacity-60 ${
                            (x as any).is_active
                              ? "border-[#027a48]/20 bg-[#ecfdf3] text-[#027a48] hover:bg-[#d1fadf]"
                              : "border-black/10 bg-white text-black/60 hover:bg-black/5"
                          }`}
                        >
                          {(x as any).is_active ? "Active" : "Inactive"}
                        </button>
                      </div>
                      <div className="px-3 py-3">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => patchUser(x.id, { email_verified: !Boolean((x as any).email_verified) })}
                          className={`h-9 w-full rounded-[3px] border text-[12px] font-semibold transition-colors disabled:opacity-60 ${
                            (x as any).email_verified
                              ? "border-[#027a48]/20 bg-[#ecfdf3] text-[#027a48] hover:bg-[#d1fadf]"
                              : "border-black/10 bg-white text-black/60 hover:bg-black/5"
                          }`}
                        >
                          {(x as any).email_verified ? "Verified" : "Unverified"}
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
