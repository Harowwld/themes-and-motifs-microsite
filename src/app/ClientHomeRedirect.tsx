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
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (userData?.role === "soon_to_wed") {
          router.push(`/moments/couple/${user.id}`);
        }
      }
    }

    checkUser();
  }, [router]);

  return null;
}
