import React from "react";
import { Spinner } from "./DashboardSections";
import { PhotoModal } from "./DashboardModals";
import { ensureSingleCover } from "../utils";
import { AlbumSection } from "./AlbumSection";
import { Album, AlbumPhoto } from "../types";

export function PhotoSection({
  images,
  setImages,
  photoModalOpen,
  setPhotoModalOpen,
  editingPhotoIndex,
  setEditingPhotoIndex,
  saving,
  saveImages,

  // Album properties
  albums,
  setAlbumModalOpen,
  setSelectedAlbum,
  setAlbumEditorOpen,
  loadAlbumPhotos,
  setAlbumToDelete,
  setDeleteAlbumModalOpen,
  albumModalOpen,
  albumTitle,
  setAlbumTitle,
  createAlbum,
  albumEditorOpen,
  selectedAlbum,
  albumPhotos,
  saveAlbumPhotos,
  deleteAlbumModalOpen,
  albumToDelete,
  deleteAlbum,
  renameAlbumModalOpen,
  albumToRename,
  renameAlbumTitle,
  setRenameAlbumModalOpen,
  setAlbumToRename,
  setRenameAlbumTitle,
  renameAlbum,
  themes
}: {
  images: any[];
  setImages: any;
  photoModalOpen: boolean;
  setPhotoModalOpen: (v: boolean) => void;
  editingPhotoIndex: number | null;
  setEditingPhotoIndex: (v: number | null) => void;
  saving: boolean;
  saveImages: (customImages?: any[]) => void;

  // Album types
  albums: Album[];
  setAlbumModalOpen: (v: boolean) => void;
  setSelectedAlbum: (v: Album | null) => void;
  setAlbumEditorOpen: (v: boolean) => void;
  loadAlbumPhotos: (id: number) => void;
  setAlbumToDelete: (v: any) => void;
  setDeleteAlbumModalOpen: (v: boolean) => void;
  albumModalOpen: boolean;
  albumTitle: string;
  setAlbumTitle: (v: string) => void;
  createAlbum: () => void;
  albumEditorOpen: boolean;
  selectedAlbum: Album | null;
  albumPhotos: AlbumPhoto[];
  saveAlbumPhotos: (id: number, urls: string[]) => Promise<boolean>;
  deleteAlbumModalOpen: boolean;
  albumToDelete: any;
  deleteAlbum: (id: number) => void;
  renameAlbumModalOpen: boolean;
  albumToRename: Album | null;
  renameAlbumTitle: string;
  setRenameAlbumModalOpen: (v: boolean) => void;
  setAlbumToRename: (v: Album | null) => void;
  setRenameAlbumTitle: (v: string) => void;
  renameAlbum: () => void;
  themes?: {id: number, name: string}[];
}) {
  const [subTab, setSubTab] = React.useState<"photos" | "albums">("photos");

  return (
    <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      {/* Unified Tab Header */}
      <div className="px-6 pt-5 border-b border-black/[0.04] bg-[#fafafa]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2c2c2c]">Photo Portfolio</h2>
          <div className="mt-1 text-[12px] text-black/45">Showcase your masterpiece collections and albums.</div>
        </div>
        
        {/* Inner sub-tabs */}
        <div className="flex gap-4 text-[12px] font-bold">
          <button
            type="button"
            onClick={() => setSubTab("photos")}
            className={`px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
              subTab === "photos"
                ? "bg-[#a67c52] text-white shadow-sm"
                : "bg-white border border-black/[0.06] text-neutral-500 hover:bg-[#fafafa]"
            }`}
          >
            All Photos ({images.filter(img => img.image_url?.trim()).length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab("albums")}
            className={`px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
              subTab === "albums"
                ? "bg-[#a67c52] text-white shadow-sm"
                : "bg-white border border-black/[0.06] text-neutral-500 hover:bg-[#fafafa]"
            }`}
          >
            Photo Albums ({albums.length})
          </button>
        </div>
      </div>

      <div className="p-6">
        {subTab === "photos" ? (
          <div className="grid gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images
                .map((img, originalIdx) => ({ img, originalIdx }))
                .filter(({ img }) => img.image_url?.trim())
                .map(({ img, originalIdx }) => (
                  <div key={originalIdx} className="relative aspect-square rounded-lg border border-black/[0.05] overflow-hidden bg-[#fafafa] group shadow-sm hover:shadow-md transition-all duration-300">
                    <img src={img.image_url} alt={img.caption || `Photo ${originalIdx + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    
                    {img.is_cover && (
                      <div className="absolute top-3 left-3 rounded-lg bg-[#a67c52] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-lg z-10">
                        Cover
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 gap-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPhotoIndex(originalIdx);
                            setPhotoModalOpen(true);
                          }}
                          className="flex-1 h-8 rounded-lg bg-white text-[11px] font-bold text-[#2c2c2c] shadow-sm hover:bg-[#fafafa] transition-colors"
                        >
                          Edit
                        </button>
                        {!img.is_cover && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = ensureSingleCover(images.map((r, i) => ({ ...r, is_cover: i === originalIdx })));
                              setImages(next);
                              void saveImages(next);
                            }}
                            className="flex-1 h-8 rounded-lg bg-[#a67c52] text-[11px] font-bold text-white shadow-sm hover:bg-[#8e6a46] transition-colors"
                          >
                            Cover
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setImages((rows: any[]) => ensureSingleCover(rows.filter((_, i) => i !== originalIdx)))}
                      className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 text-black/40 hover:text-red-500 hover:bg-white flex items-center justify-center text-[18px] shadow-sm transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-[-4px] group-hover:translate-y-0"
                    >
                      ×
                    </button>
                  </div>
                ))}
              <button
                type="button"
                onClick={() => {
                  setEditingPhotoIndex(null);
                  setPhotoModalOpen(true);
                }}
                className="aspect-square rounded-lg border-2 border-dashed border-black/[0.08] bg-[#fafafa]/50 hover:bg-[#a67c52]/5 hover:border-[#a67c52]/40 transition-all duration-300 flex flex-col items-center justify-center gap-2 group"
              >
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <span className="text-[24px] text-[#a67c52] font-light">+</span>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-black/40 group-hover:text-[#a67c52] transition-colors">Add Photos</span>
              </button>
            </div>

            <div className="flex justify-end pt-4 border-t border-black/[0.03]">
              <button type="button" onClick={() => saveImages()} disabled={saving} className="h-11 px-8 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-[0_4px_12px_rgba(166,124,82,0.3)] hover:bg-[#8e6a46] hover:shadow-[0_6px_16px_rgba(166,124,82,0.4)] transition-all duration-300 disabled:opacity-60">
                <span className="inline-flex items-center gap-2">
                  {saving ? <Spinner className="text-white/90" /> : null}
                  <span>{saving ? "Saving Portfolio…" : "Save Photo Changes"}</span>
                </span>
              </button>
            </div>

            <PhotoModal
              open={photoModalOpen}
              photo={editingPhotoIndex !== null ? images[editingPhotoIndex] : null}
              isNew={editingPhotoIndex === null}
              onCancel={() => {
                setPhotoModalOpen(false);
                setEditingPhotoIndex(null);
              }}
              onSave={(photos) => {
                if (editingPhotoIndex !== null) {
                  const photo = photos[0];
                  setImages((rows: any[]) => rows.map((r, i) => (i === editingPhotoIndex ? photo : r)));
                } else {
                  const newPhotosWithOrder = photos.map((p, idx) => ({
                    ...p,
                    display_order: images.length + idx + 1
                  }));
                  setImages((rows: any[]) => ensureSingleCover([...rows, ...newPhotosWithOrder]));
                }
                setPhotoModalOpen(false);
                setEditingPhotoIndex(null);
              }}
              onDelete={editingPhotoIndex !== null ? () => {
                setImages((rows: any[]) => ensureSingleCover(rows.filter((_, i) => i !== editingPhotoIndex)));
                setPhotoModalOpen(false);
                setEditingPhotoIndex(null);
              } : undefined}
              themes={themes}
            />
          </div>
        ) : (
          <AlbumSection
            isMerged={true}
            albums={albums}
            setAlbumModalOpen={setAlbumModalOpen}
            setSelectedAlbum={setSelectedAlbum}
            setAlbumEditorOpen={setAlbumEditorOpen}
            loadAlbumPhotos={loadAlbumPhotos}
            setAlbumToDelete={setAlbumToDelete}
            setDeleteAlbumModalOpen={setDeleteAlbumModalOpen}
            albumModalOpen={albumModalOpen}
            albumTitle={albumTitle}
            setAlbumTitle={setAlbumTitle}
            saving={saving}
            createAlbum={createAlbum}
            albumEditorOpen={albumEditorOpen}
            selectedAlbum={selectedAlbum}
            setAlbumEditorOpenState={setAlbumEditorOpen}
            albumPhotos={albumPhotos}
            images={images}
            saveAlbumPhotos={saveAlbumPhotos}
            deleteAlbumModalOpen={deleteAlbumModalOpen}
            albumToDelete={albumToDelete}
            setDeleteAlbumModalOpenState={setDeleteAlbumModalOpen}
            deleteAlbum={deleteAlbum}
            renameAlbumModalOpen={renameAlbumModalOpen}
            albumToRename={albumToRename}
            renameAlbumTitle={renameAlbumTitle}
            setRenameAlbumModalOpen={setRenameAlbumModalOpen}
            setAlbumToRename={setAlbumToRename}
            setRenameAlbumTitle={setRenameAlbumTitle}
            renameAlbum={renameAlbum}
          />
        )}
      </div>
    </section>
  );
}
