"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  display_order: number | null;
  icon: string | null;
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

export default function SuperadminCategoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [search, setSearch] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDisplayOrder, setNewDisplayOrder] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await apiFetch<{ categories: Category[] }>("/api/admin/categories");
      setCategories(res.categories ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteCategory(id: number) {
    setDeletingId(id);
    try {
      await apiFetch<{ success: boolean; message: string }>(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setCategoryToDelete(null);
      toast.success("Category deleted successfully.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete category.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
    );
  }, [categories, search]);

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setNewName(category.name);
    setNewDescription(category.description || "");
    setNewDisplayOrder(category.display_order?.toString() || "");
    setShowAddForm(true);
  }

  function resetForm() {
    setShowAddForm(false);
    setEditingCategory(null);
    setNewName("");
    setNewDescription("");
    setNewDisplayOrder("");
  }

  async function saveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Category name is required.");
      return;
    }
    setSaving(true);
    try {
      if (editingCategory) {
        const res = await apiFetch<{ success: boolean; category: Category }>("/api/admin/categories", {
          method: "PUT",
          body: JSON.stringify({
            id: editingCategory.id,
            name: newName,
            description: newDescription,
            display_order: newDisplayOrder,
          }),
        });
        toast.success("Category updated successfully.");
        setCategories((prev) => prev.map((c) => (c.id === res.category.id ? res.category : c)));
      } else {
        const res = await apiFetch<{ success: boolean; category: Category }>("/api/admin/categories", {
          method: "POST",
          body: JSON.stringify({
            name: newName,
            description: newDescription,
            display_order: newDisplayOrder,
          }),
        });
        toast.success("Category added successfully.");
        setCategories((prev) => [...prev, res.category].sort((a, b) => a.name.localeCompare(b.name)));
      }
      resetForm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save category.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-semibold text-[#2c2c2c]">Categories Management</h1>
            <p className="text-[13px] text-black/50 mt-1">
              Manage vendor categories.
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
              {showAddForm ? "Cancel" : "+ Add Category"}
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
          <form onSubmit={saveCategory} className="mb-6 p-5 rounded-[3px] border border-black/10 bg-white shadow-sm">
            <h3 className="text-[14px] font-semibold text-[#2c2c2c] mb-4">
              {editingCategory ? "Edit Category" : "Create New Category"}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-black/50 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Photography"
                  className="h-10 w-full rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/10"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
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
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-black/50 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={newDisplayOrder}
                  onChange={(e) => setNewDisplayOrder(e.target.value)}
                  placeholder="e.g. 1"
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
                {saving ? "Saving..." : "Save Category"}
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
            placeholder="Search categories..."
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
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-[3px] border border-black/10 bg-white px-4 py-3 hover:bg-black/[0.01]"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-semibold text-[#2c2c2c]">{category.name}</span>
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                      {category.slug}
                    </span>
                  </div>
                  {category.description && (
                    <p className="text-[12px] text-black/50 mt-0.5">{category.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-[12px] text-black/40 mr-4">Order: {category.display_order ?? "none"}</div>
                  <button
                    onClick={() => handleEdit(category)}
                    className="h-8 px-3 rounded-[3px] border border-black/10 text-[12px] font-medium text-black/70 hover:bg-black/[0.05] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setCategoryToDelete(category)}
                    disabled={deletingId === category.id}
                    className="h-8 px-3 rounded-[3px] border border-[#b42318]/20 text-[12px] font-medium text-[#b42318] hover:bg-[#b42318]/5 transition-colors disabled:opacity-60"
                  >
                    {deletingId === category.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
            {filteredCategories.length === 0 && (
              <div className="text-[13px] text-black/50 italic p-4 text-center border border-black/10 rounded-[3px] bg-white">
                No categories found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setCategoryToDelete(null)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-[6px] border border-black/20 bg-white shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-black/10">
                <div className="text-[14px] font-semibold text-[#2c2c2c]">Delete Category</div>
                <div className="mt-1 text-[12px] text-black/55">
                  Are you sure you want to delete this category? 
                </div>
              </div>
              <div className="px-5 py-4 bg-[#fafafa]">
                <div className="text-[13px] font-semibold text-[#2c2c2c]">{categoryToDelete.name}</div>
                <div className="mt-1 text-[11px] text-black/45">/{categoryToDelete.slug}</div>
              </div>
              <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={!!deletingId}
                  onClick={() => setCategoryToDelete(null)}
                  className="h-9 px-4 rounded-[6px] border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!!deletingId}
                  onClick={() => deleteCategory(categoryToDelete.id)}
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
