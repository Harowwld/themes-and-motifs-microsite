"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "../../../lib/supabaseBrowser";
import { toast } from "../../../lib/toast";

function normalizeReturnTo(v: string | null) {
  const raw = (v ?? "").trim();
  if (!raw) return "/";
  if (!raw.startsWith("/")) return "/";
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
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [brideNickname, setBrideNickname] = useState("");
  const [brideLastName, setBrideLastName] = useState("");
  const [groomNickname, setGroomNickname] = useState("");
  const [groomLastName, setGroomLastName] = useState("");
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
    setSuccess(null);

    const e1 = email.trim();

    const bride = brideNickname.trim();
    const brideLast = brideLastName.trim();
    const groom = groomNickname.trim();
    const groomLast = groomLastName.trim();
    const venue = weddingVenueArea.trim();
    const loc = location.trim();

    if (!e1) {
      toast.error("Email is required.");
      return;
    }

    setSubmitting(true);

    try {
      const checkRes = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e1 }),
      });

      const checkData = await checkRes.json();

      if (!checkRes.ok) {
        toast.error(checkData.error || "Email check failed");
        setSubmitting(false);
        return;
      }
    } catch (err) {
      console.error("Email check error:", err);
    }

    if (!bride) {
      toast.error("First name / nickname of bride is required.");
      setSubmitting(false);
      return;
    }

    if (!brideLast) {
      toast.error("Last name of bride is required.");
      setSubmitting(false);
      return;
    }

    if (!groom) {
      toast.error("First name / nickname of groom is required.");
      setSubmitting(false);
      return;
    }

    if (!groomLast) {
      toast.error("Last name of groom is required.");
      setSubmitting(false);
      return;
    }

    if (!loc) {
      toast.error("Wedding or reception area is required.");
      setSubmitting(false);
      return;
    }

    if (password.trim().length < 8) {
      toast.error("Password must be at least 8 characters.");
      setSubmitting(false);
      return;
    }

    if (!agreeTerms) {
      toast.error("You must agree to the terms & conditions.");
      setSubmitting(false);
      return;
    }

    try {
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: e1,
        password,
        options: {
          data: {
            bride_nickname: bride,
            bride_last_name: brideLast,
            groom_nickname: groom,
            groom_last_name: groomLast,
            wedding_date: weddingDate ? weddingDate : null,
            wedding_date_public: Boolean(weddingDatePublic),
            wedding_venue_area: venue ? venue : null,
            wedding_venue_public: Boolean(weddingVenuePublic),
            location: loc,
            profile_visibility: profileVisibility,
          }
        }
      });

      if (signUpErr) {
        if (signUpErr.message.includes("User already registered") || signUpErr.message.includes("already exists")) {
          toast.error("An account with this email already exists. Please sign in.");
          setSubmitting(false);
          return;
        }
        throw signUpErr;
      }

      // The handle_new_user DB trigger automatically inserts the profile server-side
      // using the metadata passed to signUp options.data — no client-side upsert needed,
      // and attempting one would violate RLS since the session JWT doesn't exist yet
      // when email confirmation is required.
      if (!signUpData.user) {
        toast.error("Signup failed — no user returned. Please try again.");
        setSubmitting(false);
        return;
      }

      setPassword("");

      // If no session, email confirmation is required — show success and stay on page
      if (!signUpData.session) {
        setSuccess("Account created. Please check your email to confirm your account.");
        setSubmitting(false);
        return;
      }

      router.replace(returnTo);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save your profile.");
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="grid gap-1.5">
                  <span className="text-[12px] font-semibold text-black/55">Nickname / First Name of Bride</span>
                  <input
                    value={brideNickname}
                    onChange={(e) => setBrideNickname(e.target.value)}
                    className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                    placeholder="e.g. Jen"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-[12px] font-semibold text-black/55">Last Name of Bride</span>
                  <input
                    value={brideLastName}
                    onChange={(e) => setBrideLastName(e.target.value)}
                    className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                    placeholder="e.g. Smith"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="grid gap-1.5">
                  <span className="text-[12px] font-semibold text-black/55">Nickname / First Name of Groom</span>
                  <input
                    value={groomNickname}
                    onChange={(e) => setGroomNickname(e.target.value)}
                    className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                    placeholder="e.g. Mark"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-[12px] font-semibold text-black/55">Last Name of Groom</span>
                  <input
                    value={groomLastName}
                    onChange={(e) => setGroomLastName(e.target.value)}
                    className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                    placeholder="e.g. Miller"
                  />
                </label>
              </div>

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
                <span className="text-[12px] font-semibold text-black/55">Wedding or Reception Area</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Peoria, Illinois"
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-[12px] font-semibold text-black/55">Name of the Venue</span>
                <input
                  type="text"
                  value={weddingVenueArea}
                  onChange={(e) => setWeddingVenueArea(e.target.value)}
                  placeholder="e.g. St. Jude Cathedral"
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
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
