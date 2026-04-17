"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function normalizeReturnTo(v: string | null) {
  const raw = (v ?? "").trim();
  if (!raw) return "/vendors";
  if (!raw.startsWith("/")) return "/vendors";
  return raw;
}

export default function SoonToWedSignupLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnTo = normalizeReturnTo(searchParams.get("returnTo"));

  useEffect(() => {
    router.replace(`/soon-to-wed/signup?returnTo=${encodeURIComponent(returnTo)}`);
  }, [router, returnTo]);

  return (
    <div
      className="min-h-screen bg-[#fafafa]"
    >
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-12">
        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="p-7">
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Create account</div>
            <div className="mt-2 text-[13px] text-black/60">Redirecting…</div>
          </div>
        </div>
      </div>
    </div>
  );
}
