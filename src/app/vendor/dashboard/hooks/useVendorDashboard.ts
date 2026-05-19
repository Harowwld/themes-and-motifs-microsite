import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../../../lib/supabaseBrowser";
import { toast } from "../../../../lib/toast";
import { 
  VendorProfile, 
  SocialLink, 
  VendorImage, 
  Theme, 
  Category,
  VendorVideo, 
  VendorPromo, 
  Inquiry, 
  SocialPlatformOption, 
  Album, 
  AlbumPhoto,
  SOCIAL_PLATFORM_OPTIONS
} from "../types";
import { apiFetch, ensureSingleCover, isKnownPlatform, clampPct, clampZoom } from "../utils";

export function useVendorDashboard() {
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
    year_established: "",
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<AlbumPhoto[]>([]);
  
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
            categories: { category: Category | Category[] | null }[];
            allCategories: Category[];
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
            year_established: json.vendor.year_established ? json.vendor.year_established.split('-')[0] : "",
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

          const normalizedThemes = (json.themes ?? [])
            .map((vt) => {
              const t = Array.isArray(vt.theme) ? vt.theme[0] : vt.theme;
              return t ? { id: t.id, name: t.name, slug: t.slug } : null;
            })
            .filter((t): t is Theme => t !== null);
          setThemes(normalizedThemes);
          setAllThemes(json.allThemes ?? []);

          const normalizedCategories = (json.categories ?? [])
            .map((vc) => {
              const c = Array.isArray(vc.category) ? vc.category[0] : vc.category;
              return c ? { id: c.id, name: c.name, slug: c.slug } : null;
            })
            .filter((c): c is Category => c !== null);
          setCategories(normalizedCategories);
          setAllCategories(json.allCategories ?? []);

          const [promosRes, inquiriesRes, albumsRes] = await Promise.all([
            apiFetch<{ promos: VendorPromo[] }>("/api/vendor/promos", session.access_token).catch(() => ({ promos: [] as VendorPromo[] })),
            apiFetch<{ inquiries: Inquiry[] }>("/api/vendor/inquiries", session.access_token).catch(() => ({ inquiries: [] as Inquiry[] })),
            apiFetch<{ albums: Album[] }>("/api/vendor/albums", session.access_token).catch(() => ({ albums: [] as Album[] }))
          ]);

          setPromos(promosRes.promos ?? []);
          setInquiries(inquiriesRes.inquiries ?? []);
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

  const saveCoverCrop = async (next: { focusX: number; focusY: number; zoom: number }) => {
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
  };

  const refreshPromos = async () => {
    if (!token) return;
    try {
      const res = await apiFetch<{ promos: VendorPromo[] }>("/api/vendor/promos", token);
      setPromos(res.promos ?? []);
    } catch {
      setPromos([]);
    }
  };

  const createPromo = async (payload: any) => {
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
  };

  const updatePromo = async (id: number, payload: any) => {
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
  };

  const deletePromo = async (id: number) => {
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
  };

  const refreshInquiries = async () => {
    if (!token) return;
    try {
      const res = await apiFetch<{ inquiries: Inquiry[] }>("/api/vendor/inquiries", token);
      setInquiries(res.inquiries ?? []);
    } catch {
      setInquiries([]);
    }
  };

  const updateInquiryStatus = async (id: number, status: string) => {
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
  };

  const createAlbum = async () => {
    if (!token) return;
    if (!albumTitle.trim()) {
      toast.error("Album title is required");
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch<{ album: Album }>("/api/vendor/albums", token, {
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
  };

  const deleteAlbum = async (id: number) => {
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
  };

  const loadAlbumPhotos = async (albumId: number) => {
    if (!token) return;
    try {
      const res = await apiFetch<{ album: any; photos: AlbumPhoto[] }>(`/api/vendor/albums/${albumId}/photos`, token);
      setAlbumPhotos(res.photos ?? []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load album photos.");
    }
  };

  const saveAlbumPhotos = async (albumId: number, photoUrls: string[]) => {
    if (!token) return;
    setSaving(true);
    try {
      const photosWithOrder = photoUrls.map((url, idx) => ({
        image_url: url,
        display_order: idx,
      }));
      const res = await apiFetch<{ photos: AlbumPhoto[] }>(`/api/vendor/albums/${albumId}/photos`, token, {
        method: "PUT",
        body: JSON.stringify({ photos: photosWithOrder }),
      });
      setAlbumPhotos(res.photos ?? []);
      setAlbums((prev) => prev.map((a) => (a.id === albumId ? { ...a, photo_count: photoUrls.length } : a)));
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save album photos.");
    } finally {
      setSaving(false);
    }
  };

  const saveVerificationDoc = async (url: string) => {
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
  };

  const saveProfile = async () => {
    if (!token) return;
    setSaving(true);
    const yearEst = (form.year_established ?? "").trim();
    if (!yearEst) {
      toast.error("Year established is required.");
      setSaving(false);
      return;
    }
    const yearNum = Number(yearEst);
    if (!Number.isInteger(yearNum) || yearNum < 1800 || yearNum > 2100) {
      toast.error("Year established must be a valid 4-digit year between 1800 and 2100.");
      setSaving(false);
      return;
    }

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
          year_established: yearEst,
        }),
      });
      setVendor(res.vendor);
      toast.success("Profile details saved.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const saveSocials = async () => {
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
      toast.success("Social links saved.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save social links.");
    } finally {
      setSaving(false);
    }
  };

  const saveThemes = async () => {
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
      toast.success("Themes updated.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save themes.");
    } finally {
      setSaving(false);
    }
  };

  const saveCategories = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await apiFetch<{ categories: { category: Category | Category[] | null }[]; allCategories: Category[] }>("/api/vendor/categories", token, {
        method: "PUT",
        body: JSON.stringify({ categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })) }),
      });

      const normalizedCategories = (res.categories ?? [])
        .map((vc) => {
          const c = Array.isArray(vc.category) ? vc.category[0] : vc.category;
          return c ? { id: c.id, name: c.name, slug: c.slug } : null;
        })
        .filter((c): c is Category => c !== null);
      setCategories(normalizedCategories);
      setAllCategories(res.allCategories ?? []);
      toast.success("Categories updated.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save categories.");
    } finally {
      setSaving(false);
    }
  };

  const saveImages = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const cleaned = ensureSingleCover(images).filter((i) => i.image_url.trim().length > 0);

      if (cleaned.length === 0) {
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
      toast.success("Portfolio photos saved.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save photos.");
    } finally {
      setSaving(false);
    }
  };

  const saveVideos = async () => {
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
  };

  return {
    loading,
    email,
    token,
    saving,
    vendor,
    subscription,
    form,
    socials,
    socialPlatformChoices,
    socialCustomPlatforms,
    images,
    videos,
    promos,
    inquiries,
    themes,
    allThemes,
    categories,
    allCategories,
    albums,
    selectedAlbum,
    albumPhotos,
    albumModalOpen,
    albumTitle,
    albumEditorOpen,
    deleteAlbumModalOpen,
    albumToDelete,
    cropperOpen,
    logoModalOpen,
    photoModalOpen,
    editingPhotoIndex,
    promoModalOpen,
    editingPromoId,
    videoModalOpen,
    editingVideoIndex,
    isPreviewOpen,
    isPremium,
    
    setForm,
    setSocials,
    setSocialPlatformChoices,
    setSocialCustomPlatforms,
    setImages,
    setVideos,
    setThemes,
    setCategories,
    setAlbumModalOpen,
    setAlbumTitle,
    setAlbumEditorOpen,
    setSelectedAlbum,
    setDeleteAlbumModalOpen,
    setAlbumToDelete,
    setCropperOpen,
    setLogoModalOpen,
    setPhotoModalOpen,
    setEditingPhotoIndex,
    setPromoModalOpen,
    setEditingPromoId,
    setVideoModalOpen,
    setEditingVideoIndex,
    setIsPreviewOpen,

    saveCoverCrop,
    refreshPromos,
    createPromo,
    updatePromo,
    deletePromo,
    refreshInquiries,
    updateInquiryStatus,
    loadAlbums: async () => {
      if (!token) return;
      try {
        const res = await apiFetch<{ albums: Album[] }>("/api/vendor/albums", token);
        setAlbums(res.albums ?? []);
      } catch (e: any) {
        toast.error(e?.message ?? "Failed to load albums.");
      }
    },
    createAlbum,
    deleteAlbum,
    loadAlbumPhotos,
    saveAlbumPhotos,
    saveVerificationDoc,
    saveProfile,
    saveSocials,
    saveThemes,
    saveCategories,
    saveImages,
    saveVideos,
  };
}
