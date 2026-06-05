"use client";

import { useEffect, useState } from "react";
import { X, Image as ImageIcon, Trash2, CheckCircle2, ChevronRight } from "lucide-react";
import { MultiImageUploadManager } from "@/components/MultiImageUploadManager";
import { proxiedImageUrl } from "@/lib/imageSizes";
import { cn } from "@/lib/utils";

type Photo = { 
  image_url: string; 
  caption: string; 
  is_cover: boolean; 
  display_order: number;
  theme_id?: number | null;
};

type PhotoModalProps = {
  open: boolean;
  photo: Photo | null;
  isNew: boolean;
  onCancel: () => void;
  onSave: (photos: Photo[]) => void;
  onDelete?: () => void;
  themes?: {id: number, name: string}[];
};

export default function PhotoModal({ open, photo, isNew, onCancel, onSave, onDelete, themes }: PhotoModalProps) {
  const [imageUrl, setImageUrl] = useState(photo?.image_url ?? "");
  const [caption, setCaption] = useState(photo?.caption ?? "");
  const [isCover, setIsCover] = useState(photo?.is_cover ?? false);
  const [themeId, setThemeId] = useState<number | null>(photo?.theme_id ?? null);



  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in duration-300">
      <div className={cn(
        "w-full bg-white shadow-2xl rounded-2xl overflow-hidden transition-all duration-500 transform scale-100 flex flex-col max-h-[90vh]",
        isNew ? "max-w-4xl" : "max-w-md"
      )}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between bg-black/[0.01] shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-[#2c2c2c]">
              {isNew ? "Add Photos / Themes" : "Edit Photo Details"}
            </h2>
            <p className="text-xs text-black/40 mt-0.5">
              {isNew 
                ? "Upload multiple images and add captions to showcase your work." 
                : "Update the caption or cover status for this photo."}
            </p>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-black/5 rounded-full text-black/40 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto overflow-x-hidden sleek-scrollbar flex-1">

          {isNew ? (
            /* Multi-Upload View */
            <MultiImageUploadManager
              bucket="vendor-assets"
              folder="gallery"
              maxFiles={20}
              onUploadsComplete={(results) => {
                const newPhotos = results.map((res, idx) => ({
                  image_url: res.url,
                  caption: res.caption,
                  is_cover: false, // Cover is usually set manually or default to first in list in parent
                  display_order: idx + 1, // Parent will adjust this
                  theme_id: themeId,
                }));
                onSave(newPhotos);
              }}
              onCancel={onCancel}
            />
          ) : (
            /* Single Edit View */
            <div className="space-y-6">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-black/10 bg-black/5 shadow-inner group">
                {imageUrl ? (
                  <img 
                    src={proxiedImageUrl(imageUrl) || imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[12px] text-black/40">
                    No image
                  </div>
                )}
                {isCover && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-[#027a48] text-white text-[10px] font-bold rounded-md shadow-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    COVER PHOTO
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black/60 uppercase tracking-wider">
                    Caption
                  </label>
                  <textarea
                    className="w-full min-h-[100px] rounded-xl border border-black/10 bg-black/[0.01] px-4 py-3 text-sm focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 transition-all outline-none resize-none"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Tell a story about this photo..."
                  />
                </div>

                {themes && themes.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-black/60 uppercase tracking-wider">
                      Theme
                    </label>
                    <select
                      className="w-full h-11 rounded-xl border border-black/10 bg-black/[0.01] px-4 text-sm focus:border-[#a67c52] focus:ring-4 focus:ring-[#a67c52]/10 transition-all outline-none"
                      value={themeId || ""}
                      onChange={(e) => setThemeId(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">No Theme</option>
                      {themes.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <label className="flex items-center gap-3 p-4 rounded-xl border border-black/10 bg-black/[0.01] cursor-pointer hover:border-[#a67c52]/30 hover:bg-[#a67c52]/5 transition-all group">
                  <div className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center transition-all",
                    isCover ? "bg-[#a67c52] border-[#a67c52]" : "border-black/20 bg-white group-hover:border-[#a67c52]"
                  )}>
                    {isCover && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={isCover}
                    onChange={(e) => setIsCover(e.target.checked)}
                    className="hidden"
                  />
                  <span className="text-sm font-medium text-black/70">Use as portfolio cover photo</span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-black/5">
                {onDelete ? (
                  <button
                    type="button"
                    onClick={onDelete}
                    className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-[#b42318] hover:bg-[#b42318]/5 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Photo</span>
                  </button>
                ) : <div />}
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="h-10 px-5 rounded-xl border border-black/10 bg-white text-sm font-semibold text-black/70 hover:bg-black/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => onSave([{ 
                      image_url: imageUrl, 
                      caption, 
                      is_cover: isCover, 
                      display_order: photo?.display_order ?? 1,
                      theme_id: themeId,
                    }])}
                    disabled={!imageUrl.trim()}
                    className="flex items-center gap-2 h-10 px-6 rounded-xl bg-[#a67c52] text-white text-sm font-semibold hover:bg-[#8e6a46] shadow-md shadow-[#a67c52]/20 transition-all hover:translate-y-[-1px] active:translate-y-[0px] disabled:opacity-50 disabled:translate-y-0"
                  >
                    <span>Save Changes</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
