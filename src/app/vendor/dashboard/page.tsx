"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "../../../lib/supabaseBrowser";
import { toast } from "../../../lib/toast";
import CoverCropperModal from "./CoverCropperModal";
import PhotoModal from "../../../components/PhotoModal";
import VideoModal from "./VideoModal";
import { ImageUploadDropzone } from "../../../components/ImageUploadDropzone";
import PromoQRCode from "../../../components/PromoQRCode";
import VendorProfileUI from "../../../features/vendors/components/VendorProfileUI";

const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
  }
`;

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
  contact_person_1_name?: string | null;
  contact_person_1_position?: string | null;
  contact_person_2_name?: string | null;
  contact_person_2_position?: string | null;
  admin_email_1?: string | null;
  admin_email_2?: string | null;
  admin_email_3?: string | null;
  admin_phone_1?: string | null;
  admin_phone_2?: string | null;
  admin_phone_3?: string | null;
  plan_id: number | null;
  is_active: boolean | null;
  verified_status: string | null;
  average_rating?: number | null;
  review_count?: number | null;
  plan?: { id: number; name: string } | { id: number; name: string }[] | null;
};

type SocialLink = { id: number; platform: string; url: string };
type VendorImage = {
  id: number;
  image_url: string;
  caption: string | null;
  is_cover: boolean | null;
  display_order: number | null;
  media_type?: 'image' | 'video';
};
type Theme = { id: number; name: string; slug: string };
type VendorVideo = { id: number; video_url: string; title: string | null; display_order: number };

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-bold uppercase tracking-widest text-black/40 ml-1">{label}</span>
      {children}
    </label>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="rounded-[3px] border border-black/10 bg-[#fafafa] px-4 py-3">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-2xl overflow-hidden transform transition-all">
        <div className="px-8 py-6 border-b border-black/[0.04] bg-[#fafafa]/30">
          <h2 className="font-serif text-[18px] font-bold text-[#2c2c2c]">Brand Logo</h2>
          <p className="mt-1 text-[12px] text-black/45">Enter the URL of your official business logo.</p>
        </div>
        <div className="p-8 grid gap-6">
          <div className="flex justify-center">
            <div className="h-32 w-32 rounded-lg border border-black/[0.08] bg-white overflow-hidden flex items-center justify-center shadow-inner">
              {url ? (
                <img src={url} alt="Logo preview" className="h-full w-full object-contain p-2" />
              ) : (
                <div className="h-full w-full bg-[#fafafa] flex items-center justify-center text-[11px] font-bold text-black/30 uppercase tracking-widest">
                  No Logo
                </div>
              )}
            </div>
          </div>
          <Field label="Logo URL">
            <input
              className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-11 px-6 rounded-lg text-[13px] font-bold text-black/40 hover:text-black/60 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(url)}
              className="h-11 px-10 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-lg shadow-[#a67c52]/20 hover:bg-[#8e6a46] hover:shadow-xl transition-all duration-300"
            >
              Save Logo
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

const SOCIAL_PLATFORM_OPTIONS = ["facebook", "instagram", "tiktok", "x", "pinterest", "youtube", "website", "linkedin", "other"] as const;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-lg max-h-[90vh] rounded-lg bg-white shadow-2xl overflow-hidden flex flex-col transform transition-all">
        <div className="px-8 py-6 border-b border-black/[0.04] bg-[#fafafa]/30 shrink-0">
          <h2 className="font-serif text-[20px] font-bold text-[#2c2c2c]">{isNew ? "Create New Promo" : "Edit Promo Details"}</h2>
          <p className="mt-1 text-[12px] text-black/45">Define your special offer to attract more couples.</p>
        </div>

        <div className="overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {imageUrl.trim() ? (
            <div className="rounded-lg border border-black/[0.08] bg-white overflow-hidden shadow-sm">
              <div className="w-full aspect-[4/3] relative bg-[#fafafa]">
                <img
                  src={imageUrl.trim()}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover select-none transition-transform duration-500"
                  style={{ transformOrigin: `${focusX}% ${focusY}%`, transform: `scale(${zoom})` }}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  draggable={false}
                />
              </div>
              <div className="px-4 py-3 flex items-center justify-between bg-[#fafafa]/50">
                <div className="text-[11px] font-black uppercase tracking-widest text-[#a67c52]">Cover Preview</div>
                <button
                  type="button"
                  onClick={() => setCropperOpen(true)}
                  className="h-8 px-4 rounded-lg border border-[#a67c52]/30 bg-white text-[11px] font-bold text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm"
                >
                  Adjust Framing
                </button>
              </div>
            </div>
          ) : null}

          <Field label="Promo Title">
            <input
              className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 15% Early Bird Discount"
            />
          </Field>

          <Field label="Short Summary">
            <input
              className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Briefly describe the offer"
            />
          </Field>

          <Field label="Full Terms & Conditions">
            <textarea
              className="min-h-24 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 py-3 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200 resize-none"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Detailed terms of the promo..."
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Starts On">
              <input
                type="date"
                className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
              />
            </Field>
            <Field label="Expires On">
              <input
                type="date"
                className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Discount %">
              <input
                type="number"
                className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="e.g. 15"
              />
            </Field>
            <Field label="Cover Image URL">
              <input
                className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </Field>
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only"
                />
                <div className={`block w-10 h-6 rounded-full transition-colors duration-300 ${isActive ? "bg-[#a67c52]" : "bg-black/10"}`} />
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${isActive ? "translate-x-4" : ""}`} />
              </div>
              <span className="text-[13px] font-bold text-black/50 group-hover:text-black/70 transition-colors">{isActive ? "Promo is Active" : "Promo is Hidden"}</span>
            </label>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-black/[0.04] bg-[#fafafa]/30 flex justify-between shrink-0">
          <div>
            {!isNew && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="h-11 px-6 rounded-lg border border-red-100 bg-white text-[13px] font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
              >
                Delete Promo
              </button>
            ) : null}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="h-11 px-6 rounded-lg text-[13px] font-bold text-black/40 hover:text-black/60 transition-all duration-300"
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
              className="h-11 px-10 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-lg shadow-[#a67c52]/20 hover:bg-[#8e6a46] hover:shadow-xl transition-all duration-300 disabled:opacity-60"
            >
              {isNew ? "Create Promo" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VendorDashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [subscription, setSubscription] = useState<{ id: number; status: string; expiry_date: string | null; verification_doc_url: string | null } | null>(null);
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
    contact_person_1_name: "",
    contact_person_1_position: "",
    contact_person_2_name: "",
    contact_person_2_position: "",
    admin_email_1: "",
    admin_email_2: "",
    admin_email_3: "",
    admin_phone_1: "",
    admin_phone_2: "",
    admin_phone_3: "",
  });
  const [socials, setSocials] = useState<Array<{ platform: string; url: string }>>([
    { platform: "facebook", url: "" },
    { platform: "instagram", url: "" },
    { platform: "tiktok", url: "" },
  ]);
  const [socialPlatformChoices, setSocialPlatformChoices] = useState<SocialPlatformOption[]>(["facebook", "instagram", "tiktok"]);
  const [socialCustomPlatforms, setSocialCustomPlatforms] = useState<string[]>(["", "", ""]);
  const [images, setImages] = useState<Array<{ image_url: string; caption: string; is_cover: boolean; display_order: number; media_type?: 'image' | 'video' }>>([
    { image_url: "", caption: "", is_cover: true, display_order: 1 },
  ]);
  const [videos, setVideos] = useState<VendorVideo[]>([]);

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

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  async function saveCoverCrop(next: { focusX: number; focusY: number; zoom: number }) {
    if (!token) return;
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
      toast.error(e?.message ?? "Failed to save cover crop.");
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
      toast.error("Promos are available on Premium plans only.");
      return;
    }
    setSaving(true);
    try {
      await apiFetch<{ promo: VendorPromo }>("/api/vendor/promos", token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      await refreshPromos();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save promo.");
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
      toast.error("Promos are available on Premium plans only.");
      return;
    }
    setSaving(true);
    try {
      await apiFetch<{ promo: VendorPromo }>("/api/vendor/promos", token, {
        method: "PATCH",
        body: JSON.stringify({ id, ...payload }),
      });
      await refreshPromos();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save promo.");
    } finally {
      setSaving(false);
    }
  }

  async function deletePromo(id: number) {
    if (!token) return;
    if (!isPremium) {
      toast.error("Promos are available on Premium plans only.");
      return;
    }
    setSaving(true);
    try {
      await apiFetch<{ ok: boolean }>(`/api/vendor/promos?id=${encodeURIComponent(String(id))}`, token, {
        method: "DELETE",
      });
      await refreshPromos();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete promo.");
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
    setSaving(true);
    try {
      const res = await apiFetch<{ inquiry: Inquiry }>("/api/vendor/inquiries", token, {
        method: "PATCH",
        body: JSON.stringify({ id, status }),
      });
      setInquiries((prev) => prev.map((x) => (x.id === id ? res.inquiry : x)));
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update inquiry.");
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
      toast.error(e?.message ?? "Failed to load albums.");
    }
  }

  async function createAlbum() {
    if (!token) return;
    if (!albumTitle.trim()) {
      toast.error("Album title is required");
      return;
    }
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
      toast.error(e?.message ?? "Failed to create album.");
    } finally {
      setSaving(false);
    }
  }

  async function updateAlbum(id: number, title: string) {
    if (!token) return;
    if (!title.trim()) {
      toast.error("Album title is required");
      return;
    }
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
      toast.error(e?.message ?? "Failed to update album.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAlbum(id: number) {
    if (!token) return;
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
      toast.error(e?.message ?? "Failed to delete album.");
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
      toast.error(e?.message ?? "Failed to load album photos.");
    }
  }

  async function saveAlbumPhotos(albumId: number, photoUrls: string[]) {
    if (!token) return;
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
      toast.error(e?.message ?? "Failed to save album photos.");
    } finally {
      setSaving(false);
    }
  }

  async function saveVerificationDoc(url: string) {
    if (!token) return;
    setSaving(true);
    try {
      const res = await apiFetch<{ subscription: any }>("/api/vendor/subscription", token, {
        method: "PATCH",
        body: JSON.stringify({ verification_doc_url: url }),
      });
      setSubscription(res.subscription);
      toast.success("Verification document uploaded.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save verification document.");
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
          toast.error("Missing auth session. Please open the invite link again.");
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
            subscription: { id: number; status: string; expiry_date: string | null; verification_doc_url: string | null } | null;
            videos: VendorVideo[];
          }>("/api/vendor/profile", session.access_token);

          setVendor(json.vendor);
          setSubscription(json.subscription);
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
            contact_person_1_name: json.vendor.contact_person_1_name ?? "",
            contact_person_1_position: json.vendor.contact_person_1_position ?? "",
            contact_person_2_name: json.vendor.contact_person_2_name ?? "",
            contact_person_2_position: json.vendor.contact_person_2_position ?? "",
            admin_email_1: json.vendor.admin_email_1 ?? "",
            admin_email_2: json.vendor.admin_email_2 ?? "",
            admin_email_3: json.vendor.admin_email_3 ?? "",
            admin_phone_1: json.vendor.admin_phone_1 ?? "",
            admin_phone_2: json.vendor.admin_phone_2 ?? "",
            admin_phone_3: json.vendor.admin_phone_3 ?? "",
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
            media_type: img.media_type || 'image',
          }));

          setImages(
            normalizedImgs.length > 0
              ? ensureSingleCover(normalizedImgs)
              : [{ image_url: "", caption: "", is_cover: true, display_order: 1 }]
          );

          setVideos(json.videos ?? []);

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
          toast.error(e?.message ?? "Failed to load vendor profile.");
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
          contact_person_1_name: form.contact_person_1_name || null,
          contact_person_1_position: form.contact_person_1_position || null,
          contact_person_2_name: form.contact_person_2_name || null,
          contact_person_2_position: form.contact_person_2_position || null,
          admin_email_1: form.admin_email_1 || null,
          admin_email_2: form.admin_email_2 || null,
          admin_email_3: form.admin_email_3 || null,
          admin_phone_1: form.admin_phone_1 || null,
          admin_phone_2: form.admin_phone_2 || null,
          admin_phone_3: form.admin_phone_3 || null,
        }),
      });
      setVendor(res.vendor);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function saveSocials() {
    if (!token) return;
    if (!isPremium) {
      toast.error("Social links are available on Premium plans only.");
      return;
    }
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
      toast.error(e?.message ?? "Failed to save social links.");
    } finally {
      setSaving(false);
    }
  }

  async function saveThemes() {
    if (!token) return;
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
      toast.error(e?.message ?? "Failed to save themes.");
    } finally {
      setSaving(false);
    }
  }

  async function saveImages() {
    if (!token) return;
    setSaving(true);
    try {
      const cleaned = ensureSingleCover(images).filter((i) => i.image_url.trim().length > 0);

      if (cleaned.length === 0) {
        toast.error("Cover photo is required.");
        return;
      }

      if (!cleaned.some((i) => i.is_cover)) {
        toast.error("Cover photo is required.");
        return;
      }

      const payload = cleaned.map((i, idx) => ({
        image_url: i.image_url,
        caption: i.caption || null,
        is_cover: i.is_cover,
        display_order: i.display_order || idx + 1,
        media_type: i.media_type || 'image',
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
        media_type: img.media_type || 'image',
      }));

      setImages(
        normalizedImgs.length > 0
          ? ensureSingleCover(normalizedImgs)
          : [{ image_url: "", caption: "", is_cover: true, display_order: 1 }]
      );
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save photos.");
    } finally {
      setSaving(false);
    }
  }

  async function saveVideos() {
    if (!token) return;
    setSaving(true);
    try {
      const cleaned = videos.filter((v) => v.video_url.trim().length > 0);
      const payload = cleaned.map((v, idx) => ({
        video_url: v.video_url.trim(),
        title: v.title || null,
        display_order: idx + 1,
      }));

      const res = await apiFetch<{ videos: VendorVideo[] }>("/api/vendor/videos", token, {
        method: "PUT",
        body: JSON.stringify({ videos: payload }),
      });

      setVideos(res.videos ?? []);
      toast.success("Videos saved.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save videos.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customScrollbarStyles }} />
      <div
      className="min-h-screen bg-[#fafafa]"
    >
      <div className="w-full">
        <main className="py-12">
          <div className="mx-auto w-full max-w-4xl">
            <div className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-8">
              <div className="px-6 py-5 border-b border-black/[0.04] flex items-center justify-between bg-gradient-to-r from-white to-[#fafafa]">
                <div>
                  <h1 className="font-serif text-[22px] font-semibold tracking-tight text-[#2c2c2c]">Vendor Dashboard</h1>
                  <div className="mt-1 text-[12px] text-black/45">
                    Manage your business profile, inquiries, and promotions.
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-[12px] font-bold text-[#2c2c2c]">{email ?? ""}</div>
                    <div className="text-[10px] text-black/40 uppercase tracking-wider">Signed in</div>
                  </div>
                  {vendor?.slug ? (
                    <button
                      type="button"
                      onClick={() => setIsPreviewOpen(true)}
                      className="h-9 px-4 inline-flex items-center justify-center rounded-lg border border-[#a67c52]/30 bg-white text-[13px] font-semibold text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      Preview Edits
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

              <div className="grid gap-8">
                {loading ? <DashboardSkeleton /> : null}

                {!loading && vendor ? (
                  <>
                    <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    <div className="bg-[#fafafa]/50 px-6 py-3 text-[12px] text-black/50 border-b border-black/[0.04] flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold uppercase tracking-wider">Plan:</span>
                        <span className="font-semibold text-[#a67c52] bg-[#a67c52]/10 px-2 py-0.5 rounded text-[11px]">
                          {(Array.isArray(vendor.plan) ? vendor.plan?.[0]?.name : vendor.plan?.name) ?? ""}
                        </span>
                        {!isPremium ? (
                          <span className="ml-1 italic text-black/40">
                            (Some fields are Premium-only)
                          </span>
                        ) : null}
                      </div>
                      {subscription?.expiry_date && (
                        <div>
                          Expiry: <span className="font-semibold text-[#2c2c2c]">{new Date(subscription.expiry_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 grid gap-4">
                      <div className="text-[13px] font-bold text-[#2c2c2c] uppercase tracking-wider">Plan Verification Document</div>
                      <div className="text-[12px] text-black/45 -mt-1">Upload a document (e.g. DTI Registration, ID) to verify your vendor plan.</div>
                      <div className="max-w-md mt-2">
                        <ImageUploadDropzone
                          bucket="vendor-assets"
                          folder="verifications"
                          label=""
                          onUploadComplete={(res) => saveVerificationDoc(res.url)}
                          existingUrl={subscription?.verification_doc_url}
                          onClear={() => saveVerificationDoc("")}
                        />
                      </div>
                    </div>
                    </section>
                  </>
                ) : null}

                {!loading ? (
                  <>
                    <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                  <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30">
                    <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2c2c2c]">Profile Details</h2>
                    <div className="mt-1 text-[12px] text-black/45">Edit the core business details that show on your vendor page.</div>
                  </div>
                  <div className="p-6 grid gap-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field label="Business name">
                        <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.business_name} onChange={(e) => setForm((p) => ({ ...p, business_name: e.target.value }))} />
                      </Field>
                      <Field label="Public contact email">
                        <input className="h-11 w-full rounded-lg border border-black/[0.08] px-4 text-[13px] bg-[#fafafa] text-black/40 cursor-not-allowed" value={vendor?.contact_email ?? ""} disabled />
                      </Field>
                    </div>

                    <div className="rounded-lg border border-black/[0.06] bg-[#fafafa]/30 p-4">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-black/40">Business Logo</div>
                      <div className="mt-1 text-[12px] text-black/45">
                        This appears on your vendor card and profile page.
                      </div>
                      <div className="mt-4 flex items-center gap-6">
                        <div className="h-24 w-24 rounded-lg border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center shrink-0">
                          {form.logo_url ? (
                            <img src={form.logo_url} alt="Logo preview" className="h-full w-full object-contain" />
                          ) : (
                            <div className="h-full w-full bg-[#fafafa] flex items-center justify-center text-[10px] text-black/30 font-bold uppercase tracking-tighter text-center px-2">
                              No Logo
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => setLogoModalOpen(true)}
                            className="h-9 px-5 rounded-lg border border-[#a67c52]/30 bg-white text-[12px] font-semibold text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm"
                          >
                            {form.logo_url ? "Change Logo" : "Add Logo"}
                          </button>
                          {form.logo_url && (
                            <div className="text-[10px] text-black/40 italic">Recommended: Square PNG/SVG</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-black/[0.06] bg-[#fafafa]/30 p-4">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-black/40">Card Cover Position</div>
                      <div className="mt-1 text-[12px] text-black/45">
                        Fine-tune how your cover photo displays on search results.
                      </div>

                      {(() => {
                        const cover = ensureSingleCover(images).find((i) => i.is_cover && i.image_url.trim());
                        const x = clampPct(Number(form.cover_focus_x));
                        const y = clampPct(Number(form.cover_focus_y));
                        const z = clampZoom(Number(form.cover_zoom));
                        const pos = `${x}% ${y}%`;

                        return (
                          <div className="mt-4 grid gap-6 sm:grid-cols-[200px_1fr] sm:items-center">
                            <div
                              className="h-28 w-full rounded-lg border border-white shadow-md overflow-hidden bg-[#fafafa] ring-1 ring-black/[0.05]"
                              style={{
                                backgroundImage: cover?.image_url ? `url(${cover.image_url})` : undefined,
                                backgroundSize: `${z * 100}% ${z * 100}%`,
                                backgroundPosition: pos,
                              }}
                            />

                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-bold text-[#a67c52]">Zoom: {Math.round(z * 100)}%</span>
                                <span className="h-1 w-1 rounded-full bg-black/10" />
                                <span className="text-[12px] text-black/40">Position: {x}% {y}%</span>
                              </div>
                              <button
                                type="button"
                                className="h-9 px-5 rounded-lg border border-[#a67c52]/30 bg-white text-[12px] font-semibold text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                onClick={() => setCropperOpen(true)}
                                disabled={!cover?.image_url}
                              >
                                Adjust Crop Position
                              </button>
                              {!cover?.image_url ? (
                                <div className="text-[11px] text-red-400/80 font-medium">
                                  Please add a cover photo in the "Photos" section first.
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

                    <Field label="What Makes Us Unique">
                      <div className="relative">
                        <textarea
                          className="min-h-32 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 py-3 text-[13px] pr-14 leading-relaxed transition-all duration-200 focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 outline-none resize-none"
                          value={form.description}
                          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value.slice(0, 300) }))}
                          maxLength={300}
                          placeholder="Tell couples what makes your business special..."
                        />
                        <span className="absolute bottom-3 right-4 text-[10px] font-bold text-black/30 bg-white/80 px-1.5 py-0.5 rounded-md shadow-sm">{(form.description?.length ?? 0)}/300</span>
                      </div>
                    </Field>

                    <div className="grid gap-6 sm:grid-cols-3">
                      <Field label="Region">
                        <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.location_text} onChange={(e) => setForm((p) => ({ ...p, location_text: e.target.value }))} />
                      </Field>
                      <Field label="City/Wedding Center">
                        <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
                      </Field>
                      <Field label="Phone">
                        <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 outline-none disabled:opacity-50 disabled:cursor-not-allowed" value={form.contact_phone} onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value }))} disabled={!isPremium} />
                      </Field>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field label="Address">
                        <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
                      </Field>
                      <Field label="Website">
                        <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 outline-none disabled:opacity-50 disabled:cursor-not-allowed" value={form.website_url} onChange={(e) => setForm((p) => ({ ...p, website_url: e.target.value }))} placeholder="https://..." disabled={!isPremium} />
                      </Field>
                    </div>

                    <div className="my-8 border-t border-black/[0.04]" />
                    
                    <div className="bg-[#fafafa]/50 rounded-lg p-6 border border-black/[0.03]">
                      <h3 className="font-serif text-[16px] font-semibold text-[#2c2c2c] mb-6 flex items-center gap-2">
                        <div className="h-8 w-1 bg-[#a67c52] rounded-full" />
                        Admin & Contact Info <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-black/30 ml-auto">Internal Use Only</span>
                      </h3>
                      
                      <div className="grid gap-6 sm:grid-cols-2 mb-6">
                        <Field label="Contact Person 1 Name">
                          <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.contact_person_1_name} onChange={(e) => setForm((p) => ({ ...p, contact_person_1_name: e.target.value }))} />
                        </Field>
                        <Field label="Position 1">
                          <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.contact_person_1_position} onChange={(e) => setForm((p) => ({ ...p, contact_person_1_position: e.target.value }))} />
                        </Field>
                      </div>
                      
                      <div className="grid gap-6 sm:grid-cols-2 mb-6">
                        <Field label="Contact Person 2 Name">
                          <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.contact_person_2_name} onChange={(e) => setForm((p) => ({ ...p, contact_person_2_name: e.target.value }))} />
                        </Field>
                        <Field label="Position 2">
                          <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.contact_person_2_position} onChange={(e) => setForm((p) => ({ ...p, contact_person_2_position: e.target.value }))} />
                        </Field>
                      </div>

                      <div className="grid gap-6 sm:grid-cols-3 mb-6">
                        <Field label="Admin Email 1">
                          <input type="email" className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.admin_email_1} onChange={(e) => setForm((p) => ({ ...p, admin_email_1: e.target.value }))} />
                        </Field>
                        <Field label="Admin Email 2">
                          <input type="email" className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.admin_email_2} onChange={(e) => setForm((p) => ({ ...p, admin_email_2: e.target.value }))} />
                        </Field>
                        <Field label="Admin Email 3">
                          <input type="email" className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.admin_email_3} onChange={(e) => setForm((p) => ({ ...p, admin_email_3: e.target.value }))} />
                        </Field>
                      </div>

                      <div className="grid gap-6 sm:grid-cols-3">
                        <Field label="Admin Phone 1">
                          <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.admin_phone_1} onChange={(e) => setForm((p) => ({ ...p, admin_phone_1: e.target.value }))} />
                        </Field>
                        <Field label="Admin Phone 2">
                          <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.admin_phone_2} onChange={(e) => setForm((p) => ({ ...p, admin_phone_2: e.target.value }))} />
                        </Field>
                        <Field label="Admin Phone 3">
                          <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] transition-all duration-200 focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 outline-none" value={form.admin_phone_3} onChange={(e) => setForm((p) => ({ ...p, admin_phone_3: e.target.value }))} />
                        </Field>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <button type="button" onClick={saveProfile} disabled={saving} className="h-11 px-8 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-[0_4px_12px_rgba(166,124,82,0.3)] hover:bg-[#8e6a46] hover:shadow-[0_6px_16px_rgba(166,124,82,0.4)] transition-all duration-300 disabled:opacity-60 disabled:shadow-none">
                        <span className="inline-flex items-center gap-2">
                          {saving ? <Spinner className="text-white/90" /> : null}
                          <span>{saving ? "Saving Changes…" : "Save Profile Details"}</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </section>

                {/* Themes Section */}
                <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                  <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30 flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2c2c2c]">Business Categories</h2>
                      <div className="mt-1 text-[12px] text-black/45">Select up to 10 themes that best describe your services.</div>
                    </div>
                    <div className="text-[11px] font-bold text-[#a67c52] bg-[#a67c52]/10 px-3 py-1 rounded-lg uppercase tracking-wider">
                      {themes.length}/10 Selected
                    </div>
                  </div>
                  <div className="p-6 grid gap-6">
                    {themes.length >= 10 && (
                      <div className="px-4 py-3 rounded-lg border border-[#c17a4e]/20 bg-[#fff7ed] text-[12px] text-[#6e4f33] font-medium flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-[#c17a4e] animate-pulse" />
                        Maximum 10 themes reached. Unselect some to choose others.
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {/* Available themes as pills */}
                      {allThemes.map((theme) => {
                        const isSelected = themes.some((t) => t.id === theme.id);
                        const atLimit = themes.length >= 10;
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            disabled={!isSelected && atLimit}
                            onClick={() => {
                              if (isSelected) {
                                setThemes((prev) => prev.filter((t) => t.id !== theme.id));
                              } else {
                                if (!isPremium && themes.length >= 1) {
                                  toast.error("Non-premium vendors can only select 1 category.");
                                } else if (themes.length < 10) {
                                  setThemes((prev) => [...prev, theme]);
                                } else {
                                  toast.error("Maximum of 10 categories allowed.");
                                }
                              }
                            }}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all duration-300 border shadow-sm ${
                              isSelected
                                ? "bg-purple-600 border-purple-600 text-white shadow-purple-200/50 hover:shadow-purple-200/80 scale-[1.02]"
                                : "bg-white border-black/[0.08] text-black/60 hover:border-purple-300 hover:bg-purple-50/30 hover:text-purple-600"
                            } disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed`}
                          >
                            {isSelected ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            ) : (
                              <div className="h-1.5 w-1.5 rounded-full bg-black/10 transition-all duration-300 group-hover:bg-purple-400" />
                            )}
                            {theme.name}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-black/[0.03]">
                      <button type="button" onClick={saveThemes} disabled={saving} className="h-11 px-8 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-[0_4px_12px_rgba(166,124,82,0.3)] hover:bg-[#8e6a46] hover:shadow-[0_6px_16px_rgba(166,124,82,0.4)] transition-all duration-300 disabled:opacity-60">
                        <span className="inline-flex items-center gap-2">
                          {saving ? <Spinner className="text-white/90" /> : null}
                          <span>{saving ? "Updating Themes…" : "Update Categories"}</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                  <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30">
                    <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2c2c2c]">Social Presence</h2>
                    <div className="mt-1 text-[12px] text-black/45">Connect your social media profiles to help couples find you.</div>
                  </div>
                  <div className="p-6 grid gap-6">
                    <div className="grid gap-4">
                      {socials.map((s, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end p-4 rounded-lg border border-black/[0.04] bg-[#fafafa]/20 group transition-all duration-300 hover:bg-[#fafafa]/40">
                          <div className="w-full sm:w-[180px]">
                            <Field label="Platform">
                              <select
                                className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] outline-none focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
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
                          </div>
                          <div className="flex-1 w-full">
                            <Field label="Profile URL">
                              <input className="h-11 w-full rounded-lg border border-black/[0.08] bg-white px-4 text-[13px] outline-none focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200" value={s.url} onChange={(e) => setSocials((rows) => rows.map((r, i) => (i === idx ? { ...r, url: e.target.value } : r)))} placeholder="https://..." />
                            </Field>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSocials((rows) => rows.filter((_, i) => i !== idx));
                              setSocialPlatformChoices((rows) => rows.filter((_, i) => i !== idx));
                            }}
                            className="h-11 px-4 rounded-lg text-black/40 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                            title="Remove link"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                              <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-between pt-4 border-t border-black/[0.03]">
                      <button
                        type="button"
                        onClick={() => {
                          setSocials((rows) => [...rows, { platform: "facebook", url: "" }]);
                          setSocialPlatformChoices((rows) => [...rows, "facebook"]);
                        }}
                        className="h-11 px-6 rounded-lg border border-[#a67c52]/30 bg-white text-[13px] font-bold text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm"
                      >
                        + Add Social Link
                      </button>
                      <button type="button" onClick={saveSocials} disabled={saving} className="h-11 px-8 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-[0_4px_12px_rgba(166,124,82,0.3)] hover:bg-[#8e6a46] hover:shadow-[0_6px_16px_rgba(166,124,82,0.4)] transition-all duration-300 disabled:opacity-60">
                        <span className="inline-flex items-center gap-2">
                          {saving ? <Spinner className="text-white/90" /> : null}
                          <span>{saving ? "Saving Links…" : "Save Social Links"}</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                  <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30">
                    <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2c2c2c]">Photo Portfolio</h2>
                    <div className="mt-1 text-[12px] text-black/45">Showcase your best work. High-quality images attract more couples.</div>
                  </div>

                  <div className="p-6 grid gap-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {images.filter(img => img.image_url.trim()).map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg border border-black/[0.05] overflow-hidden bg-[#fafafa] group shadow-sm hover:shadow-md transition-all duration-300">
                          <img src={img.image_url} alt={img.caption || `Photo ${idx + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          
                          {img.is_cover && (
                            <div className="absolute top-3 left-3 rounded-lg bg-[#a67c52] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-lg z-10">
                              Cover
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 gap-2">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPhotoIndex(idx);
                                  setPhotoModalOpen(true);
                                }}
                                className="flex-1 h-8 rounded-lg bg-white text-[11px] font-bold text-[#2c2c2c] shadow-sm hover:bg-[#fafafa] transition-colors"
                              >
                                Edit
                              </button>
                              {!img.is_cover && (
                                <button
                                  type="button"
                                  onClick={() => setImages(rows => rows.map((r, i) => ({ ...r, is_cover: i === idx })))}
                                  className="flex-1 h-8 rounded-lg bg-[#a67c52] text-[11px] font-bold text-white shadow-sm hover:bg-[#8e6a46] transition-colors"
                                >
                                  Cover
                                </button>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setImages(rows => ensureSingleCover(rows.filter((_, i) => i !== idx)))}
                            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 text-black/40 hover:text-red-500 hover:bg-white flex items-center justify-center text-[18px] shadow-sm transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-[-4px] group-hover:translate-y-0"
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
                        className="aspect-square rounded-lg border-2 border-dashed border-black/[0.08] bg-[#fafafa]/50 hover:bg-[#a67c52]/5 hover:border-[#a67c52]/40 transition-all duration-300 flex flex-col items-center justify-center gap-2 group"
                      >
                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                          <span className="text-[24px] text-[#a67c52] font-light">+</span>
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-black/40 group-hover:text-[#a67c52] transition-colors">Add Photos</span>
                      </button>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-black/[0.03]">
                      <button type="button" onClick={saveImages} disabled={saving} className="h-11 px-8 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-[0_4px_12px_rgba(166,124,82,0.3)] hover:bg-[#8e6a46] hover:shadow-[0_6px_16px_rgba(166,124,82,0.4)] transition-all duration-300 disabled:opacity-60">
                        <span className="inline-flex items-center gap-2">
                          {saving ? <Spinner className="text-white/90" /> : null}
                          <span>{saving ? "Saving Portfolio…" : "Save Photo Changes"}</span>
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
                      onSave={(photos) => {
                        if (editingPhotoIndex !== null) {
                          const photo = photos[0];
                          setImages(rows => rows.map((r, i) => (i === editingPhotoIndex ? photo : r)));
                        } else {
                          const newPhotosWithOrder = photos.map((p, idx) => ({
                            ...p,
                            display_order: images.length + idx + 1
                          }));
                          setImages(rows => ensureSingleCover([...rows, ...newPhotosWithOrder]));
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


                <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                  <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30">
                    <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2c2c2c]">Video Highlights</h2>
                    <div className="mt-1 text-[12px] text-black/45">Embed videos from YouTube or Vimeo to show your business in action.</div>
                  </div>

                  <div className="p-6 grid gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {videos.map((v, idx) => (
                        <div key={idx} className="relative aspect-video rounded-lg border border-black/[0.05] overflow-hidden bg-[#2c2c2c] group shadow-sm hover:shadow-lg transition-all duration-300">
                          {/* Video Thumbnail Placeholder/Style */}
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a]">
                            <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
                              <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6 ml-1">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                            <div className="text-white text-[13px] font-bold truncate mb-3">{v.title}</div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingVideoIndex(idx);
                                  setVideoModalOpen(true);
                                }}
                                className="flex-1 h-9 rounded-lg bg-white text-[12px] font-bold text-[#2c2c2c] hover:bg-[#fafafa] transition-colors shadow-sm"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setVideos(rows => rows.filter((_, i) => i !== idx))}
                                className="h-9 w-9 rounded-lg bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                  <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingVideoIndex(null);
                          setVideoModalOpen(true);
                        }}
                        className="aspect-video rounded-lg border-2 border-dashed border-black/[0.08] bg-[#fafafa]/50 hover:bg-[#a67c52]/5 hover:border-[#a67c52]/40 transition-all duration-300 flex flex-col items-center justify-center gap-2 group"
                      >
                        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                          <span className="text-[28px] text-[#a67c52] font-light">+</span>
                        </div>
                        <span className="text-[12px] font-bold uppercase tracking-wider text-black/40 group-hover:text-[#a67c52] transition-colors">Add Video</span>
                      </button>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-black/[0.03]">
                      <button type="button" onClick={saveVideos} disabled={saving} className="h-11 px-8 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-[0_4px_12px_rgba(166,124,82,0.3)] hover:bg-[#8e6a46] hover:shadow-[0_6px_16px_rgba(166,124,82,0.4)] transition-all duration-300 disabled:opacity-60">
                        <span className="inline-flex items-center gap-2">
                          {saving ? <Spinner className="text-white/90" /> : null}
                          <span>{saving ? "Saving Videos…" : "Save Video Highlights"}</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </section>

                    <VideoModal
                      open={videoModalOpen}
                      video={editingVideoIndex !== null ? videos[editingVideoIndex] : null}
                      isNew={editingVideoIndex === null}
                      onCancel={() => {
                        setVideoModalOpen(false);
                        setEditingVideoIndex(null);
                      }}
                      onSave={(video) => {
                        if (editingVideoIndex !== null) {
                          setVideos(rows => rows.map((v, i) => (i === editingVideoIndex ? { ...v, ...video } : v)));
                        } else {
                          setVideos(rows => [...rows, { id: Date.now(), ...video }]);
                        }
                        setVideoModalOpen(false);
                        setEditingVideoIndex(null);
                      }}
                      onDelete={editingVideoIndex !== null ? () => {
                        setVideos(rows => rows.filter((_, i) => i !== editingVideoIndex));
                        setVideoModalOpen(false);
                        setEditingVideoIndex(null);
                      } : undefined}
                    />


                <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                  <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30 flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2c2c2c]">Portfolio Albums</h2>
                      <div className="mt-1 text-[12px] text-black/45">Organize your portfolio into curated public albums.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAlbumModalOpen(true)}
                      className="h-10 px-5 rounded-lg border border-[#a67c52]/30 bg-white text-[13px] font-bold text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm"
                    >
                      + Create Album
                    </button>
                  </div>

                  <div className="p-6">
                    {albums.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-black/[0.08] bg-[#fafafa]/50 p-8 text-center">
                        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm mx-auto mb-4">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#a67c52" strokeWidth="2" className="h-6 w-6">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                          </svg>
                        </div>
                        <div className="text-[14px] font-semibold text-black/60 mb-1">No albums yet</div>
                        <div className="text-[12px] text-black/40">Create your first album to organize your photos.</div>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {albums.map((album) => (
                          <div key={album.id} className="rounded-lg border border-black/[0.04] bg-[#fafafa]/30 p-4 flex items-center justify-between transition-all duration-300 hover:bg-white hover:shadow-md hover:border-black/[0.08]">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-lg bg-[#a67c52]/10 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#a67c52" strokeWidth="2" className="h-6 w-6">
                                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-[14px] font-bold text-[#2c2c2c]">{album.title}</div>
                                <div className="text-[11px] font-bold text-black/30 uppercase tracking-wider">{album.photo_count} photo{album.photo_count !== 1 ? "s" : ""}</div>
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
                                className="h-9 px-4 rounded-lg bg-white border border-black/[0.08] text-[12px] font-bold text-[#6e4f33] hover:bg-[#fafafa] transition-all duration-300 shadow-sm"
                              >
                                Manage
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAlbumToDelete({ id: album.id, title: album.title });
                                  setDeleteAlbumModalOpen(true);
                                }}
                                className="h-9 w-9 rounded-lg border border-red-100 bg-white text-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 flex items-center justify-center shadow-sm"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                                  <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                  <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30 flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2c2c2c]">Exclusive Promos</h2>
                      <div className="mt-1 text-[12px] text-black/45">Create attractive deals to convert more inquiries.</div>
                    </div>
                    {isPremium && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPromoId(null);
                          setPromoModalOpen(true);
                        }}
                        className="h-10 px-5 rounded-lg border border-[#a67c52]/30 bg-white text-[13px] font-bold text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm"
                      >
                        + Add Promo
                      </button>
                    )}
                  </div>

                  <div className="relative min-h-[200px]">
                    <div className={isPremium ? "p-6 grid gap-6" : "p-6 grid gap-6 opacity-30 pointer-events-none select-none filter blur-[2px]"}>
                      {promos.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-black/[0.08] bg-[#fafafa]/50 p-12 text-center">
                          <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-md mx-auto mb-6">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#a67c52" strokeWidth="1.5" className="h-8 w-8">
                              <path d="M15 5l-1.79-1.79A2 2 0 0 0 11.79 3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2-2z" />
                            </svg>
                          </div>
                          <div className="text-[16px] font-serif font-semibold text-black/70 mb-2">Grow Your Bookings</div>
                          <div className="text-[13px] text-black/40 max-w-xs mx-auto">Promos are a great way to attract early birds or fill up remaining slots.</div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {promos.map((p) => (
                            <div key={p.id} className="group relative bg-white rounded-lg border border-black/[0.06] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                              {/* Ticket Notch Effect */}
                              <div className="absolute top-1/2 -left-2 h-4 w-4 rounded-full bg-[#fafafa] border border-black/[0.06] z-10" />
                              <div className="absolute top-1/2 -right-2 h-4 w-4 rounded-full bg-[#fafafa] border border-black/[0.06] z-10" />
                              
                              <div className="flex h-full">
                                {/* Promo Image Side */}
                                {p.image_url ? (
                                  <div className="w-32 shrink-0 relative overflow-hidden border-r border-dashed border-black/[0.1]">
                                    <img
                                      src={p.image_url}
                                      alt=""
                                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                      style={{
                                        transformOrigin: `${clampPct(Number(p.image_focus_x ?? 50))}% ${clampPct(Number(p.image_focus_y ?? 50))}%`,
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                                  </div>
                                ) : (
                                  <div className="w-32 shrink-0 bg-[#a67c52]/5 flex items-center justify-center border-r border-dashed border-black/[0.1]">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#a67c52" strokeWidth="1" className="h-10 w-10 opacity-30">
                                      <path d="M20 12V8H4v4m16 0v4H4v-4m16 0h1m-17 0H3" />
                                    </svg>
                                  </div>
                                )}

                                {/* Promo Content Side */}
                                <div className="flex-1 p-5 flex flex-col justify-between">
                                  <div>
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a67c52]">Official Promo</div>
                                      <div className={`h-2 w-2 rounded-full ${p.is_active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-black/10"}`} title={p.is_active ? "Active" : "Inactive"} />
                                    </div>
                                    <h4 className="text-[15px] font-serif font-bold text-[#2c2c2c] leading-snug line-clamp-2 mb-1 group-hover:text-[#a67c52] transition-colors">{p.title}</h4>
                                    {p.summary && <p className="text-[12px] text-black/45 line-clamp-2 leading-relaxed">{p.summary}</p>}
                                  </div>

                                  <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      {typeof p.discount_percentage === "number" ? (
                                        <div className="px-2.5 py-1 rounded-lg bg-[#a67c52] text-white text-[12px] font-black shadow-lg shadow-[#a67c52]/20">
                                          {p.discount_percentage}% OFF
                                        </div>
                                      ) : (
                                        <div className="px-2.5 py-1 rounded-lg bg-[#fafafa] border border-black/[0.08] text-[11px] font-bold text-[#a67c52]">
                                          Special Deal
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingPromoId(p.id);
                                          setPromoModalOpen(true);
                                        }}
                                        className="h-8 w-8 rounded-lg bg-white border border-black/[0.08] flex items-center justify-center text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm"
                                        title="Edit Promo"
                                      >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                      </button>
                                      {p.is_active && <PromoQRCode promoId={p.id} promoTitle={p.title} />}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {!isPremium ? (
                      <div className="absolute inset-0 flex items-center justify-center p-6 bg-white/40 backdrop-blur-[1px] z-20">
                        <div className="rounded-lg border border-black/[0.08] bg-white p-8 text-center shadow-2xl max-w-sm transform hover:scale-[1.02] transition-transform duration-500">
                          <div className="h-16 w-16 rounded-full bg-[#a67c52]/10 flex items-center justify-center mx-auto mb-6">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#a67c52" strokeWidth="1.5" className="h-8 w-8">
                              <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" />
                            </svg>
                          </div>
                          <h3 className="font-serif text-[20px] font-bold text-[#2c2c2c] mb-2">Premium Feature</h3>
                          <p className="text-[14px] text-black/45 mb-6 leading-relaxed">Boost your conversion rate by offering exclusive deals to couples. Upgrade to Premium to unlock Promos.</p>
                          <button className="w-full h-12 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-lg shadow-[#a67c52]/20 hover:bg-[#8e6a46] transition-all duration-300">
                            Upgrade to Premium
                          </button>
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
            <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
              <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2c2c2c]">Lead Inquiries</h2>
                  <div className="mt-1 text-[12px] text-black/45">Messages from couples interested in your services.</div>
                </div>
                <button
                  type="button"
                  onClick={refreshInquiries}
                  className="h-10 px-5 rounded-lg border border-black/[0.08] bg-white text-[13px] font-bold text-black/60 hover:bg-[#fafafa] hover:text-[#a67c52] transition-all duration-300 shadow-sm"
                >
                  <span className="inline-flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
                    </svg>
                    Refresh
                  </span>
                </button>
              </div>

              <div className="p-6">
                {inquiries.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-black/[0.08] bg-[#fafafa]/50 p-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-md mx-auto mb-6">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#a67c52" strokeWidth="1.5" className="h-8 w-8">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <div className="text-[16px] font-serif font-semibold text-black/70 mb-2">No inquiries yet</div>
                    <div className="text-[13px] text-black/40 max-w-xs mx-auto">When couples contact you, their messages will appear here. Get ready to shine!</div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {inquiries.map((inq) => (
                      <div
                        key={inq.id}
                        className={`group rounded-lg border p-5 transition-all duration-300 ${
                          inq.status === "new" 
                            ? "border-[#a67c52]/30 bg-[#a67c52]/5 shadow-sm hover:shadow-md" 
                            : "border-black/[0.05] bg-white hover:border-black/[0.1] hover:shadow-md"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-3 mb-3">
                              <span className="text-[16px] font-serif font-bold text-[#2c2c2c]">
                                {inq.name ?? "Anonymous Couple"}
                              </span>
                              {inq.status === "new" && (
                                <span className="inline-flex items-center rounded-lg bg-[#a67c52] px-3 py-0.5 text-[9px] font-black uppercase tracking-widest text-white shadow-sm">
                                  New Lead
                                </span>
                              )}
                              <span className="text-[11px] font-bold text-black/30 uppercase tracking-widest ml-auto sm:ml-0">
                                {new Date(inq.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            
                            <div className="grid gap-2 sm:flex sm:items-center sm:gap-6 mb-4">
                              {inq.email && (
                                <a
                                  href={`mailto:${inq.email}`}
                                  className="flex items-center gap-2 text-[12px] font-bold text-[#a67c52] hover:text-[#8e6a46] transition-colors"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                  </svg>
                                  {inq.email}
                                </a>
                              )}
                              {inq.phone && (
                                <a
                                  href={`tel:${inq.phone.replace(/\s/g, "")}`}
                                  className="flex items-center gap-2 text-[12px] font-bold text-[#a67c52] hover:text-[#8e6a46] transition-colors"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                  </svg>
                                  {inq.phone}
                                </a>
                              )}
                            </div>

                            {inq.wedding_date && (
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/[0.03] text-[11px] font-bold text-black/50 mb-4">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                  <line x1="16" y1="2" x2="16" y2="6" />
                                  <line x1="8" y1="2" x2="8" y2="6" />
                                  <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                Wedding: {new Date(inq.wedding_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                              </div>
                            )}
                            
                            <div className="bg-white/50 rounded-lg p-4 border border-black/[0.03] text-[14px] text-black/70 whitespace-pre-line leading-relaxed italic group-hover:bg-white transition-colors duration-300">
                              "{inq.message}"
                            </div>
                          </div>
                          
                          <div className="w-full sm:w-auto sm:shrink-0 flex sm:flex-col gap-2">
                            <select
                              value={String(inq.status ?? "new")}
                              disabled={saving}
                              onChange={(e) => updateInquiryStatus(inq.id, e.target.value)}
                              className="flex-1 h-11 rounded-lg border border-black/[0.08] bg-white px-4 text-[12px] font-bold text-black/70 outline-none focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-300 disabled:opacity-60 cursor-pointer shadow-sm hover:border-black/[0.15]"
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
        </main>

        {/* Create Album Modal */}
        {albumModalOpen ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setAlbumModalOpen(false)} />
            <div className="relative w-full max-w-sm rounded-lg bg-white shadow-2xl overflow-hidden transform transition-all">
              <div className="px-8 py-6 border-b border-black/[0.04] bg-[#fafafa]/30">
                <h2 className="font-serif text-[18px] font-bold text-[#2c2c2c]">Create New Album</h2>
                <p className="mt-1 text-[12px] text-black/45">
                  Give your collection a meaningful title.
                </p>
              </div>
              <div className="px-8 py-6">
                <Field label="Album Title">
                  <input
                    type="text"
                    className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                    placeholder="e.g. Dream Weddings 2024"
                    autoFocus
                  />
                </Field>
              </div>
              <div className="px-8 py-6 border-t border-black/[0.04] flex items-center justify-end gap-3 bg-[#fafafa]/10">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setAlbumModalOpen(false)}
                  className="h-11 px-6 rounded-lg text-[13px] font-bold text-black/40 hover:text-black/60 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving || !albumTitle.trim()}
                  onClick={createAlbum}
                  className="h-11 px-8 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-lg shadow-[#a67c52]/20 hover:bg-[#8e6a46] hover:shadow-xl transition-all duration-300 disabled:opacity-60"
                >
                  {saving ? "Creating..." : "Create Album"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Album Editor Modal */}
        {albumEditorOpen && selectedAlbum ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setAlbumEditorOpen(false)} />
            <div className="relative w-full max-w-2xl max-h-[90vh] rounded-lg bg-white shadow-2xl overflow-hidden flex flex-col transform transition-all">
              <div className="px-8 py-6 border-b border-black/[0.04] bg-[#fafafa]/30 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-[20px] font-bold text-[#2c2c2c]">{selectedAlbum.title}</h2>
                  <p className="mt-1 text-[12px] text-black/45">
                    Select the masterpieces for this collection.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAlbumEditorOpen(false)}
                  className="h-10 w-10 rounded-full bg-white border border-black/[0.08] text-black/40 hover:text-red-500 hover:border-red-100 transition-all duration-300 flex items-center justify-center shadow-sm"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid gap-8">
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a67c52] mb-4">Available Masterpieces</h3>
                    <div className="grid gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {images.filter(img => img.image_url.trim()).map((img, idx) => {
                        const isInAlbum = albumPhotos.some(ap => ap.image_url === img.image_url);
                        return (
                          <label key={idx} className={`flex items-center gap-4 p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                            isInAlbum 
                              ? "bg-[#a67c52]/5 border-[#a67c52]/20 shadow-sm" 
                              : "bg-white border-black/[0.04] hover:border-black/[0.1] hover:bg-[#fafafa]"
                          }`}>
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={isInAlbum}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    saveAlbumPhotos(selectedAlbum.id, [...albumPhotos.map(ap => ap.image_url), img.image_url]);
                                  } else {
                                    const newPhotos = albumPhotos.filter(ap => ap.image_url !== img.image_url);
                                    saveAlbumPhotos(selectedAlbum.id, newPhotos.map(ap => ap.image_url));
                                  }
                                }}
                                className="h-5 w-5 rounded-md border-black/20 text-[#a67c52] focus:ring-[#a67c52]/20 transition-all"
                              />
                            </div>
                            <div className="h-14 w-14 rounded-lg border border-black/[0.05] overflow-hidden flex-shrink-0 shadow-sm">
                              <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-[13px] font-bold truncate transition-colors ${isInAlbum ? "text-[#a67c52]" : "text-[#2c2c2c]"}`}>
                                {img.caption || "Untitled Work"}
                              </div>
                              <div className="text-[11px] text-black/30 truncate">Source: {img.image_url.split('/').pop()}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a67c52]">Album Layout ({albumPhotos.length})</h3>
                    </div>
                    {albumPhotos.length === 0 ? (
                      <div className="rounded-lg border-2 border-dashed border-black/[0.04] bg-[#fafafa]/30 p-8 text-center">
                        <p className="text-[13px] text-black/40 italic">The collection is currently empty. Select photos from above to curate your album.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                        {albumPhotos.map((photo) => (
                          <div key={photo.id} className="relative group aspect-square">
                            <div className="h-full w-full rounded-lg border border-black/[0.05] bg-white overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                              <img src={photo.image_url} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newPhotos = albumPhotos.filter(ap => ap.image_url !== photo.image_url);
                                saveAlbumPhotos(selectedAlbum.id, newPhotos.map(ap => ap.image_url));
                              }}
                              className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-red-500 text-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="px-8 py-6 border-t border-black/[0.04] bg-[#fafafa]/20 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setAlbumEditorOpen(false)}
                  className="h-11 px-10 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-lg shadow-[#a67c52]/20 hover:bg-[#8e6a46] hover:shadow-xl transition-all duration-300"
                >
                  Confirm Curation
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Delete Album Modal */}
        {deleteAlbumModalOpen && albumToDelete ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteAlbumModalOpen(false)} />
            <div className="relative w-full max-w-sm rounded-lg bg-white shadow-2xl overflow-hidden transform transition-all">
              <div className="px-8 py-6 border-b border-black/[0.04] bg-red-50/30">
                <h2 className="text-[18px] font-bold text-red-600">Delete Collection</h2>
                <p className="mt-1 text-[12px] text-red-600/60 leading-relaxed">
                  This will permanently remove the album. Photos inside will not be deleted from your main portfolio.
                </p>
              </div>
              <div className="px-8 py-6">
                <div className="p-4 rounded-lg border border-black/[0.04] bg-[#fafafa]/50">
                  <div className="text-[13px] font-bold text-[#2c2c2c]">{albumToDelete.title}</div>
                  <div className="mt-1 text-[11px] font-bold text-black/30 uppercase tracking-widest">Permanent Deletion</div>
                </div>
              </div>
              <div className="px-8 py-6 border-t border-black/[0.04] flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setDeleteAlbumModalOpen(false)}
                  className="h-11 px-6 rounded-lg text-[13px] font-bold text-black/40 hover:text-black/60 transition-all duration-300"
                >
                  Keep Album
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => deleteAlbum(albumToDelete.id)}
                  className="h-11 px-8 rounded-lg bg-red-500 text-white text-[14px] font-bold shadow-lg shadow-red-200/50 hover:bg-red-600 hover:shadow-xl transition-all duration-300 disabled:opacity-60"
                >
                  {saving ? "Deleting..." : "Delete Forever"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Live Preview Modal */}
        {isPreviewOpen && vendor ? (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop with strong blur for focus */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsPreviewOpen(false)} />
            
            {/* Main Preview Container */}
            <div className="relative w-full h-full max-w-6xl md:h-[90vh] md:w-[95%] bg-white md:rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden transform transition-all duration-500">
              {/* Premium Top Bar */}
              <div className="sticky top-0 px-8 py-6 border-b border-black/[0.04] shrink-0 flex items-center justify-between bg-white/80 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#a67c52] flex items-center justify-center text-white shadow-lg shadow-[#a67c52]/20">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-serif text-[20px] font-bold text-[#2c2c2c] leading-tight">Public Profile Preview</h2>
                    <p className="text-[12px] font-bold text-[#a67c52] uppercase tracking-widest">Unsaved Draft Appearance</p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="h-12 w-12 rounded-full bg-black/5 flex items-center justify-center text-black/40 hover:bg-black/10 hover:text-black/60 transition-all duration-300"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-6 w-6">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Scrolling Preview Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar">
                <div className="bg-[#fafafa]/30">
                  <VendorProfileUI
                  vendor={{
                    id: vendor.id,
                    business_name: form.business_name || vendor.business_name,
                    slug: vendor.slug,
                    logo_url: form.logo_url || vendor.logo_url,
                    description: form.description || vendor.description,
                    location_text: form.location_text || vendor.location_text,
                    city: form.city || vendor.city,
                    address: form.address || vendor.address,
                    website_url: form.website_url || vendor.website_url,
                    contact_email: vendor.contact_email,
                    contact_phone: form.contact_phone || vendor.contact_phone,
                    average_rating: vendor.average_rating,
                    review_count: vendor.review_count,
                    save_count: 0,
                    document_verified: vendor.verified_status,
                    user_id: vendor.user_id,
                    updated_at: new Date().toISOString(),
                    plan_name: String((Array.isArray(vendor.plan) ? vendor.plan?.[0]?.name : vendor.plan?.name) ?? "").trim().toLowerCase(),
                  }}
                  categories={[]}
                  affiliations={[]}
                  themes={themes}
                  images={[
                    ...images.map(img => ({ ...img, media_type: 'image' })),
                    ...videos.map(vid => ({
                      id: vid.id,
                      image_url: vid.video_url,
                      caption: vid.title,
                      is_cover: false,
                      display_order: vid.display_order,
                      media_type: 'video'
                    }))
                  ].sort((a, b) => {
                    if (a.is_cover) return -1;
                    if (b.is_cover) return 1;
                    return (a.display_order ?? 0) - (b.display_order ?? 0);
                  }) as any}
                  socials={socials.filter((s) => s.url.trim().length > 0) as any}
                  reviews={inquiries as any}
                  promos={promos}
                />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
    </>
  );
}

