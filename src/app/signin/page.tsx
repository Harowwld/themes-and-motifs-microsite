"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "../../lib/supabaseBrowser";

function normalizeReturnTo(v: string | null) {
  const raw = (v ?? "").trim();
  if (!raw) return "/";
  if (!raw.startsWith("/")) return "/";
  return raw;
}

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const returnTo = normalizeReturnTo(searchParams.get("returnTo"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const { data } = await supabase.auth.getSession();
      if (!cancelled && data.session?.user) {
        router.push(returnTo);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router, supabase, returnTo]);

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
      router.push(returnTo);
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
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Sign in to review</div>
            <div className="mt-2 text-[13px] text-black/60">Use your email and password to sign in.</div>

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

              <a
                className="text-[12px] font-semibold text-[#6e4f33] hover:underline"
                href={`/forgot-password?email=${encodeURIComponent(email.trim())}&next=${encodeURIComponent(`/signin?returnTo=${encodeURIComponent(returnTo)}`)}`}
              >
                Forgot password?
              </a>

              <a className="text-[12px] font-semibold text-[#6e4f33] hover:underline" href={`/signup-link?returnTo=${encodeURIComponent(returnTo)}`}>
                New here? Create an account
              </a>

              <a className="text-[12px] font-semibold text-[#6e4f33] hover:underline" href="/vendor/signin">
                Are you a vendor? Sign in here
              </a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
