import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "../../../lib/supabaseServer";
import { proxiedImageUrl } from "../../../lib/imageSizes";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const supabase = createSupabaseServerClient();
  const { data: theme } = await supabase.from("themes").select("name").eq("slug", slug).single();
  
  if (!theme) {
    return { title: "Theme Not Found" };
  }
  
  return { 
    title: `${theme.name} | Themes & Motifs The Wedding App`,
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
  const { data: imageRows } = await supabase
    .from("vendor_images")
    .select("id, image_url, caption, created_at, vendors(business_name, slug, logo_url)")
    .eq("theme_id", theme.id);

  // Get albums for this theme, joining with vendors
  const { data: albumRows } = await supabase
    .from("vendor_albums")
    .select("id, title, created_at, vendors(business_name, slug, logo_url), vendor_album_photos(image_url)")
    .eq("theme_id", theme.id);

  const images = (imageRows || []).map((img: any) => ({
    id: img.id,
    type: "photo",
    url: img.image_url,
    caption: img.caption,
    created_at: img.created_at,
    vendor: img.vendors
  }));

  const albums = (albumRows || []).map((alb: any) => ({
    id: alb.id,
    type: "album",
    url: alb.vendor_album_photos?.[0]?.image_url || "",
    caption: alb.title,
    created_at: alb.created_at,
    vendor: alb.vendors
  })).filter(alb => alb.url); // Only include albums that have at least one photo

  const photos = [...images, ...albums].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

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
            {photos.map((item: any) => (
              <div key={`${item.type}-${item.id}`} className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-white border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
                <Link 
                  href={`/suppliers/${item.vendor?.slug}?${item.type === "album" ? "albumId" : "photoId"}=${item.id}#photos`} 
                  className="block relative w-full"
                >
                  <img 
                    src={item.url} 
                    alt={item.caption || theme.name} 
                    className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                    loading="lazy" 
                  />
                  {item.type === "album" && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-black/70 shadow-sm flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                      Album
                    </div>
                  )}
                </Link>
                <div className="absolute inset-x-2 bottom-2 z-10 pointer-events-none">
                  <Link 
                    href={`/suppliers/${item.vendor?.slug}`} 
                    className="block group/link pointer-events-auto"
                  >
                    <div className="bg-white/80 backdrop-blur-md border border-white/40 shadow-lg rounded-[14px] p-3 flex items-center gap-3 transition-all duration-300 hover:bg-white/90">
                      {item.vendor?.logo_url ? (
                        <div className="relative rounded-lg border border-gray-100 bg-white overflow-hidden flex-shrink-0 shadow-sm h-10 w-10 sm:h-12 sm:w-12">
                          <img
                            src={proxiedImageUrl(item.vendor.logo_url) ?? item.vendor.logo_url}
                            alt=""
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : null}
                      <div className="flex-1 min-w-0">
                        <span className="block text-[#1a1a1a] group-hover/link:text-[#a68b6a] transition-colors duration-300 text-[13px] sm:text-[14px] font-bold tracking-tight truncate font-[family-name:var(--font-plus-jakarta)]">
                          {item.vendor?.business_name}
                        </span>
                        {item.caption && (
                          <span className="block text-black/70 text-[11px] sm:text-[12px] mt-0.5 line-clamp-2 font-[family-name:var(--font-plus-jakarta)]">
                            {item.caption}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 rounded-2xl border border-dashed border-black/10 bg-white">
            <div className="text-[15px] font-semibold text-black/40">No items found for this theme.</div>
            <div className="text-[13px] text-black/30 mt-1">Check back later for inspiration!</div>
          </div>
        )}
      </main>
    </div>
  );
}
