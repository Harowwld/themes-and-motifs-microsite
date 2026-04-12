"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../lib/supabaseBrowser";

export function EditorAuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isEditor, setIsEditor] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/signin");
        return;
      }

      // Check if user is an editor
      const { data: editorData } = await supabase
        .from("editors")
        .select("id")
        .eq("user_id", session.user.id)
        .is("vendor_id", null)
        .eq("can_edit_entries", true)
        .limit(1)
        .maybeSingle();

      if (editorData) {
        setIsEditor(true);
      } else {
        // Not an editor, redirect
        router.replace("/");
      }
    }

    checkAuth();
  }, [router]);

  if (isEditor === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[14px] text-black/60">Checking access...</div>
      </div>
    );
  }

  return <>{children}</>;
}
