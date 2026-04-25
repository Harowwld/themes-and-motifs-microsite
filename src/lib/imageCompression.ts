import imageCompression from 'browser-image-compression';

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  wasCompressed: boolean;
}

export interface CompressionOptions {
  maxWidthOrHeight?: number;
  initialQuality?: number;
  minQuality?: number;
  maxSizeMB?: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidthOrHeight: 2048,
  initialQuality: 0.8,
  minQuality: 0.5,
  maxSizeMB: 10,
};

/**
 * Compresses an image file if it exceeds the max size.
 * Returns the original file if it's already within limits.
 * Throws if compression can't get it under max size.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = file.size / (1024 * 1024); // MB

  // If file is already small enough, return as-is
  if (originalSize <= opts.maxSizeMB) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      wasCompressed: false,
    };
  }

  // Try compression with initial quality
  let currentQuality = opts.initialQuality;
  let compressedFile = file;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    const compressionOptions = {
      maxWidthOrHeight: opts.maxWidthOrHeight,
      initialQuality: currentQuality,
      maxSizeMB: opts.maxSizeMB,
      useWebWorker: true,
      fileType: file.type,
    };

    compressedFile = await imageCompression(file, compressionOptions);
    const compressedSize = compressedFile.size / (1024 * 1024);

    if (compressedSize <= opts.maxSizeMB) {
      return {
        file: compressedFile,
        originalSize: file.size,
        compressedSize: compressedFile.size,
        wasCompressed: true,
      };
    }

    // Reduce quality for next attempt
    currentQuality = Math.max(
      opts.minQuality,
      currentQuality - (opts.initialQuality - opts.minQuality) / maxAttempts
    );
    attempts++;
  }

  // If we still can't get it under max size, throw error
  const finalSize = compressedFile.size / (1024 * 1024);
  if (finalSize > opts.maxSizeMB) {
    throw new Error(
      `File too large even after compression (${finalSize.toFixed(1)}MB). Maximum allowed is ${opts.maxSizeMB}MB.`
    );
  }

  return {
    file: compressedFile,
    originalSize: file.size,
    compressedSize: compressedFile.size,
    wasCompressed: true,
  };
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validates file type is allowed image format
 */
export function isValidImageType(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  return allowedTypes.includes(file.type);
}

/**
 * Gets file extension from mime type
 */
export function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };
  return extensions[mimeType] || '.jpg';
}
