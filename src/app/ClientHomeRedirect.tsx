"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function ClientHomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      // Check for bypass parameter in URL
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("home") === "true") return;

      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("soon_to_wed_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile) {
          router.push(`/moments/couple/${user.id}`);
        }
      }
    }

    checkUser();
  }, [router]);

  return null;
}
