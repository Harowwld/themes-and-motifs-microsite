"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import Link from "next/link";
import { toast } from "@/lib/toast";

type CoupleProfile = {
  user_id: string;
  groom_nickname: string | null;
  bride_nickname: string | null;
  wedding_date: string | null;
  location: string | null;
  profile_photo_url: string | null;
  is_premium: boolean | null;
  profile_visibility: string | null;
};

export default function PublicMomentsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // Authentication & context
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<CoupleProfile | null>(null);
  const [couples, setCouples] = useState<CoupleProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkAuthAndFetchProfiles() {
      try {
        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (cancelled) return;
        setUser(session?.user);

        if (session?.user) {
          // Fetch current user's profile to see if they are a soon-to-wed
          const { data: currentProfile } = await supabase
            .from("soon_to_wed_profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (!cancelled && currentProfile) {
            setUserProfile(currentProfile);
          }
        }

        // Fetch all public couples profiles
        const { data: profiles, error } = await supabase
          .from("soon_to_wed_profiles")
          .select("*")
          .eq("profile_visibility", "public")
          .order("created_at", { ascending: false });

        if (!cancelled) {
          if (!error && profiles) {
            // Filter out profiles with absolutely no nicknames set, or keep them with fallbacks
            setCouples(profiles);
          } else {
            console.error("Error fetching profiles:", error);
          }
        }
      } catch (error) {
        console.error("Unexpected error in initialization:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    checkAuthAndFetchProfiles();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // Filter couples based on search query
  const filteredCouples = useMemo(() => {
    return couples.filter((couple) => {
      const groom = couple.groom_nickname || "";
      const bride = couple.bride_nickname || "";
      const loc = couple.location || "";
      const nameStr = `${groom} and ${bride} ${loc}`.toLowerCase();
      return nameStr.includes(searchQuery.toLowerCase());
    });
  }, [couples, searchQuery]);

  // Formatter for wedding date
  const formatWeddingDate = (dateStr: string | null) => {
    if (!dateStr) return "TBA";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return dateStr;
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

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        
        {/* Page Main Brand Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 select-none">
          <span className="text-[#a68b6a] text-xs font-bold uppercase tracking-widest bg-[#a68b6a]/5 px-3 py-1 rounded-full">
            Themes & Motifs Directory
          </span>
          <h1 className="text-[36px] sm:text-[46px] font-bold text-[#2c2c2c] mt-4 font-[family-name:var(--font-noto-serif)] leading-tight">
            Wedding Moments
          </h1>
          <p className="text-[13px] sm:text-[14px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)] mt-3 leading-relaxed">
            Discover the beautiful stories, entourage lines, registries, and wedding moments of couples celebrating their marriage union.
          </p>
        </div>

        {/* Dashboard Shortcut Banner for Active Soon-to-Wed Couples */}
        {userProfile && (
          <div className="max-w-3xl mx-auto mb-12 bg-gradient-to-r from-[#a68b6a]/10 to-[#957a5c]/5 border border-[#a68b6a]/20 rounded-2xl p-5 sm:p-6 shadow-sm select-none">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-bold text-[15px] sm:text-[16px] text-neutral-800 font-[family-name:var(--font-plus-jakarta)]">
                  💍 Welcome back, {userProfile.groom_nickname || "Groom"} & {userProfile.bride_nickname || "Bride"}!
                </h3>
                <p className="text-[12px] sm:text-[13px] text-neutral-500">
                  Manage your wedding registry, principal sponsors, entourage directory, and share moments with guests.
                </p>
              </div>
              <Link
                href={`/moments/couple/${userProfile.user_id}`}
                className="px-5 py-2.5 bg-[#a68b6a] text-white text-[12px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#957a5c] transition-all shadow-sm shrink-0"
              >
                View Your Microsite
              </Link>
            </div>
          </div>
        )}

        {/* Search bar and Filters */}
        <div className="max-w-md mx-auto mb-10 select-none">
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-neutral-400">
              <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search couples by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 border border-black/[0.06] rounded-full bg-white text-[13px] font-medium outline-none focus:border-[#a68b6a] focus:ring-1 focus:ring-[#a68b6a] transition-all font-[family-name:var(--font-plus-jakarta)] shadow-sm"
            />
          </div>
        </div>

        {/* Couples directory card grid */}
        {filteredCouples.length === 0 ? (
          <div className="max-w-md mx-auto text-center border border-black/[0.04] bg-white rounded-2xl p-10 sm:p-12 shadow-sm select-none">
            <span className="text-3xl">🕊️</span>
            <h3 className="text-[16px] font-bold text-neutral-700 font-[family-name:var(--font-noto-serif)] mt-4">
              No couples found
            </h3>
            <p className="text-[12px] text-neutral-400 font-[family-name:var(--font-plus-jakarta)] mt-1.5 leading-relaxed">
              We couldn't find any public couples matching your search query. Be sure to check again later!
            </p>
            {!user && (
              <Link
                href="/soon-to-wed/signup"
                className="inline-flex items-center mt-6 px-5 py-2.5 bg-[#a68b6a] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#957a5c] transition-colors"
              >
                Sign Up & Share Your Story
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCouples.map((couple) => {
              const displayNames = couple.groom_nickname && couple.bride_nickname
                ? `${couple.groom_nickname} & ${couple.bride_nickname}`
                : couple.groom_nickname || couple.bride_nickname || "Wilson & Diana";
                
              const weddingDateFormatted = formatWeddingDate(couple.wedding_date);
              const displayLoc = couple.location || "Peoria, Illinois";
              const isPremium = couple.is_premium;

              return (
                <div
                  key={couple.user_id}
                  className="bg-white border border-black/5 rounded-2xl overflow-hidden hover:shadow-[0_15px_30px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Visual Card Frame */}
                    <div className="aspect-[16/10] bg-neutral-100 relative overflow-hidden select-none">
                      <img
                        src={couple.profile_photo_url || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600"}
                        alt="Wedding Couple Frame"
                        className="w-full h-full object-cover group-hover:scale-[1.02] filter brightness-95 transition-transform duration-500"
                        loading="lazy"
                      />
                      
                      {/* Premium ribbon badge */}
                      {isPremium && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider shadow-sm flex items-center gap-1 select-none">
                          👑 Premium
                        </div>
                      )}
                    </div>

                    {/* Card Body content */}
                    <div className="p-5 sm:p-6 text-center space-y-4">
                      {/* Cursive Name banner */}
                      <h3
                        className="text-[34px] sm:text-[38px] font-normal text-neutral-800 leading-none truncate select-none px-2"
                        style={{ fontFamily: "'Great Vibes', cursive" }}
                      >
                        {displayNames}
                      </h3>

                      {/* Line divider */}
                      <div className="w-12 h-[1px] bg-neutral-200 mx-auto" />

                      {/* Details */}
                      <div className="space-y-1.5 select-none">
                        <div className="flex items-center justify-center gap-1.5 text-neutral-600 font-[family-name:var(--font-plus-jakarta)] font-semibold text-[13px]">
                          <svg className="h-3.5 w-3.5 text-[#a68b6a]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                          <span>{weddingDateFormatted}</span>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 text-neutral-400 font-[family-name:var(--font-plus-jakarta)] font-bold text-[11px] uppercase tracking-wider">
                          <svg className="h-3.5 w-3.5 text-neutral-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          <span className="truncate max-w-[200px]">{displayLoc}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Button */}
                  <div className="px-5 pb-5 select-none">
                    <Link
                      href={`/moments/couple/${couple.user_id}`}
                      className="block w-full text-center py-2.5 border border-[#a68b6a] text-[#a68b6a] text-[11px] sm:text-[12px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#a68b6a] hover:text-white transition-colors duration-300 cursor-pointer shadow-sm hover:shadow font-[family-name:var(--font-plus-jakarta)]"
                    >
                      Explore Microsite
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
