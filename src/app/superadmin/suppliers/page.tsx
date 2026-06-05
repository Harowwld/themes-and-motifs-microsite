"use client";

import React from "react";
import ImageCropperModal from "../ImageCropper";
import PhotoModal from "@/components/PhotoModal";
import { ImageUploadDropzone } from "@/components/ImageUploadDropzone";
import { proxiedImageUrl } from "@/lib/imageSizes";
import { toast } from "@/lib/toast";

import { useSuperadminSuppliers } from "./hooks/useSuperadminSuppliers";
import { VendorList } from "./components/VendorList";
import { VendorEditModal } from "./components/VendorEditModal";

export default function SuperadminVendorsPage() {
  const {
    loading,
    savingId,
    vendors,
    plans,
    query,
    setQuery,
    refresh,
    loadingMore,
    hasMore,
    loadMore,
    patchVendor,
    editingVendor,
    editModalOpen,
    editLoading,
    editForm,
    setEditForm,
    editSubscription,
    editImages,
    setEditImages,
    editVideos,
    setEditVideos,
    editSocials,
    setEditSocials,
    editAffiliations,
    setEditAffiliations,
    allAffiliations,
    affiliationInput,
    setAffiliationInput,
    editThemes,
    setEditThemes,
    allThemes,
    regions,
    cities,
    verificationDocuments,
    editPromos,
    promoForm,
    setPromoForm,
    editingPromoId,
    showPromoForm,
    setShowPromoForm,
    promoToDelete,
    setPromoToDelete,
    cropModalOpen,
    setCropModalOpen,
    croppingImageIdx,
    setCroppingImageIdx,
    logoModalOpen,
    setLogoModalOpen,
    logoUrlInput,
    setLogoUrlInput,
    photoModalOpen,
    setPhotoModalOpen,
    editingPhotoIndex,
    setEditingPhotoIndex,

    openEditModal,
    closeEditModal,
    saveVendorProfile,
    saveVendorImages,
    saveVendorVideos,
    saveSubscriptionDate,
    saveVendorSocials,
    saveVendorAffiliations,
    saveVendorThemes,
    saveAll,
    saveAllAndClose,
    resetPromoForm,
    startEditPromo,
    savePromo,
    confirmDeletePromo,
    togglePromoFeatured,
    handleCropSave,
  } = useSuperadminSuppliers();

  return (
    <div className="grid gap-6">
      <VendorList
        vendors={vendors}
        plans={plans}
        loading={loading}
        query={query}
        setQuery={setQuery}
        refresh={() => refresh()}
        patchVendor={patchVendor}
        savingId={savingId}
        openEditModal={openEditModal}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />

      <VendorEditModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        editingVendor={editingVendor}
        editLoading={editLoading}
        editForm={editForm}
        setEditForm={setEditForm}
        editSubscription={editSubscription}
        saveSubscriptionDate={saveSubscriptionDate}
        verificationDocuments={verificationDocuments}
        editImages={editImages}
        setEditImages={setEditImages}
        setEditingPhotoIndex={setEditingPhotoIndex}
        setPhotoModalOpen={setPhotoModalOpen}
        editVideos={editVideos}
        setEditVideos={setEditVideos}
        editSocials={editSocials}
        setEditSocials={setEditSocials}
        editAffiliations={editAffiliations}
        setEditAffiliations={setEditAffiliations}
        allAffiliations={allAffiliations}
        affiliationInput={affiliationInput}
        setAffiliationInput={setAffiliationInput}
        editThemes={editThemes}
        setEditThemes={setEditThemes}
        allThemes={allThemes}
        regions={regions}
        cities={cities}
        editPromos={editPromos}
        showPromoForm={showPromoForm}
        setShowPromoForm={setShowPromoForm}
        promoForm={promoForm}
        setPromoForm={setPromoForm}
        editingPromoId={editingPromoId}
        resetPromoForm={resetPromoForm}
        savePromo={savePromo}
        togglePromoFeatured={togglePromoFeatured}
        startEditPromo={startEditPromo}
        setPromoToDelete={setPromoToDelete}
        setLogoUrlInput={setLogoUrlInput}
        setLogoModalOpen={setLogoModalOpen}
        saveVendorProfile={saveVendorProfile}
        saveVendorImages={saveVendorImages}
        saveVendorVideos={saveVendorVideos}
        saveVendorSocials={saveVendorSocials}
        saveVendorAffiliations={saveVendorAffiliations}
        saveVendorThemes={saveVendorThemes}
        saveAll={saveAll}
        saveAllAndClose={saveAllAndClose}
      />

      {/* Supporting Modals */}
      {cropModalOpen && croppingImageIdx !== null && editImages[croppingImageIdx] && (
        <ImageCropperModal
          open={cropModalOpen}
          imageUrl={editImages[croppingImageIdx].image_url}
          initialFocusX={editImages[croppingImageIdx].focus_x ?? 50}
          initialFocusY={editImages[croppingImageIdx].focus_y ?? 50}
          initialZoom={editImages[croppingImageIdx].zoom ?? 1}
          onCancel={() => {
            setCropModalOpen(false);
            setCroppingImageIdx(null);
          }}
          onSave={handleCropSave}
        />
      )}

      {logoModalOpen && editingVendor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-[3px] border border-black/20 bg-white shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between">
              <div className="text-[14px] font-semibold text-[#2c2c2c]">Edit Logo</div>
              <button
                type="button"
                onClick={() => setLogoModalOpen(false)}
                className="h-7 w-7 rounded-[3px] bg-white/90 text-black/60 hover:text-[#b42318] flex items-center justify-center text-[16px] shadow-sm"
              >
                ×
              </button>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <div className="w-24 h-24 mx-auto rounded-[3px] border border-black/10 overflow-hidden bg-black/5 flex items-center justify-center">
                  {logoUrlInput ? (
                    <img src={proxiedImageUrl(logoUrlInput) ?? logoUrlInput} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-black/40">No logo</span>
                  )}
                </div>
              </div>

              <ImageUploadDropzone
                bucket="vendor-assets"
                folder="logos"
                entityId={String(editingVendor.id)}
                label="Upload Logo"
                description="JPG, PNG, WebP up to 2MB. Will be compressed if needed."
                onUploadComplete={(result) => {
                  setLogoUrlInput(result.url);
                }}
                onClear={() => setLogoUrlInput("")}
                existingUrl={logoUrlInput}
              />

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setLogoModalOpen(false)}
                  className="flex-1 h-10 rounded-[3px] border border-black/10 text-[13px] font-semibold text-black/70 hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditForm((f: any) => ({ ...f, logo_url: logoUrlInput }));
                    setLogoModalOpen(false);
                  }}
                  className="flex-1 h-10 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46]"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {promoToDelete ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-[6px] border border-black/20 bg-white shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-black/10">
              <div className="text-[14px] font-semibold text-[#2c2c2c]">Delete Promo</div>
              <div className="mt-1 text-[12px] text-black/55">
                Are you sure you want to delete this promo? This action cannot be undone.
              </div>
            </div>
            <div className="px-5 py-4 bg-[#fafafa]">
              {editPromos.find((p) => p.id === promoToDelete)?.title && (
                <div className="text-[13px] font-semibold text-[#2c2c2c]">
                  {editPromos.find((p) => p.id === promoToDelete)?.title}
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={editLoading}
                onClick={() => setPromoToDelete(null)}
                className="h-9 px-4 rounded-[6px] border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={editLoading}
                onClick={confirmDeletePromo}
                className="h-9 px-4 rounded-[6px] bg-[#b42318] text-white text-[12px] font-semibold hover:bg-[#9a1d14] disabled:opacity-60"
              >
                {editLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <PhotoModal
        open={photoModalOpen}
        photo={editingPhotoIndex !== null ? editImages[editingPhotoIndex] : null}
        isNew={editingPhotoIndex === null}
        onCancel={() => {
          setPhotoModalOpen(false);
          setEditingPhotoIndex(null);
        }}
        onSave={(photos) => {
          if (editingPhotoIndex !== null) {
            const photo = photos[0];
            const oldPhoto = editImages[editingPhotoIndex];
            const themeChanged = oldPhoto?.theme_id !== photo.theme_id;
            setEditImages((rows: any) => rows.map((r: any, i: number) => (i === editingPhotoIndex ? photo : r)));
            if (themeChanged) {
              toast.success("Photo theme updated! Remember to save the vendor details.");
            }
          } else {
            const newPhotosWithOrder = photos.map((p, idx) => ({
              ...p,
              display_order: editImages.length + idx + 1
            }));
            setEditImages((rows: any) => ensureSingleCover([...rows, ...newPhotosWithOrder]));
          }
          setPhotoModalOpen(false);
          setEditingPhotoIndex(null);
        }}
        onDelete={editingPhotoIndex !== null ? () => {
          setEditImages((rows: any) => rows.filter((_: any, i: number) => i !== editingPhotoIndex));
          setPhotoModalOpen(false);
          setEditingPhotoIndex(null);
        } : undefined}
      />
    </div>
  );
}

function ensureSingleCover<T extends { is_cover: boolean }>(rows: T[]) {
  let used = false;
  const normalized = rows.map((r) => {
    const v = Boolean((r as any).is_cover) && !used;
    if (v) used = true;
    return { ...r, is_cover: v };
  });
  if (!used && normalized.length > 0) {
    (normalized[0] as any).is_cover = true;
  }
  return normalized;
}
