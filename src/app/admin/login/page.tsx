"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function Redirector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirectVal = searchParams.get("redirect") || "/superadmin";
    const nextParams = new URLSearchParams();
    nextParams.set("returnTo", redirectVal);
    
    // Copy any other query params if present
    searchParams.forEach((value, key) => {
      if (key !== "redirect") {
        nextParams.set(key, value);
      }
    });

    router.replace(`/signin?${nextParams.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-8 w-8 border-2 border-[#a68b6a] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-[13px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)]">Redirecting to Sign In...</p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense fallback={null}>
      <Redirector />
    </React.Suspense>
  );
}
