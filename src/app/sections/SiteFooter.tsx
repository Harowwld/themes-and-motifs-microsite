export default function SiteFooter() {
  return (
    <footer className="inset-x-0 border-t border-gray-100 bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-2 sm:gap-3">
        <div className="text-[12px] sm:text-[13px] font-medium tracking-wide text-gray-500 text-center sm:text-left font-[family-name:var(--font-plus-jakarta)]">
          © 2026 Themes &amp; Motifs
        </div>
        <div className="text-[12px] sm:text-[13px] text-gray-400 text-center sm:text-right font-[family-name:var(--font-plus-jakarta)]">
          A curated wedding vendor directory
        </div>
      </div>
    </footer>
  );
}
