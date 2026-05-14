"use client";

import { useEffect, useState } from "react";
import { ImageUploadDropzone } from "@/components/ImageUploadDropzone";
import type { UploadResult } from "@/hooks/useImageUpload";

type PhotoModalProps = {
  open: boolean;
  photo: { image_url: string; caption: string; is_cover: boolean; display_order: number; media_type?: 'image' | 'video' } | null;
  isNew: boolean;
  onCancel: () => void;
  onSave: (photo: { image_url: string; caption: string; is_cover: boolean; display_order: number; media_type: 'image' | 'video' }) => void;
  onDelete?: () => void;
};

export default function PhotoModal({ open, photo, isNew, onCancel, onSave, onDelete }: PhotoModalProps) {
  const [imageUrl, setImageUrl] = useState(photo?.image_url ?? "");
  const [caption, setCaption] = useState(photo?.caption ?? "");
  const [isCover, setIsCover] = useState(photo?.is_cover ?? false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>(photo?.media_type ?? 'image');

  useEffect(() => {
    setImageUrl(photo?.image_url ?? "");
    setCaption(photo?.caption ?? "");
    setIsCover(photo?.is_cover ?? false);
    setMediaType(photo?.media_type ?? 'image');
  }, [photo, open]);

  const handleUploadComplete = (result: UploadResult) => {
    setImageUrl(result.url);
    setMediaType('image'); // Uploads are always images
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-[3px] border border-black/10 bg-white shadow-lg">
        <div className="px-4 py-3 border-b border-black/5">
          <div className="text-[14px] font-semibold text-[#2c2c2c]">{isNew ? "Add Media" : "Edit Media"}</div>
          <div className="mt-1 text-[12px] text-black/45">Upload an image or embed a YouTube/Vimeo video.</div>
        </div>
        <div className="p-4 grid gap-4">
          {/* Media Type Selector */}
          <div className="flex gap-2 p-1 bg-[#fcfbf9] rounded-[3px] border border-black/5">
            <button
              type="button"
              onClick={() => setMediaType('image')}
              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-[2px] transition-colors ${mediaType === 'image' ? 'bg-white shadow-sm text-[#a67c52] border border-black/5' : 'text-black/40 hover:text-black/60'}`}
            >
              Photo
            </button>
            <button
              type="button"
              onClick={() => setMediaType('video')}
              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-[2px] transition-colors ${mediaType === 'video' ? 'bg-white shadow-sm text-[#a67c52] border border-black/5' : 'text-black/40 hover:text-black/60'}`}
            >
              Video
            </button>
          </div>

          <div className="flex justify-center">
            <div className="h-32 w-full max-w-[200px] rounded-[3px] border border-black/10 bg-white overflow-hidden flex items-center justify-center relative">
              {imageUrl ? (
                mediaType === 'video' ? (
                  <div className="h-full w-full bg-black flex items-center justify-center">
                    <div className="text-[#a67c52] text-[24px]">🎥</div>
                    <div className="absolute bottom-2 left-2 right-2 text-[9px] text-white/70 truncate text-center">{imageUrl}</div>
                  </div>
                ) : (
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                )
              ) : (
                <div className="h-full w-full bg-[#fcfbf9] flex items-center justify-center text-[11px] text-black/40">
                  No {mediaType}
                </div>
              )}
            </div>
          </div>

          {mediaType === 'image' && (
            <>
              <ImageUploadDropzone
                bucket="vendor-assets"
                folder="gallery"
                label="Upload Photo"
                description="JPG, PNG, WebP up to 2MB."
                onUploadComplete={handleUploadComplete}
                onClear={() => setImageUrl("")}
                existingUrl={imageUrl}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-white text-[11px] text-black/40">or enter image URL</span>
                </div>
              </div>
            </>
          )}

          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">{mediaType === 'video' ? "Video URL (YouTube/Vimeo)" : "Image URL"}</span>
            <input
              className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder={mediaType === 'video' ? "https://www.youtube.com/watch?v=..." : "https://..."}
            />
            {mediaType === 'video' && (
              <span className="text-[10px] text-black/40">Paste a YouTube or Vimeo link to embed it.</span>
            )}
          </label>

          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Caption (optional)</span>
            <input
              className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={`Describe this ${mediaType}...`}
            />
          </label>

          {mediaType === 'image' && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isCover}
                onChange={(e) => setIsCover(e.target.checked)}
                className="h-4 w-4 rounded border-black/20"
              />
              <span className="text-[12px] font-semibold text-black/60">Use as cover photo</span>
            </label>
          )}

          <div className="flex justify-between pt-2">
            <div>
              {!isNew && onDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="h-9 px-4 rounded-[3px] border border-[#b42318]/20 bg-white text-[13px] font-semibold text-[#b42318] hover:bg-[#b42318]/5 transition-colors"
                >
                  Delete
                </button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="h-9 px-4 rounded-[3px] border border-black/10 bg-white text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onSave({ 
                  image_url: imageUrl, 
                  caption, 
                  is_cover: mediaType === 'video' ? false : isCover, 
                  display_order: photo?.display_order ?? 1,
                  media_type: mediaType 
                })}
                disabled={!imageUrl.trim()}
                className="h-9 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
