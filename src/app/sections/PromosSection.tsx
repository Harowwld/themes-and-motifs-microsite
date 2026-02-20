type FeaturedPromo = {
  id: number;
  title: string;
  summary: string | null;
  valid_from: string | null;
  valid_to: string | null;
  vendors: {
    business_name: string;
    slug: string;
  }[];
};

export default function PromosSection({ promos }: { promos: FeaturedPromo[] }) {
  return (
    <section id="promos" className="mt-12 sm:mt-16">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
            Promos
          </h2>
          <p className="mt-1 text-[13px] text-black/55 max-w-xl">
            Time-bound deals from suppliers—great for shortlisting with confidence.
          </p>
        </div>
        <a className="text-[13px] font-semibold text-[#6e4f33] hover:underline" href="#discover">
          View all
        </a>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promos.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
            <div className="text-[13px] font-semibold text-[#2c2c2c]">No featured promos yet</div>
            <div className="mt-1 text-[13px] text-black/55">Feature a promo to have it appear here.</div>
          </div>
        ) : (
          promos.map((promo, i) => {
            const tone = i % 3 === 0 ? "#a67c52" : i % 3 === 1 ? "#c17a4e" : "#8e6a46";
            const vendorName = promo.vendors?.[0]?.business_name;

            return (
              <div
                key={promo.id}
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
                    {vendorName ? vendorName : "Featured promo"}
                  </div>
                  <div className="mt-1 text-[15px] font-semibold text-[#2c2c2c]">{promo.title}</div>
                  <div className="mt-2 text-[13px] text-black/55 line-clamp-2">
                    {promo.summary ?? "Limited time • terms apply"}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-black/55">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#c17a4e]" aria-hidden />
                      Limited time
                    </div>
                    <a className="text-[13px] font-semibold text-[#6e4f33] hover:underline" href="#discover">
                      View
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
