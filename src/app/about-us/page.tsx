import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Themes & Motifs",
  description: "Learn more about Themes & Motifs, the Philippines' most prestigious wedding resource company and DOT-accredited MICE organizer.",
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] font-[family-name:var(--font-plus-jakarta)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-24 border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(#a68b6a_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05]" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#a68b6a]">
            Pioneering Wedding Resource
          </span>
          <h1 id="about-us-title" className="mt-3 text-3xl font-bold tracking-tight text-[#2c2c2c] sm:text-5xl font-headline">
            About Themes & Motifs
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-relaxed text-gray-500">
            Welcome to the Philippines' most prestigious wedding resource company and bridal fair organizer. Since 2001, we have dedicated ourselves to connecting couples with high-fidelity, trusted, and professional wedding suppliers.
          </p>
        </div>
      </section>

      {/* Main Content & Credentials */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* DOT Accreditation Card */}
            <div className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
              <div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#a68b6a]/10 text-[#a68b6a]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-[18px] font-semibold text-[#2c2c2c] font-headline">DOT Accredited Organizer</h3>
                <p className="mt-4 text-[14px] leading-relaxed text-gray-500">
                  Themes & Motifs is the first and only wedding planner and bridal fair organizer in the Philippines officially accredited by the Department of Tourism as a <strong>MICE Organizer</strong> (Meetings, Incentives, Conferences, and Exhibitions).
                </p>
              </div>
            </div>

            {/* Strict Supplier Verification Card */}
            <div className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
              <div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#a68b6a]/10 text-[#a68b6a]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="mt-6 text-[18px] font-semibold text-[#2c2c2c] font-headline">Guaranteed Trust & Safety</h3>
                <p className="mt-4 text-[14px] leading-relaxed text-gray-500">
                  We prioritize user safety above all. To protect couples planning their special day, all of our registered exhibitors and partners undergo a rigorous verification process, ensuring they hold valid business names and BIR registrations.
                </p>
              </div>
            </div>

            {/* Outstanding Milestone Card */}
            <div className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
              <div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#a68b6a]/10 text-[#a68b6a]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-[18px] font-semibold text-[#2c2c2c] font-headline">Industry Standards Pioneer</h3>
                <p className="mt-4 text-[14px] leading-relaxed text-gray-500">
                  From hosting Asia's grandest wedding expos to launching professional "Top Booker" awards and massive hotel-quality food tastings, we consistently elevate the benchmarks of the local wedding services sector.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Paragraph / Timeline */}
          <div className="mt-16 rounded-2xl border border-gray-100 bg-white p-8 sm:p-12 shadow-sm">
            <h2 className="text-2xl font-bold text-[#2c2c2c] font-headline">Our Digital and Offline Ecosystem</h2>
            <div className="mt-6 space-y-6 text-[15px] leading-relaxed text-gray-600">
              <p>
                Themes & Motifs bridges traditional large-scale exhibition prestige with cutting-edge digital wedding solutions. Through our offline wedding expos, soon-to-wed couples can meet thousands of qualified service providers in person.
              </p>
              <div className="grid gap-6 sm:grid-cols-2 mt-8">
                <div className="rounded-lg bg-gray-50 p-6 border border-gray-100">
                  <h4 className="font-semibold text-[#2c2c2c] text-[15px]">Major Wedding Expos</h4>
                  <ul className="mt-3 space-y-2 text-[14px] text-gray-500">
                    <li className="flex items-start">
                      <span className="mr-2 text-[#a68b6a]">•</span>
                      <strong>Wedding Expo Philippines:</strong> Widely celebrated as "Asia's Biggest Bridal Fair."
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-[#a68b6a]">•</span>
                      <strong>The Philippine Wedding Summit:</strong> The annual premier mid-year wedding fair.
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg bg-gray-50 p-6 border border-gray-100">
                  <h4 className="font-semibold text-[#2c2c2c] text-[15px]">Online Directories & Resources</h4>
                  <ul className="mt-3 space-y-2 text-[14px] text-gray-500">
                    <li className="flex items-start">
                      <span className="mr-2 text-[#a68b6a]">•</span>
                      <strong>Inspirations.PH:</strong> A visual-heavy digital wedding journal packed with planning inspiration.
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-[#a68b6a]">•</span>
                      <strong>The Bridal Marketplace:</strong> An interactive, secure e-commerce mall built specifically for wedding packages.
                    </li>
                  </ul>
                </div>
              </div>

              <p className="pt-4 border-t border-gray-100">
                With this dedicated microsite, we are making vendor discovery, custom deal tracking, and RSVP coordination even more seamless. We are honored to accompany you on this beautiful path toward your dream wedding.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-6">
                <Link
                  id="about-us-vendors-btn"
                  href="/vendors"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#a68b6a] px-6 text-[14px] font-medium text-white hover:bg-[#957a5c] transition-colors shadow-sm"
                >
                  Browse Verified Vendors
                </Link>
                <Link
                  id="about-us-contact-btn"
                  href="/contact-us"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-6 text-[14px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
