export default function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="rounded-[3px] border border-black/10 bg-[#fcfbf9] px-4 py-3">
        <div className="h-4 w-48 rounded bg-black/10 animate-pulse" />
      </div>

      <section className="rounded-[3px] border border-black/10 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-black/5">
          <div className="h-4 w-20 rounded bg-black/10 animate-pulse" />
          <div className="mt-2 h-3 w-56 rounded bg-black/10 animate-pulse" />
        </div>
        <div className="p-4 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <div className="h-3 w-28 rounded bg-black/10 animate-pulse" />
              <div className="h-10 w-full rounded-[3px] bg-black/10 animate-pulse" />
            </div>
            <div className="grid gap-1.5">
              <div className="h-3 w-36 rounded bg-black/10 animate-pulse" />
              <div className="h-10 w-full rounded-[3px] bg-black/10 animate-pulse" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <div className="h-3 w-16 rounded bg-black/10 animate-pulse" />
            <div className="min-h-24 w-full rounded-[3px] bg-black/10 animate-pulse" />
          </div>
          <div className="flex justify-end">
            <div className="h-9 w-28 rounded-[3px] bg-black/10 animate-pulse" />
          </div>
        </div>
      </section>

      <section className="rounded-[3px] border border-black/10 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-black/5">
          <div className="h-4 w-24 rounded bg-black/10 animate-pulse" />
          <div className="mt-2 h-3 w-60 rounded bg-black/10 animate-pulse" />
        </div>
        <div className="p-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
            <div className="grid gap-1.5">
              <div className="h-3 w-20 rounded bg-black/10 animate-pulse" />
              <div className="h-10 w-full rounded-[3px] bg-black/10 animate-pulse" />
            </div>
            <div className="grid gap-1.5">
              <div className="h-3 w-12 rounded bg-black/10 animate-pulse" />
              <div className="h-10 w-full rounded-[3px] bg-black/10 animate-pulse" />
            </div>
            <div className="h-10 w-20 rounded-[3px] bg-black/10 animate-pulse" />
          </div>
          <div className="flex justify-between pt-2">
            <div className="h-9 w-24 rounded-[3px] bg-black/10 animate-pulse" />
            <div className="h-9 w-40 rounded-[3px] bg-black/10 animate-pulse" />
          </div>
        </div>
      </section>
    </div>
  );
}
