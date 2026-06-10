import HeroSection from "./sections/HeroSection";
import { CategoryBrowserSkeleton } from "./components/CategoryBrowser";
import PromosSection from "./sections/PromosSection";
import FeaturedThemesSection from "./sections/FeaturedThemesSection";
import FeaturedVendorsSection from "../features/vendors/sections/FeaturedVendorsSection";
import VendorsSection from "../features/vendors/sections/VendorsSection";

export default function Loading() {
  return (
    <div style={{ background: "#fafafa" }}>
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <main className="pt-6 pb-12 sm:py-14 animate-pulse pointer-events-none">
          <HeroSection categories={[]} regions={[]} />
          <CategoryBrowserSkeleton />

          <div className="my-6 sm:my-12 h-px bg-gradient-to-r from-transparent via-black/15 to-transparent" />

          <PromosSection promos={[]} isLoading />
          <div className="my-6 sm:my-12 h-px bg-gradient-to-r from-transparent via-black/15 to-transparent" />
          <FeaturedThemesSection ideas={[]} isLoading />
          <div className="my-6 sm:my-12 h-px bg-gradient-to-r from-transparent via-black/15 to-transparent" />
          <FeaturedVendorsSection vendors={[]} isLoading />

          <div className="my-6 sm:my-12 h-px bg-gradient-to-r from-transparent via-black/15 to-transparent" />

          <VendorsSection 
            vendors={[]} 
            total={0} 
            page={1} 
            pageSize={9} 
            sort="photos" 
            isLoading 
          />
        </main>
      </div>
    </div>
  );
}
