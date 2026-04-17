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

export default function SoonToWedAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const returnTo = normalizeReturnTo(searchParams.get("returnTo"));

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);

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

        const { data: sessData, error: sessErr } = await supabase.auth.getSession();
        if (sessErr) throw sessErr;

        const user = sessData.session?.user ?? null;
        if (!user) {
          router.replace(`/soon-to-wed/signin?returnTo=${encodeURIComponent(returnTo)}`);
          return;
        }

        const { data: profileRow, error: profErr } = await supabase
          .from("soon_to_wed_profiles")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle<{ user_id: string }>();

        if (profErr) throw profErr;

        if (!profileRow?.user_id) {
          router.replace(`/soon-to-wed/signup?returnTo=${encodeURIComponent(returnTo)}`);
          return;
        }

        await supabase.auth.signOut();
        router.replace(`/soon-to-wed/signin?returnTo=${encodeURIComponent(returnTo)}`);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to complete sign-in.");
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams, supabase, returnTo]);

  return (
    <div
      className="min-h-screen bg-[#fafafa]"
    >
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-12">
        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="p-7">
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Verifying link…</div>
            <div className="mt-2 text-[13px] text-black/60">Please wait.</div>

            {error ? (
              <div className="mt-4 rounded-[3px] border border-[#b42318]/20 bg-[#fff1f3] px-4 py-3 text-[13px] text-[#7a271a]">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
