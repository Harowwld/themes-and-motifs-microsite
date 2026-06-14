import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why Trust Us | Themes & Motifs The Wedding App",
  description: "Learn why Themes & Motifs The Wedding App is the most trusted wedding platform in the Philippines, backed by government affiliations and strict supplier verification.",
};

export default function WhyTrustUsPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] font-[family-name:var(--font-plus-jakarta)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-24 border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(#a68b6a_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05]" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#a68b6a]">
            Your Peace of Mind is our Priority
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2c2c2c] sm:text-5xl font-headline">
            Why Trust Us
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-relaxed text-gray-500">
            For over two decades, Themes & Motifs The Wedding App has set the gold standard in the Philippine wedding industry. We ensure every couple connects only with legitimate, highly-vetted, and professional wedding suppliers.
          </p>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* DOT Accreditation */}
            <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#a68b6a]/10 text-[#a68b6a] mb-6">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-[18px] font-semibold text-[#2c2c2c] font-headline">DOT Accredited MICE Organizer</h3>
              <p className="mt-4 text-[14px] leading-relaxed text-gray-500 flex-grow">
                We are proud to be the first and only wedding fair organizer officially accredited by the Philippine Department of Tourism, a testament to our adherence to national tourism and events standards.
              </p>
            </div>

            {/* Strict Supplier Verification */}
            <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#a68b6a]/10 text-[#a68b6a] mb-6">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-[18px] font-semibold text-[#2c2c2c] font-headline">100% Verified Suppliers</h3>
              <p className="mt-4 text-[14px] leading-relaxed text-gray-500 flex-grow">
                To protect couples from scams and fly-by-night operators, every supplier on our platform must submit valid government documents (BIR, DTI, SEC, or Mayor&apos;s Permit) before they can offer their services.
              </p>
            </div>

            {/* Real Couple Reviews */}
            <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#a68b6a]/10 text-[#a68b6a] mb-6">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-[18px] font-semibold text-[#2c2c2c] font-headline">Authentic Reviews</h3>
              <p className="mt-4 text-[14px] leading-relaxed text-gray-500 flex-grow">
                Our ecosystem thrives on transparency. Ratings and reviews come from real couples who have interacted with or booked the suppliers, ensuring you get honest feedback for your wedding decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliations & Agencies */}
      <section className="py-12 sm:py-20 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[#2c2c2c] font-headline">Recognized by Government Agencies</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-gray-500">
            We work closely with the following national agencies to ensure legal compliance, business legitimacy, and the continuous promotion of the Philippines as a premier wedding destination.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4 items-center justify-items-center opacity-90">
            {/* DOT */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-24 h-24 rounded-full bg-white border border-gray-100 flex items-center justify-center p-3 shadow-sm hover:shadow-md transition-shadow">
                <img src="/agencies/dot.png" alt="Department of Tourism (DOT) Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-[13px] font-medium text-gray-700">Dept. of Tourism<br/>(DOT)</span>
            </div>

            {/* DTI */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-24 h-24 rounded-full bg-white border border-gray-100 flex items-center justify-center p-3 shadow-sm hover:shadow-md transition-shadow">
                <img src="/agencies/dti.png" alt="Department of Trade and Industry (DTI) Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-[13px] font-medium text-gray-700">Dept. of Trade & Industry<br/>(DTI)</span>
            </div>

            {/* SEC */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-24 h-24 rounded-full bg-white border border-gray-100 flex items-center justify-center p-3 shadow-sm hover:shadow-md transition-shadow">
                <img src="/agencies/sec.png" alt="Securities and Exchange Commission (SEC) Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-[13px] font-medium text-gray-700">Securities & Exchange<br/>Commission (SEC)</span>
            </div>

            {/* BIR */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-24 h-24 rounded-full bg-white border border-gray-100 flex items-center justify-center p-3 shadow-sm hover:shadow-md transition-shadow">
                <img src="/agencies/bir.png" alt="Bureau of Internal Revenue (BIR) Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-[13px] font-medium text-gray-700">Bureau of Internal<br/>Revenue (BIR)</span>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link
              href="/suppliers"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#a68b6a] px-8 text-[14px] font-medium text-white hover:bg-[#957a5c] transition-colors shadow-md"
            >
              Start Building Your Dream Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
