"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "../../../lib/supabaseBrowser";
import { Star } from "lucide-react";
import { toast } from "@/lib/toast";

type Props = {
  vendorId: number;
  vendorSlug: string;
};

export default function VendorReviewForm({ vendorId, vendorSlug }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const meCacheRef = useRef<{ token: string; at: number; isVendor: boolean } | null>(null);
  const meInFlightRef = useRef<Promise<{ isVendor: boolean } | null> | null>(null);

  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [isVendor, setIsVendor] = useState(false);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const { data } = await supabase.auth.getSession();
      const session = data.session ?? null;

      if (cancelled) return;

      setSignedIn(Boolean(session?.user));

      if (!session?.access_token) {
        setIsVendor(false);
        setReady(true);
        return;
      }

      const token = session.access_token;
      const now = Date.now();
      const cached = meCacheRef.current;
      const ttlMs = 30_000;
      if (cached && cached.token === token && now - cached.at < ttlMs) {
        setIsVendor(cached.isVendor);
        setReady(true);
        return;
      }

      if (!meInFlightRef.current) {
        meInFlightRef.current = (async () => {
          try {
            const res = await fetch("/api/auth/me", {
              headers: {
                authorization: `Bearer ${token}`,
              },
            });
            const json = (await res.json().catch(() => null)) as { isVendor?: boolean } | null;
            return { isVendor: Boolean(json?.isVendor) };
          } catch {
            return null;
          }
        })().finally(() => {
          meInFlightRef.current = null;
        });
      }

      try {
        const me = await meInFlightRef.current;
        if (!me) throw new Error("me fetch failed");
        meCacheRef.current = { token, at: Date.now(), isVendor: me.isVendor };
        setIsVendor(me.isVendor);
      } catch {
        setIsVendor(false);
      } finally {
        setReady(true);
      }
    }

    run();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void run();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const goToSignIn = () => {
    const returnTo = `/vendors/${encodeURIComponent(vendorSlug)}`;
    router.push(`/signin?returnTo=${encodeURIComponent(returnTo)}`);
  };

  const submit = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token ?? "";

    if (!token) {
      goToSignIn();
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vendorId,
          rating,
          reviewText,
        }),
      });

      const json = (await res.json().catch(() => null)) as { error?: string } | null;

      if (res.status === 401) {
        goToSignIn();
        return;
      }

      if (!res.ok) {
        toast.error(json?.error ?? "Failed to submit review.");
        return;
      }

      toast.success("Review submitted.");
      setReviewText("");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) {
    return (
      <div className="rounded-2xl border border-black/6 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] p-6">
        <div className="h-4 w-40 rounded bg-black/10 animate-pulse" />
        <div className="mt-3 h-10 w-full rounded-lg bg-black/10 animate-pulse" />
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="rounded-2xl border border-black/6 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] p-6">
        <div className="text-[13px] font-semibold text-[#2c2c2c]">Write a review</div>
        <div className="mt-1 text-[13px] text-black/55">Sign in first to leave a review.</div>
        <button
          type="button"
          onClick={goToSignIn}
          className="mt-4 h-10 inline-flex items-center justify-center px-4 rounded-xl bg-[#a68b6a] text-white text-[13px] font-semibold hover:bg-[#957a5c] hover:-translate-y-[1px] active:scale-[0.97] hover:shadow-sm transition-[transform,background-color,box-shadow] duration-200 ease-out"
        >
          Sign in
        </button>
      </div>
    );
  }

  if (isVendor) {
    return (
      <div className="rounded-2xl border border-black/6 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] p-6">
        <div className="text-[13px] font-semibold text-[#2c2c2c]">Write a review</div>
        <div className="mt-1 text-[13px] text-black/55">Vendor accounts cannot submit reviews.</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/6 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] p-6">
      <div className="text-[13px] font-semibold text-[#2c2c2c]">Write a review</div>
      <div className="mt-1 text-[13px] text-black/55">Share your experience to help other couples.</div>


      <div className="mt-4 grid gap-3">
        <div className="grid gap-1">
          <span className="text-[12px] font-semibold text-black/55">Rating</span>
          <div className="flex items-center gap-1.5 py-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating ?? rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 rounded-md text-[#a68b6a] hover:bg-[#a68b6a]/5 hover:scale-110 active:scale-95 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#a68b6a]/40"
                  aria-label={`Rate ${star} out of 5 stars`}
                >
                  <Star
                    size={28}
                    fill={active ? "#a68b6a" : "none"}
                    className={active ? "text-[#a68b6a] transition-colors duration-150" : "text-black/15 transition-colors duration-150"}
                  />
                </button>
              );
            })}
            <span className="ml-2 text-[13px] font-semibold text-[#a68b6a] transition-opacity duration-200">
              {rating === 5 ? "Excellent! (5/5)" :
               rating === 4 ? "Very Good (4/5)" :
               rating === 3 ? "Good (3/5)" :
               rating === 2 ? "Fair (2/5)" :
               "Poor (1/5)"}
            </span>
          </div>
        </div>

        <label className="grid gap-1">
          <span className="text-[12px] font-semibold text-black/55">Review</span>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="min-h-24 rounded-xl border border-black/10 bg-white px-3 py-2 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none hover:border-black/20 focus:border-[#a68b6a]/50 focus:ring-2 focus:ring-[#a68b6a]/15 transition-[border-color,box-shadow] duration-200 ease-out"
            placeholder="Optional. What did you like? Any tips for others?"
          />
        </label>

        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting}
          className="h-10 inline-flex items-center justify-center px-4 rounded-xl bg-[#a68b6a] text-white text-[13px] font-semibold hover:bg-[#957a5c] hover:-translate-y-[1px] active:scale-[0.97] hover:shadow-sm transition-[transform,background-color,box-shadow] duration-200 ease-out disabled:opacity-60 disabled:pointer-events-none"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </div>
    </div>
  );
}
