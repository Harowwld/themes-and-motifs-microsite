"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { MomentPhotoUpload } from "@/components/MomentPhotoUpload";
import { toast } from "@/lib/toast";

type SavedVendor = {
  id: number;
  business_name: string;
  slug: string;
  logo_url: string | null;
};

export default function CreateMomentPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savedVendors, setSavedVendors] = useState<SavedVendor[]>([]);
  
  // Premium state controls
  const [isPremium, setIsPremium] = useState(false);
  const [existingPhotoMomentsCount, setExistingPhotoMomentsCount] = useState(0);
  const [totalExistingPhotosCount, setTotalExistingPhotosCount] = useState(0);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [momentType, setMomentType] = useState<"photo" | "review" | "story" | "milestone">("photo");
  const [visibility, setVisibility] = useState<"private" | "public" | "friends">("private");
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{ id: string; url: string; caption: string }>>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [titleError, setTitleError] = useState("");
  
  // Review state
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null);
  const [overallRating, setOverallRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [valueRating, setValueRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!cancelled && !session?.user) {
        router.push("/soon-to-wed/signin?redirect=/moments/create");
        return;
      }

      if (!cancelled && session?.user) {
        setUser(session.user);
        
        // Sync premium status from the database
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
          fetchExistingMoments(session.access_token ?? "")
        ]);
        setLoading(false);
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  const fetchExistingMoments = async (token: string) => {
    try {
      const res = await fetch("/api/moments?visibility=private", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.moments) {
        const photoMoments = data.moments.filter((m: any) => m.moment_type === "photo");
        setExistingPhotoMomentsCount(photoMoments.length);
        const totalPhotos = photoMoments.reduce((acc: number, m: any) => acc + (m.moment_photos?.length ?? 0), 0);
        setTotalExistingPhotosCount(totalPhotos);
      }
    } catch (error) {
      console.error("Error fetching existing moments:", error);
    }
  };

  const fetchSavedVendors = async (token: string) => {
    try {
      const res = await fetch("/api/saved-vendors", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.savedVendors) {
        setSavedVendors(data.savedVendors.map((sv: any) => sv.vendor));
      }
    } catch (error) {
      console.error("Error fetching saved vendors:", error);
      toast.error("Failed to load saved vendors.");
    }
  };

  const handlePhotoUpload = (files: File[]) => {
    // Store files locally for later upload during form submission
    setFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setTitleError("Please enter a title for your moment");
      return;
    }

    if (!isPremium && momentType === "photo") {
      if (existingPhotoMomentsCount >= 1) {
        toast.error("Free accounts are limited to 1 photo album. Please upgrade to Premium to upload more albums!");
        return;
      }
      if (totalExistingPhotosCount + files.length > 10) {
        toast.error(`Free accounts are limited to 10 photos in total. You currently have ${totalExistingPhotosCount} photos and are trying to upload ${files.length} more. Please upgrade to Premium to upload more photos!`);
        return;
      }
    }

    setTitleError("");
    setSubmitting(true);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        throw new Error("No authentication token found. Please sign in again.");
      }
      
      console.log("Creating moment with data:", {
        title,
        content,
        moment_type: momentType,
        visibility,
      });
      
      // Create the moment
      const response = await fetch("/api/moments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          moment_type: momentType,
          visibility,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Moment creation failed:", response.status, errorData);
        throw new Error(errorData.error || `Failed to create moment (${response.status})`);
      }

      const { moment } = await response.json();
      const momentId = moment.id;

      // Upload photos if any were selected
      if (files.length > 0) {
        const photoPromises = files.map(async (file, index) => {
          const formData = new FormData();
          formData.append("momentId", momentId);
          formData.append("file", file);
          formData.append("caption", uploadedPhotos[index]?.caption || "");

          const photoResponse = await fetch("/api/moments/photos", {
            method: "POST",
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (!photoResponse.ok) {
            throw new Error(`Failed to upload photo ${index + 1}`);
          }

          return photoResponse.json();
        });

        await Promise.all(photoPromises);
      }

      // Add vendor review if this is a review moment
      if (momentType === "review" && selectedVendor) {
        await fetch("/api/moments/reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            momentId,
            vendorId: selectedVendor,
            overallRating,
            qualityRating,
            communicationRating,
            valueRating,
            reviewText,
            wouldRecommend,
          }),
        });
      }
      toast.success("Moment created successfully!");
      router.push(`/moments/${momentId}`);
    } catch (error) {
      console.error("Error creating moment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create moment.");
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (rating: number) => void; label: string }) => (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700 w-32">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="text-2xl transition-colors"
          >
            <svg
              className={`h-6 w-6 ${star <= value ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a68b6a]"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#fafafa]">
        <div className="mx-auto w-full max-w-4xl px-5 sm:px-8 py-10 sm:py-14">
          <div className="mb-8">
            <h1 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.01em] text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
              Create New Moment
            </h1>
            <p className="mt-1 text-[14px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)]">
              Share a special moment from your wedding journey
            </p>
          </div>

          {/* Premium banner linking to Microsite settings */}
          <div className="mb-8 p-5 bg-gradient-to-r from-[#bca374]/10 to-transparent border border-[#bca374]/25 rounded-2xl flex items-start gap-4 shadow-sm select-none">
            <span className="text-2xl mt-0.5 shrink-0">✨</span>
            <div className="space-y-1">
              <h4 className="text-[13px] font-bold text-neutral-800 font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider">
                Customize Your Core Wedding Microsite Pages!
              </h4>
              <p className="text-[12px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)] leading-relaxed">
                Looking to write your <strong>Love Story</strong> narrative, build your <strong>Entourage Wedding Party</strong>, list your <strong>Sponsors Directory</strong>, or write a custom <strong>Guest Welcome Message</strong>? You can now configure all of these dynamically in your private dashboard under the <a href="/dashboard" className="text-[#a68b6a] hover:underline font-bold font-semibold">Microsite Settings</a> tab!
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] p-6">
              <h2 className="text-lg font-semibold text-[#2c2c2c] mb-6 font-[family-name:var(--font-noto-serif)]">
                Basic Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setTitleError("");
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a68b6a] ${
                      titleError ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Give your moment a title"
                    required
                  />
                  {titleError && (
                    <p className="mt-1 text-sm text-red-600">{titleError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a68b6a]"
                    placeholder="Share the story behind this moment..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Moment Type *
                    </label>
                    <select
                      value={momentType}
                      onChange={(e) => setMomentType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a68b6a]"
                    >
                      <option value="photo">Photos</option>
                      <option value="review">Vendor Review</option>
                      <option value="story">Story</option>
                      <option value="milestone">Milestone</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visibility
                    </label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a68b6a]"
                    >
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                      <option value="friends">Friends</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            {momentType === "photo" && (
              <div className="bg-white rounded-xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] p-6">
                <h2 className="text-lg font-semibold text-[#2c2c2c] mb-6 font-[family-name:var(--font-noto-serif)]">
                  Photos
                </h2>

                {!isPremium && existingPhotoMomentsCount >= 1 ? (
                  <div className="p-6 rounded-xl border border-[#bca374]/30 bg-[#bca374]/5 text-center flex flex-col items-center">
                    <span className="text-3xl mb-3">⚠️</span>
                    <h3 className="text-[16px] font-bold text-neutral-800 font-[family-name:var(--font-noto-serif)]">Photo Album Limit Reached</h3>
                    <p className="mt-2 text-sm text-neutral-500 max-w-md font-[family-name:var(--font-plus-jakarta)] leading-relaxed">
                      Standard accounts are limited to <strong>1 photo album</strong>. You have already created a photo album. Please upgrade to Premium Soon-to-Wed to create more albums and upload unlimited photos!
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const { error } = await supabase
                            .from("soon_to_wed_profiles")
                            .upsert({ user_id: user.id, is_premium: true }, { onConflict: "user_id" });

                          if (error) throw error;

                          setIsPremium(true);
                          toast.success("✨ Welcome to Premium Soon-to-Wed! Photo limits and premium planners unlocked.");
                        } catch (err) {
                          console.error("Upgrade failed:", err);
                          toast.error("Failed to upgrade to Premium.");
                        }
                      }}
                      className="mt-4 py-2 px-5 bg-gradient-to-r from-[#bca374] to-[#a68b6a] text-white text-[12px] font-bold uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      Unlock Premium Suite
                    </button>
                  </div>
                ) : (
                  <>
                    {!isPremium && (
                      <div className="mb-6 p-4 rounded-xl border border-[#bca374]/20 bg-[#bca374]/5 text-sm text-[#a68b6a] font-[family-name:var(--font-plus-jakarta)]">
                        <p className="font-bold">Standard Plan Photo Quota</p>
                        <p className="mt-1 text-neutral-600">
                          Standard couples can upload up to 10 photos total across 1 album. You currently have <strong>{totalExistingPhotosCount}/10</strong> photos uploaded. You can upload up to <strong>{10 - totalExistingPhotosCount}</strong> more photos.
                        </p>
                      </div>
                    )}
                    
                    <MomentPhotoUpload
                      onFilesSelected={handlePhotoUpload}
                      maxFiles={isPremium ? 10 : Math.max(0, 10 - totalExistingPhotosCount)}
                      acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
                      className="mb-4"
                    />
                    
                    <p className="text-sm text-gray-500">
                      Upload up to {isPremium ? 10 : Math.max(0, 10 - totalExistingPhotosCount)} photos. You can add captions after uploading.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Vendor Review */}
            {momentType === "review" && (
              <div className="bg-white rounded-xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] p-6">
                <h2 className="text-lg font-semibold text-[#2c2c2c] mb-6 font-[family-name:var(--font-noto-serif)]">
                  Vendor Review
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Vendor
                    </label>
                    <select
                      value={selectedVendor || ""}
                      onChange={(e) => setSelectedVendor(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a68b6a]"
                    >
                      <option value="">Choose a vendor to review</option>
                      {savedVendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.business_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedVendor && (
                    <>
                      <div className="space-y-3">
                        <StarRating
                          value={overallRating}
                          onChange={setOverallRating}
                          label="Overall Rating"
                        />
                        <StarRating
                          value={qualityRating}
                          onChange={setQualityRating}
                          label="Quality"
                        />
                        <StarRating
                          value={communicationRating}
                          onChange={setCommunicationRating}
                          label="Communication"
                        />
                        <StarRating
                          value={valueRating}
                          onChange={setValueRating}
                          label="Value"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Review Details
                        </label>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a68b6a]"
                          placeholder="Share your experience with this vendor..."
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="wouldRecommend"
                          checked={wouldRecommend}
                          onChange={(e) => setWouldRecommend(e.target.checked)}
                          className="h-4 w-4 text-[#a68b6a] focus:ring-[#a68b6a] border-gray-300 rounded"
                        />
                        <label htmlFor="wouldRecommend" className="ml-2 text-sm text-gray-700">
                          I would recommend this vendor
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push("/moments")}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="px-6 py-2 bg-[#a68b6a] text-white font-semibold rounded-lg hover:bg-[#957a5c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating..." : "Create Moment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
