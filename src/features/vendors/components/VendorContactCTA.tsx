"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "@/lib/toast";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

interface VendorContactCTAProps {
  vendorId: number;
  vendorName: string;
  vendorPhone: string | null;
  vendorEmail: string | null;
}

export default function VendorContactCTA({
  vendorId,
  vendorName,
  vendorPhone,
  vendorEmail,
}: VendorContactCTAProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("add basic wedding info like wedding date and venue/location");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      const supabase = createSupabaseBrowserClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setName((n) => n || session.user.user_metadata?.full_name || session.user.user_metadata?.name || "");
          setEmail((e) => e || session.user.email || "");
        }
      });
    }
  }, [isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorEmail) {
      toast.error("Vendor contact email is not available.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers,
        body: JSON.stringify({
          vendorId,
          fromName: name,
          fromEmail: email,
          message,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send inquiry");
      }

      setIsSuccess(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setTimeout(() => {
        setIsSuccess(false);
        setMessage("add basic wedding info like wedding date and venue/location");
        setName("");
        setEmail("");
      }, 300);
    }
  };

  const modalContent = isModalOpen ? (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md rounded-2xl border border-black/5 bg-white shadow-2xl overflow-hidden pointer-events-auto">
          {/* Header */}
          <div className="px-5 py-4 border-b border-black/10">
            <div className="text-[16px] font-semibold text-[#2c2c2c]">
              Get More Info by Email
            </div>
            <div className="mt-1 text-[13px] text-black/55">
              Send an inquiry to {vendorName}.
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
                    className="w-full h-10 rounded-xl border border-black/15 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none hover:border-black/25 focus:border-[#a67c52] focus:ring-2 focus:ring-[#a67c52]/15 transition-[border-color,box-shadow] duration-200 ease-out"
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
                    className="w-full h-10 rounded-xl border border-black/15 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none hover:border-black/25 focus:border-[#a67c52] focus:ring-2 focus:ring-[#a67c52]/15 transition-[border-color,box-shadow] duration-200 ease-out"
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
                    className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none hover:border-black/25 focus:border-[#a67c52] focus:ring-2 focus:ring-[#a67c52]/15 transition-[border-color,box-shadow] duration-200 ease-out resize-none"
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
              className="h-9 px-4 rounded-xl border border-black/15 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/[0.02] hover:-translate-y-[1px] active:scale-[0.97] hover:shadow-sm disabled:opacity-60 disabled:pointer-events-none transition-[transform,background-color,box-shadow] duration-200 ease-out"
            >
              {isSuccess ? "Close" : "Cancel"}
            </button>
            {!isSuccess && (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || !vendorEmail}
                className="h-9 px-4 rounded-xl bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] hover:-translate-y-[1px] active:scale-[0.97] hover:shadow-sm disabled:opacity-60 disabled:pointer-events-none transition-[transform,background-color,box-shadow] duration-200 ease-out"
              >
                {isSubmitting ? "Sending..." : "Send Inquiry"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="space-y-3">
        {vendorPhone ? (
          <a
            href={`tel:${vendorPhone.replace(/\s/g, "")}`}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#a67c52] text-white text-[14px] font-semibold hover:bg-[#8e6a46] hover:-translate-y-[1px] active:scale-[0.97] hover:shadow-sm transition-[transform,background-color,box-shadow] duration-200 ease-out"
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
            className="w-full flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-[#a67c52] text-[#a67c52] text-[14px] font-semibold hover:bg-[#a67c52] hover:text-white hover:-translate-y-[1px] active:scale-[0.97] hover:shadow-sm transition-[transform,background-color,color,border-color,box-shadow] duration-200 ease-out"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Get more info by email
          </button>
        ) : null}
      </div>

      {modalContent && typeof document !== "undefined" ? createPortal(modalContent, document.body) : null}
    </>
  );
}
