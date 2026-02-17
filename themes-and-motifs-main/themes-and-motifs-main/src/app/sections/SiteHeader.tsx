export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 -mx-5 sm:-mx-8 px-5 sm:px-8 backdrop-blur supports-[backdrop-filter]:bg-[#fcfbf9]/75 bg-[#fcfbf9]/95 border-b border-black/5">
      <div className="mx-auto max-w-6xl h-16 flex items-center justify-between">
        <a className="flex items-center" href="#" aria-label="Themes & Motifs">
          <img
            src="https://themesnmotifs.com/wp-content/uploads/elementor/thumbs/T_M-Logo-1-qzxx62xvcaywvxz23bwwe4nm1tu4exw9i42ghzw8g6.png"
            alt="Themes & Motifs"
            className="h-8 w-auto"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </a>

        <nav className="hidden sm:flex items-center gap-6 text-[13px] font-medium text-black/60">
          <a className="hover:text-black/80 transition-colors" href="#discover">
            Discover
          </a>
          <a className="hover:text-black/80 transition-colors" href="#featured">
            Featured
          </a>
          <a className="hover:text-black/80 transition-colors" href="#for-vendors">
            For vendors
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <a
            className="hidden sm:inline-flex h-9 items-center justify-center px-3 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/[0.02] transition-colors"
            href="#"
          >
            Sign in
          </a>
          <a
            className="h-9 inline-flex items-center justify-center px-3.5 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors shadow-sm"
            href="#discover"
          >
            Start searching
          </a>
        </div>
      </div>
    </header>
  );
}
