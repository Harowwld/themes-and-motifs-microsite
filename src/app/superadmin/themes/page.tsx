"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface Theme {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

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

export default function SuperadminThemesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [themeToDelete, setThemeToDelete] = useState<Theme | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadThemes();
  }, []);

  async function loadThemes() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ themes: Theme[] }>("/api/admin/themes");
      setThemes(res.themes ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load themes.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteTheme(id: number) {
    setDeletingId(id);
    setError(null);
    try {
      await apiFetch<{ success: boolean; message: string }>(`/api/admin/themes?id=${id}`, {
        method: "DELETE",
      });
      setThemes((prev) => prev.filter((t) => t.id !== id));
      setThemeToDelete(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete theme.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredThemes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return themes;
    return themes.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q)
    );
  }, [themes, search]);

  // Separate default and custom themes (themes with IDs > 12 are considered custom, matching the initial migration)
  const defaultThemes = filteredThemes.filter((t) => t.id <= 12);
  const customThemes = filteredThemes.filter((t) => t.id > 12);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-semibold text-[#2c2c2c]">Theme Management</h1>
            <p className="text-[13px] text-black/50 mt-1">
              Manage wedding themes. Delete custom themes that are no longer needed.
            </p>
          </div>
          <button
            onClick={() => router.push("/superadmin")}
            className="h-9 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-medium text-black/70 hover:bg-black/[0.02] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-[3px] border border-[#b42318]/20 bg-[#fff1f3] px-4 py-3 text-[13px] text-[#b42318]">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search themes..."
            className="h-10 w-full max-w-md rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/10"
          />
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-[3px] border border-black/10 bg-white animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-8">
            {/* Default Themes */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#2c2c2c] mb-3">
                Default Themes
                <span className="ml-2 text-[13px] font-normal text-black/50">
                  ({defaultThemes.length})
                </span>
              </h2>
              <div className="grid gap-2">
                {defaultThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className="flex items-center justify-between rounded-[3px] border border-black/10 bg-white px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-[12px] font-medium text-purple-700">
                        {theme.name}
                      </span>
                      <span className="text-[12px] text-black/40">/{theme.slug}</span>
                    </div>
                    <span className="text-[11px] text-black/40">Default theme - cannot delete</span>
                  </div>
                ))}
                {defaultThemes.length === 0 && (
                  <div className="text-[13px] text-black/50 italic">No default themes found.</div>
                )}
              </div>
            </section>

            {/* Custom Themes */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#2c2c2c] mb-3">
                Custom Themes
                <span className="ml-2 text-[13px] font-normal text-black/50">
                  ({customThemes.length})
                </span>
              </h2>
              <div className="grid gap-2">
                {customThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className="flex items-center justify-between rounded-[3px] border border-black/10 bg-white px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-[12px] font-medium text-purple-700">
                        {theme.name}
                      </span>
                      <span className="text-[12px] text-black/40">/{theme.slug}</span>
                    </div>
                    <button
                      onClick={() => setThemeToDelete(theme)}
                      disabled={deletingId === theme.id}
                      className="h-8 px-3 rounded-[3px] border border-[#b42318]/20 text-[12px] font-medium text-[#b42318] hover:bg-[#b42318]/5 transition-colors disabled:opacity-60"
                    >
                      {deletingId === theme.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                ))}
                {customThemes.length === 0 && (
                  <div className="text-[13px] text-black/50 italic">
                    No custom themes yet. Vendors can create custom themes from their dashboard.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {themeToDelete && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setThemeToDelete(null)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-[6px] border border-black/20 bg-white shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-black/10">
                <div className="text-[14px] font-semibold text-[#2c2c2c]">Delete Theme</div>
                <div className="mt-1 text-[12px] text-black/55">
                  Are you sure you want to delete this theme? This will also remove it from any vendors currently using it.
                </div>
              </div>
              <div className="px-5 py-4 bg-[#fafafa]">
                <div className="text-[13px] font-semibold text-[#2c2c2c]">{themeToDelete.name}</div>
                <div className="mt-1 text-[11px] text-black/45">/{themeToDelete.slug}</div>
              </div>
              <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={!!deletingId}
                  onClick={() => setThemeToDelete(null)}
                  className="h-9 px-4 rounded-[6px] border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!!deletingId}
                  onClick={() => deleteTheme(themeToDelete.id)}
                  className="h-9 px-4 rounded-[6px] bg-red-600 text-white text-[12px] font-semibold hover:bg-red-700 disabled:opacity-60"
                >
                  {deletingId ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
