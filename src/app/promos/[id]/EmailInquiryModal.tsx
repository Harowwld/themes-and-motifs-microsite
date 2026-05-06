"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface EmailInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: number | null;
  vendorName: string;
  vendorEmail: string | null;
  promoTitle: string;
}

export default function EmailInquiryModal({
  isOpen,
  onClose,
  vendorId,
  vendorName,
  vendorEmail,
  promoTitle,
}: EmailInquiryModalProps) {
  const [message, setMessage] = useState("Please email more info about this promo.");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorEmail) {
      setError("Vendor contact email is not available.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (!vendorId) {
        setError("Vendor information is not available.");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/promos/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          vendorEmail,
          vendorName,
          promoTitle,
          name,
          email,
          message,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send inquiry");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form after closing
      setTimeout(() => {
        setIsSuccess(false);
        setError(null);
        setMessage("Please email more info about this promo.");
        setName("");
        setEmail("");
      }, 300);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md rounded-[6px] border border-black/20 bg-white shadow-xl overflow-hidden pointer-events-auto">
          {/* Header */}
          <div className="px-5 py-4 border-b border-black/10">
            <div className="text-[16px] font-semibold text-[#2c2c2c]">
              Get More Info by Email
            </div>
            <div className="mt-1 text-[13px] text-black/55">
              Send an inquiry to {vendorName} about this promo.
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-4">
            {isSuccess ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#027a48]/10 mb-3">
                  <svg className="w-6 h-6 text-[#027a48]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-[15px] font-semibold text-[#2c2c2c]">Inquiry Sent!</div>
                <div className="mt-1 text-[13px] text-black/55">
                  We&apos;ve forwarded your message to {vendorName}.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-[3px] border border-[#b42318]/20 bg-[#fff1f3] px-3 py-2 text-[13px] text-[#b42318]">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-[12px] font-medium text-black/70 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your name"
                    className="w-full h-10 rounded-[3px] border border-black/15 bg-white px-3 text-[14px] placeholder:text-black/40 focus:outline-none focus:border-[#a67c52]/50"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-black/70 mb-1.5">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="w-full h-10 rounded-[3px] border border-black/15 bg-white px-3 text-[14px] placeholder:text-black/40 focus:outline-none focus:border-[#a67c52]/50"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-black/70 mb-1.5">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    className="w-full rounded-[3px] border border-black/15 bg-white px-3 py-2 text-[14px] placeholder:text-black/40 focus:outline-none focus:border-[#a67c52]/50 resize-none"
                  />
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2 bg-[#fafafa]">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-9 px-4 rounded-[6px] border border-black/15 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/[0.02] disabled:opacity-60 transition-colors"
            >
              {isSuccess ? "Close" : "Cancel"}
            </button>
            {!isSuccess && (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || !vendorEmail}
                className="h-9 px-4 rounded-[6px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? "Sending..." : "Send Inquiry"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render outside component tree to avoid stacking context issues
  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
}
