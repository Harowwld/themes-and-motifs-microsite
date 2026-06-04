import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="inset-x-0 border-t border-gray-100 bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 sm:gap-8">
        
        <div className="flex flex-col items-center sm:items-start gap-2">
          <div className="text-[13px] font-semibold tracking-wide text-gray-700 font-[family-name:var(--font-plus-jakarta)]">
            Quick Links
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-[12px] sm:text-[13px] text-gray-500 font-[family-name:var(--font-plus-jakarta)]">
            <Link href="/contact-us" className="hover:text-[#a68b6a] transition-colors">Contact Us</Link>
            <Link href="/watchlist" className="hover:text-[#a68b6a] transition-colors">Watchlist</Link>
            <Link href="/suppliers/plans" className="hover:text-[#a68b6a] transition-colors">For Suppliers</Link>
            <Link href="/growth-ambassadors" className="hover:text-[#a68b6a] transition-colors">Growth Ambassadors</Link>
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-2 text-[12px] sm:text-[13px] font-[family-name:var(--font-plus-jakarta)]">
          <div className="font-medium tracking-wide text-gray-500 text-center sm:text-right">
            © 2026 Themes &amp; Motifs
          </div>
          <div className="text-gray-400 text-center sm:text-right">
            A curated wedding vendor directory
          </div>
        </div>

      </div>
    </footer>
  );
}
