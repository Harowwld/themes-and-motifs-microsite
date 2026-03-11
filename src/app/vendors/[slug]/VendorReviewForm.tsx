"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "../../../lib/supabaseBrowser";

type Props = {
  vendorId: number;
  vendorSlug: string;
};

export default function VendorReviewForm({ vendorId, vendorSlug }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [isVendor, setIsVendor] = useState(false);

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            authorization: `Bearer ${session.access_token}`,
          },
        });
        const json = (await res.json().catch(() => null)) as { isVendor?: boolean } | null;
        setIsVendor(Boolean(json?.isVendor));
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
    setError(null);
    setSuccess(null);

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
        setError(json?.error ?? "Failed to submit review.");
        return;
      }

      setSuccess("Review submitted.");
      setReviewText("");
      router.refresh();
    } catch {
      setError("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) {
    return (
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
        <div className="h-4 w-40 rounded bg-black/10 animate-pulse" />
        <div className="mt-3 h-10 w-full rounded-[3px] bg-black/10 animate-pulse" />
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
        <div className="text-[13px] font-semibold text-[#2c2c2c]">Write a review</div>
        <div className="mt-1 text-[13px] text-black/55">Sign in first to leave a review.</div>
        <button
          type="button"
          onClick={goToSignIn}
          className="mt-4 h-10 inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors"
        >
          Sign in
        </button>
      </div>
    );
  }

  if (isVendor) {
    return (
      <div className="rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
        <div className="text-[13px] font-semibold text-[#2c2c2c]">Write a review</div>
        <div className="mt-1 text-[13px] text-black/55">Vendor accounts can’t submit reviews.</div>
      </div>
    );
  }

  return (
    <div className="rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
      <div className="text-[13px] font-semibold text-[#2c2c2c]">Write a review</div>
      <div className="mt-1 text-[13px] text-black/55">Share your experience to help other couples.</div>

      {error ? (
        <div className="mt-4 rounded-[3px] border border-[#b42318]/20 bg-[#fff1f3] px-4 py-3 text-[13px] text-[#7a271a]">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 rounded-[3px] border border-[#a67c52]/25 bg-[#fffaf5] px-4 py-3 text-[13px] text-[#2c2c2c]">
          {success}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        <label className="grid gap-1">
          <span className="text-[12px] font-semibold text-black/55">Rating</span>
          <select
            value={String(rating)}
            onChange={(e) => setRating(Number(e.target.value) || 5)}
            className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-black/70 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
          >
            <option value="5">5 / 5</option>
            <option value="4">4 / 5</option>
            <option value="3">3 / 5</option>
            <option value="2">2 / 5</option>
            <option value="1">1 / 5</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-[12px] font-semibold text-black/55">Review</span>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="min-h-24 rounded-[3px] border border-black/10 bg-white px-3 py-2 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
            placeholder="Optional. What did you like? Any tips for others?"
          />
        </label>

        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting}
          className="h-10 inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </div>
    </div>
  );
}
