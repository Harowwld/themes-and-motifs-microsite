"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { createSupabaseBrowserClient } from "../../lib/supabaseBrowser";

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const e1 = email.trim();
    if (!e1) {
      setError("Email is required.");
      return;
    }

    setSubmitting(true);

    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
        e1,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetErr) throw resetErr;

      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      setError(err?.message ?? "Failed to send reset email.");
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
              Forgot password
            </div>
            <div className="mt-2 text-[13px] text-black/60">
              Enter your email and we&apos;ll send you a link to reset your password.
            </div>

            {success ? (
              <div className="mt-4 rounded-[3px] border border-[#a68b6a]/30 bg-[#faf6f1] px-4 py-3 text-[13px] text-[#6e4f33]">
                Check your email for a password reset link. If you don&apos;t see it,
                check your spam folder.
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-[3px] border border-[#c17a4e]/30 bg-[#fff7ed] px-4 py-3 text-[13px] text-[#6e4f33]">
                {error}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              <label className="grid gap-1.5">
                <span className="text-[12px] font-semibold text-black/55">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                  placeholder="you@example.com"
                  disabled={submitting}
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="h-10 inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send reset link"}
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
