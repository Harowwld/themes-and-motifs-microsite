"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "../../../lib/supabaseBrowser";

export default function EditorVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [error, setError] = useState<string | null>(null);
  const [pkceError, setPkceError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) throw sessionErr;

        if (!cancelled) {
          setSessionChecked(true);
          if (sessionData.session?.user) {
            // Already signed in, redirect
            router.replace("/editor/dashboard");
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? "Failed to check session.");
        }
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  async function handleVerify() {
    setError(null);
    setPkceError(null);
    setIsVerifying(true);

    const type = searchParams.get("type");
    const tokenHash = searchParams.get("token_hash");
    const code = searchParams.get("code");

    try {
      // Verify the OTP token
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
        throw new Error("No verification code or token found in the URL. Please request a new sign-in link.");
      }

      // Get the session
      const { data: sessData, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) throw sessErr;

      const user = sessData.session?.user ?? null;
      if (!user) {
        throw new Error("Failed to establish session after verification. Please try again.");
      }

      // Check if user already has an editor record
      const { data: editorData } = await supabase
        .from("editors")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!editorData) {
        // Create public.users record if not exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .limit(1)
          .maybeSingle();

        if (!existingUser) {
          const { error: insertErr } = await supabase.from("users").insert({
            id: user.id,
            email: user.email,
            role: "editor",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          if (insertErr) {
            console.error("Failed to create users record:", insertErr);
          }
        }
      }

      // Redirect to dashboard
      router.replace("/editor/dashboard");
    } catch (e: any) {
      const message = e?.message ?? "Failed to complete sign-in.";
      setError(message);

      if (
        typeof message === "string" &&
        message.toLowerCase().includes("pkce") &&
        message.toLowerCase().includes("verifier")
      ) {
        setError(null);
        setPkceError(
          "PKCE code verifier not found in storage. This usually happens if the link was opened in a different browser/tab than the one that requested it. Please request a new sign-in link and open it in the same browser."
        );
      }

      setIsVerifying(false);
    }
  }

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-12">
          <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
            <div className="p-7">
              <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Loading…</div>
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
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Verify Sign In</div>
            <div className="mt-2 text-[13px] text-black/60">Click the button below to complete your sign in.</div>

            {error && !pkceError ? (
              <div className="mt-4 rounded-[3px] border border-[#b42318]/20 bg-[#fff1f3] px-4 py-3 text-[13px] text-[#7a271a]">
                {error}
              </div>
            ) : null}

            {pkceError ? (
              <div className="mt-4 rounded-[3px] border border-[#c17a4e]/30 bg-[#fff7ed] px-4 py-3 text-[13px] text-[#7a271a] whitespace-pre-line">
                {pkceError}
              </div>
            ) : null}

            <div className="mt-8">
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="h-10 inline-flex items-center justify-center px-6 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
              >
                {isVerifying ? "Verifying..." : "Complete Sign In"}
              </button>
            </div>
            
            <div className="mt-4">
              <a href="/editor/signin" className="text-[12px] font-semibold text-[#6e4f33] hover:underline">
                Back to sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
