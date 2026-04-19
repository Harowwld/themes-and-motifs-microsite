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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null);

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

  async function confirmDeleteUser() {
    if (!deletingUser) return;
    setError(null);
    setDeletingId(deletingUser.id);
    try {
      await apiFetch("/api/admin/users", {
        method: "DELETE",
        body: JSON.stringify({ id: deletingUser.id }),
      });
      setItems((prev) => prev.filter((x) => x.id !== deletingUser.id));
      setDeletingUser(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Soon to Weds</div>
          <div className="mt-1 text-[12px] text-black/45">View soon to wed accounts.</div>
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
            <div className="grid grid-cols-[1.2fr_120px_120px_80px] gap-0 bg-[#fcfbf9] text-[11px] font-semibold text-black/55 border-b border-black/5">
              <div className="px-3 py-2">User</div>
              <div className="px-3 py-2">Active</div>
              <div className="px-3 py-2">Verified</div>
              <div className="px-3 py-2"></div>
            </div>

            {loading ? (
              <div className="p-4 text-[13px] text-black/50">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-[13px] text-black/50">No soon to weds found.</div>
            ) : (
              <div className="divide-y divide-black/5">
                {filtered.map((x) => {
                  const isSaving = savingId === x.id;
                  return (
                    <div key={x.id} className="grid grid-cols-[1.2fr_120px_120px_80px]">
                      <div className="px-3 py-3">
                        <div className="text-[13px] font-semibold text-[#2c2c2c]">{String(x.email ?? "")}</div>
                        <div className="mt-1 text-[11px] text-black/45">{x.id}</div>
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
                      <div className="px-3 py-3">
                        <button
                          type="button"
                          disabled={deletingId === x.id}
                          onClick={() => setDeletingUser(x)}
                          className="h-9 w-full rounded-[3px] border border-red-200 bg-red-50 text-[12px] font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-60"
                        >
                          Delete
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

      {deletingUser ? (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeletingUser(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-[6px] border border-black/20 bg-white shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-black/10">
                <div className="text-[14px] font-semibold text-[#2c2c2c]">Delete User</div>
                <div className="mt-1 text-[12px] text-black/55">
                  Are you sure you want to delete this user? This action cannot be undone.
                </div>
              </div>
              <div className="px-5 py-4 bg-[#fafafa]">
                <div className="text-[13px] font-semibold text-[#2c2c2c]">{String(deletingUser.email ?? "")}</div>
                <div className="mt-1 text-[11px] text-black/45">{deletingUser.id}</div>
              </div>
              <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={!!deletingId}
                  onClick={() => setDeletingUser(null)}
                  className="h-9 px-4 rounded-[6px] border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!!deletingId}
                  onClick={confirmDeleteUser}
                  className="h-9 px-4 rounded-[6px] bg-red-600 text-white text-[12px] font-semibold hover:bg-red-700 disabled:opacity-60"
                >
                  {deletingId ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
