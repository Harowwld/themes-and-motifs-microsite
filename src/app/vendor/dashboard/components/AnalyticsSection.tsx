"use client";

import React, { useMemo } from "react";
import { 
  TrendingUp, 
  MessageSquare, 
  Heart, 
  Eye, 
  Award, 
  Sparkles, 
  CheckCircle,
  Clock,
  MousePointerClick,
  Percent,
  MessageCircle
} from "lucide-react";
import { Inquiry, Review, VendorProfile } from "../types";

type Props = {
  vendor: VendorProfile | null;
  inquiries: Inquiry[];
  reviews: Review[];
  isPremium: boolean;
};

export function AnalyticsSection({ vendor, inquiries, reviews, isPremium }: Props) {
  // 1. Calculate active statistics from database inquiries list
  const totalInquiries = inquiries.length;
  const newInquiries = inquiries.filter(i => i.status === "new" || i.status === "new_inquiry").length;
  const repliedInquiries = inquiries.filter(i => i.status === "replied").length;
  
  // Real inquiry response rate
  const inquiryResponseRate = totalInquiries > 0 
    ? Math.round((repliedInquiries / totalInquiries) * 100) 
    : 100;

  // Real review average rating
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 5.0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  }, [reviews]);

  // Real review reply rate
  const repliedReviews = reviews.filter(r => r.vendor_reply_text && r.vendor_reply_text.trim().length > 0).length;
  const reviewReplyRate = reviews.length > 0 
    ? Math.round((repliedReviews / reviews.length) * 100) 
    : 0;

  // 2. Load metrics from vendors table columns
  const profileViews = vendor?.view_count ?? 0;
  const shortlistSaves = vendor?.save_count ?? 0;
  const portfolioClicks = vendor?.click_count ?? 0;

  // Conversion rate (inquiries / views)
  const conversionRate = profileViews > 0 
    ? ((totalInquiries / profileViews) * 100).toFixed(1) 
    : "0.0";

  // 3. Real weekly inquiry distribution
  const weeklyInquiryData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
    const now = new Date();
    
    inquiries.forEach((inquiry) => {
      if (!inquiry.created_at) return;
      const date = new Date(inquiry.created_at);
      
      // Calculate how many days ago this was
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If it happened in the last 7 days, tally it
      if (diffDays <= 7) {
        const day = date.getDay(); // 0 is Sunday, 1 is Monday...
        const idx = day === 0 ? 6 : day - 1; // Map Sunday to idx 6, Monday to idx 0
        counts[idx]++;
      }
    });
    return counts;
  }, [inquiries]);
  
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxWeeklyVal = Math.max(...weeklyInquiryData, 5); // Ensure scale height is at least 5 for visibility

  return (
    <div className="space-y-8 font-[family-name:var(--font-plus-jakarta)]">
      
      {/* Premium Tier Spotlight Banner */}
      {!isPremium && (
        <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-[#a67c52] to-[#8e6a46] text-white shadow-lg border border-black/5">
          <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 h-32 w-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-extrabold uppercase tracking-widest text-amber-200">
                <Sparkles size={11} /> Standard Listing Tier
              </span>
              <h3 className="text-[17px] font-serif font-bold mt-1">Unlock Premium Business Analytics</h3>
              <p className="text-[12.5px] text-white/80 leading-relaxed max-w-xl">
                Standard listings display limited metrics. Upgrade to premium for priority placement in search results, detailed view breakdown analytics, and advanced conversion metrics.
              </p>
            </div>
            <button className="h-10 px-5 rounded-xl bg-white text-[#a67c52] text-[12px] font-black uppercase tracking-wider hover:bg-neutral-50 transition-all duration-300 shadow-md shrink-0 cursor-pointer">
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Profile Views */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Profile Views</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
              <Eye size={16} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-[#2c2c2c]">{profileViews}</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-medium">Real-time database count</div>
        </div>

        {/* Card 2: Shortlist Saves */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Shortlist Saves</span>
            <div className="h-8 w-8 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center">
              <Heart size={16} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-[#2c2c2c]">{shortlistSaves}</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-medium">Couples who saved you</div>
        </div>

        {/* Card 3: Total Inquiries */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Client Inquiries</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-[#a67c52] flex items-center justify-center">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-[#2c2c2c]">{totalInquiries}</span>
            {newInquiries > 0 && (
              <span className="text-[10px] font-extrabold bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                {newInquiries} New
              </span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-medium">Conversion: {conversionRate}%</div>
        </div>

        {/* Card 4: Portfolio Clicks */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Portfolio Clicks</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MousePointerClick size={16} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-[#2c2c2c]">{portfolioClicks}</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-medium">Link & contact clicks</div>
        </div>

      </div>

      {/* Main Charts & Inquiries Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Weekly Inquiries Chart (2/3 width) */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[14px] font-bold text-[#2c2c2c]">Weekly Inquiries Trend</h4>
              <p className="text-[11px] text-neutral-400">Client inquiry volume over the last 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-semibold bg-neutral-50 border border-neutral-100 rounded-lg px-2.5 py-1">
              <span className="h-2.5 w-2.5 bg-[#a67c52] rounded-full" />
              <span>Inquiries</span>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="relative pt-4">
            <div className="h-44 w-full flex items-end justify-between px-2 sm:px-6 border-b border-b-black/[0.04]">
              {weeklyInquiryData.map((val, idx) => {
                const heightPercentage = (val / maxWeeklyVal) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative max-w-[40px] sm:max-w-[48px]">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-[#2c2c2c] text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-20 whitespace-nowrap">
                      {val} inquiry{val !== 1 ? 'ies' : ''}
                    </div>
                    {/* Visual Bar */}
                    <div 
                      className="w-full bg-[#a67c52]/15 group-hover:bg-[#a67c52]/35 rounded-t transition-all duration-300 ease-out" 
                      style={{ height: `${heightPercentage}%` }}
                    />
                    <div className="w-full h-1 bg-[#a67c52] rounded-t-sm" />
                  </div>
                );
              })}
            </div>
            {/* X-axis labels */}
            <div className="flex items-center justify-between px-2 sm:px-6 pt-2 text-[11px] text-neutral-400 font-bold">
              {daysOfWeek.map((day, idx) => (
                <span key={idx} className="w-full text-center max-w-[40px] sm:max-w-[48px]">{day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Database Optimization Insights Panel (1/3 width) */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-5">
          <div>
            <h4 className="text-[14px] font-bold text-[#2c2c2c]">Storefront Performance Insights</h4>
            <p className="text-[11px] text-neutral-400">Action items driven by real database stats</p>
          </div>

          <div className="space-y-4">
            
            {/* Item 1: Inquiry Response rate */}
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-amber-50 text-[#a67c52] flex items-center justify-center shrink-0 mt-0.5">
                <Clock size={12} />
              </div>
              <div className="space-y-0.5">
                <div className="text-[12.5px] font-bold text-neutral-700 flex items-center gap-1.5">
                  <span>Lead Response Rate</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-[#a67c52] rounded font-bold">{inquiryResponseRate}%</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {inquiryResponseRate < 80 
                    ? `You've replied to ${repliedInquiries} out of ${totalInquiries} inquiries. Answering remaining leads improves client conversion.`
                    : "Excellent! You maintain a high inquiry response rate."}
                </p>
              </div>
            </div>

            {/* Item 2: Review reply rate */}
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle size={12} />
              </div>
              <div className="space-y-0.5">
                <div className="text-[12.5px] font-bold text-neutral-700 flex items-center gap-1.5">
                  <span>Review Response Rate</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded font-bold">{reviewReplyRate}%</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Replied to {repliedReviews} of {reviews.length} reviews. Acknowledge couples to display client-first communication.
                </p>
              </div>
            </div>

            {/* Item 3: Ratings and conversion */}
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                <Award size={12} />
              </div>
              <div className="space-y-0.5">
                <div className="text-[12.5px] font-bold text-neutral-700 flex items-center gap-1.5">
                  <span>Average Rating</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded font-bold">{averageRating} ★</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Your current rating from {reviews.length} review{reviews.length !== 1 ? 's' : ''} is {averageRating} stars.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
