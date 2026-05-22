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
  const [groomNickname, setGroomNickname] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [weddingDatePublic, setWeddingDatePublic] = useState(false);
  const [weddingVenueArea, setWeddingVenueArea] = useState("");
  const [weddingVenuePublic, setWeddingVenuePublic] = useState(false);
  const [location, setLocation] = useState("");
  const [profileVisibility, setProfileVisibility] = useState<"public" | "private">("private");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [regions, setRegions] = useState<{ id: number; name: string }[]>([]);
  const [cities, setCities] = useState<{ id: number; name: string; region_id: number }[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [loadingLocations, setLoadingLocations] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadLocations() {
      try {
        const [
          { data: regionRows },
          { data: cityRowsPart1 },
          { data: cityRowsPart2 }
        ] = await Promise.all([
          supabase.from("regions").select("id, name, parent_id").order("name", { ascending: true }).limit(2000),
          supabase.from("cities").select("id, name, region_id").order("name", { ascending: true }).range(0, 999),
          supabase.from("cities").select("id, name, region_id").order("name", { ascending: true }).range(1000, 1999),
        ]);

        if (cancelled) return;

        const allRegions = (regionRows ?? []) as { id: number; name: string; parent_id: number | null }[];
        const filteredRegions = allRegions.filter((r) => r.parent_id == null).map((r) => ({ id: r.id, name: r.name }));
        const loadedCities = [
          ...(cityRowsPart1 ?? []),
          ...(cityRowsPart2 ?? [])
        ] as { id: number; name: string; region_id: number }[];

        setRegions(filteredRegions);
        setCities(loadedCities);
      } catch (err) {
        console.error("Failed to load locations:", err);
      } finally {
        if (!cancelled) {
          setLoadingLocations(false);
        }
      }
    }
    void loadLocations();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const regionRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) {
        setShowRegionDropdown(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cityOptions = useMemo(() => {
    if (!selectedRegionId) return cities;
    return cities.filter((c) => c.region_id === Number(selectedRegionId));
  }, [cities, selectedRegionId]);

  const matchingRegions = useMemo(() => {
    const term = location.trim().toLowerCase();
    if (!term) return regions;
    return regions.filter((r) => r.name.toLowerCase().includes(term));
  }, [regions, location]);

  const isValidRegion = useMemo(() => {
    if (!location.trim()) return true;
    return regions.some((r) => r.name.toLowerCase() === location.toLowerCase());
  }, [regions, location]);

  const matchingCities = useMemo(() => {
    const term = weddingVenueArea.trim().toLowerCase();
    if (!term) return cityOptions;
    return cities.filter((c) => c.name.toLowerCase().includes(term));
  }, [cities, cityOptions, weddingVenueArea]);

  const isValidCity = useMemo(() => {
    if (!weddingVenueArea.trim()) return true;
    return cities.some((c) => c.name.toLowerCase() === weddingVenueArea.toLowerCase());
  }, [cities, weddingVenueArea]);

  const handleLocationChange = (val: string) => {
    setLocation(val);
    const match = regions.find((r) => r.name.toLowerCase() === val.trim().toLowerCase());
    if (match) {
      setSelectedRegionId(String(match.id));
      setLocation(match.name);
      setWeddingVenueArea("");
    } else {
      setSelectedRegionId("");
    }
  };

  const selectRegion = (id: number, name: string) => {
    setSelectedRegionId(String(id));
    setLocation(name);
    setWeddingVenueArea("");
    setShowRegionDropdown(false);
  };

  const handleVenueChange = (val: string) => {
    setWeddingVenueArea(val);
    const match = cities.find((c) => c.name.toLowerCase() === val.trim().toLowerCase());
    if (match) {
      setWeddingVenueArea(match.name);
      if (match.region_id && String(match.region_id) !== selectedRegionId) {
        setSelectedRegionId(String(match.region_id));
        const regName = regions.find((r) => r.id === match.region_id)?.name ?? "";
        setLocation(regName);
      }
    }
  };

  const selectCity = (name: string, regionId: number) => {
    setWeddingVenueArea(name);
    if (regionId && String(regionId) !== selectedRegionId) {
      setSelectedRegionId(String(regionId));
      const regName = regions.find((r) => r.id === regionId)?.name ?? "";
      setLocation(regName);
    }
    setShowCityDropdown(false);
  };

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
    const groom = groomNickname.trim();
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
      toast.error("Nickname of bride is required.");
      setSubmitting(false);
      return;
    }

    if (!groom) {
      toast.error("Nickname of groom is required.");
      setSubmitting(false);
      return;
    }

    if (!loc) {
      toast.error("Location is required.");
      setSubmitting(false);
      return;
    }

    if (!regions.some(r => r.name.toLowerCase() === loc.toLowerCase())) {
      toast.error("Please select a location from our records.");
      setSubmitting(false);
      return;
    }

    if (venue && !cities.some(c => c.name.toLowerCase() === venue.toLowerCase())) {
      toast.error("Please select a wedding venue area from our records.");
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
      });

      if (signUpErr) {
        if (signUpErr.message.includes("User already registered") || signUpErr.message.includes("already exists")) {
          toast.error("An account with this email already exists. Please sign in.");
          setSubmitting(false);
          return;
        }
        throw signUpErr;
      }

      const user = signUpData.session?.user ?? null;
      if (!user) {
        setSuccess("Account created. Please check your email to confirm your account.");
        setPassword("");
        setSubmitting(false);
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

              <div className="grid gap-1.5 relative" ref={regionRef}>
                <span className="text-[12px] font-semibold text-black/55">Location (based on ceremony venue)</span>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    onFocus={() => setShowRegionDropdown(true)}
                    placeholder={loadingLocations ? "Loading locations..." : "Type or select location"}
                    disabled={loadingLocations}
                    className={`h-10 w-full rounded-[3px] border px-3 text-[14px] outline-none focus:ring-2 transition-all ${
                      !isValidRegion
                        ? "border-red-500 bg-red-50/50 text-red-900 focus:border-red-500 focus:ring-red-100"
                        : "border-black/10 bg-white text-[#2c2c2c] focus:border-[#a67c52]/50 focus:ring-[#a67c52]/15"
                    }`}
                  />
                  {loadingLocations && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-black/40">Loading...</span>
                  )}
                </div>
                {showRegionDropdown && matchingRegions.length > 0 && (
                  <div className="absolute top-[calc(100%+4px)] left-0 z-50 w-full max-h-60 overflow-y-auto rounded-[3px] border border-black/10 bg-white shadow-lg py-1">
                    {matchingRegions.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => selectRegion(r.id, r.name)}
                        className="w-full px-3 py-2 text-left text-[14px] text-[#2c2c2c] hover:bg-black/5 transition-colors font-medium"
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>
                )}
                {!isValidRegion && (
                  <span className="text-[11px] text-red-600 font-medium">This location is not in our records.</span>
                )}
              </div>

              <div className="grid gap-1.5 relative" ref={cityRef}>
                <span className="text-[12px] font-semibold text-black/55">Venue of Wedding (Area)</span>
                <div className="relative">
                  <input
                    type="text"
                    value={weddingVenueArea}
                    onChange={(e) => handleVenueChange(e.target.value)}
                    onFocus={() => setShowCityDropdown(true)}
                    placeholder={loadingLocations ? "Loading venue areas..." : "Type or select venue area"}
                    disabled={loadingLocations}
                    className={`h-10 w-full rounded-[3px] border px-3 text-[14px] outline-none focus:ring-2 transition-all ${
                      !isValidCity
                        ? "border-red-500 bg-red-50/50 text-red-900 focus:border-red-500 focus:ring-red-100"
                        : "border-black/10 bg-white text-[#2c2c2c] focus:border-[#a67c52]/50 focus:ring-[#a67c52]/15"
                    }`}
                  />
                </div>
                {showCityDropdown && matchingCities.length > 0 && (
                  <div className="absolute top-[calc(100%+4px)] left-0 z-50 w-full max-h-60 overflow-y-auto rounded-[3px] border border-black/10 bg-white shadow-lg py-1">
                    {matchingCities.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectCity(c.name, c.region_id)}
                        className="w-full px-3 py-2 text-left text-[14px] text-[#2c2c2c] hover:bg-black/5 transition-colors font-medium"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
                {!isValidCity && (
                  <span className="text-[11px] text-red-600 font-medium">This venue area is not in our records.</span>
                )}
              </div>

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
