"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { toast } from "@/lib/toast";

type Props = {
  promoId: number;
  className?: string;
};

export default function SavePromoButton({ promoId, className = "" }: Props) {
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

      const { data: savedData, error } = await supabase
        .from("saved_promos")
        .select("promo_id")
        .eq("user_id", session.user.id)
        .eq("promo_id", promoId)
        .maybeSingle();

      if (!cancelled && !error) {
        setSaved(Boolean(savedData));
        setReady(true);
      } else if (error) {
        console.error("Error checking saved promo:", error);
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
  }, [supabase, promoId]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!signedIn) {
      window.location.href = `/signin?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setSaving(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user.id;
      if (!userId) throw new Error("No active session");

      if (saved) {
        const { error } = await supabase
          .from("saved_promos")
          .delete()
          .eq("user_id", userId)
          .eq("promo_id", promoId);

        if (error) throw error;
        setSaved(false);
        toast.success("Removed from your Wedding Registry!");
      } else {
        const { error } = await supabase
          .from("saved_promos")
          .insert({ user_id: userId, promo_id: promoId });

        if (error) throw error;
        setSaved(true);
        toast.success("Added to your Wedding Registry!");
      }
    } catch (err) {
      console.error("Error toggling saved promo:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update saved promo.");
    } finally {
      setSaving(false);
    }
  };

  if (!ready) {
    return (
      <div
        className={`h-8 w-8 rounded-full bg-stone-100 animate-pulse ${className}`}
      />
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      type="button"
      onClick={toggleSave}
      disabled={saving}
      className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors shadow-md ${
        saved
          ? "bg-[#a68b6a] text-white"
          : "bg-white/80 backdrop-blur-md text-[#a68b6a] hover:bg-white"
      } ${className}`}
      aria-label={saved ? "Remove from registry" : "Add to registry"}
      title={saved ? "Remove from Wedding Registry" : "Add to Wedding Registry"}
    >
      <AnimatePresence mode="wait">
        {saving ? (
          <motion.svg
            key="loading"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </motion.svg>
        ) : (
          <motion.svg
            key={saved ? "saved" : "unsaved"}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="h-4 w-4"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
