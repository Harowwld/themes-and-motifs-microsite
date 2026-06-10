import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../../../lib/supabaseBrowser";
import { toast } from "../../../../lib/toast";
import { regionsCache, citiesCache } from "../../../../lib/cache";
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
  AlbumPhoto,
  Album,
  SOCIAL_PLATFORM_OPTIONS,
  Review,
  MarketplaceItem
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
  const [subscription, setSubscription] = useState<{ 
    id: number; 
    status: string; 
    expiry_date: string | null; 
    verification_doc_url: string | null;
    sec_doc_url?: string | null;
    dti_doc_url?: string | null;
    tin?: string | null;
  } | null>(null);
  const [form, setForm] = useState({
    business_name: "",
    logo_url: "",
    description: "",
    province_id: null as number | null,
    city_id: null as number | null,
    city: "",
    address: "",
    website_url: "",
    contact_phone: "",
    cover_focus_x: 50,
    cover_focus_y: 50,
    cover_zoom: 1,
    card_cover_focus_x: 50,
    card_cover_focus_y: 50,
    card_cover_zoom: 1,
    portrait_cover_focus_x: 50,
    portrait_cover_focus_y: 50,
    portrait_cover_zoom: 1,
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
  
  const [images, setImages] = useState<Array<{ image_url: string; caption: string; is_cover: boolean; display_order: number; media_type?: 'image' | 'video'; theme_id?: number | null }>>([
    { image_url: "", caption: "", is_cover: true, display_order: 1, theme_id: null },
  ]);
  const [videos, setVideos] = useState<VendorVideo[]>([]);

  const [promos, setPromos] = useState<VendorPromo[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [allThemes, setAllThemes] = useState<Theme[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  const [regions, setRegions] = useState<{id: number, name: string}[]>([]);
  const [cities, setCities] = useState<{id: number, name: string, province_id: number}[]>([]);

  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<AlbumPhoto[]>([]);
  
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumEditorOpen, setAlbumEditorOpen] = useState(false);
  const [deleteAlbumModalOpen, setDeleteAlbumModalOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState<{ id: number; title: string } | null>(null);
  const [renameAlbumModalOpen, setRenameAlbumModalOpen] = useState(false);
  const [albumToRename, setAlbumToRename] = useState<Album | null>(null);
  const [renameAlbumTitle, setRenameAlbumTitle] = useState("");

  const [cropperOpen, setCropperOpen] = useState(false);
  const [cardCropperOpen, setCardCropperOpen] = useState(false);
  const [portraitCropperOpen, setPortraitCropperOpen] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [editingPhotoIndex, setEditingPhotoIndex] = useState<number | null>(null);

  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<number | null>(null);

  const [marketplaceItemModalOpen, setMarketplaceItemModalOpen] = useState(false);
  const [editingMarketplaceItemId, setEditingMarketplaceItemId] = useState<number | null>(null);

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
          const profilePromise = apiFetch<{
            vendor: VendorProfile;
            socials: SocialLink[];
            images: VendorImage[];
            themes: { id: number; theme: Theme | Theme[] | null }[];
            allThemes: Theme[];
            categories: { category: Category | Category[] | null }[];
            allCategories: Category[];
            subscription: { 
              id: number; 
              status: string; 
              expiry_date: string | null; 
              verification_doc_url: string | null;
              sec_doc_url?: string | null;
              dti_doc_url?: string | null;
              tin?: string | null;
            } | null;
            videos: VendorVideo[];
          }>("/api/vendor/profile", session.access_token);

          // Check local cache for static regions & cities to reduce dashboard loading times
          const cachedRegions = regionsCache.get();
          const cachedCities = citiesCache.get();

          const regionsPromise = cachedRegions 
            ? Promise.resolve({ data: cachedRegions }) 
            : supabase.from("provinces").select("id,name").order("name", { ascending: true }).limit(200);

          const citiesPromise = cachedCities
            ? Promise.resolve({ data: cachedCities })
            : Promise.all([
                supabase.from("cities").select("id,name,province_id").order("name", { ascending: true }).range(0, 999),
                supabase.from("cities").select("id,name,province_id").order("name", { ascending: true }).range(1000, 1999)
              ]).then(([part1, part2]) => ({
                data: [...(part1.data ?? []), ...(part2.data ?? [])]
              }));

          const [
            json,
            promosRes,
            marketplaceItemsRes,
            inquiriesRes,
            albumsRes,
            reviewsRes,
            regionsRes,
            citiesRes
          ] = await Promise.all([
            profilePromise,
            apiFetch<{ promos: VendorPromo[] }>("/api/vendor/promos", session.access_token).catch(() => ({ promos: [] as VendorPromo[] })),
            apiFetch<{ marketplaceItems: MarketplaceItem[] }>("/api/vendor/marketplace-items", session.access_token).catch(() => ({ marketplaceItems: [] as MarketplaceItem[] })),
            apiFetch<{ inquiries: Inquiry[] }>("/api/vendor/inquiries", session.access_token).catch(() => ({ inquiries: [] as Inquiry[] })),
            apiFetch<{ albums: Album[] }>("/api/vendor/albums", session.access_token).catch(() => ({ albums: [] as Album[] })),
            apiFetch<{ reviews: Review[] }>("/api/vendor/reviews", session.access_token).catch(() => ({ reviews: [] as Review[] })),
            regionsPromise,
            citiesPromise
          ]);

          // Save to cache if they were fetched fresh
          if (!cachedRegions && regionsRes.data) {
            regionsCache.set(regionsRes.data);
          }
          if (!cachedCities && citiesRes.data) {
            citiesCache.set(citiesRes.data);
          }

          setVendor(json.vendor);
          setSubscription(json.subscription);
          setForm({
            business_name: json.vendor.business_name ?? "",
            logo_url: (json.vendor as any).logo_url ?? "",
            description: json.vendor.description ?? "",
            province_id: json.vendor.province_id ?? null,
            city_id: json.vendor.city_id ?? null,
            city: json.vendor.city ?? "",
            address: json.vendor.address ?? "",
            website_url: json.vendor.website_url ?? "",
            contact_phone: json.vendor.contact_phone ?? "",
            cover_focus_x: Number.isFinite(Number((json.vendor as any).cover_focus_x)) ? Number((json.vendor as any).cover_focus_x) : 50,
            cover_focus_y: Number.isFinite(Number((json.vendor as any).cover_focus_y)) ? Number((json.vendor as any).cover_focus_y) : 50,
            cover_zoom: Number.isFinite(Number((json.vendor as any).cover_zoom)) ? Number((json.vendor as any).cover_zoom) : 1,
            card_cover_focus_x: Number.isFinite(Number((json.vendor as any).card_cover_focus_x)) ? Number((json.vendor as any).card_cover_focus_x) : 50,
            card_cover_focus_y: Number.isFinite(Number((json.vendor as any).card_cover_focus_y)) ? Number((json.vendor as any).card_cover_focus_y) : 50,
            card_cover_zoom: Number.isFinite(Number((json.vendor as any).card_cover_zoom)) ? Number((json.vendor as any).card_cover_zoom) : 1,
            portrait_cover_focus_x: Number.isFinite(Number((json.vendor as any).portrait_cover_focus_x)) ? Number((json.vendor as any).portrait_cover_focus_x) : 50,
            portrait_cover_focus_y: Number.isFinite(Number((json.vendor as any).portrait_cover_focus_y)) ? Number((json.vendor as any).portrait_cover_focus_y) : 50,
            portrait_cover_zoom: Number.isFinite(Number((json.vendor as any).portrait_cover_zoom)) ? Number((json.vendor as any).portrait_cover_zoom) : 1,
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
            theme_id: (img as any).theme_id ?? null,
          }));

          setImages(
            normalizedImgs.length > 0
              ? ensureSingleCover(normalizedImgs)
              : [{ image_url: "", caption: "", is_cover: true, display_order: 1, theme_id: null }]
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

          setPromos(promosRes.promos ?? []);
          setMarketplaceItems(marketplaceItemsRes.marketplaceItems ?? []);
          setInquiries(inquiriesRes.inquiries ?? []);
          setAlbums(albumsRes.albums ?? []);
          setReviews(reviewsRes.reviews ?? []);
          setRegions(regionsRes.data ?? []);
          setCities(citiesRes.data ?? []);
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

  const saveCoverCrop = async (type: 'portrait' | 'card' | 'details', next: { focusX: number; focusY: number; zoom: number }) => {
    if (!token) return;
    setSaving(true);
    try {
      let payload = {};
      if (type === 'portrait') {
        payload = {
          portrait_cover_focus_x: Number.isFinite(Number(next.focusX)) ? Math.round(Number(next.focusX)) : null,
          portrait_cover_focus_y: Number.isFinite(Number(next.focusY)) ? Math.round(Number(next.focusY)) : null,
          portrait_cover_zoom: Number.isFinite(Number(next.zoom)) ? Number(next.zoom) : null,
        };
      } else if (type === 'card') {
        payload = {
          card_cover_focus_x: Number.isFinite(Number(next.focusX)) ? Math.round(Number(next.focusX)) : null,
          card_cover_focus_y: Number.isFinite(Number(next.focusY)) ? Math.round(Number(next.focusY)) : null,
          card_cover_zoom: Number.isFinite(Number(next.zoom)) ? Number(next.zoom) : null,
        };
      } else {
        payload = {
          cover_focus_x: Number.isFinite(Number(next.focusX)) ? Math.round(Number(next.focusX)) : null,
          cover_focus_y: Number.isFinite(Number(next.focusY)) ? Math.round(Number(next.focusY)) : null,
          cover_zoom: Number.isFinite(Number(next.zoom)) ? Number(next.zoom) : null,
        };
      }

      const res = await apiFetch<{ vendor: VendorProfile }>("/api/vendor/profile", token, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setVendor(res.vendor);
      setForm((p) => ({
        ...p,
        cover_focus_x: Number.isFinite(Number((res.vendor as any).cover_focus_x)) ? Number((res.vendor as any).cover_focus_x) : 50,
        cover_focus_y: Number.isFinite(Number((res.vendor as any).cover_focus_y)) ? Number((res.vendor as any).cover_focus_y) : 50,
        cover_zoom: Number.isFinite(Number((res.vendor as any).cover_zoom)) ? Number((res.vendor as any).cover_zoom) : 1,
        card_cover_focus_x: Number.isFinite(Number((res.vendor as any).card_cover_focus_x)) ? Number((res.vendor as any).card_cover_focus_x) : 50,
        card_cover_focus_y: Number.isFinite(Number((res.vendor as any).card_cover_focus_y)) ? Number((res.vendor as any).card_cover_focus_y) : 50,
        card_cover_zoom: Number.isFinite(Number((res.vendor as any).card_cover_zoom)) ? Number((res.vendor as any).card_cover_zoom) : 1,
        portrait_cover_focus_x: Number.isFinite(Number((res.vendor as any).portrait_cover_focus_x)) ? Number((res.vendor as any).portrait_cover_focus_x) : 50,
        portrait_cover_focus_y: Number.isFinite(Number((res.vendor as any).portrait_cover_focus_y)) ? Number((res.vendor as any).portrait_cover_focus_y) : 50,
        portrait_cover_zoom: Number.isFinite(Number((res.vendor as any).portrait_cover_zoom)) ? Number((res.vendor as any).portrait_cover_zoom) : 1,
      }));
      setCropperOpen(false);
      setCardCropperOpen(false);
      setPortraitCropperOpen(false);
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

  const refreshMarketplaceItems = async () => {
    if (!token) return;
    try {
      const res = await apiFetch<{ marketplaceItems: MarketplaceItem[] }>("/api/vendor/marketplace-items", token);
      setMarketplaceItems(res.marketplaceItems ?? []);
    } catch {
      setMarketplaceItems([]);
    }
  };

  const createMarketplaceItem = async (payload: any) => {
    if (!token) return;
    setSaving(true);
    try {
      await apiFetch<{ marketplaceItem: MarketplaceItem }>("/api/vendor/marketplace-items", token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      await refreshMarketplaceItems();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save marketplace item.");
    } finally {
      setSaving(false);
    }
  };

  const updateMarketplaceItem = async (id: number, payload: any) => {
    if (!token) return;
    setSaving(true);
    try {
      await apiFetch<{ marketplaceItem: MarketplaceItem }>("/api/vendor/marketplace-items", token, {
        method: "PATCH",
        body: JSON.stringify({ id, ...payload }),
      });
      await refreshMarketplaceItems();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save marketplace item.");
    } finally {
      setSaving(false);
    }
  };

  const deleteMarketplaceItem = async (id: number) => {
    if (!token) return;
    setSaving(true);
    try {
      await apiFetch<{ ok: boolean }>(`/api/vendor/marketplace-items?id=${encodeURIComponent(String(id))}`, token, {
        method: "DELETE",
      });
      await refreshMarketplaceItems();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete marketplace item.");
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

  const saveReviewReply = async (reviewId: number, text: string | null) => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await apiFetch<{ review: Review }>("/api/vendor/reviews", token, {
        method: "PATCH",
        body: JSON.stringify({ reviewId, replyText: text }),
      });
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                vendor_reply_text: res.review.vendor_reply_text,
                vendor_reply_at: res.review.vendor_reply_at,
              }
            : r
        )
      );
      toast.success(text ? "Reply saved successfully." : "Reply deleted successfully.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save reply.");
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

  const renameAlbum = async () => {
    if (!token) return;
    if (!albumToRename) return;
    if (!renameAlbumTitle.trim()) {
      toast.error("Album title is required");
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch<{ album: Album }>("/api/vendor/albums", token, {
        method: "PATCH",
        body: JSON.stringify({ id: albumToRename.id, title: renameAlbumTitle.trim() }),
      });
      setAlbums((prev) => prev.map((a) => (a.id === albumToRename.id ? { ...a, title: res.album.title, slug: res.album.slug } : a)));
      setRenameAlbumModalOpen(false);
      setAlbumToRename(null);
      setRenameAlbumTitle("");
      toast.success("Album renamed successfully.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to rename album.");
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

  const saveAlbumPhotos = async (albumId: number, photoUrls: string[]): Promise<boolean> => {
    if (!token) return false;
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
      return true;
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save album photos.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveVerificationDetails = async (secUrl: string, dtiUrl: string, birUrl: string, mayorsPermitUrl: string, expiryDate: string | null, tin: string | null) => {
    if (!token) return false;
    setSaving(true);
    try {
      const res = await apiFetch<{ subscription: any }>("/api/vendor/subscription", token, {
        method: "PATCH",
        body: JSON.stringify({ 
          sec_doc_url: secUrl || null, 
          dti_doc_url: dtiUrl || null, 
          bir_doc_url: birUrl || null,
          mayors_permit_url: mayorsPermitUrl || null,
          expiry_date: expiryDate || null,
          tin: tin || null
        }),
      });
      setSubscription(res.subscription);
      toast.success("Verification details saved.");
      return true;
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save verification details.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveVerificationDoc = async (url: string) => {
    await saveVerificationDetails(url, "", "", "", null, subscription?.tin || null);
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
          province_id: form.province_id,
          city_id: form.city_id,
          city: form.city || null,
          address: form.address || null,
          website_url: form.website_url || null,
          contact_phone: form.contact_phone || null,
          cover_focus_x: Number.isFinite(Number(form.cover_focus_x)) ? Number(form.cover_focus_x) : null,
          cover_focus_y: Number.isFinite(Number(form.cover_focus_y)) ? Number(form.cover_focus_y) : null,
          cover_zoom: Number.isFinite(Number(form.cover_zoom)) ? Number(form.cover_zoom) : null,
          card_cover_focus_x: Number.isFinite(Number(form.card_cover_focus_x)) ? Number(form.card_cover_focus_x) : null,
          portrait_cover_focus_x: Number.isFinite(Number(form.portrait_cover_focus_x)) ? Number(form.portrait_cover_focus_x) : null,
          portrait_cover_focus_y: Number.isFinite(Number(form.portrait_cover_focus_y)) ? Number(form.portrait_cover_focus_y) : null,
          portrait_cover_zoom: Number.isFinite(Number(form.portrait_cover_zoom)) ? Number(form.portrait_cover_zoom) : null,
          card_cover_focus_y: Number.isFinite(Number(form.card_cover_focus_y)) ? Number(form.card_cover_focus_y) : null,
          card_cover_zoom: Number.isFinite(Number(form.card_cover_zoom)) ? Number(form.card_cover_zoom) : null,
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

  const saveThemes = async (customThemes?: Theme[]) => {
    if (!token) return;
    setSaving(true);
    try {
      const targetThemes = customThemes || themes;
      const res = await apiFetch<{ themes: { id: number; theme: Theme | Theme[] | null }[]; allThemes: Theme[]; created: Theme[] }>("/api/vendor/themes", token, {
        method: "PUT",
        body: JSON.stringify({ themes: targetThemes.map((t) => ({ id: t.id, name: t.name, slug: t.slug })) }),
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

  const saveImages = async (customImages?: any[]) => {
    if (!token) return;
    setSaving(true);
    try {
      const targetImages = customImages || images;
      const cleaned = ensureSingleCover(targetImages).filter((i) => i.image_url.trim().length > 0);

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
        theme_id: i.theme_id ?? null,
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
        theme_id: (img as any).theme_id ?? null,
      }));

      setImages(
        normalizedImgs.length > 0
          ? ensureSingleCover(normalizedImgs)
          : [{ image_url: "", caption: "", is_cover: true, display_order: 1, theme_id: null }]
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
    marketplaceItems,
    inquiries,
    reviews,
    themes,
    allThemes,
    categories,
    allCategories,
    regions,
    cities,
    albums,
    selectedAlbum,
    albumPhotos,
    albumModalOpen,
    albumTitle,
    albumEditorOpen,
    deleteAlbumModalOpen,
    albumToDelete,
    renameAlbumModalOpen,
    albumToRename,
    renameAlbumTitle,
    cropperOpen,
    setCropperOpen,
    cardCropperOpen,
    setCardCropperOpen,
    portraitCropperOpen,
    setPortraitCropperOpen,
    logoModalOpen,
    photoModalOpen,
    editingPhotoIndex,
    promoModalOpen,
    editingPromoId,
    marketplaceItemModalOpen,
    editingMarketplaceItemId,
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
    setRenameAlbumModalOpen,
    setAlbumToRename,
    setRenameAlbumTitle,
    setLogoModalOpen,
    setPhotoModalOpen,
    setEditingPhotoIndex,
    setPromoModalOpen,
    setEditingPromoId,
    setMarketplaceItemModalOpen,
    setEditingMarketplaceItemId,
    setVideoModalOpen,
    setEditingVideoIndex,
    setIsPreviewOpen,

    saveCoverCrop,
    refreshPromos,
    createPromo,
    updatePromo,
    deletePromo,
    refreshMarketplaceItems,
    createMarketplaceItem,
    updateMarketplaceItem,
    deleteMarketplaceItem,
    refreshInquiries,
    updateInquiryStatus,
    saveReviewReply,
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
    renameAlbum,
    loadAlbumPhotos,
    saveAlbumPhotos,
    saveVerificationDoc,
    saveVerificationDetails,
    saveProfile,
    saveSocials,
    saveThemes,
    saveCategories,
    saveImages,
    saveVideos,
  };
}
