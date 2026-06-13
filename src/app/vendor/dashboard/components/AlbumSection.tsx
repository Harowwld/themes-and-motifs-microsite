import React from "react";
import { Album, AlbumPhoto } from "../types";

export function AlbumSection({
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
  saving,
  createAlbum,
  albumEditorOpen,
  selectedAlbum,
  setAlbumEditorOpenState,
  albumPhotos,
  images,
  saveAlbumPhotos,
  deleteAlbumModalOpen,
  albumToDelete,
  setDeleteAlbumModalOpenState,
  deleteAlbum,
  renameAlbumModalOpen,
  albumToRename,
  renameAlbumTitle,
  setRenameAlbumModalOpen,
  setAlbumToRename,
  setRenameAlbumTitle,
  renameAlbum,
  isMerged = false,
  availableThemes,
  createAlbumThemeId,
  setCreateAlbumThemeId,
  renameAlbumThemeId,
  setRenameAlbumThemeId,
}: {
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
  saving: boolean;
  createAlbum: () => void;
  albumEditorOpen: boolean;
  selectedAlbum: Album | null;
  setAlbumEditorOpenState: (v: boolean) => void;
  albumPhotos: AlbumPhoto[];
  images: any[];
  saveAlbumPhotos: (id: number, urls: string[]) => Promise<boolean>;
  deleteAlbumModalOpen: boolean;
  albumToDelete: any;
  setDeleteAlbumModalOpenState: (v: boolean) => void;
  deleteAlbum: (id: number) => void;
  renameAlbumModalOpen: boolean;
  albumToRename: Album | null;
  renameAlbumTitle: string;
  setRenameAlbumModalOpen: (v: boolean) => void;
  setAlbumToRename: (v: Album | null) => void;
  setRenameAlbumTitle: (v: string) => void;
  renameAlbum: (directId?: number, directTitle?: string, directThemeId?: number | null) => void;
  isMerged?: boolean;
  availableThemes?: {id: number; name: string}[];
  createAlbumThemeId?: number;
  setCreateAlbumThemeId?: (id: number | undefined) => void;
  renameAlbumThemeId?: number;
  setRenameAlbumThemeId?: (id: number | undefined) => void;
}) {
  const [localPhotos, setLocalPhotos] = React.useState<AlbumPhoto[]>([]);

  React.useEffect(() => {
    if (albumEditorOpen) {
      setLocalPhotos(albumPhotos);
    }
  }, [albumPhotos, albumEditorOpen]);

  const renderContent = () => (
    <div className={isMerged ? "" : "p-6"}>
      {albums.length === 0 ? (
        <div className="rounded-lg border border-dashed border-black/[0.08] bg-[#fafafa]/50 p-8 text-center">
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#a67c52" strokeWidth="2" className="h-6 w-6">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <div className="text-[14px] font-semibold text-black/60 mb-1">No albums yet</div>
          <div className="text-[12px] text-black/40">Create your first album to organize your photos.</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {albums.map((album) => (
            <div key={album.id} className="rounded-lg border border-black/[0.04] bg-[#fafafa]/30 p-4 flex items-center justify-between transition-all duration-300 hover:bg-white hover:shadow-md hover:border-black/[0.08]">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-[#a67c52]/10 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#a67c52" strokeWidth="2" className="h-6 w-6">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[14px] font-bold text-[#2c2c2c]">{album.title}</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <div className="text-[11px] font-bold text-black/30 uppercase tracking-wider">{album.photo_count} photo{album.photo_count !== 1 ? "s" : ""}</div>
                    {availableThemes && availableThemes.length > 0 && (
                      <select
                        className="h-6 rounded border border-black/10 bg-[#fafafa] px-1 text-[10px] font-bold text-[#a67c52] outline-none cursor-pointer hover:bg-white transition-colors"
                        value={album.theme_id || ""}
                        onChange={(e) => {
                          const newThemeId = e.target.value ? Number(e.target.value) : null;
                          renameAlbum(album.id, album.title, newThemeId);
                        }}
                      >
                        <option value="">No Theme</option>
                        {availableThemes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAlbum(album);
                    setAlbumEditorOpen(true);
                    loadAlbumPhotos(album.id);
                  }}
                  className="h-9 px-4 rounded-lg bg-white border border-black/[0.08] text-[12px] font-bold text-[#6e4f33] hover:bg-[#fafafa] transition-all duration-300 shadow-sm"
                >
                  Manage
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAlbumToRename(album);
                    setRenameAlbumTitle(album.title);
                    if (setRenameAlbumThemeId) {
                      setRenameAlbumThemeId(album.theme_id || undefined);
                    }
                    setRenameAlbumModalOpen(true);
                  }}
                  className="h-9 px-4 rounded-lg bg-white border border-black/[0.08] text-[12px] font-bold text-[#6e4f33] hover:bg-[#fafafa] transition-all duration-300 shadow-sm"
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAlbumToDelete({ id: album.id, title: album.title });
                    setDeleteAlbumModalOpen(true);
                  }}
                  className="h-9 w-9 rounded-lg border border-red-100 bg-white text-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 flex items-center justify-center shadow-sm"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {isMerged ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.03]">
            <div>
              <h3 className="font-serif text-[16px] font-bold text-[#2c2c2c]">Photo Albums</h3>
              <div className="text-[11px] text-black/45">Organize your portfolio into curated public albums.</div>
            </div>
            <button
              type="button"
              onClick={() => setAlbumModalOpen(true)}
              className="h-9 px-4 rounded-lg border border-[#a67c52]/30 bg-white text-[12px] font-bold text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm"
            >
              + Create Album
            </button>
          </div>
          {renderContent()}
        </div>
      ) : (
        <section className="rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]/30 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2c2c2c]">Portfolio Albums</h2>
              <div className="mt-1 text-[12px] text-black/45">Organize your portfolio into curated public albums.</div>
            </div>
            <button
              type="button"
              onClick={() => setAlbumModalOpen(true)}
              className="h-10 px-5 rounded-lg border border-[#a67c52]/30 bg-white text-[13px] font-bold text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm"
            >
              + Create Album
            </button>
          </div>
          {renderContent()}
        </section>
      )}

      {/* Create Album Modal */}
      {albumModalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setAlbumModalOpen(false)} />
          <div className="relative w-full max-w-sm rounded-lg bg-white shadow-2xl overflow-hidden transform transition-all">
            <div className="px-8 py-6 border-b border-black/[0.04] bg-[#fafafa]/30">
              <h2 className="font-serif text-[18px] font-bold text-[#2c2c2c]">Create New Album</h2>
              <p className="mt-1 text-[12px] text-black/45">
                Give your collection a meaningful title.
              </p>
            </div>
            <div className="px-8 py-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a67c52]">Album Title</label>
                <input
                  type="text"
                  className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  placeholder="e.g. Dream Weddings 2024"
                  autoFocus
                />
              </div>

              {availableThemes && availableThemes.length > 0 && setCreateAlbumThemeId && (
                <div className="flex flex-col gap-1.5 mt-4">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a67c52]">Theme (Specializes In)</label>
                  <select
                    className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
                    value={createAlbumThemeId || ""}
                    onChange={(e) => setCreateAlbumThemeId(e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">No Theme</option>
                    {availableThemes.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="px-8 py-6 border-t border-black/[0.04] flex items-center justify-end gap-3 bg-[#fafafa]/10">
              <button
                type="button"
                disabled={saving}
                onClick={() => setAlbumModalOpen(false)}
                className="h-11 px-6 rounded-lg text-[13px] font-bold text-black/40 hover:text-black/60 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || !albumTitle.trim()}
                onClick={createAlbum}
                className="h-11 px-8 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-lg shadow-[#a67c52]/20 hover:bg-[#8e6a46] hover:shadow-xl transition-all duration-300 disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create Album"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Album Editor Modal */}
      {albumEditorOpen && selectedAlbum ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setAlbumEditorOpenState(false)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] rounded-lg bg-white shadow-2xl overflow-hidden flex flex-col transform transition-all">
            <div className="px-8 py-6 border-b border-black/[0.04] bg-[#fafafa]/30 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-[20px] font-bold text-[#2c2c2c]">{selectedAlbum.title}</h2>
                <p className="mt-1 text-[12px] text-black/45">
                  Select the masterpieces for this collection.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAlbumEditorOpenState(false)}
                className="h-10 w-10 rounded-full bg-white border border-black/[0.08] text-black/40 hover:text-red-500 hover:border-red-100 transition-all duration-300 flex items-center justify-center shadow-sm"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid gap-8">
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a67c52] mb-4">Available Masterpieces</h3>
                  <div className="grid gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {images.filter(img => img.image_url.trim()).map((img, idx) => {
                      const isInAlbum = localPhotos.some(ap => ap.image_url === img.image_url);
                      return (
                        <label key={idx} className={`flex items-center gap-4 p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                          isInAlbum 
                            ? "bg-[#a67c52]/5 border-[#a67c52]/20 shadow-sm" 
                            : "bg-white border-black/[0.04] hover:border-black/[0.1] hover:bg-[#fafafa]"
                        }`}>
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={isInAlbum}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setLocalPhotos([...localPhotos, { id: -Date.now() - idx, image_url: img.image_url, display_order: localPhotos.length }]);
                                } else {
                                  setLocalPhotos(localPhotos.filter(ap => ap.image_url !== img.image_url));
                                }
                              }}
                              className="h-5 w-5 rounded-md border-black/20 text-[#a67c52] focus:ring-[#a67c52]/20 transition-all"
                            />
                          </div>
                          <div className="h-14 w-14 rounded-lg border border-black/[0.05] overflow-hidden flex-shrink-0 shadow-sm">
                            <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-[13px] font-bold truncate transition-colors ${isInAlbum ? "text-[#a67c52]" : "text-[#2c2c2c]"}`}>
                              {img.caption || "Untitled Work"}
                            </div>
                            <div className="text-[11px] text-black/30 truncate">Source: {img.image_url.split('/').pop()}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a67c52]">Album Layout ({localPhotos.length})</h3>
                  </div>
                  {localPhotos.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-black/[0.04] bg-[#fafafa]/30 p-8 text-center">
                      <p className="text-[13px] text-black/40 italic">The collection is currently empty. Select photos from above to curate your album.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                      {localPhotos.map((photo) => (
                        <div key={photo.id} className="relative group aspect-square">
                          <div className="h-full w-full rounded-lg border border-black/[0.05] bg-white overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                            <img src={photo.image_url} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setLocalPhotos(localPhotos.filter(ap => ap.image_url !== photo.image_url));
                            }}
                            className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-red-500 text-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-8 py-6 border-t border-black/[0.04] bg-[#fafafa]/20 flex items-center justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  const success = await saveAlbumPhotos(selectedAlbum.id, localPhotos.map(ap => ap.image_url));
                  if (success) {
                    setAlbumEditorOpenState(false);
                  }
                }}
                className="h-11 px-10 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-lg shadow-[#a67c52]/20 hover:bg-[#8e6a46] hover:shadow-xl transition-all duration-300 disabled:opacity-60 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving Curation...</span>
                  </>
                ) : (
                  "Confirm Curation"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Rename Album Modal */}
      {renameAlbumModalOpen && albumToRename ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setRenameAlbumModalOpen(false)} />
          <div className="relative w-full max-w-sm rounded-lg bg-white shadow-2xl overflow-hidden transform transition-all">
            <div className="px-8 py-6 border-b border-black/[0.04] bg-[#fafafa]/30">
              <h2 className="font-serif text-[18px] font-bold text-[#2c2c2c]">Edit Album Details</h2>
              <p className="mt-1 text-[12px] text-black/45">
                Update the title and theme of your collection.
              </p>
            </div>
            <div className="px-8 py-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a67c52]">New Title</label>
                <input
                  type="text"
                  className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
                  value={renameAlbumTitle}
                  onChange={(e) => setRenameAlbumTitle(e.target.value)}
                  placeholder="e.g. Dream Weddings 2024"
                  autoFocus
                />
              </div>

              {availableThemes && availableThemes.length > 0 && setRenameAlbumThemeId && (
                <div className="flex flex-col gap-1.5 mt-4">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a67c52]">Theme (Specializes In)</label>
                  <select
                    className="h-11 w-full rounded-lg border border-black/[0.08] bg-[#fafafa]/50 px-4 text-[14px] outline-none focus:border-[#a67c52] focus:bg-white focus:ring-4 focus:ring-[#a67c52]/10 transition-all duration-200"
                    value={renameAlbumThemeId || ""}
                    onChange={(e) => setRenameAlbumThemeId(e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">No Theme</option>
                    {availableThemes.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="px-8 py-6 border-t border-black/[0.04] flex items-center justify-end gap-3 bg-[#fafafa]/10">
              <button
                type="button"
                disabled={saving}
                onClick={() => setRenameAlbumModalOpen(false)}
                className="h-11 px-6 rounded-lg text-[13px] font-bold text-black/40 hover:text-black/60 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || !renameAlbumTitle.trim()}
                onClick={() => renameAlbum()}
                className="h-11 px-8 rounded-lg bg-[#a67c52] text-white text-[14px] font-bold shadow-lg shadow-[#a67c52]/20 hover:bg-[#8e6a46] hover:shadow-xl transition-all duration-300 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Album Modal */}
      {deleteAlbumModalOpen && albumToDelete ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteAlbumModalOpenState(false)} />
          <div className="relative w-full max-w-sm rounded-lg bg-white shadow-2xl overflow-hidden transform transition-all">
            <div className="px-8 py-6 border-b border-black/[0.04] bg-red-50/30">
              <h2 className="text-[18px] font-bold text-red-600">Delete Collection</h2>
              <p className="mt-1 text-[12px] text-red-600/60 leading-relaxed">
                This will permanently remove the album. Photos inside will not be deleted from your main portfolio.
              </p>
            </div>
            <div className="px-8 py-6">
              <div className="p-4 rounded-lg border border-black/[0.04] bg-[#fafafa]/50">
                <div className="text-[13px] font-bold text-[#2c2c2c]">{albumToDelete.title}</div>
                <div className="mt-1 text-[11px] font-bold text-black/30 uppercase tracking-widest">Permanent Deletion</div>
              </div>
            </div>
            <div className="px-8 py-6 border-t border-black/[0.04] flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => setDeleteAlbumModalOpenState(false)}
                className="h-11 px-6 rounded-lg text-[13px] font-bold text-black/40 hover:text-black/60 transition-all duration-300"
              >
                Keep Album
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => deleteAlbum(albumToDelete.id)}
                className="h-11 px-8 rounded-lg bg-red-500 text-white text-[14px] font-bold shadow-lg shadow-red-200/50 hover:bg-red-600 hover:shadow-xl transition-all duration-300 disabled:opacity-60"
              >
                {saving ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
