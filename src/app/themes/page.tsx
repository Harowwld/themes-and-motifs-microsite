import { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "../../lib/supabaseServer";

export const metadata: Metadata = {
  title: "Wedding Themes Gallery | Themes & Motifs The Wedding App",
  description: "Browse gorgeous wedding ideas, color palettes, and styled shoots curated by the best wedding suppliers in the Philippines.",
};

export default async function ThemesPage() {
  const supabase = createSupabaseServerClient();

  // Get all themes
  const { data: rawThemes } = await supabase
    .from("themes")
    .select("id, name, slug")
    .order("name", { ascending: true });

  // Fetch images with vendor info
  const { data: imageRows } = await supabase
    .from("vendor_images")
    .select("theme_id, image_url, vendors(business_name, slug)")
    .not("theme_id", "is", null);

  // Fetch albums with vendor info
  const { data: albumRows } = await supabase
    .from("vendor_albums")
    .select("theme_id, cover_url, vendors(business_name, slug)")
    .not("theme_id", "is", null);

  // Group items by theme to find a representative one (latest or first)
  const imageMap = new Map<number, { image_url: string; vendor: { business_name: string; slug: string } | null }>();
  
  albumRows?.forEach((row: any) => {
    if (row.theme_id && row.cover_url && !imageMap.has(row.theme_id)) {
      imageMap.set(row.theme_id, {
        image_url: row.cover_url,
        vendor: row.vendors ? {
          business_name: row.vendors.business_name,
          slug: row.vendors.slug
        } : null
      });
    }
  });

  imageRows?.forEach((row: any) => {
    if (row.theme_id && row.image_url && !imageMap.has(row.theme_id)) {
      imageMap.set(row.theme_id, {
        image_url: row.image_url,
        vendor: row.vendors ? {
          business_name: row.vendors.business_name,
          slug: row.vendors.slug
        } : null
      });
    }
  });

  const themes = (rawThemes || []).map((t) => {
    const imgInfo = imageMap.get(t.id);
    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      count: (imageRows?.filter((r) => r.theme_id === t.id).length || 0) + (albumRows?.filter((r) => r.theme_id === t.id).length || 0),
      image_url: imgInfo?.image_url || null,
      vendor: imgInfo?.vendor || null,
    };
  });

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <main className="max-w-6xl w-full mx-auto px-5 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-serif text-[#2c2c2c] mb-4">
            Wedding Themes
          </h1>
          <p className="text-[15px] text-black/55 max-w-2xl mx-auto font-[family-name:var(--font-plus-jakarta)]">
            Explore styles and find the perfect theme for your wedding. Browse photos uploaded by our premium community suppliers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {themes.map((theme: any) => {
            const hasImage = !!theme.image_url;
            return (
              <div
                key={theme.id}
                className="group relative h-48 rounded-2xl overflow-hidden bg-white border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.1)] transition-all duration-300 flex flex-col justify-end p-6"
              >
                {/* Background Link to the theme */}
                <Link
                  href={`/themes/${theme.slug}`}
                  className="absolute inset-0 z-0"
                />

                {hasImage ? (
                  <>
                    <img
                      src={theme.image_url}
                      alt={theme.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#faf5ef] to-[#f4ebe1] group-hover:from-[#f4ebe1] group-hover:to-[#faf5ef] transition-all duration-500 pointer-events-none" />
                )}

                {theme.vendor && (
                  <Link
                    href={`/suppliers/${theme.vendor.slug}`}
                    className={`absolute top-4 right-4 z-20 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-all active:scale-95 ${
                      hasImage
                        ? "bg-black/30 hover:bg-[#a67c52] text-white/90 hover:text-white border border-white/10 hover:border-[#a67c52] shadow-sm"
                        : "bg-black/5 hover:bg-[#a67c52] text-black/60 hover:text-white border border-black/5 hover:border-[#a67c52]"
                    }`}
                  >
                    by {theme.vendor.business_name}
                  </Link>
                )}

                <div className="relative z-10 pointer-events-none">
                  <h2
                    className={`text-lg font-bold tracking-tight font-serif ${
                      hasImage ? "text-white" : "text-[#2c2c2c]"
                    }`}
                  >
                    {theme.name}
                  </h2>
                  <p
                    className={`text-xs mt-1 font-medium font-[family-name:var(--font-plus-jakarta)] ${
                      hasImage ? "text-white/70" : "text-black/40"
                    }`}
                  >
                    {theme.count} {theme.count === 1 ? "inspiration item" : "inspiration items"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
