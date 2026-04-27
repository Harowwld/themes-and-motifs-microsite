"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VendorSignupClient() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/register?plan=2");
  }, [router]);

  return (
    <div
      className="min-h-screen bg-[#fafafa]"
    >
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-12">
        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="p-7">
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Vendor signup</div>
            <div className="mt-2 text-[13px] text-black/60">Redirecting…</div>
          </div>
        </div>
      </div>
    </div>
  );
}
