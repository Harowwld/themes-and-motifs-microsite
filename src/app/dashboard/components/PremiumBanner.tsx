"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

export default function PremiumBanner() {
  const features = [
    { title: "Budget Planner", desc: "Track estimates, actual spends & payment schedules." },
    { title: "Guest List & RSVPs", desc: "Manage categories, dietary needs, and RSVPs in real time." },
    { title: "Table Assignment", desc: "Assign guests to tables with a visual layout planner." },
    { title: "Dream Team Directory", desc: "Rate suppliers, track contact status, and manage prospective bookings." },
    { title: "Rants & Reviews Diary", desc: "A private safe-space to draft reviews and document planning moments." },
    { title: "Checklists & Notes", desc: "Elegant templates, interactive trackers, and clean drafts." },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="relative rounded-2xl overflow-hidden border border-[#a68b6a]/20 bg-white p-8 sm:p-12 shadow-[0_12px_40px_rgba(166,139,106,0.06)] mb-12"
    >
      {/* Decorative Brand Accent (Top & Bottom) */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#a68b6a] to-transparent opacity-60" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#a68b6a]/[0.02] rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#a68b6a]/[0.02] rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#a68b6a]/5 border border-[#a68b6a]/25 text-[#a68b6a] text-[11px] font-bold tracking-wider uppercase mb-6 font-[family-name:var(--font-plus-jakarta)]">
            <Sparkles size={12} className="text-[#a68b6a] animate-pulse" />
            <span>Premium Soon-to-Wed Feature</span>
          </div>
          
          <h2 className="text-[28px] sm:text-[34px] font-serif font-bold leading-tight text-[#2c2c2c] mb-4">
            Unlock Your All-in-One Wedding Planning Workspace
          </h2>
          
          <p className="text-[14px] sm:text-[14.5px] text-neutral-500 leading-relaxed font-[family-name:var(--font-plus-jakarta)] mb-8">
            Upgrade your Soon-to-Wed account to access advanced wedding administration tools. Plan your seating charts, manage budgets, track RSVP states, and coordinate your Dream Team from a single, polished workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button
              disabled
              className="w-full sm:w-auto h-12 px-8 bg-neutral-100 border border-black/5 text-neutral-400 text-[13px] font-black rounded-xl cursor-not-allowed font-[family-name:var(--font-plus-jakarta)] uppercase tracking-widest"
            >
              Contact Admin to Upgrade
            </button>
            <span className="text-[12px] text-neutral-400 font-bold font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider">
              Changeable via Admin Only
            </span>
          </div>
        </div>

        <div className="w-full lg:w-[400px] shrink-0 bg-[#faf9f6] border border-[#a68b6a]/15 rounded-xl p-6 shadow-inner">
          <h3 className="text-[12px] font-black text-[#a68b6a] tracking-widest uppercase mb-4 font-[family-name:var(--font-plus-jakarta)] border-b border-black/[0.05] pb-3">
            What is Included
          </h3>
          <div className="space-y-4">
            {features.map((feat, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-white border border-[#a68b6a]/20 shrink-0 text-[#a68b6a] mt-0.5 shadow-sm">
                  <Check size={11} strokeWidth={3} />
                </span>
                <div>
                  <h4 className="text-[13px] font-bold text-neutral-700 font-[family-name:var(--font-plus-jakarta)]">
                    {feat.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)] mt-0.5 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
