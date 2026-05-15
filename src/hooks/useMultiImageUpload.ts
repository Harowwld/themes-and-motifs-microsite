'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import {
  compressImage,
  isValidImageType,
  type CompressionResult,
} from '@/lib/imageCompression';

export type UploadStatus = 'pending' | 'compressing' | 'uploading' | 'success' | 'error';

export interface MultiUploadState {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  error: string | null;
  previewUrl: string;
  resultUrl?: string;
  storagePath?: string;
  caption: string;
}

interface UseMultiImageUploadOptions {
  bucket: string;
  folder?: string;
  entityId?: string;
  maxSizeMB?: number;
  onAllComplete?: (results: MultiUploadState[]) => void;
}

export function useMultiImageUpload(options: UseMultiImageUploadOptions) {
  const [uploads, setUploads] = useState<MultiUploadState[]>([]);
  const uploadsRef = useRef<MultiUploadState[]>(uploads);

  useEffect(() => {
    uploadsRef.current = uploads;
  }, [uploads]);

  const addFiles = useCallback((files: File[]) => {
    const newUploads: MultiUploadState[] = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 11),
      file,
      status: 'pending',
      progress: 0,
      error: null,
      previewUrl: URL.createObjectURL(file),
      caption: '',
    }));
    setUploads((prev) => [...prev, ...newUploads]);
    return newUploads;
  }, []);

  const removeUpload = useCallback((id: string) => {
    setUploads((prev) => {
      const target = prev.find((u) => u.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((u) => u.id !== id);
    });
  }, []);

  const updateCaption = useCallback((id: string, caption: string) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, caption } : u))
    );
  }, []);

  const uploadFile = async (uploadItem: MultiUploadState) => {
    const { id, file } = uploadItem;

    try {
      // 1. Validation
      if (!isValidImageType(file)) {
        throw new Error('Invalid image type. Only JPG, PNG, and WebP are supported.');
      }

      // 2. Compression
      setUploads((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: 'compressing', progress: 10 } : u))
      );
      
      const compressionResult = await compressImage(file, {
        maxSizeMB: options.maxSizeMB || 2,
      });

      // 3. Uploading
      setUploads((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: 'uploading', progress: 30 } : u))
      );

      const ext = file.name.split('.').pop() || 'jpg';
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const storagePath = `${options.folder ? options.folder + '/' : ''}${options.entityId ? options.entityId + '/' : ''}${timestamp}-${randomId}.${ext}`;

      const supabase = createSupabaseBrowserClient();
      const { error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(storagePath, compressionResult.file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(storagePath);

      setUploads((prev) =>
        prev.map((u) => (u.id === id ? { 
          ...u, 
          status: 'success', 
          progress: 100, 
          resultUrl: publicUrl,
          storagePath
        } : u))
      );

      return publicUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setUploads((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: 'error', error: errorMessage, progress: 0 } : u))
      );
      return null;
    }
  };

  const startUploads = useCallback(async (ids?: string[]) => {
    // We use the latest ref value to avoid closure staleness in the for loop
    const targets = ids 
      ? uploadsRef.current.filter(u => ids.includes(u.id) && u.status !== 'success')
      : uploadsRef.current.filter(u => u.status === 'pending' || u.status === 'error');

    for (const item of targets) {
      await uploadFile(item);
    }
  }, [uploadFile]);

  const getResults = useCallback(() => {
    return uploadsRef.current
      .filter(u => u.status === 'success' && u.resultUrl)
      .map(u => ({
        url: u.resultUrl!,
        caption: u.caption,
        storagePath: u.storagePath!
      }));
  }, []);

  return {
    uploads,
    addFiles,
    removeUpload,
    updateCaption,
    startUploads,
    getResults,
    setUploads,
  };
}
