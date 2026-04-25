"use client";

import { useEffect, useState } from "react";
import { ImageUploadDropzone } from "@/components/ImageUploadDropzone";
import type { UploadResult } from "@/hooks/useImageUpload";

type LogoModalProps = {
  open: boolean;
  logoUrl: string;
  onCancel: () => void;
  onSave: (url: string) => void;
};

export default function LogoModal({ open, logoUrl, onCancel, onSave }: LogoModalProps) {
  const [url, setUrl] = useState(logoUrl);

  useEffect(() => {
    setUrl(logoUrl);
  }, [logoUrl, open]);

  const handleUploadComplete = (result: UploadResult) => {
    setUrl(result.url);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-[3px] border border-black/10 bg-white shadow-lg">
        <div className="px-4 py-3 border-b border-black/5">
          <div className="text-[14px] font-semibold text-[#2c2c2c]">Logo</div>
          <div className="mt-1 text-[12px] text-black/45">Upload a logo or enter a URL.</div>
        </div>
        <div className="p-4 grid gap-4">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-[3px] border border-black/10 bg-white overflow-hidden flex items-center justify-center">
              {url ? (
                <img src={url} alt="Logo preview" className="h-full w-full object-contain" />
              ) : (
                <div className="h-full w-full bg-[#fcfbf9] flex items-center justify-center text-[11px] text-black/40">
                  No logo
                </div>
              )}
            </div>
          </div>

          <ImageUploadDropzone
            bucket="vendor-assets"
            folder="logos"
            label="Upload Logo"
            description="JPG, PNG, WebP up to 10MB. Will be compressed if needed."
            onUploadComplete={handleUploadComplete}
            onClear={() => setUrl("")}
            existingUrl={url}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-white text-[11px] text-black/40">or enter URL</span>
            </div>
          </div>

          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Logo URL</span>
            <input
              className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-9 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(url)}
              className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
