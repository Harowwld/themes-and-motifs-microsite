import React from "react";
import { 
  User, 
  Image as ImageIcon, 
  Film, 
  Ticket, 
  Globe, 
  Palette, 
  CheckSquare, 
  Phone, 
  ShieldCheck, 
  Briefcase 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Vendor, VerificationDocument, Promo, Theme, Affiliation, VendorImage, VendorVideo, VendorSocial } from "../hooks/useSuperadminSuppliers";
import { ProfileSection } from "./ProfileSection";
import { ContactSection } from "./ContactSection";
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
  regions,
  cities,
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
  editAlbums,
  setEditAlbums,
  editAlbumPhotos,
  setEditAlbumPhotos,
  createAlbum,
  deleteAlbum,
  renameAlbum,
  loadAlbumPhotos,
  saveAlbumPhotos,
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
  regions: any[];
  cities: any[];
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
  const [activeTab, setActiveTab] = React.useState("photos");

  if (!isOpen || !editingVendor) return null;

  const tabs = [
    { id: "photos", label: "Photos / Themes", icon: ImageIcon },
    { id: "promos", label: "Exclusive Deals", icon: Ticket },
    { id: "profile", label: "Business Profile", icon: User },
    { id: "contact", label: "Contact Info", icon: Phone },
    { id: "social", label: "Social Links", icon: Globe },
    { id: "affiliations", label: "Affiliations", icon: Palette },
    { id: "professional", label: "Professional Status", icon: Briefcase },
    { id: "verification", label: "Verifications", icon: CheckSquare },
    { id: "videos", label: "Video Highlights", icon: Film },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-5xl max-h-[90vh] rounded-[3px] border border-black/10 bg-white shadow-lg my-8 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-black/45">Edit Vendor</div>
            <div className="text-[20px] font-bold text-[#2c2c2c]">{editingVendor.business_name}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-[3px] bg-white/90 text-black/60 hover:text-[#b42318] flex items-center justify-center text-[18px] shadow-sm cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Sidebar Navigation */}
          <aside className="w-[230px] shrink-0 border-r border-black/5 bg-[#fafafa] p-3 overflow-y-auto space-y-1">
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-3 mb-2.5">
              Edit Sections
            </div>
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-[13px] font-bold active:scale-[0.98] transition-all duration-200 text-left cursor-pointer ${
                    isSelected
                      ? "bg-[#a67c52] text-white shadow-[0_4px_12px_rgba(166,124,82,0.15)]"
                      : "text-neutral-500 hover:text-[#a67c52] hover:bg-[#a67c52]/5"
                  }`}
                >
                  <Icon size={16} strokeWidth={isSelected ? 2.5 : 2} className={isSelected ? "text-white" : "text-neutral-400"} />
                  <span className="flex-1 truncate">{tab.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Interactive Workspace Panel */}
          <main className="flex-1 p-5 overflow-y-auto overflow-x-hidden min-h-0 bg-white">
            {editLoading && <div className="text-[13px] text-black/60 mb-4">Loading…</div>}
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.985, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.985, y: -6 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                {(() => {
                  switch (activeTab) {
                    case "photos":
                      return (
                        <PhotosSection 
                          editImages={editImages} 
                          setEditImages={setEditImages} 
                          setEditingPhotoIndex={setEditingPhotoIndex} 
                          setPhotoModalOpen={setPhotoModalOpen} 
                          allThemes={allThemes}
                          editThemes={editThemes}
                          setEditThemes={setEditThemes}
                        />
                      );
                    case "promos":
                      return (
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
                      );
                    case "profile":
                      return <ProfileSection editForm={editForm} setEditForm={setEditForm} regions={regions} cities={cities} setLogoUrlInput={setLogoUrlInput} setLogoModalOpen={setLogoModalOpen} />;
                    case "contact":
                      return <ContactSection editForm={editForm} setEditForm={setEditForm} />;
                    case "verification":
                      return (
                        <VerificationSection 
                          editForm={editForm} 
                          setEditForm={setEditForm} 
                          editSubscription={editSubscription} 
                          saveSubscriptionDate={saveSubscriptionDate} 
                          verificationDocuments={verificationDocuments} 
                        />
                      );
                    case "videos":
                      return <VideosSection editVideos={editVideos} setEditVideos={setEditVideos} />;
                    case "social":
                      return <SocialLinksSection editSocials={editSocials} setEditSocials={setEditSocials} />;
                    case "affiliations":
                      return (
                        <AffiliationsThemesSection 
                          editAffiliations={editAffiliations} 
                          setEditAffiliations={setEditAffiliations} 
                          allAffiliations={allAffiliations} 
                          affiliationInput={affiliationInput} 
                          setAffiliationInput={setAffiliationInput} 
                        />
                      );
                    case "professional":
                      return <ProfessionalStatusSection editForm={editForm} setEditForm={setEditForm} />;
                    default:
                      return null;
                  }
                })()}
              </motion.div>
            </AnimatePresence>
          </main>
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


