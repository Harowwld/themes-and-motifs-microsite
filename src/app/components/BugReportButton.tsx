"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Bug } from "lucide-react";
import { createSupabaseBrowserClient } from "../../lib/supabaseBrowser";

export default function BugReportButton() {
  const pathname = usePathname();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;

    const expandTimer = setTimeout(() => {
      setIsAnimating(true);
      setIsExpanded(true);
    }, 1000);

    const collapseTimer = setTimeout(() => {
      setIsCollapsing(true);
      setIsAnimating(false);
      setTimeout(() => {
        setIsExpanded(false);
        setIsCollapsing(false);
      }, 500);
    }, 4000);

    return () => {
      clearTimeout(expandTimer);
      clearTimeout(collapseTimer);
    };
  }, [pathname]);

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/bug-report", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          message: message.trim(),
          url: window.location.href,
        }),
      });

      if (res.ok) {
        setSent(true);
        setMessage("");
        setTimeout(() => {
          setIsOpen(false);
          setSent(false);
        }, 1500);
      }
    } catch {
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed top-20 right-4 z-[100]">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-lg border border-black/10 w-72 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#2c2c2c]">Report a Bug</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
          <div className="p-4">
            {sent ? (
              <div className="text-center py-4">
                <div className="text-green-600 text-sm font-medium">Report sent!</div>
              </div>
            ) : (
              <>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the bug or error..."
                  className="w-full h-24 px-3 py-2 text-sm border border-black/10 rounded-md resize-none focus:outline-none focus:border-[#a68b6a] focus:ring-1 focus:ring-[#a68b6a]/20"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || isSending}
                  className="mt-3 w-full h-9 bg-[#a68b6a] text-white text-sm font-semibold rounded-md hover:bg-[#957a5c] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isSending ? "Sending..." : "Send Report"}
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className={`
            group relative flex items-center justify-center w-12 h-12 rounded-full bg-white text-[#a68b6a] shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:bg-[#f5f5f5] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:scale-105 transition-all duration-300 border border-black/10 z-[101] overflow-hidden
            ${isExpanded ? "w-40 px-4 justify-start" : ""}
            ${isAnimating && isExpanded ? "animate-bounce-expand" : ""}
            ${isCollapsing ? "animate-bounce-collapse" : ""}
          `}
        >
          <Bug
            size={20}
            className={isExpanded ? "flex-shrink-0" : ""}
          />
          {isExpanded && (
            <span className="ml-3 text-sm font-medium whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
              Report a bug
            </span>
          )}
        </button>
      )}
    </div>
  );
}
