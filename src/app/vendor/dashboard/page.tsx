"use client";

import React from "react";
import { 
  User, 
  Tag, 
  Image as ImageIcon, 
  Film, 
  FolderHeart, 
  Ticket, 
  MessageCircle, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  Palette,
  Globe,
  Star
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { useVendorDashboard } from "./hooks/useVendorDashboard";
import { DashboardSkeleton } from "./components/DashboardSections";
import { ProfileSection } from "./components/ProfileSection";
import { ThemesSection } from "./components/ThemesSection";
import { CategoriesSection } from "./components/CategoriesSection";
import { SocialSection } from "./components/SocialSection";
import { PhotoSection } from "./components/PhotoSection";
import { VideoSection } from "./components/VideoSection";
import { AlbumSection } from "./components/AlbumSection";
import { PromoSection } from "./components/PromoSection";
import { InquirySection } from "./components/InquirySection";
import { ReviewsSection } from "./components/ReviewsSection";
import { PreviewModal } from "./components/PreviewModal";
import { createSupabaseBrowserClient } from "../../../lib/supabaseBrowser";

export default function VendorDashboardPage() {
  const {
    loading,
    email,
    token,
    saving,
    vendor,
    subscription,
    form,
    socials,
    socialPlatformChoices,
    socialCustomPlatforms,
    images,
    videos,
    promos,
    inquiries,
    reviews,
    themes,
    allThemes,
    categories,
    allCategories,
    albums,
    selectedAlbum,
    albumPhotos,
    albumModalOpen,
    albumTitle,
    albumEditorOpen,
    deleteAlbumModalOpen,
    albumToDelete,
    renameAlbumModalOpen,
    albumToRename,
    renameAlbumTitle,
    cropperOpen,
    logoModalOpen,
    photoModalOpen,
    editingPhotoIndex,
    promoModalOpen,
    editingPromoId,
    videoModalOpen,
    editingVideoIndex,
    isPreviewOpen,
    isPremium,
    
    setForm,
    setSocials,
    setSocialPlatformChoices,
    setSocialCustomPlatforms,
    setImages,
    setVideos,
    setThemes,
    setCategories,
    setAlbumModalOpen,
    setAlbumTitle,
    setAlbumEditorOpen,
    setSelectedAlbum,
    setDeleteAlbumModalOpen,
    setAlbumToDelete,
    setRenameAlbumModalOpen,
    setAlbumToRename,
    setRenameAlbumTitle,
    setCropperOpen,
    setLogoModalOpen,
    setPhotoModalOpen,
    setEditingPhotoIndex,
    setPromoModalOpen,
    setEditingPromoId,
    setVideoModalOpen,
    setEditingVideoIndex,
    setIsPreviewOpen,

    saveCoverCrop,
    createPromo,
    updatePromo,
    deletePromo,
    refreshInquiries,
    updateInquiryStatus,
    saveReviewReply,
    createAlbum,
    deleteAlbum,
    renameAlbum,
    loadAlbumPhotos,
    saveAlbumPhotos,
    saveVerificationDoc,
    saveVerificationDetails,
    saveProfile,
    saveSocials,
    saveThemes,
    saveCategories,
    saveImages,
    saveVideos,
  } = useVendorDashboard();
  
  const [activeTab, setActiveTab] = React.useState("inquiries");
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/vendor/signin";
  };

  const tabs = [
    { id: "inquiries", label: "Client Inquiries", icon: MessageCircle },
    { id: "photos", label: "Portfolio Photos", icon: ImageIcon },
    { id: "albums", label: "Photo Albums", icon: FolderHeart },
    { id: "videos", label: "Video Highlights", icon: Film },
    { id: "promos", label: "Vouchers & Promos", icon: Ticket },
    { id: "reviews", label: "Couple Reviews", icon: Star },
    { id: "profile", label: "Business Profile", icon: User },
    { id: "categories", label: "Service Categories", icon: Tag },
    { id: "themes", label: "Storefront Themes", icon: Palette },
    { id: "social", label: "Social Links", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          
          {/* Welcome & Live Preview Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-white border border-black/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-2">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#a67c52] to-[#8e6a46] flex items-center justify-center text-white shadow-md shadow-[#a67c52]/20 shrink-0">
                <User size={22} />
              </div>
              <div>
                <div className="text-[16px] font-serif font-bold text-[#2c2c2c]">{vendor?.business_name}</div>
                <div className="text-[11px] font-sans font-bold text-black/30 uppercase tracking-widest mt-0.5">{email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="h-11 px-6 rounded-xl border border-[#a67c52]/30 bg-white text-[13px] font-black uppercase tracking-wider text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-500 shadow-sm hover:shadow-[0_8px_20px_rgba(166,124,82,0.15)] hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer font-bold"
              >
                <ExternalLink size={16} />
                <span>Live Preview Profile</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="h-11 px-6 rounded-xl border border-neutral-200 bg-white text-[13px] font-black uppercase tracking-wider text-neutral-500 hover:bg-neutral-50 active:scale-[0.97] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer font-bold"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          </div>

          {/* Unified Workspace Layout */}
          <div className="flex flex-col lg:flex-row gap-8 mt-6">

            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-[260px] shrink-0 space-y-2">
              <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-1.5">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-3 mb-2.5">
                  Vendor Workspace
                </div>
                {tabs.map((tab) => {
                  const isSelected = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold active:scale-[0.98] transition-all duration-200 text-left cursor-pointer ${
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
              </div>
            </aside>

            {/* Interactive Workspace Panel */}
            <main className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.985, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.985, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-8"
                >
                  {(() => {
                    switch (activeTab) {
                      case "inquiries":
                        return (
                          <InquirySection 
                            inquiries={inquiries}
                            refreshInquiries={refreshInquiries}
                            saving={saving}
                            updateInquiryStatus={updateInquiryStatus}
                          />
                        );
                      case "photos":
                        return (
                          <PhotoSection 
                            images={images}
                            setImages={setImages}
                            photoModalOpen={photoModalOpen}
                            setPhotoModalOpen={setPhotoModalOpen}
                            editingPhotoIndex={editingPhotoIndex}
                            setEditingPhotoIndex={setEditingPhotoIndex}
                            saving={saving}
                            saveImages={saveImages}
                          />
                        );
                      case "albums":
                        return (
                          <AlbumSection 
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
                        );
                      case "videos":
                        return (
                          <VideoSection 
                            videos={videos}
                            setVideos={setVideos}
                            videoModalOpen={videoModalOpen}
                            setVideoModalOpen={setVideoModalOpen}
                            editingVideoIndex={editingVideoIndex}
                            setEditingVideoIndex={setEditingVideoIndex}
                            saving={saving}
                            saveVideos={saveVideos}
                          />
                        );
                      case "promos":
                        return (
                          <PromoSection 
                            promos={promos}
                            isPremium={isPremium}
                            setEditingPromoId={setEditingPromoId}
                            setPromoModalOpen={setPromoModalOpen}
                            promoModalOpen={promoModalOpen}
                            editingPromoId={editingPromoId}
                            deletePromo={deletePromo}
                            updatePromo={updatePromo}
                            createPromo={createPromo}
                          />
                        );
                      case "reviews":
                        return (
                          <ReviewsSection 
                            reviews={reviews}
                            saving={saving}
                            saveReviewReply={saveReviewReply}
                          />
                        );
                      case "profile":
                        return (
                          <ProfileSection 
                            vendor={vendor}
                            subscription={subscription}
                            form={form}
                            setForm={setForm}
                            saving={saving}
                            saveProfile={saveProfile}
                            saveVerificationDoc={saveVerificationDoc}
                            saveVerificationDetails={saveVerificationDetails}
                            images={images}
                            cropperOpen={cropperOpen}
                            setCropperOpen={setCropperOpen}
                            saveCoverCrop={saveCoverCrop}
                            logoModalOpen={logoModalOpen}
                            setLogoModalOpen={setLogoModalOpen}
                            isPremium={isPremium}
                          />
                        );
                      case "themes":
                        return (
                          <ThemesSection 
                            themes={themes}
                            setThemes={setThemes}
                            allThemes={allThemes}
                            saving={saving}
                            saveThemes={saveThemes}
                          />
                        );
                      case "categories":
                        return (
                          <CategoriesSection 
                            categories={categories}
                            setCategories={setCategories}
                            allCategories={allCategories}
                            saving={saving}
                            saveCategories={saveCategories}
                          />
                        );
                      case "social":
                        return (
                          <SocialSection 
                            socials={socials}
                            setSocials={setSocials}
                            socialPlatformChoices={socialPlatformChoices}
                            setSocialPlatformChoices={setSocialPlatformChoices}
                            socialCustomPlatforms={socialCustomPlatforms}
                            setSocialCustomPlatforms={setSocialCustomPlatforms}
                            saving={saving}
                            saveSocials={saveSocials}
                            isPremium={isPremium}
                          />
                        );
                      default:
                        return null;
                    }
                  })()}
                </motion.div>
              </AnimatePresence>
            </main>

          </div>
        </div>
      </main>

      <PreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        vendor={vendor}
      />
    </div>
  );
}
