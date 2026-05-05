"use client";

import { useEffect, useMemo, useState } from "react";

type Editor = {
  id: string;
  user_id: string;
  email: string | null;
  name: string | null;
  can_edit_photos: boolean;
  can_edit_entries: boolean;
  created_at: string;
};

type PendingEditor = {
  user_id: string;
  email: string | null;
  name: string | null;
  created_at: string;
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

export default function SuperadminEditorsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Editor[]>([]);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Approve modal state
  const [editorToApprove, setEditorToApprove] = useState<PendingEditor | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Remove modal state
  const [editorToRemove, setEditorToRemove] = useState<Editor | null>(null);

  // Delete pending editor modal state
  const [pendingEditorToDelete, setPendingEditorToDelete] = useState<PendingEditor | null>(null);
  const [deletingPendingUserId, setDeletingPendingUserId] = useState<string | null>(null);

  // Add editor form state
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Pending editors state
  const [pendingEditors, setPendingEditors] = useState<PendingEditor[]>([]);
  const [pendingEditorsLoading, setPendingEditorsLoading] = useState(true);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ editors: Editor[] }>("/api/admin/editors?limit=500");
      setItems(res.editors ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load editors.");
    } finally {
      setLoading(false);
    }
  }

  async function refreshPendingEditors() {
    setPendingEditorsLoading(true);
    try {
      const res = await apiFetch<{ pendingEditors: PendingEditor[] }>("/api/admin/editors?pending=true&limit=50");
      setPendingEditors(res.pendingEditors ?? []);
    } catch (e: any) {
      // Silently fail
    } finally {
      setPendingEditorsLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    refreshPendingEditors();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (x) =>
        (x.email ?? "").toLowerCase().includes(q) ||
        (x.name ?? "").toLowerCase().includes(q)
    );
  }, [items, query]);

  async function addEditor(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setAddLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ editor: Editor }>("/api/admin/editors", {
        method: "POST",
        body: JSON.stringify({ email: newEmail.trim() }),
      });
      setItems((prev) => [res.editor, ...prev]);
      setNewEmail("");
      setIsAdding(false);
    } catch (e: any) {
      setError(e?.message ?? "Failed to add editor.");
    } finally {
      setAddLoading(false);
    }
  }

  async function removeEditor(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      await apiFetch<{ ok: boolean }>(`/api/admin/editors?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setItems((prev) => prev.filter((x) => x.id !== id));
      setEditorToRemove(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to remove editor.");
    } finally {
      setDeletingId(null);
    }
  }

  async function approveEditor(email: string) {
    setApprovingId(email);
    setError(null);
    try {
      const res = await apiFetch<{ editor: Editor }>("/api/admin/editors", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      // Remove from pending list
      setPendingEditors((prev) => prev.filter((p) => p.email !== email));
      // Add to approved list
      setItems((prev) => [res.editor, ...prev]);
      setEditorToApprove(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to approve editor.");
    } finally {
      setApprovingId(null);
    }
  }

  async function deletePendingEditor(userId: string) {
    setDeletingPendingUserId(userId);
    setError(null);
    try {
      await apiFetch<{ ok: boolean }>(`/api/admin/editors?user_id=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
      // Remove from pending list
      setPendingEditors((prev) => prev.filter((p) => p.user_id !== userId));
      setPendingEditorToDelete(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete user.");
    } finally {
      setDeletingPendingUserId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Editors</div>
          <div className="mt-1 text-[12px] text-black/45">
            Assign users to edit and clean up vendor data across all vendors.
          </div>
        </div>

        <div className="p-6 grid gap-4">
          {error ? (
            <div className="rounded-[3px] border border-[#c17a4e]/30 bg-[#fff7ed] px-4 py-3 text-[13px] text-[#6e4f33]">
              {error}
            </div>
          ) : null}

          {/* Add Editor Form */}
          {isAdding ? (
            <form onSubmit={addEditor} className="rounded-[3px] border border-black/10 bg-[#fcfbf9] p-4 grid gap-4">
              <div className="text-[13px] font-semibold text-[#2c2c2c]">Add new editor</div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <label className="grid gap-1.5">
                  <span className="text-[12px] font-semibold text-black/55">User email</span>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                    required
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setNewEmail("");
                    }}
                    className="h-10 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading || !newEmail.trim()}
                    className="h-10 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
                  >
                    {addLoading ? "Adding…" : "Add editor"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="h-10 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors"
              >
                + Add editor
              </button>
            </div>
          )}

          {/* Search and Refresh */}
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                placeholder="Search by email or name"
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

          {/* Editors List */}
          <div className="rounded-[3px] border border-black/10 overflow-hidden">
            <div className="grid grid-cols-[1fr_140px_100px] sm:grid-cols-[1fr_140px_140px_100px] gap-0 bg-[#fcfbf9] text-[11px] font-semibold text-black/55 border-b border-black/5">
              <div className="px-3 py-2">Editor</div>
              <div className="px-3 py-2">Added</div>
              <div className="hidden sm:block px-3 py-2">Permissions</div>
              <div className="px-3 py-2 text-right">Action</div>
            </div>

            {loading ? (
              <div className="p-4 text-[13px] text-black/50">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-[13px] text-black/50">
                {query.trim() ? "No editors found matching your search." : "No editors yet. Add your first editor above."}
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {filtered.map((x) => {
                  const isDeleting = deletingId === x.id;
                  const addedDate = x.created_at
                    ? new Date(x.created_at).toLocaleDateString()
                    : "—";

                  return (
                    <div key={x.id} className="grid grid-cols-[1fr_140px_100px] sm:grid-cols-[1fr_140px_140px_100px] items-center">
                      <div className="px-3 py-3">
                        <div className="text-[13px] font-semibold text-[#2c2c2c]">
                          {x.name ?? x.email ?? "Unknown"}
                        </div>
                        {x.name && x.email ? (
                          <div className="mt-1 text-[11px] text-black/45">{x.email}</div>
                        ) : null}
                        <div className="mt-1 text-[11px] text-black/35 font-mono truncate">{x.user_id.slice(0, 8)}…</div>
                      </div>
                      <div className="px-3 py-3 text-[12px] text-black/60">{addedDate}</div>
                      <div className="hidden sm:block px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {x.can_edit_entries && (
                            <span className="inline-flex items-center rounded-[3px] border border-black/10 bg-white px-2 py-0.5 text-[10px] font-semibold text-black/60">
                              Entries
                            </span>
                          )}
                          {x.can_edit_photos && (
                            <span className="inline-flex items-center rounded-[3px] border border-black/10 bg-white px-2 py-0.5 text-[10px] font-semibold text-black/60">
                              Photos
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="px-3 py-3 text-right">
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => setEditorToRemove(x)}
                          className="h-8 px-3 rounded-[3px] border border-[#b42318]/20 bg-white text-[12px] font-semibold text-[#b42318] hover:bg-[#b42318]/5 transition-colors disabled:opacity-60"
                        >
                          {isDeleting ? "…" : "Remove"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-[12px] text-black/45">
            <span className="font-semibold text-black/55">Note:</span> Editors can modify vendor entries across all vendors. They must have a user account first before being added here.
          </div>
        </div>
      </div>

      {/* Pending Editors Section */}
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between">
          <div>
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Pending Editor Approvals</div>
            <div className="mt-1 text-[12px] text-black/45">
              Users who have signed up but haven't been granted editor access yet.
            </div>
          </div>
          <button
            type="button"
            onClick={refreshPendingEditors}
            className="h-9 px-3 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/5"
          >
            Refresh
          </button>
        </div>

        <div className="p-6">
          {pendingEditorsLoading ? (
            <div className="text-[13px] text-black/50">Loading...</div>
          ) : pendingEditors.length === 0 ? (
            <div className="text-[13px] text-black/50">No pending editor approvals.</div>
          ) : (
            <div className="rounded-[3px] border border-black/10 overflow-hidden">
              <div className="grid grid-cols-[1fr_110px] sm:grid-cols-[1fr_140px_140px_140px] gap-0 bg-[#fcfbf9] text-[11px] font-semibold text-black/55 border-b border-black/5">
                <div className="px-3 py-2">Email</div>
                <div className="hidden sm:block px-3 py-2">Name</div>
                <div className="hidden sm:block px-3 py-2">Signed Up</div>
                <div className="px-3 py-2 text-right">Actions</div>
              </div>
              <div className="divide-y divide-black/5">
                {pendingEditors.map((e) => {
                  const isDeleting = deletingPendingUserId === e.user_id;
                  return (
                    <div key={e.user_id} className="grid grid-cols-[1fr_110px] sm:grid-cols-[1fr_140px_140px_140px] items-center">
                      <div className="px-3 py-3">
                        <div className="text-[13px] font-semibold text-[#2c2c2c]">{e.email ?? "Unknown"}</div>
                        <div className="mt-1 text-[11px] text-black/35 font-mono">{e.user_id.slice(0, 8)}...</div>
                        <div className="mt-2 grid gap-0.5 sm:hidden">
                          <div className="text-[12px] text-black/60">{e.name ?? "---"}</div>
                          <div className="text-[12px] text-black/60">
                            {e.created_at ? new Date(e.created_at).toLocaleDateString() : "---"}
                          </div>
                        </div>
                      </div>
                      <div className="hidden sm:block px-3 py-3 text-[13px] text-black/60">{e.name ?? "---"}</div>
                      <div className="hidden sm:block px-3 py-3 text-[12px] text-black/60">
                        {e.created_at ? new Date(e.created_at).toLocaleDateString() : "---"}
                      </div>
                      <div className="px-3 py-3 text-right flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => setEditorToApprove(e)}
                          className="h-8 px-3 rounded-[3px] bg-[#a67c52] text-white text-[12px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => setPendingEditorToDelete(e)}
                          className="h-8 px-3 rounded-[3px] border border-[#b42318]/20 bg-white text-[12px] font-semibold text-[#b42318] hover:bg-[#b42318]/5 transition-colors disabled:opacity-60"
                        >
                          {isDeleting ? "…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approve Editor Modal */}
      {editorToApprove ? (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => !approvingId && setEditorToApprove(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-[6px] border border-black/20 bg-white shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-black/10">
                <div className="text-[14px] font-semibold text-[#2c2c2c]">Approve Editor</div>
                <div className="mt-1 text-[12px] text-black/55">
                  Grant editor access to this user? They will be able to edit vendor entries and photos.
                </div>
              </div>
              <div className="px-5 py-4 bg-[#fafafa]">
                <div className="text-[13px] font-semibold text-[#2c2c2c]">{editorToApprove.email}</div>
                <div className="mt-1 text-[11px] text-black/45">{editorToApprove.name ?? "No name provided"}</div>
              </div>
              <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={!!approvingId}
                  onClick={() => setEditorToApprove(null)}
                  className="h-9 px-4 rounded-[6px] border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!!approvingId}
                  onClick={() => editorToApprove.email && approveEditor(editorToApprove.email)}
                  className="h-9 px-4 rounded-[6px] bg-[#a67c52] text-white text-[12px] font-semibold hover:bg-[#8e6a46] disabled:opacity-60"
                >
                  {approvingId ? "Approving..." : "Approve"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Remove Editor Modal */}
      {editorToRemove ? (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => !deletingId && setEditorToRemove(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-[6px] border border-black/20 bg-white shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-black/10">
                <div className="text-[14px] font-semibold text-[#2c2c2c]">Remove Editor</div>
                <div className="mt-1 text-[12px] text-black/55">
                  Are you sure you want to remove this editor? This action cannot be undone.
                </div>
              </div>
              <div className="px-5 py-4 bg-[#fafafa]">
                <div className="text-[13px] font-semibold text-[#2c2c2c]">{editorToRemove.email ?? editorToRemove.name ?? "Unknown"}</div>
                <div className="mt-1 text-[11px] text-black/45 font-mono">{editorToRemove.user_id.slice(0, 8)}...</div>
              </div>
              <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={!!deletingId}
                  onClick={() => setEditorToRemove(null)}
                  className="h-9 px-4 rounded-[6px] border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!!deletingId}
                  onClick={() => removeEditor(editorToRemove.id)}
                  className="h-9 px-4 rounded-[6px] bg-[#b42318] text-white text-[12px] font-semibold hover:bg-[#9a1d14] disabled:opacity-60"
                >
                  {deletingId ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Pending Editor Modal */}
      {pendingEditorToDelete ? (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => !deletingPendingUserId && setPendingEditorToDelete(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-[6px] border border-black/20 bg-white shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-black/10">
                <div className="text-[14px] font-semibold text-[#2c2c2c]">Delete User</div>
                <div className="mt-1 text-[12px] text-black/55">
                  Are you sure you want to delete this user? This will permanently delete their account and cannot be undone.
                </div>
              </div>
              <div className="px-5 py-4 bg-[#fafafa]">
                <div className="text-[13px] font-semibold text-[#2c2c2c]">{pendingEditorToDelete.email ?? "Unknown"}</div>
                <div className="mt-1 text-[11px] text-black/45">{pendingEditorToDelete.name ?? "No name provided"}</div>
              </div>
              <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={!!deletingPendingUserId}
                  onClick={() => setPendingEditorToDelete(null)}
                  className="h-9 px-4 rounded-[6px] border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!!deletingPendingUserId}
                  onClick={() => pendingEditorToDelete.user_id && deletePendingEditor(pendingEditorToDelete.user_id)}
                  className="h-9 px-4 rounded-[6px] bg-[#b42318] text-white text-[12px] font-semibold hover:bg-[#9a1d14] disabled:opacity-60"
                >
                  {deletingPendingUserId ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
