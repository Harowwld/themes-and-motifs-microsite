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
  const [activeTab, setActiveTab] = React.useState("profile");
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  if (!isOpen || !editingVendor) return null;

  const TABS = [
    { id: "profile", label: "Profile" },
    { id: "photos", label: "Photos" },
    { id: "videos", label: "Videos" },
    { id: "promos", label: "Promos" },
    { id: "contact", label: "Contact Details" },
    { id: "socials", label: "Social Links" },
    { id: "themes", label: "Themes & Affiliations" },
    { id: "professional", label: "Professional Status" },
    { id: "verification", label: "Verification Docs" },
    { id: "admin_contact", label: "Admin Contact" },
  ];

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
            className="h-8 w-8 rounded-[3px] bg-white/90 text-black/60 hover:text-[#b42318] flex items-center justify-center text-[18px] shadow-sm cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Swipe-scrollable Tab Bar */}
        <div className="relative border-b border-black/5 bg-[#fafafa]/50 px-4 py-2 select-none">
          <div className="flex gap-1.5 overflow-x-auto flex-nowrap scrollbar-none scroll-smooth py-1">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 rounded-[3px] px-3.5 py-1.5 text-[11px] font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer touch-manipulation ${
                    active
                      ? "bg-[#a67c52] text-white shadow-sm"
                      : "bg-white border border-black/5 text-black/55 hover:border-black/15 hover:text-black"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          {/* Subtle horizontal fade overlays */}
          <div className="pointer-events-none absolute top-2 bottom-2 left-0 w-6 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute top-2 bottom-2 right-0 w-6 bg-gradient-to-l from-white to-transparent z-10" />
        </div>

        <div 
          ref={scrollContainerRef}
          className="p-4 flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
        >
          {editLoading && <div className="text-[13px] text-black/60 mb-4">Loading…</div>}

          <div className="space-y-6">
            {activeTab === "profile" && (
              <ProfileSection editForm={editForm} setEditForm={setEditForm} />
            )}
            
            {activeTab === "photos" && (
              <PhotosSection 
                editImages={editImages} 
                setEditImages={setEditImages} 
                setEditingPhotoIndex={setEditingPhotoIndex} 
                setPhotoModalOpen={setPhotoModalOpen} 
              />
            )}

            {activeTab === "videos" && (
              <VideosSection editVideos={editVideos} setEditVideos={setEditVideos} />
            )}

            {activeTab === "promos" && (
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
            )}

            {activeTab === "contact" && (
              <ContactSection editForm={editForm} setEditForm={setEditForm} setLogoUrlInput={setLogoUrlInput} setLogoModalOpen={setLogoModalOpen} />
            )}

            {activeTab === "socials" && (
              <SocialLinksSection editSocials={editSocials} setEditSocials={setEditSocials} />
            )}

            {activeTab === "themes" && (
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
            )}

            {activeTab === "professional" && (
              <ProfessionalStatusSection editForm={editForm} setEditForm={setEditForm} />
            )}

            {activeTab === "verification" && (
              <VerificationSection 
                editForm={editForm} 
                setEditForm={setEditForm} 
                editSubscription={editSubscription} 
                saveSubscriptionDate={saveSubscriptionDate} 
                verificationDocuments={verificationDocuments} 
              />
            )}

            {activeTab === "admin_contact" && (
              <AdminContactSection editForm={editForm} setEditForm={setEditForm} />
            )}
          </div>
        </div>

        <div className="px-4 py-3 border-t border-black/5 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-[3px] border border-black/10 text-[13px] font-semibold text-black/70 hover:bg-black/5 transition-colors cursor-pointer"
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
              className="h-10 px-4 rounded-[3px] border border-[#a67c52] text-[13px] font-semibold text-[#a67c52] hover:bg-[#a67c52]/5 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {editLoading ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={saveAllAndClose}
              disabled={editLoading}
              className="h-10 px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60 cursor-pointer"
            >
              {editLoading ? "Saving…" : "Save & Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

