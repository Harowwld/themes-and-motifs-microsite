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
  saveSubscriptionDate: (date: string | null, tin?: string | null) => void;
  verificationDocuments: VerificationDocument[];
}) {
  const [maximizedUrl, setMaximizedUrl] = React.useState<string | null>(null);
  const [localTin, setLocalTin] = React.useState(editSubscription?.tin || "");

  React.useEffect(() => {
    setLocalTin(editSubscription?.tin || "");
  }, [editSubscription?.tin]);

  const getDocTypeLabel = (url: string, type: 'sec' | 'dti' | 'legacy') => {
    if (type === 'sec') return "SEC Certificate";
    if (type === 'dti') return "DTI Registration";
    return "Verification Document";
  };

  const isPdf = (url?: string | null) => {
    if (!url) return false;
    return url.toLowerCase().split('?')[0].endsWith('.pdf');
  };

  const renderDocPreview = (url: string | null | undefined, type: 'sec' | 'dti' | 'legacy') => {
    if (!url) return null;

    const label = getDocTypeLabel(url, type);
    const resolvedUrl = proxiedImageUrl(url) ?? url;
    const isFilePdf = isPdf(url);

    return (
      <div className="flex items-start gap-4 p-4 rounded-xl border border-black/[0.06] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:border-black/[0.1] hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300">
        {/* Document Thumbnail */}
        <div className="relative group shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-black/10 bg-[#fafafa] flex items-center justify-center shadow-inner">
          {isFilePdf ? (
            <a 
              href={url} 
              target="_blank" 
              rel="noreferrer"
              className="w-full h-full flex flex-col items-center justify-center gap-1 hover:bg-black/[0.02] transition-colors"
            >
              <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="text-[9px] font-black uppercase text-red-500 tracking-wider">PDF</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setMaximizedUrl(resolvedUrl)}
              className="w-full h-full focus:outline-none"
            >
              <img 
                src={resolvedUrl} 
                alt={label} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m4-3H6" />
                </svg>
              </div>
            </button>
          )}
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 flex flex-col justify-center h-20">
          <div className="text-[13px] font-serif font-bold text-[#2c2c2c] truncate">
            {label}
          </div>
          
          <div className="mt-2 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-black/35 uppercase tracking-widest">Expiration Date</span>
            {editSubscription?.expiry_date ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[12px] font-semibold text-[#2c2c2c]">
                  {new Date(editSubscription.expiry_date).toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-[11px] font-medium text-amber-600 italic">
                  No Expiration Set
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="grid gap-6">
      <div className="text-[13px] font-black uppercase tracking-wider text-[#2c2c2c] border-b border-black/5 pb-2">
        Verification details
      </div>

      {/* Date Picker and TIN Inputs */}
      <div className="grid gap-4 sm:grid-cols-2 bg-[#fafafa]/50 p-4 rounded-xl border border-black/[0.04]">
        <label className="grid gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-black/40">Set Expiration / Expiry Date</span>
          <input
            type="date"
            value={editSubscription?.expiry_date ? new Date(editSubscription.expiry_date).toISOString().split('T')[0] : ""}
            onChange={(e) => saveSubscriptionDate(e.target.value, editSubscription?.tin)}
            className="h-10 rounded-lg border border-black/10 bg-white px-3 text-[13px] transition focus:border-[#6e4f33] focus:ring-4 focus:ring-[#6e4f33]/5 outline-none"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-black/40">TIN #</span>
          <input
            type="text"
            placeholder="000-000-000-000"
            value={localTin}
            onChange={(e) => setLocalTin(e.target.value)}
            onBlur={() => {
              if (localTin !== (editSubscription?.tin || "")) {
                saveSubscriptionDate(editSubscription?.expiry_date, localTin);
              }
            }}
            className="h-10 rounded-lg border border-black/10 bg-white px-3 text-[13px] transition focus:border-[#6e4f33] focus:ring-4 focus:ring-[#6e4f33]/5 outline-none"
          />
        </label>
      </div>
      
      {/* Verification Documents Previews */}
      <div className="grid gap-4">
        <span className="text-[11px] font-bold uppercase tracking-widest text-black/40 block">Verification Documents</span>
        
        {editSubscription?.sec_doc_url || editSubscription?.dti_doc_url || editSubscription?.verification_doc_url ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {renderDocPreview(editSubscription?.sec_doc_url, 'sec')}
            {renderDocPreview(editSubscription?.dti_doc_url, 'dti')}
            {!editSubscription?.sec_doc_url && !editSubscription?.dti_doc_url && renderDocPreview(editSubscription?.verification_doc_url, 'legacy')}
          </div>
        ) : (
          <div className="text-[12px] text-black/40 italic p-4 rounded-xl border border-dashed border-black/10 text-center">
            No verification documents have been uploaded yet.
          </div>
        )}
      </div>

      {/* Submitted Documents Legacy Log */}
      {verificationDocuments.length > 0 && (
        <div className="grid gap-3 border-t border-black/[0.04] pt-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-black/40">Submission Log History</span>
          <div className="grid gap-2">
            {verificationDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-black/10 bg-[#fafafa]"
              >
                <div className="w-10 h-10 rounded-[3px] bg-white border border-black/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-black/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
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
                  className="h-8 px-3 rounded-lg border border-black/10 bg-white text-[11px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox / Maximized Image Modal */}
      {maximizedUrl && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setMaximizedUrl(null)}
        >
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setMaximizedUrl(null)}
              className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition focus:outline-none focus:ring-2 focus:ring-white/50 animate-bounce"
              style={{ animationDuration: '3s' }}
              aria-label="Close image preview"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={maximizedUrl}
              alt="Maximized Document Preview"
              className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </section>
  );
}
