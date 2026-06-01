import React from "react";
import { VendorVideo } from "../hooks/useSuperadminSuppliers";

export function VideosSection({
  editVideos,
  setEditVideos
}: {
  editVideos: VendorVideo[];
  setEditVideos: (v: any) => void;
}) {
  return (
    <section className="grid gap-4">
      <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2 flex items-center justify-between">
        <span>Videos</span>
        <button
          type="button"
          onClick={() => setEditVideos((v: any) => [...v, { video_url: "", title: "", display_order: v.length + 1 }])}
          className="text-[12px] text-[#6e4f33] hover:underline"
        >
          + Add video
        </button>
      </div>
      <div className="grid gap-3">
        {editVideos.map((vid, idx) => (
          <div key={idx} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] items-end">
            <label className="grid gap-1">
              <span className="text-[11px] text-black/40">Video URL (YouTube/Vimeo)</span>
              <input
                value={vid.video_url}
                onChange={(e) => {
                  const newVideos = [...editVideos];
                  newVideos[idx].video_url = e.target.value;
                  setEditVideos(newVideos);
                }}
                className="h-9 rounded-[3px] border border-black/10 px-2 text-[12px]"
                placeholder="https://..."
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[11px] text-black/40">Title (optional)</span>
              <input
                value={vid.title || ""}
                onChange={(e) => {
                  const newVideos = [...editVideos];
                  newVideos[idx].title = e.target.value;
                  setEditVideos(newVideos);
                }}
                className="h-9 rounded-[3px] border border-black/10 px-2 text-[12px]"
                placeholder="Video title"
              />
            </label>
            <button
              type="button"
              onClick={() => setEditVideos((v: any) => v.filter((_: any, i: number) => i !== idx))}
              className="h-9 px-2 rounded-[3px] border border-[#b42318]/20 text-[12px] text-[#b42318] hover:bg-[#b42318]/5"
            >
              ×
            </button>
          </div>
        ))}
        {editVideos.length === 0 && (
          <div className="text-[12px] text-black/50 italic">No videos added yet.</div>
        )}
      </div>
    </section>
  );
}
