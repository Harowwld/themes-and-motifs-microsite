"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "../../lib/supabaseBrowser";

export function EditorSignOutButton() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [signingOut, setSigningOut] = useState(false);

  return (
    <button
      type="button"
      disabled={signingOut}
      onClick={async () => {
        setSigningOut(true);
        try {
          await supabase.auth.signOut();
        } finally {
          setSigningOut(false);
          router.replace("/");
        }
      }}
      className="h-9 w-full inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
    >
      {signingOut ? "Signing out..." : "Sign out"}
    </button>
  );
}
