"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createBrowserClient } from "../../../lib/supabase-ssr";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createBrowserClient(), []);

  const rawRedirectPath = searchParams.get("redirect") || "/superadmin";
  const redirectPath = (() => {
    const v = String(rawRedirectPath || "").trim();
    if (!v.startsWith("/")) return "/superadmin";
    if (v === "/admin") return "/superadmin";
    return v;
  })();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wasSignedOut, setWasSignedOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        // Check if user is already authenticated with Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!cancelled && session?.user) {
          // Verify this user is a superadmin or editor
          const { data: superadminData, error: superadminError } = await supabase
            .from("superadmins")
            .select("id, is_active")
            .eq("auth_user_id", session.user.id)
            .eq("is_active", true)
            .maybeSingle();
          
          if (superadminError) {
            console.error("Error checking superadmin status:", superadminError);
            // Don't sign out on database errors, just let user try logging in
            return;
          }
          
          if (superadminData) {
            // User is authenticated and is a superadmin, redirect to target
            router.replace(redirectPath);
            return;
          }
          
          // Check if user is an editor
          const { data: editorData } = await supabase
            .from("editors")
            .select("id")
            .eq("user_id", session.user.id)
            .maybeSingle();
          
          if (editorData) {
            // User is an editor, redirect to vendors page (editors don't have dashboard access)
            router.replace("/superadmin/vendors");
            return;
          }
          
          // User is authenticated but not authorized, sign out
          console.log("User is not a superadmin or editor, signing out");
          await supabase.auth.signOut();
          setWasSignedOut(true);
        }
      } catch (error) {
        console.error("Error in auth check:", error);
        // Don't sign out on unexpected errors
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [supabase, router, redirectPath]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const u = username.trim();
    if (!u || !password) {
      setError("Username and password are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: u, password }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error ?? "Failed to sign in.");
      }

      // If legacy user with non-email username, redirect to bootstrap
      if (json.legacy) {
        setPassword("");
        router.replace("/admin/bootstrap");
        return;
      }

      setPassword("");

      // Use client-side signIn to properly set cookies (setSession doesn't set cookies in browser)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: u,
        password,
      });

      if (signInError) {
        console.error("Failed to sign in:", signInError);
        throw new Error("Failed to establish session. Please try again.");
      }

      // Navigate to redirect path
      router.replace(redirectPath);
    } catch (e: any) {
      setError(e?.message ?? "Failed to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#fafafa]"
    >
      <div className="mx-auto w-full max-w-xl px-5 sm:px-8 py-12">
        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="p-7">
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Superadmin</div>
            <div className="mt-2 text-[13px] text-black/60">Sign in to manage the site.</div>

            {wasSignedOut ? (
              <div className="mt-4 rounded-[3px] border border-[#a68b6a]/30 bg-[#faf6f1] px-4 py-3 text-[13px] text-[#6e4f33]">
                You have been signed out. Please sign in again.
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-[3px] border border-[#b42318]/20 bg-[#fff1f3] px-4 py-3 text-[13px] text-[#7a271a]">
                {error}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              <label className="grid gap-1.5">
                <span className="text-[12px] font-semibold text-black/55">Username</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                  placeholder="admin"
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
