import {
  LayoutDashboard,
  Wallet,
  Users,
  MailOpen,
  Grid,
  CheckSquare,
  Award,
  Heart,
  FileText,
  Globe,
  Gift
} from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 animate-pulse">
        
        {/* Main Header Block Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/[0.04] pb-6 mb-8 gap-4">
          <div>
            <div className="h-9 w-40 bg-black/10 rounded" />
            <div className="h-4 w-72 bg-black/5 rounded mt-2.5" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-32 bg-black/10 rounded-lg" />
            <div className="h-10 w-24 bg-black/5 rounded-lg" />
          </div>
        </div>

        {/* Workspace Layout Skeleton */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation Skeleton */}
          <aside className="w-full lg:w-[260px] shrink-0 space-y-2">
            <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-1.5">
              <div className="h-3.5 w-28 bg-black/5 rounded px-3 mb-2.5" />
              {[
                { label: "Wedding Journey Summary", icon: LayoutDashboard },
                { label: "Wedding Page Settings", icon: Globe },
                { label: "Gift Registry", icon: Gift },
                { label: "Guest List Tracker", icon: Users },
                { label: "Table Seating Chart", icon: Grid },
                { label: "Task Checklist", icon: CheckSquare },
                { label: "Dream Supplier Team", icon: Award },
                { label: "Rants & Reviews Log", icon: Heart },
                { label: "Planning Notebook", icon: FileText },
              ].map((tab, i) => {
                const Icon = tab.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent bg-transparent"
                  >
                    <Icon size={16} className="text-neutral-300" />
                    <div className="h-4 w-28 bg-black/5 rounded" />
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Main workspace skeleton panel */}
          <main className="flex-1 min-w-0 space-y-8">
            {/* Bento widgets placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-16 bg-[#fafafa] rounded animate-pulse" />
                    <div className="h-4 w-4 bg-[#fafafa] rounded" />
                  </div>
                  <div className="h-6 w-32 bg-black/10 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-black/5 rounded animate-pulse" />
                </div>
              ))}
            </div>

            {/* Saved Vendors Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-5 w-5 bg-black/5 rounded-full" />
                <div className="h-5 w-32 bg-black/10 rounded" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-black/5 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="h-32 bg-black/5" />
                    <div className="relative px-4 pb-4">
                      <div className="relative -mt-10 mb-2">
                        <div className="h-20 w-20 rounded-2xl border-4 border-white bg-black/5 shadow-lg shrink-0 -ml-1" />
                      </div>
                      <div className="h-5 w-3/4 bg-black/10 rounded mb-2" />
                      <div className="h-3.5 w-1/2 bg-black/5 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
