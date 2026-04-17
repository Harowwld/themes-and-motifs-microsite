"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "../../lib/supabaseBrowser";

type Step = "verifying" | "set_password" | "done" | "error";

function normalizeNext(v: string | null) {
  const raw = (v ?? "").trim();
  if (!raw) return "/signin";
  if (!raw.startsWith("/")) return "/signin";
  return raw;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const next = normalizeNext(searchParams.get("next"));

  const [step, setStep] = useState<Step>("verifying");
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      setStep("verifying");

      const type = searchParams.get("type");
      const tokenHash = searchParams.get("token_hash");
      const code = searchParams.get("code");

      try {
        if (type && tokenHash) {
          const { error: verifyErr } = await supabase.auth.verifyOtp({
            type: type as any,
            token_hash: tokenHash,
          });
          if (verifyErr) throw verifyErr;
        } else if (code) {
          const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchErr) throw exchErr;
        }

        const { data, error: sessErr } = await supabase.auth.getSession();
        if (sessErr) throw sessErr;

        if (!data.session?.user) {
          throw new Error("Reset link is invalid or expired.");
        }

        if (!cancelled) setStep("set_password");
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? "Failed to verify reset link.");
          setStep("error");
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [searchParams, supabase]);

  async function onSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const p1 = password.trim();
    if (p1.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (p1 !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const { error: updErr } = await supabase.auth.updateUser({ password: p1 });
      if (updErr) throw updErr;

      setPassword("");
      setConfirmPassword("");
      setStep("done");

      await supabase.auth.signOut();
      router.replace(next);
    } catch (e: any) {
      setError(e?.message ?? "Failed to reset password.");
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
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Reset password</div>

            {step === "verifying" ? (
              <div className="mt-2 text-[13px] text-black/60">Verifying your link…</div>
            ) : null}

            {step === "error" ? (
              <div className="mt-4 rounded-[3px] border border-[#b42318]/20 bg-[#fff1f3] px-4 py-3 text-[13px] text-[#7a271a]">
                {error ?? "Failed to verify reset link."}
              </div>
            ) : null}

            {step === "set_password" ? (
              <form onSubmit={onSetPassword} className="mt-6 grid gap-4">
                <div className="text-[13px] text-black/60">Choose a new password.</div>

                {error ? (
                  <div className="rounded-[3px] border border-[#b42318]/20 bg-[#fff1f3] px-4 py-3 text-[13px] text-[#7a271a]">
                    {error}
                  </div>
                ) : null}

                <label className="grid gap-1.5">
                  <span className="text-[12px] font-semibold text-black/55">New password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                    placeholder="At least 8 characters"
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-[12px] font-semibold text-black/55">Confirm password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                    placeholder="Repeat new password"
                  />
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
                >
                  {submitting ? "Saving…" : "Update password"}
                </button>

                <a className="text-[12px] font-semibold text-[#6e4f33] hover:underline" href={next}>
                  Back to sign in
                </a>
              </form>
            ) : null}

            {step === "done" ? (
              <div className="mt-4 rounded-[3px] border border-black/10 bg-[#fcfbf9] px-4 py-3 text-[13px] text-black/70">
                Password updated. Redirecting…
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
