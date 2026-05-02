"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "../../../lib/supabaseBrowser";

export default function VendorSignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wasSignedOut, setWasSignedOut] = useState(false);
  const resetSuccess = searchParams.get("reset") === "success";

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const { data } = await supabase.auth.getSession();
      if (!cancelled && data.session?.user) {
        // Auto sign out if already logged in
        await supabase.auth.signOut();
        setWasSignedOut(true);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const e1 = email.trim();
    if (!e1) {
      setError("Email is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    setSubmitting(true);

    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: e1,
        password,
      });

      if (signInErr) throw signInErr;
      setPassword("");
      router.push("/vendor/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Failed to sign in.");
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
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Vendor sign in</div>
            <div className="mt-2 text-[13px] text-black/60">Use your email and password to sign in.</div>

            {resetSuccess ? (
              <div className="mt-4 rounded-[3px] border border-[#a68b6a]/30 bg-[#faf6f1] px-4 py-3 text-[13px] text-[#6e4f33]">
                Password reset successful. Please sign in with your new password.
              </div>
            ) : null}

            {wasSignedOut ? (
              <div className="mt-4 rounded-[3px] border border-[#a68b6a]/30 bg-[#faf6f1] px-4 py-3 text-[13px] text-[#6e4f33]">
                You have been signed out. Please sign in again.
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-[3px] border border-[#c17a4e]/30 bg-[#fff7ed] px-4 py-3 text-[13px] text-[#6e4f33]">
                {error}
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
                  placeholder="you@company.com"
                />
              </label>

              <label className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-black/55">Password</span>
                  <a href="/forgot-password" className="text-[11px] font-semibold text-[#6e4f33] hover:underline">
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                  placeholder="Your password"
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="h-10 inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
              >
                {submitting ? "Signing in…" : "Sign in"}
              </button>

              <a className="text-[12px] font-semibold text-[#6e4f33] hover:underline" href="/vendor/signup-link">
                Need access? Create dashboard account
              </a>

              <a className="text-[12px] font-semibold text-[#6e4f33] hover:underline" href="/register">
                New vendor? Register your business
              </a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
