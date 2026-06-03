"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../lib/supabaseBrowser";

export default function SoonToWedPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (cancelled) return;

      if (session?.user) {
        router.push(`/moments/couple/${session.user.id}`);
      } else {
        router.push("/soon-to-wed/signin?returnTo=/soon-to-wed");
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [supabase, router]);

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-8 w-8 border-2 border-[#a68b6a] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-[13px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)]">Redirecting...</p>
      </div>
    </div>
  );
}
