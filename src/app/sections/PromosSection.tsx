import InfinitePromoCarousel from "../components/InfinitePromoCarousel";

type FeaturedPromo = {
  id: number;
  title: string;
  summary: string | null;
  valid_from: string | null;
  valid_to: string | null;
  image_url?: string | null;
  discount_percentage?: number | null;
  image_focus_x?: number | null;
  image_focus_y?: number | null;
  image_zoom?: number | null;
  vendors: {
    business_name: string;
    slug: string;
  }[];
};

function clampPct(v: number) {
  if (!Number.isFinite(v)) return 50;
  return Math.max(0, Math.min(100, v));
}

function clampZoom(v: number) {
  if (!Number.isFinite(v)) return 1;
  return Math.max(1, Math.min(3, v));
}

function proxiedImageUrl(url: string) {
  const u = (url ?? "").trim();
  if (!u) return u;
  if (u.includes("drive.google.com")) {
    return `/api/image-proxy?url=${encodeURIComponent(u)}`;
  }
  return u;
}

export default function PromosSection({ promos }: { promos: FeaturedPromo[] }) {
  return (
    <section id="promos" className="mt-16 sm:mt-20">
      <div className="text-center">
        <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
          Discover exciting promos
        </h2>
        <p className="mt-2 text-[13px] text-black/55 max-w-xl mx-auto">
          Time-bound deals from suppliers-great for shortlisting with confidence.
        </p>
      </div>

      <div className="mt-8 max-w-5xl mx-auto">
        <InfinitePromoCarousel promos={promos} />
      </div>

      <div className="mt-6 text-center">
        <a
          href="/promos"
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#a68b6a] hover:text-[#957a5c] transition-colors"
        >
          View All Promos
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden className="w-5 h-4">
            <path d="M2 8h16M12 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </section>
  );
}
