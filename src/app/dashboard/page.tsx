"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { proxiedImageUrl } from "@/lib/imageSizes";
import { shouldShowVerifiedBadge } from "@/lib/vendorUtils";
import VendorBadges from "@/features/vendors/components/VendorBadges";
import { motion, AnimatePresence } from "framer-motion";
import { authCache } from "@/lib/cache";
import {
  LayoutDashboard,
  Wallet,
  Users,
  MailOpen,
  Grid,
  CheckSquare,
  Award,
  Heart,
  FileText,
  Lock,
  Globe,
  Gift,
  X,
  Calendar
} from "lucide-react";

// Custom tab features
import { BudgetItem, Guest, WeddingTable, TaskItem, DreamVendor, RantReview, NoteItem } from "./types";
import BudgetPlanner from "./components/BudgetPlanner";
import GuestList from "./components/GuestList";
import RSVPTracker from "./components/RSVPTracker";
import TableAssignment from "./components/TableAssignment";
import Checklist from "./components/Checklist";
import DreamTeam from "./components/DreamTeam";
import RantsReviews from "./components/RantsReviews";
import Notes from "./components/Notes";
import PremiumBanner from "./components/PremiumBanner";
import MicrositeSettings from "./components/MicrositeSettings";
import GiftRegistry from "./components/GiftRegistry";
import EventRegistration from "./components/EventRegistration";
import AdBanner from "@/components/AdBanner";
import { MomentPhotoUpload } from "@/components/MomentPhotoUpload";



type SavedVendor = {
  id: string;
  created_at: string;
  vendor: {
    id: number;
    business_name: string;
    slug: string;
    logo_url: string | null;
    cover_image_url: string | null;
    cover_focus_x: number | null;
    cover_focus_y: number | null;
    cover_zoom: number | null;
    city: string | null;
    province: { name: string } | null;
    city_rel: { name: string } | null;
    average_rating: number | null;
    review_count: number | null;
    starting_price: number | null;
    price_range: string | null;
    document_verified?: string | null;
    year_established?: string | number | null;
    plan: { name: string } | null;
  };
};

function VendorCard({ vendor, onRemove }: { vendor: SavedVendor["vendor"]; onRemove: () => void }) {
  const logoUrl = proxiedImageUrl(vendor.logo_url);
  const coverUrl = proxiedImageUrl(vendor.cover_image_url);
  const locationParts = [];
  if (vendor.city_rel?.name) locationParts.push(vendor.city_rel.name);
  else if (vendor.city) locationParts.push(vendor.city);
  if (vendor.province?.name) locationParts.push(vendor.province.name);
  const location = locationParts.join(", ") || null;
  const rating = vendor.average_rating ?? 0;
  const reviews = vendor.review_count ?? 0;

  const planName = String(vendor.plan?.name ?? "").trim().toLowerCase();
  const isPremium = planName.includes("premium");

  const focusX = Number.isFinite(Number(vendor.cover_focus_x)) ? Number(vendor.cover_focus_x) : 50;
  const focusY = Number.isFinite(Number(vendor.cover_focus_y)) ? Number(vendor.cover_focus_y) : 50;
  const coverObjectPosition = `${Math.max(0, Math.min(100, focusX))}% ${Math.max(0, Math.min(100, focusY))}%`;
  const zoomRaw = Number.isFinite(Number(vendor.cover_zoom)) ? Number(vendor.cover_zoom) : 1;
  const coverZoom = Math.max(1, Math.min(3, zoomRaw));

  return (
    <div className="group relative rounded-xl border border-black/5 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.04)] transition-all duration-300">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
        className="absolute top-2 right-2 z-20 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-md text-[#a68b6a] hover:bg-[#a68b6a] hover:text-white transition-all duration-200"
        aria-label="Remove from saved"
      >
        <svg className="h-4 w-4" fill="currentColor" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      </button>

      <a href={`/suppliers/${encodeURIComponent(vendor.slug)}`} className="block">
        <div className="h-32 bg-gradient-to-br from-[#a68b6a]/10 to-white relative overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              style={{
                objectPosition: coverObjectPosition,
                transformOrigin: coverObjectPosition,
                transform: `scale(${coverZoom})`
              }}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        </div>
        <div className="relative px-4 pb-4">
          <div className="relative -mt-10 mb-2 flex items-end justify-between">
            <div className="h-20 w-20 rounded-2xl border-4 border-white bg-[#fcfbf9] shadow-lg overflow-hidden flex items-center justify-center shrink-0 -ml-1">
              {logoUrl ? (
                <img src={logoUrl} alt={`${vendor.business_name} logo`} className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
              ) : (
                <div className="h-full w-full bg-[#fcfbf9]" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-[14px] sm:text-[15px] font-semibold text-neutral-800 leading-5 line-clamp-1 mb-1 font-[family-name:var(--font-plus-jakarta)]">
            <span className="truncate">{vendor.business_name}</span>
            <VendorBadges 
              documentVerified={vendor.document_verified} 
              isPremium={isPremium} 
              yearEstablished={vendor.year_established} 
              size={20} 
            />
          </div>
          <div className="flex items-center gap-1 text-[11px] sm:text-[12px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)]">
            <span className="font-semibold text-[#a68b6a]">{rating.toFixed(1)}</span>
            <span className="text-neutral-300">·</span>
            <span className="truncate">{reviews} reviews</span>
            {location ? (
              <>
                <span className="text-neutral-300">·</span>
                <span className="truncate">{location}</span>
              </>
            ) : null}
          </div>
          {vendor.price_range && (
            <div className="mt-2 text-[12px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)]">
              {vendor.price_range}
            </div>
          )}
        </div>
      </a>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="rounded-xl border border-black/5 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="h-32 bg-black/5 animate-pulse" />
      <div className="relative px-4 pb-4">
        <div className="relative -mt-10 mb-2 flex items-end">
          <div className="h-20 w-20 rounded-2xl border-4 border-white bg-black/5 shadow-lg shrink-0 -ml-1" />
        </div>
        <div className="h-5 w-3/4 rounded bg-black/5 animate-pulse mb-2" />
        <div className="flex items-center gap-2">
          <div className="h-3 w-10 rounded bg-black/5 animate-pulse" />
          <div className="h-3 w-16 rounded bg-black/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
const tabNames: Record<string, string> = {
  microsite_settings: "Microsite Settings",
  gift_registry: "Gift Registry",
  event_registration: "Event Registration",
  budget_planner: "Budget Planner",
  guest_list: "Guest List Tracker",
  rsvp: "RSVP Manager",
  table_assignment: "Table Seating Chart",
  checklist: "Task Checklist",
  dream_team: "Dream Supplier Team",
  rants_reviews: "Rants & Reviews Log",
  notes: "Planning Notebook",
};

const tabDescriptions: Record<string, string> = {
  microsite_settings: "Configure your public microsite page—love story, entourage members, principal and secondary sponsors, and guest welcome message.",
  gift_registry: "Manage your wedding registry. View and manage items you've added from the marketplace, customize target amounts, and track guest contributions.",
  event_registration: "Register for upcoming Themes & Motifs The Wedding App bridal fairs and wedding expos to get free entry passes.",
  budget_planner: "Take control of your wedding budget. Log estimates, track payments, and visualize cost distribution seamlessly.",
  guest_list: "Keep a clean record of your guests, their contact information, dietary requirements, and RSVP counts.",
  rsvp: "Monitor RSVP status in real-time, view guest choices, and ensure a precise head count for seating.",
  table_assignment: "Easily design your reception layout. Set up tables, define seat limits, and assign guests in a visual board.",
  checklist: "Never miss a detail with our categorized task checklist. Set deadlines, track progress, and log accomplishments.",
  dream_team: "Manage your dream vendors. Record rates, contact numbers, booking status, and private coordination notes.",
  rants_reviews: "Write down your private vendor reviews, planning rants, and tasting notes in a secure, quiet journal.",
  notes: "Draft wedding vows, script designs, fitting notes, and quick ideas. A perfect whiteboard for your inspiration.",
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // Basic states
  const [user, setUser] = useState<any>(null);
  const [savedVendors, setSavedVendors] = useState<SavedVendor[]>([]);
  const [recentMoments, setRecentMoments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Premium tier controls
  const [isPremium, setIsPremium] = useState(false);
  const [activeTab, setActiveTab] = useState("wedding_tools");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, []);
  const [preselectedVendorName, setPreselectedVendorName] = useState<string | null>(null);
  const [confettiBurst, setConfettiBurst] = useState(false);

  // Modular Premium States
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<WeddingTable[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [dreamVendors, setDreamVendors] = useState<DreamVendor[]>([]);
  const [journalEntries, setJournalEntries] = useState<RantReview[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const userId = user?.id ?? "";

  // Edit Moment Modal States
  const [editingMoment, setEditingMoment] = useState<any | null>(null);
  const [editMomentTitle, setEditMomentTitle] = useState("");
  const [editMomentContent, setEditMomentContent] = useState("");
  const [editMomentVisibility, setEditMomentVisibility] = useState<"public" | "private" | "friends">("private");
  const [savingMoment, setSavingMoment] = useState(false);
  const [deletingMomentId, setDeletingMomentId] = useState<string | null>(null);
  const [newMomentFiles, setNewMomentFiles] = useState<File[]>([]);

  const handleOpenEditMoment = (moment: any) => {
    setEditingMoment(moment);
    setEditMomentTitle(moment.title);
    setEditMomentContent(moment.content ?? "");
    setEditMomentVisibility(moment.visibility ?? "private");
    setNewMomentFiles([]);
  };

  // Add Moment Modal States
  const [showAddMomentModal, setShowAddMomentModal] = useState(false);
  const [newMomentTitle, setNewMomentTitle] = useState("");
  const [newMomentContent, setNewMomentContent] = useState("");
  const [newMomentType, setNewMomentType] = useState<"photo" | "story" | "milestone" | "review">("photo");
  const [newMomentVisibility, setNewMomentVisibility] = useState<"public" | "private" | "friends">("private");
  const [newMomentUploadedFiles, setNewMomentUploadedFiles] = useState<File[]>([]);
  const [creatingMoment, setCreatingMoment] = useState(false);

  const handleOpenAddMoment = () => {
    setNewMomentTitle("");
    setNewMomentContent("");
    setNewMomentType("photo");
    setNewMomentVisibility("private");
    setNewMomentUploadedFiles([]);
    setShowAddMomentModal(true);
  };

  const handleCreateMomentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMomentTitle.trim()) {
      toast.error("Please enter a title.");
      return;
    }

    if (!isPremium && newMomentType === "photo") {
      const existingPhotoMoments = recentMoments.filter((m) => m.moment_type === "photo");
      if (existingPhotoMoments.length >= 1) {
        toast.error("Free accounts are limited to 1 photo album. Please upgrade to Premium to upload more albums!");
        return;
      }
      const totalPhotosCount = recentMoments.filter((m) => m.moment_type === "photo").reduce((acc, m) => acc + (m.moment_photos?.length ?? 0), 0);
      if (totalPhotosCount + newMomentUploadedFiles.length > 10) {
        toast.error(`Free accounts are limited to 10 photos in total. You currently have ${totalPhotosCount} photos and are trying to upload ${newMomentUploadedFiles.length} more. Please upgrade to Premium to upload more photos!`);
        return;
      }
    }

    setCreatingMoment(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      // 1. Create the moment
      const response = await fetch("/api/moments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newMomentTitle,
          content: newMomentContent,
          moment_type: newMomentType,
          visibility: newMomentVisibility,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to create moment.");
      }

      const { moment } = await response.json();
      const momentId = moment.id;

      // 2. Upload photos if selected
      let newlyUploadedPhotos: any[] = [];
      if (newMomentUploadedFiles.length > 0) {
        const photoPromises = newMomentUploadedFiles.map(async (file, index) => {
          const formData = new FormData();
          formData.append("momentId", momentId);
          formData.append("file", file);
          formData.append("caption", "");

          const photoResponse = await fetch("/api/moments/photos", {
            method: "POST",
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (!photoResponse.ok) {
            const errJson = await photoResponse.json().catch(() => ({}));
            throw new Error(errJson.error || `Failed to upload photo ${index + 1}`);
          }

          const photoResData = await photoResponse.json();
          return photoResData.photo;
        });

        newlyUploadedPhotos = await Promise.all(photoPromises);
      }

      // Add the new moment to the local state
      const completedMoment = {
        ...moment,
        moment_photos: newlyUploadedPhotos,
      };

      setRecentMoments((prev) => [completedMoment, ...prev]);
      toast.success("Moment created successfully!");
      setShowAddMomentModal(false);
    } catch (err) {
      console.error("Error creating moment:", err);
      toast.error(err instanceof Error ? err.message : "Failed to create moment.");
    } finally {
      setCreatingMoment(false);
    }
  };

  const handleSaveMomentChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMoment) return;
    if (!editMomentTitle.trim()) {
      toast.error("Please enter a title.");
      return;
    }

    if (!isPremium && editingMoment.moment_type === "photo") {
      const otherPhotoMoments = recentMoments.filter((m) => m.moment_type === "photo" && m.id !== editingMoment.id);
      const totalPhotosInOtherAlbums = otherPhotoMoments.reduce((acc, m) => acc + (m.moment_photos?.length ?? 0), 0);
      const currentAlbumPhotosCount = editingMoment.moment_photos?.length ?? 0;
      const totalPhotosCount = totalPhotosInOtherAlbums + currentAlbumPhotosCount;

      if (totalPhotosCount + newMomentFiles.length > 10) {
        toast.error(`Free accounts are limited to 10 photos in total. You currently have ${totalPhotosCount} photos and are trying to upload ${newMomentFiles.length} more. Please upgrade to Premium to upload more photos!`);
        return;
      }
    }

    setSavingMoment(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      // 1. Update text metadata fields
      const res = await fetch(`/api/moments/${editingMoment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editMomentTitle,
          content: editMomentContent,
          visibility: editMomentVisibility,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to update moment.");
      }

      // 2. Upload new files if added
      let newlyUploadedPhotos: any[] = [];
      if (newMomentFiles.length > 0) {
        const photoPromises = newMomentFiles.map(async (file, index) => {
          const formData = new FormData();
          formData.append("momentId", editingMoment.id);
          formData.append("file", file);
          formData.append("caption", "");

          const photoResponse = await fetch("/api/moments/photos", {
            method: "POST",
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (!photoResponse.ok) {
            const errJson = await photoResponse.json().catch(() => ({}));
            throw new Error(errJson.error || `Failed to upload photo ${index + 1}`);
          }

          const photoResData = await photoResponse.json();
          return photoResData.photo;
        });

        newlyUploadedPhotos = await Promise.all(photoPromises);
      }

      // 3. Sync changes back into local states
      setRecentMoments((prev) =>
        prev.map((m) => {
          if (m.id === editingMoment.id) {
            const currentPhotos = m.moment_photos ?? [];
            return {
              ...m,
              title: editMomentTitle,
              content: editMomentContent,
              visibility: editMomentVisibility,
              moment_photos: [...currentPhotos, ...newlyUploadedPhotos]
            };
          }
          return m;
        })
      );
      
      toast.success("Moment updated successfully!");
      setEditingMoment(null);
    } catch (err) {
      console.error("Error saving moment changes:", err);
      toast.error("Failed to save changes.");
    } finally {
      setSavingMoment(false);
    }
  };

  const handleDeleteMoment = async (momentId: string) => {
    if (!confirm("Are you sure you want to delete this moment?")) return;
    setDeletingMomentId(momentId);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const res = await fetch(`/api/moments/${momentId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setRecentMoments((prev) => prev.filter((m) => m.id !== momentId));
        toast.success("Moment deleted successfully.");
        setEditingMoment(null);
      } else {
        throw new Error("Failed to delete moment.");
      }
    } catch (err) {
      console.error("Error deleting moment:", err);
      toast.error("Failed to delete moment.");
    } finally {
      setDeletingMomentId(null);
    }
  };

  // Fetch inquiries from database
  const fetchInquiries = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("inquiries")
        .select(`
          id,
          message,
          status,
          created_at,
          vendor:vendors (
            id,
            business_name,
            logo_url
          )
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInquiries(data ?? []);
    } catch (err) {
      console.error("Error fetching inquiries:", err);
    }
  }, [supabase]);

  // Fetch workspace data from database
  const fetchWorkspaceData = useCallback(async (token: string) => {
    try {
      const res = await fetch("/api/wedding-workspace", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setBudgetItems(data.budgets ?? []);
      setTables(data.tables ?? []);
      setGuests(data.guests ?? []);
      setTasks(data.tasks ?? []);
      setDreamVendors(data.suppliers ?? []);
      setJournalEntries(data.journal ?? []);
      setNotes(data.notes ?? []);
    } catch (err) {
      console.error("Error fetching workspace data:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load wedding workspace planners");
    }
  }, []);

  const fetchSavedVendors = useCallback(async (token: string) => {
    try {
      const res = await fetch("/api/saved-suppliers", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSavedVendors(data.savedVendors ?? []);
    } catch (err) {
      console.error("Error fetching saved suppliers:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load saved suppliers");
    }
  }, []);

  const fetchRecentMoments = useCallback(async (token: string) => {
    try {
      const res = await fetch("/api/moments?visibility=private&limit=3", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.moments) {
        setRecentMoments(data.moments.slice(0, 3));
      }
    } catch (err: any) {
      console.error("Error fetching recent moments:", err);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Fast synchronous check using the client-side cache
    const cached = authCache.get();
    if (cached?.signedIn) {
      if (cached.isVendor || cached.accountType === "vendor") {
        router.replace("/vendor/dashboard");
        return;
      }
      if (cached.isSuperadmin || cached.accountType === "superadmin") {
        router.replace("/superadmin");
        return;
      }
      if (cached.accountType === "editor") {
        router.replace("/editor/dashboard");
        return;
      }
    }

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!cancelled && !session?.user) {
        router.push("/signin?redirect=/dashboard");
        return;
      }

      if (!cancelled && session?.user) {
        // Redirect vendors, editors, and superadmins to their respective dashboards
        const [
          { data: vendorProfile },
          { data: editorProfile },
          { data: superadminProfile }
        ] = await Promise.all([
          supabase.from("vendors").select("id").eq("user_id", session.user.id).maybeSingle(),
          supabase.from("editors").select("id").eq("user_id", session.user.id).maybeSingle(),
          supabase.from("superadmins").select("id").eq("auth_user_id", session.user.id).eq("is_active", true).maybeSingle()
        ]);

        if (!cancelled && vendorProfile) {
          router.replace("/vendor/dashboard");
          return;
        }
        if (!cancelled && editorProfile) {
          router.replace("/editor/dashboard");
          return;
        }
        if (!cancelled && superadminProfile) {
          router.replace("/superadmin");
          return;
        }

        setUser(session.user);

        // Sync premium status from the database soon_to_wed_profiles table
        const { data: profile, error: profileErr } = await supabase
          .from("soon_to_wed_profiles")
          .select("is_premium")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (!profileErr && profile) {
          setIsPremium(!!profile.is_premium);
        } else {
          setIsPremium(false);
        }

        await Promise.all([
          fetchSavedVendors(session.access_token ?? ""),
          fetchRecentMoments(session.access_token ?? ""),
          fetchWorkspaceData(session.access_token ?? ""),
          fetchInquiries()
        ]);
        setLoading(false);
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router, supabase, fetchSavedVendors, fetchRecentMoments, fetchWorkspaceData, fetchInquiries]);

  const handleRemove = async (vendorId: number) => {
    const token = (await supabase.auth.getSession()).data.session?.access_token ?? "";
    try {
      await fetch(`/api/saved-suppliers?vendorId=${vendorId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      setSavedVendors((prev) => prev.filter((sv) => sv.vendor.id !== vendorId));
      toast.success("Supplier removed from saved.");
    } catch (err) {
      console.error("Error removing supplier:", err);
      toast.error("Failed to remove supplier from saved.");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Premium Activation Trigger
  const handleUpgrade = async () => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from("soon_to_wed_profiles")
        .upsert({ user_id: userId, is_premium: true }, { onConflict: "user_id" });

      if (error) throw error;

      setIsPremium(true);
      setConfettiBurst(true);
      handleTabChange("wedding_tools");
      toast.success("✨ Welcome to Premium Soon-to-Wed! Seating planners, budgets, and logs unlocked.");
      setTimeout(() => setConfettiBurst(false), 5000);
    } catch (err) {
      console.error("Upgrade failed:", err);
      toast.error("Failed to upgrade to Premium.");
    }
  };

  const handleDowngrade = async () => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from("soon_to_wed_profiles")
        .upsert({ user_id: userId, is_premium: false }, { onConflict: "user_id" });

      if (error) throw error;

      setIsPremium(false);
      toast.success("Switched to Standard Couple's View.");
    } catch (err) {
      console.error("Downgrade failed:", err);
      toast.error("Failed to switch view.");
    }
  };

  // --- Budget Action Handlers ---
  const handleAddBudget = async (item: Omit<BudgetItem, "id">) => {
    try {
      const { data, error } = await supabase
        .from("wedding_budgets")
        .insert({
          user_id: userId,
          category: item.category,
          name: item.name,
          estimated: item.estimated,
          actual: item.actual,
          status: item.status,
          notes: item.notes
        })
        .select()
        .single();

      if (error) throw error;
      setBudgetItems((prev) => [
        ...prev,
        {
          id: data.id,
          category: data.category,
          name: data.name,
          estimated: Number(data.estimated),
          actual: Number(data.actual),
          status: data.status as any,
          notes: data.notes ?? "",
        },
      ]);
      toast.success("Budget expense added!");
    } catch (err) {
      console.error("Error adding budget item:", err);
      toast.error("Failed to save budget item.");
    }
  };

  const handleToggleBudgetStatus = async (id: string) => {
    const target = budgetItems.find((item) => item.id === id);
    if (!target) return;
    const newStatus = target.status === "paid" ? ("pending" as const) : ("paid" as const);
    try {
      const { error } = await supabase
        .from("wedding_budgets")
        .update({ status: newStatus })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setBudgetItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      console.error("Error toggling budget status:", err);
      toast.error("Failed to update status.");
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from("wedding_budgets")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setBudgetItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Budget item deleted.");
    } catch (err) {
      console.error("Error deleting budget item:", err);
      toast.error("Failed to delete budget item.");
    }
  };

  // --- Guest Handlers ---
  const handleAddGuest = async (guest: Omit<Guest, "id">) => {
    try {
      const { data, error } = await supabase
        .from("wedding_guests")
        .insert({
          user_id: userId,
          name: guest.name,
          category: guest.category,
          email: guest.email,
          phone: guest.phone,
          dietary: guest.dietary,
          rsvp_status: guest.rsvpStatus,
          table_id: guest.tableId || null,
        })
        .select()
        .single();

      if (error) throw error;
      setGuests((prev) => [
        ...prev,
        {
          id: data.id,
          name: data.name,
          category: data.category as any,
          email: data.email,
          phone: data.phone,
          dietary: data.dietary ?? "",
          rsvpStatus: data.rsvp_status as any,
          tableId: data.table_id,
        },
      ]);
      toast.success("Guest added to list!");
    } catch (err) {
      console.error("Error adding guest:", err);
      toast.error("Failed to add guest.");
    }
  };

  const handleUpdateRSVP = async (id: string, rsvpStatus: Guest["rsvpStatus"]) => {
    try {
      const { error } = await supabase
        .from("wedding_guests")
        .update({ rsvp_status: rsvpStatus })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, rsvpStatus } : g)));
      toast.success("RSVP status updated!");
    } catch (err) {
      console.error("Error updating guest RSVP:", err);
      toast.error("Failed to update RSVP.");
    }
  };

  const handleDeleteGuest = async (id: string) => {
    try {
      const { error } = await supabase
        .from("wedding_guests")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setGuests((prev) => prev.filter((g) => g.id !== id));
      toast.success("Guest removed from list.");
    } catch (err) {
      console.error("Error deleting guest:", err);
      toast.error("Failed to delete guest.");
    }
  };

  // --- Seating Arrangement Tables Handlers ---
  const handleAddTable = async (table: Omit<WeddingTable, "id">) => {
    try {
      const { data, error } = await supabase
        .from("wedding_tables")
        .insert({
          user_id: userId,
          name: table.name,
          capacity: table.capacity,
        })
        .select()
        .single();

      if (error) throw error;
      setTables((prev) => [
        ...prev,
        {
          id: data.id,
          name: data.name,
          capacity: data.capacity,
        },
      ]);
      toast.success("Seating table created!");
    } catch (err) {
      console.error("Error adding table:", err);
      toast.error("Failed to create seating table.");
    }
  };

  const handleDeleteTable = async (id: string) => {
    try {
      const { error } = await supabase
        .from("wedding_tables")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setTables((prev) => prev.filter((t) => t.id !== id));
      setGuests((prev) => prev.map((g) => (g.tableId === id ? { ...g, tableId: null } : g)));
      toast.success("Seating table removed.");
    } catch (err) {
      console.error("Error deleting table:", err);
      toast.error("Failed to delete seating table.");
    }
  };

  const handleAssignGuest = async (guestId: string, tableId: string | null) => {
    try {
      const { error } = await supabase
        .from("wedding_guests")
        .update({ table_id: tableId })
        .eq("id", guestId)
        .eq("user_id", userId);

      if (error) throw error;
      setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, tableId } : g)));
      toast.success(tableId ? "Guest assigned to table!" : "Guest unassigned from table.");
    } catch (err) {
      console.error("Error assigning guest:", err);
      toast.error("Failed to update seating assignment.");
    }
  };

  // --- Task Checklist Handlers ---
  const handleAddTask = async (task: Omit<TaskItem, "id">) => {
    try {
      const { data, error } = await supabase
        .from("wedding_tasks")
        .insert({
          user_id: userId,
          category: task.category,
          title: task.title,
          due_date: task.dueDate,
          status: task.status,
        })
        .select()
        .single();

      if (error) throw error;
      setTasks((prev) => [
        ...prev,
        {
          id: data.id,
          category: data.category,
          title: data.title,
          dueDate: data.due_date,
          status: data.status as any,
        },
      ]);
      toast.success("Planning task created!");
    } catch (err) {
      console.error("Error adding task:", err);
      toast.error("Failed to create task.");
    }
  };

  const handleToggleTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const newStatus = target.status === "completed" ? ("todo" as const) : ("completed" as const);
    try {
      const { error } = await supabase
        .from("wedding_tasks")
        .update({ status: newStatus })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    } catch (err) {
      console.error("Error toggling task:", err);
      toast.error("Failed to update task progress.");
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from("wedding_tasks")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Planning task deleted.");
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.error("Failed to delete task.");
    }
  };

  // --- Supplier Tracker Handlers ---
  const handleAddVendor = async (vendor: Omit<DreamVendor, "id">) => {
    try {
      const { data, error } = await supabase
        .from("wedding_dream_suppliers")
        .insert({
          user_id: userId,
          name: vendor.name,
          category: vendor.category,
          rating: vendor.rating,
          status: vendor.status,
          contact: vendor.contact,
          notes: vendor.notes,
        })
        .select()
        .single();

      if (error) throw error;
      setDreamVendors((prev) => [
        ...prev,
        {
          id: data.id,
          name: data.name,
          category: data.category,
          rating: data.rating,
          status: data.status as any,
          contact: data.contact ?? "",
          notes: data.notes ?? "",
        },
      ]);
      toast.success("Dream supplier added to directory!");
    } catch (err) {
      console.error("Error adding dream vendor:", err);
      toast.error("Failed to add supplier.");
    }
  };

  const handleUpdateVendorStatus = async (id: string, status: DreamVendor["status"]) => {
    try {
      const { error } = await supabase
        .from("wedding_dream_suppliers")
        .update({ status })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setDreamVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
      toast.success("Supplier status updated!");
    } catch (err) {
      console.error("Error updating dream vendor status:", err);
      toast.error("Failed to update status.");
    }
  };

  const handleDeleteVendor = async (id: string) => {
    try {
      const { error } = await supabase
        .from("wedding_dream_suppliers")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setDreamVendors((prev) => prev.filter((v) => v.id !== id));
      toast.success("Supplier deleted.");
    } catch (err) {
      console.error("Error deleting supplier:", err);
      toast.error("Failed to delete supplier.");
    }
  };

  // --- Workspace Editing Handlers ---
  const handleUpdateBudget = async (id: string, item: Omit<BudgetItem, "id">) => {
    try {
      const { error } = await supabase
        .from("wedding_budgets")
        .update({
          category: item.category,
          name: item.name,
          estimated: item.estimated,
          actual: item.actual,
          notes: item.notes,
        })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setBudgetItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...item } : i))
      );
      toast.success("Budget expense updated!");
    } catch (err) {
      console.error("Error updating budget item:", err);
      toast.error("Failed to update budget item.");
    }
  };

  const handleUpdateGuest = async (id: string, guest: Omit<Guest, "id">) => {
    try {
      const { error } = await supabase
        .from("wedding_guests")
        .update({
          name: guest.name,
          category: guest.category,
          email: guest.email,
          phone: guest.phone,
          dietary: guest.dietary,
        })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setGuests((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...guest } : g))
      );
      toast.success("Guest details updated!");
    } catch (err) {
      console.error("Error updating guest:", err);
      toast.error("Failed to update guest details.");
    }
  };

  const handleUpdateTable = async (id: string, name: string, capacity: number) => {
    try {
      const { error } = await supabase
        .from("wedding_tables")
        .update({ name, capacity })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setTables((prev) =>
        prev.map((t) => (t.id === id ? { ...t, name, capacity } : t))
      );
      toast.success("Seating table updated!");
    } catch (err) {
      console.error("Error updating seating table:", err);
      toast.error("Failed to update seating table.");
    }
  };

  const handleUpdateTask = async (id: string, task: Omit<TaskItem, "id">) => {
    try {
      const { error } = await supabase
        .from("wedding_tasks")
        .update({
          title: task.title,
          category: task.category,
          due_date: task.dueDate,
        })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...task } : t))
      );
      toast.success("Task updated!");
    } catch (err) {
      console.error("Error updating task:", err);
      toast.error("Failed to update task details.");
    }
  };

  const handleUpdateVendor = async (id: string, vendor: Omit<DreamVendor, "id">) => {
    try {
      const { error } = await supabase
        .from("wedding_dream_suppliers")
        .update({
          name: vendor.name,
          category: vendor.category,
          rating: vendor.rating,
          status: vendor.status,
          contact: vendor.contact,
          notes: vendor.notes,
        })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setDreamVendors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...vendor } : v))
      );
      toast.success("Supplier details updated!");
    } catch (err) {
      console.error("Error updating supplier:", err);
      toast.error("Failed to update supplier details.");
    }
  };

  // --- Journal Entries Handlers ---
  const handleAddJournal = async (entry: Omit<RantReview, "id" | "date">, vendorId?: number) => {
    try {
      const { data, error } = await supabase
        .from("wedding_journal")
        .insert({
          user_id: userId,
          title: entry.title,
          content: entry.content,
          entry_type: entry.type,
          rating: entry.rating || null,
          mood: entry.mood,
          date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      let publicPublished = false;
      if (entry.type === "review" && vendorId) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData.session?.access_token ?? "";
          if (token) {
            const pubRes = await fetch("/api/reviews", {
              method: "POST",
              headers: {
                "content-type": "application/json",
                authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                vendorId: vendorId,
                rating: entry.rating || 5,
                reviewText: entry.content,
              }),
            });
            if (pubRes.ok) {
              publicPublished = true;
            } else {
              const errJson = await pubRes.json().catch(() => null);
              console.warn("Public review sync response error:", errJson);
            }
          }
        } catch (pubErr) {
          console.error("Failed to cross-publish public review:", pubErr);
        }
      }

      setJournalEntries((prev) => [
        {
          id: data.id,
          title: data.title,
          content: data.content,
          type: data.entry_type as any,
          rating: data.rating ?? undefined,
          mood: data.mood,
          date: data.date,
        },
        ...prev,
      ]);

      if (publicPublished) {
        toast.success("Journal entry recorded and published to supplier's public profile!");
      } else {
        toast.success("Journal entry recorded securely!");
      }
    } catch (err) {
      console.error("Error adding journal entry:", err);
      toast.error("Failed to record entry.");
    }
  };

  const handleDeleteJournal = async (id: string) => {
    try {
      const { error } = await supabase
        .from("wedding_journal")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setJournalEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Journal entry removed.");
    } catch (err) {
      console.error("Error deleting journal entry:", err);
      toast.error("Failed to delete entry.");
    }
  };

  // --- Notes Scratchpad Handlers ---
  const handleAddNote = async (note: Omit<NoteItem, "id" | "date">) => {
    try {
      const { data, error } = await supabase
        .from("wedding_notes")
        .insert({
          user_id: userId,
          title: note.title,
          content: note.content,
          date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      setNotes((prev) => [
        {
          id: data.id,
          title: data.title,
          content: data.content,
          date: data.date,
        },
        ...prev,
      ]);
      toast.success("Workspace note created!");
    } catch (err) {
      console.error("Error creating note:", err);
      toast.error("Failed to create note.");
    }
  };

  const handleUpdateNote = async (id: string, title: string, content: string) => {
    try {
      const { error } = await supabase
        .from("wedding_notes")
        .update({
          title,
          content,
          date: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, title, content, date: new Date().toISOString() } : n))
      );
      toast.success("Note saved!");
    } catch (err) {
      console.error("Error saving note:", err);
      toast.error("Failed to save note changes.");
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from("wedding_notes")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success("Note deleted.");
    } catch (err) {
      console.error("Error deleting note:", err);
      toast.error("Failed to delete note.");
    }
  };

  // Loading indicator rendering
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#a67c52] border-t-transparent" />
        <div className="text-[14px] text-neutral-500 font-medium font-[family-name:var(--font-plus-jakarta)] animate-pulse">Verifying account details...</div>
      </div>
    );
  }

  // Seating capacity ratio calculation
  const totalSeatingCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);
  const totalAttendingGuests = guests.filter((g) => g.rsvpStatus === "attending").length;
  const seatedGuestsCount = guests.filter((g) => g.rsvpStatus === "attending" && g.tableId).length;

  return (
    <>
      {/* Glitzy confetti animation during premium purchase celebration */}
      {confettiBurst && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden flex items-center justify-center">
          {Array.from({ length: 40 }).map((_, i) => {
            const delay = Math.random() * 2;
            const x = Math.random() * 100 - 50;
            const y = Math.random() * 100 - 50;
            return (
              <div
                key={i}
                className="absolute h-3 w-3 bg-[#bca374] rounded-full animate-ping"
                style={{
                  animationDuration: `${1.5 + Math.random()}s`,
                  left: `${50 + x}%`,
                  top: `${50 + y}%`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      )}

      <div className="min-h-screen bg-[#fafafa]">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

          {/* Main header block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/[0.04] pb-6 mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.01em] text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
                  Dashboard
                </h1>
                {isPremium ? (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#a68b6a]/15 text-[#a68b6a] text-[10px] font-black uppercase tracking-wider border border-[#a68b6a]/20 shadow-sm"
                    title="Premium Workspace Tier"
                  >
                    ✨ Premium Partner
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-500 text-[10px] font-bold uppercase tracking-wider"
                    title="Standard Workspace Tier"
                  >
                    Couple Standard
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-[14px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)]">
                Manage your saved vendors, budget planner, seating layouts, and RSVPs.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {user && (
                <a
                  href={`/moments/couple/${user.id}`}
                  className="px-4 py-2 text-[13px] font-bold text-white bg-[#a68b6a] hover:bg-[#957a5c] rounded-lg shadow-sm hover:shadow active:scale-[0.97] transition-all duration-150 font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider inline-flex items-center gap-1.5"
                >
                  <span>View Microsite</span>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-[13px] font-bold text-neutral-500 border border-neutral-200 rounded-lg hover:bg-neutral-50 active:scale-[0.97] transition-all duration-150 font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Unified Workspace Layout */}
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-[260px] shrink-0 space-y-2">
              <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-1.5">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-3 mb-2.5">
                  Wedding Tools Hub
                </div>
                {[
                  { id: "wedding_tools", label: "Wedding Journey Summary", icon: LayoutDashboard },
                  { id: "microsite_settings", label: "Wedding Page Settings", icon: Globe },
                  { id: "gift_registry", label: "Gift Registry", icon: Gift },
                  { id: "event_registration", label: "Event Registration", icon: Calendar },
                  { id: "budget_planner", label: "Budget Planner", icon: Wallet },
                  { id: "guest_list", label: "Guest List Tracker", icon: Users },
                  { id: "rsvp", label: "RSVP Manager", icon: MailOpen },
                  { id: "table_assignment", label: "Table Seating Chart", icon: Grid },
                  { id: "checklist", label: "Task Checklist", icon: CheckSquare },
                  { id: "dream_team", label: "Dream Supplier Team", icon: Award },
                  { id: "rants_reviews", label: "Rants & Reviews Log", icon: Heart },
                  { id: "notes", label: "Planning Notebook", icon: FileText },
                ].filter((tab) => tab.id !== "rsvp" || isPremium).map((tab) => {
                  const isSelected = activeTab === tab.id;
                  const Icon = tab.icon;
                  const isTabPremium = tab.id !== "wedding_tools" && tab.id !== "microsite_settings" && tab.id !== "gift_registry" && tab.id !== "event_registration";
                  const isLocked = isTabPremium && !isPremium;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold active:scale-[0.98] transition-all duration-200 text-left cursor-pointer ${isSelected
                          ? "bg-[#a68b6a] text-white shadow-[0_4px_12px_rgba(166,139,106,0.15)]"
                          : "text-neutral-500 hover:text-[#a68b6a] hover:bg-[#a68b6a]/5"
                        }`}
                    >
                      <Icon size={16} strokeWidth={isSelected ? 2.5 : 2} className={isSelected ? "text-white" : "text-neutral-400"} />
                      <span className="flex-1 truncate">{tab.label}</span>
                      {isLocked && <Lock size={12} className="text-[#a68b6a] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Dynamic Interactive Workspace Panels */}
            <main className="flex-1 min-w-0">
              <AdBanner pageContext="dashboard" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.985, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.985, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  {(() => {
                    const isTabPremium = activeTab !== "wedding_tools" && activeTab !== "microsite_settings" && activeTab !== "gift_registry" && activeTab !== "event_registration";
                    const isLocked = isTabPremium && !isPremium;

                    const renderTabContent = () => {
                      switch (activeTab) {
                        case "wedding_tools":
                          return (
                            <div className="space-y-8">
                              {isPremium ? (
                                /* Summary Widget Bento Grid */
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                  {/* Seating Assignment Widget */}
                                  <div
                                    onClick={() => handleTabChange("table_assignment")}
                                    className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.015)] transition-all cursor-pointer group hover:-translate-y-0.5 duration-300 hover:border-[#a68b6a]/30"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Seating Status</span>
                                      <Grid size={18} className="text-[#a68b6a] group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                    <div className="text-[20px] font-bold text-neutral-700 font-[family-name:var(--font-plus-jakarta)] mb-1">
                                      {seatedGuestsCount} seated / {totalAttendingGuests} attending
                                    </div>
                                    <p className="text-[11px] text-neutral-400">
                                      Capacity booked: {totalSeatingCapacity} seats
                                    </p>
                                  </div>

                                  {/* Budget Status Widget */}
                                  <div
                                    onClick={() => handleTabChange("budget_planner")}
                                    className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.015)] transition-all cursor-pointer group hover:-translate-y-0.5 duration-300 hover:border-[#a68b6a]/30"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Payment Ratio</span>
                                      <Wallet size={18} className="text-[#a68b6a] group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                    <div className="text-[20px] font-bold text-neutral-700 font-[family-name:var(--font-plus-jakarta)] mb-1">
                                      ₱{budgetItems.reduce((acc, i) => acc + (i.status === "paid" ? i.actual : 0), 0).toLocaleString()} paid
                                    </div>
                                    <p className="text-[11px] text-neutral-400">
                                      Total spent: ₱{budgetItems.reduce((acc, i) => acc + i.actual, 0).toLocaleString()}
                                    </p>
                                  </div>

                                  {/* Tasks Status Widget */}
                                  <div
                                    onClick={() => handleTabChange("checklist")}
                                    className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.015)] transition-all cursor-pointer group hover:-translate-y-0.5 duration-300 hover:border-[#a68b6a]/30"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Planning Progress</span>
                                      <CheckSquare size={18} className="text-[#a68b6a] group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                    <div className="text-[20px] font-bold text-neutral-700 font-[family-name:var(--font-plus-jakarta)] mb-1">
                                      {tasks.filter((t) => t.status === "completed").length} / {tasks.length} tasks completed
                                    </div>
                                    <p className="text-[11px] text-neutral-400">
                                      {tasks.filter((t) => t.status !== "completed").length} pending items
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <PremiumBanner />
                              )}

                              {/* Standard couples features integrated inside the Workspace Dashboard hub */}
                              <div className="space-y-8">

                                {/* Saved Vendors Section */}
                                <section>
                                  <div className="flex items-center gap-2 mb-4">
                                    <svg className="h-5 w-5 text-[#a68b6a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                    </svg>
                                    <h2 className="text-[18px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
                                      Saved Vendors
                                    </h2>
                                    <span className="text-[13px] text-neutral-400">({savedVendors.length})</span>
                                  </div>

                                  {savedVendors.length === 0 ? (
                                    <div className="rounded-xl border border-black/10 bg-white p-8 text-center">
                                      <p className="text-[13px] text-neutral-400">No saved vendors yet.</p>
                                      <a href="/suppliers" className="inline-block mt-4 px-4 py-2 bg-[#a68b6a] text-white text-[12px] font-semibold rounded-lg hover:bg-[#957a5c]">
                                        Browse Suppliers
                                      </a>
                                    </div>
                                  ) : (
                                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                      {savedVendors.map((sv) => (
                                        <VendorCard key={sv.vendor.id} vendor={sv.vendor} onRemove={() => handleRemove(sv.vendor.id)} />
                                      ))}
                                    </div>
                                  )}
                                </section>


                                {/* Active Inquiries Section */}
                                <section>
                                  <div className="flex items-center gap-2 mb-4">
                                    <svg className="h-5 w-5 text-[#a68b6a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                                    </svg>
                                    <h2 className="text-[18px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
                                      Active Inquiries
                                    </h2>
                                    <span className="text-[13px] text-neutral-400">({inquiries.length})</span>
                                  </div>
                                  {inquiries.length === 0 ? (
                                    <div className="rounded-xl border border-black/10 bg-white p-8 text-center">
                                      <p className="text-[13px] text-neutral-400">No active inquiries yet.</p>
                                    </div>
                                  ) : (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                      {inquiries.map((inq) => (
                                        <div key={inq.id} className="rounded-xl border border-black/5 bg-white p-4 shadow-sm hover:shadow-md transition-all flex gap-3">
                                          <div className="h-10 w-10 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center overflow-hidden shrink-0">
                                            {inq.vendor?.logo_url ? (
                                              <img src={inq.vendor.logo_url} alt={inq.vendor.business_name} className="h-full w-full object-cover" />
                                            ) : (
                                              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                                {inq.vendor?.business_name?.slice(0, 2) ?? "VD"}
                                              </span>
                                            )}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                              <h3 className="font-semibold text-[14px] text-[#2c2c2c] truncate font-[family-name:var(--font-noto-serif)]">
                                                {inq.vendor?.business_name ?? "Private Supplier"}
                                              </h3>
                                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${inq.status === 'new' ? 'bg-amber-50 text-amber-600 border border-amber-200/40' :
                                                  inq.status === 'replied' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/40' :
                                                    'bg-neutral-100 text-neutral-500'
                                                }`}>
                                                {inq.status}
                                              </span>
                                            </div>
                                            <p className="text-[12px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed font-[family-name:var(--font-plus-jakarta)]">
                                              {inq.message}
                                            </p>
                                            <p className="text-[10px] text-neutral-400 mt-2 font-semibold">
                                              Sent {new Date(inq.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </section>

                                {/* Booked Vendors Section */}
                                <section>
                                  <div className="flex items-center gap-2 mb-4">
                                    <svg className="h-5 w-5 text-[#a68b6a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                    </svg>
                                    <h2 className="text-[18px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
                                      Booked Vendors
                                    </h2>
                                    <span className="text-[13px] text-neutral-400">({dreamVendors.filter(v => v.status === "booked").length})</span>
                                  </div>
                                  {dreamVendors.filter(v => v.status === "booked").length === 0 ? (
                                    <div className="rounded-xl border border-black/10 bg-white p-8 text-center">
                                      <p className="text-[13px] text-neutral-400">No booked vendors yet.</p>
                                    </div>
                                  ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                      {dreamVendors.filter(v => v.status === "booked").map((s) => (
                                        <div key={s.id} className="rounded-xl border border-black/5 bg-[#fcfbf9] p-4 shadow-sm hover:shadow-md transition-all border-l-4 border-l-[#a68b6a]">
                                          <div className="flex items-start justify-between">
                                            <div>
                                              <h3 className="font-semibold text-[14px] text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
                                                {s.name}
                                              </h3>
                                              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5 font-[family-name:var(--font-plus-jakarta)]">{s.category}</p>
                                            </div>
                                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                              ✓ Booked
                                            </span>
                                          </div>
                                          {s.notes && (
                                            <p className="text-[12px] text-neutral-500 mt-2 line-clamp-1 italic font-[family-name:var(--font-plus-jakarta)]">
                                              "{s.notes}"
                                            </p>
                                          )}
                                          {s.contact && (
                                            <p className="text-[11px] text-[#a68b6a] mt-2 truncate font-[family-name:var(--font-plus-jakarta)] font-semibold">
                                              ✉ {s.contact}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </section>

                                {/* Community & Events Section */}
                                <section>
                                  <div className="flex items-center gap-2 mb-4">
                                    <svg className="h-5 w-5 text-[#a68b6a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                    </svg>
                                    <h2 className="text-[18px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
                                      Community & Events
                                    </h2>
                                  </div>
                                  
                                  <div className="grid gap-5 sm:grid-cols-2">
                                    {/* T&M Event Registration */}
                                    <a href="https://themesnmotifs.com/events" target="_blank" rel="noopener noreferrer" className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5 duration-300 hover:border-[#a68b6a]/30 flex flex-col justify-between">
                                      <div>
                                        <div className="flex items-center justify-between mb-3">
                                          <span className="text-[11px] font-bold text-[#a68b6a] uppercase tracking-wider bg-[#a68b6a]/10 px-2 py-0.5 rounded">Bridal Fairs</span>
                                          <svg className="h-5 w-5 text-neutral-400 group-hover:text-[#a68b6a] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                        </div>
                                        <h3 className="text-[16px] font-bold text-neutral-700 font-[family-name:var(--font-plus-jakarta)] mb-1">
                                          T&M Event Registration
                                        </h3>
                                        <p className="text-[12px] text-neutral-500 leading-relaxed">
                                          Register for upcoming Themes & Motifs The Wedding App bridal fairs, expos, and exclusive wedding events.
                                        </p>
                                      </div>
                                    </a>

                                    {/* Join or Start A Convo */}
                                    <a href="#" onClick={(e) => { e.preventDefault(); toast.success("Community Forum coming soon!"); }} className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5 duration-300 hover:border-[#a68b6a]/30 flex flex-col justify-between">
                                      <div>
                                        <div className="flex items-center justify-between mb-3">
                                          <span className="text-[11px] font-bold text-[#a68b6a] uppercase tracking-wider bg-[#a68b6a]/10 px-2 py-0.5 rounded">Forum</span>
                                          <svg className="h-5 w-5 text-neutral-400 group-hover:text-[#a68b6a] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                          </svg>
                                        </div>
                                        <h3 className="text-[16px] font-bold text-neutral-700 font-[family-name:var(--font-plus-jakarta)] mb-1">
                                          Join or Start A Convo
                                        </h3>
                                        <p className="text-[12px] text-neutral-500 leading-relaxed">
                                          Connect with other soon-to-weds, ask questions, and share your wedding planning journey.
                                        </p>
                                      </div>
                                    </a>
                                  </div>
                                </section>

                                {/* Recent Moments Section (Placed Last) */}
                                <section>
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                      <svg className="h-5 w-5 text-[#a68b6a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                      </svg>
                                      <h2 className="text-[18px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
                                        Recent Moments
                                      </h2>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <button
                                        type="button"
                                        onClick={handleOpenAddMoment}
                                        className="h-8 px-3 rounded-lg bg-[#a68b6a] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#957a5c] transition-colors inline-flex items-center gap-1 cursor-pointer font-[family-name:var(--font-plus-jakarta)]"
                                      >
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span>Add Moment</span>
                                      </button>
                                      <a href={user ? `/moments/couple/${user.id}` : "/moments"} className="text-sm text-[#a68b6a] hover:text-[#957a5c] font-medium font-semibold font-[family-name:var(--font-plus-jakarta)]">View All →</a>
                                    </div>
                                  </div>

                                  {recentMoments.length === 0 ? (
                                    <div className="rounded-xl border border-black/10 bg-white p-8 text-center">
                                      <p className="text-[13px] text-neutral-400">No moments yet.</p>
                                      <a href="/moments/create" className="inline-block mt-4 px-4 py-2 bg-[#a68b6a] text-white text-[12px] font-semibold rounded-lg hover:bg-[#957a5c]">
                                        Create Your First Moment
                                      </a>
                                    </div>
                                  ) : (
                                    <div className="grid gap-6 md:grid-cols-2">
                                      {recentMoments.map((moment) => {
                                        const getMomentIcon = () => {
                                          switch (moment.moment_type) {
                                            case "photo":
                                              return (
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                                </svg>
                                              );
                                            case "review":
                                              return (
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                                </svg>
                                              );
                                            case "story":
                                              return (
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                                </svg>
                                              );
                                            case "milestone":
                                              return (
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                                </svg>
                                              );
                                            default:
                                              return null;
                                          }
                                        };

                                        return (
                                          <div key={moment.id} className="bg-white rounded-xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col justify-between">
                                            {/* Header */}
                                            <div className="p-4 border-b border-gray-100">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a68b6a] to-[#957a5c] flex items-center justify-center shrink-0">
                                                    <span className="text-white font-medium text-sm">
                                                      {moment.title.charAt(0).toUpperCase()}
                                                    </span>
                                                  </div>
                                                  <div>
                                                    <h3 className="font-semibold text-[#2c2c2c]">{moment.title}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                      <span className="capitalize">{moment.moment_type}</span>
                                                      <span>•</span>
                                                      <span>{new Date(moment.created_at).toLocaleDateString()}</span>
                                                      {moment.visibility === "public" && (
                                                        <>
                                                          <span>•</span>
                                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#ecfdf3] text-[#027a48]">
                                                            Public
                                                          </span>
                                                        </>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#a68b6a]/10 text-[#a68b6a]">
                                                    {getMomentIcon()}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-4 flex-1">
                                              {moment.content && (
                                                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{moment.content}</p>
                                              )}

                                              {moment.moment_photos && moment.moment_photos.length > 0 && (
                                                <div className="mb-4 space-y-2 -mx-4">
                                                  {moment.moment_photos.map((photo: any) => (
                                                    <div key={photo.id} className="px-4">
                                                      <img
                                                        src={photo.image_url}
                                                        alt={photo.caption || "Moment photo"}
                                                        className="w-full h-auto object-contain rounded-lg"
                                                        style={{ maxHeight: 'none' }}
                                                      />
                                                      {photo.caption && (
                                                        <p className="text-sm text-gray-600 mt-2">{photo.caption}</p>
                                                      )}
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>

                                            {/* Footer with Edit button only */}
                                            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                                              <button
                                                type="button"
                                                onClick={() => handleOpenEditMoment(moment)}
                                                className="flex items-center gap-2 text-gray-600 hover:text-[#a68b6a] transition-colors font-bold text-xs uppercase tracking-wider cursor-pointer font-[family-name:var(--font-plus-jakarta)]"
                                              >
                                                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                <span>Edit Moment</span>
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </section>
                              </div>
                            </div>
                          );
                        case "budget_planner":
                          return (
                            <BudgetPlanner
                              items={budgetItems}
                              onAdd={handleAddBudget}
                              onToggleStatus={handleToggleBudgetStatus}
                              onDelete={handleDeleteBudget}
                              onUpdate={handleUpdateBudget}
                            />
                          );
                        case "guest_list":
                          return (
                            <GuestList
                              guests={guests}
                              tables={tables}
                              onAdd={handleAddGuest}
                              onUpdateRSVP={handleUpdateRSVP}
                              onDelete={handleDeleteGuest}
                              onUpdateGuest={handleUpdateGuest}
                            />
                          );
                        case "rsvp":
                          return (
                            <RSVPTracker
                              guests={guests}
                              onUpdateRSVP={handleUpdateRSVP}
                            />
                          );
                        case "table_assignment":
                          return (
                            <TableAssignment
                              guests={guests}
                              tables={tables}
                              onAddTable={handleAddTable}
                              onDeleteTable={handleDeleteTable}
                              onAssignGuest={handleAssignGuest}
                              onUpdateTable={handleUpdateTable}
                            />
                          );
                        case "checklist":
                          return (
                            <Checklist
                              tasks={tasks}
                              onAddTask={handleAddTask}
                              onToggleTask={handleToggleTask}
                              onDeleteTask={handleDeleteTask}
                              onUpdateTask={handleUpdateTask}
                            />
                          );
                        case "dream_team":
                          return (
                            <DreamTeam
                              vendors={dreamVendors}
                              onAddVendor={handleAddVendor}
                              onUpdateStatus={handleUpdateVendorStatus}
                              onDeleteVendor={handleDeleteVendor}
                              onUpdateVendor={handleUpdateVendor}
                              onNavigateToTab={(tabId, vendorName) => {
                                handleTabChange(tabId);
                                if (vendorName) setPreselectedVendorName(vendorName);
                              }}
                              savedVendors={savedVendors}
                            />
                          );
                        case "rants_reviews":
                          return (
                            <RantsReviews
                              entries={journalEntries}
                              onAddEntry={handleAddJournal}
                              onDeleteEntry={handleDeleteJournal}
                              vendors={savedVendors.map((sv) => sv.vendor)}
                              preselectedVendorName={preselectedVendorName}
                              onClearPreselected={() => setPreselectedVendorName(null)}
                            />
                          );
                        case "notes":
                          return (
                            <Notes
                              notes={notes}
                              onAddNote={handleAddNote}
                              onUpdateNote={handleUpdateNote}
                              onDeleteNote={handleDeleteNote}
                            />
                          );
                        case "microsite_settings":
                          return (
                            <MicrositeSettings
                              user={user}
                              supabase={supabase}
                            />
                          );
                        case "gift_registry":
                          return (
                            <GiftRegistry
                              userId={userId}
                              supabase={supabase}
                            />
                          );
                        case "event_registration":
                          return (
                            <EventRegistration
                              userId={userId}
                            />
                          );
                        default:
                          return null;
                      }
                    };

                    if (isLocked) {
                      return (
                        <div className="relative min-h-[450px] flex items-center justify-center rounded-2xl overflow-hidden border border-black/[0.04] bg-[#fafafa]/50 p-6 sm:p-10">
                          {/* Elegant glowing gold paywall card */}
                          <div className="relative z-10 w-full max-w-md p-8 rounded-2xl border border-[#bca374]/30 bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(188,163,116,0.12)] text-center flex flex-col items-center">
                            <div className="h-12 w-12 rounded-full bg-[#bca374]/10 flex items-center justify-center text-[#bca374] mb-4 shadow-inner">
                              <Lock size={20} className="stroke-[2.5]" />
                            </div>
                            <h3 className="text-[20px] font-bold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)] mb-2">
                              Unlock {tabNames[activeTab]}
                            </h3>
                            <p className="text-[13px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)] mb-6 leading-relaxed">
                              {tabDescriptions[activeTab] || "Get access to all our premium planning planning tools and design a flawless wedding day."}
                            </p>
                            <button
                              onClick={handleUpgrade}
                              className="w-full py-3 px-6 bg-[#a68b6a] hover:bg-[#957a5c] text-white text-[13px] font-bold uppercase tracking-wider rounded-xl shadow-[0_4px_15px_rgba(166,139,106,0.15)] hover:shadow-[0_6px_20px_rgba(166,139,106,0.2)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                            >
                              Unlock Premium Suite
                            </button>
                          </div>
                          {/* Blurred underlying layout preview */}
                          <div className="absolute inset-0 filter blur-[2px] opacity-35 pointer-events-none select-none">
                            {renderTabContent()}
                          </div>
                        </div>
                      );
                    }

                    return renderTabContent();
                  })()}
                </motion.div>
              </AnimatePresence>
            </main>

          </div>

        </div>
      </div>
      
      {/* EDIT MOMENT MODAL */}
      {editingMoment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-black/[0.04] flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">Edit Wedding Moment</h3>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5 font-[family-name:var(--font-plus-jakarta)]">
                  Type: {editingMoment.moment_type}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMoment(null)}
                className="p-1.5 rounded-lg hover:bg-black/5 text-neutral-400 hover:text-neutral-600 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveMomentChanges}>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Moment Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editMomentTitle}
                    onChange={(e) => setEditMomentTitle(e.target.value)}
                    className="w-full h-10 px-3.5 border border-black/[0.08] rounded-xl bg-[#fafafa]/50 text-xs font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
                    placeholder="e.g. Dream Proposal"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Story Content / Details
                  </label>
                  <textarea
                    rows={4}
                    value={editMomentContent}
                    onChange={(e) => setEditMomentContent(e.target.value)}
                    className="w-full p-3.5 border border-black/[0.08] rounded-xl bg-[#fafafa]/50 text-xs font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)] leading-relaxed"
                    placeholder="Write details of this moment..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Visibility Mode
                  </label>
                  <select
                    value={editMomentVisibility}
                    onChange={(e) => setEditMomentVisibility(e.target.value as any)}
                    className="w-full h-10 px-3 border border-black/[0.08] rounded-xl bg-[#fafafa]/50 text-xs font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all mb-4"
                  >
                    <option value="private">Private (Only You)</option>
                    <option value="public">Public (Everyone)</option>
                    <option value="friends">Friends & Guests</option>
                  </select>
                </div>

                {/* Previews and Image Dropzone */}
                <div className="space-y-4 pt-3 border-t border-black/[0.03]">
                  {/* Dropzone for Uploading More Pictures */}
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                      Add New Pictures
                    </label>
                    <MomentPhotoUpload
                      onFilesSelected={(files) => setNewMomentFiles(files)}
                      maxFiles={10}
                      acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-neutral-50/50 border-t border-black/[0.03] flex items-center justify-between">
                <button
                  type="button"
                  disabled={savingMoment || deletingMomentId !== null}
                  onClick={() => handleDeleteMoment(editingMoment.id)}
                  className="h-9 px-4 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  {deletingMomentId === editingMoment.id ? "Deleting..." : "Delete Moment"}
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={savingMoment || deletingMomentId !== null}
                    onClick={() => setEditingMoment(null)}
                    className="h-9 px-4 rounded-xl border border-black/10 bg-white text-xs font-bold text-neutral-500 hover:bg-neutral-50 active:scale-[0.98] transition-all uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingMoment || deletingMomentId !== null}
                    className="h-9 px-5 rounded-xl bg-[#a68b6a] hover:bg-[#957a5c] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {savingMoment ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MOMENT MODAL */}
      {showAddMomentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-black/[0.04] flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">Create New Moment</h3>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5 font-[family-name:var(--font-plus-jakarta)]">
                  Add details to your wedding feed
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMomentModal(false)}
                className="p-1.5 rounded-lg hover:bg-black/5 text-neutral-400 hover:text-neutral-600 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateMomentSubmit}>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Moment Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMomentTitle}
                    onChange={(e) => setNewMomentTitle(e.target.value)}
                    className="w-full h-10 px-3.5 border border-black/[0.08] rounded-xl bg-[#fafafa]/50 text-xs font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
                    placeholder="e.g. Dream Proposal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                      Moment Type
                    </label>
                    <select
                      value={newMomentType}
                      onChange={(e) => setNewMomentType(e.target.value as any)}
                      className="w-full h-10 px-3 border border-black/[0.08] rounded-xl bg-[#fafafa]/50 text-xs font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all"
                    >
                      <option value="photo">Photos</option>
                      <option value="story">Story</option>
                      <option value="milestone">Milestone</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                      Visibility Mode
                    </label>
                    <select
                      value={newMomentVisibility}
                      onChange={(e) => setNewMomentVisibility(e.target.value as any)}
                      className="w-full h-10 px-3 border border-black/[0.08] rounded-xl bg-[#fafafa]/50 text-xs font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all"
                    >
                      <option value="private">Private (Only You)</option>
                      <option value="public">Public (Everyone)</option>
                      <option value="friends">Friends & Guests</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Story Content / Details
                  </label>
                  <textarea
                    rows={4}
                    value={newMomentContent}
                    onChange={(e) => setNewMomentContent(e.target.value)}
                    className="w-full p-3.5 border border-black/[0.08] rounded-xl bg-[#fafafa]/50 text-xs font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)] leading-relaxed"
                    placeholder="Write details of this moment..."
                  />
                </div>

                {/* Previews and Image Dropzone */}
                {newMomentType === "photo" && (
                  <div className="space-y-4 pt-3 border-t border-black/[0.03]">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                        Upload Pictures
                      </label>
                      <MomentPhotoUpload
                        onFilesSelected={(files) => setNewMomentUploadedFiles(files)}
                        maxFiles={10}
                        acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-neutral-50/50 border-t border-black/[0.03] flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={creatingMoment}
                  onClick={() => setShowAddMomentModal(false)}
                  className="h-9 px-4 rounded-xl border border-black/10 bg-white text-xs font-bold text-neutral-500 hover:bg-neutral-50 active:scale-[0.98] transition-all uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingMoment}
                  className="h-9 px-5 rounded-xl bg-[#a68b6a] hover:bg-[#957a5c] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer"
                >
                  {creatingMoment ? "Creating..." : "Create Moment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
