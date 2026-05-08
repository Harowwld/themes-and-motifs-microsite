"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../../lib/supabaseBrowser";

type Props = {
  vendorId: number;
  vendorSlug: string;
};

export default function SaveVendorCTA({ vendorId, vendorSlug }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const { data } = await supabase.auth.getSession();
      const session = data.session ?? null;

      if (cancelled) return;

      setSignedIn(Boolean(session?.user));

      if (!session?.user) {
        setReady(true);
        return;
      }

      const { data: savedData } = await supabase
        .from("saved_vendors")
        .select("vendor_id")
        .eq("user_id", session.user.id)
        .eq("vendor_id", vendorId)
        .maybeSingle();

      if (!cancelled) {
        setSaved(Boolean(savedData));
        setReady(true);
      }
    }

    run();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void run();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase, vendorId]);

  const toggleSave = async () => {
    if (!signedIn) {
      const returnTo = `/vendors/${encodeURIComponent(vendorSlug)}`;
      router.push(`/signin?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    setSaving(true);

    if (saved) {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user.id;
      if (userId) {
        await supabase
          .from("saved_vendors")
          .delete()
          .eq("user_id", userId)
          .eq("vendor_id", vendorId);

        await supabase.rpc("decrement_save_count", { vendor_id: vendorId });
        setSaved(false);
      }
    } else {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user.id;
      if (userId) {
        await supabase
          .from("saved_vendors")
          .insert({ user_id: userId, vendor_id: vendorId });

        await supabase.rpc("increment_save_count", { vendor_id: vendorId });
        setSaved(true);
      }
    }

    setSaving(false);
  };

  if (!ready) {
    return (
      <button
        type="button"
        className="h-11 w-full rounded-[3px] bg-black/10 animate-pulse"
        disabled
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => void toggleSave()}
      disabled={saving}
      className={`w-full flex h-11 items-center justify-center gap-2 rounded-[3px] text-[14px] font-semibold transition-colors ${
        saved
          ? "bg-[#a67c52] text-white hover:bg-[#8e6a46]"
          : "border-2 border-[#a67c52] text-[#a67c52] hover:bg-[#a67c52] hover:text-white bg-white"
      } disabled:opacity-60`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={saved ? 0 : 2}
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      {saved ? "Saved" : "Save this vendor"}
    </button>
  );
}
