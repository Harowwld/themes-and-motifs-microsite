import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="inset-x-0 border-t border-gray-100 bg-white mt-auto font-[family-name:var(--font-plus-jakarta)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 lg:gap-8">
          {/* Brand Column */}
          <div className="flex flex-col items-center md:items-start">
            <Link
              href="/"
              aria-label="Themes & Motifs The Wedding App"
              className="inline-block"
            >
              <img
                src="/logo.png"
                alt="Themes & Motifs The Wedding App"
                className="h-10 sm:h-12 w-auto"
                loading="lazy"
              />
            </Link>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col items-center md:items-center">
            <div className="flex flex-col items-center md:items-start w-fit">
              <h3 className="text-[12px] font-bold tracking-widest uppercase text-gray-800 mb-5 w-full text-center md:text-left">
                Platform
              </h3>
              <nav className="flex flex-col gap-3.5 text-[13px] text-gray-500 items-center md:items-start">
                <Link href="/watchlist" className="hover:text-[#a68b6a] transition-colors">Watchlist</Link>
                <Link href="/suppliers/plans" className="hover:text-[#a68b6a] transition-colors">For Suppliers</Link>
                <Link href="/affiliates" className="hover:text-[#a68b6a] transition-colors">Affiliate Partners</Link>
              </nav>
            </div>
          </div>

          {/* Company Links */}
          <div className="flex flex-col items-center md:items-end">
            <div className="flex flex-col items-center md:items-start w-fit">
              <h3 className="text-[12px] font-bold tracking-widest uppercase text-gray-800 mb-5 w-full text-center md:text-left">
                Company
              </h3>
              <nav className="flex flex-col gap-3.5 text-[13px] text-gray-500 items-center md:items-start">
                <Link href="/contact-us" className="hover:text-[#a68b6a] transition-colors">Contact Us</Link>
                <Link href="/growth-ambassadors" className="hover:text-[#a68b6a] transition-colors">Growth Ambassadors</Link>
                <Link href="/references" className="hover:text-[#a68b6a] transition-colors">In The News</Link>
              </nav>
            </div>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-[12px] font-medium text-gray-400">
            © {new Date().getFullYear()} Themes &amp; Motifs. All rights reserved.
          </p>
          <div className="flex gap-6 text-[12px] font-medium text-gray-400">
            <Link href="#" className="hover:text-[#a68b6a] transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#a68b6a] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
