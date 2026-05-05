"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "../../../lib/supabaseBrowser";
import CoverCropperModal from "./CoverCropperModal";

type VendorProfile = {
  id: number;
  user_id: string;
  business_name: string;
  slug: string;
  logo_url?: string | null;
  description: string | null;
  location_text: string | null;
  city: string | null;
  address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  cover_focus_x?: number | null;
  cover_focus_y?: number | null;
  cover_zoom?: number | null;
  plan_id: number | null;
  is_active: boolean | null;
  verified_status: string | null;
  plan?: { id: number; name: string } | { id: number; name: string }[] | null;
};

type SocialLink = { id: number; platform: string; url: string };
type VendorImage = {
  id: number;
  image_url: string;
  caption: string | null;
  is_cover: boolean | null;
  display_order: number | null;
};
type Theme = { id: number; name: string; slug: string };

type VendorPromo = {
  id: number;
  vendor_id: number;
  title: string;
  summary: string | null;
  terms: string | null;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean | null;
  image_url: string | null;
  discount_percentage: number | null;
  image_focus_x: number | null;
  image_focus_y: number | null;
  image_zoom: number | null;
  updated_at: string;
};

type Inquiry = {
  id: number;
  vendor_id: number;
  user_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  wedding_date: string | null;
  message: string;
  status: "new" | "read" | "replied" | "archived" | string;
  created_at: string;
  updated_at: string;
};

const SOCIAL_PLATFORM_OPTIONS = ["facebook", "instagram", "tiktok", "x", "pinterest", "youtube", "website"] as const;
type SocialPlatformOption = (typeof SOCIAL_PLATFORM_OPTIONS)[number] | "other";

function isKnownPlatform(p: string) {
  return SOCIAL_PLATFORM_OPTIONS.includes((p ?? "").trim().toLowerCase() as any);
}

function PromoModal({
  open,
  promo,
  isNew,
  onCancel,
  onSave,
  onDelete,
}: {
  open: boolean;
  promo: VendorPromo | null;
  isNew: boolean;
  onCancel: () => void;
  onSave: (payload: {
    title: string;
    summary: string | null;
    terms: string | null;
    valid_from: string | null;
    valid_to: string | null;
    discount_percentage: number | null;
    image_url: string | null;
    image_focus_x: number | null;
    image_focus_y: number | null;
    image_zoom: number | null;
    is_active: boolean;
  }) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(promo?.title ?? "");
  const [summary, setSummary] = useState(promo?.summary ?? "");
  const [terms, setTerms] = useState(promo?.terms ?? "");
  const [validFrom, setValidFrom] = useState(promo?.valid_from ?? "");
  const [validTo, setValidTo] = useState(promo?.valid_to ?? "");
  const [discount, setDiscount] = useState(String(promo?.discount_percentage ?? ""));
  const [imageUrl, setImageUrl] = useState(promo?.image_url ?? "");
  const [isActive, setIsActive] = useState(promo?.is_active ?? true);
  const [focusX, setFocusX] = useState(() => clampPct(Number(promo?.image_focus_x ?? 50)));
  const [focusY, setFocusY] = useState(() => clampPct(Number(promo?.image_focus_y ?? 50)));
  const [zoom, setZoom] = useState(() => clampZoom(Number(promo?.image_zoom ?? 1)));
  const [cropperOpen, setCropperOpen] = useState(false);

  useEffect(() => {
    setTitle(promo?.title ?? "");
    setSummary(promo?.summary ?? "");
    setTerms(promo?.terms ?? "");
    setValidFrom(promo?.valid_from ?? "");
    setValidTo(promo?.valid_to ?? "");
    setDiscount(String(promo?.discount_percentage ?? ""));
    setImageUrl(promo?.image_url ?? "");
    setIsActive(promo?.is_active ?? true);
    setFocusX(clampPct(Number(promo?.image_focus_x ?? 50)));
    setFocusY(clampPct(Number(promo?.image_focus_y ?? 50)));
    setZoom(clampZoom(Number(promo?.image_zoom ?? 1)));
    setCropperOpen(false);
  }, [promo, open]);

  if (!open) return null;

  const discountNum = discount.trim().length > 0 ? Number(discount) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg max-h-[85vh] rounded-[3px] border border-black/10 bg-white shadow-lg flex flex-col">
        <div className="px-4 py-3 border-b border-black/5 shrink-0">
          <div className="text-[14px] font-semibold text-[#2c2c2c]">{isNew ? "Add promo" : "Edit promo"}</div>
          <div className="mt-1 text-[12px] text-black/45">Add a title, details, and optional validity dates.</div>
        </div>

        <div className="overflow-y-auto p-4 space-y-4">
          {imageUrl.trim() ? (
            <div className="rounded-[3px] border border-black/10 bg-white overflow-hidden">
              <div className="w-full aspect-[3/4] relative bg-[#fcfbf9]">
                <img
                  src={imageUrl.trim()}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover select-none"
                  style={{ transformOrigin: `${focusX}% ${focusY}%`, transform: `scale(${zoom})` }}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  draggable={false}
                />
              </div>
              <div className="px-3 py-2 flex items-center justify-between">
                <div className="text-[12px] font-semibold text-black/55">Image preview</div>
                <button
                  type="button"
                  onClick={() => setCropperOpen(true)}
                  className="h-8 px-2 rounded-[3px] border border-black/10 bg-white text-[11px] font-semibold text-[#6e4f33] hover:bg-black/[0.02] transition-colors"
                >
                  Adjust crop
                </button>
              </div>
            </div>
          ) : null}

          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Title</span>
            <input
              className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 10% off for March bookings"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Summary (optional)</span>
            <input
              className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Short description"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Terms (optional)</span>
            <textarea
              className="min-h-24 w-full rounded-[3px] border border-black/10 px-3 py-2 text-[13px]"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Promo terms..."
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Valid from (optional)</span>
              <input
                type="date"
                className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Valid to (optional)</span>
              <input
                type="date"
                className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Discount % (optional)</span>
              <input
                className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="10"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[12px] font-semibold text-black/55">Image URL (optional)</span>
              <input
                className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>

          {imageUrl.trim() ? (
            <CoverCropperModal
              open={cropperOpen}
              imageUrl={imageUrl.trim()}
              initialFocusX={focusX}
              initialFocusY={focusY}
              initialZoom={zoom}
              minZoom={1}
              maxZoom={3}
              onCancel={() => setCropperOpen(false)}
              onSave={(next) => {
                setFocusX(clampPct(Number(next.focusX)));
                setFocusY(clampPct(Number(next.focusY)));
                setZoom(clampZoom(Number(next.zoom)));
                setCropperOpen(false);
              }}
            />
          ) : null}

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-black/20"
            />
            <span className="text-[12px] font-semibold text-black/60">Active</span>
          </label>
        </div>

        <div className="px-4 py-3 border-t border-black/5 flex justify-between shrink-0">
            <div>
              {!isNew && onDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="h-9 px-4 rounded-[3px] border border-[#b42318]/20 bg-white text-[13px] font-semibold text-[#b42318] hover:bg-[#b42318]/5 transition-colors"
                >
                  Delete
                </button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="h-9 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  onSave({
                    title: title.trim(),
                    summary: summary.trim() ? summary.trim() : null,
                    terms: terms.trim() ? terms.trim() : null,
                    valid_from: validFrom.trim() ? validFrom.trim() : null,
                    valid_to: validTo.trim() ? validTo.trim() : null,
                    discount_percentage: discountNum !== null && Number.isFinite(discountNum) ? Math.round(discountNum) : null,
                    image_url: imageUrl.trim() ? imageUrl.trim() : null,
                    image_focus_x: imageUrl.trim() ? clampPct(focusX) : null,
                    image_focus_y: imageUrl.trim() ? clampPct(focusY) : null,
                    image_zoom: imageUrl.trim() ? clampZoom(zoom) : null,
                    is_active: isActive,
                  })
                }
                disabled={!title.trim()}
                className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </div>
      </div>
    </div>
  );
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden="true"
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="rounded-[3px] border border-black/10 bg-[#fcfbf9] px-4 py-3">
        <div className="h-4 w-48 rounded bg-black/10 animate-pulse" />
      </div>

      <section className="rounded-[3px] border border-black/10 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-black/5">
          <div className="h-4 w-20 rounded bg-black/10 animate-pulse" />
          <div className="mt-2 h-3 w-56 rounded bg-black/10 animate-pulse" />
        </div>
        <div className="p-4 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <div className="h-3 w-28 rounded bg-black/10 animate-pulse" />
              <div className="h-10 w-full rounded-[3px] bg-black/10 animate-pulse" />
            </div>
            <div className="grid gap-1.5">
              <div className="h-3 w-36 rounded bg-black/10 animate-pulse" />
              <div className="h-10 w-full rounded-[3px] bg-black/10 animate-pulse" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <div className="h-3 w-16 rounded bg-black/10 animate-pulse" />
            <div className="min-h-24 w-full rounded-[3px] bg-black/10 animate-pulse" />
          </div>
          <div className="flex justify-end">
            <div className="h-9 w-28 rounded-[3px] bg-black/10 animate-pulse" />
          </div>
        </div>
      </section>

      <section className="rounded-[3px] border border-black/10 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-black/5">
          <div className="h-4 w-24 rounded bg-black/10 animate-pulse" />
          <div className="mt-2 h-3 w-60 rounded bg-black/10 animate-pulse" />
        </div>
        <div className="p-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
            <div className="grid gap-1.5">
              <div className="h-3 w-20 rounded bg-black/10 animate-pulse" />
              <div className="h-10 w-full rounded-[3px] bg-black/10 animate-pulse" />
            </div>
            <div className="grid gap-1.5">
              <div className="h-3 w-12 rounded bg-black/10 animate-pulse" />
              <div className="h-10 w-full rounded-[3px] bg-black/10 animate-pulse" />
            </div>
            <div className="h-10 w-20 rounded-[3px] bg-black/10 animate-pulse" />
          </div>
          <div className="flex justify-between pt-2">
            <div className="h-9 w-24 rounded-[3px] bg-black/10 animate-pulse" />
            <div className="h-9 w-40 rounded-[3px] bg-black/10 animate-pulse" />
          </div>
        </div>
      </section>
    </div>
  );
}

async function apiFetch<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((json as any)?.error ?? "Request failed");
  }
  return json as T;
}

export default function VendorDashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [form, setForm] = useState({
    business_name: "",
    logo_url: "",
    description: "",
    location_text: "",
    city: "",
    address: "",
    website_url: "",
    contact_phone: "",
    cover_focus_x: 50,
    cover_focus_y: 50,
    cover_zoom: 1,
  });
  const [socials, setSocials] = useState<Array<{ platform: string; url: string }>>([
    { platform: "facebook", url: "" },
    { platform: "instagram", url: "" },
    { platform: "tiktok", url: "" },
  ]);
  const [socialPlatformChoices, setSocialPlatformChoices] = useState<SocialPlatformOption[]>(["facebook", "instagram", "tiktok"]);
  const [socialCustomPlatforms, setSocialCustomPlatforms] = useState<string[]>(["", "", ""]);
  const [images, setImages] = useState<Array<{ image_url: string; caption: string; is_cover: boolean; display_order: number }>>([
    { image_url: "", caption: "", is_cover: true, display_order: 1 },
  ]);

  const [promos, setPromos] = useState<VendorPromo[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [allThemes, setAllThemes] = useState<Theme[]>([]);
  const [themeInput, setThemeInput] = useState("");

  // Album management state
  const [albums, setAlbums] = useState<Array<{ id: number; title: string; slug: string; photo_count: number; created_at: string }>>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<{ id: number; title: string; slug: string; photo_count: number; created_at: string } | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<Array<{ id: number; image_url: string; display_order: number }>>([]);
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumEditorOpen, setAlbumEditorOpen] = useState(false);
  const [deleteAlbumModalOpen, setDeleteAlbumModalOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState<{ id: number; title: string } | null>(null);

  const [cropperOpen, setCropperOpen] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [editingPhotoIndex, setEditingPhotoIndex] = useState<number | null>(null);

  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<number | null>(null);

  async function saveCoverCrop(next: { focusX: number; focusY: number; zoom: number }) {
    if (!token) return;
    setError(null);
    setSaving(true);
    try {
      const res = await apiFetch<{ vendor: VendorProfile }>("/api/vendor/profile", token, {
        method: "PATCH",
        body: JSON.stringify({
          cover_focus_x: Number.isFinite(Number(next.focusX)) ? Math.round(Number(next.focusX)) : null,
          cover_focus_y: Number.isFinite(Number(next.focusY)) ? Math.round(Number(next.focusY)) : null,
          cover_zoom: Number.isFinite(Number(next.zoom)) ? Number(next.zoom) : null,
        }),
      });
      setVendor(res.vendor);
      setForm((p) => ({
        ...p,
        cover_focus_x: Number.isFinite(Number((res.vendor as any).cover_focus_x)) ? Number((res.vendor as any).cover_focus_x) : 50,
        cover_focus_y: Number.isFinite(Number((res.vendor as any).cover_focus_y)) ? Number((res.vendor as any).cover_focus_y) : 50,
        cover_zoom: Number.isFinite(Number((res.vendor as any).cover_zoom)) ? Number((res.vendor as any).cover_zoom) : 1,
      }));
      setCropperOpen(false);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save cover crop.");
    } finally {
      setSaving(false);
    }
  }

  async function refreshPromos() {
    if (!token) return;
    try {
      const res = await apiFetch<{ promos: VendorPromo[] }>("/api/vendor/promos", token);
      setPromos(res.promos ?? []);
    } catch {
      setPromos([]);
    }
  }

  async function createPromo(payload: {
    title: string;
    summary: string | null;
    terms: string | null;
    valid_from: string | null;
    valid_to: string | null;
    discount_percentage: number | null;
    image_url: string | null;
    image_focus_x: number | null;
    image_focus_y: number | null;
    image_zoom: number | null;
    is_active: boolean;
  }) {
    if (!token) return;
    if (!isPremium) {
      setError("Promos are available on Premium plans only.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await apiFetch<{ promo: VendorPromo }>("/api/vendor/promos", token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      await refreshPromos();
    } catch (e: any) {
      setError(e?.message ?? "Failed to save promo.");
    } finally {
      setSaving(false);
    }
  }

  async function updatePromo(
    id: number,
    payload: {
      title: string;
      summary: string | null;
      terms: string | null;
      valid_from: string | null;
      valid_to: string | null;
      discount_percentage: number | null;
      image_url: string | null;
      image_focus_x: number | null;
      image_focus_y: number | null;
      image_zoom: number | null;
      is_active: boolean;
    }
  ) {
    if (!token) return;
    if (!isPremium) {
      setError("Promos are available on Premium plans only.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await apiFetch<{ promo: VendorPromo }>("/api/vendor/promos", token, {
        method: "PATCH",
        body: JSON.stringify({ id, ...payload }),
      });
      await refreshPromos();
    } catch (e: any) {
      setError(e?.message ?? "Failed to save promo.");
    } finally {
      setSaving(false);
    }
  }

  async function deletePromo(id: number) {
    if (!token) return;
    if (!isPremium) {
      setError("Promos are available on Premium plans only.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await apiFetch<{ ok: boolean }>(`/api/vendor/promos?id=${encodeURIComponent(String(id))}`, token, {
        method: "DELETE",
      });
      await refreshPromos();
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete promo.");
    } finally {
      setSaving(false);
    }
  }

  async function refreshInquiries() {
    if (!token) return;
    try {
      const res = await apiFetch<{ inquiries: Inquiry[] }>("/api/vendor/inquiries", token);
      setInquiries(res.inquiries ?? []);
    } catch {
      setInquiries([]);
    }
  }

  async function updateInquiryStatus(id: number, status: string) {
    if (!token) return;
    setError(null);
    setSaving(true);
    try {
      const res = await apiFetch<{ inquiry: Inquiry }>("/api/vendor/inquiries", token, {
        method: "PATCH",
        body: JSON.stringify({ id, status }),
      });
      setInquiries((prev) => prev.map((x) => (x.id === id ? res.inquiry : x)));
    } catch (e: any) {
      setError(e?.message ?? "Failed to update inquiry.");
    } finally {
      setSaving(false);
    }
  }

  // Album management functions
  async function loadAlbums() {
    if (!token) return;
    try {
      const res = await apiFetch<{ albums: Array<{ id: number; title: string; slug: string; photo_count: number; created_at: string }> }>("/api/vendor/albums", token);
      setAlbums(res.albums ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load albums.");
    }
  }

  async function createAlbum() {
    if (!token) return;
    if (!albumTitle.trim()) {
      setError("Album title is required");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await apiFetch<{ album: { id: number; title: string; slug: string; photo_count: number; created_at: string } }>("/api/vendor/albums", token, {
        method: "POST",
        body: JSON.stringify({ title: albumTitle.trim() }),
      });
      setAlbums((prev) => [res.album, ...prev]);
      setAlbumTitle("");
      setAlbumModalOpen(false);
    } catch (e: any) {
      setError(e?.message ?? "Failed to create album.");
    } finally {
      setSaving(false);
    }
  }

  async function updateAlbum(id: number, title: string) {
    if (!token) return;
    if (!title.trim()) {
      setError("Album title is required");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await apiFetch<{ album: { id: number; title: string; slug: string; photo_count: number; created_at: string } }>("/api/vendor/albums", token, {
        method: "PATCH",
        body: JSON.stringify({ id, title: title.trim() }),
      });
      setAlbums((prev) => prev.map((a) => (a.id === id ? res.album : a)));
      if (selectedAlbum?.id === id) {
        setSelectedAlbum(res.album);
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to update album.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAlbum(id: number) {
    if (!token) return;
    setError(null);
    setSaving(true);
    try {
      await apiFetch("/api/vendor/albums", token, {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      setAlbums((prev) => prev.filter((a) => a.id !== id));
      if (selectedAlbum?.id === id) {
        setSelectedAlbum(null);
        setAlbumPhotos([]);
      }
      setDeleteAlbumModalOpen(false);
      setAlbumToDelete(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete album.");
    } finally {
      setSaving(false);
    }
  }

  async function loadAlbumPhotos(albumId: number) {
    if (!token) return;
    try {
      const res = await apiFetch<{ album: any; photos: Array<{ id: number; image_url: string; display_order: number }> }>(`/api/vendor/albums/${albumId}/photos`, token);
      setAlbumPhotos(res.photos ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load album photos.");
    }
  }

  async function saveAlbumPhotos(albumId: number, photoUrls: string[]) {
    if (!token) return;
    setError(null);
    setSaving(true);
    try {
      const photosWithOrder = photoUrls.map((url, idx) => ({
        image_url: url,
        display_order: idx,
      }));
      const res = await apiFetch<{ photos: Array<{ id: number; image_url: string; display_order: number }> }>(`/api/vendor/albums/${albumId}/photos`, token, {
        method: "PUT",
        body: JSON.stringify({ photos: photosWithOrder }),
      });
      setAlbumPhotos(res.photos ?? []);
      // Update album photo count
      setAlbums((prev) => prev.map((a) => (a.id === albumId ? { ...a, photo_count: photoUrls.length } : a)));
    } catch (e: any) {
      setError(e?.message ?? "Failed to save album photos.");
    } finally {
      setSaving(false);
    }
  }

  const planName = String((Array.isArray(vendor?.plan) ? vendor?.plan?.[0]?.name : vendor?.plan?.name) ?? "")
    .trim()
    .toLowerCase();
  const isPremium = planName.includes("premium");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      const { data } = await supabase.auth.getSession();
      const session = data.session ?? null;
      const user = session?.user ?? null;

      if (!cancelled) {
        setEmail(user?.email ?? null);
        setToken(session?.access_token ?? null);
        if (!user) {
          router.push("/vendor/signin");
          return;
        }

        if (!session?.access_token) {
          setError("Missing auth session. Please open the invite link again.");
          setLoading(false);
          return;
        }

        try {
          const json = await apiFetch<{
            vendor: VendorProfile;
            socials: SocialLink[];
            images: VendorImage[];
            themes: { id: number; theme: Theme | Theme[] | null }[];
            allThemes: Theme[];
          }>("/api/vendor/profile", session.access_token);

          setVendor(json.vendor);
          setForm({
            business_name: json.vendor.business_name ?? "",
            logo_url: (json.vendor as any).logo_url ?? "",
            description: json.vendor.description ?? "",
            location_text: json.vendor.location_text ?? "",
            city: json.vendor.city ?? "",
            address: json.vendor.address ?? "",
            website_url: json.vendor.website_url ?? "",
            contact_phone: json.vendor.contact_phone ?? "",
            cover_focus_x: Number.isFinite(Number((json.vendor as any).cover_focus_x)) ? Number((json.vendor as any).cover_focus_x) : 50,
            cover_focus_y: Number.isFinite(Number((json.vendor as any).cover_focus_y)) ? Number((json.vendor as any).cover_focus_y) : 50,
            cover_zoom: Number.isFinite(Number((json.vendor as any).cover_zoom)) ? Number((json.vendor as any).cover_zoom) : 1,
          });

          const s = (json.socials ?? []).map((x) => ({ platform: x.platform, url: x.url }));
          const normalizedSocials = s.length > 0 ? s : [{ platform: "facebook", url: "" }];
          setSocials(normalizedSocials);
          setSocialPlatformChoices(
            normalizedSocials.map((row) => {
              const p = (row.platform ?? "").trim().toLowerCase();
              return isKnownPlatform(p) ? (p as SocialPlatformOption) : "other";
            })
          );
          setSocialCustomPlatforms(
            normalizedSocials.map((row) => {
              const p = (row.platform ?? "").trim();
              return isKnownPlatform(p) ? "" : p;
            })
          );

          const normalizedImgs = (json.images ?? []).map((img, idx) => ({
            image_url: img.image_url,
            caption: img.caption ?? "",
            is_cover: Boolean(img.is_cover),
            display_order: typeof img.display_order === "number" ? img.display_order : idx + 1,
          }));

          setImages(
            normalizedImgs.length > 0
              ? ensureSingleCover(normalizedImgs)
              : [{ image_url: "", caption: "", is_cover: true, display_order: 1 }]
          );

          // Normalize themes
          const normalizedThemes = (json.themes ?? [])
            .map((vt) => {
              const t = Array.isArray(vt.theme) ? vt.theme[0] : vt.theme;
              return t ? { id: t.id, name: t.name, slug: t.slug } : null;
            })
            .filter((t): t is Theme => t !== null);
          setThemes(normalizedThemes);
          setAllThemes(json.allThemes ?? []);

          const promosRes = await apiFetch<{ promos: VendorPromo[] }>("/api/vendor/promos", session.access_token).catch(
            () => ({ promos: [] as VendorPromo[] })
          );
          setPromos(promosRes.promos ?? []);

          const inquiriesRes = await apiFetch<{ inquiries: Inquiry[] }>("/api/vendor/inquiries", session.access_token).catch(
            () => ({ inquiries: [] as Inquiry[] })
          );
          setInquiries(inquiriesRes.inquiries ?? []);

          const albumsRes = await apiFetch<{ albums: Array<{ id: number; title: string; slug: string; photo_count: number; created_at: string }> }>("/api/vendor/albums", session.access_token).catch(
            () => ({ albums: [] })
          );
          setAlbums(albumsRes.albums ?? []);
        } catch (e: any) {
          setError(e?.message ?? "Failed to load vendor profile.");
        } finally {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  async function saveProfile() {
    if (!token) return;
    setError(null);
    setSaving(true);
    try {
      const res = await apiFetch<{ vendor: VendorProfile }>("/api/vendor/profile", token, {
        method: "PATCH",
        body: JSON.stringify({
          business_name: form.business_name,
          logo_url: form.logo_url || null,
          description: form.description || null,
          location_text: form.location_text || null,
          city: form.city || null,
          address: form.address || null,
          website_url: form.website_url || null,
          contact_phone: form.contact_phone || null,
          cover_focus_x: Number.isFinite(Number(form.cover_focus_x)) ? Number(form.cover_focus_x) : null,
          cover_focus_y: Number.isFinite(Number(form.cover_focus_y)) ? Number(form.cover_focus_y) : null,
          cover_zoom: Number.isFinite(Number(form.cover_zoom)) ? Number(form.cover_zoom) : null,
        }),
      });
      setVendor(res.vendor);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function saveSocials() {
    if (!token) return;
    if (!isPremium) {
      setError("Social links are available on Premium plans only.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const payload = socials.map((s) => ({ platform: s.platform, url: s.url }));
      const res = await apiFetch<{ socials: SocialLink[] }>("/api/vendor/social-links", token, {
        method: "PUT",
        body: JSON.stringify({ socials: payload }),
      });

      const s = (res.socials ?? []).map((x) => ({ platform: x.platform, url: x.url }));
      const normalizedSocials = s.length > 0 ? s : [{ platform: "facebook", url: "" }];
      setSocials(normalizedSocials);
      setSocialPlatformChoices(
        normalizedSocials.map((row) => {
          const p = (row.platform ?? "").trim().toLowerCase();
          return isKnownPlatform(p) ? (p as SocialPlatformOption) : "other";
        })
      );
      setSocialCustomPlatforms(
        normalizedSocials.map((row) => {
          const p = (row.platform ?? "").trim();
          return isKnownPlatform(p) ? "" : p;
        })
      );
    } catch (e: any) {
      setError(e?.message ?? "Failed to save social links.");
    } finally {
      setSaving(false);
    }
  }

  async function saveThemes() {
    if (!token) return;
    setError(null);
    setSaving(true);
    try {
      const res = await apiFetch<{ themes: { id: number; theme: Theme | Theme[] | null }[]; allThemes: Theme[]; created: Theme[] }>("/api/vendor/themes", token, {
        method: "PUT",
        body: JSON.stringify({ themes: themes.map((t) => ({ id: t.id, name: t.name, slug: t.slug })) }),
      });

      const normalizedThemes = (res.themes ?? [])
        .map((vt) => {
          const t = Array.isArray(vt.theme) ? vt.theme[0] : vt.theme;
          return t ? { id: t.id, name: t.name, slug: t.slug } : null;
        })
        .filter((t): t is Theme => t !== null);
      setThemes(normalizedThemes);
      setAllThemes(res.allThemes ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save themes.");
    } finally {
      setSaving(false);
    }
  }

  async function saveImages() {
    if (!token) return;
    setError(null);
    setSaving(true);
    try {
      const cleaned = ensureSingleCover(images).filter((i) => i.image_url.trim().length > 0);

      if (cleaned.length === 0) {
        setError("Cover photo is required.");
        return;
      }

      if (!cleaned.some((i) => i.is_cover)) {
        setError("Cover photo is required.");
        return;
      }

      const payload = cleaned.map((i, idx) => ({
        image_url: i.image_url,
        caption: i.caption || null,
        is_cover: i.is_cover,
        display_order: i.display_order || idx + 1,
      }));

      const res = await apiFetch<{ images: VendorImage[] }>("/api/vendor/images", token, {
        method: "PUT",
        body: JSON.stringify({ images: payload }),
      });

      const normalizedImgs = (res.images ?? []).map((img, idx) => ({
        image_url: img.image_url,
        caption: img.caption ?? "",
        is_cover: Boolean(img.is_cover),
        display_order: typeof img.display_order === "number" ? img.display_order : idx + 1,
      }));

      setImages(
        normalizedImgs.length > 0
          ? ensureSingleCover(normalizedImgs)
          : [{ image_url: "", caption: "", is_cover: true, display_order: 1 }]
      );
    } catch (e: any) {
      setError(e?.message ?? "Failed to save photos.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#fafafa]"
    >
      <div className="w-full">
        <main className="py-12">
          <div className="mx-auto w-full max-w-4xl">
            <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-black/5">
                <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Vendor dashboard</div>
                <div className="mt-1 text-[12px] text-black/45">
                  Signed in as <span className="font-semibold text-[#2c2c2c]">{email ?? ""}</span>
                  {vendor?.slug ? (
                    <>
                      {" "}
                      · Public page:{" "}
                      <a
                        className="text-[#6e4f33] hover:underline"
                        href={`/vendors/${vendor.slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        /vendors/{vendor.slug}
                      </a>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="p-6 grid gap-6">
                {loading ? <DashboardSkeleton /> : null}
                {error ? (
                  <div className="rounded-[3px] border border-[#c17a4e]/30 bg-[#fff7ed] px-4 py-3 text-[13px] text-[#6e4f33]">
                    {error}
                  </div>
                ) : null}

                {!loading && vendor ? (
                  <div className="rounded-[3px] border border-black/10 bg-[#fcfbf9] px-4 py-3 text-[13px] text-black/60">
                    Plan: <span className="font-semibold text-[#2c2c2c]">{(Array.isArray(vendor.plan) ? vendor.plan?.[0]?.name : vendor.plan?.name) ?? ""}</span>
                    {!isPremium ? (
                      <span className="ml-2 text-black/50">
                        (Some fields are Premium-only)
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {!loading ? (
                  <>
                    <section className="rounded-[3px] border border-black/10 bg-white overflow-hidden">
                  <div className="px-4 py-3 border-b border-black/5">
                    <div className="text-[13px] font-semibold text-[#2c2c2c]">Profile</div>
                    <div className="mt-1 text-[12px] text-black/45">Edit the details that show on your vendor page.</div>
                  </div>
                  <div className="p-4 grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Business name">
                        <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={form.business_name} onChange={(e) => setForm((p) => ({ ...p, business_name: e.target.value }))} />
                      </Field>
                      <Field label="Public contact email">
                        <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px] bg-[#fcfbf9] text-black/60" value={vendor?.contact_email ?? ""} disabled />
                      </Field>
                    </div>

                    <div className="rounded-[3px] border border-black/10 bg-white p-3">
                      <div className="text-[12px] font-semibold text-black/60">Logo</div>
                      <div className="mt-1 text-[12px] text-black/45">
                        This appears on your vendor card and page.
                      </div>
                      <div className="mt-3 flex items-center gap-4">
                        <div className="h-20 w-20 rounded-[3px] border border-black/10 bg-white overflow-hidden flex items-center justify-center">
                          {form.logo_url ? (
                            <img src={form.logo_url} alt="Logo preview" className="h-full w-full object-contain" />
                          ) : (
                            <div className="h-full w-full bg-[#fcfbf9] flex items-center justify-center text-[11px] text-black/40">
                              No logo
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setLogoModalOpen(true)}
                          className="h-9 px-3 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-[#6e4f33] hover:bg-black/[0.02] transition-colors"
                        >
                          {form.logo_url ? "Change logo" : "Add logo"}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[3px] border border-black/10 bg-white p-3">
                      <div className="text-[12px] font-semibold text-black/60">Card cover position</div>
                      <div className="mt-1 text-[12px] text-black/45">
                        Adjust how your cover photo is cropped on vendor cards (homepage + listings).
                      </div>

                      {(() => {
                        const cover = ensureSingleCover(images).find((i) => i.is_cover && i.image_url.trim());
                        const x = clampPct(Number(form.cover_focus_x));
                        const y = clampPct(Number(form.cover_focus_y));
                        const z = clampZoom(Number(form.cover_zoom));
                        const pos = `${x}% ${y}%`;

                        return (
                          <div className="mt-3 grid gap-3 sm:grid-cols-[160px_1fr] sm:items-start">
                            <div
                              className="h-24 w-full rounded-[3px] border border-black/10 overflow-hidden bg-[#fcfbf9]"
                              style={{
                                backgroundImage: cover?.image_url ? `url(${cover.image_url})` : undefined,
                                backgroundSize: `${z * 100}% ${z * 100}%`,
                                backgroundPosition: pos,
                              }}
                            />

                            <div className="grid gap-2">
                              <div className="text-[12px] font-semibold text-black/55">Zoom: {Math.round(z * 100)}%</div>
                              <button
                                type="button"
                                className="h-9 px-3 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-[#6e4f33] hover:bg-black/[0.02] transition-colors disabled:opacity-60"
                                onClick={() => setCropperOpen(true)}
                                disabled={!cover?.image_url}
                              >
                                Adjust cover
                              </button>
                              {!cover?.image_url ? (
                                <div className="text-[12px] text-black/45">
                                  Add a cover photo in the Photos section below to adjust cropping.
                                </div>
                              ) : null}
                            </div>

                            {cover?.image_url ? (
                              <CoverCropperModal
                                open={cropperOpen}
                                imageUrl={cover.image_url}
                                initialFocusX={x}
                                initialFocusY={y}
                                initialZoom={z}
                                minZoom={1}
                                maxZoom={3}
                                onCancel={() => setCropperOpen(false)}
                                onSave={(next) => void saveCoverCrop(next)}
                              />
                            ) : null}

                            <LogoModal
                              open={logoModalOpen}
                              logoUrl={form.logo_url}
                              onCancel={() => setLogoModalOpen(false)}
                              onSave={(url) => {
                                setForm((p) => ({ ...p, logo_url: url }));
                                setLogoModalOpen(false);
                              }}
                            />
                          </div>
                        );
                      })()}
                    </div>

                    <Field label="About">
                      <textarea className="min-h-24 w-full rounded-[3px] border border-black/10 px-3 py-2 text-[13px]" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="Location label">
                        <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={form.location_text} onChange={(e) => setForm((p) => ({ ...p, location_text: e.target.value }))} />
                      </Field>
                      <Field label="City">
                        <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
                      </Field>
                      <Field label="Phone">
                        <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={form.contact_phone} onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value }))} disabled={!isPremium} />
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Address">
                        <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
                      </Field>
                      <Field label="Website">
                        <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={form.website_url} onChange={(e) => setForm((p) => ({ ...p, website_url: e.target.value }))} placeholder="https://..." disabled={!isPremium} />
                      </Field>
                    </div>

                    <div className="flex justify-end">
                      <button type="button" onClick={saveProfile} disabled={saving} className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60">
                        <span className="inline-flex items-center gap-2">
                          {saving ? <Spinner className="text-white/90" /> : null}
                          <span>{saving ? "Saving…" : "Save profile"}</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </section>

                {/* Themes Section */}
                <section className="rounded-[3px] border border-black/10 bg-white overflow-hidden">
                  <div className="px-4 py-3 border-b border-black/5">
                    <div className="text-[13px] font-semibold text-[#2c2c2c]">Themes</div>
                    <div className="mt-1 text-[12px] text-black/45">Click to select/deselect themes. Click +Add to create custom themes.</div>
                  </div>
                  <div className="p-4 grid gap-4">
                    <div className="flex flex-wrap gap-2">
                      {/* Available themes as pills */}
                      {allThemes.map((theme) => {
                        const isSelected = themes.some((t) => t.id === theme.id);
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setThemes((prev) => prev.filter((t) => t.id !== theme.id));
                              } else {
                                setThemes((prev) => [...prev, theme]);
                              }
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                              isSelected
                                ? "bg-purple-100 text-purple-700 border border-purple-200"
                                : "bg-[#fcfbf9] text-black/60 border border-black/10 hover:bg-black/5"
                            }`}
                          >
                            {isSelected && (
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            )}
                            {theme.name}
                          </button>
                        );
                      })}

                      {/* Custom themes as selected pills */}
                      {themes
                        .filter((t) => !allThemes.some((at) => at.id === t.id))
                        .map((theme) => (
                          <span
                            key={theme.id}
                            className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-[12px] font-medium text-purple-700"
                          >
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                            {theme.name}
                            <button
                              type="button"
                              onClick={() => setThemes((prev) => prev.filter((t) => t.id !== theme.id))}
                              className="ml-1 text-purple-400 hover:text-purple-900"
                            >
                              ×
                            </button>
                          </span>
                        ))}

                      {/* Add custom theme button */}
                      <button
                        type="button"
                        onClick={() => {
                          const name = themeInput.trim();
                          if (!name) {
                            // Focus the input if empty
                            const input = document.getElementById("custom-theme-input") as HTMLInputElement;
                            input?.focus();
                            return;
                          }
                          if (themes.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
                            setThemeInput("");
                            return;
                          }
                          const existing = allThemes.find((t) => t.name.toLowerCase() === name.toLowerCase());
                          if (existing) {
                            setThemes((prev) => [...prev, existing]);
                          } else {
                            const newTheme: Theme = { id: -Date.now(), name, slug: "" };
                            setThemes((prev) => [...prev, newTheme]);
                          }
                          setThemeInput("");
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#fcfbf9] text-[#a67c52] border border-dashed border-[#a67c52]/40 hover:bg-[#a67c52]/5 transition-colors"
                      >
                        + Add
                      </button>
                    </div>

                    {/* Hidden input for custom theme entry */}
                    <div className="flex gap-2">
                      <input
                        id="custom-theme-input"
                        value={themeInput}
                        onChange={(e) => setThemeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const name = themeInput.trim();
                            if (!name) return;
                            if (themes.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
                              setThemeInput("");
                              return;
                            }
                            const existing = allThemes.find((t) => t.name.toLowerCase() === name.toLowerCase());
                            if (existing) {
                              setThemes((prev) => [...prev, existing]);
                            } else {
                              const newTheme: Theme = { id: -Date.now(), name, slug: "" };
                              setThemes((prev) => [...prev, newTheme]);
                            }
                            setThemeInput("");
                          }
                        }}
                        className="h-10 flex-1 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a68b6a] focus:ring-2 focus:ring-[#a68b6a]/10"
                        placeholder="Type custom theme name and press Enter or click +Add..."
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button type="button" onClick={saveThemes} disabled={saving} className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60">
                        <span className="inline-flex items-center gap-2">
                          {saving ? <Spinner className="text-white/90" /> : null}
                          <span>{saving ? "Saving…" : "Save themes"}</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </section>

                <section className="rounded-[3px] border border-black/10 bg-white overflow-hidden">
                  <div className="px-4 py-3 border-b border-black/5">
                    <div className="text-[13px] font-semibold text-[#2c2c2c]">Social links</div>
                    <div className="mt-1 text-[12px] text-black/45">Add links like Facebook, Instagram, TikTok.</div>
                  </div>
                  <div className="p-4 grid gap-3">
                    {socials.map((s, idx) => (
                      <div key={idx} className="grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
                        <Field label="Platform">
                          <select
                            className="h-10 w-full rounded-[3px] border border-black/10 bg-white px-3 text-[13px]"
                            value={socialPlatformChoices[idx] ?? "facebook"}
                            onChange={(e) => {
                              const next = e.target.value as SocialPlatformOption;
                              setSocialPlatformChoices((rows) => rows.map((r, i) => (i === idx ? next : r)));
                              setSocials((rows) => rows.map((r, i) => (i === idx ? { ...r, platform: next } : r)));
                            }}
                          >
                            {SOCIAL_PLATFORM_OPTIONS.map((p) => (
                              <option key={p} value={p}>
                                {p === "x" ? "X" : p.charAt(0).toUpperCase() + p.slice(1)}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="URL">
                          <input className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]" value={s.url} onChange={(e) => setSocials((rows) => rows.map((r, i) => (i === idx ? { ...r, url: e.target.value } : r)))} placeholder="https://..." />
                        </Field>
                        <button
                          type="button"
                          onClick={() => {
                            setSocials((rows) => rows.filter((_, i) => i !== idx));
                            setSocialPlatformChoices((rows) => rows.filter((_, i) => i !== idx));
                          }}
                          className="h-10 px-3 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-[#6e4f33] hover:bg-black/[0.02] transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    <div className="flex flex-wrap gap-2 justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSocials((rows) => [...rows, { platform: "facebook", url: "" }]);
                          setSocialPlatformChoices((rows) => [...rows, "facebook"]);
                        }}
                        className="h-9 px-3 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-[#6e4f33] hover:bg-black/[0.02] transition-colors"
                      >
                        Add link
                      </button>
                      <button type="button" onClick={saveSocials} disabled={saving} className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60">
                        <span className="inline-flex items-center gap-2">
                          {saving ? <Spinner className="text-white/90" /> : null}
                          <span>{saving ? "Saving…" : "Save social links"}</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </section>

                <section className="rounded-[3px] border border-black/10 bg-white overflow-hidden">
                  <div className="px-4 py-3 border-b border-black/5">
                    <div className="text-[13px] font-semibold text-[#2c2c2c]">Photos</div>
                    <div className="mt-1 text-[12px] text-black/45">Manage your portfolio images. One must be set as cover.</div>
                  </div>

                  <div className="p-4 grid gap-4">
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                      {images.filter(img => img.image_url.trim()).map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-[3px] border border-black/10 overflow-hidden bg-[#fcfbf9] group">
                          <img src={img.image_url} alt={img.caption || `Photo ${idx + 1}`} className="h-full w-full object-cover" />
                          {img.is_cover && (
                            <div className="absolute top-2 left-2 rounded-[3px] bg-[#a67c52] px-2 py-0.5 text-[10px] font-semibold text-white">
                              Cover
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPhotoIndex(idx);
                                setPhotoModalOpen(true);
                              }}
                              className="h-8 px-2 rounded-[3px] bg-white text-[11px] font-semibold text-[#6e4f33] shadow-sm"
                            >
                              Edit
                            </button>
                            {!img.is_cover && (
                              <button
                                type="button"
                                onClick={() => setImages(rows => rows.map((r, i) => ({ ...r, is_cover: i === idx })))}
                                className="h-8 px-2 rounded-[3px] bg-white text-[11px] font-semibold text-[#6e4f33] shadow-sm"
                              >
                                Set Cover
                              </button>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setImages(rows => ensureSingleCover(rows.filter((_, i) => i !== idx)))}
                            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white/90 text-black/60 hover:text-[#b42318] flex items-center justify-center text-[14px] shadow-sm"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPhotoIndex(null);
                          setPhotoModalOpen(true);
                        }}
                        className="aspect-square rounded-[3px] border border-dashed border-black/20 bg-[#fcfbf9] hover:bg-black/5 transition-colors flex flex-col items-center justify-center gap-1"
                      >
                        <span className="text-[20px] text-black/40">+</span>
                        <span className="text-[11px] font-semibold text-black/50">Add photo</span>
                      </button>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button type="button" onClick={saveImages} disabled={saving} className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60">
                        <span className="inline-flex items-center gap-2">
                          {saving ? <Spinner className="text-white/90" /> : null}
                          <span>{saving ? "Saving…" : "Save photos"}</span>
                        </span>
                      </button>
                    </div>

                    <PhotoModal
                      open={photoModalOpen}
                      photo={editingPhotoIndex !== null ? images[editingPhotoIndex] : null}
                      isNew={editingPhotoIndex === null}
                      onCancel={() => {
                        setPhotoModalOpen(false);
                        setEditingPhotoIndex(null);
                      }}
                      onSave={(photo) => {
                        if (editingPhotoIndex !== null) {
                          setImages(rows => rows.map((r, i) => (i === editingPhotoIndex ? photo : r)));
                        } else {
                          setImages(rows => ensureSingleCover([...rows, { ...photo, display_order: rows.length + 1 }]));
                        }
                        setPhotoModalOpen(false);
                        setEditingPhotoIndex(null);
                      }}
                      onDelete={editingPhotoIndex !== null ? () => {
                        setImages(rows => ensureSingleCover(rows.filter((_, i) => i !== editingPhotoIndex)));
                        setPhotoModalOpen(false);
                        setEditingPhotoIndex(null);
                      } : undefined}
                    />
                  </div>
                </section>

                <section className="rounded-[3px] border border-black/10 bg-white overflow-hidden">
                  <div className="px-4 py-3 border-b border-black/5">
                    <div className="text-[13px] font-semibold text-[#2c2c2c]">Albums</div>
                    <div className="mt-1 text-[12px] text-black/45">Organize your photos into public albums.</div>
                  </div>

                  <div className="p-4 grid gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[12px] font-semibold text-black/55">Your albums</div>
                      <button
                        type="button"
                        onClick={() => setAlbumModalOpen(true)}
                        className="h-9 px-3 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-[#6e4f33] hover:bg-black/[0.02] transition-colors"
                      >
                        Create album
                      </button>
                    </div>

                    {albums.length === 0 ? (
                      <div className="rounded-[3px] border border-black/10 bg-[#fcfbf9] p-4 text-[13px] text-black/55">
                        No albums yet. Create your first album to organize your photos.
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {albums.map((album) => (
                          <div key={album.id} className="rounded-[3px] border border-black/10 bg-white p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="text-[13px] font-semibold text-[#2c2c2c]">{album.title}</div>
                                <div className="text-[11px] text-black/45">{album.photo_count} photo{album.photo_count !== 1 ? "s" : ""}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAlbum(album);
                                  setAlbumEditorOpen(true);
                                  loadAlbumPhotos(album.id);
                                }}
                                className="h-8 px-2 rounded-[3px] border border-black/10 bg-white text-[11px] font-semibold text-[#6e4f33] hover:bg-black/[0.02] transition-colors"
                              >
                                Manage
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAlbumToDelete({ id: album.id, title: album.title });
                                  setDeleteAlbumModalOpen(true);
                                }}
                                className="h-8 px-2 rounded-[3px] border border-[#b42318]/20 bg-white text-[11px] font-semibold text-[#b42318] hover:bg-[#b42318]/5 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-[3px] border border-black/10 bg-white overflow-hidden">
                  <div className="px-4 py-3 border-b border-black/5">
                    <div className="text-[13px] font-semibold text-[#2c2c2c]">Promos</div>
                    <div className="mt-1 text-[12px] text-black/45">Create deals that appear on your vendor page.</div>
                  </div>

                  <div className="relative">
                    <div className={isPremium ? "p-4 grid gap-4" : "p-4 grid gap-4 opacity-50 pointer-events-none select-none"}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[12px] font-semibold text-black/55">Your promos</div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPromoId(null);
                            setPromoModalOpen(true);
                          }}
                          className="h-9 px-3 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-[#6e4f33] hover:bg-black/[0.02] transition-colors"
                        >
                          Add promo
                        </button>
                      </div>

                      {promos.length === 0 ? (
                        <div className="rounded-[3px] border border-black/10 bg-[#fcfbf9] p-4 text-[13px] text-black/55">
                          No promos yet.
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {promos.map((p) => (
                            <div key={p.id} className="rounded-[6px] border-2 border-dashed border-[#c17a4e]/40 bg-gradient-to-br from-[#fff7ed] to-white overflow-hidden relative">
                              {/* Promo Badge */}
                              <div className="absolute top-0 left-0 z-10">
                                <div className="bg-[#c17a4e] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-br-[6px]">
                                  PROMO
                                </div>
                              </div>

                              <div className="flex">
                                {/* Left: Image */}
                                {p.image_url ? (
                                  <div className="w-24 shrink-0 relative overflow-hidden">
                                    <div className="h-full min-h-[90px]">
                                      <img
                                        src={p.image_url}
                                        alt=""
                                        className="h-full w-full object-cover"
                                        style={{
                                          transformOrigin: `${clampPct(Number(p.image_focus_x ?? 50))}% ${clampPct(Number(p.image_focus_y ?? 50))}%`,
                                          transform: `scale(${clampZoom(Number(p.image_zoom ?? 1))})`,
                                        }}
                                        loading="lazy"
                                        decoding="async"
                                        referrerPolicy="no-referrer"
                                        draggable={false}
                                      />
                                    </div>
                                  </div>
                                ) : null}

                                {/* Right: Content */}
                                <div className="flex-1 p-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <div className="text-[13px] font-bold text-[#2c2c2c] leading-tight">{p.title}</div>
                                      {p.summary ? <div className="mt-0.5 text-[12px] text-black/55 line-clamp-1">{p.summary}</div> : null}
                                      <div className="mt-2 flex items-center gap-2">
                                        {typeof p.discount_percentage === "number" ? (
                                          <span className="inline-flex items-center rounded-[4px] bg-[#c17a4e] px-1.5 py-0.5 text-[11px] font-bold text-white">
                                            {p.discount_percentage}% OFF
                                          </span>
                                        ) : (
                                          <span className="text-[11px] font-semibold text-[#c17a4e]">Limited Time</span>
                                        )}
                                        <span className={p.is_active ? "text-[11px] font-semibold text-[#6e4f33]" : "text-[11px] font-semibold text-black/40"}>
                                          {p.is_active ? "Active" : "Inactive"}
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingPromoId(p.id);
                                        setPromoModalOpen(true);
                                      }}
                                      className="h-7 px-2 rounded-[3px] border border-black/10 bg-white text-[11px] font-semibold text-[#6e4f33] hover:bg-black/[0.02] transition-colors shrink-0"
                                    >
                                      Edit
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {!isPremium ? (
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="rounded-[3px] border border-black/10 bg-white/95 px-4 py-3 text-[13px] text-black/70 shadow-sm">
                          Promos are available on Premium plans.
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <PromoModal
                    open={promoModalOpen}
                    promo={editingPromoId ? promos.find((p) => p.id === editingPromoId) ?? null : null}
                    isNew={!editingPromoId}
                    onCancel={() => {
                      setPromoModalOpen(false);
                      setEditingPromoId(null);
                    }}
                    onDelete={
                      editingPromoId
                        ? () => {
                            const id = editingPromoId;
                            setPromoModalOpen(false);
                            setEditingPromoId(null);
                            void deletePromo(id);
                          }
                        : undefined
                    }
                    onSave={(payload) => {
                      if (editingPromoId) {
                        void updatePromo(editingPromoId, payload);
                      } else {
                        void createPromo(payload);
                      }
                      setPromoModalOpen(false);
                      setEditingPromoId(null);
                    }}
                  />
                </section>
              </>
            ) : null}

            {/* Inquiries Section - Available to all plans */}
            <section className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between">
                <div>
                  <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Inquiries</div>
                  <div className="mt-1 text-[12px] text-black/45">Messages from couples interested in your services.</div>
                </div>
                <button
                  type="button"
                  onClick={refreshInquiries}
                  className="h-9 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
                >
                  Refresh
                </button>
              </div>

              <div className="p-6">
                {inquiries.length === 0 ? (
                  <div className="rounded-[3px] border border-black/10 bg-[#fcfbf9] p-6 text-center">
                    <div className="text-[14px] text-black/60">No inquiries yet.</div>
                    <div className="mt-1 text-[12px] text-black/45">When couples contact you, their messages will appear here.</div>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {inquiries.map((inq) => (
                      <div
                        key={inq.id}
                        className={`rounded-[3px] border p-4 ${inq.status === "new" ? "border-[#a67c52]/30 bg-[#fffaf5]" : "border-black/10 bg-[#fcfbf9]"}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-semibold text-[#2c2c2c]">
                                {inq.name ?? "Anonymous"}
                              </span>
                              {inq.status === "new" && (
                                <span className="inline-flex items-center rounded-full bg-[#a67c52] px-2 py-0.5 text-[10px] font-semibold text-white">
                                  New
                                </span>
                              )}
                            </div>
                            {inq.email && (
                              <a
                                href={`mailto:${inq.email}`}
                                className="mt-0.5 block text-[12px] text-[#6e4f33] hover:underline"
                              >
                                {inq.email}
                              </a>
                            )}
                            {inq.phone && (
                              <a
                                href={`tel:${inq.phone.replace(/\s/g, "")}`}
                                className="mt-0.5 block text-[12px] text-[#6e4f33] hover:underline"
                              >
                                {inq.phone}
                              </a>
                            )}
                            {inq.wedding_date && (
                              <div className="mt-1 text-[11px] text-black/50">
                                Wedding date: {new Date(inq.wedding_date).toLocaleDateString()}
                              </div>
                            )}
                            <div className="mt-2 text-[13px] text-black/70 whitespace-pre-line">
                              {inq.message}
                            </div>
                            <div className="mt-2 text-[11px] text-black/40">
                              Received {new Date(inq.created_at).toLocaleString()}
                            </div>
                          </div>
                          <div className="shrink-0">
                            <select
                              value={String(inq.status ?? "new")}
                              disabled={saving}
                              onChange={(e) => updateInquiryStatus(inq.id, e.target.value)}
                              className="h-9 rounded-[3px] border border-black/10 bg-white px-2 text-[12px] text-black/70 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15 disabled:opacity-60"
                            >
                              <option value="new">New</option>
                              <option value="read">Read</option>
                              <option value="replied">Replied</option>
                              <option value="archived">Archived</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
        </main>

        {/* Create Album Modal */}
        {albumModalOpen ? (
          <div className="fixed inset-0 z-[60]">
            <div className="absolute inset-0 bg-black/40" onClick={() => setAlbumModalOpen(false)} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-sm rounded-[6px] border border-black/20 bg-white shadow-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-black/10">
                  <div className="text-[14px] font-semibold text-[#2c2c2c]">Create Album</div>
                  <div className="mt-1 text-[12px] text-black/55">
                    Give your album a title to get started.
                  </div>
                </div>
                <div className="px-5 py-4">
                  <label className="grid gap-1.5">
                    <span className="text-[12px] font-semibold text-black/55">Album title</span>
                    <input
                      type="text"
                      className="h-9 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
                      value={albumTitle}
                      onChange={(e) => setAlbumTitle(e.target.value)}
                      placeholder="e.g. Wedding Ceremonies"
                      autoFocus
                    />
                  </label>
                </div>
                <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setAlbumModalOpen(false)}
                    className="h-9 px-4 rounded-[6px] border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02] disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={saving || !albumTitle.trim()}
                    onClick={createAlbum}
                    className="h-9 px-4 rounded-[6px] bg-[#a68b6a] text-white text-[12px] font-semibold hover:bg-[#957a5c] disabled:opacity-60"
                  >
                    {saving ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Album Editor Modal */}
        {albumEditorOpen && selectedAlbum ? (
          <div className="fixed inset-0 z-[60]">
            <div className="absolute inset-0 bg-black/40" onClick={() => setAlbumEditorOpen(false)} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-2xl max-h-[90vh] rounded-[6px] border border-black/20 bg-white shadow-xl overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between">
                  <div>
                    <div className="text-[14px] font-semibold text-[#2c2c2c]">Manage Album: {selectedAlbum.title}</div>
                    <div className="mt-1 text-[12px] text-black/55">
                      Add or remove photos from this album.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlbumEditorOpen(false)}
                    className="h-8 w-8 rounded-[3px] border border-black/10 bg-white text-black/60 hover:bg-black/5 transition-colors"
                  >
                    ×
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                  <div className="grid gap-4">
                    <div>
                      <div className="text-[12px] font-semibold text-black/55 mb-3">Available Photos</div>
                      <div className="grid gap-2 max-h-48 overflow-y-auto">
                        {images.filter(img => img.image_url.trim()).map((img, idx) => (
                          <label key={idx} className="flex items-center gap-3 p-2 rounded-[3px] border border-black/10 hover:bg-black/[0.02] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={albumPhotos.some(ap => ap.image_url === img.image_url)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  // Add photo to album
                                  const newPhoto = { image_url: img.image_url, display_order: albumPhotos.length };
                                  saveAlbumPhotos(selectedAlbum.id, [...albumPhotos.map(ap => ap.image_url), img.image_url]);
                                } else {
                                  // Remove photo from album
                                  const newPhotos = albumPhotos.filter(ap => ap.image_url !== img.image_url);
                                  saveAlbumPhotos(selectedAlbum.id, newPhotos.map(ap => ap.image_url));
                                }
                              }}
                              className="h-4 w-4 rounded border-black/20"
                            />
                            <div className="h-12 w-12 rounded-[3px] border border-black/10 bg-white overflow-hidden flex-shrink-0">
                              <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-medium text-[#2c2c2c] truncate">{img.caption || "Untitled"}</div>
                              <div className="text-[11px] text-black/45">{img.image_url.substring(0, 50)}...</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[12px] font-semibold text-black/55 mb-3">Album Photos ({albumPhotos.length})</div>
                      {albumPhotos.length === 0 ? (
                        <div className="rounded-[3px] border border-black/10 bg-[#fcfbf9] p-4 text-[13px] text-black/55 text-center">
                          No photos in this album yet. Select photos from above to add them.
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {albumPhotos.map((photo) => (
                            <div key={photo.id} className="relative group">
                              <div className="aspect-square rounded-[3px] border border-black/10 bg-white overflow-hidden">
                                <img src={photo.image_url} alt="" className="h-full w-full object-cover" />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newPhotos = albumPhotos.filter(ap => ap.image_url !== photo.image_url);
                                  saveAlbumPhotos(selectedAlbum.id, newPhotos.map(ap => ap.image_url));
                                }}
                                className="absolute top-1 right-1 h-6 w-6 rounded-[3px] bg-[#b42318] text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setAlbumEditorOpen(false)}
                    className="h-9 px-4 rounded-[6px] border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02]"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Delete Album Modal */}
        {deleteAlbumModalOpen && albumToDelete ? (
          <div className="fixed inset-0 z-[60]">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteAlbumModalOpen(false)} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-sm rounded-[6px] border border-black/20 bg-white shadow-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-black/10">
                  <div className="text-[14px] font-semibold text-[#2c2c2c]">Delete Album</div>
                  <div className="mt-1 text-[12px] text-black/55">
                    Are you sure you want to delete this album? This action cannot be undone.
                  </div>
                </div>
                <div className="px-5 py-4 bg-[#fafafa]">
                  <div className="text-[13px] font-semibold text-[#2c2c2c]">{albumToDelete.title}</div>
                  <div className="mt-1 text-[11px] text-black/45">Album will be permanently deleted</div>
                </div>
                <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setDeleteAlbumModalOpen(false)}
                    className="h-9 px-4 rounded-[6px] border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02] disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => deleteAlbum(albumToDelete.id)}
                    className="h-9 px-4 rounded-[6px] bg-[#b42318] text-white text-[12px] font-semibold hover:bg-[#9a1d14] disabled:opacity-60"
                  >
                    {saving ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[12px] font-semibold text-black/55">{label}</span>
      {children}
    </label>
  );
}

function clampPct(v: number) {
  if (!Number.isFinite(v)) return 50;
  return Math.max(0, Math.min(100, v));
}

function clampZoom(v: number) {
  if (!Number.isFinite(v)) return 1;
  return Math.max(1, Math.min(3, v));
}

function ensureSingleCover<T extends { is_cover: boolean }>(rows: T[]) {
  let used = false;
  const normalized = rows.map((r) => {
    const v = Boolean((r as any).is_cover) && !used;
    if (v) used = true;
    return { ...r, is_cover: v };
  });
  if (!used && normalized.length > 0) {
    (normalized[0] as any).is_cover = true;
  }
  return normalized;
}

function LogoModal({
  open,
  logoUrl,
  onCancel,
  onSave,
}: {
  open: boolean;
  logoUrl: string;
  onCancel: () => void;
  onSave: (url: string) => void;
}) {
  const [url, setUrl] = useState(logoUrl);

  useEffect(() => {
    setUrl(logoUrl);
  }, [logoUrl, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-[3px] border border-black/10 bg-white shadow-lg">
        <div className="px-4 py-3 border-b border-black/5">
          <div className="text-[14px] font-semibold text-[#2c2c2c]">Logo</div>
          <div className="mt-1 text-[12px] text-black/45">Enter the URL of your logo image.</div>
        </div>
        <div className="p-4 grid gap-4">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-[3px] border border-black/10 bg-white overflow-hidden flex items-center justify-center">
              {url ? (
                <img src={url} alt="Logo preview" className="h-full w-full object-contain" />
              ) : (
                <div className="h-full w-full bg-[#fcfbf9] flex items-center justify-center text-[11px] text-black/40">
                  No logo
                </div>
              )}
            </div>
          </div>
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Logo URL</span>
            <input
              className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-9 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(url)}
              className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoModal({
  open,
  photo,
  isNew,
  onCancel,
  onSave,
  onDelete,
}: {
  open: boolean;
  photo: { image_url: string; caption: string; is_cover: boolean; display_order: number } | null;
  isNew: boolean;
  onCancel: () => void;
  onSave: (photo: { image_url: string; caption: string; is_cover: boolean; display_order: number }) => void;
  onDelete?: () => void;
}) {
  const [imageUrl, setImageUrl] = useState(photo?.image_url ?? "");
  const [caption, setCaption] = useState(photo?.caption ?? "");
  const [isCover, setIsCover] = useState(photo?.is_cover ?? false);

  useEffect(() => {
    setImageUrl(photo?.image_url ?? "");
    setCaption(photo?.caption ?? "");
    setIsCover(photo?.is_cover ?? false);
  }, [photo, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-[3px] border border-black/10 bg-white shadow-lg">
        <div className="px-4 py-3 border-b border-black/5">
          <div className="text-[14px] font-semibold text-[#2c2c2c]">{isNew ? "Add photo" : "Edit photo"}</div>
          <div className="mt-1 text-[12px] text-black/45">Enter the image URL and optional caption.</div>
        </div>
        <div className="p-4 grid gap-4">
          <div className="flex justify-center">
            <div className="h-32 w-full max-w-[200px] rounded-[3px] border border-black/10 bg-white overflow-hidden flex items-center justify-center">
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-[#fcfbf9] flex items-center justify-center text-[11px] text-black/40">
                  No image
                </div>
              )}
            </div>
          </div>
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Image URL</span>
            <input
              className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Caption (optional)</span>
            <input
              className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe this photo..."
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isCover}
              onChange={(e) => setIsCover(e.target.checked)}
              className="h-4 w-4 rounded border-black/20"
            />
            <span className="text-[12px] font-semibold text-black/60">Use as cover photo</span>
          </label>
          <div className="flex justify-between pt-2">
            <div>
              {!isNew && onDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="h-9 px-4 rounded-[3px] border border-[#b42318]/20 bg-white text-[13px] font-semibold text-[#b42318] hover:bg-[#b42318]/5 transition-colors"
                >
                  Delete
                </button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="h-9 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onSave({ image_url: imageUrl, caption, is_cover: isCover, display_order: photo?.display_order ?? 1 })}
                disabled={!imageUrl.trim()}
                className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
