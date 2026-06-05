import { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "../../lib/supabaseServer";

export const metadata: Metadata = {
  title: "Wedding Themes Gallery | Themes & Motifs",
  description: "Browse gorgeous wedding ideas, color palettes, and styled shoots curated by the best wedding suppliers in the Philippines.",
};

export default async function ThemesPage() {
  const supabase = createSupabaseServerClient();

  // Query themes with photo counts and one representative image URL
  const { data: themesData } = await supabase.rpc("get_themes_with_representative_images");

  let themes = themesData || [];

  if (themes.length === 0) {
    // Fallback if the RPC is not defined yet, run raw select
    const { data: rawThemes } = await supabase
      .from("themes")
      .select("id, name, slug")
      .order("name", { ascending: true });

    // For fallback, fetch one image for each theme manually (simplified)
    const { data: imageRows } = await supabase
      .from("vendor_images")
      .select("theme_id, image_url")
      .not("theme_id", "is", null);

    const imageMap = new Map<number, string>();
    imageRows?.forEach((row) => {
      if (row.theme_id && row.image_url) {
        imageMap.set(row.theme_id, row.image_url);
      }
    });

    themes = (rawThemes || []).map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      count: imageRows?.filter((r) => r.theme_id === t.id).length || 0,
      image_url: imageMap.get(t.id) || null,
    }));
  }

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
              <Link
                key={theme.id}
                href={`/themes/${theme.slug}`}
                className="group relative h-48 rounded-2xl overflow-hidden bg-white border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.1)] transition-all duration-300 flex flex-col justify-end p-6"
              >
                {hasImage ? (
                  <>
                    <img
                      src={theme.image_url}
                      alt={theme.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#faf5ef] to-[#f4ebe1] group-hover:from-[#f4ebe1] group-hover:to-[#faf5ef] transition-all duration-500" />
                )}

                <div className="relative z-10">
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
                    {theme.count} {theme.count === 1 ? "inspiration photo" : "inspiration photos"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
