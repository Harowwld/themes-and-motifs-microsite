"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Gift, Compass, X, ChevronRight, Calendar, MapPin, Award } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

interface AdBannerProps {
  pageContext: "dashboard" | "microsite";
  onClose?: () => void;
}

interface BannerItem {
  isEvent: boolean;
  badge: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
  icon?: any;
  imageUrl?: string | null;
  venue?: string;
  dateText?: string;
  color: string;
  borderColor: string;
  accentColor: string;
}

export default function AdBanner({ pageContext, onClose }: AdBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isGloballyEnabled, setIsGloballyEnabled] = useState(true);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);

  const nativeAds: BannerItem[] = [
    {
      isEvent: false,
      badge: "Partner Showcase",
      title: "Discover DOT-Accredited Suppliers",
      desc: "Find certified, trusted photographers, coordinators, and venues on Themes & Motifs to guarantee a seamless and worry-free wedding celebration.",
      cta: "Explore Marketplace",
      href: "/vendors",
      icon: Compass,
      color: "from-amber-500/10 via-[#a68b6a]/5 to-transparent",
      borderColor: "border-[#a68b6a]/30",
      accentColor: "#a68b6a",
    },
    {
      isEvent: false,
      badge: "Couple Feature",
      title: "Build Your Cash & Gift Registry",
      desc: "Allow your wedding guests to contribute easily to your honeymoon fund or buy curated marketplace gifts directly through your custom wedding page.",
      cta: "Setup Registry",
      href: "/dashboard",
      icon: Gift,
      color: "from-rose-500/10 via-[#a68b6a]/5 to-transparent",
      borderColor: "border-rose-300/30",
      accentColor: "#f43f5e",
    },
    {
      isEvent: false,
      badge: "Premium Upgrade",
      title: "Go Premium, Unlock Full Suite",
      desc: "Unlock advanced table seating charts, real-time RSVP managers, granular budget planners, and unlimited high-fidelity story sharing tools.",
      cta: "Contact Admin",
      href: "/dashboard",
      icon: Sparkles,
      color: "from-purple-500/10 via-[#a68b6a]/5 to-transparent",
      borderColor: "border-purple-300/30",
      accentColor: "#a855f7",
    },
  ];

  // 1. Check global visibility settings & load events
  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createSupabaseBrowserClient();

        // Query system settings
        const { data: settings } = await supabase
          .from("system_settings")
          .select("value")
          .eq("key", "global_ads_enabled")
          .maybeSingle();

        if (settings) {
          const val = settings.value;
          if (typeof val === "boolean") {
            setIsGloballyEnabled(val);
          } else if (val && typeof val === "object" && typeof val.enabled === "boolean") {
            setIsGloballyEnabled(val.enabled);
          } else {
            setIsGloballyEnabled(true);
          }
        }

        // Query active bridal fair events
        const { data: events, error } = await supabase
          .from("bridal_fairs")
          .select("*")
          .eq("is_active", true)
          .order("is_featured", { ascending: false })
          .order("start_date", { ascending: true });

        if (!error && events && events.length > 0) {
          // Map events to banner items
          const mappedEvents: BannerItem[] = events.map((ev) => {
            const startDate = new Date(ev.start_date);
            const endDate = ev.end_date ? new Date(ev.end_date) : null;
            
            const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
            let dateText = startDate.toLocaleDateString("en-US", options);
            if (endDate && ev.end_date !== ev.start_date) {
              dateText += ` - ${endDate.toLocaleDateString("en-US", options)}`;
            }

            return {
              isEvent: true,
              badge: ev.is_featured ? "Featured Event" : "Wedding Event",
              title: ev.title,
              desc: ev.description ?? "Join us at this spectacular wedding exhibition event. Book premium suppliers, explore couture showcases, and avail of massive exclusive discounts.",
              cta: "Register Free",
              href: ev.registration_url || "/vendors",
              imageUrl: ev.image_url,
              venue: ev.venue,
              dateText,
              color: ev.is_featured 
                ? "from-amber-600/10 via-[#a67c52]/5 to-transparent"
                : "from-[#a67c52]/10 via-[#a68b6a]/5 to-transparent",
              borderColor: ev.is_featured ? "border-amber-400/40" : "border-[#a68b6a]/20",
              accentColor: ev.is_featured ? "#d97706" : "#a67c52",
            };
          });

          setBanners(mappedEvents);
        } else {
          // Graceful fallback to native product ads
          setBanners(nativeAds);
        }
      } catch (e) {
        console.error("Error initializing banner data:", e);
        setBanners(nativeAds);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // 2. Auto rotate slides every 7 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible || !isGloballyEnabled || loading || banners.length === 0) return null;

  const activeBanner = banners[currentSlide];
  const IconComponent = activeBanner.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentSlide}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className={`relative rounded-2xl overflow-hidden border ${activeBanner.borderColor} bg-white shadow-[0_12px_40px_rgba(166,139,106,0.06)] mb-8 transition-all duration-500`}
      >
        {/* Main Content Split Grid Layout */}
        <div className="flex flex-col md:flex-row min-h-[190px]">
          
          {/* COVER PHOTO PANEL (Left Side on Desktop, Top on Mobile) */}
          {activeBanner.imageUrl ? (
            <div className="md:w-[32%] w-full min-h-[140px] md:min-h-auto relative overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-black/5 bg-[#fcfbf9]">
              <img
                src={activeBanner.imageUrl}
                alt={activeBanner.title}
                className="h-full w-full object-cover absolute inset-0 group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/25 via-transparent to-transparent pointer-events-none" />
              
              {/* Featured Badge on Cover Photo */}
              {activeBanner.badge && (
                <span 
                  className="absolute top-4 left-4 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)]"
                  style={{
                    backgroundColor: `${activeBanner.accentColor}dd`,
                    color: "#ffffff",
                  }}
                >
                  {activeBanner.badge}
                </span>
              )}
            </div>
          ) : (
            /* Icon Box Fallback for standard native ads */
            <div className="p-6 md:p-8 flex items-center justify-center shrink-0 bg-[#faf8f5] md:border-r border-black/5">
              <div
                className="p-4 rounded-2xl bg-white border border-black/5 shadow-sm shrink-0 flex items-center justify-center"
                style={{ color: activeBanner.accentColor }}
              >
                {IconComponent ? (
                  <IconComponent size={28} className="animate-pulse" />
                ) : (
                  <Sparkles size={28} className="animate-pulse" />
                )}
              </div>
            </div>
          )}

          {/* DETAILS CONTENT PANEL (Right Side) */}
          <div className={`flex-1 p-6 md:p-8 flex flex-col justify-between bg-gradient-to-r ${activeBanner.color} relative`}>
            
            {/* Subtle decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#a68b6a]/[0.01] rounded-full blur-xl pointer-events-none" />

            {/* Top Close Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/[0.05] text-neutral-400 hover:text-neutral-600 transition-colors z-20 cursor-pointer"
              title="Dismiss ad banner"
            >
              <X size={15} />
            </button>

            <div className="space-y-3">
              {/* Badge for native ads without cover photo */}
              {!activeBanner.imageUrl && activeBanner.badge && (
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)]"
                    style={{
                      backgroundColor: `${activeBanner.accentColor}12`,
                      color: activeBanner.accentColor,
                    }}
                  >
                    {activeBanner.badge}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-bold font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider">
                    Sponsored Offer
                  </span>
                </div>
              )}

              {/* Dynamic Event Extra Metadata Details */}
              {activeBanner.isEvent && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-widest font-[family-name:var(--font-plus-jakarta)]">
                  <span className="text-neutral-500 font-black">Featured Showcase</span>
                  <span className="text-neutral-300">·</span>
                  <span className="flex items-center gap-1 text-[#a67c52]">
                    <Award size={12} />
                    Themes & Motifs Event
                  </span>
                </div>
              )}

              <h4 className="text-[17px] md:text-[18px] font-bold text-neutral-800 font-[family-name:var(--font-noto-serif)] leading-snug">
                {activeBanner.title}
              </h4>

              <p className="text-[13px] text-neutral-500 leading-relaxed max-w-2xl font-[family-name:var(--font-plus-jakarta)]">
                {activeBanner.desc}
              </p>

              {/* Event Schedule & Location badges */}
              {activeBanner.isEvent && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-[12px] font-semibold text-neutral-600 font-[family-name:var(--font-plus-jakarta)]">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#a67c52]" />
                    <span>{activeBanner.dateText}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#a67c52]" />
                    <span>{activeBanner.venue}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Carousel & Button Footer Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-black/5">
              
              {/* Carousel Indicator slide buttons */}
              <div className="flex gap-2">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentSlide ? "w-6 bg-neutral-800" : "w-1.5 bg-neutral-200 hover:bg-neutral-300"
                    }`}
                    title={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Action Button */}
              <a
                href={activeBanner.href}
                className="w-full sm:w-auto h-10 px-6 inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all duration-200 uppercase tracking-widest font-[family-name:var(--font-plus-jakarta)] shadow-sm hover:shadow active:scale-[0.98]"
              >
                <span>{activeBanner.cta}</span>
                <ChevronRight size={14} strokeWidth={2.5} />
              </a>

            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
