"use client";

import { ReactNode } from "react";

export default function ScrollContainer({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen h-[100dvh] overflow-y-auto overscroll-y-none bg-[#fafafa]">
      {children}
    </div>
  );
}
