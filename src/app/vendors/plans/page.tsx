import SiteHeader from "../../sections/SiteHeader";
import SiteFooter from "../../sections/SiteFooter";
import FadeInOnView from "../../components/FadeInOnView";

type PlanFeature = {
  label: string;
  free: boolean;
  premium: boolean;
};

const planFeatures: PlanFeature[] = [
  { label: "Company name, address & contact person", free: true, premium: true },
  { label: "Up to 3 searchable categories", free: true, premium: true },
  { label: "Ratings & reviews from couples", free: true, premium: true },
  { label: "Up to 6 photos", free: true, premium: true },
  { label: "Link to website & social media", free: true, premium: true },
  { label: "Detailed description of services", free: true, premium: true },
  { label: "Featured in search results", free: false, premium: true },
  { label: "Priority placement in category listings", free: false, premium: true },
  { label: "Verified badge", free: false, premium: true },
  { label: "Unlimited photo gallery", free: false, premium: true },
  { label: "Video showcase", free: false, premium: true },
  { label: "Analytics dashboard", free: false, premium: true },
  { label: "Lead generation tools", free: false, premium: true },
];

export default function VendorPlansPage() {
  const freeFeatures = planFeatures.filter((f) => f.free);
  const premiumFeatures = planFeatures.filter((f) => f.premium);

  return (
    <div style={{ background: "#fafafa", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteHeader />

      <div className="flex-1 mx-auto w-full max-w-6xl px-5 sm:px-8">
        <main className="py-10 sm:py-14">
          <FadeInOnView>
            <section>
              <div className="text-center mb-10">
                <h1 className="text-[24px] font-semibold text-[#2c2c2c]">Pricing Plans</h1>
                <p className="mt-2 text-[14px] text-black/60 font-[family-name:var(--font-plus-jakarta)]">Choose the plan that fits your business needs</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
                <div className="flex-1 rounded-lg border border-black/10 p-4 min-w-0 flex flex-col">
                  <div className="text-[11px] font-medium text-black/40 uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)]">Free</div>
                  <div className="mt-1 text-[18px] font-medium text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">Standard</div>
                  <div className="mt-2 space-y-1.5">
                    {freeFeatures.map((f) => (
                      <div key={f.label} className="flex items-center gap-2 text-[12px] text-black/60 font-[family-name:var(--font-plus-jakarta)]">
                        <svg className="h-3.5 w-3.5 text-black/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{f.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto pt-3">
                    <a href="/register?plan=1" className="block w-full h-8 text-[12px] font-medium text-white bg-black/70 rounded-md hover:bg-black/80 transition-colors text-center leading-8 font-[family-name:var(--font-plus-jakarta)]">
                      Select Standard
                    </a>
                  </div>
                </div>

                <div className="flex-1 rounded-lg border-2 border-[#a68b6a]/50 bg-[#a68b6a]/5 p-4 min-w-0 relative flex flex-col">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="text-[10px] font-semibold text-white bg-[#a68b6a] px-2.5 py-1 rounded-full shadow-sm font-[family-name:var(--font-plus-jakarta)]">Elite Choice</span>
                  </div>
                  <div className="text-[11px] font-medium text-[#a68b6a] uppercase tracking-wider mt-1 font-[family-name:var(--font-plus-jakarta)]">Premium</div>
                  <div className="mt-1 text-[18px] font-medium text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">Boosted</div>
                  <div className="mt-2 space-y-1.5">
                    {premiumFeatures.map((f) => (
                      <div key={f.label} className="flex items-center gap-2 text-[12px] text-black/70 font-[family-name:var(--font-plus-jakarta)]">
                        <svg className="h-3.5 w-3.5 text-[#a68b6a] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{f.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto pt-3">
                    <a href="/register?plan=2" className="block w-full h-8 text-[12px] font-medium text-white bg-[#a68b6a] rounded-md hover:bg-[#957a5c] transition-colors text-center leading-8 font-[family-name:var(--font-plus-jakarta)]">
                      Select Boosted
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </FadeInOnView>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
