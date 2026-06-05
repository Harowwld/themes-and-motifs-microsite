import React from "react";
import { proxiedImageUrl } from "@/lib/imageSizes";
import { VendorImage } from "../hooks/useSuperadminSuppliers";
import { toast } from "@/lib/toast";

export function PhotosSection({
  editImages,
  setEditImages,
  setEditingPhotoIndex,
  setPhotoModalOpen,
  allThemes,
  editThemes,
  setEditThemes
}: {
  editImages: VendorImage[];
  setEditImages: (v: any) => void;
  setEditingPhotoIndex: (v: number | null) => void;
  setPhotoModalOpen: (v: boolean) => void;
  allThemes?: {id: number; name: string}[];
  editThemes?: any[];
  setEditThemes?: (v: any) => void;
}) {
  return (
    <section className="grid gap-4">
      <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2">
        Photos
      </div>
      <div className="flex flex-wrap gap-3">
        {editImages.map((img, idx) => (
          <div key={idx} className="relative group">
            <div className="w-[140px] h-[93px] rounded-[3px] border border-black/10 overflow-hidden bg-black/5 relative">
              {img.image_url ? (
                <img
                  src={proxiedImageUrl(img.image_url) ?? img.image_url}
                  alt=""
                  className="w-full h-full object-cover cursor-pointer"
                  style={{
                    objectPosition: `${img.focus_x ?? 50}% ${img.focus_y ?? 50}%`,
                    transform: `scale(${img.zoom ?? 1})`,
                  }}
                  onClick={() => {
                    setEditingPhotoIndex(idx);
                    setPhotoModalOpen(true);
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-black/40">
                  No image
                </div>
              )}
              {img.is_cover && (
                <div className="absolute top-1 left-1">
                  <span className="text-[9px] font-semibold bg-[#027a48] text-white px-1.5 py-0.5 rounded">Cover</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setEditImages((imgs: any) => imgs.filter((_: any, i: number) => i !== idx))}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/90 text-black/60 hover:text-[#b42318] flex items-center justify-center text-[14px] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>

            <button
              type="button"
              onClick={() => {
                const newImages = editImages.map((i, iidx) => ({
                  ...i,
                  is_cover: iidx === idx ? !i.is_cover : false,
                }));
                setEditImages(newImages);
              }}
              className={`absolute -top-2 -left-2 w-6 h-6 rounded-full text-[12px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                img.is_cover
                  ? "bg-[#ecfdf3] text-[#027a48] border border-[#027a48]/20"
                  : "bg-white/90 text-black/60 hover:text-[#027a48] border border-black/10"
              }`}
              title={img.is_cover ? "Remove from cover" : "Set as cover"}
            >
              {img.is_cover ? "C" : "C"}
            </button>

            <div className="mt-1 flex flex-col gap-1">
              <input
                value={img.caption}
                onChange={(e) => {
                  const newImages = [...editImages];
                  newImages[idx].caption = e.target.value;
                  setEditImages(newImages);
                }}
                className="w-full h-6 rounded-[3px] border border-black/10 px-1.5 text-[10px]"
                placeholder="Caption"
              />
              <select
                value={img.theme_id || ""}
                onChange={(e) => {
                  const newImages = [...editImages];
                  newImages[idx].theme_id = e.target.value ? Number(e.target.value) : null;
                  setEditImages(newImages);
                  toast.success("Photo theme updated! Remember to save the vendor details.");
                }}
                className="w-full h-6 rounded-[3px] border border-black/10 px-1 text-[10px] bg-white outline-none"
              >
                <option value="">No Theme</option>
                {allThemes?.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        ))}

        <div
          className="w-[140px] h-[93px] rounded-[3px] border border-black/10 border-dashed bg-black/[0.02] flex flex-col items-center justify-center cursor-pointer hover:bg-black/[0.05] transition-colors"
          onClick={() => {
            setEditingPhotoIndex(null);
            setPhotoModalOpen(true);
          }}
        >
          <div className="text-[24px] text-black/40">+</div>
          <div className="text-[10px] text-black/40 mt-1">Add photos</div>
        </div>
      </div>

      {editThemes && setEditThemes && allThemes && (
        <section className="grid gap-4 mt-8 pt-6 border-t border-black/5">
          <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2">
            Storefront Themes
          </div>
          <div className="flex flex-wrap gap-2">
            {allThemes.map((theme) => {
              const isSelected = editThemes.some((t) => t.id === theme.id);
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setEditThemes((prev: any) => prev.filter((t: any) => t.id !== theme.id));
                    } else {
                      setEditThemes((prev: any) => [...prev, theme]);
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                    isSelected
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : "bg-[#fcfbf9] text-black/60 border border-black/10 hover:bg-black/5"
                  }`}
                >
                  {isSelected && (
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                  {theme.name}
                </button>
              );
            })}
          </div>
        </section>
      )}
    </section>
  );
}
