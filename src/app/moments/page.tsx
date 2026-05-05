"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import Link from "next/link";

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

function MomentCard({ moment, onDelete }: { moment: Moment; onDelete: (id: string) => void }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async () => {
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
      }
    } catch (error) {
      console.error("Error deleting moment:", error);
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

  // Check if current user owns this moment
  const isOwner = moment.user_id === localStorage.getItem('user_id');

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
            {moment.moment_photos.map((photo, index) => (
              <div key={photo.id} className="px-4">
                <img
                  src={photo.image_url}
                  alt={photo.caption || "Moment photo"}
                  className="w-full h-auto object-contain"
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
              <span className="text-sm">View</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-[#b42318] transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm">Like</span>
            </button>
          </div>
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deletingId === moment.id}
              className="text-[#b42318] hover:text-[#9a1d14] transition-colors text-sm"
            >
              {deletingId === moment.id ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
            <div>
              <div className="h-5 w-32 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-full" />
            <div className="h-5 w-5 bg-gray-200 animate-pulse rounded" />
            <div className="h-5 w-5 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-4" />
        <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
          <div className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function MomentsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<any>(null);
  const [isSoonToWed, setIsSoonToWed] = useState(false);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "private" | "public">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const fetchMoments = useCallback(async () => {
    try {
      const token = user ? (await supabase.auth.getSession()).data.session?.access_token : null;
      const params = new URLSearchParams({
        visibility: user ? filter : "public", // Public users only see public moments
        ...(typeFilter !== "all" && { type: typeFilter }),
      });
      
      const headers: Record<string, string> = {};
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/moments?${params}`, { headers });
      
      const data = await response.json();
      if (data.moments) {
        setMoments(data.moments);
      }
    } catch (error) {
      console.error("Error fetching moments:", error);
    } finally {
      setLoading(false);
    }
  }, [user, filter, typeFilter, supabase]);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!cancelled) {
        setUser(session?.user);
        
        // Check if user is soon-to-wed using the same API as SiteHeader
        if (session?.user) {
          try {
            const token = session.access_token;
            const response = await fetch('/api/auth/me', {
              headers: {
                authorization: `Bearer ${token}`,
              },
            });
            const data = await response.json();
            setIsSoonToWed(data.isSoonToWed);
          } catch (error) {
            console.error('Error checking user role:', error);
            setIsSoonToWed(false);
          }
        } else {
          setIsSoonToWed(false);
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  useEffect(() => {
    fetchMoments(); // Fetch for all users (public and authenticated)
  }, [fetchMoments]);

  const handleDeleteMoment = (momentId: string) => {
    setMoments((prev) => prev.filter((m) => m.id !== momentId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 py-10 sm:py-14">
          <div className="h-8 w-48 bg-black/10 animate-pulse rounded mb-8" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-black/10 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 py-10 sm:py-14">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.01em] text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
              Wedding Moments
            </h1>
            <p className="mt-1 text-[14px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)]">
              {user 
                ? "Document your wedding journey and share your experiences" 
                : "Discover beautiful wedding moments and get inspired for your big day"
              }
            </p>
          </div>
          {user && isSoonToWed && (
            <a
              href="/moments/create"
              className="inline-flex items-center px-4 py-2 bg-[#a68b6a] text-white text-[13px] font-semibold rounded-lg hover:bg-[#957a5c] transition-colors font-[family-name:var(--font-plus-jakarta)]"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Moment
            </a>
          )}
        </div>

        {/* Filters */}
        {user && (
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Visibility:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#a68b6a]"
              >
                <option value="all">All Moments</option>
                <option value="private">My Private</option>
                <option value="public">Public</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#a68b6a]"
              >
                <option value="all">All Types</option>
                <option value="photo">Photos</option>
                <option value="review">Reviews</option>
                <option value="story">Stories</option>
                <option value="milestone">Milestones</option>
              </select>
            </div>
          </div>
        )}

        {/* Type filter for public users */}
        {!user && (
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#a68b6a]"
              >
                <option value="all">All Types</option>
                <option value="photo">Photos</option>
                <option value="review">Reviews</option>
                <option value="story">Stories</option>
                <option value="milestone">Milestones</option>
              </select>
            </div>
          </div>
        )}

        {moments.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-white p-12 text-center">
            <svg className="h-16 w-16 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <h3 className="text-[18px] font-semibold text-[#2c2c2c] mb-2 font-[family-name:var(--font-noto-serif)]">
              {user ? "No moments yet" : "No public moments yet"}
            </h3>
            <p className="text-[14px] text-neutral-500 mb-6 font-[family-name:var(--font-plus-jakarta)]">
              {user 
                ? "Start documenting your wedding journey by creating your first moment"
                : "Be the first to share your wedding moments with the community!"
              }
            </p>
            {user && isSoonToWed ? (
              <a
                href="/moments/create"
                className="inline-flex items-center px-5 py-2.5 bg-[#a68b6a] text-white text-[13px] font-semibold rounded-lg hover:bg-[#957a5c] transition-colors font-[family-name:var(--font-plus-jakarta)]"
              >
                Create Your First Moment
              </a>
            ) : (
              <a
                href="/soon-to-wed/signup"
                className="inline-flex items-center px-5 py-2.5 bg-[#a68b6a] text-white text-[13px] font-semibold rounded-lg hover:bg-[#957a5c] transition-colors font-[family-name:var(--font-plus-jakarta)]"
              >
                Sign Up to Share Moments
              </a>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="space-y-6">
              {moments.map((moment) => (
                <MomentCard key={moment.id} moment={moment} onDelete={handleDeleteMoment} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
