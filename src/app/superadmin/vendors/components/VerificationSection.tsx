import React from "react";
import { proxiedImageUrl } from "@/lib/imageSizes";
import { VerificationDocument } from "../hooks/useSuperadminVendors";

export function VerificationSection({
  editForm,
  setEditForm,
  editSubscription,
  saveSubscriptionDate,
  verificationDocuments
}: {
  editForm: any;
  setEditForm: (v: any) => void;
  editSubscription: any;
  saveSubscriptionDate: (v: string) => void;
  verificationDocuments: VerificationDocument[];
}) {
  return (
    <section className="grid gap-4">
      <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2">
        Verification
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-[12px] font-semibold text-black/55">Plan Expiry Date</span>
          <input
            type="date"
            value={editSubscription?.expiry_date ? new Date(editSubscription.expiry_date).toISOString().split('T')[0] : ""}
            onChange={(e) => saveSubscriptionDate(e.target.value)}
            className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
          />
        </label>
      </div>
      
      {editSubscription?.verification_doc_url && (
        <div className="mt-2">
          <span className="text-[12px] font-semibold text-black/55 block mb-1">Verification Document</span>
          <a 
            href={proxiedImageUrl(editSubscription.verification_doc_url) ?? editSubscription.verification_doc_url}
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-2 h-9 px-3 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-[#6e4f33] hover:bg-black/5 transition-colors"
          >
            View Document
          </a>
        </div>
      )}

      {verificationDocuments.length > 0 && (
        <div className="grid gap-3 mt-4">
          <span className="text-[12px] font-semibold text-black/55">Submitted Documents</span>
          <div className="grid gap-2">
            {verificationDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 rounded-[3px] border border-black/10 bg-[#fafafa]"
              >
                <div className="w-10 h-10 rounded-[3px] bg-white border border-black/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-black/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-[#2c2c2c] capitalize">
                    {doc.doc_type.replace(/_/g, " ")}
                  </div>
                  <div className="text-[11px] text-black/50 truncate">
                    {doc.file_name || "Document"}
                  </div>
                  <div className="text-[10px] text-black/40">
                    Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-[3px] text-[10px] font-semibold ${
                    doc.status === "approved"
                      ? "bg-[#ecfdf3] text-[#027a48]"
                      : doc.status === "rejected"
                      ? "bg-[#fff1f3] text-[#b42318]"
                      : "bg-[#fff7ed] text-[#b54708]"
                  }`}
                >
                  {doc.status}
                </span>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 px-3 rounded-[3px] border border-black/10 bg-white text-[11px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
