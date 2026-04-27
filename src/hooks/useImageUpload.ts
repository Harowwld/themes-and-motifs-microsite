'use client';

import { useState, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import {
  compressImage,
  isValidImageType,
  formatFileSize,
  type CompressionResult,
} from '@/lib/imageCompression';

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  previewUrl: string | null;
}

export interface UploadResult {
  url: string;
  storagePath: string;
  compressionInfo?: {
    originalSize: number;
    compressedSize: number;
  };
}

interface UseImageUploadOptions {
  bucket: string;
  folder?: string;
  entityId?: string;
  maxSizeMB?: number;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
}

export function useImageUpload(options: UseImageUploadOptions) {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    previewUrl: null,
  });

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      previewUrl: null,
    });
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (!isValidImageType(file)) {
      return 'Only JPG, PNG, and WebP images are supported.';
    }
    return null;
  }, []);

  const createPreview = useCallback((file: File): string => {
    return URL.createObjectURL(file);
  }, []);

  const generateStoragePath = useCallback(
    (file: File, compressionResult: CompressionResult): string => {
      const ext = file.name.split('.').pop() || 'jpg';
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const { bucket, folder, entityId } = options;

      let path = '';
      if (folder) {
        path += `${folder}/`;
      }
      if (entityId) {
        path += `${entityId}/`;
      }
      path += `${timestamp}-${randomId}.${ext}`;

      return path;
    },
    [options]
  );

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      const validationError = validateFile(file);
      if (validationError) {
        setState((prev) => ({ ...prev, error: validationError }));
        options.onError?.(validationError);
        return null;
      }

      setState({
        isUploading: true,
        progress: 10,
        error: null,
        previewUrl: createPreview(file),
      });

      try {
        // Compression step
        setState((prev) => ({ ...prev, progress: 20 }));
        const compressionResult = await compressImage(file, {
          maxSizeMB: options.maxSizeMB || 2,
        });
        setState((prev) => ({ ...prev, progress: 50 }));

        // Generate storage path
        const storagePath = generateStoragePath(file, compressionResult);

        // Upload to Supabase
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase.storage
          .from(options.bucket)
          .upload(storagePath, compressionResult.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          throw new Error(`Upload failed: ${error.message}`);
        }

        setState((prev) => ({ ...prev, progress: 80 }));

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(options.bucket).getPublicUrl(storagePath);

        setState((prev) => ({ ...prev, progress: 100, isUploading: false }));

        const result: UploadResult = {
          url: publicUrl,
          storagePath,
          compressionInfo: compressionResult.wasCompressed
            ? {
                originalSize: compressionResult.originalSize,
                compressedSize: compressionResult.compressedSize,
              }
            : undefined,
        };

        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Upload failed. Please try again.';
        setState((prev) => ({
          ...prev,
          isUploading: false,
          error: errorMessage,
        }));
        options.onError?.(errorMessage);
        return null;
      }
    },
    [options, validateFile, createPreview, generateStoragePath]
  );

  const deleteFromStorage = useCallback(
    async (storagePath: string): Promise<boolean> => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.storage
          .from(options.bucket)
          .remove([storagePath]);

        if (error) {
          console.error('Failed to delete from storage:', error);
          return false;
        }
        return true;
      } catch (err) {
        console.error('Error deleting from storage:', err);
        return false;
      }
    },
    [options.bucket]
  );

  return {
    ...state,
    upload,
    deleteFromStorage,
    reset,
    formatFileSize,
  };
}
