"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "../../../lib/supabaseBrowser";

export default function EditorVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!cancelled && user) {
        router.push("/editor/dashboard");
      } else if (!cancelled) {
        router.push("/editor/signup");
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  return (
    <div
      className="min-h-screen bg-[#fafafa]"
    >
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-12">
        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="p-7">
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Verifying...</div>
            <div className="mt-2 text-[13px] text-black/60">Please wait while we verify your email.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
