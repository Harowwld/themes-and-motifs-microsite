import React, { useState } from "react";
import { proxiedImageUrl } from "@/lib/imageSizes";
import { VendorImage, Album, AlbumPhoto } from "../hooks/useSuperadminSuppliers";
import { toast } from "@/lib/toast";
import { AlbumSection } from "@/app/vendor/dashboard/components/AlbumSection";

export function PhotosSection({
  editImages,
  setEditImages,
  setEditingPhotoIndex,
  setPhotoModalOpen,
  allThemes,
  editThemes,
  setEditThemes,
  editAlbums,
  setEditAlbums,
  editAlbumPhotos,
  setEditAlbumPhotos,
  createAlbum,
  deleteAlbum,
  renameAlbum,
  loadAlbumPhotos,
  saveAlbumPhotos
}: {
  editImages: VendorImage[];
  setEditImages: (v: any) => void;
  setEditingPhotoIndex: (v: number | null) => void;
  setPhotoModalOpen: (v: boolean) => void;
  allThemes?: {id: number; name: string}[];
  editThemes?: any[];
  setEditThemes?: (v: any) => void;
  editAlbums: Album[];
  setEditAlbums: (v: any) => void;
  editAlbumPhotos: AlbumPhoto[];
  setEditAlbumPhotos: (v: any) => void;
  createAlbum: (title: string, theme_id?: number) => Promise<void>;
  deleteAlbum: (id: number) => Promise<void>;
  renameAlbum: (id: number, title: string, theme_id?: number) => Promise<void>;
  loadAlbumPhotos: (id: number) => Promise<void>;
  saveAlbumPhotos: (id: number, urls: string[]) => Promise<boolean>;
}) {
  const [subTab, setSubTab] = useState<"photos" | "albums">("photos");

  // Local state for modals to support AlbumSection
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumEditorOpen, setAlbumEditorOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState<any>(null);
  const [deleteAlbumModalOpen, setDeleteAlbumModalOpen] = useState(false);
  const [albumTitle, setAlbumTitle] = useState("");
  const [renameAlbumModalOpen, setRenameAlbumModalOpen] = useState(false);
  const [albumToRename, setAlbumToRename] = useState<Album | null>(null);
  const [renameAlbumTitle, setRenameAlbumTitle] = useState("");
  const [renameAlbumThemeId, setRenameAlbumThemeId] = useState<number | undefined>(undefined);
  const [createAlbumThemeId, setCreateAlbumThemeId] = useState<number | undefined>(undefined);

  return (
    <section className="grid gap-4">
      <div className="flex bg-[#fcfbf9] border border-black/5 p-1 rounded-[6px] w-fit">
        <button
          onClick={() => setSubTab("photos")}
          className={`px-4 py-1.5 text-[13px] font-medium rounded-[4px] transition-all ${
            subTab === "photos" 
              ? "bg-white text-black shadow-sm border border-black/[0.04]" 
              : "text-black/50 hover:text-black/80"
          }`}
        >
          All Photos
        </button>
        <button
          onClick={() => setSubTab("albums")}
          className={`px-4 py-1.5 text-[13px] font-medium rounded-[4px] transition-all ${
            subTab === "albums" 
              ? "bg-white text-black shadow-sm border border-black/[0.04]" 
              : "text-black/50 hover:text-black/80"
          }`}
        >
          Albums
        </button>
      </div>

      {subTab === "photos" && (
        <>
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
                    {editThemes?.map(t => (
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
        </>
      )}

      {subTab === "albums" && (
        <AlbumSection
          albums={editAlbums}
          setAlbumModalOpen={setAlbumModalOpen}
          setSelectedAlbum={setSelectedAlbum}
          setAlbumEditorOpen={setAlbumEditorOpen}
          loadAlbumPhotos={loadAlbumPhotos}
          setAlbumToDelete={setAlbumToDelete}
          setDeleteAlbumModalOpen={setDeleteAlbumModalOpen}
          albumModalOpen={albumModalOpen}
          albumTitle={albumTitle}
          setAlbumTitle={setAlbumTitle}
          saving={false}
          createAlbum={() => {
            if (!albumTitle.trim()) { toast.error("Album title is required"); return; }
            createAlbum(albumTitle.trim(), createAlbumThemeId);
            setAlbumModalOpen(false);
            setAlbumTitle("");
            setCreateAlbumThemeId(undefined);
          }}
          albumEditorOpen={albumEditorOpen}
          selectedAlbum={selectedAlbum}
          setAlbumEditorOpenState={setAlbumEditorOpen}
          albumPhotos={editAlbumPhotos}
          images={editImages}
          saveAlbumPhotos={saveAlbumPhotos}
          deleteAlbumModalOpen={deleteAlbumModalOpen}
          albumToDelete={albumToDelete}
          setDeleteAlbumModalOpenState={setDeleteAlbumModalOpen}
          deleteAlbum={(id) => {
            deleteAlbum(id);
            setDeleteAlbumModalOpen(false);
          }}
          renameAlbumModalOpen={renameAlbumModalOpen}
          albumToRename={albumToRename}
          renameAlbumTitle={renameAlbumTitle}
          setRenameAlbumModalOpen={setRenameAlbumModalOpen}
          setAlbumToRename={setAlbumToRename}
          setRenameAlbumTitle={setRenameAlbumTitle}
          renameAlbum={(directId, directTitle, directThemeId) => {
            if (directId && directTitle) {
              renameAlbum(directId, directTitle, directThemeId ?? undefined);
            } else if (albumToRename && renameAlbumTitle.trim()) {
              renameAlbum(albumToRename.id, renameAlbumTitle.trim(), renameAlbumThemeId);
              setRenameAlbumModalOpen(false);
              setAlbumToRename(null);
              setRenameAlbumTitle("");
              setRenameAlbumThemeId(undefined);
            }
          }}
          isMerged={true}
          availableThemes={editThemes}
          createAlbumThemeId={createAlbumThemeId}
          setCreateAlbumThemeId={setCreateAlbumThemeId}
          renameAlbumThemeId={renameAlbumThemeId}
          setRenameAlbumThemeId={setRenameAlbumThemeId}
        />
      )}

      {editThemes && setEditThemes && allThemes && (
        <section className="grid gap-4 mt-8 pt-6 border-t border-black/5">
          <div className="text-[13px] font-semibold text-[#2c2c2c] border-b border-black/5 pb-2">
            Specializes In
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
                      if (editThemes.length >= 10) {
                        toast.error("You can only select up to 10 themes.");
                        return;
                      }
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
