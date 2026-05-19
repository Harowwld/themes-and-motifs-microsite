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
  ChevronRight
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
    createAlbum,
    deleteAlbum,
    loadAlbumPhotos,
    saveAlbumPhotos,
    saveVerificationDoc,
    saveProfile,
    saveSocials,
    saveThemes,
    saveCategories,
    saveImages,
    saveVideos,
  } = useVendorDashboard();
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/vendor/signin";
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full">
          {/* Welcome & Live Preview Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-white border border-black/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#a67c52] to-[#8e6a46] flex items-center justify-center text-white shadow-md shadow-[#a67c52]/20 shrink-0">
                <User size={22} />
              </div>
              <div>
                <div className="text-[16px] font-serif font-bold text-[#2c2c2c]">{vendor?.business_name}</div>
                <div className="text-[11px] font-sans font-bold text-black/30 uppercase tracking-widest mt-0.5">{email}</div>
              </div>
            </div>

            <button
              onClick={() => setIsPreviewOpen(true)}
              className="h-11 px-6 rounded-xl border border-[#a67c52]/30 bg-white text-[13px] font-black uppercase tracking-wider text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-500 shadow-sm hover:shadow-[0_8px_20px_rgba(166,124,82,0.15)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} />
              <span>Live Preview Profile</span>
            </button>
          </div>

          <div className="grid gap-8 pb-20">
            {/* Priority Sections */}
            <div id="photos">
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
            </div>

            <div id="albums">
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
              />
            </div>

            <div id="videos">
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
            </div>

            <div id="promos">
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
            </div>

            <div id="inquiries">
              <InquirySection 
                inquiries={inquiries}
                refreshInquiries={refreshInquiries}
                saving={saving}
                updateInquiryStatus={updateInquiryStatus}
              />
            </div>

            {/* Advanced Toggle - Modern UI UX Pro Max approach */}
            <div className="py-4 flex flex-col items-center relative">
              <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
              
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="group relative flex items-center gap-4 px-10 py-5 rounded-full bg-white border border-black/[0.05] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(166,124,82,0.12)] hover:-translate-y-1.5 transition-all duration-700 ease-[0.22, 1, 0.36, 1] z-10"
              >
                {/* Background Glow */}
                <div className="absolute inset-0 rounded-full bg-[#a67c52]/[0.02] group-hover:bg-[#a67c52]/[0.05] transition-colors duration-700" />
                
                <div className="relative flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-[#a67c52]/10 text-[#a67c52] transition-all duration-700 group-hover:bg-[#a67c52] group-hover:text-white ${showAdvanced ? 'rotate-180' : ''}`}>
                    <ChevronRight size={18} className="rotate-90" />
                  </div>
                  
                  <div className="flex flex-col items-start">
                    <span className="text-[13px] font-black uppercase tracking-[0.15em] text-[#a67c52] group-hover:text-[#8e6a46] transition-colors duration-300">
                      {showAdvanced ? "System Settings" : "Configure Dashboard"}
                    </span>
                    <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest mt-0.5">
                      {showAdvanced ? "Collapse Advanced View" : "Expand Advanced Options"}
                    </span>
                  </div>
                </div>

                {/* Subtle Decorative Element */}
                <div className="w-1.5 h-1.5 rounded-full bg-[#a67c52]/40 group-hover:scale-150 group-hover:bg-[#a67c52] transition-all duration-700" />
              </button>
            </div>

            {/* Advanced Sections */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="grid gap-8"
                >
                  <div id="profile">
                    <ProfileSection 
                      vendor={vendor}
                      subscription={subscription}
                      form={form}
                      setForm={setForm}
                      saving={saving}
                      saveProfile={saveProfile}
                      saveVerificationDoc={saveVerificationDoc}
                      images={images}
                      cropperOpen={cropperOpen}
                      setCropperOpen={setCropperOpen}
                      saveCoverCrop={saveCoverCrop}
                      logoModalOpen={logoModalOpen}
                      setLogoModalOpen={setLogoModalOpen}
                      isPremium={isPremium}
                    />
                  </div>

                  <div id="themes">
                    <ThemesSection 
                      themes={themes}
                      setThemes={setThemes}
                      allThemes={allThemes}
                      saving={saving}
                      saveThemes={saveThemes}
                    />
                  </div>

                  <div id="categories">
                    <CategoriesSection 
                      categories={categories}
                      setCategories={setCategories}
                      allCategories={allCategories}
                      saving={saving}
                      saveCategories={saveCategories}
                    />
                  </div>

                  <div id="social">
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
