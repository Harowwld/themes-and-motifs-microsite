"use client";

import { useEffect, useState } from "react";

type VideoModalProps = {
  open: boolean;
  video: { video_url: string; title: string; display_order: number } | null;
  isNew: boolean;
  onCancel: () => void;
  onSave: (video: { video_url: string; title: string; display_order: number }) => void;
  onDelete?: () => void;
};

export default function VideoModal({ open, video, isNew, onCancel, onSave, onDelete }: VideoModalProps) {
  const [videoUrl, setVideoUrl] = useState(video?.video_url ?? "");
  const [title, setTitle] = useState(video?.title ?? "");

  useEffect(() => {
    setVideoUrl(video?.video_url ?? "");
    setTitle(video?.title ?? "");
  }, [video, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-[3px] border border-black/10 bg-white shadow-lg">
        <div className="px-4 py-3 border-b border-black/5">
          <div className="text-[14px] font-semibold text-[#2c2c2c]">{isNew ? "Add Video" : "Edit Video"}</div>
          <div className="mt-1 text-[12px] text-black/45">Embed a YouTube or Vimeo video link.</div>
        </div>
        <div className="p-4 grid gap-4">
          <div className="flex justify-center">
            <div className="h-32 w-full max-w-[200px] rounded-[3px] border border-black/10 bg-white overflow-hidden flex items-center justify-center relative">
              {videoUrl ? (
                <div className="h-full w-full bg-black flex items-center justify-center">
                  <div className="text-[#a67c52] text-[24px]">🎥</div>
                  <div className="absolute bottom-2 left-2 right-2 text-[9px] text-white/70 truncate text-center">{videoUrl}</div>
                </div>
              ) : (
                <div className="h-full w-full bg-[#fcfbf9] flex items-center justify-center text-[11px] text-black/40">
                  No video URL
                </div>
              )}
            </div>
          </div>

          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Video URL (YouTube/Vimeo)</span>
            <input
              className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <span className="text-[10px] text-black/40">Paste a YouTube or Vimeo link to embed it.</span>
          </label>

          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-black/55">Title (optional)</span>
            <input
              className="h-10 w-full rounded-[3px] border border-black/10 px-3 text-[13px]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Describe this video..."
            />
          </label>

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
                  video_url: videoUrl, 
                  title, 
                  display_order: video?.display_order ?? 1 
                })}
                disabled={!videoUrl.trim()}
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
