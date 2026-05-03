"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "../../../../lib/supabaseBrowser";

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"checking" | "invalid" | "expired" | "used" | "valid">("checking");
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const token = searchParams.get("token");

  // Verify the token on page load
  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setError("No invitation token provided.");
      setIsLoading(false);
      return;
    }

    async function verifyToken() {
      try {
        const res = await fetch(`/api/admin/superadmins/verify-invite?token=${encodeURIComponent(token!)}`);
        const data = await res.json();

        if (!res.ok) {
          if (data.used) {
            setStatus("used");
            setError(data.error);
          } else if (data.expired) {
            setStatus("expired");
            setError(data.error);
          } else if (data.exists) {
            setStatus("used");
            setError(data.error);
          } else {
            setStatus("invalid");
            setError(data.error || "Invalid invitation.");
          }
          setIsLoading(false);
          return;
        }

        setEmail(data.email);
        setStatus("valid");
        setIsLoading(false);
      } catch (e: any) {
        setStatus("invalid");
        setError("Failed to verify invitation. Please try again.");
        setIsLoading(false);
      }
    }

    verifyToken();
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsVerifying(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setIsVerifying(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/superadmins/accept-invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to accept invitation.");
      }

      // If auto-signin was successful, sign in client-side to set cookies properly
      if (data.email && password) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password,
        });
        if (signInError) {
          console.error("Auto sign-in failed:", signInError);
          // Redirect to login if auto sign-in fails
          router.replace("/admin/login");
          return;
        }
      }

      // Redirect to superadmin dashboard
      router.replace("/superadmin");
    } catch (err: any) {
      setError(err?.message ?? "Failed to create account.");
      setIsVerifying(false);
    }
  }

  if (isLoading || status === "checking") {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="mx-auto w-full max-w-xl px-5 sm:px-8 py-12">
          <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
            <div className="p-7">
              <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
                Verifying invitation…
              </div>
              <div className="mt-2 text-[13px] text-black/60">
                Please wait while we verify your invitation.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid, expired, or used token state
  if (status !== "valid") {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="mx-auto w-full max-w-xl px-5 sm:px-8 py-12">
          <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
            <div className="p-7">
              <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
                Invitation {status === "expired" ? "Expired" : status === "used" ? "Used" : "Invalid"}
              </div>
              <div className="mt-2 text-[13px] text-black/60">
                {error}
              </div>
              <div className="mt-6">
                <a
                  href="/admin/login"
                  className="inline-flex items-center justify-center h-10 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors"
                >
                  Go to Sign In
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto w-full max-w-xl px-5 sm:px-8 py-12">
        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="p-7">
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
              Accept Superadmin Invitation
            </div>
            <div className="mt-2 text-[13px] text-black/60">
              Set a password for <span className="font-semibold text-[#2c2c2c]">{email}</span> to complete your account setup.
            </div>

            {error ? (
              <div className="mt-4 rounded-[3px] border border-[#b42318]/20 bg-[#fff1f3] px-4 py-3 text-[13px] text-[#7a271a]">
                {error}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              <label className="grid gap-1.5">
                <span className="text-[12px] font-semibold text-black/55">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                  placeholder="Create a password (min 8 characters)"
                  minLength={8}
                  required
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-[12px] font-semibold text-black/55">Confirm Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                  placeholder="Confirm your password"
                  minLength={8}
                  required
                />
              </label>

              <button
                type="submit"
                disabled={isVerifying}
                className="h-10 inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
              >
                {isVerifying ? "Creating account…" : "Create Account & Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
