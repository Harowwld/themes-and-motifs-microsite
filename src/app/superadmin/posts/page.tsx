"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "../../../lib/toast";

type PostRow = {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  moment_type: "photo" | "review" | "story" | "milestone" | string;
  visibility: "private" | "public" | "friends" | string;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
  users?: {
    id: string;
    email: string;
  } | null;
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

export default function SuperadminPostsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PostRow[]>([]);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const res = await apiFetch<{ posts: PostRow[] }>("/api/admin/posts?limit=500");
      setItems(res.posts ?? []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load posts.");
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
      const title = String(x.title ?? "").toLowerCase();
      const content = String(x.content ?? "").toLowerCase();
      const email = String(x.users?.email ?? "").toLowerCase();
      const id = String(x.id ?? "").toLowerCase();
      const type = String(x.moment_type ?? "").toLowerCase();
      
      return (
        title.includes(q) ||
        content.includes(q) ||
        email.includes(q) ||
        id.includes(q) ||
        type.includes(q)
      );
    });
  }, [items, query]);

  async function patchPost(id: string, patch: Record<string, any>) {
    setSavingId(id);
    try {
      const res = await apiFetch<{ post: PostRow }>("/api/admin/posts", {
        method: "PATCH",
        body: JSON.stringify({ id, ...patch }),
      });
      setItems((prev) => prev.map((x) => (x.id === id ? res.post : x)));
      toast.success("Post updated successfully");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update post.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Posts Manager</div>
          <div className="mt-1 text-[12px] text-black/45 font-medium">Deactivate, archive, and moderate couple stories, photos, and milestones.</div>
        </div>

        <div className="p-6 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Search Posts</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                placeholder="Search by title, content, type, or user email"
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
            <div className="grid grid-cols-[1.5fr_1fr_1.5fr_130px_130px] gap-0 bg-[#fcfbf9] text-[11px] font-semibold text-black/55 border-b border-black/5">
              <div className="px-3 py-2">Post Title / Content</div>
              <div className="px-3 py-2">Posted By</div>
              <div className="px-3 py-2">Details</div>
              <div className="px-3 py-2">Status</div>
              <div className="px-3 py-2 text-right pr-6">Moderation</div>
            </div>

            {loading ? (
              <div className="p-4 text-[13px] text-black/50">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-[13px] text-black/50">No couple posts found.</div>
            ) : (
              <div className="divide-y divide-black/5">
                {filtered.map((x) => {
                  const isSaving = savingId === x.id;
                  const dateStr = new Date(x.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

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
                    <div key={x.id} className="grid grid-cols-[1.5fr_1fr_1.5fr_130px_130px] items-center">
                      <div className="px-3 py-3">
                        <div className="text-[13px] font-semibold text-[#2c2c2c]">{x.title}</div>
                        {x.content && (
                          <div className="mt-1 text-[11px] text-black/60 line-clamp-2 italic">"{x.content}"</div>
                        )}
                        <div className="mt-1 text-[9px] text-black/35 font-mono select-all">{x.id}</div>
                      </div>
                      <div className="px-3 py-3">
                        <div className="text-[13px] text-black/75 truncate">{x.users?.email || "Unknown Couple"}</div>
                        <div className="mt-1 text-[9px] text-black/35 font-mono">{x.user_id}</div>
                      </div>
                      <div className="px-3 py-3">
                        <div className="text-[12px] text-black/70">
                          Type: <span className="font-semibold capitalize text-[#2c2c2c]">{x.moment_type}</span>
                        </div>
                        <div className="mt-1 text-[12px] text-black/70">
                          Visibility: <span className="font-semibold capitalize text-[#2c2c2c]">{x.visibility}</span>
                        </div>
                        <div className="mt-1 text-[11px] text-black/45">Date: {dateStr}</div>
                      </div>
                      <div className="px-3 py-3">
                        {statusBadge}
                      </div>
                      <div className="px-3 py-3 flex flex-col gap-1 items-end pr-6">
                        {isArchived ? (
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => patchPost(x.id, { is_archived: false, is_active: true })}
                            className="text-[11px] text-[#a67c52] hover:underline font-bold"
                          >
                            Restore Post
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => patchPost(x.id, { is_active: !isActive })}
                              className="text-[11px] text-[#a67c52] hover:underline font-bold"
                            >
                              {isActive ? "Deactivate Post" : "Activate Post"}
                            </button>
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => patchPost(x.id, { is_archived: true, is_active: false })}
                              className="text-[11px] text-[#b42318] hover:underline font-semibold"
                            >
                              Archive Post
                            </button>
                          </>
                        )}
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
