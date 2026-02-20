"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "../../../lib/supabaseBrowser";

type Step = "verifying" | "set_password" | "done" | "error";

export default function VendorSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("verifying");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

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
        } else {
          // If Supabase placed tokens in the URL hash, detectSessionInUrl should pick it up.
          const { error: sessErr } = await supabase.auth.getSession();
          if (sessErr) throw sessErr;
        }

        const { data, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) throw sessionErr;

        if (!data.session?.user) {
          throw new Error("Signup link is invalid or expired.");
        }

        if (!cancelled) {
          setEmail(data.session.user.email ?? null);
          setStep("set_password");
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? "Failed to verify signup link.");
          setStep("error");
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [searchParams, supabase]);

  async function onSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) throw updErr;

      setStep("done");
      router.push("/vendor/dashboard");
    } catch (e: any) {
      setError(e?.message ?? "Failed to set password.");
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
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Vendor signup</div>

            {step === "verifying" ? (
              <div className="mt-3 text-[13px] text-black/60">Verifying your signup link…</div>
            ) : null}

            {step === "error" ? (
              <div className="mt-4 rounded-[3px] border border-[#c17a4e]/30 bg-[#fff7ed] px-4 py-3 text-[13px] text-[#6e4f33]">
                {error ?? "Failed to verify signup link."}
              </div>
            ) : null}

            {step === "set_password" ? (
              <form onSubmit={onSetPassword} className="mt-6 grid gap-4">
                <div className="text-[13px] text-black/60">Set a password for your vendor dashboard account.</div>

                {error ? (
                  <div className="rounded-[3px] border border-[#c17a4e]/30 bg-[#fff7ed] px-4 py-3 text-[13px] text-[#6e4f33]">
                    {error}
                  </div>
                ) : null}

                <label className="grid gap-1.5">
                  <span className="text-[12px] font-semibold text-black/55">Email</span>
                  <input
                    value={email ?? ""}
                    disabled
                    className="h-10 rounded-[3px] border border-black/10 bg-[#fcfbf9] px-3 text-[14px] text-black/60"
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
                >
                  {submitting ? "Saving…" : "Continue to dashboard"}
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
