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

export default function SoonToWedSignupLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const returnTo = normalizeReturnTo(searchParams.get("returnTo"));

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const { data } = await supabase.auth.getSession();
      if (!cancelled && data.session?.user) {
        router.push(returnTo);
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
    setSentTo(null);

    const e1 = email.trim();
    if (!e1) {
      setError("Email is required.");
      return;
    }

    setSubmitting(true);

    try {
      const redirectTo = `${window.location.origin}/soon-to-wed/callback?returnTo=${encodeURIComponent(returnTo)}`;
      const { error: signInErr } = await supabase.auth.signInWithOtp({
        email: e1,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (signInErr) throw signInErr;
      setSentTo(e1);
      setEmail("");
    } catch (err: any) {
      setError(err?.message ?? "Failed to send sign-up link.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(circle at 20% 10%, #fff7ed, #fcfbf9 42%, #f6f1ea 92%)",
      }}
    >
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-12">
        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="p-7">
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Create account</div>
            <div className="mt-2 text-[13px] text-black/60">We’ll email you a sign-up link.</div>

            {error ? (
              <div className="mt-4 rounded-[3px] border border-[#c17a4e]/30 bg-[#fff7ed] px-4 py-3 text-[13px] text-[#6e4f33]">
                {error}
              </div>
            ) : null}

            {sentTo ? (
              <div className="mt-4 rounded-[3px] border border-black/10 bg-[#fcfbf9] px-4 py-3 text-[13px] text-black/70">
                Sign-up link sent to <span className="font-semibold text-[#2c2c2c]">{sentTo}</span>.
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

              <button
                type="submit"
                disabled={submitting}
                className="h-10 inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Email me a sign-up link"}
              </button>

              <a
                className="text-[12px] font-semibold text-[#6e4f33] hover:underline"
                href={`/soon-to-wed/signin?returnTo=${encodeURIComponent(returnTo)}`}
              >
                Already have an account? Sign in
              </a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
