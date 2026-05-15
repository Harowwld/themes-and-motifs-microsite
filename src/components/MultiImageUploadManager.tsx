'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, ImageIcon, AlertCircle, Check, Loader2, Plus } from 'lucide-react';
import { useMultiImageUpload, type MultiUploadState } from '@/hooks/useMultiImageUpload';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

interface MultiImageUploadManagerProps {
  bucket: string;
  folder?: string;
  entityId?: string;
  onUploadsComplete: (results: { url: string; caption: string; storagePath: string }[]) => void;
  onCancel?: () => void;
  maxFiles?: number;
}

export function MultiImageUploadManager({
  bucket,
  folder,
  entityId,
  onUploadsComplete,
  onCancel,
  maxFiles = 10,
}: MultiImageUploadManagerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { uploads, addFiles, removeUpload, updateCaption, startUploads, getResults } = useMultiImageUpload({
    bucket,
    folder,
    entityId,
  });

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    if (uploads.length + fileArray.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images at once.`);
      return;
    }

    addFiles(fileArray);
  }, [uploads.length, maxFiles, addFiles]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const handleUploadAll = async () => {
    // 1. Start any pending uploads
    if (hasPending) {
      await startUploads();
    }

    // 2. Collect all successful results using the helper (which uses the latest ref)
    const successfulUploads = getResults();

    if (successfulUploads.length > 0) {
      onUploadsComplete(successfulUploads);
      toast.success(`Successfully added ${successfulUploads.length} images to portfolio.`);
    } else {
      toast.error('No images have been successfully uploaded yet.');
    }
  };

  const isUploadingAny = uploads.some(u => u.status === 'uploading' || u.status === 'compressing');
  const hasPending = uploads.some(u => u.status === 'pending' || u.status === 'error');
  const hasSuccess = uploads.some(u => u.status === 'success');

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      {uploads.length < maxFiles && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 group cursor-pointer",
            isDragging 
              ? "border-[#a67c52] bg-[#a67c52]/5" 
              : "border-black/10 hover:border-black/20 hover:bg-black/[0.01]"
          )}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center text-center">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors",
              isDragging ? "bg-[#a67c52]/10" : "bg-black/5 group-hover:bg-black/10"
            )}>
              <Plus className={cn("w-6 h-6", isDragging ? "text-[#a67c52]" : "text-black/40")} />
            </div>
            <p className="text-sm font-medium text-black/80">
              {uploads.length === 0 ? "Drop images here or click to browse" : "Add more images"}
            </p>
            <p className="text-xs text-black/40 mt-1">
              JPG, PNG, WebP up to 2MB each. Max {maxFiles} files.
            </p>
          </div>
        </div>
      )}

      {/* Previews Grid */}
      {uploads.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {uploads.map((upload) => (
            <div 
              key={upload.id} 
              className="group relative flex flex-col rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden animate-fade-in animate-zoom-in duration-300"
            >
              {/* Image Preview */}
              <div className="relative aspect-video bg-black/5 overflow-hidden">
                <img 
                  src={upload.previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Status Overlays */}
                {upload.status !== 'pending' && upload.status !== 'success' && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-4">
                    <Loader2 className="w-8 h-8 animate-spin mb-2 opacity-80" />
                    <div className="w-full max-w-[120px] h-1 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] mt-2 font-medium uppercase tracking-wider opacity-80">
                      {upload.status}...
                    </span>
                  </div>
                )}

                {upload.status === 'success' && (
                  <div className="absolute inset-0 bg-[#027a48]/20 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                      <Check className="w-6 h-6 text-[#027a48]" />
                    </div>
                  </div>
                )}

                {upload.status === 'error' && (
                  <div className="absolute inset-0 bg-[#b42318]/20 backdrop-blur-[1px] flex items-center justify-center p-4 text-center">
                    <div className="bg-white rounded-lg p-2 shadow-lg flex items-center gap-2 max-w-full">
                      <AlertCircle className="w-4 h-4 text-[#b42318] shrink-0" />
                      <span className="text-[10px] text-[#b42318] font-medium truncate">{upload.error}</span>
                    </div>
                  </div>
                )}

                {/* Remove Button */}
                <button
                  onClick={() => removeUpload(upload.id)}
                  disabled={upload.status === 'uploading' || upload.status === 'compressing'}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-black/60 hover:text-[#b42318] rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Caption Input */}
              <div className="p-3">
                <div className="relative">
                  <input
                    type="text"
                    value={upload.caption}
                    onChange={(e) => updateCaption(upload.id, e.target.value)}
                    placeholder="Add a caption..."
                    className="w-full bg-transparent text-sm border-none focus:ring-0 p-0 placeholder:text-black/30"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-black/5 group-focus-within:bg-[#a67c52] transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      {uploads.length > 0 && (
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md flex items-center justify-between pt-4 pb-2 border-t border-black/5 z-10 mt-6">
          <p className="text-xs text-black/40">
            {uploads.filter(u => u.status === 'success').length} of {uploads.length} uploaded
          </p>
          <div className="flex gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="h-10 px-6 rounded-xl border border-black/10 bg-white text-sm font-semibold text-black/70 hover:bg-black/5 transition-all"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleUploadAll}
              disabled={isUploadingAny || (uploads.length > 0 && !hasPending && !hasSuccess)}
              className={cn(
                "h-10 px-8 rounded-xl text-sm font-semibold text-white shadow-sm transition-all relative overflow-hidden",
                isUploadingAny || (uploads.length > 0 && !hasPending && !hasSuccess)
                  ? "bg-black/20 cursor-not-allowed"
                  : "bg-[#a67c52] hover:bg-[#8e6a46] active:scale-[0.98]"
              )}
            >
              {isUploadingAny ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <span>
                  {hasPending 
                    ? `Upload ${uploads.filter(u => u.status === 'pending' || u.status === 'error').length} Photos`
                    : "Confirm & Save"}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
