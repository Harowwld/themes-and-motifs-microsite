"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "../../../lib/supabase-ssr";

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

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        router.replace("/soon-to-wed/signin?error=confirmation_failed");
      } else {
        router.replace("/");
      }
    });
  }, [router, searchParams]);

  return <p>Verifying…</p>;
}
