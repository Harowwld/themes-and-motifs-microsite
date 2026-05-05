"use client";

import { useEffect, useMemo, useState } from "react";

type BugComment = {
  id: number;
  comment: string;
  name: string | null;
  created_at: string;
};

type SortOption = "newest" | "oldest";

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

export default function CommentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bugComments, setBugComments] = useState<BugComment[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedBugComments, setSelectedBugComments] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setError(null);
    setLoading(true);
    setSelectedBugComments(new Set());
    try {
      const res = await apiFetch<{ comments: BugComment[] }>("/api/bug-comments");
      setBugComments(res.comments ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load comments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const sorted = useMemo(() => {
    switch (sortBy) {
      case "newest":
        return [...bugComments].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "oldest":
        return [...bugComments].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      default:
        return bugComments;
    }
  }, [bugComments, sortBy]);

  function toggleBugComment(id: number) {
    setSelectedBugComments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAllBugComments() {
    if (selectedBugComments.size === sorted.length) {
      setSelectedBugComments(new Set());
    } else {
      setSelectedBugComments(new Set(sorted.map((x) => x.id)));
    }
  }

  async function deleteSelected() {
    const bugIds = Array.from(selectedBugComments);
    if (bugIds.length === 0) return;

    setDeleting(true);
    setError(null);
    try {
      await apiFetch(`/api/bug-comments?ids=${bugIds.join(",")}`, {
        method: "DELETE",
      });
      setBugComments((prev) => prev.filter((x) => !bugIds.includes(x.id)));
      setSelectedBugComments(new Set());
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-[28px] font-semibold text-[#2c2c2c]">Comments</h1>
          <p className="mt-1 text-[14px] text-gray-600">
            All submitted bug comments
          </p>
        </div>

        {error ? (
          <div className="mb-6 rounded-[3px] border border-[#c17a4e]/30 bg-[#fff7ed] px-4 py-3 text-[13px] text-[#6e4f33]">
            {error}
          </div>
        ) : null}

        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-[14px] font-semibold text-[#2c2c2c]">
                {sorted.length} comment{sorted.length !== 1 ? "s" : ""}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sorted.length > 0 && selectedBugComments.size === sorted.length}
                  onChange={toggleAllBugComments}
                  className="w-4 h-4 rounded border-black/20"
                />
                <span className="text-[12px] text-gray-600">Select all</span>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <span className="text-[12px] text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-9 rounded-[3px] border border-black/10 bg-white px-3 text-[12px] text-black/70 outline-none focus:border-[#a68b6a]/50 focus:ring-2 focus:ring-[#a68b6a]/15"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </label>
              <button
                type="button"
                onClick={refresh}
                className="h-9 px-4 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[40px_1fr_2fr] gap-0 bg-[#fcfbf9] text-[11px] font-semibold text-gray-500 border-b border-black/5">
            <div className="px-4 py-3"></div>
            <div className="px-4 py-3">Name</div>
            <div className="px-4 py-3">Comment</div>
          </div>

          {loading ? (
            <div className="p-8 text-[13px] text-gray-500 text-center">Loading...</div>
          ) : sorted.length === 0 ? (
            <div className="p-8 text-[13px] text-gray-500 text-center">No comments found.</div>
          ) : (
            <div className="divide-y divide-black/5">
              {sorted.map((x) => (
                <div key={x.id} className="grid grid-cols-[40px_1fr_2fr]">
                  <div className="px-4 py-4 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedBugComments.has(x.id)}
                      onChange={() => toggleBugComment(x.id)}
                      className="w-4 h-4 rounded border-black/20"
                    />
                  </div>
                  <div className="px-4 py-4">
                    <div className="text-[13px] font-medium text-[#2c2c2c]">
                      {x.name ?? "Anonymous"}
                    </div>
                    <div className="mt-1 text-[11px] text-gray-400">
                      {new Date(x.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="px-4 py-4">
                    <div className="text-[13px] text-black/70 whitespace-pre-wrap">
                      {x.comment}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedBugComments.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-black/10 shadow-lg rounded-[3px] px-6 py-3 flex items-center gap-4">
            <span className="text-[13px] font-medium text-[#2c2c2c]">
              {selectedBugComments.size} selected
            </span>
            <button
              type="button"
              disabled={deleting}
              onClick={deleteSelected}
              className="h-9 px-4 rounded-[3px] bg-[#b42318] text-white text-[13px] font-semibold hover:bg-[#9a1d14] disabled:opacity-60 transition-colors"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
