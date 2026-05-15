import React from "react";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-bold uppercase tracking-widest text-black/40 ml-1">{label}</span>
      {children}
    </label>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header Skeleton */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-black/[0.05] sticky top-0 z-[90] px-6 lg:px-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-black/5 animate-pulse" />
          <div className="grid gap-2">
            <div className="h-4 w-32 rounded bg-black/10 animate-pulse" />
            <div className="h-3 w-24 rounded bg-black/5 animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-32 rounded-lg bg-black/5 animate-pulse" />
      </header>

      {/* Main Content Skeleton */}
      <main className="p-6 lg:p-10 max-w-5xl mx-auto w-full">
        <div className="grid gap-12">
          {/* Plan Section Skeleton */}
          <section className="rounded-lg border border-black/[0.08] bg-white overflow-hidden shadow-sm">
            <div className="h-12 bg-[#fafafa]/50 border-b border-black/[0.04] flex items-center px-6">
              <div className="h-3 w-40 rounded bg-black/10 animate-pulse" />
            </div>
            <div className="p-6 grid gap-4">
              <div className="h-4 w-48 rounded bg-black/10 animate-pulse" />
              <div className="h-16 w-full rounded-lg bg-black/[0.03] animate-pulse" />
            </div>
          </section>

          {/* Profile Section Skeleton */}
          <section className="rounded-lg border border-black/[0.08] bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30">
              <div className="h-5 w-32 rounded bg-black/10 animate-pulse" />
              <div className="mt-2 h-3 w-56 rounded bg-black/5 animate-pulse" />
            </div>
            <div className="p-6 grid gap-8">
              <div className="grid gap-6 sm:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="grid gap-2">
                    <div className="h-3 w-20 rounded bg-black/10 animate-pulse ml-1" />
                    <div className="h-11 w-full rounded-lg bg-black/[0.03] animate-pulse" />
                  </div>
                ))}
              </div>
              
              <div className="rounded-lg border border-black/[0.06] bg-[#fafafa]/30 p-4 flex gap-6">
                <div className="h-24 w-24 rounded-lg bg-black/10 animate-pulse shrink-0" />
                <div className="flex flex-col gap-3 pt-2">
                  <div className="h-3 w-24 rounded bg-black/10 animate-pulse" />
                  <div className="h-3 w-48 rounded bg-black/5 animate-pulse" />
                  <div className="mt-2 h-9 w-32 rounded-lg bg-black/10 animate-pulse" />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="h-3 w-28 rounded bg-black/10 animate-pulse ml-1" />
                <div className="h-32 w-full rounded-lg bg-black/[0.03] animate-pulse" />
              </div>
            </div>
          </section>

          {/* Photos/Videos Skeleton */}
          <section className="rounded-lg border border-black/[0.08] bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30">
              <div className="h-5 w-24 rounded bg-black/10 animate-pulse" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square rounded-lg bg-black/[0.03] animate-pulse" />
                ))}
              </div>
            </div>
          </section>
          {/* Inquiries Skeleton */}
          <section className="rounded-lg border border-black/[0.08] bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30">
              <div className="h-5 w-36 rounded bg-black/10 animate-pulse" />
            </div>
            <div className="p-0">
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-6 py-4 border-b border-black/[0.04] flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="h-10 w-10 rounded-full bg-black/5 animate-pulse" />
                    <div className="grid gap-2">
                      <div className="h-3 w-24 rounded bg-black/10 animate-pulse" />
                      <div className="h-2 w-32 rounded bg-black/5 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-8 w-20 rounded bg-black/5 animate-pulse" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden="true"
    />
  );
}

