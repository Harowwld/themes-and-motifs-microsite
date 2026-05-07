"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createBrowserClient();
    const code = searchParams.get("code");

    if (!code) {
      router.replace("/soon-to-wed/signin");
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error }: { error: Error | null }) => {
      if (error) {
        router.replace("/soon-to-wed/signin?error=confirmation_failed");
      } else {
        router.replace("/");
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <p className="text-[#2c2c2c]">Verifying…</p>
    </div>
  );
}
