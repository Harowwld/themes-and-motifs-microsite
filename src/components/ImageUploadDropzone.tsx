'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, ImageIcon, AlertCircle, Check } from 'lucide-react';
import { useImageUpload, type UploadResult } from '@/hooks/useImageUpload';
import { formatFileSize } from '@/lib/imageCompression';

interface ImageUploadDropzoneProps {
  bucket: string;
  folder?: string;
  entityId?: string;
  label?: string;
  description?: string;
  onUploadComplete: (result: UploadResult) => void;
  onClear?: () => void;
  existingUrl?: string | null;
  accept?: string;
}

export function ImageUploadDropzone({
  bucket,
  folder,
  entityId,
  label = 'Upload Image',
  description = 'Drag and drop or click to select. JPG, PNG, WebP up to 2MB.',
  onUploadComplete,
  onClear,
  existingUrl,
  accept = 'image/jpeg,image/png,image/webp,image/jpg',
}: ImageUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{
    original: string;
    compressed: string;
  } | null>(null);

  const handleSuccess = useCallback(
    (result: UploadResult) => {
      onUploadComplete(result);
      setShowSuccessToast(true);
      if (result.compressionInfo) {
        setCompressionInfo({
          original: formatFileSize(result.compressionInfo.originalSize),
          compressed: formatFileSize(result.compressionInfo.compressedSize),
        });
      }
      setTimeout(() => setShowSuccessToast(false), 3000);
    },
    [onUploadComplete]
  );

  const { upload, isUploading, progress, error, previewUrl, reset } =
    useImageUpload({
      bucket,
      folder,
      entityId,
      onSuccess: handleSuccess,
    });

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        upload(files[0]);
      }
    },
    [upload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        upload(files[0]);
      }
    },
    [upload]
  );

  const handleClear = useCallback(() => {
    reset();
    setCompressionInfo(null);
    onClear?.();
  }, [reset, onClear]);

  const displayUrl = previewUrl || existingUrl;

  return (
    <div className="space-y-3">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-[#2c2c2c]">
          {label}
        </label>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 text-green-600" />
          <div className="text-sm">
            <span className="text-green-800 font-medium">Upload successful!</span>
            {compressionInfo && (
              <span className="text-green-600 block text-xs mt-0.5">
                Compressed from {compressionInfo.original} to {compressionInfo.compressed}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <span className="text-red-800 font-medium">Upload failed</span>
            <span className="text-red-600 block text-xs mt-0.5">{error}</span>
          </div>
          <button
            onClick={reset}
            className="ml-auto p-1 hover:bg-red-100 rounded transition-colors"
          >
            <X className="w-3 h-3 text-red-500" />
          </button>
        </div>
      )}

      {/* Preview or Dropzone */}
      {displayUrl ? (
        <div className="relative group">
          <div className="relative aspect-video rounded-xl overflow-hidden border border-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-full max-w-[200px] mx-4">
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#a68b6a] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-white text-xs text-center mt-2">
                    Uploading... {progress}%
                  </p>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleClear}
            disabled={isUploading}
            className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragEnter}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-6 transition-all duration-200
            ${isDragging 
              ? 'border-[#a68b6a] bg-[#a68b6a]/5' 
              : 'border-black/15 hover:border-black/25 hover:bg-black/[0.02]'
            }
          `}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center">
            <div className={`
              w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 transition-colors
              ${isDragging ? 'bg-[#a68b6a]/10' : 'bg-black/5'}
            `}>
              <ImageIcon className={`
                w-5 h-5 transition-colors
                ${isDragging ? 'text-[#a68b6a]' : 'text-gray-500'}
              `} />
            </div>
            <p className="text-sm font-medium text-[#2c2c2c]">
              Drop your image here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
