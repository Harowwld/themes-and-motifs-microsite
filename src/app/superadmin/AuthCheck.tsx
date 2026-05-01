"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "../../lib/supabase-ssr";

interface EditorAuthState {
  isEditor: boolean;
  email: string | null;
}

export function EditorAuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<EditorAuthState | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/admin/login");
        return;
      }

      // Check if user is an editor (any entry in editors table)
      const { data: editorData } = await supabase
        .from("editors")
        .select("id")
        .eq("user_id", session.user.id)
        .limit(1)
        .maybeSingle();

      if (editorData) {
        setAuthState({ isEditor: true, email: session.user.email ?? null });
      } else {
        // Not an editor, redirect to admin login
        router.replace("/admin/login");
      }
    }

    checkAuth();
  }, [router]);

  if (authState === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[14px] text-black/60">Checking access...</div>
      </div>
    );
  }

  // Clone children to pass email prop to LayoutContent
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        email: authState.email,
        accountType: "editor" as const,
      } as React.Attributes);
    }
    return child;
  });

  return <>{childrenWithProps}</>;
}
