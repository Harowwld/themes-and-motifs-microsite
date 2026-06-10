"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

interface Affiliation {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  badge_icon: string | null;
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

export default function SuperadminAffiliationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [affiliationToDelete, setAffiliationToDelete] = useState<Affiliation | null>(null);
  const [search, setSearch] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAffiliation, setEditingAffiliation] = useState<Affiliation | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAffiliations();
  }, []);

  async function loadAffiliations() {
    setLoading(true);
    try {
      const res = await apiFetch<{ affiliations: Affiliation[] }>("/api/admin/affiliations");
      setAffiliations(res.affiliations ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load affiliations.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteAffiliation(id: number) {
    setDeletingId(id);
    try {
      await apiFetch<{ success: boolean; message: string }>(`/api/admin/affiliations?id=${id}`, {
        method: "DELETE",
      });
      setAffiliations((prev) => prev.filter((a) => a.id !== id));
      setAffiliationToDelete(null);
      toast.success("Affiliation deleted successfully.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete affiliation.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredAffiliations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return affiliations;
    return affiliations.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q)
    );
  }, [affiliations, search]);

  function handleEdit(affiliation: Affiliation) {
    setEditingAffiliation(affiliation);
    setNewName(affiliation.name);
    setNewDescription(affiliation.description || "");
    setShowAddForm(true);
  }

  function resetForm() {
    setShowAddForm(false);
    setEditingAffiliation(null);
    setNewName("");
    setNewDescription("");
  }

  async function saveAffiliation(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Affiliation name is required.");
      return;
    }
    setSaving(true);
    try {
      if (editingAffiliation) {
        const res = await apiFetch<{ success: boolean; affiliation: Affiliation }>("/api/admin/affiliations", {
          method: "PUT",
          body: JSON.stringify({
            id: editingAffiliation.id,
            name: newName,
            description: newDescription,
          }),
        });
        toast.success("Affiliation updated successfully.");
        setAffiliations((prev) => prev.map((a) => (a.id === res.affiliation.id ? res.affiliation : a)));
      } else {
        const res = await apiFetch<{ success: boolean; affiliation: Affiliation }>("/api/admin/affiliations", {
          method: "POST",
          body: JSON.stringify({
            name: newName,
            description: newDescription,
          }),
        });
        toast.success("Affiliation added successfully.");
        setAffiliations((prev) => [...prev, res.affiliation].sort((a, b) => a.name.localeCompare(b.name)));
      }
      resetForm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save affiliation.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-semibold text-[#2c2c2c]">Affiliations Management</h1>
            <p className="text-[13px] text-black/50 mt-1">
              Manage vendor affiliations and organizations.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (showAddForm) {
                  resetForm();
                } else {
                  resetForm();
                  setShowAddForm(true);
                }
              }}
              className="h-9 px-4 rounded-[3px] bg-[#a67c52] hover:bg-[#8e6943] text-white text-[13px] font-medium transition-colors"
            >
              {showAddForm ? "Cancel" : "+ Add Affiliation"}
            </button>
            <button
              onClick={() => router.push("/superadmin")}
              className="h-9 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-medium text-black/70 hover:bg-black/[0.02] transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Form */}
        {showAddForm && (
          <form onSubmit={saveAffiliation} className="mb-6 p-5 rounded-[3px] border border-black/10 bg-white shadow-sm">
            <h3 className="text-[14px] font-semibold text-[#2c2c2c] mb-4">
              {editingAffiliation ? "Edit Affiliation" : "Create New Affiliation"}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-black/50 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Wedding Planner Association"
                  className="h-10 w-full rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/10"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-black/50 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Optional description"
                  className="h-10 w-full rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/10"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="h-8 px-4 rounded-[3px] border border-black/10 bg-white text-[12px] font-medium text-black/70 hover:bg-black/[0.02]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-8 px-4 rounded-[3px] bg-[#a67c52] hover:bg-[#8e6943] text-white text-[12px] font-medium transition-colors disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Affiliation"}
              </button>
            </div>
          </form>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search affiliations..."
            className="h-10 w-full max-w-md rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/10"
          />
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-[3px] border border-black/10 bg-white animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-2">
            {filteredAffiliations.map((affiliation) => (
              <div
                key={affiliation.id}
                className="flex items-center justify-between rounded-[3px] border border-black/10 bg-white px-4 py-3 hover:bg-black/[0.01]"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-semibold text-[#2c2c2c]">{affiliation.name}</span>
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                      {affiliation.slug}
                    </span>
                  </div>
                  {affiliation.description && (
                    <p className="text-[12px] text-black/50 mt-0.5">{affiliation.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(affiliation)}
                    className="h-8 px-3 rounded-[3px] border border-black/10 text-[12px] font-medium text-black/70 hover:bg-black/[0.05] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setAffiliationToDelete(affiliation)}
                    disabled={deletingId === affiliation.id}
                    className="h-8 px-3 rounded-[3px] border border-[#b42318]/20 text-[12px] font-medium text-[#b42318] hover:bg-[#b42318]/5 transition-colors disabled:opacity-60"
                  >
                    {deletingId === affiliation.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
            {filteredAffiliations.length === 0 && (
              <div className="text-[13px] text-black/50 italic p-4 text-center border border-black/10 rounded-[3px] bg-white">
                No affiliations found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {affiliationToDelete && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setAffiliationToDelete(null)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-[6px] border border-black/20 bg-white shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-black/10">
                <div className="text-[14px] font-semibold text-[#2c2c2c]">Delete Affiliation</div>
                <div className="mt-1 text-[12px] text-black/55">
                  Are you sure you want to delete this affiliation? 
                </div>
              </div>
              <div className="px-5 py-4 bg-[#fafafa]">
                <div className="text-[13px] font-semibold text-[#2c2c2c]">{affiliationToDelete.name}</div>
                <div className="mt-1 text-[11px] text-black/45">/{affiliationToDelete.slug}</div>
              </div>
              <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={!!deletingId}
                  onClick={() => setAffiliationToDelete(null)}
                  className="h-9 px-4 rounded-[6px] border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!!deletingId}
                  onClick={() => deleteAffiliation(affiliationToDelete.id)}
                  className="h-9 px-4 rounded-[6px] bg-[#b42318] text-white text-[12px] font-semibold hover:bg-red-700 disabled:opacity-60"
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
