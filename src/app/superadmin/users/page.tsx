"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "../../../lib/toast";

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
  const [items, setItems] = useState<UserRow[]>([]);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null);

  // Profile edit state
  const [editingProfileUser, setEditingProfileUser] = useState<UserRow | null>(null);
  const [profileForm, setProfileForm] = useState({
    bride_nickname: "",
    groom_nickname: "",
    wedding_date: "",
    wedding_date_public: false,
    wedding_venue_area: "",
    wedding_venue_public: false,
    location: "",
    profile_visibility: "private",
    budget_range: "",
    wedding_style: "",
    notes: "",
    is_premium: false,
  });

  async function refresh() {
    setLoading(true);
    try {
      const res = await apiFetch<{ users: UserRow[] }>("/api/admin/users?limit=500&role=soon_to_wed");
      setItems(res.users ?? []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load users.");
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
      const email = String(x.email ?? "").toLowerCase();
      const id = String(x.id ?? "").toLowerCase();
      const profile = Array.isArray(x.soon_to_wed_profiles) ? x.soon_to_wed_profiles?.[0] : x.soon_to_wed_profiles;
      const bride = String(profile?.bride_nickname ?? "").toLowerCase();
      const groom = String(profile?.groom_nickname ?? "").toLowerCase();
      const location = String(profile?.location ?? "").toLowerCase();
      const style = String(profile?.wedding_style ?? "").toLowerCase();
      const venue = String(profile?.wedding_venue_area ?? "").toLowerCase();
      
      return (
        email.includes(q) ||
        id.includes(q) ||
        bride.includes(q) ||
        groom.includes(q) ||
        location.includes(q) ||
        style.includes(q) ||
        venue.includes(q)
      );
    });
  }, [items, query]);

  async function patchUser(id: string, patch: Record<string, any>) {
    setSavingId(id);
    try {
      const res = await apiFetch<{ user: UserRow }>("/api/admin/users", {
        method: "PATCH",
        body: JSON.stringify({ id, ...patch }),
      });
      setItems((prev) => prev.map((x) => (x.id === id ? (res.user as any) : x)));
      toast.success("User updated successfully");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update user.");
    } finally {
      setSavingId(null);
    }
  }

  async function confirmDeleteUser() {
    if (!deletingUser) return;
    setDeletingId(deletingUser.id);
    try {
      await apiFetch("/api/admin/users", {
        method: "DELETE",
        body: JSON.stringify({ id: deletingUser.id }),
      });
      setItems((prev) => prev.filter((x) => x.id !== deletingUser.id));
      setDeletingUser(null);
      toast.success("User deleted successfully");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  }

  function openEditModal(user: UserRow) {
    const profile = Array.isArray(user.soon_to_wed_profiles) ? user.soon_to_wed_profiles?.[0] : user.soon_to_wed_profiles;
    setEditingProfileUser(user);
    setProfileForm({
      bride_nickname: profile?.bride_nickname ?? "",
      groom_nickname: profile?.groom_nickname ?? "",
      wedding_date: profile?.wedding_date ?? "",
      wedding_date_public: !!profile?.wedding_date_public,
      wedding_venue_area: profile?.wedding_venue_area ?? "",
      wedding_venue_public: !!profile?.wedding_venue_public,
      location: profile?.location ?? "",
      profile_visibility: profile?.profile_visibility === "public" ? "public" : "private",
      budget_range: profile?.budget_range ?? "",
      wedding_style: profile?.wedding_style ?? "",
      notes: profile?.notes ?? "",
      is_premium: !!profile?.is_premium,
    });
  }

  async function saveProfile() {
    if (!editingProfileUser) return;
    setSavingId(editingProfileUser.id);
    try {
      const res = await apiFetch<{ user: UserRow }>("/api/admin/users", {
        method: "PATCH",
        body: JSON.stringify({ id: editingProfileUser.id, ...profileForm }),
      });
      setItems((prev) => prev.map((x) => (x.id === editingProfileUser.id ? res.user : x)));
      setEditingProfileUser(null);
      toast.success("Profile updated successfully");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update profile.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Soon to Weds</div>
          <div className="mt-1 text-[12px] text-black/45 font-medium">Activate, verify, and upgrade soon to wed accounts.</div>
        </div>

        <div className="p-6 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                placeholder="Search by email, name, venue, style, or location"
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
            <div className="grid grid-cols-[1.4fr_1.1fr_1.2fr_130px_90px_100px_130px] gap-0 bg-[#fcfbf9] text-[11px] font-semibold text-black/55 border-b border-black/5">
              <div className="px-3 py-2">User</div>
              <div className="px-3 py-2">Couple Nicknames</div>
              <div className="px-3 py-2">Wedding Details</div>
              <div className="px-3 py-2">Status</div>
              <div className="px-3 py-2">Verified</div>
              <div className="px-3 py-2">Premium</div>
              <div className="px-3 py-2 text-right pr-6">Actions</div>
            </div>

            {loading ? (
              <div className="p-4 text-[13px] text-black/50">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-[13px] text-black/50">No soon to weds found.</div>
            ) : (
              <div className="divide-y divide-black/5">
                {filtered.map((x) => {
                  const isSaving = savingId === x.id;
                  const profile = Array.isArray(x.soon_to_wed_profiles)
                    ? x.soon_to_wed_profiles?.[0]
                    : x.soon_to_wed_profiles;

                  const bride = profile?.bride_nickname ?? "";
                  const groom = profile?.groom_nickname ?? "";
                  const nicknames = bride && groom ? `${bride} & ${groom}` : bride || groom || "Not set";

                  const weddingDate = profile?.wedding_date
                    ? new Date(profile.wedding_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "";
                  const location = profile?.location ?? "";
                  const details = weddingDate && location
                    ? `${weddingDate} (${location})`
                    : weddingDate || location || "Not set";

                  // Extract precise active/archived state
                  const isActive = Boolean(x.is_active);
                  const isArchived = Boolean(x.is_archived);
                  let statusBadge = (
                    <span className="inline-flex items-center rounded-[3px] border border-[#027a48]/20 bg-[#ecfdf3] px-2 py-0.5 text-[10px] font-semibold text-[#027a48]">
                      Active
                    </span>
                  );
                  if (isArchived) {
                    statusBadge = (
                      <span className="inline-flex items-center rounded-[3px] border border-[#b54708]/20 bg-[#fff7ed] px-2 py-0.5 text-[10px] font-semibold text-[#b54708]">
                        Archived
                      </span>
                    );
                  } else if (!isActive) {
                    statusBadge = (
                      <span className="inline-flex items-center rounded-[3px] border border-black/10 bg-black/[0.04] px-2 py-0.5 text-[10px] font-semibold text-black/50">
                        Deactivated
                      </span>
                    );
                  }

                  return (
                    <div key={x.id} className="grid grid-cols-[1.4fr_1.1fr_1.2fr_130px_90px_100px_130px] items-center">
                      <div className="px-3 py-3">
                        <div className="text-[13px] font-semibold text-[#2c2c2c] truncate">{String(x.email ?? "")}</div>
                        <div className="mt-1 text-[10px] text-black/45 select-all">{x.id}</div>
                      </div>
                      <div className="px-3 py-3">
                        <div className="text-[13px] font-medium text-[#2c2c2c]">{nicknames}</div>
                        {profile?.wedding_style && (
                          <div className="mt-1 text-[10px] text-black/45 capitalize">{profile.wedding_style}</div>
                        )}
                      </div>
                      <div className="px-3 py-3">
                        <div className="text-[12px] text-black/70 truncate">{details}</div>
                        {profile?.wedding_venue_area && (
                          <div className="mt-1 text-[10px] text-black/45 truncate">{profile.wedding_venue_area}</div>
                        )}
                      </div>
                      <div className="px-3 py-3 flex flex-col gap-1 items-start">
                        {statusBadge}
                        <div className="flex gap-1 mt-1">
                          {isArchived ? (
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => patchUser(x.id, { is_archived: false, is_active: true })}
                              className="text-[9px] font-bold text-[#a67c52] hover:underline"
                            >
                              Restore
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => patchUser(x.id, { is_active: !isActive })}
                                className="text-[9px] font-bold text-[#a67c52] hover:underline"
                              >
                                {isActive ? "Deactivate" : "Activate"}
                              </button>
                              <span className="text-[9px] text-black/20">|</span>
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => patchUser(x.id, { is_archived: true, is_active: false })}
                                className="text-[9px] font-bold text-[#a67c52] hover:underline"
                              >
                                Archive
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="px-3 py-3">
                        {x.email_verified ? (
                          <span className="inline-flex items-center rounded-[3px] border border-[#027a48]/20 bg-[#ecfdf3] px-2.5 py-0.5 text-[10px] font-semibold text-[#027a48]">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-[3px] border border-black/10 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-black/60">
                            Unverified
                          </span>
                        )}
                      </div>
                      <div className="px-3 py-3">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => patchUser(x.id, { is_premium: !Boolean(profile?.is_premium) })}
                          className={`h-8 w-full rounded-[3px] border text-[11px] font-semibold transition-colors disabled:opacity-60 ${
                            profile?.is_premium
                              ? "border-[#b54708]/20 bg-[#fff7ed] text-[#b54708] hover:bg-[#ffead5]"
                              : "border-black/10 bg-white text-black/60 hover:bg-black/5"
                          }`}
                        >
                          {profile?.is_premium ? "Premium" : "Standard"}
                        </button>
                      </div>
                      <div className="px-3 py-3 flex flex-col gap-1 items-end pr-6">
                        <button
                          type="button"
                          onClick={() => openEditModal(x)}
                          className="text-[11px] text-[#6e4f33] hover:underline font-bold"
                        >
                          Edit Details
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === x.id}
                          onClick={() => setDeletingUser(x)}
                          className="text-[11px] text-[#b42318] hover:underline font-semibold"
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

      {/* Editing Profile Details Modal */}
      {editingProfileUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-[3px] border border-black/20 bg-white shadow-xl overflow-hidden animate-fadeIn">
            <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between">
              <div>
                <div className="text-[14px] font-semibold text-[#2c2c2c]">Edit Soon-to-Wed Profile</div>
                <div className="text-[11px] text-black/45 truncate mt-0.5">{editingProfileUser.email}</div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProfileUser(null)}
                className="h-7 w-7 rounded-[3px] bg-white/90 text-black/60 hover:text-[#b42318] flex items-center justify-center text-[16px] shadow-sm font-bold border border-black/5"
              >
                ×
              </button>
            </div>
            
            <div className="p-5 max-h-[70vh] overflow-y-auto grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-[11px] font-semibold text-black/55">Bride Nickname</span>
                  <input
                    type="text"
                    value={profileForm.bride_nickname}
                    onChange={(e) => setProfileForm({ ...profileForm, bride_nickname: e.target.value })}
                    className="h-9 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[11px] font-semibold text-black/55">Groom Nickname</span>
                  <input
                    type="text"
                    value={profileForm.groom_nickname}
                    onChange={(e) => setProfileForm({ ...profileForm, groom_nickname: e.target.value })}
                    className="h-9 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-[11px] font-semibold text-black/55">Wedding Date</span>
                  <input
                    type="date"
                    value={profileForm.wedding_date ? profileForm.wedding_date.split("T")[0] : ""}
                    onChange={(e) => setProfileForm({ ...profileForm, wedding_date: e.target.value })}
                    className="h-9 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[11px] font-semibold text-black/55">Wedding Style</span>
                  <input
                    type="text"
                    value={profileForm.wedding_style}
                    onChange={(e) => setProfileForm({ ...profileForm, wedding_style: e.target.value })}
                    placeholder="e.g. Modern, Rustic"
                    className="h-9 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-[11px] font-semibold text-black/55">Location (Ceremony Area)</span>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="h-9 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[11px] font-semibold text-black/55">Specific Wedding Venue</span>
                  <input
                    type="text"
                    value={profileForm.wedding_venue_area}
                    onChange={(e) => setProfileForm({ ...profileForm, wedding_venue_area: e.target.value })}
                    className="h-9 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-[11px] font-semibold text-black/55">Budget Range</span>
                  <input
                    type="text"
                    value={profileForm.budget_range}
                    onChange={(e) => setProfileForm({ ...profileForm, budget_range: e.target.value })}
                    placeholder="e.g. $10,000 - $20,000"
                    className="h-9 rounded-[3px] border border-black/10 px-3 text-[12px] outline-none focus:border-[#a67c52]"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[11px] font-semibold text-black/55">Profile Visibility</span>
                  <select
                    value={profileForm.profile_visibility}
                    onChange={(e) => setProfileForm({ ...profileForm, profile_visibility: e.target.value })}
                    className="h-9 rounded-[3px] border border-black/10 px-2 text-[12px] outline-none focus:border-[#a67c52]"
                  >
                    <option value="private">Private (Only Couple)</option>
                    <option value="public">Public (Visible in Couples Feed)</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 select-none cursor-pointer p-2 rounded border border-black/5 bg-black/[0.01]">
                  <input
                    type="checkbox"
                    checked={profileForm.wedding_date_public}
                    onChange={(e) => setProfileForm({ ...profileForm, wedding_date_public: e.target.checked })}
                    className="rounded text-[#a67c52] focus:ring-[#a67c52] border-neutral-300 h-4 w-4"
                  />
                  <span className="text-[11px] font-semibold text-black/65">Make wedding date public</span>
                </label>
                <label className="flex items-center gap-2 select-none cursor-pointer p-2 rounded border border-black/5 bg-black/[0.01]">
                  <input
                    type="checkbox"
                    checked={profileForm.wedding_venue_public}
                    onChange={(e) => setProfileForm({ ...profileForm, wedding_venue_public: e.target.checked })}
                    className="rounded text-[#a67c52] focus:ring-[#a67c52] border-neutral-300 h-4 w-4"
                  />
                  <span className="text-[11px] font-semibold text-black/65">Make wedding venue public</span>
                </label>
              </div>

              <label className="flex items-center gap-2 select-none cursor-pointer p-3 rounded border border-[#b54708]/15 bg-[#fff7ed]/40">
                <input
                  type="checkbox"
                  checked={profileForm.is_premium}
                  onChange={(e) => setProfileForm({ ...profileForm, is_premium: e.target.checked })}
                  className="rounded text-[#b54708] focus:ring-[#b54708] border-neutral-300 h-4 w-4"
                />
                <div className="grid">
                  <span className="text-[11px] font-bold text-[#b54708]">Premium Couple Account</span>
                  <span className="text-[9px] text-[#b54708]/80 mt-0.5">
                    Enables premium couple workspace features and layouts. (Gateway ready: automated tagging is pending integration, manual override active).
                  </span>
                </div>
              </label>

              <label className="grid gap-1">
                <span className="text-[11px] font-semibold text-black/55">Notes / Admin Comments</span>
                <textarea
                  value={profileForm.notes}
                  onChange={(e) => setProfileForm({ ...profileForm, notes: e.target.value })}
                  rows={3}
                  className="p-2 rounded-[3px] border border-black/10 text-[12px] outline-none focus:border-[#a67c52]"
                />
              </label>
            </div>

            <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2 bg-[#fafafa]">
              <button
                type="button"
                onClick={() => setEditingProfileUser(null)}
                className="h-9 px-4 rounded-[3px] border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingId !== null}
                onClick={saveProfile}
                className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[12px] font-semibold hover:bg-[#8e6a46] disabled:opacity-60"
              >
                {savingId !== null ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingUser ? (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeletingUser(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-[6px] border border-black/20 bg-white shadow-xl overflow-hidden animate-fadeIn">
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
                  className="h-9 px-4 rounded-[6px] bg-[#b42318] text-white text-[12px] font-semibold hover:bg-[#9a1d14] disabled:opacity-60"
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
