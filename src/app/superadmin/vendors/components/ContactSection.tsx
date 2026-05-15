import React from "react";
import { proxiedImageUrl } from "@/lib/imageSizes";

export function ContactSection({
  editForm,
  setEditForm,
  setLogoUrlInput,
  setLogoModalOpen
}: {
  editForm: any;
  setEditForm: (v: any) => void;
  setLogoUrlInput: (v: string) => void;
  setLogoModalOpen: (v: boolean) => void;
}) {
  return (
    <section className="grid gap-4">
      <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2">
        Contact Information
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-[12px] font-semibold text-black/55">Contact Email</span>
          <input
            type="email"
            value={editForm.contact_email}
            onChange={(e) => setEditForm((f: any) => ({ ...f, contact_email: e.target.value }))}
            className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[12px] font-semibold text-black/55">Contact Phone</span>
          <input
            value={editForm.contact_phone}
            onChange={(e) => setEditForm((f: any) => ({ ...f, contact_phone: e.target.value }))}
            className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[12px] font-semibold text-black/55">Website URL</span>
          <input
            type="url"
            value={editForm.website_url}
            onChange={(e) => setEditForm((f: any) => ({ ...f, website_url: e.target.value }))}
            className="h-10 rounded-[3px] border border-black/10 px-3 text-[13px]"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[12px] font-semibold text-black/55">Logo</span>
          <div className="flex items-center gap-3">
            <div className="w-[80px] h-[80px] rounded-[3px] border border-black/10 overflow-hidden bg-black/5 flex items-center justify-center">
              {editForm.logo_url ? (
                <img
                  src={proxiedImageUrl(editForm.logo_url) ?? editForm.logo_url}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-[10px] text-black/40">No logo</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setLogoUrlInput(editForm.logo_url);
                setLogoModalOpen(true);
              }}
              className="h-9 px-4 rounded-[3px] border border-black/10 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
            >
              Edit Logo
            </button>
          </div>
        </label>
      </div>
    </section>
  );
}
