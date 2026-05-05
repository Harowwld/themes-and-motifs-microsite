"use client";

import { useState, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

interface MomentPhotoUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
}

export function MomentPhotoUpload({
  onFilesSelected,
  maxFiles = 10,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  className = "",
}: MomentPhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => 
      acceptedTypes.includes(file.type) && file.size <= 2 * 1024 * 1024 // 2MB limit
    );

    if (validFiles.length > 0) {
      const newFiles = [...selectedFiles, ...validFiles].slice(0, maxFiles);
      setSelectedFiles(newFiles);
      onFilesSelected(newFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      acceptedTypes.includes(file.type) && file.size <= 2 * 1024 * 1024
    );

    if (validFiles.length > 0) {
      const newFiles = [...selectedFiles, ...validFiles].slice(0, maxFiles);
      setSelectedFiles(newFiles);
      onFilesSelected(newFiles);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer
          ${isDragging 
            ? 'border-[#a68b6a] bg-[#a68b6a]/5' 
            : 'border-black/15 hover:border-black/25 hover:bg-black/[0.02]'
          }
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="text-center">
          <div className={`
            w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 transition-colors
            ${isDragging ? 'bg-[#a68b6a]/10' : 'bg-black/5'}
          `}>
            <Upload className={`
              w-8 h-8 transition-colors
              ${isDragging ? 'text-[#a68b6a]' : 'text-gray-500'}
            `} />
          </div>
          <h3 className="text-lg font-semibold text-[#2c2c2c] mb-2">
            Upload Photos
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop your photos here, or click to browse
          </p>
          <p className="text-xs text-gray-500">
            Up to {maxFiles} photos • JPG, PNG, WebP • Max 2MB each
          </p>
        </div>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Selected Photos ({selectedFiles.length}/{maxFiles})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute top-2 right-2 p-1 bg-[#b42318] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="mt-1">
                  <p className="text-xs text-gray-600 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
