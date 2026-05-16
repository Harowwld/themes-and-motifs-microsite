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
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-black/[0.05] sticky top-0 z-[90] px-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#a67c52] flex items-center justify-center text-white shadow-lg shadow-[#a67c52]/20">
              <User size={20} />
            </div>
            <div>
              <div className="text-[14px] font-bold text-[#2c2c2c]">{vendor?.business_name}</div>
              <div className="text-[11px] font-bold text-black/30 uppercase tracking-widest">{email}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="h-10 px-5 rounded-lg border border-[#a67c52]/30 bg-white text-[13px] font-bold text-[#a67c52] hover:bg-[#a67c52] hover:text-white transition-all duration-300 shadow-sm flex items-center gap-2"
            >
              <ExternalLink size={16} />
              <span className="hidden sm:inline">Live Preview</span>
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full">
          <div className="grid gap-12 pb-20">
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
