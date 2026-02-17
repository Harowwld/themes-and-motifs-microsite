type Category = {
  id: number;
  name: string;
  slug: string;
};

export default function HeroSection({
  categories,
  locations,
}: {
  categories: Category[];
  locations: string[];
}) {
  return (
    <section className="relative overflow-hidden rounded-[3px] border border-black/5 bg-white/40 shadow-sm p-5 sm:p-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(https://images.zola.com/6217d460-573c-49e4-85fe-2760f4baa964?w=1846&h=995&fit=clip&q=80&fm=webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(0.95)",
          opacity: 1,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(252,251,249,0.92) 0%, rgba(252,251,249,0.84) 40%, rgba(252,251,249,0.70) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.55),transparent_45%)]"
      />

      <div className="relative z-10 pt-2">
        <div className="inline-flex items-center gap-2 rounded-[999px] border border-black/10 bg-white px-3 py-1 text-[12px] font-semibold text-black/60 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7a8b6e]" aria-hidden />
          Verified vendors • real reviews • promos
        </div>

        <h1 className="mt-5 text-[38px] leading-[1.06] sm:text-[52px] font-semibold tracking-[-0.02em] text-[#2c2c2c]">
          Plan your perfect day.
          <span className="block text-[#a67c52] italic">Find the best suppliers.</span>
        </h1>

        <p className="mt-4 max-w-xl text-[15px] sm:text-[16px] leading-7 text-black/60">
          Search over 1,000 verified wedding vendors with real reviews.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <a
            className="h-11 inline-flex items-center justify-center px-5 rounded-[3px] bg-[#a67c52] text-white text-[14px] font-semibold hover:bg-[#8e6a46] transition-colors shadow-sm"
            href="#discover"
          >
            Discover vendors
          </a>
          <a
            className="h-11 inline-flex items-center justify-center px-5 rounded-[3px] border border-[#a67c52]/35 bg-white text-[#6e4f33] text-[14px] font-semibold hover:bg-[#f8f1e8] transition-colors"
            href="#for-vendors"
          >
            Become a vendor
          </a>
        </div>

        <div className="mt-7 grid grid-cols-3 gap-3 max-w-xl">
          <div className="rounded-[3px] border border-black/10 bg-white px-3 py-3 shadow-sm">
            <div className="text-[12px] font-semibold text-black/45">Browse</div>
            <div className="mt-1 text-[14px] font-semibold text-[#2c2c2c]">Categories</div>
          </div>
          <div className="rounded-[3px] border border-black/10 bg-white px-3 py-3 shadow-sm">
            <div className="text-[12px] font-semibold text-black/45">Compare</div>
            <div className="mt-1 text-[14px] font-semibold text-[#2c2c2c]">Ratings</div>
          </div>
          <div className="rounded-[3px] border border-black/10 bg-white px-3 py-3 shadow-sm">
            <div className="text-[12px] font-semibold text-black/45">Save</div>
            <div className="mt-1 text-[14px] font-semibold text-[#2c2c2c]">Promos</div>
          </div>
        </div>
      </div>

      <div className="relative z-10 rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5">
          <div className="text-[13px] font-semibold text-[#2c2c2c]">Quick search</div>
          <div className="mt-1 text-[12px] text-black/50">
            Keyword + filters (category, location, affiliation)
          </div>
        </div>

        <div className="p-5 grid gap-3">
          <label className="grid gap-1">
            <span className="text-[12px] font-semibold text-black/55">Keyword</span>
            <input
              placeholder="Search vendor name (e.g. Nice Print)"
              className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-[12px] font-semibold text-black/55">Category</span>
              <select className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-black/70 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15">
                <option>All categories</option>
                {categories.length === 0 ? (
                  <option disabled>(No categories loaded)</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-[12px] font-semibold text-black/55">Location</span>
              <select className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-black/70 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15">
                <option>All locations</option>
                {locations.length === 0 ? (
                  <option disabled>(No locations loaded)</option>
                ) : (
                  locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))
                )}
              </select>
            </label>
          </div>

          <a
            id="discover"
            className="mt-1 h-10 inline-flex items-center justify-center rounded-[3px] bg-[#a67c52] text-white text-[14px] font-semibold hover:bg-[#8e6a46] transition-colors"
            href="#featured"
          >
            Search
          </a>

          <div className="flex items-center justify-between text-[12px] text-black/45">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c17a4e]" aria-hidden />
              Tip: start with a category
            </span>
            <span className="font-semibold">Preview UI</span>
          </div>
        </div>
      </div>
    </section>
  );
}
