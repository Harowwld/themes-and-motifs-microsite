import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "../../../lib/supabaseServer";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const supabase = createSupabaseServerClient();
  const { data: theme } = await supabase.from("themes").select("name").eq("slug", slug).single();
  
  if (!theme) {
    return { title: "Theme Not Found" };
  }
  
  return { 
    title: `${theme.name} | Themes & Motifs`,
    description: `Discover inspiration from our trusted vendors for the ${theme.name} theme.`
  };
}

export default async function ThemeGalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const supabase = createSupabaseServerClient();

  const { data: theme } = await supabase.from("themes").select("id, name").eq("slug", slug).single();
  if (!theme) return notFound();

  // Get photos for this theme, joining with vendors
  const { data: images } = await supabase
    .from("vendor_images")
    .select("id, image_url, caption, vendors(business_name, slug)")
    .eq("theme_id", theme.id)
    .order("created_at", { ascending: false });

  // Fallback to empty array if no images
  const photos = images || [];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <main className="max-w-6xl w-full mx-auto px-5 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-serif text-[#2c2c2c] mb-4">
            {theme.name}
          </h1>
          <p className="text-[15px] text-black/55 max-w-2xl mx-auto font-[family-name:var(--font-plus-jakarta)]">
            Discover inspiration from our trusted vendors for this theme.
          </p>
        </div>
        
        {photos.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {photos.map((img: any) => (
              <div key={img.id} className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-white border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
                <img 
                  src={img.image_url} 
                  alt={img.caption || theme.name} 
                  className="w-full h-auto object-cover" 
                  loading="lazy" 
                />
                <Link 
                  href={`/suppliers/${img.vendors?.slug}`} 
                  className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6"
                >
                  <span className="text-white text-[16px] font-bold tracking-tight transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {img.vendors?.business_name}
                  </span>
                  {img.caption && (
                    <span className="text-white/80 text-[13px] mt-1.5 line-clamp-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      {img.caption}
                    </span>
                  )}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 rounded-2xl border border-dashed border-black/10 bg-white">
            <div className="text-[15px] font-semibold text-black/40">No photos found for this theme.</div>
            <div className="text-[13px] text-black/30 mt-1">Check back later for inspiration!</div>
          </div>
        )}
      </main>
    </div>
  );
}
