import React from "react";
import { Inquiry } from "../types";

export function InquirySection({
  inquiries,
  refreshInquiries,
  saving,
  updateInquiryStatus
}: {
  inquiries: Inquiry[];
  refreshInquiries: () => void;
  saving: boolean;
  updateInquiryStatus: (id: number, status: string) => void;
}) {
  return (
    <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2c2c2c]">Lead Inquiries</h2>
          <div className="mt-1 text-[12px] text-black/45">Messages from couples interested in your services.</div>
        </div>
        <button
          type="button"
          onClick={refreshInquiries}
          className="h-10 px-5 rounded-lg border border-black/[0.08] bg-white text-[13px] font-bold text-black/60 hover:bg-[#fafafa] hover:text-[#a67c52] transition-all duration-300 shadow-sm"
        >
          <span className="inline-flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
            Refresh
          </span>
        </button>
      </div>

      <div className="p-6">
        {inquiries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-black/[0.08] bg-[#fafafa]/50 p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-md mx-auto mb-6">
              <svg viewBox="0 0 24 24" fill="none" stroke="#a67c52" strokeWidth="1.5" className="h-8 w-8">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div className="text-[16px] font-serif font-semibold text-black/70 mb-2">No inquiries yet</div>
            <div className="text-[13px] text-black/40 max-w-xs mx-auto">When couples contact you, their messages will appear here. Get ready to shine!</div>
          </div>
        ) : (
          <div className="grid gap-4">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className={`group rounded-lg border p-5 transition-all duration-300 ${
                  inq.status === "new" 
                    ? "border-[#a67c52]/30 bg-[#a67c52]/5 shadow-sm hover:shadow-md" 
                    : "border-black/[0.05] bg-white hover:border-black/[0.1] hover:shadow-md"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-3 mb-3">
                      <span className="text-[16px] font-serif font-bold text-[#2c2c2c]">
                        {inq.name ?? "Anonymous Couple"}
                      </span>
                      {inq.status === "new" && (
                        <span className="inline-flex items-center rounded-lg bg-[#a67c52] px-3 py-0.5 text-[9px] font-black uppercase tracking-widest text-white shadow-sm">
                          New Lead
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-black/30 uppercase tracking-widest ml-auto sm:ml-0">
                        {new Date(inq.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    
                    <div className="grid gap-2 sm:flex sm:items-center sm:gap-6 mb-4">
                      {inq.email && (
                        <a
                          href={`mailto:${inq.email}`}
                          className="flex items-center gap-2 text-[12px] font-bold text-[#a67c52] hover:text-[#8e6a46] transition-colors"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          {inq.email}
                        </a>
                      )}
                      {inq.phone && (
                        <a
                          href={`tel:${inq.phone.replace(/\s/g, "")}`}
                          className="flex items-center gap-2 text-[12px] font-bold text-[#a67c52] hover:text-[#8e6a46] transition-colors"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          {inq.phone}
                        </a>
                      )}
                    </div>

                    {inq.wedding_date && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/[0.03] text-[11px] font-bold text-black/50 mb-4">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Wedding: {new Date(inq.wedding_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                    
                    <div className="bg-white/50 rounded-lg p-4 border border-black/[0.03] text-[14px] text-black/70 whitespace-pre-line leading-relaxed italic group-hover:bg-white transition-colors duration-300">
                      "{inq.message}"
                    </div>
                  </div>
                  
                  <div className="w-full sm:w-auto sm:shrink-0 flex sm:flex-col gap-2">
                    <select
                      value={String(inq.status ?? "new")}
                      disabled={saving}
                      onChange={(e) => updateInquiryStatus(inq.id, e.target.value)}
                      className="flex-1 h-11 rounded-lg border border-black/[0.08] bg-white px-4 text-[12px] font-bold text-black/70 outline-none focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-300 disabled:opacity-60 cursor-pointer shadow-sm hover:border-black/[0.15]"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
