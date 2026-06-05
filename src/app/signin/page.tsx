"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "../../lib/supabaseBrowser";
import { toast } from "../../lib/toast";

function normalizeReturnTo(v: string | null) {
  const raw = (v ?? "").trim();
  if (!raw) return "/";
  if (!raw.startsWith("/")) return "/";
  return raw;
}

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const returnTo = normalizeReturnTo(searchParams.get("returnTo"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

    const e1 = email.trim();
    if (!e1) {
      toast.error("Email is required.");
      return;
    }

    if (!password) {
      toast.error("Password is required.");
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
      router.push(returnTo);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-10 sm:py-14">
        <div className="rounded-xl border border-black/6 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] p-6 sm:p-8">
          <div className="text-[13px] font-medium text-black/45 font-[family-name:var(--font-plus-jakarta)]">Welcome back</div>
          <h1 className="mt-1 text-[28px] sm:text-[32px] font-medium tracking-[-0.02em] text-[#2c2c2c] font-headline font-[family-name:var(--font-plus-jakarta)]">
            Sign in
          </h1>
          <div className="mt-2 text-[14px] text-black/55 font-[family-name:var(--font-plus-jakarta)]">
            Use your email and password to sign in.
          </div>

            {resetSuccess ? (
              <div className="mt-6 rounded-lg border border-[#a68b6a]/30 bg-[#faf6f1] px-4 py-3 text-[13px] text-[#6e4f33] font-[family-name:var(--font-plus-jakarta)]">
                Password reset successful. Please sign in with your new password.
              </div>
            ) : null}

            {wasSignedOut ? (
              <div className="mt-6 rounded-lg border border-[#a68b6a]/30 bg-[#faf6f1] px-4 py-3 text-[13px] text-[#6e4f33] font-[family-name:var(--font-plus-jakarta)]">
                You have been signed out. Please sign in again.
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-8 grid gap-5">
              <label className="grid gap-1.5">
                <span className="text-[13px] font-medium text-[#2c2c2c] font-[family-name:var(--font-plus-jakarta)]">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15 font-[family-name:var(--font-plus-jakarta)]"
                  placeholder="you@example.com"
                />
              </label>

              <label className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-[#2c2c2c] font-[family-name:var(--font-plus-jakarta)]">Password</span>
                  <a href="/forgot-password" className="text-[13px] font-medium text-[#8e6a46] hover:text-[#6e4f33] transition-colors font-[family-name:var(--font-plus-jakarta)]">
                    Create / Forgot Password?
                  </a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15 font-[family-name:var(--font-plus-jakarta)]"
                  placeholder="Your password"
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 h-11 inline-flex items-center justify-center px-5 rounded-lg text-white text-[14px] font-medium transition-colors disabled:opacity-60 font-[family-name:var(--font-plus-jakarta)]"
                style={{ backgroundColor: 'var(--muted-brown)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted-brown-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--muted-brown)'}
              >
                {submitting ? "Signing in…" : "Sign in"}
              </button>

              <div className="mt-4 flex flex-col gap-2">
                <a className="text-[14px] font-medium text-[#8e6a46] hover:text-[#6e4f33] transition-colors font-[family-name:var(--font-plus-jakarta)]" href={`/soon-to-wed/signup?returnTo=${encodeURIComponent(returnTo)}`}>
                  New here? Create an account
                </a>

                <a className="text-[14px] font-medium text-[#8e6a46] hover:text-[#6e4f33] transition-colors font-[family-name:var(--font-plus-jakarta)]" href="/vendor/signin">
                  Are you a vendor? Sign in here
                </a>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#fafafa]">
        <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-10 sm:py-14 animate-pulse">
          <div className="rounded-xl border border-black/6 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] p-6 sm:p-8">
            <div className="h-4 w-24 rounded bg-black/10" />
            <div className="mt-2 h-8 w-40 rounded bg-black/10" />
            <div className="mt-2 h-4 w-64 rounded bg-black/5" />

            <div className="mt-8 grid gap-5">
              <div className="grid gap-1.5">
                <div className="h-4 w-12 rounded bg-black/5" />
                <div className="h-11 rounded-lg bg-black/[0.03]" />
              </div>

              <div className="grid gap-1.5">
                <div className="flex justify-between">
                  <div className="h-4 w-16 rounded bg-black/5" />
                  <div className="h-4 w-32 rounded bg-black/5" />
                </div>
                <div className="h-11 rounded-lg bg-black/[0.03]" />
              </div>

              <div className="h-11 rounded-lg bg-black/10 mt-2" />

              <div className="mt-4 flex flex-col gap-2">
                <div className="h-4 w-40 rounded bg-black/5" />
                <div className="h-4 w-48 rounded bg-black/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <SignInPageContent />
    </React.Suspense>
  );
}
