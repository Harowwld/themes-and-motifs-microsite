import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="inset-x-0 border-t border-gray-100 bg-white mt-auto">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Quick Links */}
        <div className="flex flex-col items-center sm:items-start gap-4">
          <div className="text-[13px] font-bold tracking-widest uppercase text-gray-800 font-[family-name:var(--font-plus-jakarta)]">
            Quick Links
          </div>
          <div className="flex flex-col items-center sm:items-start gap-2.5 text-[13px] text-gray-500 font-[family-name:var(--font-plus-jakarta)]">
            <Link href="/contact-us" className="hover:text-[#a68b6a] transition-colors">Contact Us</Link>
            <Link href="/watchlist" className="hover:text-[#a68b6a] transition-colors">Watchlist</Link>
            <Link href="/suppliers/plans" className="hover:text-[#a68b6a] transition-colors">For Suppliers</Link>
            <Link href="/growth-ambassadors" className="hover:text-[#a68b6a] transition-colors">Growth Ambassadors</Link>
          </div>
        </div>

        {/* References */}
        <div className="flex flex-col items-center sm:items-start gap-4">
          <div className="text-[13px] font-bold tracking-widest uppercase text-gray-800 font-[family-name:var(--font-plus-jakarta)]">
            References
          </div>
          <div className="flex flex-col items-center sm:items-start gap-2.5 text-[13px] text-gray-500 font-[family-name:var(--font-plus-jakarta)]">
            <a href="https://news.google.com/rss/articles/CBMihgFBVV95cUxOdUlVb3M4VjdMWF94X1ltbG1YdXRWZUtvdG9uNXNvNFJRMFdzUlJwbEZvdVZHa3hPNlN1MDJxVUk1QnlqVmdxNzR6aDlMcW11TXpVRkRNeW9yOEZtc2ZFaV9SZkk1T2RhenpnRHFsMlBSdFdnZGJRRmRpZjhydFZfUURCNHVYUQ?oc=5" target="_blank" rel="noopener noreferrer" className="hover:text-[#a68b6a] transition-colors">PeopleAsia: Leading Wedding Expos</a>
            <a href="https://news.google.com/rss/articles/CBMiakFVX3lxTE90a1ZPSUhXb3pYTWI5MWM1cXBpcmNlMmpNNkN1Nnh4ejkxd1BOLWNVV2dHMlJtUV8zZ3htYjN0RVlHRG5LQUdRR1JzMExCNU9wTUVOLVBuN2Y3bHA5ZkRJT3p3Njl6VDU3SGc?oc=5" target="_blank" rel="noopener noreferrer" className="hover:text-[#a68b6a] transition-colors">Brides: 13 Filipino Wedding Traditions</a>
            <a href="https://news.google.com/rss/articles/CBMimgFBVV95cUxOc2NxMV9iY29WYlc0cUhvMjhhdGdJMUlTOTAzcHFiVkFhNHBtSkhlMkRSVDlBaWVyM1BQaElaek90a3FON05BRVo4X0s1R0VJV3VUeUV3d2Qtai01S1ljZHdtSDMyQ1NjMU1FcEoxWmJJYjBJUnNjZ2JzSTdzeVlPU3RqcjFBY2EwNzB0RGZlSmkwd2ZwSXRORjRB?oc=5" target="_blank" rel="noopener noreferrer" className="hover:text-[#a68b6a] transition-colors">Preview.ph: 12 Vintage Venues</a>
          </div>
        </div>

        {/* Affiliates */}
        <div className="flex flex-col items-center sm:items-start gap-4">
          <div className="text-[13px] font-bold tracking-widest uppercase text-gray-800 font-[family-name:var(--font-plus-jakarta)]">
            Affiliates
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-5 items-center">
            <a href="https://www.expedia.com" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
              <span className="font-extrabold text-[16px] text-[#000080]">Expedia</span>
            </a>
            <a href="https://www.klook.com" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
              <span className="font-extrabold text-[16px] text-[#ff5b00]">KLOOK</span>
            </a>
          </div>
        </div>

        {/* Branding & Copyright */}
        <div className="flex flex-col items-center sm:items-end gap-3 text-[13px] font-[family-name:var(--font-plus-jakarta)] lg:text-right">
          <div className="font-medium text-gray-500">
            © 2026 Themes &amp; Motifs
          </div>
          <div className="text-gray-400">
            The Wedding App powered by Themes & Motifs
          </div>
        </div>

      </div>
    </footer>
  );
}

