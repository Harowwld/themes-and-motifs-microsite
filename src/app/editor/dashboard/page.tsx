"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "../../../lib/supabaseBrowser";

export default function EditorDashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let pollInterval: NodeJS.Timeout | null = null;

    async function checkAccess(session: any) {
      if (!session?.user) return false;

      const { data: editorData } = await supabase
        .from("editors")
        .select("id")
        .eq("user_id", session.user.id)
        .limit(1)
        .maybeSingle();

      return !!editorData;
    }

    async function run() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!cancelled && !session?.user) {
        router.push("/editor/signin");
        return;
      }

      if (!cancelled && session?.user) {
        const hasEditorAccess = await checkAccess(session);

        if (hasEditorAccess) {
          setHasAccess(true);
        } else {
          // Start polling for approval
          setCheckingApproval(true);
          pollInterval = setInterval(async () => {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (currentSession?.user) {
              const nowHasAccess = await checkAccess(currentSession);
              if (nowHasAccess) {
                setHasAccess(true);
                setCheckingApproval(false);
                if (pollInterval) {
                  clearInterval(pollInterval);
                  pollInterval = null;
                }
              }
            }
          }, 3000); // Check every 3 seconds
        }
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [router, supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/editor/signin");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
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
      <div className="min-h-screen bg-[#fafafa]">
        <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-12">
          <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
            <div className="p-7">
              <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Access Pending</div>
              <div className="mt-2 text-[13px] text-black/60">
                Your editor account has been created but you don&apos;t have access yet. An admin will grant you access shortly.
              </div>

              {checkingApproval && (
                <div className="mt-4 flex items-center gap-2 text-[13px] text-[#a67c52]">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Checking for approval...</span>
                </div>
              )}

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
      className="min-h-screen bg-[#fafafa]"
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
