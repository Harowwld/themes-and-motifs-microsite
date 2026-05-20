import React from "react";
import { Vendor, Plan } from "../hooks/useSuperadminVendors";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[3px] border border-black/10 bg-white px-2 py-0.5 text-[11px] font-semibold text-black/60">
      {children}
    </span>
  );
}

export function VendorList({
  vendors,
  plans,
  loading,
  query,
  setQuery,
  refresh,
  patchVendor,
  savingId,
  openEditModal,
  loadingMore,
  hasMore,
  onLoadMore
}: {
  vendors: Vendor[];
  plans: Plan[];
  loading: boolean;
  query: string;
  setQuery: (v: string) => void;
  refresh: () => void;
  patchVendor: (id: number, patch: any) => void;
  savingId: number | null;
  openEditModal: (v: Vendor) => void;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}) {
  const [localQuery, setLocalQuery] = React.useState(query);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== query) {
        setQuery(localQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localQuery, query, setQuery]);

  React.useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => {
      observer.unobserve(el);
    };
  }, [hasMore, loading, loadingMore, onLoadMore]);

  return (
    <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-black/5">
        <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Vendors</div>
        <div className="mt-1 text-[12px] text-black/45">Activate, feature, and assign plans.</div>
      </div>

      <div className="p-6 grid gap-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Search</span>
            <input
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[13px] outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
              placeholder="Search by name, slug, or id"
            />
          </label>
          <button
            type="button"
            onClick={refresh}
            className="h-10 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="rounded-[3px] border border-black/10 overflow-hidden">
          <div className="grid grid-cols-[70px_1.6fr_1.1fr_120px_120px_1fr] gap-0 bg-[#fcfbf9] text-[11px] font-semibold text-black/55 border-b border-black/5">
            <div className="px-3 py-2">ID</div>
            <div className="px-3 py-2">Vendor</div>
            <div className="px-3 py-2">Slug</div>
            <div className="px-3 py-2">Active</div>
            <div className="px-3 py-2">Featured</div>
            <div className="px-3 py-2">Plan</div>
          </div>

          {loading ? (
            <div className="p-4 text-[13px] text-black/50">Loading…</div>
          ) : vendors.length === 0 ? (
            <div className="p-4 text-[13px] text-black/50">No vendors found.</div>
          ) : (
            <div className="divide-y divide-black/5">
              {vendors.map((v) => {
                const planName = String(
                  (Array.isArray(v.plan) ? v.plan?.[0]?.name : v.plan?.name) ??
                    plans.find((p) => p.id === v.plan_id)?.name ??
                    ""
                );

                const isSaving = savingId === v.id;

                return (
                  <div key={v.id} className="grid grid-cols-[70px_1.6fr_1.1fr_120px_120px_1fr]">
                    <div className="px-3 py-3 text-[13px] text-black/60">{v.id}</div>
                    <div className="px-3 py-3">
                      <div className="text-[13px] font-semibold text-[#2c2c2c]">{v.business_name}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge>{(v.review_count ?? 0).toString()} reviews</Badge>
                        <Badge>{(v.average_rating ?? 0).toFixed(1)} rating</Badge>
                      </div>
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(v)}
                          className="text-[12px] text-[#6e4f33] hover:underline font-medium"
                        >
                          Edit details →
                        </button>
                      </div>
                    </div>
                    <div className="px-3 py-3">
                      <a
                        href={`/vendors/${v.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[13px] text-[#6e4f33] hover:underline"
                      >
                        {v.slug}
                      </a>
                    </div>
                    <div className="px-3 py-3">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => patchVendor(v.id, { is_active: !Boolean(v.is_active) })}
                        className={`h-8 w-full rounded-[3px] border text-[12px] font-semibold transition-colors disabled:opacity-60 ${
                          v.is_active
                            ? "border-[#027a48]/20 bg-[#ecfdf3] text-[#027a48] hover:bg-[#d1fadf]"
                            : "border-black/10 bg-white text-black/60 hover:bg-black/5"
                        }`}
                      >
                        {v.is_active ? "Active" : "Inactive"}
                      </button>
                    </div>
                    <div className="px-3 py-3">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => patchVendor(v.id, { is_featured: !Boolean(v.is_featured) })}
                        className={`h-8 w-full rounded-[3px] border text-[12px] font-semibold transition-colors disabled:opacity-60 ${
                          v.is_featured
                            ? "border-[#b54708]/20 bg-[#fff7ed] text-[#b54708] hover:bg-[#ffead5]"
                            : "border-black/10 bg-white text-black/60 hover:bg-black/5"
                        }`}
                      >
                        {v.is_featured ? "Featured" : "Not featured"}
                      </button>
                    </div>
                    <div className="px-3 py-3">
                      <select
                        value={v.plan_id ?? ""}
                        disabled={isSaving}
                        onChange={(e) => {
                          const raw = e.target.value;
                          patchVendor(v.id, { plan_id: raw === "" ? null : Number(raw) });
                        }}
                        className="h-8 w-full rounded-[3px] border border-black/10 bg-white px-2 text-[12px] text-black/70 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15 disabled:opacity-60"
                      >
                        <option value="">(No plan)</option>
                        {plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      {planName ? (
                        <div className="mt-1 text-[11px] text-black/45">Current: {planName}</div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              {hasMore && (
                <div ref={sentinelRef} className="py-4 text-center text-[12px] text-black/45 bg-[#fcfbf9] border-t border-black/5 font-medium">
                  {loadingMore ? "Loading more..." : "Scroll to load more"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
