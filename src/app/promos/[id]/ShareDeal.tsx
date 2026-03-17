"use client";

import { useCallback } from "react";

export default function ShareDeal() {
  const onCopy = useCallback(() => {
    if (typeof window === "undefined") return;
    const href = window.location.href;

    if (navigator?.clipboard?.writeText) {
      void navigator.clipboard.writeText(href);
      return;
    }

    try {
      const ta = document.createElement("textarea");
      ta.value = href;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onCopy}
        className="flex-1 h-9 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-black/60 hover:bg-black/5 transition-colors"
      >
        Copy Link
      </button>
    </div>
  );
}
