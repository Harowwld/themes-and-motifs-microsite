"use client";

import { useRouter } from "next/navigation";
import VendorCard from "../components/VendorCard";
import type { FeaturedVendor } from "../types";

export default function FeaturedVendorsSection({ vendors }: { vendors: FeaturedVendor[] }) {
  const router = useRouter();

  return (
    <section id="featured" className="mt-12 sm:mt-16">
      <div className="text-center">
        <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
          Featured vendors
        </h2>
        <p className="mt-1 text-[13px] text-black/55 max-w-xl mx-auto">
          Handpicked suppliers for your special day.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {vendors.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 rounded-lg border border-gray-100 bg-white p-6">
            <div className="text-[13px] font-medium text-gray-900">No featured vendors yet</div>
            <div className="mt-1 text-[13px] text-gray-500">
              Mark vendors as featured to have them appear here.
            </div>
          </div>
        ) : (
          vendors.map((vendor, i) => {
            return (
              <div
                key={vendor.id}
                className="rounded-lg border border-gray-100 bg-white overflow-hidden hover:shadow-lg transition-shadow"
              >
                <VendorCard vendor={vendor} toneSeed={i} />
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 text-center">
        <a
          href="/vendors"
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#a68b6a] hover:text-[#957a5c] transition-colors"
        >
          View All Vendors
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden className="w-5 h-4">
            <path d="M2 8h16M12 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </section>
  );
}
