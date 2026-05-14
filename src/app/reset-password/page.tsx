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
  const [isReadyToReset, setIsReadyToReset] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(false);

  // Check if user is already signed in or has a valid link
  useEffect(() => {
    let cancelled = false;

    async function checkInitialState() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          // User is signed in, they can reset password
          if (!cancelled) {
            setIsReadyToReset(true);
            setVerifying(false);
          }
          return;
        }

        const code = searchParams.get("code");
        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        if (!code && !tokenHash) {
          if (!cancelled) {
            setError("No reset token found. Please request a new password reset link.");
            setVerifying(false);
          }
        } else {
          // We have a link, but we'll wait for user to click verify
          if (!cancelled) {
            setVerifying(false);
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? "Failed to check session.");
          setVerifying(false);
        }
      }
    }

    void checkInitialState();

    return () => {
      cancelled = true;
    };
  }, [searchParams, supabase]);

  async function handleVerifyLink() {
    setError(null);
    setPkceError(null);
    setIsCheckingLink(true);

    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    try {
      if (tokenHash && type) {
        const { error: verifyErr } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as any,
        });
        if (verifyErr) throw verifyErr;
      } else if (code) {
        const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exchErr) throw exchErr;
      }

      // Check if we now have a session
      const { data: sessData } = await supabase.auth.getSession();
      if (!sessData.session?.user) {
        throw new Error("Failed to establish session. The link may be invalid or expired.");
      }

      setIsReadyToReset(true);
    } catch (err: any) {
      setError(err?.message ?? "Invalid or expired reset link. Please request a new one.");

      if (
        typeof err?.message === "string" &&
        err.message.toLowerCase().includes("pkce")
      ) {
        setPkceError(err.message);
      }
    } finally {
      setIsCheckingLink(false);
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-12">
          <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
            <div className="p-7">
              <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Reset password</div>
              <div className="mt-4 text-[13px] text-black/60">Checking session…</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isReadyToReset && !success) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-12">
          <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
            <div className="p-7">
              <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Reset password</div>
              <div className="mt-2 text-[13px] text-black/60">Click the button below to verify your reset link.</div>

              {error ? (
                <div className="mt-4 rounded-[3px] border border-[#c17a4e]/30 bg-[#fff7ed] px-4 py-3 text-[13px] text-[#6e4f33]">
                  <p className="font-medium">{error}</p>
                  {pkceError ? (
                    <div className="mt-2 pt-2 border-t border-[#c17a4e]/20">
                      <p className="text-[12px] text-[#b42318]">PKCE Error detected.</p>
                      <p className="mt-1 text-[12px]">
                        This can happen if you open the link in a different browser than where you requested it. Please request a new link and open it in the same browser.
                      </p>
                    </div>
                  ) : null}
                  <div className="mt-4">
                    <Link href="/forgot-password" className="text-[12px] font-semibold text-[#6e4f33] hover:underline">
                      Request new reset link
                    </Link>
                  </div>
                </div>
              ) : null}

              <div className="mt-8">
                <button
                  onClick={handleVerifyLink}
                  disabled={isCheckingLink}
                  className="h-10 inline-flex items-center justify-center px-6 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
                >
                  {isCheckingLink ? "Verifying..." : "Verify Reset Link"}
                </button>
              </div>

              <div className="mt-4">
                <Link href="/signin" className="text-[12px] font-semibold text-[#6e4f33] hover:underline">
                  Back to sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
