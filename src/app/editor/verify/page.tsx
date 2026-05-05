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

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      setPkceError(null);

      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) {
        throw sessionErr;
      }

      const type = searchParams.get("type");
      const tokenHash = searchParams.get("token_hash");
      const code = searchParams.get("code");

      try {
        // If we already have a session, do not attempt to verify/exchange again.
        // This avoids PKCE verifier errors when the user is already signed in elsewhere.
        if (!sessionData.session?.user) {
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
          }
        }

        // Get the session
        const { data: sessData, error: sessErr } = await supabase.auth.getSession();
        if (sessErr) throw sessErr;

        const user = sessData.session?.user ?? null;
        if (!user) {
          router.replace("/editor/signin");
          return;
        }

        // Check if user already has an editor record
        const { data: editorData } = await supabase
          .from("editors")
          .select("id")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (!editorData) {
          // First time - create users record if needed, then redirect to pending
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
              role: "editor", // Mark as editor role
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            if (insertErr) {
              console.error("Failed to create users record:", insertErr);
            }
          }

          // Note: Editor record is NOT created here - admin must approve
          // This prevents unauthorized access
        }

        // Redirect to dashboard (which will show access pending if no editor record)
        router.replace("/editor/dashboard");
      } catch (e: any) {
        if (!cancelled) {
          const message = e?.message ?? "Failed to complete sign-in."
          setError(message);

          if (
            typeof message === "string" &&
            message.toLowerCase().includes("pkce") &&
            message.toLowerCase().includes("verifier")
          ) {
            setError(null);
            setPkceError(
              "PKCE code verifier not found in storage. This usually happens if the link was opened in a different browser/tab than the one that requested it, or if cookies/storage were cleared. Please request a new sign-in link and open it in the same browser."
            );
          }

          if (typeof window !== "undefined") {
            const hash = window.location.hash;
            if (hash.includes("error")) {
              const params = new URLSearchParams(hash.slice(1));
              const errorCode = params.get("error");
              const errorDesc = params.get("error_description");
              if (errorCode) {
                setError(null);
                setPkceError(`${errorCode}: ${errorDesc || "An error occurred"}`);
              }
            }
          }
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams, supabase]);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-12">
        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="p-7">
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Verifying link…</div>
            <div className="mt-2 text-[13px] text-black/60">Please wait while we sign you in.</div>

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
          </div>
        </div>
      </div>
    </div>
  );
}
