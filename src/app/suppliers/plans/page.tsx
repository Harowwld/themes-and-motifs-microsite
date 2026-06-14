import FadeInOnView from "../../components/FadeInOnView";

type PlanFeature = {
  label: string;
  free: boolean;
  premium: boolean;
};

const planFeatures: PlanFeature[] = [
  { label: "Company name, address & contact person", free: true, premium: true },
  { label: "Mobile number displayed on listing", free: true, premium: true },
  { label: "Contact form for inquiries", free: true, premium: true },
  { label: "Up to 3 searchable categories", free: true, premium: true },
  { label: "Ratings & reviews from couples", free: true, premium: true },
  { label: "Up to 6 photos", free: true, premium: true },
  { label: "Link to website & social media", free: true, premium: true },
  { label: "Detailed description of services", free: true, premium: true },
  { label: "Featured in search results", free: false, premium: true },
  { label: "Priority placement in category listings", free: false, premium: true },
  { label: "Verified badge", free: false, premium: true },
  { label: "Unlimited photo gallery", free: false, premium: true },
  { label: "Album showcase", free: false, premium: true },
  { label: "Video showcase", free: false, premium: true },
  { label: "Analytics dashboard", free: false, premium: true },
  { label: "Lead generation tools", free: false, premium: true },
];

export default function VendorPlansPage() {
  const freeFeatures = planFeatures.filter((f) => f.free);
  const premiumFeatures = planFeatures.filter((f) => f.premium);

  return (
    <div className="min-h-screen bg-[#fafafa] font-[family-name:var(--font-plus-jakarta)] flex flex-col">
      {/* Header */}
      <section className="relative overflow-hidden bg-white py-8 sm:py-10 border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(#a68b6a_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05]" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <FadeInOnView>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#a68b6a]">
              Supplier Packages
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2c2c2c] sm:text-5xl font-[family-name:var(--font-noto-serif)]">
              Pricing Plans
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-gray-500">
              Choose the plan that fits your business needs and start connecting with couples today.
            </p>
          </FadeInOnView>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-8 sm:py-12 flex-1">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto items-stretch">
            {/* Standard Plan */}
            <FadeInOnView>
              <div className="group relative flex flex-col h-full rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-gray-200">
                <div className="mb-6">
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Free</div>
                  <h3 className="mt-2 text-2xl font-bold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">Standard</h3>
                  <p className="mt-2 text-[13px] text-gray-500 leading-relaxed">
                    Essential features to get your business listed and discovered by couples.
                  </p>
                </div>
                
                <div className="flex-1">
                  <ul className="space-y-3">
                    {freeFeatures.map((f) => (
                      <li key={f.label} className="flex items-start gap-3 text-[13px] text-gray-600">
                        <svg className="h-4 w-4 text-gray-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="leading-tight">{f.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-50">
                  <a 
                    href="/register?plan=1" 
                    className="flex w-full items-center justify-center h-11 text-[13px] font-semibold text-[#2c2c2c] bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-black transition-all duration-200 active:scale-[0.97]"
                  >
                    Select Standard
                  </a>
                </div>
              </div>
            </FadeInOnView>

            {/* Premium Plan */}
            <FadeInOnView>
              <div className="group relative flex flex-col h-full rounded-2xl border border-[#a68b6a]/30 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#a68b6a]/50 overflow-hidden">
                {/* Premium Accent Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#a68b6a]/[0.05] to-transparent pointer-events-none" />
                
                <div className="relative mb-6">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-semibold text-[#a68b6a] uppercase tracking-wider">Premium</div>
                    <span className="inline-flex items-center rounded-full bg-[#a68b6a] px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wide shadow-sm">
                      Elite Choice
                    </span>
                  </div>
                  <h3 className="mt-2 text-2xl font-bold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">Leads Generator</h3>
                  <p className="mt-2 text-[13px] text-gray-500 leading-relaxed">
                    Maximize your reach, get featured placements, and access powerful lead generation tools.
                  </p>
                </div>
                
                <div className="relative flex-1">
                  <ul className="space-y-3">
                    {premiumFeatures.map((f) => (
                      <li key={f.label} className="flex items-start gap-3 text-[13px] text-gray-700">
                        <svg className="h-4 w-4 text-[#a68b6a] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="leading-tight">{f.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="relative mt-8 pt-6 border-t border-gray-100">
                  <a 
                    href="/register?plan=2" 
                    className="flex w-full items-center justify-center h-11 text-[13px] font-semibold text-white bg-[#a68b6a] rounded-lg hover:bg-[#957a5c] transition-all duration-200 shadow-sm hover:shadow active:scale-[0.97]"
                  >
                    Get Leads / Potential Clients
                  </a>
                </div>
              </div>
            </FadeInOnView>
          </div>
        </div>
      </section>
    </div>
  );
}
