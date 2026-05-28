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
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-pulse">
          
          {/* Welcome & Live Preview Banner Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-white border border-black/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-2">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-black/10 shrink-0" />
              <div className="space-y-2">
                <div className="h-5 w-44 bg-black/10 rounded" />
                <div className="h-3 w-32 bg-black/5 rounded mt-0.5" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-11 w-44 bg-black/5 rounded-xl" />
              <div className="h-11 w-28 bg-black/5 rounded-xl" />
            </div>
          </div>

          {/* Unified Workspace Layout Skeleton */}
          <div className="flex flex-col lg:flex-row gap-8 mt-6">
            
            {/* Sidebar Navigation Skeleton */}
            <aside className="w-full lg:w-[260px] shrink-0 space-y-2">
              <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-1.5">
                <div className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest px-3 mb-2.5">
                  Vendor Workspace
                </div>
                {[
                  { label: "Client Inquiries", isFirst: true },
                  { label: "Portfolio Photos" },
                  { label: "Video Highlights" },
                  { label: "Vouchers & Promos" },
                  { label: "Couple Reviews" },
                  { label: "Business Profile" },
                  { label: "Service Categories" },
                  { label: "Storefront Themes" },
                  { label: "Social Links" },
                ].map((tab, i) => {
                  return (
                    <div
                      key={i}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold ${
                        tab.isFirst
                          ? "bg-black/[0.04]"
                          : "bg-transparent"
                      }`}
                    >
                      <div className="h-4 w-4 rounded bg-black/10 shrink-0" />
                      <div className="h-4 w-28 bg-black/5 rounded" />
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Interactive Workspace Panel Skeleton (Default: Inquiries view) */}
            <main className="flex-1 min-w-0 space-y-6">
              <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.015)] overflow-hidden">
                {/* Section Header */}
                <div className="p-6 border-b border-black/[0.06] flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-6 w-36 bg-black/10 rounded" />
                    <div className="h-3.5 w-60 bg-black/5 rounded" />
                  </div>
                </div>
                
                {/* Content table/list items */}
                <div className="divide-y divide-black/[0.04]">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-black/5 shrink-0" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-black/10 rounded" />
                            <div className="h-3 w-48 bg-black/5 rounded" />
                          </div>
                        </div>
                        <div className="h-8 w-24 bg-black/5 rounded-lg" />
                      </div>
                      <div className="space-y-2 pl-14">
                        <div className="h-3 w-full bg-[#fafafa] rounded" />
                        <div className="h-3 w-5/6 bg-[#fafafa] rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </main>

          </div>
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

