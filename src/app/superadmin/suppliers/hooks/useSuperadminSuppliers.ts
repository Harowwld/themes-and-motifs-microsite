import { useEffect, useState, useMemo } from "react";
import { toast } from "@/lib/toast";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export type Plan = { id: number; name: string };

export type Vendor = {
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
  document_verified?: string | null;
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
  year_established?: string | null;
};

export type VendorImage = {
  id?: number;
  image_url: string;
  caption: string;
  is_cover: boolean;
  display_order: number;
  focus_x?: number | null;
  focus_y?: number | null;
  zoom?: number | null;
  theme_id?: number | null;
};

export type VendorVideo = {
  id?: number;
  video_url: string;
  title: string | null;
  display_order: number;
};

export type VendorSocial = {
  id?: number;
  platform: string;
  url: string;
};

export type Affiliation = {
  id: number;
  name: string;
  slug: string;
};

export type VendorAffiliation = {
  vendor_id: number;
  affiliation_id: number;
  affiliation: Affiliation | Affiliation[] | null;
};

export type Theme = {
  id: number;
  name: string;
  slug: string;
};

export type VendorTheme = {
  id: number;
  theme: Theme | Theme[] | null;
};

export type Promo = {
  id: number;
  vendor_id: number;
  title: string;
  summary: string | null;
  terms: string | null;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  image_url: string | null;
  discount_percentage: number | null;
  image_focus_x: number | null;
  image_focus_y: number | null;
  image_zoom: number | null;
  updated_at: string;
};

export type VerificationDocument = {
  id: number;
  doc_type: string;
  file_url: string;
  file_name: string | null;
  status: string;
  uploaded_at: string;
  reviewed_at: string | null;
  notes: string | null;
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
    throw new Error((json as { error?: string })?.error ?? "Request failed");
  }
  return json as T;
}

export function useSuperadminSuppliers() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [query, setQuery] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [regions, setRegions] = useState<{id: number, name: string}[]>([]);
  const [cities, setCities] = useState<{id: number, name: string, region_id: number}[]>([]);

  // Edit modal state
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

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
    document_verified: "",
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
    year_established: "",
  });
  const [editSubscription, setEditSubscription] = useState<{ 
    id: number; 
    status: string; 
    expiry_date: string | null; 
    verification_doc_url: string | null;
    sec_doc_url?: string | null;
    dti_doc_url?: string | null;
    tin?: string | null;
  } | null>(null);
  const [editImages, setEditImages] = useState<VendorImage[]>([]);
  const [editVideos, setEditVideos] = useState<VendorVideo[]>([]);
  const [editSocials, setEditSocials] = useState<VendorSocial[]>([]);
  const [editAffiliations, setEditAffiliations] = useState<Affiliation[]>([]);
  const [allAffiliations, setAllAffiliations] = useState<Affiliation[]>([]);
  const [affiliationInput, setAffiliationInput] = useState("");
  const [editThemes, setEditThemes] = useState<Theme[]>([]);
  const [allThemes, setAllThemes] = useState<Theme[]>([]);
  const [verificationDocuments, setVerificationDocuments] = useState<VerificationDocument[]>([]);
  const [editPromos, setEditPromos] = useState<Promo[]>([]);
  const [promoForm, setPromoForm] = useState<Partial<Promo>>({
    title: "",
    summary: "",
    terms: "",
    valid_from: "",
    valid_to: "",
    discount_percentage: null,
    image_url: "",
    is_active: true,
  });
  const [editingPromoId, setEditingPromoId] = useState<number | null>(null);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<number | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [croppingImageIdx, setCroppingImageIdx] = useState<number | null>(null);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState("");
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [editingPhotoIndex, setEditingPhotoIndex] = useState<number | null>(null);

  async function refresh(searchQuery?: string) {
    setLoading(true);
    try {
      const q = searchQuery !== undefined ? searchQuery.trim() : query.trim();
      const url = q ? `/api/admin/suppliers?limit=100&offset=0&q=${encodeURIComponent(q)}` : "/api/admin/suppliers?limit=100&offset=0";
      const res = await apiFetch<{ vendors: Vendor[]; plans: Plan[] }>(url);
      setVendors(res.vendors ?? []);
      setPlans(res.plans ?? []);
      setHasMore((res.vendors ?? []).length === 100);

      if (regions.length === 0) {
        Promise.all([
          supabase.from("regions").select("id,name").is("parent_id", null).order("name", { ascending: true }).limit(200),
          supabase.from("cities").select("id,name,region_id").order("name", { ascending: true }).range(0, 999),
          supabase.from("cities").select("id,name,region_id").order("name", { ascending: true }).range(1000, 1999)
        ]).then(([regionsRes, cities1Res, cities2Res]) => {
          setRegions(regionsRes.data ?? []);
          setCities([...(cities1Res.data ?? []), ...(cities2Res.data ?? [])]);
        });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const q = query.trim();
      const currentOffset = vendors.length;
      const url = q 
        ? `/api/admin/suppliers?limit=100&offset=${currentOffset}&q=${encodeURIComponent(q)}` 
        : `/api/admin/suppliers?limit=100&offset=${currentOffset}`;
      
      const res = await apiFetch<{ vendors: Vendor[] }>(url);
      const newVendors = res.vendors ?? [];
      
      setVendors((prev) => {
        const existingIds = new Set(prev.map((v) => v.id));
        const filteredNew = newVendors.filter((v) => !existingIds.has(v.id));
        return [...prev, ...filteredNew];
      });
      
      setHasMore(newVendors.length === 100);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load more vendors.");
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    refresh(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function patchVendor(id: number, patch: Partial<Pick<Vendor, "is_active" | "is_featured" | "plan_id">>) {
    setSavingId(id);
    try {
      const res = await apiFetch<{ vendor: Vendor }>("/api/admin/suppliers", {
        method: "PATCH",
        body: JSON.stringify({ id, ...patch }),
      });
      const next = res.vendor;
      setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...next } : v)));
      toast.success("Vendor updated successfully.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update vendor.");
    } finally {
      setSavingId(null);
    }
  }

  async function openEditModal(vendor: Vendor) {
    setEditingVendor(vendor);
    setEditLoading(true);
    setEditModalOpen(true);

    try {
      const [res, promosRes] = await Promise.all([
        apiFetch<{
          vendor: Vendor;
          images: VendorImage[];
          videos: VendorVideo[];
          socials: VendorSocial[];
          affiliations: VendorAffiliation[];
          allAffiliations: Affiliation[];
          themes: VendorTheme[];
          allThemes: Theme[];
          verificationDocuments: VerificationDocument[];
          subscription: { 
            id: number; 
            status: string; 
            expiry_date: string | null; 
            verification_doc_url: string | null;
            sec_doc_url?: string | null;
            dti_doc_url?: string | null;
            tin?: string | null;
          } | null;
        }>(`/api/admin/suppliers/${vendor.id}`),
        apiFetch<{ promos: Promo[] }>(`/api/admin/suppliers/${vendor.id}/promos`),
      ]);

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

        document_verified: v.document_verified || "verification_in_progress",
        contact_person_1_name: v.contact_person_1_name ?? "",
        contact_person_1_position: v.contact_person_1_position ?? "",
        contact_person_2_name: v.contact_person_2_name ?? "",
        contact_person_2_position: v.contact_person_2_position ?? "",
        admin_email_1: v.admin_email_1 ?? "",
        admin_email_2: v.admin_email_2 ?? "",
        admin_email_3: v.admin_email_3 ?? "",
        admin_phone_1: v.admin_phone_1 ?? "",
        admin_phone_2: v.admin_phone_2 ?? "",
        admin_phone_3: v.admin_phone_3 ?? "",
        year_established: v.year_established ? v.year_established.substring(0, 4) : "",
      });

      setEditSubscription(res.subscription ?? null);

      const normalizedImgs = (res.images ?? []).map((img: { id?: number; image_url: string; caption?: string | null; is_cover?: boolean | null; display_order?: number | null; focus_x?: number | null; focus_y?: number | null; zoom?: number | null }, idx: number) => ({
        id: img.id,
        image_url: img.image_url,
        caption: img.caption ?? "",
        is_cover: Boolean(img.is_cover),
        display_order: img.display_order ?? idx + 1,
        focus_x: img.focus_x ?? 50,
        focus_y: img.focus_y ?? 50,
        zoom: img.zoom ?? 1,
        theme_id: (img as any).theme_id ?? null,
      }));
      setEditImages(
        normalizedImgs.length > 0
          ? normalizedImgs
          : [{ image_url: "", caption: "", is_cover: true, display_order: 1, focus_x: 50, focus_y: 50, zoom: 1, theme_id: null }]
      );

      const normalizedVideos = (res.videos ?? []).map((v, idx) => ({
        id: v.id,
        video_url: v.video_url,
        title: v.title ?? "",
        display_order: v.display_order ?? idx + 1,
      }));
      setEditVideos(
        normalizedVideos.length > 0
          ? normalizedVideos
          : [{ video_url: "", title: "", display_order: 1 }]
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

      const normalizedAffiliations = (res.affiliations ?? [])
        .map((va) => {
          const aff = Array.isArray(va.affiliation) ? va.affiliation[0] : va.affiliation;
          return aff ? { id: aff.id, name: aff.name, slug: aff.slug } : null;
        })
        .filter((a): a is Affiliation => a !== null);
      setEditAffiliations(normalizedAffiliations);
      setAllAffiliations(res.allAffiliations ?? []);
      setAffiliationInput("");

      const normalizedThemes = (res.themes ?? [])
        .map((vt) => {
          const t = Array.isArray(vt.theme) ? vt.theme[0] : vt.theme;
          return t ? { id: t.id, name: t.name, slug: t.slug } : null;
        })
        .filter((t): t is Theme => t !== null);
      setEditThemes(normalizedThemes);
      setAllThemes(res.allThemes ?? []);

      setVerificationDocuments(res.verificationDocuments ?? []);
      setEditPromos(promosRes.promos ?? []);
      resetPromoForm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load vendor details.");
    } finally {
      setEditLoading(false);
    }
  }

  function closeEditModal() {
    setEditModalOpen(false);
    setEditingVendor(null);
  }

  async function saveVendorProfile(silent = false): Promise<boolean> {
    if (!editingVendor) return false;
    setEditLoading(true);

    if (!editForm.year_established || !editForm.year_established.trim()) {
      toast.error("Year established is required.");
      setEditLoading(false);
      return false;
    }
    const yearNum = Number(editForm.year_established.trim());
    if (!Number.isInteger(yearNum) || yearNum < 1800 || yearNum > 2100) {
      toast.error("Please enter a valid 4-digit year (e.g. 2015).");
      setEditLoading(false);
      return false;
    }

    try {
      const res = await apiFetch<{ vendor: Vendor }>(`/api/admin/suppliers/${editingVendor.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          business_name: editForm.business_name,
          slug: editForm.slug,
          description: editForm.description,
          location_text: editForm.location_text || null,
          city: editForm.city || null,
          address: editForm.address || null,
          contact_email: editForm.contact_email || null,
          contact_phone: editForm.contact_phone || null,
          website_url: editForm.website_url || null,
          logo_url: editForm.logo_url || null,

          document_verified: editForm.document_verified || "verification_in_progress",
          contact_person_1_name: editForm.contact_person_1_name || null,
          contact_person_1_position: editForm.contact_person_1_position || null,
          contact_person_2_name: editForm.contact_person_2_name || null,
          contact_person_2_position: editForm.contact_person_2_position || null,
          admin_email_1: editForm.admin_email_1 || null,
          admin_email_2: editForm.admin_email_2 || null,
          admin_email_3: editForm.admin_email_3 || null,
          admin_phone_1: editForm.admin_phone_1 || null,
          admin_phone_2: editForm.admin_phone_2 || null,
          admin_phone_3: editForm.admin_phone_3 || null,
          year_established: String(yearNum),
        }),
      });

      setVendors((prev) =>
        prev.map((v) => (v.id === editingVendor.id ? { ...v, ...res.vendor } : v))
      );
      if (!silent) toast.success("Profile saved successfully.");
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save vendor profile.");
      return false;
    } finally {
      setEditLoading(false);
    }
  }

  async function saveVendorImages(silent = false): Promise<boolean> {
    if (!editingVendor) return false;
    setEditLoading(true);

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
          theme_id: i.theme_id ?? null,
        }));

      const hasCover = cleaned.some((i) => i.is_cover);
      if (cleaned.length > 0 && !hasCover) {
        cleaned[0].is_cover = true;
      }

      await apiFetch<{ images: VendorImage[] }>(`/api/admin/suppliers/${editingVendor.id}/images`, {
        method: "PUT",
        body: JSON.stringify({ images: cleaned }),
      });
      if (!silent) toast.success("Images saved successfully.");
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save images.");
      return false;
    } finally {
      setEditLoading(false);
    }
  }

  async function saveVendorVideos(silent = false): Promise<boolean> {
    if (!editingVendor) return false;
    setEditLoading(true);

    try {
      const cleaned = editVideos
        .filter((v) => v.video_url.trim())
        .map((v, idx) => ({
          video_url: v.video_url.trim(),
          title: v.title?.trim() || null,
          display_order: idx + 1,
        }));

      await apiFetch<{ videos: VendorVideo[] }>(`/api/admin/suppliers/${editingVendor.id}/videos`, {
        method: "PUT",
        body: JSON.stringify({ videos: cleaned }),
      });
      if (!silent) toast.success("Videos saved successfully.");
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save videos.");
      return false;
    } finally {
      setEditLoading(false);
    }
  }

  async function saveSubscriptionDate(dateStr: string | null, tinStr?: string | null) {
    if (!editingVendor) return;
    try {
      const payload: any = {};
      if (dateStr !== undefined) payload.expiry_date = dateStr || null;
      if (tinStr !== undefined) payload.tin = tinStr || null;

      const res = await apiFetch<{
        subscription: {
          id: number;
          status: string;
          expiry_date: string | null;
          verification_doc_url: string | null;
          sec_doc_url?: string | null;
          dti_doc_url?: string | null;
          tin?: string | null;
        } | null;
      }>(`/api/admin/suppliers/${editingVendor.id}/subscription`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setEditSubscription(res.subscription);
      toast.success("Verification details saved.");
    } catch (e) {
      toast.error((e as { message?: string })?.message ?? "Failed to save verification details.");
    }
  }

  async function saveVendorSocials(silent = false): Promise<boolean> {
    if (!editingVendor) return false;
    setEditLoading(true);

    try {
      const cleaned = editSocials.filter((s) => s.platform.trim() && s.url.trim());

      await apiFetch<{ socials: VendorSocial[] }>(`/api/admin/suppliers/${editingVendor.id}/socials`, {
        method: "PUT",
        body: JSON.stringify({ socials: cleaned }),
      });
      if (!silent) toast.success("Social links saved successfully.");
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save social links.");
      return false;
    } finally {
      setEditLoading(false);
    }
  }

  async function saveVendorAffiliations(silent = false): Promise<boolean> {
    if (!editingVendor) return false;
    setEditLoading(true);

    try {
      const res = await apiFetch<{
        affiliations: VendorAffiliation[];
        allAffiliations: Affiliation[];
        created: Affiliation[];
      }>(`/api/admin/suppliers/${editingVendor.id}/affiliations`, {
        method: "PUT",
        body: JSON.stringify({ affiliations: editAffiliations }),
      });

      const normalizedAffiliations = (res.affiliations ?? [])
        .map((va) => {
          const aff = Array.isArray(va.affiliation) ? va.affiliation[0] : va.affiliation;
          return aff ? { id: aff.id, name: aff.name, slug: aff.slug } : null;
        })
        .filter((a): a is Affiliation => a !== null);
      setEditAffiliations(normalizedAffiliations);
      setAllAffiliations(res.allAffiliations ?? []);
      if (!silent) toast.success("Affiliations saved successfully.");
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save affiliations.");
      return false;
    } finally {
      setEditLoading(false);
    }
  }

  async function saveVendorThemes(silent = false): Promise<boolean> {
    if (!editingVendor) return false;
    setEditLoading(true);

    try {
      const res = await apiFetch<{
        themes: VendorTheme[];
        allThemes: Theme[];
        created: Theme[];
      }>(`/api/admin/suppliers/${editingVendor.id}/themes`, {
        method: "PUT",
        body: JSON.stringify({ themes: editThemes.map((t) => ({ id: t.id, name: t.name, slug: t.slug })) }),
      });

      const normalizedThemes = (res.themes ?? [])
        .map((vt) => {
          const t = Array.isArray(vt.theme) ? vt.theme[0] : vt.theme;
          return t ? { id: t.id, name: t.name, slug: t.slug } : null;
        })
        .filter((t): t is Theme => t !== null);
      setEditThemes(normalizedThemes);
      setAllThemes(res.allThemes ?? []);
      if (!silent) toast.success("Themes saved successfully.");
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save themes.");
      return false;
    } finally {
      setEditLoading(false);
    }
  }

  async function saveAll(closeAfter = false): Promise<boolean> {
    if (!editingVendor) return false;
    setEditLoading(true);

    try {
      const profileOk = await saveVendorProfile(true);
      if (!profileOk) return false;

      const imagesOk = await saveVendorImages(true);
      if (!imagesOk) return false;

      const videosOk = await saveVendorVideos(true);
      if (!videosOk) return false;

      const socialsOk = await saveVendorSocials(true);
      if (!socialsOk) return false;

      const affiliationsOk = await saveVendorAffiliations(true);
      if (!affiliationsOk) return false;

      const themesOk = await saveVendorThemes(true);
      if (!themesOk) return false;

      toast.success("Vendor saved successfully.");
      if (closeAfter) {
        closeEditModal();
      }
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save vendor.");
      return false;
    } finally {
      setEditLoading(false);
    }
  }

  async function saveAllAndClose() {
    await saveAll(true);
  }

  function resetPromoForm() {
    setPromoForm({
      title: "",
      summary: "",
      terms: "",
      valid_from: "",
      valid_to: "",
      discount_percentage: null,
      image_url: "",
      is_active: true,
    });
    setEditingPromoId(null);
    setShowPromoForm(false);
  }

  function startEditPromo(promo: Promo) {
    setEditingPromoId(promo.id);
    setPromoForm({
      title: promo.title,
      summary: promo.summary ?? "",
      terms: promo.terms ?? "",
      valid_from: promo.valid_from ?? "",
      valid_to: promo.valid_to ?? "",
      discount_percentage: promo.discount_percentage,
      image_url: promo.image_url ?? "",
      is_active: promo.is_active ?? true,
    });
    setShowPromoForm(true);
  }

  async function savePromo() {
    if (!editingVendor) return;
    if (!promoForm.title?.trim()) {
      toast.error("Promo title is required.");
      return;
    }

    setEditLoading(true);

    try {
      if (editingPromoId) {
        const res = await apiFetch<{ promo: Promo }>(`/api/admin/suppliers/${editingVendor.id}/promos`, {
          method: "PATCH",
          body: JSON.stringify({
            promo_id: editingPromoId,
            title: promoForm.title.trim(),
            summary: promoForm.summary?.trim() || null,
            terms: promoForm.terms?.trim() || null,
            valid_from: promoForm.valid_from || null,
            valid_to: promoForm.valid_to || null,
            discount_percentage: promoForm.discount_percentage,
            image_url: promoForm.image_url?.trim() || null,
            is_active: promoForm.is_active,
          }),
        });
        setEditPromos((prev) => prev.map((p) => (p.id === editingPromoId ? res.promo : p)));
      } else {
        const res = await apiFetch<{ promo: Promo }>(`/api/admin/suppliers/${editingVendor.id}/promos`, {
          method: "POST",
          body: JSON.stringify({
            title: promoForm.title.trim(),
            summary: promoForm.summary?.trim() || null,
            terms: promoForm.terms?.trim() || null,
            valid_from: promoForm.valid_from || null,
            valid_to: promoForm.valid_to || null,
            discount_percentage: promoForm.discount_percentage,
            image_url: promoForm.image_url?.trim() || null,
            is_active: promoForm.is_active,
          }),
        });
        setEditPromos((prev) => [res.promo, ...prev]);
      }
      resetPromoForm();
      toast.success("Promo saved successfully.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save promo.");
    } finally {
      setEditLoading(false);
    }
  }

  async function confirmDeletePromo() {
    if (!editingVendor || !promoToDelete) return;

    setEditLoading(true);

    try {
      await apiFetch<{ ok: boolean }>(`/api/admin/suppliers/${editingVendor.id}/promos?promo_id=${promoToDelete}`, {
        method: "DELETE",
      });
      setEditPromos((prev) => prev.filter((p) => p.id !== promoToDelete));
      if (editingPromoId === promoToDelete) {
        resetPromoForm();
      }
      setPromoToDelete(null);
      toast.success("Promo deleted successfully.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete promo.");
    } finally {
      setEditLoading(false);
    }
  }

  async function togglePromoFeatured(promo: Promo) {
    if (!editingVendor) return;
    setEditLoading(true);

    try {
      const res = await apiFetch<{ promo: Promo }>(`/api/admin/suppliers/${editingVendor.id}/promos`, {
        method: "PATCH",
        body: JSON.stringify({
          promo_id: promo.id,
          is_featured: !promo.is_featured,
        }),
      });
      setEditPromos((prev) => prev.map((p) => (p.id === promo.id ? res.promo : p)));
      toast.success("Promo updated successfully.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update promo.");
    } finally {
      setEditLoading(false);
    }
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

  return {
    loading,
    savingId,
    vendors,
    plans,
    query,
    setQuery,
    refresh,
    loadingMore,
    hasMore,
    loadMore,
    patchVendor,
    editingVendor,
    editModalOpen,
    editLoading,
    editForm,
    setEditForm,
    editSubscription,
    editImages,
    setEditImages,
    editVideos,
    setEditVideos,
    editSocials,
    setEditSocials,
    editAffiliations,
    setEditAffiliations,
    allAffiliations,
    affiliationInput,
    setAffiliationInput,
    editThemes,
    setEditThemes,
    allThemes,
    regions,
    cities,
    verificationDocuments,
    editPromos,
    promoForm,
    setPromoForm,
    editingPromoId,
    showPromoForm,
    setShowPromoForm,
    promoToDelete,
    setPromoToDelete,
    cropModalOpen,
    setCropModalOpen,
    croppingImageIdx,
    setCroppingImageIdx,
    logoModalOpen,
    setLogoModalOpen,
    logoUrlInput,
    setLogoUrlInput,
    photoModalOpen,
    setPhotoModalOpen,
    editingPhotoIndex,
    setEditingPhotoIndex,

    openEditModal,
    closeEditModal,
    saveVendorProfile,
    saveVendorImages,
    saveVendorVideos,
    saveSubscriptionDate,
    saveVendorSocials,
    saveVendorAffiliations,
    saveVendorThemes,
    saveAll,
    saveAllAndClose,
    resetPromoForm,
    startEditPromo,
    savePromo,
    confirmDeletePromo,
    togglePromoFeatured,
    handleCropSave,
  };
}
