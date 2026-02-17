export default function SiteFooter() {
  return (
    <footer className="-mx-5 sm:-mx-8 px-5 sm:px-8 border-t border-black/5 bg-[#fcfbf9]/70">
      <div className="mx-auto max-w-6xl py-6 sm:py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-[13px] font-semibold tracking-wide text-[#c17a4e]">© 2026 THEMES &amp; MOTIFS</div>
        <div className="text-[13px] text-black/55">
          Powered by{" "}
          <a className="font-semibold text-[#a67c52] hover:underline" href="#">
            Themes &amp; Motifs
          </a>
        </div>
      </div>
    </footer>
  );
}
