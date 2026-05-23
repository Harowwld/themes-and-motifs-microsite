export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 py-10 sm:py-14 space-y-10 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="w-full h-48 sm:h-64 rounded-2xl bg-black/[0.04]" />

      {/* Grid skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-black/5 bg-white p-5 space-y-4">
            <div className="w-full aspect-[16/10] rounded-lg bg-black/[0.03]" />
            <div className="h-4 w-2/3 rounded bg-black/10" />
            <div className="h-3 w-1/2 rounded bg-black/[0.06]" />
            <div className="h-9 w-full rounded-lg bg-black/[0.03]" />
          </div>
        ))}
      </div>
    </div>
  );
}
