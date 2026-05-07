"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "../../../lib/supabase-ssr";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();

    const code = searchParams.get("code");

    if (!code) {
      router.replace("/soon-to-wed/signin");
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        console.error("Callback error:", error);
        setError(error.message);
        setTimeout(() => {
          router.replace("/soon-to-wed/signin?error=confirmation_failed");
        }, 3000);
      } else {
        router.replace("/");
      }
    });
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#b42318] mb-2">Verification failed</p>
          <p className="text-[13px] text-black/60">{error}</p>
          <p className="text-[12px] text-black/40 mt-4">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return <p className="min-h-screen bg-[#fafafa] flex items-center justify-center">Verifying…</p>;
}
