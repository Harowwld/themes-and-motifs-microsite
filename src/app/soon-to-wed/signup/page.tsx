"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "../../../lib/supabaseBrowser";

function normalizeReturnTo(v: string | null) {
  const raw = (v ?? "").trim();
  if (!raw) return "/vendors";
  if (!raw.startsWith("/")) return "/vendors";
  return raw;
}

function normalizeVisibility(v: string) {
  const x = (v ?? "").trim().toLowerCase();
  if (x === "public" || x === "private") return x;
  return "private";
}

export default function SoonToWedSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const returnTo = normalizeReturnTo(searchParams.get("returnTo"));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [brideNickname, setBrideNickname] = useState("");
  const [groomNickname, setGroomNickname] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [weddingDatePublic, setWeddingDatePublic] = useState(false);
  const [weddingVenueArea, setWeddingVenueArea] = useState("");
  const [weddingVenuePublic, setWeddingVenuePublic] = useState(false);
  const [location, setLocation] = useState("");
  const [profileVisibility, setProfileVisibility] = useState<"public" | "private">("private");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      setSuccess(null);

      const { data } = await supabase.auth.getSession();
      if (!cancelled && data.session?.user) {
        router.replace(returnTo);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [router, supabase, returnTo]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const e1 = email.trim();

    const bride = brideNickname.trim();
    const groom = groomNickname.trim();
    const venue = weddingVenueArea.trim();
    const loc = location.trim();

    if (!e1) {
      setError("Email is required.");
      return;
    }

    if (!bride) {
      setError("Nickname of bride is required.");
      return;
    }

    if (!groom) {
      setError("Nickname of groom is required.");
      return;
    }

    if (!loc) {
      setError("Location is required.");
      return;
    }

    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the terms & conditions.");
      return;
    }

    setSubmitting(true);

    try {
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: e1,
        password,
      });

      if (signUpErr) throw signUpErr;

      const user = signUpData.session?.user ?? null;
      if (!user) {
        setSuccess("Account created. Please check your email to confirm your account.");
        setPassword("");
        return;
      }

      const { error: upsertErr } = await supabase.from("soon_to_wed_profiles").upsert(
        {
          user_id: user.id,
          bride_nickname: bride,
          groom_nickname: groom,
          wedding_date: weddingDate ? weddingDate : null,
          wedding_date_public: Boolean(weddingDatePublic),
          wedding_venue_area: venue ? venue : null,
          wedding_venue_public: Boolean(weddingVenuePublic),
          location: loc,
          profile_visibility: profileVisibility,
        },
        { onConflict: "user_id" }
      );

      if (upsertErr) throw upsertErr;

      setPassword("");

      router.replace(returnTo);
    } catch (err: any) {
      setError(err?.message ?? "Failed to save your profile.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#fafafa]"
    >
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-12">
        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="p-7">
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Create account</div>
            <div className="mt-2 text-[13px] text-black/60">Create your account and complete your profile.</div>

            {error ? (
              <div className="mt-4 rounded-[3px] border border-[#b42318]/20 bg-[#fff1f3] px-4 py-3 text-[13px] text-[#7a271a]">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mt-4 rounded-[3px] border border-black/10 bg-[#fcfbf9] px-4 py-3 text-[13px] text-black/70">
                {success}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              <label className="grid gap-1.5">
                <span className="text-[12px] font-semibold text-black/55">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                  placeholder="you@example.com"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-[12px] font-semibold text-black/55">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                  placeholder="At least 8 characters"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-[12px] font-semibold text-black/55">Nickname of Bride</span>
                <input
                  value={brideNickname}
                  onChange={(e) => setBrideNickname(e.target.value)}
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                  placeholder="e.g. Jen"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-[12px] font-semibold text-black/55">Nickname of Groom</span>
                <input
                  value={groomNickname}
                  onChange={(e) => setGroomNickname(e.target.value)}
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                  placeholder="e.g. Mark"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-[12px] font-semibold text-black/55">Date of Wedding</span>
                <input
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-black/70 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                />
              </label>

              <label className="flex items-center gap-2 text-[13px] text-black/70">
                <input
                  type="checkbox"
                  checked={weddingDatePublic}
                  onChange={(e) => setWeddingDatePublic(e.target.checked)}
                />
                Make wedding date public
              </label>

              <label className="grid gap-1.5">
                <span className="text-[12px] font-semibold text-black/55">Venue of Wedding (Area)</span>
                <input
                  value={weddingVenueArea}
                  onChange={(e) => setWeddingVenueArea(e.target.value)}
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                  placeholder="e.g. Tagaytay"
                />
              </label>

              <label className="flex items-center gap-2 text-[13px] text-black/70">
                <input
                  type="checkbox"
                  checked={weddingVenuePublic}
                  onChange={(e) => setWeddingVenuePublic(e.target.checked)}
                />
                Make wedding venue public
              </label>

              <label className="grid gap-1.5">
                <span className="text-[12px] font-semibold text-black/55">Location (based on ceremony venue)</span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                  placeholder="e.g. Cavite"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-[12px] font-semibold text-black/55">Public or Private</span>
                <select
                  value={profileVisibility}
                  onChange={(e) => setProfileVisibility(normalizeVisibility(e.target.value) as any)}
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-black/70 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </label>

              <label className="flex items-center gap-2 text-[13px] text-black/70">
                <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                Agree to Terms &amp; Conditions
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="h-10 inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Continue"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
