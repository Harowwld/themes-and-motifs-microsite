"use client";

import { useEffect, useMemo, useState } from "react";
import ImageCropperModal from "../ImageCropper";
import { ImageUploadDropzone } from "@/components/ImageUploadDropzone";
import type { UploadResult } from "@/hooks/useImageUpload";

function proxiedImageUrl(url: string) {
  const u = (url ?? "").trim();
  if (!u) return u;
  if (u.includes("drive.google.com")) {
    return `/api/image-proxy?url=${encodeURIComponent(u)}`;
  }
  return u;
}

type Plan = { id: number; name: string };

type Vendor = {
  id: number;
  business_name: string;
  slug: string;
  is_active: boolean | null;
  is_featured: boolean | null;
  average_rating: number | null;
  review_count: number | null;
  updated_at: string;
  plan_id: number | null;
  plan?: { id: number; name: string } | { id: number; name: string }[] | null;
  user_id?: string;
  description?: string | null;
  location_text?: string | null;
  city?: string | null;
  address?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  website_url?: string | null;
  logo_url?: string | null;
  verified_status?: string | null;
};

type VendorImage = {
  id?: number;
  image_url: string;
  caption: string;
  is_cover: boolean;
  display_order: number;
  focus_x?: number | null;
  focus_y?: number | null;
  zoom?: number | null;
};

type VendorSocial = {
  id?: number;
  platform: string;
  url: string;
};

type Affiliation = {
  id: number;
  name: string;
  slug: string;
};

type VendorAffiliation = {
  id: number;
  affiliation: Affiliation | Affiliation[] | null;
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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[3px] border border-black/10 bg-white px-2 py-0.5 text-[11px] font-semibold text-black/60">
      {children}
    </span>
  );
}

export default function SuperadminVendorsPage() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [query, setQuery] = useState("");

  // Edit modal state
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    business_name: "",
    slug: "",
    description: "",
    location_text: "",
    city: "",
    address: "",
    contact_email: "",
    contact_phone: "",
    website_url: "",
    logo_url: "",
    verified_status: "",
  });
  const [editImages, setEditImages] = useState<VendorImage[]>([]);
  const [editSocials, setEditSocials] = useState<VendorSocial[]>([]);
  const [editAffiliations, setEditAffiliations] = useState<Affiliation[]>([]);
  const [allAffiliations, setAllAffiliations] = useState<Affiliation[]>([]);
  const [affiliationInput, setAffiliationInput] = useState("");
  const [showAffiliationDropdown, setShowAffiliationDropdown] = useState(false);

  // Crop modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [croppingImageIdx, setCroppingImageIdx] = useState<number | null>(null);

  // Logo modal state
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState("");

  async function refresh(searchQuery?: string) {
    setError(null);
    setLoading(true);
    try {
      const q = searchQuery?.trim() || "";
      const url = q ? `/api/admin/vendors?limit=1000&q=${encodeURIComponent(q)}` : "/api/admin/vendors?limit=1000";
      const res = await apiFetch<{ vendors: Vendor[]; plans: Plan[] }>(url);
      setVendors(res.vendors ?? []);
      setPlans(res.plans ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      refresh(query);
    }, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  async function patchVendor(id: number, patch: Partial<Pick<Vendor, "is_active" | "is_featured" | "plan_id">>) {
    setError(null);
    setSavingId(id);
    try {
      const res = await apiFetch<{ vendor: Vendor }>("/api/admin/vendors", {
        method: "PATCH",
        body: JSON.stringify({ id, ...patch }),
      });
      const next = res.vendor;
      setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...next } : v)));
    } catch (e: any) {
      setError(e?.message ?? "Failed to update vendor.");
    } finally {
      setSavingId(null);
    }
  }

  async function openEditModal(vendor: Vendor) {
    setEditingVendor(vendor);
    setEditError(null);
    setEditLoading(true);
    setEditModalOpen(true);

    try {
      const res = await apiFetch<{
        vendor: Vendor;
        images: VendorImage[];
        socials: VendorSocial[];
        affiliations: VendorAffiliation[];
        allAffiliations: Affiliation[];
      }>(`/api/admin/vendors/${vendor.id}`);

      const v = res.vendor;
      setEditForm({
        business_name: v.business_name ?? "",
        slug: v.slug ?? "",
        description: v.description ?? "",
        location_text: v.location_text ?? "",
        city: v.city ?? "",
        address: v.address ?? "",
        contact_email: v.contact_email ?? "",
        contact_phone: v.contact_phone ?? "",
        website_url: v.website_url ?? "",
        logo_url: v.logo_url ?? "",
        verified_status: v.verified_status ?? "",
      });

      const normalizedImgs = (res.images ?? []).map((img: any, idx: number) => ({
        id: img.id,
        image_url: img.image_url,
        caption: img.caption ?? "",
        is_cover: Boolean(img.is_cover),
        display_order: img.display_order ?? idx + 1,
        focus_x: img.focus_x ?? 50,
        focus_y: img.focus_y ?? 50,
        zoom: img.zoom ?? 1,
      }));
      setEditImages(
        normalizedImgs.length > 0
          ? normalizedImgs
          : [{ image_url: "", caption: "", is_cover: true, display_order: 1, focus_x: 50, focus_y: 50, zoom: 1 }]
      );

      const normalizedSocials = (res.socials ?? []).map((s) => ({
        id: s.id,
        platform: s.platform,
        url: s.url,
      }));
      setEditSocials(
        normalizedSocials.length > 0
          ? normalizedSocials
          : [{ platform: "facebook", url: "" }]
      );

      // Normalize affiliations
      const normalizedAffiliations = (res.affiliations ?? [])
        .map((va) => {
          const aff = Array.isArray(va.affiliation) ? va.affiliation[0] : va.affiliation;
          return aff ? { id: aff.id, name: aff.name, slug: aff.slug } : null;
        })
        .filter((a): a is Affiliation => a !== null);
      setEditAffiliations(normalizedAffiliations);
      setAllAffiliations(res.allAffiliations ?? []);
      setAffiliationInput("");
    } catch (e: any) {
      setEditError(e?.message ?? "Failed to load vendor details.");
    } finally {
      setEditLoading(false);
    }
  }

  function closeEditModal() {
    setEditModalOpen(false);
    setEditingVendor(null);
    setEditError(null);
  }

  async function saveVendorProfile() {
    if (!editingVendor) return;
    setEditLoading(true);
    setEditError(null);

    try {
      const res = await apiFetch<{ vendor: Vendor }>(`/api/admin/vendors/${editingVendor.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          business_name: editForm.business_name,
          slug: editForm.slug,
          description: editForm.description || null,
          location_text: editForm.location_text || null,
          city: editForm.city || null,
          address: editForm.address || null,
          contact_email: editForm.contact_email || null,
          contact_phone: editForm.contact_phone || null,
          website_url: editForm.website_url || null,
          logo_url: editForm.logo_url || null,
          verified_status: editForm.verified_status || null,
        }),
      });

      // Update local vendors list
      setVendors((prev) =>
        prev.map((v) => (v.id === editingVendor.id ? { ...v, ...res.vendor } : v))
      );
    } catch (e: any) {
      setEditError(e?.message ?? "Failed to save vendor profile.");
    } finally {
      setEditLoading(false);
    }
  }

  async function saveVendorImages() {
    if (!editingVendor) return;
    setEditLoading(true);
    setEditError(null);

    try {
      const cleaned = editImages
        .filter((i) => i.image_url.trim())
        .map((i, idx) => ({
          image_url: i.image_url.trim(),
          caption: i.caption?.trim() || null,
          is_cover: i.is_cover,
          display_order: i.display_order || idx + 1,
          focus_x: i.focus_x ?? 50,
          focus_y: i.focus_y ?? 50,
          zoom: i.zoom ?? 1,
        }));

      // Ensure at least one cover
      const hasCover = cleaned.some((i) => i.is_cover);
      if (cleaned.length > 0 && !hasCover) {
        cleaned[0].is_cover = true;
      }

      await apiFetch<{ images: VendorImage[] }>(`/api/admin/vendors/${editingVendor.id}/images`, {
        method: "PUT",
        body: JSON.stringify({ images: cleaned }),
      });
    } catch (e: any) {
      setEditError(e?.message ?? "Failed to save images.");
    } finally {
      setEditLoading(false);
    }
  }

  async function saveVendorSocials() {
    if (!editingVendor) return;
    setEditLoading(true);
    setEditError(null);

    try {
      const cleaned = editSocials.filter((s) => s.platform.trim() && s.url.trim());

      await apiFetch<{ socials: VendorSocial[] }>(`/api/admin/vendors/${editingVendor.id}/socials`, {
        method: "PUT",
        body: JSON.stringify({ socials: cleaned }),
      });
    } catch (e: any) {
      setEditError(e?.message ?? "Failed to save social links.");
    } finally {
      setEditLoading(false);
    }
  }

  async function saveVendorAffiliations() {
    if (!editingVendor) return;
    setEditLoading(true);
    setEditError(null);

    try {
      const res = await apiFetch<{
        affiliations: VendorAffiliation[];
        allAffiliations: Affiliation[];
        created: Affiliation[];
      }>(`/api/admin/vendors/${editingVendor.id}/affiliations`, {
        method: "PUT",
        body: JSON.stringify({ affiliations: editAffiliations }),
      });

      // Update local state with new affiliations and allAffiliations (in case new ones were created)
      const normalizedAffiliations = (res.affiliations ?? [])
        .map((va) => {
          const aff = Array.isArray(va.affiliation) ? va.affiliation[0] : va.affiliation;
          return aff ? { id: aff.id, name: aff.name, slug: aff.slug } : null;
        })
        .filter((a): a is Affiliation => a !== null);
      setEditAffiliations(normalizedAffiliations);
      setAllAffiliations(res.allAffiliations ?? []);
    } catch (e: any) {
      setEditError(e?.message ?? "Failed to save affiliations.");
    } finally {
      setEditLoading(false);
    }
  }

  async function saveAllAndClose() {
    await saveVendorProfile();
    await saveVendorImages();
    await saveVendorSocials();
    await saveVendorAffiliations();
    closeEditModal();
  }

  function openCropModal(idx: number) {
    setCroppingImageIdx(idx);
    setCropModalOpen(true);
  }

  function handleCropSave(crop: { focusX: number; focusY: number; zoom: number }) {
    if (croppingImageIdx !== null) {
      const newImages = [...editImages];
      newImages[croppingImageIdx] = {
        ...newImages[croppingImageIdx],
        focus_x: crop.focusX,
        focus_y: crop.focusY,
        zoom: crop.zoom,
      };
      setEditImages(newImages);
    }
    setCropModalOpen(false);
    setCroppingImageIdx(null);
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Vendors</div>
          <div className="mt-1 text-[12px] text-black/45">Activate, feature, and assign plans.</div>
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
                placeholder="Search by name, slug, or id"
              />
            </label>
            <button
              type="button"
              onClick={() => refresh()}
              className="h-10 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="rounded-[3px] border border-black/10 overflow-hidden">
            <div className="grid grid-cols-[70px_1.6fr_1.1fr_120px_120px_1fr] gap-0 bg-[#fcfbf9] text-[11px] font-semibold text-black/55 border-b border-black/5">
              <div className="px-3 py-2">ID</div>
              <div className="px-3 py-2">Vendor</div>
              <div className="px-3 py-2">Slug</div>
              <div className="px-3 py-2">Active</div>
              <div className="px-3 py-2">Featured</div>
              <div className="px-3 py-2">Plan</div>
            </div>

            {loading ? (
              <div className="p-4 text-[13px] text-black/50">Loading…</div>
            ) : vendors.length === 0 ? (
              <div className="p-4 text-[13px] text-black/50">No vendors found.</div>
            ) : (
              <div className="divide-y divide-black/5">
                {vendors.map((v) => {
                  const planName = String(
                    (Array.isArray(v.plan) ? v.plan?.[0]?.name : v.plan?.name) ??
                      plans.find((p) => p.id === v.plan_id)?.name ??
                      ""
                  );

                  const isSaving = savingId === v.id;

                  return (
                    <div key={v.id} className="grid grid-cols-[70px_1.6fr_1.1fr_120px_120px_1fr]">
                      <div className="px-3 py-3 text-[13px] text-black/60">{v.id}</div>
                      <div className="px-3 py-3">
                        <div className="text-[13px] font-semibold text-[#2c2c2c]">{v.business_name}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge>{(v.review_count ?? 0).toString()} reviews</Badge>
                          <Badge>{(v.average_rating ?? 0).toFixed(1)} rating</Badge>
                        </div>
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(v)}
                            className="text-[12px] text-[#6e4f33] hover:underline font-medium"
                          >
                            Edit details →
                          </button>
                        </div>
                      </div>
                      <div className="px-3 py-3">
                        <a
                          href={`/vendors/${v.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[13px] text-[#6e4f33] hover:underline"
                        >
                          {v.slug}
                        </a>
                      </div>
                      <div className="px-3 py-3">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => patchVendor(v.id, { is_active: !Boolean(v.is_active) })}
                          className={`h-8 w-full rounded-[3px] border text-[12px] font-semibold transition-colors disabled:opacity-60 ${
                            v.is_active
                              ? "border-[#027a48]/20 bg-[#ecfdf3] text-[#027a48] hover:bg-[#d1fadf]"
                              : "border-black/10 bg-white text-black/60 hover:bg-black/5"
                          }`}
                        >
                          {v.is_active ? "Active" : "Inactive"}
                        </button>
                      </div>
                      <div className="px-3 py-3">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => patchVendor(v.id, { is_featured: !Boolean(v.is_featured) })}
                          className={`h-8 w-full rounded-[3px] border text-[12px] font-semibold transition-colors disabled:opacity-60 ${
                            v.is_featured
                              ? "border-[#b54708]/20 bg-[#fff7ed] text-[#b54708] hover:bg-[#ffead5]"
                              : "border-black/10 bg-white text-black/60 hover:bg-black/5"
                          }`}
                        >
                          {v.is_featured ? "Featured" : "Not featured"}
                        </button>
                      </div>
                      <div className="px-3 py-3">
                        <select
                          value={v.plan_id ?? ""}
                          disabled={isSaving}
                          onChange={(e) => {
                            const raw = e.target.value;
                            patchVendor(v.id, { plan_id: raw === "" ? null : Number(raw) });
                          }}
                          className="h-8 w-full rounded-[3px] border border-black/10 bg-white px-2 text-[12px] text-black/70 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15 disabled:opacity-60"
                        >
                          <option value="">(No plan)</option>
                          {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        {planName ? (
                          <div className="mt-1 text-[11px] text-black/45">Current: {planName}</div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Vendor Modal */}
      {editModalOpen && editingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-[3px] border border-black/10 bg-white shadow-lg my-8">
            <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
              <div>
                <div className="text-[14px] font-semibold text-[#2c2c2c]">Edit Vendor</div>
                <div className="text-[12px] text-black/45">{editingVendor.business_name}</div>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="h-8 w-8 rounded-[3px] bg-white/90 text-black/60 hover:text-[#b42318] flex items-center justify-center text-[18px] shadow-sm"
              >
                ×
              </button>
            </div>

            <div className="p-4 grid gap-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {editLoading && <div className="text-[13px] text-black/60">Loading…</div>}
              {editError && (
                <div className="rounded-[3px] border border-[#b42318]/20 bg-[#fff1f3] px-4 py-3 text-[13px] text-[#7a271a]">
                  {editError}
                </div>
              )}

              {/* Profile Section */}
              <section className="grid gap-4">
                <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2">
                  Profile Information
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className="text-[12px] font-semibold text-black/55">Business Name</span>
                    <input
                      value={editForm.business_name}
                      onChange={(e) => setEditForm((f) => ({ ...f, business_name: e.target.value }))}
                      className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-[12px] font-semibold text-black/55">Slug</span>
                    <input
                      value={editForm.slug}
                      onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
                      className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
                    />
                  </label>
                  <label className="grid gap-1.5 sm:col-span-2">
                    <span className="text-[12px] font-semibold text-black/55">Description</span>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      rows={3}
                      className="rounded-[3px] border border-black/10 px-3 py-2 text-[13px]"
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-[12px] font-semibold text-black/55">Location Text</span>
                    <input
                      value={editForm.location_text}
                      onChange={(e) => setEditForm((f) => ({ ...f, location_text: e.target.value }))}
                      className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
                      placeholder="e.g., Makati, Metro Manila"
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-[12px] font-semibold text-black/55">City</span>
                    <input
                      value={editForm.city}
                      onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                      className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
                    />
                  </label>
                  <label className="grid gap-1.5 sm:col-span-2">
                    <span className="text-[12px] font-semibold text-black/55">Address</span>
                    <input
                      value={editForm.address}
                      onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                      className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
                    />
                  </label>
                </div>
              </section>

              {/* Contact Section */}
              <section className="grid gap-4">
                <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2">
                  Contact Information
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className="text-[12px] font-semibold text-black/55">Contact Email</span>
                    <input
                      type="email"
                      value={editForm.contact_email}
                      onChange={(e) => setEditForm((f) => ({ ...f, contact_email: e.target.value }))}
                      className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-[12px] font-semibold text-black/55">Contact Phone</span>
                    <input
                      value={editForm.contact_phone}
                      onChange={(e) => setEditForm((f) => ({ ...f, contact_phone: e.target.value }))}
                      className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-[12px] font-semibold text-black/55">Website URL</span>
                    <input
                      type="url"
                      value={editForm.website_url}
                      onChange={(e) => setEditForm((f) => ({ ...f, website_url: e.target.value }))}
                      className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-[12px] font-semibold text-black/55">Logo</span>
                    <div className="flex items-center gap-3">
                      <div className="w-[80px] h-[80px] rounded-[3px] border border-black/10 overflow-hidden bg-black/5 flex items-center justify-center">
                        {editForm.logo_url ? (
                          <img
                            src={proxiedImageUrl(editForm.logo_url)}
                            alt="Logo"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-[10px] text-black/40">No logo</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLogoUrlInput(editForm.logo_url);
                          setLogoModalOpen(true);
                        }}
                        className="h-9 px-4 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
                      >
                        Edit Logo
                      </button>
                    </div>
                  </label>
                </div>
              </section>

              {/* Verification Status */}
              <section className="grid gap-4">
                <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2">
                  Verification
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className="text-[12px] font-semibold text-black/55">Verified Status</span>
                    <select
                      value={editForm.verified_status}
                      onChange={(e) => setEditForm((f) => ({ ...f, verified_status: e.target.value }))}
                      className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
                    >
                      <option value="">(None)</option>
                      <option value="pending">pending</option>
                      <option value="verified">verified</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </label>
                </div>
              </section>

              {/* Photos Section */}
              <section className="grid gap-4">
                <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2">
                  Photos
                </div>
                <div className="flex flex-wrap gap-3">
                  {editImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      {/* Image card */}
                      <div className="w-[140px] h-[93px] rounded-[3px] border border-black/10 overflow-hidden bg-black/5 relative">
                        {img.image_url ? (
                          <img
                            src={proxiedImageUrl(img.image_url)}
                            alt=""
                            className="w-full h-full object-cover cursor-pointer"
                            style={{
                              objectPosition: `${img.focus_x ?? 50}% ${img.focus_y ?? 50}%`,
                              transform: `scale(${img.zoom ?? 1})`,
                            }}
                            onClick={() => openCropModal(idx)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-black/40">
                            No image
                          </div>
                        )}
                        {/* Cover indicator on top of image */}
                        {img.is_cover && (
                          <div className="absolute top-1 left-1">
                            <span className="text-[9px] font-semibold bg-[#027a48] text-white px-1.5 py-0.5 rounded">Cover</span>
                          </div>
                        )}
                      </div>

                      {/* Delete button (top right) */}
                      <button
                        type="button"
                        onClick={() => setEditImages((imgs) => imgs.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/90 text-black/60 hover:text-[#b42318] flex items-center justify-center text-[14px] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>

                      {/* Cover toggle button (top left) */}
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = editImages.map((i, iidx) => ({
                            ...i,
                            is_cover: iidx === idx ? !i.is_cover : false,
                          }));
                          setEditImages(newImages);
                        }}
                        className={`absolute -top-2 -left-2 w-6 h-6 rounded-full text-[12px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                          img.is_cover
                            ? "bg-[#ecfdf3] text-[#027a48] border border-[#027a48]/20"
                            : "bg-white/90 text-black/60 hover:text-[#027a48] border border-black/10"
                        }`}
                        title={img.is_cover ? "Remove from cover" : "Set as cover"}
                      >
                        {img.is_cover ? "C" : "C"}
                      </button>

                      {/* Caption below */}
                      <div className="mt-1">
                        <input
                          value={img.caption}
                          onChange={(e) => {
                            const newImages = [...editImages];
                            newImages[idx].caption = e.target.value;
                            setEditImages(newImages);
                          }}
                          className="w-full h-6 rounded-[3px] border border-black/10 px-1.5 text-[10px]"
                          placeholder="Caption"
                        />
                      </div>
                    </div>
                  ))}

                  {/* Add photo card */}
                  <div
                    className="w-[140px] h-[93px] rounded-[3px] border border-black/10 border-dashed bg-black/[0.02] flex flex-col items-center justify-center cursor-pointer hover:bg-black/[0.05] transition-colors"
                    onClick={() => {
                      setEditImages((imgs) => [
                        ...imgs,
                        { image_url: "", caption: "", is_cover: editImages.length === 0, display_order: imgs.length + 1, focus_x: 50, focus_y: 50, zoom: 1 },
                      ]);
                    }}
                  >
                    <div className="text-[24px] text-black/40">+</div>
                    <div className="text-[10px] text-black/40 mt-1">Add photo</div>
                  </div>
                </div>

                {/* Upload dropzone for latest added image (if empty) */}
                {editImages.length > 0 && editImages[editImages.length - 1]?.image_url === "" && editingVendor && (
                  <div className="mt-2">
                    <ImageUploadDropzone
                      bucket="vendor-assets"
                      folder="gallery"
                      entityId={String(editingVendor.id)}
                      label="Upload Photo"
                      description="JPG, PNG, WebP up to 2MB. Will be compressed if needed."
                      onUploadComplete={(result: UploadResult) => {
                        const newImages = [...editImages];
                        newImages[newImages.length - 1].image_url = result.url;
                        setEditImages(newImages);
                      }}
                      onClear={() => {
                        const newImages = [...editImages];
                        newImages[newImages.length - 1].image_url = "";
                        setEditImages(newImages);
                      }}
                      existingUrl=""
                    />
                    <div className="relative my-3">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-black/10"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-2 bg-white text-[11px] text-black/40">or enter URL</span>
                      </div>
                    </div>
                    <input
                      value={editImages[editImages.length - 1]?.image_url ?? ""}
                      onChange={(e) => {
                        const newImages = [...editImages];
                        newImages[newImages.length - 1].image_url = e.target.value;
                        setEditImages(newImages);
                      }}
                      className="h-9 rounded-[3px] border border-black/10 px-3 text-[12px] w-full"
                      placeholder="Paste image URL here..."
                    />
                  </div>
                )}
              </section>

              {/* Social Links Section */}
              <section className="grid gap-4">
                <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2 flex items-center justify-between">
                  <span>Social Links</span>
                  <button
                    type="button"
                    onClick={() => setEditSocials((s) => [...s, { platform: "", url: "" }])}
                    className="text-[12px] text-[#6e4f33] hover:underline"
                  >
                    + Add link
                  </button>
                </div>
                <div className="grid gap-3">
                  {editSocials.map((s, idx) => (
                    <div key={idx} className="grid gap-2 sm:grid-cols-[140px_1fr_auto] items-end">
                      <select
                        value={s.platform}
                        onChange={(e) => {
                          const newSocials = [...editSocials];
                          newSocials[idx].platform = e.target.value;
                          setEditSocials(newSocials);
                        }}
                        className="h-9 rounded-[3px] border border-black/10 px-2 text-[12px]"
                      >
                        <option value="">Platform</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="x">X (Twitter)</option>
                        <option value="pinterest">Pinterest</option>
                        <option value="youtube">YouTube</option>
                        <option value="website">Website</option>
                        <option value="other">Other</option>
                      </select>
                      <input
                        value={s.url}
                        onChange={(e) => {
                          const newSocials = [...editSocials];
                          newSocials[idx].url = e.target.value;
                          setEditSocials(newSocials);
                        }}
                        className="h-9 rounded-[3px] border border-black/10 px-2 text-[12px]"
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        onClick={() => setEditSocials((soc) => soc.filter((_, i) => i !== idx))}
                        className="h-9 px-2 rounded-[3px] border border-[#b42318]/20 text-[12px] text-[#b42318] hover:bg-[#b42318]/5"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {editSocials.length === 0 && (
                    <div className="text-[12px] text-black/50 italic">No social links added yet.</div>
                  )}
                </div>
              </section>

              {/* Affiliations Section */}
              <section className="grid gap-4">
                <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2">
                  Affiliations
                </div>

                {/* Current affiliations */}
                <div className="flex flex-wrap gap-2">
                  {editAffiliations.map((aff) => (
                    <span
                      key={aff.id}
                      className="inline-flex items-center gap-1 rounded-[3px] border border-black/10 bg-[#fcfbf9] px-2.5 py-1 text-[12px] text-black/70"
                    >
                      {aff.name}
                      <button
                        type="button"
                        onClick={() => setEditAffiliations((prev) => prev.filter((a) => a.id !== aff.id))}
                        className="ml-1 text-black/40 hover:text-[#b42318]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {editAffiliations.length === 0 && (
                    <span className="text-[12px] text-black/50 italic">No affiliations added.</span>
                  )}
                </div>

                {/* Add affiliation dropdown + custom input */}
                <div className="grid gap-2">
                  <div className="relative">
                    <select
                      value=""
                      onChange={(e) => {
                        const selectedId = Number(e.target.value);
                        if (!selectedId) return;
                        const selected = allAffiliations.find((a) => a.id === selectedId);
                        if (selected && !editAffiliations.some((a) => a.id === selected.id)) {
                          setEditAffiliations((prev) => [...prev, selected]);
                        }
                        e.target.value = "";
                      }}
                      className="h-10 w-full rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                    >
                      <option value="">Select existing affiliation...</option>
                      {allAffiliations
                        .filter((a) => !editAffiliations.some((ea) => ea.id === a.id))
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <input
                      value={affiliationInput}
                      onChange={(e) => setAffiliationInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const name = affiliationInput.trim();
                          if (!name) return;
                          // Check if already exists in current affiliations
                          if (editAffiliations.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
                            setAffiliationInput("");
                            return;
                          }
                          // Check if exists in all affiliations
                          const existing = allAffiliations.find(
                            (a) => a.name.toLowerCase() === name.toLowerCase()
                          );
                          if (existing) {
                            setEditAffiliations((prev) => [...prev, existing]);
                          } else {
                            // Add as new (will be created on save)
                            const newAff: Affiliation = {
                              id: -Date.now(), // Temporary negative ID
                              name,
                              slug: "", // Will be generated on server
                            };
                            setEditAffiliations((prev) => [...prev, newAff]);
                          }
                          setAffiliationInput("");
                        }
                      }}
                      className="h-10 flex-1 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                      placeholder="Or type custom affiliation and press Enter..."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const name = affiliationInput.trim();
                        if (!name) return;
                        if (editAffiliations.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
                          setAffiliationInput("");
                          return;
                        }
                        const existing = allAffiliations.find(
                          (a) => a.name.toLowerCase() === name.toLowerCase()
                        );
                        if (existing) {
                          setEditAffiliations((prev) => [...prev, existing]);
                        } else {
                          const newAff: Affiliation = {
                            id: -Date.now(),
                            name,
                            slug: "",
                          };
                          setEditAffiliations((prev) => [...prev, newAff]);
                        }
                        setAffiliationInput("");
                      }}
                      className="h-10 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <div className="px-4 py-3 border-t border-black/5 flex items-center justify-between">
              <button
                type="button"
                onClick={closeEditModal}
                className="h-10 px-4 rounded-[3px] border border-black/10 text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await saveVendorProfile();
                    await saveVendorImages();
                    await saveVendorSocials();
                    await saveVendorAffiliations();
                  }}
                  disabled={editLoading}
                  className="h-10 px-4 rounded-[3px] border border-[#a67c52] text-[13px] font-semibold text-[#a67c52] hover:bg-[#a67c52]/5 transition-colors disabled:opacity-60"
                >
                  {editLoading ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={saveAllAndClose}
                  disabled={editLoading}
                  className="h-10 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
                >
                  {editLoading ? "Saving…" : "Save & Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {cropModalOpen && croppingImageIdx !== null && editImages[croppingImageIdx] && (
        <ImageCropperModal
          open={cropModalOpen}
          imageUrl={editImages[croppingImageIdx].image_url}
          initialFocusX={editImages[croppingImageIdx].focus_x ?? 50}
          initialFocusY={editImages[croppingImageIdx].focus_y ?? 50}
          initialZoom={editImages[croppingImageIdx].zoom ?? 1}
          onCancel={() => {
            setCropModalOpen(false);
            setCroppingImageIdx(null);
          }}
          onSave={handleCropSave}
        />
      )}

      {/* Logo Modal */}
      {logoModalOpen && editingVendor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-[3px] border border-black/20 bg-white shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between">
              <div className="text-[14px] font-semibold text-[#2c2c2c]">Edit Logo</div>
              <button
                type="button"
                onClick={() => setLogoModalOpen(false)}
                className="h-7 w-7 rounded-[3px] bg-white/90 text-black/60 hover:text-[#b42318] flex items-center justify-center text-[16px] shadow-sm"
              >
                ×
              </button>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <div className="w-24 h-24 mx-auto rounded-[3px] border border-black/10 overflow-hidden bg-black/5 flex items-center justify-center">
                  {logoUrlInput ? (
                    <img src={proxiedImageUrl(logoUrlInput)} alt="Logo preview" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-black/40">No logo</span>
                  )}
                </div>
              </div>

              <ImageUploadDropzone
                bucket="vendor-assets"
                folder="logos"
                entityId={String(editingVendor.id)}
                label="Upload Logo"
                description="JPG, PNG, WebP up to 2MB. Will be compressed if needed."
                onUploadComplete={(result: UploadResult) => {
                  setLogoUrlInput(result.url);
                }}
                onClear={() => setLogoUrlInput("")}
                existingUrl={logoUrlInput}
              />

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-white text-[11px] text-black/40">or enter URL</span>
                </div>
              </div>

              <label className="grid gap-1.5">
                <span className="text-[12px] font-semibold text-black/55">Logo URL</span>
                <input
                  type="url"
                  value={logoUrlInput}
                  onChange={(e) => setLogoUrlInput(e.target.value)}
                  className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
                  placeholder="https://..."
                />
              </label>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setLogoModalOpen(false)}
                  className="flex-1 h-10 rounded-[3px] border border-black/10 text-[13px] font-semibold text-black/70 hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditForm((f) => ({ ...f, logo_url: logoUrlInput }));
                    setLogoModalOpen(false);
                  }}
                  className="flex-1 h-10 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46]"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
