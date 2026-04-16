"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  vendorId: number;
  vendorName: string;
};

export default function ClaimVendorButton({ vendorId, vendorName }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [dtiUrl, setDtiUrl] = useState("");
  const [secUrl, setSecUrl] = useState("");
  const [businessPermitUrl, setBusinessPermitUrl] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [urlModalType, setUrlModalType] = useState<"dti" | "sec" | "permit">("dti");
  const [urlInput, setUrlInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function openUrlModal(type: "dti" | "sec" | "permit") {
    setUrlModalType(type);
    setUrlInput("");
    setUrlModalOpen(true);
  }

  function saveUrlModal() {
    const url = urlInput.trim();
    if (!url) {
      setUrlModalOpen(false);
      return;
    }
    if (urlModalType === "dti") setDtiUrl(url);
    else if (urlModalType === "sec") setSecUrl(url);
    else setBusinessPermitUrl(url);
    setUrlModalOpen(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/vendor-claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: String(vendorId),
          contactEmail,
          contactPhone,
          documents: {
            dtiUrl: dtiUrl.trim() || null,
            secUrl: secUrl.trim() || null,
            businessPermitUrl: businessPermitUrl.trim() || null,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit claim");
        return;
      }

      setSuccess(true);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-[3px] border border-green-200 bg-green-50 p-4 text-center">
        <p className="text-sm text-green-700 font-medium">Claim request submitted!</p>
        <p className="text-xs text-green-600 mt-1">We'll review your request and get back to you soon.</p>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full inline-flex h-10 items-center justify-center rounded-[3px] bg-[#a67c52] text-white hover:bg-[#8e6a46] transition-colors text-sm font-medium"
      >
        Claim this vendor
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-[3px] bg-white p-6 shadow-xl mx-4">
            <h3 className="text-lg font-semibold text-[#2c2c2c]">Claim {vendorName}</h3>
            <p className="mt-2 text-sm text-black/60">
              Submit a claim request to manage this vendor listing. Our team will review your request.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-[#2c2c2c]">
                  Business Email *
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="mt-1 block w-full rounded-[3px] border border-black/20 px-3 py-2 text-sm focus:border-[#a67c52] focus:outline-none focus:ring-1 focus:ring-[#a67c52]"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-[#2c2c2c]">
                  Contact Phone
                </label>
                <input
                  id="contactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="mt-1 block w-full rounded-[3px] border border-black/20 px-3 py-2 text-sm focus:border-[#a67c52] focus:outline-none focus:ring-1 focus:ring-[#a67c52]"
                  placeholder="+63 912 345 6789"
                />
              </div>

              <div className="border-t border-black/10 pt-4">
                <p className="text-sm font-medium text-[#2c2c2c] mb-3">Verification Documents</p>
                <div className="grid grid-cols-3 gap-3">
                  {/* DTI */}
                  <div>
                    <p className="text-xs font-medium text-black/60 mb-1">DTI</p>
                    {dtiUrl ? (
                      <div className="relative aspect-square rounded-[3px] border border-black/10 overflow-hidden group">
                        <img
                          src={dtiUrl}
                          alt="DTI"
                          className="w-full h-full object-cover"
                          onError={() => setDtiUrl("")}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewImage(dtiUrl)}
                            className="p-2 rounded-full bg-white/90 hover:bg-white text-xs font-medium"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => setDtiUrl("")}
                            className="p-2 rounded-full bg-white/90 hover:bg-white text-xs font-medium text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openUrlModal("dti")}
                        className="aspect-square w-full rounded-[3px] border-2 border-dashed border-black/20 hover:border-[#a67c52] flex flex-col items-center justify-center text-black/40 hover:text-[#a67c52] transition-colors"
                      >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-[10px] mt-1">Add</span>
                      </button>
                    )}
                  </div>

                  {/* SEC */}
                  <div>
                    <p className="text-xs font-medium text-black/60 mb-1">SEC</p>
                    {secUrl ? (
                      <div className="relative aspect-square rounded-[3px] border border-black/10 overflow-hidden group">
                        <img
                          src={secUrl}
                          alt="SEC"
                          className="w-full h-full object-cover"
                          onError={() => setSecUrl("")}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewImage(secUrl)}
                            className="p-2 rounded-full bg-white/90 hover:bg-white text-xs font-medium"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => setSecUrl("")}
                            className="p-2 rounded-full bg-white/90 hover:bg-white text-xs font-medium text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openUrlModal("sec")}
                        className="aspect-square w-full rounded-[3px] border-2 border-dashed border-black/20 hover:border-[#a67c52] flex flex-col items-center justify-center text-black/40 hover:text-[#a67c52] transition-colors"
                      >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-[10px] mt-1">Add</span>
                      </button>
                    )}
                  </div>

                  {/* Business Permit */}
                  <div>
                    <p className="text-xs font-medium text-black/60 mb-1">Permit</p>
                    {businessPermitUrl ? (
                      <div className="relative aspect-square rounded-[3px] border border-black/10 overflow-hidden group">
                        <img
                          src={businessPermitUrl}
                          alt="Permit"
                          className="w-full h-full object-cover"
                          onError={() => setBusinessPermitUrl("")}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewImage(businessPermitUrl)}
                            className="p-2 rounded-full bg-white/90 hover:bg-white text-xs font-medium"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => setBusinessPermitUrl("")}
                            className="p-2 rounded-full bg-white/90 hover:bg-white text-xs font-medium text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openUrlModal("permit")}
                        className="aspect-square w-full rounded-[3px] border-2 border-dashed border-black/20 hover:border-[#a67c52] flex flex-col items-center justify-center text-black/40 hover:text-[#a67c52] transition-colors"
                      >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-[10px] mt-1">Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Preview Modal */}
              {previewImage && (
                <div
                  className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
                  onClick={() => setPreviewImage(null)}
                >
                  <div className="relative max-w-3xl max-h-[90vh] mx-4">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(null)}
                      className="absolute -top-10 right-0 text-white text-sm hover:underline"
                    >
                      Close
                    </button>
                    <img
                      src={previewImage}
                      alt="Document preview"
                      className="max-w-full max-h-[85vh] object-contain rounded"
                      onError={() => setPreviewImage(null)}
                    />
                  </div>
                </div>
              )}

              {/* URL Input Modal */}
              {urlModalOpen && (
                <div
                  className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
                  onClick={() => setUrlModalOpen(false)}
                >
                  <div
                    className="w-full max-w-sm rounded-[3px] bg-white p-5 shadow-xl mx-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h4 className="text-base font-semibold text-[#2c2c2c]">
                      {urlModalType === "dti" && "Add DTI Certificate"}
                      {urlModalType === "sec" && "Add SEC Registration"}
                      {urlModalType === "permit" && "Add Business Permit"}
                    </h4>
                    <p className="mt-1 text-xs text-black/60">
                      Paste the image URL (e.g., from Google Drive, Dropbox, or your website)
                    </p>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveUrlModal()}
                      className="mt-3 block w-full rounded-[3px] border border-black/20 px-3 py-2 text-sm focus:border-[#a67c52] focus:outline-none focus:ring-1 focus:ring-[#a67c52]"
                      placeholder="https://example.com/image.jpg"
                      autoFocus
                    />
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setUrlModalOpen(false)}
                        className="flex-1 inline-flex h-9 items-center justify-center rounded-[3px] border border-black/20 bg-white text-[#2c2c2c] hover:bg-black/5 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveUrlModal}
                        className="flex-1 inline-flex h-9 items-center justify-center rounded-[3px] bg-[#a67c52] text-white hover:bg-[#8e6a46] transition-colors text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-[3px] bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setError("");
                  }}
                  className="flex-1 inline-flex h-10 items-center justify-center rounded-[3px] border border-black/20 bg-white text-[#2c2c2c] hover:bg-black/5 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex h-10 items-center justify-center rounded-[3px] bg-[#a67c52] text-white hover:bg-[#8e6a46] transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
