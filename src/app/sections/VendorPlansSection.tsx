import Image from "next/image";

type PlanFeature = {
  label: string;
  free: boolean;
  premium: boolean;
};

export default function VendorPlansSection({ planFeatures }: { planFeatures: PlanFeature[] }) {
  return (
    <section className="mt-12 sm:mt-16">
      <div id="for-vendors" className="rounded-[3px] border border-black/10 bg-white shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-[3px] border border-black/10 bg-[#f3ede6] grid place-items-center">
            <Image aria-hidden src="/window.svg" alt="" width={18} height={18} />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-[#2c2c2c]">Built for vendor growth</div>
            <div className="text-[12px] text-black/50">Leads, promos, and plan-based visibility.</div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[3px] border border-black/10 bg-white shadow-sm p-5">
            <div className="text-[12px] font-semibold text-black/45">Free</div>
            <div className="mt-1 text-[20px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Standard listing</div>
            <div className="mt-1 text-[13px] text-black/55">Visibility in the directory with core business info.</div>

            <div className="mt-4 grid gap-2 text-[13px]">
              {planFeatures.map((f) => (
                <div key={f.label} className={`flex gap-2 ${f.free ? "text-black/60" : "text-black/30"}`}>
                  <span className={`${f.free ? "text-black/35" : "text-black/25"}`}>{f.free ? "✓" : "×"}</span>
                  {f.label}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[3px] border border-[#a67c52]/35 bg-[#fffaf5] shadow-sm p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[12px] font-semibold text-[#6e4f33]">15-days trial / Premium</div>
                <div className="mt-1 text-[20px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Boosted profile</div>
              </div>
              <div className="rounded-[999px] border border-[#a67c52]/35 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#6e4f33]">
                Most popular
              </div>
            </div>
            <div className="mt-1 text-[13px] text-black/55">More touchpoints, richer profile, and expanded discovery.</div>

            <div className="mt-4 grid gap-2 text-[13px]">
              {planFeatures.map((f) => (
                <div
                  key={f.label}
                  className={`flex gap-2 ${f.premium ? "text-black/60" : "text-black/30"}`}
                >
                  <span className={`${f.premium ? "text-[#7a8b6e]" : "text-black/25"}`}>{f.premium ? "✓" : "×"}</span>
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <a
            className="h-10 inline-flex items-center justify-center px-4 rounded-[3px] bg-[#7a8b6e] text-white text-[13px] font-semibold hover:bg-[#66785c] transition-colors"
            href="#"
          >
            Apply to list your business
          </a>
          <a
            className="h-10 inline-flex items-center justify-center px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/[0.02] transition-colors"
            href="#"
          >
            See plans
          </a>
        </div>
      </div>
    </section>
  );
}
