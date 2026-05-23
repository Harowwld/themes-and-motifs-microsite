"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import Link from "next/link";
import { toast } from "@/lib/toast";
import { proxiedImageUrl } from "@/lib/imageSizes";

type Moment = {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  moment_type: "photo" | "review" | "story" | "milestone";
  visibility: "private" | "public" | "friends";
  created_at: string;
  updated_at: string;
  moment_photos: Array<{
    id: string;
    image_url: string;
    caption: string | null;
    upload_order: number;
  }>;
  vendor_reviews: Array<{
    id: string;
    vendor_id: number;
    overall_rating: number;
    quality_rating: number;
    communication_rating: number;
    value_rating: number;
    review_text: string | null;
    would_recommend: boolean;
    vendors: {
      business_name: string;
      slug: string;
      logo_url: string | null;
    };
  }>;
};

type EntourageMember = {
  name: string;
  role: string;
  side: "bride" | "groom" | "general";
};

type Sponsor = {
  name: string;
  type: "principal" | "secondary";
};

type RegistryItem = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  logo?: string | null;
  vendorName?: string;
  discount?: number | null;
  contribution: number;
  target: number;
};

function MomentCard({ moment, onDelete, isOwner }: { moment: Moment; onDelete: (id: string) => void; isOwner: boolean }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!confirm("Are you sure you want to delete this moment?")) return;
    setDeletingId(moment.id);
    try {
      const token = (await createSupabaseBrowserClient().auth.getSession()).data.session?.access_token;
      const response = await fetch(`/api/moments/${moment.id}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        onDelete(moment.id);
        toast.success("Moment deleted successfully.");
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete moment (${response.status})`);
      }
    } catch (error) {
      console.error("Error deleting moment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete moment.");
    } finally {
      setDeletingId(null);
    }
  };

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
    <div className="bg-white rounded-xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.04)] transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a68b6a] to-[#957a5c] flex items-center justify-center">
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
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#a68b6a]/10 text-[#a68b6a]">
              {getMomentIcon()}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {moment.content && (
          <p className="text-gray-700 mb-4 whitespace-pre-wrap">{moment.content}</p>
        )}

        {moment.moment_photos && moment.moment_photos.length > 0 && (
          <div className="mb-4 space-y-2 -mx-4">
            {moment.moment_photos.map((photo) => (
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

        {moment.vendor_reviews && moment.vendor_reviews.length > 0 && (
          <div className="mb-4">
            {moment.vendor_reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-lg p-3 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm text-gray-900">{review.vendors.business_name}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${i < review.overall_rating ? "text-yellow-400" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                {review.review_text && (
                  <p className="text-sm text-gray-600">{review.review_text}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/moments/${moment.id}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-[#a68b6a] transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-sm font-medium">View</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-[#a68b6a] transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm font-medium">Like</span>
            </button>
          </div>
          {isOwner && (
            <button
              onClick={handleDeleteConfirm}
              disabled={deletingId === moment.id}
              className="text-[#b42318] hover:text-[#9a1d14] transition-colors text-sm font-bold"
            >
              {deletingId === moment.id ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CoupleMicrositePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  
  // App context states
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwner = useMemo(() => {
    return !!(user && user.id === userId);
  }, [user, userId]);

  // Tab State matching mockup exactly
  const [activeTab, setActiveTab] = useState<"our_story" | "entourage" | "sponsors" | "our_message" | "registry">("our_story");

  // Moments feed filter states
  const [filter, setFilter] = useState<"all" | "private" | "public">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Simulated RSVP modal controls
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<"attending" | "declined">("attending");
  const [rsvpMeal, setRsvpMeal] = useState("beef");
  const [rsvpDietary, setRsvpDietary] = useState("");
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);

  // Dynamic guest search and selection states
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [selectedGuestTable, setSelectedGuestTable] = useState<string | null>(null);

  // Debounced search for guests by name
  useEffect(() => {
    if (selectedGuestId) return; // Already selected, skip searching
    if (rsvpName.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/rsvp?userId=${userId}&name=${encodeURIComponent(rsvpName)}`);
        const data = await res.json();
        if (data.guests) {
          setSearchResults(data.guests);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Error searching guests:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [rsvpName, userId, selectedGuestId]);

  const handleSelectGuest = (guest: any) => {
    setSelectedGuestId(guest.id);
    setRsvpName(guest.name);
    setRsvpEmail(guest.email || "");
    setRsvpStatus(guest.rsvp_status === "pending" ? "attending" : guest.rsvp_status);
    setRsvpDietary(guest.dietary || "");
    setSelectedGuestTable(guest.wedding_tables?.name || null);
    setSearchResults([]);
  };

  // Real-time ticking countdown states
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false
  });

  // Mock registries data
  const [registryItems, setRegistryItems] = useState<RegistryItem[]>([]);
  const [customCash, setCustomCash] = useState("");

  // Static mockup databases for beautiful listing inside tabs
  const entourageList = useMemo<EntourageMember[]>(() => {
    if (profile?.entourage && Array.isArray(profile.entourage) && profile.entourage.length > 0) {
      return profile.entourage as EntourageMember[];
    }
    return [
      { name: "John Sterling", role: "Best Man", side: "groom" },
      { name: "Clara Bennett", role: "Maid of Honor", side: "bride" },
      { name: "Ethan Vance", role: "Groomsman", side: "groom" },
      { name: "Sophia Davis", role: "Bridesmaid", side: "bride" },
      { name: "Lucas Reyes", role: "Groomsman", side: "groom" },
      { name: "Isabella Cruz", role: "Bridesmaid", side: "bride" },
      { name: "Liam Anderson", role: "Ring Bearer", side: "general" },
      { name: "Emma Watson", role: "Flower Girl", side: "general" }
    ];
  }, [profile?.entourage]);

  const sponsorsList = useMemo<Sponsor[]>(() => {
    if (profile?.sponsors && Array.isArray(profile.sponsors) && profile.sponsors.length > 0) {
      return profile.sponsors as Sponsor[];
    }
    return [
      { name: "Mr. Edward Harrison", type: "principal" },
      { name: "Mrs. Evelyn Carter", type: "principal" },
      { name: "Mr. Christopher Bennett", type: "principal" },
      { name: "Mrs. Natalia Sterling", type: "principal" },
      { name: "Mr. Julian Vance (Candle)", type: "secondary" },
      { name: "Mrs. Elena Thorne (Veil)", type: "secondary" },
      { name: "Mr. Marcus Cruz (Cord)", type: "secondary" }
    ];
  }, [profile?.sponsors]);

  // Fetch wedding moments directly for this specific couple
  const fetchMoments = useCallback(async () => {
    if (!userId) return;
    try {
      let query = supabase
        .from("wedding_moments")
        .select(`
          *,
          moment_photos(id, image_url, caption, upload_order),
          vendor_reviews(
            id, 
            vendor_id, 
            overall_rating, 
            quality_rating, 
            communication_rating, 
            value_rating, 
            review_text, 
            would_recommend,
            vendors(business_name, slug)
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (typeFilter !== "all") {
        query = query.eq("moment_type", typeFilter);
      }

      // Filter by visibility:
      // If the logged in user is the owner, they can see everything, or filter as they requested
      // Otherwise, they can ONLY see public moments
      const isOwner = user && user.id === userId;
      if (!isOwner) {
        query = query.eq("visibility", "public");
      } else if (filter !== "all") {
        query = query.eq("visibility", filter);
      }

      const { data, error } = await query;
      if (!error && data) {
        setMoments(data as any);
      }
    } catch (error) {
      console.error("Error fetching moments:", error);
    } finally {
      setLoading(false);
    }
  }, [user, userId, filter, typeFilter, supabase]);

  // Fetch dynamic registry items from the database saved_promos
  const fetchRegistry = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("saved_promos")
        .select(`
          promo_id,
          target_amount,
          contribution,
          created_at,
          promo:promos (
            id,
            title,
            summary,
            image_url,
            discount_percentage,
            vendor:vendor_id (
              business_name,
              logo_url
            )
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedItems = (data ?? []).map((item: any) => {
        const promoRaw = item.promo;
        let promo = promoRaw;
        if (Array.isArray(promoRaw)) {
          promo = promoRaw[0] ?? null;
        }
        if (promo && Array.isArray(promo.vendor)) {
          promo.vendor = promo.vendor[0] ?? null;
        }
        return {
          id: String(item.promo_id),
          name: promo?.title ?? "Registry Item",
          price: Number(item.target_amount),
          image: promo?.image_url ? proxiedImageUrl(promo.image_url) : null,
          logo: promo?.vendor?.logo_url ? proxiedImageUrl(promo.vendor.logo_url) : null,
          vendorName: promo?.vendor?.business_name ?? "Marketplace Supplier",
          discount: promo?.discount_percentage ?? null,
          contribution: Number(item.contribution),
          target: Number(item.target_amount)
        };
      });

      setRegistryItems(formattedItems);
    } catch (err) {
      console.error("Error fetching registry items:", err);
    }
  }, [userId, supabase]);

  // Auth, Profile checks
  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!cancelled) {
        setUser(session?.user);
        
        // Fetch soon-to-wed profile details for the couple ID in URL
        if (userId) {
          try {
            const { data: profileData, error: profileErr } = await supabase
              .from("soon_to_wed_profiles")
              .select("*")
              .eq("user_id", userId)
              .maybeSingle();

            if (!profileErr && profileData && !cancelled) {
              setProfile(profileData);
            }
          } catch (error) {
            console.error('Error checking user profile:', error);
          }
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [supabase, userId]);

  useEffect(() => {
    if (userId) {
      fetchMoments();
      fetchRegistry();
    }
  }, [userId, fetchMoments, fetchRegistry]);

  // Ticking countdown timer logic
  useEffect(() => {
    const targetWeddingDate = profile?.wedding_date 
      ? new Date(profile.wedding_date) 
      : new Date("2027-06-05T15:00:00"); // Mockup default: June 5, 2027

    const updateTimer = () => {
      const now = new Date();
      const difference = targetWeddingDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isPast: false });
      }
    };

    updateTimer(); // Tick immediately
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [profile?.wedding_date]);

  const handleDeleteMoment = (momentId: string) => {
    setMoments((prev) => prev.filter((m) => m.id !== momentId));
  };

  // Dynamic nicknames computation
  const displayTitle = useMemo(() => {
    if (profile?.groom_nickname && profile?.bride_nickname) {
      return `${profile.groom_nickname} & ${profile.bride_nickname}`;
    }
    if (profile?.groom_nickname) return profile.groom_nickname;
    if (profile?.bride_nickname) return profile.bride_nickname;
    return "Wilson & Diana";
  }, [profile]);

  const displayDateStr = useMemo(() => {
    if (profile?.wedding_date) {
      if (profile.wedding_date_public || isOwner) {
        const d = new Date(profile.wedding_date);
        return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      }
      return "Date Private";
    }
    return "Saturday, June 5, 2027";
  }, [profile, isOwner]);

  const displayLocation = useMemo(() => {
    const loc = profile?.location || "Peoria, Illinois";
    const venue = profile?.wedding_venue_area;
    if (venue && (profile?.wedding_venue_public || isOwner)) {
      return `${venue}, ${loc}`;
    }
    return loc;
  }, [profile, isOwner]);

  // Update browser document/tab title dynamically based on couple details loaded from database
  useEffect(() => {
    if (profile) {
      const cleanDate = profile.wedding_date 
        ? new Date(profile.wedding_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : "TBA";
      const cleanLoc = profile.location || "TBA";
      document.title = `${displayTitle} | Wedding on ${cleanDate} at ${cleanLoc}`;
    } else {
      document.title = "Wedding Microsite | Themes & Motifs";
    }
  }, [profile, displayTitle]);


  // Gift registry actions - saves contribution to DB
  const handleContribute = async (itemId: string, amount: number) => {
    const promoId = parseInt(itemId);
    if (isNaN(promoId)) return;

    try {
      const targetItem = registryItems.find(i => i.id === itemId);
      if (!targetItem) return;

      const newContribution = Math.min(targetItem.target, targetItem.contribution + amount);

      const { error } = await supabase
        .from("saved_promos")
        .update({ contribution: newContribution })
        .eq("user_id", userId)
        .eq("promo_id", promoId);

      if (error) throw error;

      setRegistryItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, contribution: newContribution }
            : item
        )
      );
      toast.success(`✨ Thank you for your generous contribution of ₱${amount.toLocaleString()}!`);
    } catch (err) {
      console.error("Error saving contribution:", err);
      toast.error("Failed to save contribution.");
    }
  };

  const handleCashGiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(customCash);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    toast.success(`✨ Thank you for contributing ₱${amount.toLocaleString()} to our Honeymoon & Home Fund!`);
    setCustomCash("");
  };

  // RSVP Form handler
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuestId) {
      toast.error("Please search and select your name from the suggestion list to RSVP.");
      return;
    }
    setRsvpSubmitting(true);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestId: selectedGuestId,
          rsvpStatus,
          email: rsvpEmail,
          dietary: rsvpDietary,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit RSVP");
      }

      toast.success(`🎉 RSVP successfully recorded! Thank you, ${rsvpName}!`);
      setRsvpOpen(false);
      
      // Clear form and states
      setRsvpName("");
      setRsvpEmail("");
      setRsvpDietary("");
      setSelectedGuestId(null);
      setSearchResults([]);
      setSelectedGuestTable(null);
    } catch (error: any) {
      console.error("Error submitting RSVP:", error);
      toast.error(error.message || "Failed to submit RSVP. Please try again.");
    } finally {
      setRsvpSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a68b6a]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Import script-style Google fonts dynamically */}
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />

      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-10 sm:py-14">
        
        {/* Back button */}
        <div className="mb-6 select-none max-w-2xl mx-auto">
          <Link
            href="/moments"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Public Couples Feed
          </Link>
        </div>

        {/* Setup notice banner for logged in owners with empty profile names */}
        {isOwner && (!profile?.groom_nickname || !profile?.bride_nickname) && (
          <div className="mb-6 max-w-2xl mx-auto bg-amber-50/80 border border-amber-200/60 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] select-none">
            <div className="flex gap-4">
              <span className="text-2xl shrink-0">👋</span>
              <div className="space-y-1">
                <h4 className="font-extrabold text-[14px] text-amber-800 font-[family-name:var(--font-plus-jakarta)]">
                  Personalize Your Wedding Microsite!
                </h4>
                <p className="text-[12.5px] text-amber-700 leading-relaxed font-[family-name:var(--font-plus-jakarta)] font-medium">
                  Your profile nicknames are currently unset, so we are displaying our default theme placeholder names (<strong>"Wilson &amp; Diana"</strong>). Please go to your <Link href="/dashboard" className="underline font-bold hover:text-amber-900 transition-colors">Dashboard Settings</Link> to configure your nicknames, wedding date, and ceremony location!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mockup Top Brand Script Header */}
        <div className="text-center mb-6 pt-4">
          <h1 className="text-[52px] sm:text-[68px] font-normal text-[#2c2c2c] leading-tight select-none" style={{ fontFamily: "'Great Vibes', cursive" }}>
            {displayTitle}
          </h1>
        </div>

        {/* Tab Navigation header styled beautifully */}
        <div className="flex justify-center border-b border-black/[0.06] mb-10 overflow-x-auto select-none">
          <nav className="flex gap-4 sm:gap-8 px-2 pb-0.5 whitespace-nowrap scrollbar-none font-[family-name:var(--font-plus-jakarta)]">
            {[
              { id: "our_story", label: "Our Story" },
              { id: "entourage", label: "Entourage" },
              { id: "sponsors", label: "Sponsors" },
              { id: "our_message", label: "Our Message" },
              { id: "registry", label: "Registry" }
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-3 text-[13px] sm:text-[14px] font-bold border-b-2 transition-all duration-300 uppercase tracking-wider cursor-pointer ${
                    isSelected
                      ? "border-[#a68b6a] text-[#a68b6a]"
                      : "border-transparent text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dynamic Tab Contents */}
        {activeTab === "our_story" && (
          <div className="space-y-12">
            
            {/* The exact main layout card from the mockup */}
            <div className="bg-white border border-black/5 rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] max-w-2xl mx-auto flex flex-col items-center">
              
              {/* Couple Main Portrait Frame */}
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-6 bg-neutral-100 relative group">
                <img
                  src={profile?.profile_photo_url || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200"}
                  alt="Wedding Couple Portrait"
                  className="w-full h-full object-cover select-none filter brightness-95 group-hover:scale-[1.01] transition-transform duration-700"
                  loading="eager"
                />
              </div>

              {/* Peoria, Illinois and Date Section */}
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-[22px] sm:text-[26px] font-bold text-neutral-800 font-[family-name:var(--font-noto-serif)]">
                  {displayDateStr}
                </h2>
                <p className="text-[14px] font-semibold text-neutral-500 font-[family-name:var(--font-plus-jakarta)] uppercase tracking-widest">
                  {displayLocation}
                </p>

                {/* Real-time Dynamic Ticking Countdown */}
                <div className="pt-2 select-none">
                  {timeLeft.isPast ? (
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 text-[12px] font-bold uppercase tracking-wider">
                      💍 Just Married! 🎉
                    </div>
                  ) : (
                    <div className="inline-flex flex-wrap justify-center gap-3 bg-[#fafafa] border border-black/[0.03] px-5 py-2.5 rounded-xl font-[family-name:var(--font-plus-jakarta)]">
                      <div className="text-center min-w-[50px]">
                        <span className="block text-[18px] sm:text-[20px] font-extrabold text-[#a68b6a]">{timeLeft.days}</span>
                        <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wide">Days</span>
                      </div>
                      <span className="text-neutral-300 font-light mt-0.5 text-lg select-none">:</span>
                      <div className="text-center min-w-[40px]">
                        <span className="block text-[18px] sm:text-[20px] font-extrabold text-[#a68b6a]">{String(timeLeft.hours).padStart(2, "0")}</span>
                        <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wide">Hrs</span>
                      </div>
                      <span className="text-neutral-300 font-light mt-0.5 text-lg select-none">:</span>
                      <div className="text-center min-w-[40px]">
                        <span className="block text-[18px] sm:text-[20px] font-extrabold text-[#a68b6a]">{String(timeLeft.minutes).padStart(2, "0")}</span>
                        <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wide">Mins</span>
                      </div>
                      <span className="text-neutral-300 font-light mt-0.5 text-lg select-none">:</span>
                      <div className="text-center min-w-[40px]">
                        <span className="block text-[18px] sm:text-[20px] font-extrabold text-[#a68b6a]">{String(timeLeft.seconds).padStart(2, "0")}</span>
                        <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wide">Secs</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RSVP Mockup pill outline button */}
              <div className="mb-6 select-none">
                <button
                  onClick={() => setRsvpOpen(true)}
                  className="px-8 py-2.5 border border-[#a68b6a] text-[#a68b6a] text-[13px] font-bold rounded-full uppercase tracking-widest hover:bg-[#a68b6a] hover:text-white transition-all duration-300 cursor-pointer shadow-sm hover:shadow"
                >
                  RSVP
                </button>
              </div>

              {/* Invitation Subtext */}
              <div className="text-center max-w-md border-t border-black/[0.04] pt-5">
                <p className="text-[13px] sm:text-[14px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)] leading-relaxed italic">
                  We joyfully invite you to attend our wedding ceremony! Reception and dancing to follow.
                </p>
              </div>

            </div>

            {/* Our Love Story Section under the main card instead of Wedding Moments Feed */}
            <div className="max-w-2xl mx-auto border-t border-black/[0.05] pt-10">
              <div className="bg-white border border-black/5 rounded-2xl p-6 sm:p-10 shadow-sm relative select-none">
                <span className="absolute top-4 left-6 text-[#a68b6a]/10 text-[80px] leading-none pointer-events-none select-none font-serif">♥</span>
                <div className="text-center mb-6">
                  <h3 className="text-[28px] font-normal text-[#2c2c2c] leading-tight select-none font-[family-name:var(--font-noto-serif)]" style={{ fontFamily: "'Great Vibes', cursive" }}>
                    Our Love Story
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-widest mt-1 font-[family-name:var(--font-plus-jakarta)]">
                    How it all began
                  </p>
                </div>
                
                <div className="relative z-10 text-center space-y-5 font-[family-name:var(--font-plus-jakarta)] text-neutral-600 leading-relaxed text-[13px] sm:text-[14px] max-w-xl mx-auto whitespace-pre-line">
                  {profile?.our_story_text ? (
                    <p className="text-neutral-600 leading-relaxed">{profile.our_story_text}</p>
                  ) : (
                    <>
                      <p>
                        Our story began like many great adventures—unexpectedly, beautifully, and at the perfect moment. From our first shared laughter to the quiet, everyday moments that followed, we quickly realized that we had found our partner in life and in love.
                      </p>
                      <p>
                        Over the years, we have built a beautiful tapestry of memories, support, and dreams. Now, as we stand on the threshold of our forever, we are overjoyed to write this next, most sacred chapter together in the presence of our dearest family and friends.
                      </p>
                      <p>
                        Thank you for being a part of our journey, and for celebrating the love we share. We can't wait to celebrate our union with all of you!
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Entourage Tab Directory */}
        {activeTab === "entourage" && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center max-w-md mx-auto">
              <h3 className="text-[20px] font-bold text-neutral-800 font-[family-name:var(--font-noto-serif)]">
                The Wedding Party
              </h3>
              <p className="text-[12px] text-neutral-400 font-[family-name:var(--font-plus-jakarta)] mt-1">
                Meet the family and beloved friends supporting our big union
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 select-none">
              {entourageList.map((member, idx) => (
                <div key={idx} className="bg-white border border-black/5 rounded-xl p-4 shadow-sm text-center flex flex-col items-center hover:shadow-md transition-all">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a68b6a]/15 to-[#a68b6a]/5 border border-[#a68b6a]/20 flex items-center justify-center mb-3">
                    <span className="text-[#a68b6a] font-black text-lg">
                      {member.name.split(" ").map(n => n.charAt(0)).join("")}
                    </span>
                  </div>
                  <h4 className="font-bold text-[14px] text-neutral-800 font-[family-name:var(--font-plus-jakarta)] leading-tight">{member.name}</h4>
                  <p className="text-[11px] text-[#a68b6a] font-bold uppercase tracking-wider mt-1.5">{member.role}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide mt-2 ${
                    member.side === "bride" ? "bg-rose-50 text-rose-600" :
                    member.side === "groom" ? "bg-blue-50 text-blue-600" :
                    "bg-neutral-100 text-neutral-500"
                  }`}>
                    {member.side === "general" ? "Attendant" : `${member.side}'s side`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sponsors Tab Directory */}
        {activeTab === "sponsors" && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center max-w-md mx-auto">
              <h3 className="text-[20px] font-bold text-neutral-800 font-[family-name:var(--font-noto-serif)]">
                Our Sponsors
              </h3>
              <p className="text-[12px] text-neutral-400 font-[family-name:var(--font-plus-jakarta)] mt-1">
                With gratitude to our respected principal and secondary sponsors
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 select-none">
              
              {/* Principal Sponsors Column */}
              <div className="bg-white border border-black/5 rounded-xl p-5 shadow-sm space-y-4">
                <h4 className="font-bold text-[14px] text-[#a68b6a] font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider border-b border-black/[0.04] pb-2">
                  Principal Sponsors
                </h4>
                <ul className="space-y-3">
                  {sponsorsList.filter(s => s.type === "principal").map((sponsor, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#a68b6a]" />
                      <span className="text-[13px] font-semibold text-neutral-700">{sponsor.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Secondary Sponsors Column */}
              <div className="bg-white border border-black/5 rounded-xl p-5 shadow-sm space-y-4">
                <h4 className="font-bold text-[14px] text-[#a68b6a] font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider border-b border-black/[0.04] pb-2">
                  Secondary Sponsors
                </h4>
                <ul className="space-y-3">
                  {sponsorsList.filter(s => s.type === "secondary").map((sponsor, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#a68b6a]" />
                      <span className="text-[13px] font-semibold text-neutral-700">{sponsor.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* Our Message Tab Directory */}
        {activeTab === "our_message" && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center max-w-md mx-auto">
              <h3 className="text-[20px] font-bold text-neutral-800 font-[family-name:var(--font-noto-serif)]">
                A Letter to Our Guests
              </h3>
              <p className="text-[12px] text-neutral-400 font-[family-name:var(--font-plus-jakarta)] mt-1">
                A special welcome from the bride and groom
              </p>
            </div>

            <div className="bg-white border border-black/5 rounded-2xl p-6 sm:p-10 shadow-sm max-w-lg mx-auto relative select-none">
              {/* Elegant floating decorative quote mark */}
              <span className="absolute top-4 left-6 text-[#a68b6a]/10 text-[80px] leading-none pointer-events-none select-none font-serif">“</span>
              
              <div className="relative z-10 text-center space-y-5 font-[family-name:var(--font-plus-jakarta)] text-neutral-600 leading-relaxed text-[13px] sm:text-[14px]">
                <p className="font-bold text-neutral-800 text-[15px] sm:text-[16px] mb-4">Dear Family and Friends,</p>
                {profile?.our_message ? (
                  <p className="whitespace-pre-line text-neutral-600 leading-relaxed">{profile.our_message}</p>
                ) : (
                  <>
                    <p>
                      We are incredibly blessed to have you in our lives. As we embark on this beautiful journey of marriage, we want to express our deepest gratitude for your love, support, and friendship.
                    </p>
                    <p>
                      Our wedding day is not just a celebration of our love, but a celebration of the community that has shaped who we are. Each of you has left an indelible mark on our hearts, and we cannot imagine our big day without you.
                    </p>
                    <p>
                      Thank you for being our mentors, our guides, and our biggest cheerleaders. We look forward to creating unforgettable memories together!
                    </p>
                  </>
                )}
                
                <div className="pt-6 border-t border-black/[0.04] mt-6">
                  <p className="text-[12px] text-neutral-400 uppercase tracking-widest font-bold">With all our love,</p>
                  <p className="text-[36px] text-[#a68b6a] leading-none mt-3" style={{ fontFamily: "'Great Vibes', cursive" }}>
                    {displayTitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registry Tab Directory */}
        {activeTab === "registry" && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center max-w-md mx-auto">
              <h3 className="text-[20px] font-bold text-neutral-800 font-[family-name:var(--font-noto-serif)]">
                Our Gift Registry
              </h3>
              <p className="text-[12px] text-neutral-400 font-[family-name:var(--font-plus-jakarta)] mt-1">
                Your presence is our greatest gift, but if you wish to contribute to our future home:
              </p>
            </div>

            {/* Custom Cash Fund Honeymoon Contribution Card */}
            <div className="bg-gradient-to-br from-[#fafafa] to-white border border-[#a68b6a]/15 rounded-xl p-5 shadow-sm max-w-md mx-auto">
              <div className="text-center space-y-1 mb-4 select-none">
                <span className="text-2xl">✈️🏡</span>
                <h4 className="font-bold text-[14px] text-neutral-800 font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider">Honeymoon & Future Home Fund</h4>
                <p className="text-[11px] text-neutral-400">Contribute a custom gift value securely via bank transfer coordinates</p>
              </div>
              <form onSubmit={handleCashGiftSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-neutral-400 text-[13px] font-bold">₱</span>
                    <input
                      type="number"
                      required
                      placeholder="Enter amount (e.g. 5000)"
                      value={customCash}
                      onChange={(e) => setCustomCash(e.target.value)}
                      className="w-full h-10 pl-7 pr-3 border border-black/[0.08] rounded-lg bg-white text-[13px] font-semibold outline-none focus:border-[#a68b6a] transition-all font-[family-name:var(--font-plus-jakarta)]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-10 px-5 bg-[#a68b6a] text-white text-[12px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#957a5c] transition-colors cursor-pointer"
                  >
                    Send Gift
                  </button>
                </div>
              </form>
            </div>

            {/* Registry Grid List */}
            {registryItems.length === 0 ? (
              <div className="bg-white border border-black/5 rounded-xl p-8 text-center max-w-md mx-auto space-y-3">
                <span className="text-3xl block">🎁✨</span>
                <h4 className="font-bold text-[15px] text-neutral-800 font-[family-name:var(--font-plus-jakarta)]">Our Registry is under preparation</h4>
                <p className="text-[12.5px] text-neutral-400 font-[family-name:var(--font-plus-jakarta)] leading-relaxed">
                  We are currently choosing our registry items from the Marketplace. Please check back later!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {registryItems.map((item) => {
                  const percent = (item.contribution / item.target) * 100;
                  const isFullyFunded = item.contribution >= item.target;
                  return (
                    <div key={item.id} className="bg-white border border-black/5 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-3 select-none">
                          <div className="w-12 h-12 rounded-lg bg-[#a68b6a]/10 overflow-hidden flex items-center justify-center shrink-0 border border-black/5">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-xl">🎁</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            {item.vendorName && (
                              <span className="text-[10px] font-bold text-[#a68b6a] uppercase tracking-wider block mb-0.5 truncate">{item.vendorName}</span>
                            )}
                            <h4 className="font-bold text-[13px] text-neutral-800 truncate font-[family-name:var(--font-plus-jakarta)] leading-tight">{item.name}</h4>
                            <span className="text-[12px] font-semibold text-[#a68b6a] mt-0.5 block">₱{item.price.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Funding Progress Bar */}
                        <div className="space-y-1 mb-4 select-none">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-neutral-400">
                            <span>Funded Ratio</span>
                            <span>₱{item.contribution.toLocaleString()} / ₱{item.target.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#a68b6a] to-[#957a5c] transition-all duration-500" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </div>

                      {isFullyFunded ? (
                        <span className="w-full text-center py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[11px] font-bold uppercase tracking-wider select-none">
                          ✓ Fully Gifted
                        </span>
                      ) : (
                        <div className="flex gap-2 select-none">
                          <button
                            onClick={() => handleContribute(item.id, 1000)}
                            className="flex-1 py-2 border border-[#a68b6a]/30 text-[#a68b6a] text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#a68b6a]/5 transition-colors cursor-pointer"
                          >
                            + ₱1K
                          </button>
                          <button
                            onClick={() => handleContribute(item.id, 5000)}
                            className="flex-1 py-2 bg-[#a68b6a] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#957a5c] transition-colors cursor-pointer"
                          >
                            + ₱5K
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Simulated Interactive RSVP Form Modal */}
      {rsvpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn select-none">
          <div className="bg-white border border-black/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            
            {/* Close modal */}
            <button
              onClick={() => setRsvpOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 text-neutral-400 hover:text-neutral-600 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-all cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <span className="text-3xl">💌</span>
              <h3 className="text-[18px] font-bold text-neutral-800 font-[family-name:var(--font-noto-serif)] mt-2">
                Join Our Big Day
              </h3>
              <p className="text-[12px] text-neutral-400 mt-1 font-[family-name:var(--font-plus-jakarta)]">
                Confirm your attendance details for our wedding
              </p>
            </div>

            <form onSubmit={handleRsvpSubmit} className="space-y-4">
              <div className="relative">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Your Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Search your name (e.g. Amelia Watson)"
                    value={rsvpName}
                    onChange={(e) => {
                      setRsvpName(e.target.value);
                      if (selectedGuestId) {
                        setSelectedGuestId(null);
                        setSelectedGuestTable(null);
                      }
                    }}
                    className={`w-full h-10 pl-3 pr-10 border rounded-lg bg-[#fafafa]/50 text-[13px] font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)] ${
                      selectedGuestId ? "border-emerald-500/50 focus:border-emerald-500 bg-emerald-50/10" : "border-black/[0.08]"
                    }`}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-2.5">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-[#a68b6a]"></div>
                    </div>
                  )}
                  {selectedGuestId && !isSearching && (
                    <div className="absolute right-3 top-2.5 text-emerald-500" title="Invitation Found!">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Selected Guest details indicator */}
                {selectedGuestId && (
                  <p className="text-[11px] text-emerald-600 font-bold mt-1 font-[family-name:var(--font-plus-jakarta)]">
                    ✓ Invitation verified! Please confirm details below.
                  </p>
                )}

                {/* Dropdown search results */}
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-black/10 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50 p-1.5 space-y-1 animate-fadeIn">
                    {searchResults.map((guest) => (
                      <button
                        key={guest.id}
                        type="button"
                        onClick={() => handleSelectGuest(guest)}
                        className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-[#a68b6a]/5 hover:text-[#a68b6a] transition-all flex items-center justify-between group"
                      >
                        <div>
                          <span className="text-neutral-800 group-hover:text-[#a68b6a] font-bold">{guest.name}</span>
                          <span className="text-[9px] uppercase tracking-wider text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded ml-2 font-bold group-hover:bg-[#a68b6a]/10 group-hover:text-[#a68b6a]">
                            {guest.category || "Guest"}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-medium group-hover:text-[#a68b6a]">
                          Select →
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* No results prompt */}
                {!selectedGuestId && rsvpName.trim().length >= 3 && searchResults.length === 0 && !isSearching && (
                  <p className="text-[11px] text-amber-600 font-medium mt-1 font-[family-name:var(--font-plus-jakarta)] leading-normal">
                    ⚠ No match found. Enter your full name exactly as written on your invitation.
                  </p>
                )}
                
                {/* Initial guide text */}
                {!selectedGuestId && rsvpName.trim().length < 3 && (
                  <p className="text-[10px] text-neutral-400 font-medium mt-1 font-[family-name:var(--font-plus-jakarta)] leading-normal">
                    Type at least 3 characters to search the guest list.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. amelia@gmail.com"
                  value={rsvpEmail}
                  onChange={(e) => setRsvpEmail(e.target.value)}
                  className="w-full h-10 px-3 border border-black/[0.08] rounded-lg bg-[#fafafa]/50 text-[13px] font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Will you attend? *</label>
                  <select
                    value={rsvpStatus}
                    onChange={(e) => setRsvpStatus(e.target.value as any)}
                    className="w-full h-10 px-2 border border-black/[0.08] rounded-lg bg-[#fafafa]/50 text-[13px] font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all"
                  >
                    <option value="attending">Yes, gladly!</option>
                    <option value="declined">Regretfully, no</option>
                  </select>
                </div>

                {rsvpStatus === "attending" && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Meal Choice</label>
                    <select
                      value={rsvpMeal}
                      onChange={(e) => setRsvpMeal(e.target.value)}
                      className="w-full h-10 px-2 border border-black/[0.08] rounded-lg bg-[#fafafa]/50 text-[13px] font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all"
                    >
                      <option value="beef">Roasted Beef</option>
                      <option value="fish">Baked Salmon</option>
                      <option value="chicken">Truffle Chicken</option>
                      <option value="vegetarian">Vegan Wellington</option>
                    </select>
                  </div>
                )}
              </div>

              {rsvpStatus === "attending" && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Dietary Restrictions / Allergies</label>
                  <input
                    type="text"
                    placeholder="e.g. Peanut allergy, gluten-free"
                    value={rsvpDietary}
                    onChange={(e) => setRsvpDietary(e.target.value)}
                    className="w-full h-10 px-3 border border-black/[0.08] rounded-lg bg-[#fafafa]/50 text-[13px] font-semibold outline-none focus:border-[#a68b6a] focus:bg-white transition-all font-[family-name:var(--font-plus-jakarta)]"
                  />
                </div>
              )}

              {rsvpStatus === "attending" && selectedGuestTable && (
                <div className="p-3 rounded-xl border border-[#a68b6a]/20 bg-[#a68b6a]/5 flex items-start gap-2.5">
                  <span className="text-sm mt-0.5 select-none">📍</span>
                  <div>
                    <h4 className="text-[10px] font-bold text-neutral-700 font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider">
                      Your Reception Seating
                    </h4>
                    <p className="text-[12px] text-neutral-500 font-semibold font-[family-name:var(--font-plus-jakarta)] mt-0.5">
                      You are assigned to <strong className="text-[#a68b6a]">{selectedGuestTable}</strong>.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={rsvpSubmitting}
                className="w-full h-11 bg-[#a68b6a] text-white text-[12px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#957a5c] transition-colors disabled:opacity-50 cursor-pointer shadow-md"
              >
                {rsvpSubmitting ? "Recording response..." : "Submit RSVP Response"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
