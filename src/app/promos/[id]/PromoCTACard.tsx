"use client";

import { useState } from "react";
import EmailInquiryModal from "./EmailInquiryModal";

interface PromoCTACardProps {
  vendorId: number | null;
  vendorName: string | null;
  vendorEmail: string | null;
  vendorPhone: string | null;
  vendorSlug: string | null;
  promoTitle: string;
}

export default function PromoCTACard({
  vendorId,
  vendorName,
  vendorEmail,
  vendorPhone,
  vendorSlug,
  promoTitle,
}: PromoCTACardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="rounded-md border border-black/10 bg-white p-6 shadow-sm">
        <h3 className="text-[16px] font-semibold text-[#2c2c2c]">Interested in this promo?</h3>
        <p className="mt-2 text-[13px] text-black/55">
          Contact {vendorName || "the vendor"} to claim this exclusive offer.
        </p>

        <div className="mt-4 space-y-3">
          {vendorPhone ? (
            <a
              href={`tel:${vendorPhone}`}
              className="flex h-11 items-center justify-center gap-2 rounded-[3px] bg-[#a67c52] text-white text-[14px] font-semibold hover:bg-[#8e6a46] transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Now
            </a>
          ) : null}

          {vendorEmail ? (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full flex h-11 items-center justify-center gap-2 rounded-[3px] border-2 border-[#a67c52] text-[#a67c52] text-[14px] font-semibold hover:bg-[#a67c52] hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Get more info by email
            </button>
          ) : null}

          {vendorSlug ? (
            <a
              href={`/vendors/${vendorSlug}`}
              className="flex h-11 items-center justify-center gap-2 rounded-[3px] border-2 border-[#a67c52] text-[#a67c52] text-[14px] font-semibold hover:bg-[#a67c52] hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Vendor Profile
            </a>
          ) : null}
        </div>
      </div>

      <EmailInquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vendorId={vendorId}
        vendorName={vendorName || "the vendor"}
        vendorEmail={vendorEmail}
        promoTitle={promoTitle}
      />
    </>
  );
}
