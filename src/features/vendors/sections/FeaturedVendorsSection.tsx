"use client";

import { useRouter } from "next/navigation";
import VendorCard from "../components/VendorCard";
import type { FeaturedVendor } from "../types";

export default function FeaturedVendorsSection({ vendors }: { vendors: FeaturedVendor[] }) {
  const router = useRouter();

  return (
    <section id="featured" className="mt-12 sm:mt-16">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
            Featured vendors
          </h2>
          <p className="mt-1 text-[13px] text-black/55 max-w-xl">
            A curated snapshot of suppliers—designed to help couples decide faster.
          </p>
        </div>
        <a
          className="text-[13px] font-semibold text-[#6e4f33] hover:underline"
          href="/vendors"
          onClick={(e) => {
            e.preventDefault();
            router.push("/vendors");
          }}
        >
          View all
        </a>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vendors.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
            <div className="text-[13px] font-semibold text-[#2c2c2c]">No featured vendors yet</div>
            <div className="mt-1 text-[13px] text-black/55">
              Mark vendors as featured to have them appear here.
            </div>
          </div>
        ) : (
          vendors.map((vendor, i) => {
            return <VendorCard key={vendor.id} vendor={vendor} toneSeed={i} />;
          })
        )}
      </div>
    </section>
  );
}
