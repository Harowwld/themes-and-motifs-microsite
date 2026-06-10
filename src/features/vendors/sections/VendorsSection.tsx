"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VendorCard from "../components/VendorCard";
import type { VendorListItem } from "../types";

const EASE_OUT = [0.23, 1, 0.32, 1] as [number, number, number, number];

export function VendorCardSkeleton() {
  return (
    <div className="h-[240px] rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="h-28 w-full bg-gray-50 animate-pulse" />
      <div className="relative px-4 pt-0 pb-4">
        <div className="relative -mt-10 mb-3 flex items-end justify-between">
          <div className="h-20 w-20 rounded-2xl border-4 border-white bg-gray-50 shadow-lg animate-pulse -ml-1" />
          <div className="h-3 w-12 bg-gray-50 animate-pulse rounded-full" />
        </div>
        <div className="h-4 w-3/4 rounded bg-gray-50 animate-pulse mb-2" />
        <div className="h-3 w-1/2 rounded bg-gray-50 animate-pulse" />
      </div>
    </div>
  );
}

type SortKey = "alpha" | "rating" | "newest" | "saves" | "views" | "photos";

type VendorsSectionProps = {
  vendors?: VendorListItem[];
  total?: number;
  page?: number;
  pageSize?: number;
  sort?: SortKey;
  basePath?: string;
  extraParams?: Record<string, string | undefined>;
  isLoading?: boolean;
};

function makeHref({
  page,
  sort,
  basePath,
  extraParams,
}: {
  page: number;
  sort: SortKey;
  basePath?: string;
  extraParams?: Record<string, string | undefined>;
}) {
  const params = new URLSearchParams();
  if (extraParams) {
    for (const [k, v] of Object.entries(extraParams)) {
      if (v) params.set(k, v);
    }
  }
  if (page > 1) params.set("vendorsPage", String(page));
  params.set("vendorsSort", sort);
  const qs = params.toString();
  return `${basePath ?? ""}${qs ? `?${qs}` : "?"}`;
}

export default function VendorsSection({
  vendors = [],
  total = 0,
  page = 1,
  pageSize = 9,
  sort = "photos",
  basePath,
  extraParams,
  isLoading,
}: VendorsSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activePage, setActivePage] = useState(page);
  const [localVendors, setLocalVendors] = useState(vendors);

  // Sync state if server side prop changes (e.g. on filter/sort change or direct URL navigation)
  useEffect(() => {
    setActivePage(page);
    setLocalVendors(vendors);
  }, [page, sort, vendors]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = activePage > 1;
  const hasNext = activePage < totalPages;

  const navigate = (href: string) => {
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  };

  // Sliding window background pre-fetcher
  useEffect(() => {
    const maxLoadedPage = page - 1 + Math.ceil(localVendors.length / pageSize);
    if (activePage + 5 > maxLoadedPage && maxLoadedPage < totalPages) {
      const nextPageToFetch = maxLoadedPage + 1;
      
      const fetchNextPageData = async () => {
        try {
          const params = new URLSearchParams();
          if (extraParams) {
            for (const [k, v] of Object.entries(extraParams)) {
              if (v) params.set(k, v);
            }
          }
          params.set("page", String(nextPageToFetch));
          params.set("limit", String(pageSize));
          params.set("vendorsSort", sort);
          
          const res = await fetch(`/api/suppliers?${params.toString()}`);
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.vendors)) {
              setLocalVendors(prev => {
                const existingIds = new Set(prev.map(v => v.id));
                const newItems = data.vendors.filter((v: any) => !existingIds.has(v.id));
                return [...prev, ...newItems];
              });
            }
          }
        } catch (err) {
          console.error("Failed to pre-fetch next page:", err);
        }
      };
      
      fetchNextPageData();
    }
  }, [activePage, localVendors.length, page, pageSize, totalPages, sort, extraParams]);

  const handlePageChange = (targetPage: number) => {
    const localFrom = (targetPage - page) * pageSize;
    const localTo = localFrom + pageSize;

    // If the data is available in the pre-fetched array, change page instantly client-side
    if (localFrom >= 0 && localTo <= localVendors.length) {
      setActivePage(targetPage);
      const nextHref = makeHref({ page: targetPage, sort, basePath, extraParams });
      window.history.pushState(null, "", nextHref);
    } else {
      // Fallback: load next chunk from server
      navigate(makeHref({ page: targetPage, sort, basePath, extraParams }));
    }
  };

  // Slice localVendors in memory for the active page
  const localFrom = (activePage - page) * pageSize;
  const localTo = localFrom + pageSize;
  const currentPageVendors = (localFrom >= 0 && localFrom < localVendors.length)
    ? localVendors.slice(localFrom, localTo)
    : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <section className="mt-8 sm:mt-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.01em] text-[#2c2c2c]"
          >
            Vendors
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-1 text-[13px] text-black/55 max-w-xl font-[family-name:var(--font-plus-jakarta)]"
          >
            Browse suppliers—sort by name or ratings, then page through the list.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm w-full sm:w-auto"
        >
          {([
            { value: "rating", label: "Top rated" },
            { value: "alpha", label: "A-Z" },
            { value: "photos", label: "With photos" },
            { value: "newest", label: "Newest" },
          ] as const).map((option) => (
            <motion.button
              whileTap={{ scale: 0.96 }}
              key={option.value}
              type="button"
              onClick={() => navigate(makeHref({ page: 1, sort: option.value as SortKey, basePath, extraParams }))}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[13px] font-bold transition-all font-[family-name:var(--font-plus-jakarta)] whitespace-nowrap ${
                sort === option.value
                  ? "bg-[#a68b6a] text-white shadow-md shadow-[#a68b6a]/20"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </motion.button>
          ))}
        </motion.div>
      </div>

      <div className="mt-6 sm:mt-8">
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${sort}-${activePage}-${isPending}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"
          >
            {isPending || isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <VendorCardSkeleton key={`skeleton-${i}`} />
              ))
            ) : currentPageVendors.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-gray-100 bg-white shadow-sm p-8 text-center"
              >
                <div className="text-[14px] font-semibold text-gray-900 font-[family-name:var(--font-plus-jakarta)]">No vendors found</div>
                <div className="mt-1 text-[13px] text-gray-500 font-[family-name:var(--font-plus-jakarta)]">Try another sort or check back later.</div>
              </motion.div>
            ) : (
              currentPageVendors.map((vendor, i) => (
                <VendorCard key={vendor.id} vendor={vendor} toneSeed={i} fixedHeight />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="text-[12px] font-bold text-gray-400 text-center sm:text-left font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider">
          Page {activePage} <span className="mx-1 opacity-50">/</span> {totalPages}
        </div>
        <div className="flex items-center justify-center sm:justify-start gap-3">
          <motion.a
            whileHover={hasPrev ? { x: -4 } : {}}
            whileTap={hasPrev ? { scale: 0.95 } : {}}
            className={`h-11 sm:h-10 inline-flex items-center justify-center px-6 sm:px-5 rounded-xl border text-[14px] sm:text-[13px] font-bold transition-all min-w-[100px] touch-manipulation font-[family-name:var(--font-plus-jakarta)] ${
              hasPrev
                ? "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm"
                : "border-gray-100 bg-gray-50 text-gray-300 pointer-events-none"
            }`}
            href={makeHref({ page: Math.max(1, activePage - 1), sort, basePath, extraParams })}
            onClick={(e) => {
              if (!hasPrev) return;
              e.preventDefault();
              handlePageChange(Math.max(1, activePage - 1));
            }}
            aria-disabled={!hasPrev}
          >
            Previous
          </motion.a>
          <motion.a
            whileHover={hasNext ? { x: 4 } : {}}
            whileTap={hasNext ? { scale: 0.95 } : {}}
            className={`h-11 sm:h-10 inline-flex items-center justify-center px-6 sm:px-5 rounded-xl border text-[14px] sm:text-[13px] font-bold transition-all min-w-[100px] touch-manipulation font-[family-name:var(--font-plus-jakarta)] ${
              hasNext
                ? "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm"
                : "border-gray-100 bg-gray-50 text-gray-300 pointer-events-none"
            }`}
            href={makeHref({ page: Math.min(totalPages, activePage + 1), sort, basePath, extraParams })}
            onClick={(e) => {
              if (!hasNext) return;
              e.preventDefault();
              handlePageChange(Math.min(totalPages, activePage + 1));
            }}
            aria-disabled={!hasNext}
          >
            Next
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
