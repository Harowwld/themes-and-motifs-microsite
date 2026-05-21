import React from "react";
import { Vendor, VerificationDocument, Promo, Theme, Affiliation, VendorImage, VendorVideo, VendorSocial } from "../hooks/useSuperadminVendors";
import { ProfileSection } from "./ProfileSection";
import { ContactSection } from "./ContactSection";
import { AdminContactSection } from "./AdminContactSection";
import { VerificationSection } from "./VerificationSection";
import { PhotosSection } from "./PhotosSection";
import { VideosSection } from "./VideosSection";
import { SocialLinksSection } from "./SocialLinksSection";
import { AffiliationsThemesSection } from "./AffiliationsThemesSection";
import { ProfessionalStatusSection } from "./ProfessionalStatusSection";
import { PromosSection } from "./PromosSection";

export function VendorEditModal({
  isOpen,
  onClose,
  editingVendor,
  editLoading,
  editForm,
  setEditForm,
  editSubscription,
  saveSubscriptionDate,
  verificationDocuments,
  editImages,
  setEditImages,
  setEditingPhotoIndex,
  setPhotoModalOpen,
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
  editPromos,
  showPromoForm,
  setShowPromoForm,
  promoForm,
  setPromoForm,
  editingPromoId,
  resetPromoForm,
  savePromo,
  togglePromoFeatured,
  startEditPromo,
  setPromoToDelete,
  setLogoUrlInput,
  setLogoModalOpen,
  saveVendorProfile,
  saveVendorImages,
  saveVendorVideos,
  saveVendorSocials,
  saveVendorAffiliations,
  saveVendorThemes,
  saveAll,
  saveAllAndClose
}: {
  isOpen: boolean;
  onClose: () => void;
  editingVendor: Vendor | null;
  editLoading: boolean;
  editForm: any;
  setEditForm: (v: any) => void;
  editSubscription: any;
  saveSubscriptionDate: (date: string | null, tin?: string | null) => void;
  verificationDocuments: VerificationDocument[];
  editImages: VendorImage[];
  setEditImages: (v: any) => void;
  setEditingPhotoIndex: (v: number | null) => void;
  setPhotoModalOpen: (v: boolean) => void;
  editVideos: VendorVideo[];
  setEditVideos: (v: any) => void;
  editSocials: VendorSocial[];
  setEditSocials: (v: any) => void;
  editAffiliations: Affiliation[];
  setEditAffiliations: (v: any) => void;
  allAffiliations: Affiliation[];
  affiliationInput: string;
  setAffiliationInput: (v: string) => void;
  editThemes: Theme[];
  setEditThemes: (v: any) => void;
  allThemes: Theme[];
  editPromos: Promo[];
  showPromoForm: boolean;
  setShowPromoForm: (v: boolean) => void;
  promoForm: any;
  setPromoForm: (v: any) => void;
  editingPromoId: number | null;
  resetPromoForm: () => void;
  savePromo: () => void;
  togglePromoFeatured: (p: Promo) => void;
  startEditPromo: (p: Promo) => void;
  setPromoToDelete: (v: number | null) => void;
  setLogoUrlInput: (v: string) => void;
  setLogoModalOpen: (v: boolean) => void;
  saveVendorProfile: (silent?: boolean) => Promise<boolean>;
  saveVendorImages: (silent?: boolean) => Promise<boolean>;
  saveVendorVideos: (silent?: boolean) => Promise<boolean>;
  saveVendorSocials: (silent?: boolean) => Promise<boolean>;
  saveVendorAffiliations: (silent?: boolean) => Promise<boolean>;
  saveVendorThemes: (silent?: boolean) => Promise<boolean>;
  saveAll: (closeAfter?: boolean) => Promise<boolean>;
  saveAllAndClose: () => Promise<void>;
}) {
  if (!isOpen || !editingVendor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-[3px] border border-black/10 bg-white shadow-lg my-8 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
          <div>
            <div className="text-[14px] font-semibold text-[#2c2c2c]">Edit Vendor</div>
            <div className="text-[12px] text-black/45">{editingVendor.business_name}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-[3px] bg-white/90 text-black/60 hover:text-[#b42318] flex items-center justify-center text-[18px] shadow-sm"
          >
            ×
          </button>
        </div>

        <div className="p-4 grid gap-6 flex-1 overflow-y-auto overflow-x-hidden">
          {editLoading && <div className="text-[13px] text-black/60">Loading…</div>}

          <PhotosSection 
            editImages={editImages} 
            setEditImages={setEditImages} 
            setEditingPhotoIndex={setEditingPhotoIndex} 
            setPhotoModalOpen={setPhotoModalOpen} 
          />
          <PromosSection 
            editPromos={editPromos} 
            showPromoForm={showPromoForm} 
            setShowPromoForm={setShowPromoForm} 
            promoForm={promoForm} 
            setPromoForm={setPromoForm} 
            editingPromoId={editingPromoId} 
            resetPromoForm={resetPromoForm} 
            savePromo={savePromo} 
            editLoading={editLoading} 
            togglePromoFeatured={togglePromoFeatured} 
            startEditPromo={startEditPromo} 
            setPromoToDelete={setPromoToDelete} 
            editingVendorId={editingVendor.id} 
          />
          <ProfileSection editForm={editForm} setEditForm={setEditForm} />
          <ContactSection editForm={editForm} setEditForm={setEditForm} setLogoUrlInput={setLogoUrlInput} setLogoModalOpen={setLogoModalOpen} />
          <AdminContactSection editForm={editForm} setEditForm={setEditForm} />
          <VerificationSection 
            editForm={editForm} 
            setEditForm={setEditForm} 
            editSubscription={editSubscription} 
            saveSubscriptionDate={saveSubscriptionDate} 
            verificationDocuments={verificationDocuments} 
          />
          <VideosSection editVideos={editVideos} setEditVideos={setEditVideos} />
          <SocialLinksSection editSocials={editSocials} setEditSocials={setEditSocials} />
          <AffiliationsThemesSection 
            editAffiliations={editAffiliations} 
            setEditAffiliations={setEditAffiliations} 
            allAffiliations={allAffiliations} 
            affiliationInput={affiliationInput} 
            setAffiliationInput={setAffiliationInput} 
            editThemes={editThemes} 
            setEditThemes={setEditThemes} 
            allThemes={allThemes} 
          />
          <ProfessionalStatusSection editForm={editForm} setEditForm={setEditForm} />
        </div>

        <div className="px-4 py-3 border-t border-black/5 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-[3px] border border-black/10 text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                await saveAll(false);
              }}
              disabled={editLoading}
              className="h-10 px-4 rounded-[3px] border border-[#a67c52] text-[13px] font-semibold text-[#a67c52] hover:bg-[#a67c52]/5 transition-colors disabled:opacity-60"
            >
              {editLoading ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={saveAllAndClose}
              disabled={editLoading}
              className="h-10 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
            >
              {editLoading ? "Saving…" : "Save & Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
