"use client";

import { useRouter } from "next/navigation";

type FeaturedVendor = {
  id: number;
  business_name: string;
  slug: string;
  average_rating: number | null;
  review_count: number | null;
  location_text: string | null;
  city: string | null;
};

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
            router.push("/vendors", { scroll: false });
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
            const tone = i % 3 === 0 ? "#7a8b6e" : i % 3 === 1 ? "#a67c52" : "#c17a4e";
            const rating = vendor.average_rating ?? 0;
            const reviews = vendor.review_count ?? 0;
            const location = vendor.city ?? vendor.location_text;

            return (
              <div
                key={vendor.id}
                className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden"
              >
                <div
                  className="h-24"
                  style={{
                    background: `linear-gradient(135deg, ${tone}22, #ffffff 65%)`,
                  }}
                />
                <div className="p-5">
                  <div className="text-[12px] font-semibold text-black/45">
                    {location ? location : "Philippines"}
                  </div>
                  <div className="mt-1 text-[15px] font-semibold text-[#2c2c2c]">
                    {vendor.business_name}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1 text-[12px] font-semibold text-black/55">
                      <span className="text-[#7a8b6e]">{rating.toFixed(1)}</span>
                      <span className="text-black/30">•</span>
                      <span>{reviews} reviews</span>
                    </div>
                    <a
                      className="text-[13px] font-semibold text-[#6e4f33] hover:underline"
                      href="#discover"
                    >
                      Explore
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
