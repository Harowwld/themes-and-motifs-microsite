/* eslint-disable react-doctor/iframe-missing-sandbox */
import React from "react";
import { VendorProfile } from "../types";

export function PreviewModal({
  isOpen,
  onClose,
  vendor
}: {
  isOpen: boolean;
  onClose: () => void;
  vendor: VendorProfile | null;
}) {
  if (!isOpen || !vendor) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full h-full max-w-6xl md:h-[90vh] md:w-[95%] bg-white md:rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden transform transition-all duration-500">
        <div className="sticky top-0 px-8 py-6 border-b border-black/[0.04] shrink-0 flex items-center justify-between bg-white/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-[#a67c52] flex items-center justify-center text-white shadow-lg shadow-[#a67c52]/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div>
              <div className="text-[14px] font-bold text-[#2c2c2c]">Live Profile Preview</div>
              <div className="text-[11px] font-bold text-black/30 uppercase tracking-widest">How couples see your business</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-white border border-black/[0.08] text-black/40 hover:text-red-500 hover:border-red-100 transition-all duration-300 flex items-center justify-center shadow-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden relative">
          <iframe
            src={`/suppliers/${vendor.slug}`}
            className="w-full h-full border-none"
            title="Vendor Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-2xl bg-black/90 text-white backdrop-blur-md shadow-2xl border border-white/10">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[12px] font-bold tracking-wide">Interactive Preview Mode</span>
            <div className="h-4 w-px bg-white/20 mx-1" />
            <span className="text-[11px] text-white/60">Links and buttons are active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
