"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { createSupabaseBrowserClient } from "../../lib/supabaseBrowser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pkceError, setPkceError] = useState<string | null>(null);

  // Verify the OTP/token on mount
  useEffect(() => {
    let cancelled = false;

    async function verifyToken() {
      // First check if user already has a valid session (signed in)
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        // User is signed in, they can reset password
        if (!cancelled) {
          setVerifying(false);
        }
        return;
      }

      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      // If we have a code or token_hash, try to verify it
      if (code || tokenHash) {
        try {
          let verifyError: Error | null = null;

          if (tokenHash && type) {
            const result = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: type as any,
            });
            verifyError = result.error;
          } else if (code) {
            const result = await supabase.auth.exchangeCodeForSession(code);
            verifyError = result.error;
          }

          if (verifyError) throw verifyError;
        } catch (err: any) {
          if (!cancelled) {
            setError(
              err?.message ??
                "Invalid or expired reset link. Please request a new one."
            );

            // Check if this is a PKCE error from URL hash
            if (typeof window !== "undefined") {
              const hash = window.location.hash;
              if (hash.includes("error")) {
                const params = new URLSearchParams(hash.slice(1));
                const errorCode = params.get("error");
                const errorDesc = params.get("error_description");
                if (errorCode) {
                  setPkceError(`${errorCode}: ${errorDesc || "An error occurred"}`);
                }
              }
            }
          }
        }
      } else {
        // No code/token and no session - user needs to request a reset link
        if (!cancelled) {
          setError("No reset token found. Please request a new password reset link.");
        }
      }

      if (!cancelled) {
        setVerifying(false);
      }
    }

    verifyToken();

    return () => {
      cancelled = true;
    };
  }, [searchParams, supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password,
      });

      if (updateErr) throw updateErr;

      setSuccess(true);

      // Sign out and redirect to signin after a delay
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push("/signin?reset=success");
      }, 2000);
    } catch (err: any) {
      setError(err?.message ?? "Failed to reset password.");
    } finally {
      setSubmitting(false);
    }
  }


  if (verifying) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-12">
          <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
            <div className="p-7">
              <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
                Reset password
              </div>
              <div className="mt-4 text-[13px] text-black/60">
                Verifying your reset link…
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-12">
        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="p-7">
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
              Reset password
            </div>
            <div className="mt-2 text-[13px] text-black/60">
              Enter your new password below.
            </div>

            {success ? (
              <div className="mt-4 rounded-[3px] border border-[#a68b6a]/30 bg-[#faf6f1] px-4 py-3 text-[13px] text-[#6e4f33]">
                Password reset successful! Redirecting to sign in…
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-[3px] border border-[#c17a4e]/30 bg-[#fff7ed] px-4 py-3 text-[13px] text-[#6e4f33]">
                <p className="font-medium">{error}</p>
                {pkceError ? (
                  <div className="mt-2 pt-2 border-t border-[#c17a4e]/20">
                    <p className="text-[12px] text-[#b42318]">Error: {pkceError}</p>
                    <p className="mt-1 text-[12px]">
                      This error can occur when clicking a password reset link in a
                      different browser or private window.
                    </p>
                    <Link
                      href="/forgot-password"
                      className="mt-2 inline-block text-[12px] font-semibold text-[#6e4f33] hover:underline"
                    >
                      Request new reset link
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              <label className="grid gap-1.5">
                <span className="text-[12px] font-semibold text-black/55">
                  New password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                  placeholder="••••••••"
                  disabled={submitting || success}
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-[12px] font-semibold text-black/55">
                  Confirm password
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                  placeholder="••••••••"
                  disabled={submitting || success}
                />
              </label>

              <button
                type="submit"
                disabled={submitting || success}
                className="h-10 inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
              >
                {submitting ? "Resetting…" : "Reset password"}
              </button>

              <Link
                href="/signin"
                className="text-[12px] font-semibold text-[#6e4f33] hover:underline"
              >
                Back to sign in
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
