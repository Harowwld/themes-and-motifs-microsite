"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

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

function PhotoGallery({ photos }: { photos: Moment["moment_photos"] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-[#2c2c2c] mb-4 font-[family-name:var(--font-noto-serif)]">
        Photos
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.sort((a, b) => a.upload_order - b.upload_order).map((photo, index) => (
          <div
            key={photo.id}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => setSelectedPhoto(index)}
          >
            <img
              src={photo.image_url}
              alt={photo.caption || "Moment photo"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-sm">{photo.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setSelectedPhoto(null)}
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="max-w-4xl max-h-full">
            <img
              src={photos[selectedPhoto].image_url}
              alt={photos[selectedPhoto].caption || "Moment photo"}
              className="max-w-full max-h-full object-contain"
            />
            {photos[selectedPhoto].caption && (
              <p className="text-white text-center mt-4">{photos[selectedPhoto].caption}</p>
            )}
          </div>

          {/* Navigation */}
          {photos.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhoto(selectedPhoto > 0 ? selectedPhoto - 1 : photos.length - 1);
                }}
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhoto(selectedPhoto < photos.length - 1 ? selectedPhoto + 1 : 0);
                }}
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function VendorReviewCard({ review }: { review: Moment["vendor_reviews"][0] }) {
  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {review.vendors.logo_url && (
            <img
              src={review.vendors.logo_url}
              alt={review.vendors.business_name}
              className="w-12 h-12 rounded-lg object-contain"
            />
          )}
          <div>
            <h4 className="font-semibold text-[#2c2c2c]">{review.vendors.business_name}</h4>
            <p className="text-sm text-gray-500">Vendor Review</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            <StarRating rating={review.overall_rating} />
            <span className="text-sm font-medium text-gray-700 ml-2">
              {review.overall_rating}.0
            </span>
          </div>
          {review.would_recommend && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#ecfdf3] text-[#027a48]">
              Recommended
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Quality</p>
          <StarRating rating={review.quality_rating} />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Communication</p>
          <StarRating rating={review.communication_rating} />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Value</p>
          <StarRating rating={review.value_rating} />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Overall</p>
          <StarRating rating={review.overall_rating} />
        </div>
      </div>

      {review.review_text && (
        <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-3/4 bg-gray-200 rounded mb-4" />
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-8" />
      <div className="h-32 w-full bg-gray-200 rounded mb-6" />
      <div className="space-y-4">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default function MomentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<any>(null);
  const [moment, setMoment] = useState<Moment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const momentId = params.momentId as string;

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!cancelled) {
        setUser(session?.user);
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  useEffect(() => {
    if (!momentId) return;

    async function fetchMoment() {
      try {
        const token = user ? (await supabase.auth.getSession()).data.session?.access_token : null;
        
        const response = await fetch(`/api/moments/${momentId}`, {
          headers: token ? {
            authorization: `Bearer ${token}`,
          } : {},
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError("Moment not found");
          } else if (response.status === 403) {
            setError("You don't have permission to view this moment");
          } else {
            setError("Failed to load moment");
          }
          return;
        }

        const data = await response.json();
        setMoment(data.moment);
      } catch (error) {
        console.error("Error fetching moment:", error);
        setError("Failed to load moment");
      } finally {
        setLoading(false);
      }
    }

    fetchMoment();
  }, [momentId, user, supabase]);

  const getMomentIcon = () => {
    if (!moment) return null;
    
    switch (moment.moment_type) {
      case "photo":
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        );
      case "review":
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        );
      case "story":
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        );
      case "milestone":
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-[#fafafa]">
          <div className="mx-auto w-full max-w-4xl px-5 sm:px-8 py-10 sm:py-14">
            <LoadingSkeleton />
          </div>
        </div>
      </>
    );
  }

  if (error || !moment) {
    return (
      <>
        <div className="min-h-screen bg-[#fafafa]">
          <div className="mx-auto w-full max-w-4xl px-5 sm:px-8 py-10 sm:py-14">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Moment not found</h1>
              <p className="text-gray-600 mb-4">{error || "This moment doesn't exist or you don't have permission to view it."}</p>
              <Link
                href="/moments"
                className="text-[#a68b6a] hover:text-[#957a5c] font-medium"
              >
                ← Back to Moments
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#fafafa]">
        <div className="mx-auto w-full max-w-4xl px-5 sm:px-8 py-10 sm:py-14">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push("/moments")}
              className="flex items-center gap-2 text-[#a68b6a] hover:text-[#957a5c] transition-colors mb-4"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Moments
            </button>
            
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#a68b6a]/10 text-[#a68b6a]">
                {getMomentIcon()}
              </div>
              <div className="flex-1">
                <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-[-0.01em] text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
                  {moment.title}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-sm text-gray-500 capitalize">{moment.moment_type}</p>
                  <span className="text-gray-300">•</span>
                  <p className="text-sm text-gray-500">
                    {new Date(moment.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {moment.visibility !== "private" && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#ecfdf3] text-[#027a48] capitalize">
                        {moment.visibility}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] p-6 md:p-8">
            {moment.content && (
              <div className="prose prose-gray max-w-none mb-8">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {moment.content}
                </p>
              </div>
            )}

            {/* Photos */}
            {moment.moment_photos.length > 0 && (
              <div className="mb-8">
                <PhotoGallery photos={moment.moment_photos} />
              </div>
            )}

            {/* Vendor Reviews */}
            {moment.vendor_reviews.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#2c2c2c] mb-4 font-[family-name:var(--font-noto-serif)]">
                  Vendor Reviews
                </h3>
                <div className="space-y-4">
                  {moment.vendor_reviews.map((review) => (
                    <VendorReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {user && moment.user_id === user.id && (
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Last updated {new Date(moment.updated_at).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/moments/${moment.id}/edit`)}
                    className="px-4 py-2 text-[#a68b6a] hover:text-[#957a5c] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm("Are you sure you want to delete this moment?")) return;
                      
                      try {
                        const token = (await supabase.auth.getSession()).data.session?.access_token;
                        const response = await fetch(`/api/moments/${moment.id}`, {
                          method: "DELETE",
                          headers: {
                            authorization: `Bearer ${token}`,
                          },
                        });

                        if (response.ok) {
                          router.push("/moments");
                        }
                      } catch (error) {
                        console.error("Error deleting moment:", error);
                      }
                    }}
                    className="px-4 py-2 text-[#b42318] hover:text-[#9a1d14] transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
