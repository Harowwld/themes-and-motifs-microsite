"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import SiteHeader from "../sections/SiteHeader";
import SiteFooter from "../sections/SiteFooter";

type SavedVendor = {
  id: string;
  created_at: string;
  vendor: {
    id: number;
    business_name: string;
    slug: string;
    logo_url: string | null;
    cover_focus_x: number | null;
    cover_focus_y: number | null;
    cover_zoom: number | null;
    city: string | null;
    location_text: string | null;
    average_rating: number | null;
    review_count: number | null;
    starting_price: number | null;
    price_range: string | null;
    plan: { name: string } | null;
  };
};

function proxiedImageUrl(url: string | null | undefined) {
  const u = (url ?? "").trim();
  if (!u) return null;
  if (u.includes("drive.google.com")) {
    return `/api/image-proxy?url=${encodeURIComponent(u)}`;
  }
  return u;
}

function VendorCard({ vendor, onRemove }: { vendor: SavedVendor["vendor"]; onRemove: () => void }) {
  const logoUrl = proxiedImageUrl(vendor.logo_url);
  const location = vendor.city ?? vendor.location_text;
  const rating = vendor.average_rating ?? 0;
  const reviews = vendor.review_count ?? 0;

  const planName = String(vendor.plan?.name ?? "").trim().toLowerCase();
  const isPremium = planName.includes("premium");

  return (
    <div className="group relative rounded-xl border border-black/5 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.04)] transition-all duration-300">
      <a href={`/vendors/${encodeURIComponent(vendor.slug)}`} className="block">
        <div className="h-32 bg-gradient-to-br from-[#a68b6a]/10 to-white relative">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
            className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-md text-[#a68b6a] hover:bg-[#a68b6a] hover:text-white transition-all duration-200"
            aria-label="Remove from saved"
          >
            <svg className="h-4 w-4" fill="currentColor" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>
        <div className="relative px-4 pb-4">
          <div className="relative -mt-10 mb-2 flex items-end justify-between">
            <div className="h-20 w-20 rounded-2xl border-4 border-white bg-[#fcfbf9] shadow-lg overflow-hidden flex items-center justify-center shrink-0 -ml-1">
              {logoUrl ? (
                <img src={logoUrl} alt={`${vendor.business_name} logo`} className="h-full w-full object-contain" loading="lazy" referrerPolicy="no-referrer" />
              ) : (
                <div className="h-full w-full bg-[#fcfbf9]" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-[14px] sm:text-[15px] font-semibold text-neutral-800 leading-5 line-clamp-1 mb-1 font-[family-name:var(--font-plus-jakarta)]">
            <span className="truncate">{vendor.business_name}</span>
            {isPremium ? (
              <span className="inline-flex items-center justify-center h-3.75 w-3.75 shrink-0" title="Verified Premium Vendor">
                <img src="/Icons/hd-blue-badge-verified-tick-mark-png-704081694710438adyvtbqafw.png" alt="Verified" className="h-full w-full" loading="lazy" draggable={false} />
              </span>
            ) : null}
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

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<any>(null);
  const [savedVendors, setSavedVendors] = useState<SavedVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedVendors = useCallback(async (token: string) => {
    try {
      const res = await fetch("/api/saved-vendors", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSavedVendors(data.savedVendors ?? []);
    } catch (err: any) {
      console.error("Error fetching saved vendors:", err);
      setError(err.message ?? "Failed to load saved vendors");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!cancelled && !session?.user) {
        router.push("/signin?redirect=/dashboard");
        return;
      }

      if (!cancelled) {
        setUser(session?.user);
        await fetchSavedVendors(session?.access_token ?? "");
        setLoading(false);
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router, supabase, fetchSavedVendors]);

  const handleRemove = async (vendorId: number) => {
    const token = (await supabase.auth.getSession()).data.session?.access_token ?? "";
    try {
      await fetch(`/api/saved-vendors?vendorId=${vendorId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      setSavedVendors((prev) => prev.filter((sv) => sv.vendor.id !== vendorId));
    } catch (err) {
      console.error("Error removing vendor:", err);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <SiteHeader />
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 py-10 sm:py-14">
          <div className="h-8 w-48 bg-black/10 animate-pulse rounded mb-8" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SiteHeader />
      
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.01em] text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
              My Wedding
            </h1>
            <p className="mt-1 text-[14px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)]">
              Manage your saved vendors and wedding planning
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-[13px] font-medium text-neutral-500 hover:text-[#a68b6a] transition-colors font-[family-name:var(--font-plus-jakarta)]"
          >
            Sign out
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-[13px] text-red-600 font-[family-name:var(--font-plus-jakarta)]">
            {error}
          </div>
        )}

        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <svg className="h-5 w-5 text-[#a68b6a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <h2 className="text-[18px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
              Saved Vendors
            </h2>
            <span className="text-[13px] text-neutral-400 font-[family-name:var(--font-plus-jakarta)]">
              ({savedVendors.length})
            </span>
          </div>

          {savedVendors.length === 0 ? (
            <div className="rounded-xl border border-black/10 bg-white p-8 text-center">
              <svg className="h-12 w-12 mx-auto text-neutral-300 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <p className="text-[14px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)]">
                No saved vendors yet
              </p>
              <p className="text-[13px] text-neutral-400 mt-1 font-[family-name:var(--font-plus-jakarta)]">
                Browse vendors and click the heart icon to save them here
              </p>
              <a
                href="/vendors"
                className="inline-block mt-4 px-5 py-2.5 bg-[#a68b6a] text-white text-[13px] font-semibold rounded-lg hover:bg-[#957a5c] transition-colors font-[family-name:var(--font-plus-jakarta)]"
              >
                Browse Vendors
              </a>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {savedVendors.map((sv) => (
                <VendorCard key={sv.id} vendor={sv.vendor} onRemove={() => handleRemove(sv.vendor.id)} />
              ))}
            </div>
          )}
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <svg className="h-5 w-5 text-[#a68b6a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
            <h2 className="text-[18px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
              Active Inquiries
            </h2>
          </div>
          <div className="rounded-xl border border-black/10 bg-white p-8 text-center">
            <svg className="h-12 w-12 mx-auto text-neutral-300 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
            <p className="text-[14px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)]">
              No active inquiries yet
            </p>
            <p className="text-[13px] text-neutral-400 mt-1 font-[family-name:var(--font-plus-jakarta)]">
              Inquire with vendors to start a conversation
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <svg className="h-5 w-5 text-[#a68b6a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <h2 className="text-[18px] font-semibold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
              Booked Vendors
            </h2>
          </div>
          <div className="rounded-xl border border-black/10 bg-white p-8 text-center">
            <svg className="h-12 w-12 mx-auto text-neutral-300 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <p className="text-[14px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)]">
              No booked vendors yet
            </p>
            <p className="text-[13px] text-neutral-400 mt-1 font-[family-name:var(--font-plus-jakarta)]">
              Your confirmed bookings will appear here
            </p>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
