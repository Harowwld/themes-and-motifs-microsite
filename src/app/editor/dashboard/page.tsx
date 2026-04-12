"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "../../../lib/supabaseBrowser";

export default function EditorDashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!cancelled && !session?.user) {
        router.push("/editor/signin");
        return;
      }

      if (!cancelled && session?.user) {
        const { data: editorData } = await supabase
          .from("editors")
          .select("id")
          .eq("user_id", session.user.id)
          .limit(1)
          .maybeSingle();

        if (editorData) {
          setHasAccess(true);
        }
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/editor/signin");
  }

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{
          background: "radial-gradient(circle at 20% 10%, #fff7ed, #fcfbf9 42%, #f6f1ea 92%)",
        }}
      >
        <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-12">
          <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
            <div className="p-7">
              <div className="text-[14px] text-black/60">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div
        className="min-h-screen"
        style={{
          background: "radial-gradient(circle at 20% 10%, #fff7ed, #fcfbf9 42%, #f6f1ea 92%)",
        }}
      >
        <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-12">
          <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
            <div className="p-7">
              <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Access Pending</div>
              <div className="mt-2 text-[13px] text-black/60">
                Your editor account has been created but you don&apos;t have access yet. An admin will grant you access shortly.
              </div>
              <button
                onClick={signOut}
                className="mt-6 h-10 inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(circle at 20% 10%, #fff7ed, #fcfbf9 42%, #f6f1ea 92%)",
      }}
    >
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-12">
        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="p-7">
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Editor Dashboard</div>
            <div className="mt-2 text-[13px] text-black/60">
              Welcome! You have editor access. Go to <a href="/superadmin/vendors" className="text-[#a67c52] hover:underline">Superadmin Vendors</a> to manage vendors.
            </div>
            <button
              onClick={signOut}
              className="mt-6 h-10 inline-flex items-center justify-center px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
