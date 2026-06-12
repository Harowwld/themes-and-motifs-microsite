import React from "react";
import { Spinner } from "./DashboardSections";
import { VideoModal } from "./DashboardModals";
import { VendorVideo } from "../types";

function VideoThumbnail({ url, title }: { url: string; title: string | null }) {
  const [thumb, setThumb] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!url) return;

    // YouTube check
    const ytReg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const ytMatch = url.match(ytReg);
    if (ytMatch && ytMatch[2].length === 11) {
      setThumb(`https://img.youtube.com/vi/${ytMatch[2]}/hqdefault.jpg`);
      return;
    }

    // Vimeo check
    const vimeoReg = /(?:vimeo\.com|player\.vimeo\.com\/video)\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|showcase\/(\d+)\/video\/|)(\d+)/;
    const vimeoMatch = url.match(vimeoReg);
    if (vimeoMatch && vimeoMatch[4]) {
      const vimeoId = vimeoMatch[4];
      fetch(`https://vimeo.com/api/v2/video/${vimeoId}.json`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data[0] && data[0].thumbnail_large) {
            setThumb(data[0].thumbnail_large);
          }
        })
        .catch((err) => console.error("Error loading Vimeo thumbnail:", err));
    }
  }, [url]);

  if (thumb) {
    return (
      <img
        src={thumb}
        alt={title ?? "Video highlight"}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    );
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a]" />
  );
}

export function VideoSection({
  videos,
  setVideos,
  videoModalOpen,
  setVideoModalOpen,
  editingVideoIndex,
  setEditingVideoIndex,
  saving,
  saveVideos
}: {
  videos: VendorVideo[];
  setVideos: any;
  videoModalOpen: boolean;
  setVideoModalOpen: (v: boolean) => void;
  editingVideoIndex: number | null;
  setEditingVideoIndex: (v: number | null) => void;
  saving: boolean;
  saveVideos: () => void;
}) {
  return (
    <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30">
        <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2c2c2c]">Video Highlights</h2>
        <div className="mt-1 text-[12px] text-black/45">Embed videos from YouTube or Vimeo to show your business in action.</div>
      </div>

      <div className="p-6 grid gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v, idx) => (
            <div key={idx} className="relative aspect-video rounded-lg border border-black/[0.05] overflow-hidden bg-[#2c2c2c] group shadow-sm hover:shadow-lg transition-all duration-300">
              <VideoThumbnail url={v.video_url} title={v.title} />
              
              {/* Overlay with Play Button */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/40 transition-colors duration-300">
                <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-500 shadow-lg border border-white/20">
                  <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6 ml-1">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent p-4 flex flex-col justify-end">
                <div className="text-white text-[13px] font-bold truncate mb-3">{v.title}</div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingVideoIndex(idx);
                      setVideoModalOpen(true);
                    }}
                    className="flex-1 h-9 rounded-lg bg-white text-[12px] font-bold text-[#2c2c2c] hover:bg-[#fafafa] transition-colors shadow-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideos((rows: any[]) => rows.filter((_, i) => i !== idx))}
                    className="h-9 w-9 rounded-lg bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setEditingVideoIndex(null);
              setVideoModalOpen(true);
            }}
            className="aspect-video rounded-lg border-2 border-dashed border-black/[0.08] bg-[#fafafa]/50 hover:bg-[#a67c52]/5 hover:border-[#a67c52]/40 transition-all duration-300 flex flex-col items-center justify-center gap-2 group"
          >
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
              <span className="text-[28px] text-[#a67c52] font-light">+</span>
            </div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-black/40 group-hover:text-[#a67c52] transition-colors">Add Video</span>
          </button>
        </div>

        <div className="flex justify-end pt-4 border-t border-black/[0.03]">
          <button type="button" onClick={saveVideos} disabled={saving} className="h-11 px-8 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-[0_4px_12px_rgba(166,124,82,0.3)] hover:bg-[#8e6a46] hover:shadow-[0_6px_16px_rgba(166,124,82,0.4)] transition-all duration-300 disabled:opacity-60">
            <span className="inline-flex items-center gap-2">
              {saving ? <Spinner className="text-white/90" /> : null}
              <span>{saving ? "Saving Videos…" : "Save Video Highlights"}</span>
            </span>
          </button>
        </div>
      </div>

      <VideoModal
        key={videoModalOpen ? (editingVideoIndex !== null ? `video-${editingVideoIndex}` : "new-video") : "video-closed"}
        open={videoModalOpen}
        video={editingVideoIndex !== null ? videos[editingVideoIndex] : null}
        isNew={editingVideoIndex === null}
        onCancel={() => {
          setVideoModalOpen(false);
          setEditingVideoIndex(null);
        }}
        onSave={(video) => {
          if (editingVideoIndex !== null) {
            setVideos((rows: any[]) => rows.map((v, i) => (i === editingVideoIndex ? { ...v, ...video } : v)));
          } else {
            setVideos((rows: any[]) => [...rows, { id: Date.now(), ...video }]);
          }
          setVideoModalOpen(false);
          setEditingVideoIndex(null);
        }}
        onDelete={editingVideoIndex !== null ? () => {
          setVideos((rows: any[]) => rows.filter((_, i) => i !== editingVideoIndex));
          setVideoModalOpen(false);
          setEditingVideoIndex(null);
        } : undefined}
      />
    </section>
  );
}
