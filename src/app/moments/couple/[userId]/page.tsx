"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import Link from "next/link";
import { toast } from "@/lib/toast";
import { proxiedImageUrl } from "@/lib/imageSizes";
import AdBanner from "@/components/AdBanner";


function CoupleMicrositeSkeleton() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-10 sm:py-14 animate-pulse">
        {/* Back button skeleton */}
        <div className="h-4 w-40 rounded bg-black/10 mb-8 max-w-2xl mx-auto" />

        {/* Brand Script Title Skeleton */}
        <div className="flex justify-center mb-8 pt-4">
          <div className="h-14 w-80 rounded bg-black/10" />
        </div>

        {/* Tab Navigation skeleton */}
        <div className="flex justify-center border-b border-black/[0.06] mb-10 pb-0.5">
          <div className="flex gap-4 sm:gap-8 px-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="py-3 px-3 w-16 sm:w-20 h-8 rounded bg-black/5" />
            ))}
          </div>
        </div>

        {/* Main Content card skeleton */}
        <div className="space-y-12">
          <div className="bg-white border border-black/5 rounded-2xl p-4 sm:p-6 shadow-sm max-w-2xl mx-auto flex flex-col items-center space-y-6">
            {/* Couple Main Portrait frame */}
            <div className="w-full aspect-[4/3] rounded-xl bg-black/[0.03]" />

            {/* Title & Info */}
            <div className="flex flex-col items-center space-y-3 w-full">
              <div className="h-6 w-2/3 rounded bg-black/10" />
              <div className="h-4 w-1/3 rounded bg-black/5" />
              <div className="h-10 w-48 rounded-xl bg-[#fafafa] border border-black/[0.03]" />
            </div>

            {/* Subtext */}
            <div className="w-full border-t border-black/[0.04] pt-5 flex flex-col items-center space-y-2">
              <div className="h-3 w-5/6 rounded bg-black/5" />
              <div className="h-3 w-4/5 rounded bg-black/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  side: string;
  color?: string;
  photo_url?: string;
};

const COLOR_PRESETS = [
  { id: "rose", name: "Rose (Bride)", bgColor: "bg-rose-50", borderColor: "border-rose-200", dotColor: "bg-rose-500", textColor: "text-rose-600" },
  { id: "blue", name: "Blue (Groom)", bgColor: "bg-blue-50", borderColor: "border-blue-200", dotColor: "bg-blue-500", textColor: "text-blue-600" },
  { id: "amber", name: "Gold", bgColor: "bg-amber-50", borderColor: "border-amber-200", dotColor: "bg-amber-500", textColor: "text-amber-700" },
  { id: "emerald", name: "Emerald", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", dotColor: "bg-emerald-500", textColor: "text-emerald-700" },
  { id: "purple", name: "Purple", bgColor: "bg-purple-50", borderColor: "border-purple-200", dotColor: "bg-purple-500", textColor: "text-purple-700" },
  { id: "indigo", name: "Indigo", bgColor: "bg-indigo-50", borderColor: "border-indigo-200", dotColor: "bg-indigo-500", textColor: "text-indigo-700" },
  { id: "neutral", name: "Gray", bgColor: "bg-neutral-100", borderColor: "border-neutral-200", dotColor: "bg-neutral-500", textColor: "text-neutral-600" },
];

const getTagColorClass = (color?: string, side?: string) => {
  if (color) {
    const preset = COLOR_PRESETS.find(p => p.id === color);
    if (preset) {
      return `${preset.bgColor} ${preset.textColor} border ${preset.borderColor}`;
    }
  }

  // Fallback to side-based matching
  const lowerSide = (side || "").toLowerCase();
  if (lowerSide === "bride" || lowerSide === "bride's side") {
    return "bg-rose-50 text-rose-600 border border-rose-100";
  }
  if (lowerSide === "groom" || lowerSide === "groom's side") {
    return "bg-blue-50 text-blue-600 border border-blue-100";
  }
  return "bg-neutral-100 text-neutral-500 border border-neutral-200/40";
};

type Sponsor = {
  name: string;
  role: string;
  side: string;
  color?: string;
  photo_url?: string;
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteConfirm = async () => {
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
      setShowDeleteConfirm(false);
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
            <div className="flex items-center gap-2">
              {showDeleteConfirm ? (
                <>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mr-1">Confirm delete?</span>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deletingId === moment.id}
                    className="px-2.5 py-1 bg-[#b42318] hover:bg-[#9a1d14] text-white text-[11px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deletingId === moment.id}
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 text-[11px] font-black uppercase tracking-wider rounded-lg border border-black/5 transition-colors cursor-pointer"
                  >
                    No
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deletingId === moment.id}
                  className="text-[#b42318] hover:text-[#9a1d14] transition-colors text-sm font-bold cursor-pointer"
                >
                  Delete
                </button>
              )}
            </div>
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
  const [totalGuests, setTotalGuests] = useState<number | null>(null);
  const [checkingGuestlist, setCheckingGuestlist] = useState(false);

  // Check if guest list is empty when the RSVP modal opens
  useEffect(() => {
    if (rsvpOpen && userId && totalGuests === null) {
      async function checkEmpty() {
        setCheckingGuestlist(true);
        try {
          const res = await fetch(`/api/rsvp?userId=${userId}&checkEmpty=true`);
          const data = await res.json();
          if (typeof data.totalGuests === "number") {
            setTotalGuests(data.totalGuests);
          }
        } catch (err) {
          console.error("Error checking empty guestlist:", err);
        } finally {
          setCheckingGuestlist(false);
        }
      }
      checkEmpty();
    }
  }, [rsvpOpen, userId, totalGuests]);

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
    
    // Unpack [Meal: Selection] from dietary field dynamically mapping values/labels
    const rawDietary = guest.dietary || "";
    const mealMatch = rawDietary.match(/^\[Meal:\s*([^\]]+)\]/i);
    if (mealMatch) {
      const matchVal = mealMatch[1].toLowerCase().trim();
      if (matchVal === "roasted beef" || matchVal === "beef") {
        setRsvpMeal("beef");
      } else if (matchVal === "baked salmon" || matchVal === "fish") {
        setRsvpMeal("fish");
      } else if (matchVal === "truffle chicken" || matchVal === "chicken") {
        setRsvpMeal("chicken");
      } else if (matchVal === "vegan wellington" || matchVal === "vegetarian") {
        setRsvpMeal("vegetarian");
      } else {
        setRsvpMeal("beef"); // Safe default fallback
      }
      setRsvpDietary(rawDietary.replace(/^\[Meal:\s*[^\]]+\]\s*/i, ""));
    } else {
      setRsvpMeal("beef"); // default
      setRsvpDietary(rawDietary);
    }
    
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
    return [];
  }, [profile?.entourage]);

  const sponsorsList = useMemo<Sponsor[]>(() => {
    if (profile?.sponsors && Array.isArray(profile.sponsors) && profile.sponsors.length > 0) {
      return profile.sponsors as Sponsor[];
    }
    return [];
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
      toast.success("Redirecting to secure payment gateway...");
      setTimeout(() => {
        toast.success(`Thank you for your generous contribution of ₱${amount.toLocaleString()}!`);
      }, 1500);
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
    toast.success("Redirecting to secure payment gateway...");
    setTimeout(() => {
      toast.success(`Thank you for contributing ₱${amount.toLocaleString()} to our Honeymoon & Home Fund!`);
      setCustomCash("");
    }, 1500);
  };

  // RSVP Form handler
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuestId) {
      toast.error("Please search and select your name from the suggestion list to RSVP.");
      return;
    }
    setRsvpSubmitting(true);

    // Pack meal selection into dietary restrictions field
    const packedDietary = rsvpStatus === "attending" && rsvpMeal
      ? `[Meal: ${rsvpMeal}] ${rsvpDietary}`.trim()
      : rsvpDietary;

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
          dietary: packedDietary,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit RSVP");
      }

      toast.success(`RSVP successfully recorded! Thank you, ${rsvpName}!`);
      setRsvpOpen(false);
      
      // Clear form and states
      setRsvpName("");
      setRsvpEmail("");
      setRsvpDietary("");
      setRsvpMeal("beef");
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
    return <CoupleMicrositeSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">

      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-10 sm:py-14">
        


        {/* Setup notice banner for logged in owners with empty profile names */}
        {isOwner && (!profile?.groom_nickname || !profile?.bride_nickname) && (
          <div className="mb-6 max-w-2xl mx-auto bg-amber-50/80 border border-amber-200/60 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] select-none">
            <div className="flex gap-4">
              <svg className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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

        <div className="text-center mb-6 pt-4">
          <h1 className="text-[52px] sm:text-[68px] font-normal text-[#2c2c2c] leading-tight select-none font-[family-name:var(--font-playfair-display)]" style={{ fontFamily: "var(--font-playfair-display), serif" }}>
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
              
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-6 bg-neutral-100 relative group">
                <img
                  src={profile?.profile_photo_url || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200"}
                  alt="Wedding Couple Portrait"
                  className="w-full h-full object-cover select-none filter brightness-95 group-hover:scale-[1.01] transition-transform duration-700"
                  loading="eager"
                />
                {isOwner && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={() => router.push("/dashboard?tab=microsite_settings")}
                      className="px-6 py-2.5 bg-white/90 text-neutral-800 text-[13px] font-bold rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Replace Picture
                    </button>
                  </div>
                )}
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
                      <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Just Married!
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
              {profile?.is_premium && (
                <div className="mb-6 select-none">
                  <button
                    onClick={() => setRsvpOpen(true)}
                    className="px-8 py-2.5 border border-[#a68b6a] text-[#a68b6a] text-[13px] font-bold rounded-full uppercase tracking-widest hover:bg-[#a68b6a] hover:text-white transition-all duration-300 cursor-pointer shadow-sm hover:shadow"
                  >
                    RSVP
                  </button>
                </div>
              )}

              {/* Invitation Subtext */}
              <div className="text-center max-w-md border-t border-black/[0.04] pt-5">
                <p className="text-[13px] sm:text-[14px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)] leading-relaxed italic">
                  {profile?.groom_last_name && profile?.bride_last_name ? (
                    <>
                      "{profile.groom_last_name} - {profile.bride_last_name}" Nuptials<br />
                      {profile.wedding_time ? (() => {
                        const [h, m] = profile.wedding_time.split(":");
                        let hrs = parseInt(h, 10);
                        const ampm = hrs >= 12 ? "pm" : "am";
                        hrs = hrs % 12 || 12;
                        return `${hrs}:${m} ${ampm}`;
                      })() : "00:00 am/pm"} at (ceremony/ church venue) ; Reception follows at {profile.wedding_venue_area || "(venue)"}
                    </>
                  ) : (
                    <>
                      "Groom's Family Name - Bride's Family Name" Nuptials<br />
                      00:00 am/pm at (ceremony/ church venue) ; Reception follows at (venue)
                    </>
                  )}
                </p>
              </div>

            </div>

            {/* Our Love Story Section under the main card instead of Wedding Moments Feed */}
            <div className="max-w-2xl mx-auto border-t border-black/[0.05] pt-10">
              <div className="bg-white border border-black/5 rounded-2xl p-6 sm:p-10 shadow-sm relative select-none">
                <svg className="absolute top-4 left-6 h-20 w-20 text-[#a68b6a]/10 pointer-events-none select-none" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <div className="text-center mb-6">
                  <h3 className="text-[28px] font-normal text-[#2c2c2c] leading-tight select-none font-[family-name:var(--font-great-vibes)]" style={{ fontFamily: "var(--font-great-vibes), cursive" }}>
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

            {/* Wedding Moments Feed */}
            {moments.length > 0 && (
              <div className="max-w-2xl mx-auto border-t border-black/[0.05] pt-10 space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-[28px] font-normal text-[#2c2c2c] leading-tight select-none font-[family-name:var(--font-great-vibes)]" style={{ fontFamily: "var(--font-great-vibes), cursive" }}>
                    Wedding Moments
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-widest mt-1 font-[family-name:var(--font-plus-jakarta)]">
                    Memories & Milestones
                  </p>
                </div>

                <div className="grid gap-6">
                  {moments.map((moment) => (
                    <MomentCard
                      key={moment.id}
                      moment={moment}
                      onDelete={handleDeleteMoment}
                      isOwner={isOwner}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Entourage Tab Directory */}
        {activeTab === "entourage" && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center max-w-md mx-auto">
              <h3 className="text-[20px] font-bold text-neutral-800 font-[family-name:var(--font-noto-serif)]">
                The Wedding Entourage
              </h3>
              <p className="text-[12px] text-neutral-400 font-[family-name:var(--font-plus-jakarta)] mt-1">
                Meet the family and beloved friends supporting our big union
              </p>
            </div>

            {entourageList.length === 0 ? (
              <div className="bg-white border border-black/5 rounded-xl p-8 text-center max-w-md mx-auto space-y-3">
                <div className="flex justify-center text-[#a68b6a] mb-2">
                  <svg className="h-10 w-10 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-[15px] text-neutral-800 font-[family-name:var(--font-plus-jakarta)]">Entourage is not yet set</h4>
                <p className="text-[12.5px] text-neutral-400 font-[family-name:var(--font-plus-jakarta)] leading-relaxed">
                  The couple hasn't added their entourage members yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 select-none">
                {entourageList.map((member, idx) => (
                  <div key={idx} className="bg-white border border-black/5 rounded-xl p-4 shadow-sm text-center flex flex-col items-center hover:shadow-md transition-all">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a68b6a]/15 to-[#a68b6a]/5 border border-[#a68b6a]/20 flex items-center justify-center mb-3 overflow-hidden">
                      {member.photo_url ? (
                        <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[#a68b6a] font-black text-lg">
                          {member.name.split(" ").map(n => n.charAt(0)).join("")}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-[14px] text-neutral-800 font-[family-name:var(--font-plus-jakarta)] leading-tight">{member.name}</h4>
                    <p className="text-[11px] text-[#a68b6a] font-bold uppercase tracking-wider mt-1.5">{member.role}</p>
                    {member.side && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide mt-2 ${
                        getTagColorClass(member.color, member.side)
                      }`}>
                        {member.side}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
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

            {sponsorsList.length === 0 ? (
              <div className="bg-white border border-black/5 rounded-xl p-8 text-center max-w-md mx-auto space-y-3">
                <div className="flex justify-center text-[#a68b6a] mb-2">
                  <svg className="h-10 w-10 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h4 className="font-bold text-[15px] text-neutral-800 font-[family-name:var(--font-plus-jakarta)]">Sponsors directory is not yet set</h4>
                <p className="text-[12.5px] text-neutral-400 font-[family-name:var(--font-plus-jakarta)] leading-relaxed">
                  The couple hasn't listed their wedding sponsors yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 select-none">
                {sponsorsList.map((sponsor, idx) => (
                  <div key={idx} className="bg-white border border-black/5 rounded-xl p-4 shadow-sm text-center flex flex-col items-center hover:shadow-md transition-all">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a68b6a]/15 to-[#a68b6a]/5 border border-[#a68b6a]/20 flex items-center justify-center mb-3 overflow-hidden">
                      {sponsor.photo_url ? (
                        <img src={sponsor.photo_url} alt={sponsor.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[#a68b6a] font-black text-lg">
                          {sponsor.name.split(" ").map(n => n.charAt(0)).join("")}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-[14px] text-neutral-800 font-[family-name:var(--font-plus-jakarta)] leading-tight">{sponsor.name}</h4>
                    <p className="text-[11px] text-[#a68b6a] font-bold uppercase tracking-wider mt-1.5">
                      {sponsor.role || `${sponsor.type} Sponsor`}
                    </p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide mt-2 ${
                      getTagColorClass(sponsor.color, sponsor.side || sponsor.type)
                    }`}>
                      {sponsor.side || (sponsor.type === "principal" ? "Principal" : "Secondary")}
                    </span>
                  </div>
                ))}
              </div>
            )}
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

            {profile?.our_message ? (
              <div className="bg-white border border-black/5 rounded-2xl p-6 sm:p-10 shadow-sm max-w-lg mx-auto relative select-none">
                {/* Elegant floating decorative quote mark */}
                <span className="absolute top-4 left-6 text-[#a68b6a]/10 text-[80px] leading-none pointer-events-none select-none font-serif">“</span>
                
                <div className="relative z-10 text-center space-y-5 font-[family-name:var(--font-plus-jakarta)] text-neutral-600 leading-relaxed text-[13px] sm:text-[14px]">
                  <p className="font-bold text-neutral-800 text-[15px] sm:text-[16px] mb-4">Dear Family and Friends,</p>
                  <p className="whitespace-pre-line text-neutral-600 leading-relaxed">{profile.our_message}</p>
                  
                  <div className="pt-6 border-t border-black/[0.04] mt-6 flex flex-col items-center">
                    <p className="text-[12px] text-neutral-400 uppercase tracking-widest font-bold">With all our love,</p>
                    <div className="flex items-center justify-center gap-3 mt-3">
                      <p className="text-[36px] text-[#a68b6a] leading-none font-[family-name:var(--font-playfair-display)]" style={{ fontFamily: "var(--font-playfair-display), serif" }}>
                        {displayTitle}
                      </p>
                      <img
                        src="https://themesnmotifs.com/wp-content/uploads/elementor/thumbs/T_M-Logo-1-qzxx62xvcaywvxz23bwwe4nm1tu4exw9i42ghzw8g6.png"
                        alt="Themes & Motifs"
                        className="h-6 w-auto opacity-65 select-none pointer-events-none"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-black/5 rounded-xl p-8 text-center max-w-md mx-auto space-y-3">
                <div className="flex justify-center text-[#a68b6a] mb-2">
                  <svg className="h-10 w-10 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-[15px] text-neutral-800 font-[family-name:var(--font-plus-jakarta)]">Guest welcome message is not yet set</h4>
                <p className="text-[12.5px] text-neutral-400 font-[family-name:var(--font-plus-jakarta)] leading-relaxed">
                  The couple hasn't written their guest welcome letter yet.
                </p>
              </div>
            )}
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
                <div className="flex justify-center text-[#a68b6a] mb-2">
                  <svg className="h-8 w-8 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
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
                <div className="flex justify-center text-[#a68b6a] mb-2">
                  <svg className="h-10 w-10 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h4 className="font-bold text-[15px] text-neutral-800 font-[family-name:var(--font-plus-jakarta)]">Our Registry is under preparation</h4>
                <p className="text-[12.5px] text-neutral-400 font-[family-name:var(--font-plus-jakarta)] leading-relaxed">
                  We are currently choosing our registry items from the Marketplace.
                </p>
                <div className="pt-2">
                  <Link href="/promos" className="inline-flex items-center justify-center px-5 py-2.5 bg-[#a68b6a] text-white text-[12px] font-bold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg hover:bg-[#957a5c] transition-all">
                    Browse The Wedding Marketplace
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {registryItems.map((item) => {
                  const percent = item.target > 0 ? Math.min((item.contribution / item.target) * 100, 100) : 0;
                  const isFullyFunded = item.contribution >= item.target;
                  return (
                    <div key={item.id} className="bg-white border border-black/5 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-3 select-none">
                          <div className="w-12 h-12 rounded-lg bg-[#a68b6a]/10 overflow-hidden flex items-center justify-center shrink-0 border border-black/5">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <svg className="h-6 w-6 text-[#a68b6a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
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

      {/* QR Code Section */}
      <div className="w-full bg-[#fafafa] pt-8 pb-4 px-4 sm:px-6 border-t border-black/[0.05]">
        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.04)] transition-all duration-300 py-8 px-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-3 bg-white border border-black/[0.08] shadow-sm rounded-xl">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://themesnmotifs.com/moments/couple/${userId}`)}`} 
              alt="Scan to view our microsite"
              className="w-24 h-24 sm:w-28 sm:h-28"
            />
          </div>
          <h4 className="text-[15px] font-bold text-neutral-800 font-[family-name:var(--font-plus-jakarta)]">
            Scan to View Our Microsite
          </h4>
          <p className="text-[13px] text-neutral-500 max-w-sm font-[family-name:var(--font-plus-jakarta)]">
            Share this QR code with your family and friends so they can easily access your wedding details, stories, and registry.
          </p>
        </div>
      </div>

      <div className="w-full border-t border-black/[0.05] bg-[#fafafa] py-10 px-4 sm:px-6 overflow-hidden flex justify-center">
        <div className="w-full max-w-[1400px]">
          <AdBanner pageContext="microsite" />
        </div>
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
              <div className="flex justify-center text-[#a68b6a] mb-2">
                <svg className="h-10 w-10 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-[18px] font-bold text-neutral-800 font-[family-name:var(--font-noto-serif)] mt-2">
                Join Our Big Day
              </h3>
              <p className="text-[12px] text-neutral-400 mt-1 font-[family-name:var(--font-plus-jakarta)]">
                Confirm your attendance details for our wedding
              </p>
            </div>

            {checkingGuestlist ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3 font-[family-name:var(--font-plus-jakarta)] select-none">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-[#a68b6a]"></div>
                <p className="text-xs text-neutral-400 font-medium">Checking guest directory...</p>
              </div>
            ) : totalGuests === 0 ? (
              <div className="text-center py-6 px-4 space-y-4 font-[family-name:var(--font-plus-jakarta)] select-none">
                <div className="flex justify-center text-[#a68b6a] mb-2">
                  <svg className="h-12 w-12 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h4 className="font-bold text-[15px] text-neutral-800">
                  Guest List Not Yet Set Up
                </h4>
                <p className="text-[12.5px] text-neutral-400 leading-relaxed max-w-xs mx-auto">
                  The happy couple has not uploaded their guest list to the system yet. Please reach out to them directly to confirm your RSVP!
                </p>
                <button
                  type="button"
                  onClick={() => setRsvpOpen(false)}
                  className="w-full h-10 border border-neutral-200 text-neutral-500 text-[12px] font-bold rounded-lg uppercase tracking-wider hover:bg-neutral-50 transition-all cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
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
                      No match found. Enter your full name exactly as written on your invitation.
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
                    <svg className="h-4 w-4 text-[#a68b6a] shrink-0 mt-0.5 select-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
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
            )}
          </div>
        </div>
      )}

    </div>
  );
}
