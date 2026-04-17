"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      {isTransitioning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#fafafa]">
          <div className="w-6 h-6 border-2 border-[#a68b6a]/30 border-t-[#a68b6a] rounded-full animate-spin" />
        </div>
      )}
      <div style={{ opacity: isTransitioning ? 0 : 1, transition: "opacity 150ms" }}>
        {children}
      </div>
    </div>
  );
}
