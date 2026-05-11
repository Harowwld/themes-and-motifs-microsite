// @ts-nocheck
/// <reference types="https://deno.land/x/supabase/functions/_dev_deps.ts" />

import { createClient } from '@supabase/supabase-js';

interface GoogleDriveUrl {
  id: number;
  business_name: string;
  logo_url: string;
}

interface CompressionResult {
  success: boolean;
  id: number;
  original_url: string;
  new_url?: string;
  error?: string;
  original_size?: number;
  compressed_size?: number;
}

// Parse Google Drive URL to extract file ID
function extractGoogleDriveFileId(url: string): string | null {
  // Handle different Google Drive URL formats
  // Format 1: https://drive.google.com/file/d/{FILE_ID}/view
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  
  // Format 2: https://drive.google.com/uc?export=view&id={FILE_ID}
  const ucMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) return ucMatch[1];
  
  // Format 3: https://drive.google.com/open?id={FILE_ID}
  const openMatch = url.match(/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch) return openMatch[1];
  
  return null;
}

// Convert Google Drive URL to direct download URL
function getDirectDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

// Download image from Google Drive with retry logic
async function downloadImage(url: string, retries = 3): Promise<Blob | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://drive.google.com/',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`Download failed with status ${response.status}: ${url}`);
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        return null;
      }
      
      return await response.blob();
    } catch (error) {
      console.error(`Download attempt ${attempt + 1} failed: ${error}`);
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  return null;
}

// Compress image to target size
async function compressImage(
  blob: Blob, 
  targetSizeBytes: number = 2000000, // 2MB
  maxWidth: number = 1200,
  maxHeight: number = 1200
): Promise<Blob> {
  // If already under target size, return as-is
  if (blob.size <= targetSizeBytes) {
    return blob;
  }
  
  // Convert blob to array buffer
  const arrayBuffer = await blob.arrayBuffer();
  
  // For non-image types, just return original
  if (!blob.type.startsWith('image/')) {
    return blob;
  }
  
  // Create canvas for compression
  const img = new Image();
  const canvas = new OffscreenCanvas(1, 1);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Load image
  const bitmap = await createImageBitmap(new Blob([arrayBuffer]));
  
  // Calculate new dimensions
  let { width, height } = bitmap;
  
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }
  
  // Resize canvas
  canvas.width = width;
  canvas.height = height;
  
  // Draw image
  ctx.drawImage(bitmap, 0, 0, width, height);
  
  // Try different quality levels
  const qualities = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];
  
  for (const quality of qualities) {
    const compressed = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: quality,
    });
    
    if (compressed.size <= targetSizeBytes) {
      console.log(`Compressed to ${compressed.size} bytes at quality ${quality}`);
      return compressed;
    }
  }
  
  // If still too large, reduce dimensions further
  const finalBlob = await canvas.convertToBlob({
    type: 'image/jpeg',
    quality: 0.3,
  });
  
  console.log(`Final compression: ${finalBlob.size} bytes`);
  return finalBlob;
}

// Upload to Supabase Storage
async function uploadToStorage(
  supabase: any,
  file: Blob,
  fileName: string,
  bucket: string = 'vendor-assets'
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(`logos/${fileName}`, file, {
        cacheControl: '31536000',
        upsert: true,
        contentType: file.type || 'image/jpeg',
      });
    
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(`logos/${fileName}`);
    
    return publicUrl;
  } catch (error) {
    console.error('Upload exception:', error);
    return null;
  }
}

// Main processing function
async function processVendor(
  supabase: any,
  vendor: GoogleDriveUrl
): Promise<CompressionResult> {
  try {
    console.log(`Processing vendor ${vendor.id}: ${vendor.business_name}`);
    
    // Extract file ID
    const fileId = extractGoogleDriveFileId(vendor.logo_url);
    if (!fileId) {
      return {
        success: false,
        vendor_id: vendor.id,
        original_url: vendor.logo_url,
        error: 'Could not extract Google Drive file ID',
      };
    }
    
    // Download image
    const directUrl = getDirectDownloadUrl(fileId);
    console.log(`Downloading from: ${directUrl}`);
    
    const blob = await downloadImage(directUrl);
    if (!blob) {
      // Try alternative URL format
      const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
      console.log(`Trying thumbnail URL: ${thumbnailUrl}`);
      const thumbnailBlob = await downloadImage(thumbnailUrl);
      
      if (!thumbnailBlob) {
        return {
          success: false,
          vendor_id: vendor.id,
          original_url: vendor.logo_url,
          error: 'Failed to download image from Google Drive',
        };
      }
      
      // Continue with thumbnail
      return await processDownloadedImage(supabase, vendor, thumbnailBlob);
    }
    
    return await processDownloadedImage(supabase, vendor, blob);
    
  } catch (error) {
    console.error(`Error processing vendor ${vendor.id}:`, error);
    return {
      success: false,
      vendor_id: vendor.id,
      original_url: vendor.logo_url,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function processDownloadedImage(
  supabase: any,
  vendor: GoogleDriveUrl,
  blob: Blob
): Promise<CompressionResult> {
  const originalSize = blob.size;
  console.log(`Original size: ${originalSize} bytes`);
  
  // Compress if needed
  const compressed = await compressImage(blob, 2000000);
  const compressedSize = compressed.size;
  console.log(`Compressed size: ${compressedSize} bytes`);
  
  // Generate filename
  const timestamp = Date.now();
  const fileName = `vendor-${vendor.id}-${timestamp}.jpg`;
  
  // Upload to storage
  const publicUrl = await uploadToStorage(supabase, compressed, fileName);
  
  if (!publicUrl) {
    return {
      success: false,
      vendor_id: vendor.id,
      original_url: vendor.logo_url,
      original_size: originalSize,
      compressed_size: compressedSize,
      error: 'Failed to upload to storage',
    };
  }
  
  // Update vendor record
  const { error: updateError } = await supabase
    .from('vendors')
    .update({ logo_url: publicUrl })
    .eq('id', vendor.id);
  
  if (updateError) {
    console.error('Update error:', updateError);
    return {
      success: false,
      vendor_id: vendor.id,
      original_url: vendor.logo_url,
      original_size: originalSize,
      compressed_size: compressedSize,
      error: `Failed to update vendor record: ${updateError.message}`,
    };
  }
  
  return {
    success: true,
    vendor_id: vendor.id,
    original_url: vendor.logo_url,
    new_url: publicUrl,
    original_size: originalSize,
    compressed_size: compressedSize,
  };
}

// Deno serve handler
Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get request body
    const { batch_size = 10, specific_vendor_ids = [] } = await req.json().catch(() => ({}));
    
    // Fetch vendors with Google Drive URLs
    let query = supabase
      .from('vendors')
      .select('id, business_name, logo_url')
      .or('logo_url.like.%drive.google.com%,logo_url.like.%googleusercontent.com%,logo_url.like.%uc?export=view%');
    
    // If specific IDs provided, filter to those
    if (specific_vendor_ids.length > 0) {
      query = query.in('id', specific_vendor_ids);
    }
    
    // Limit batch size
    query = query.limit(batch_size);
    
    const { data: vendors, error: fetchError } = await query;
    
    if (fetchError) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch vendors: ${fetchError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!vendors || vendors.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No vendors with Google Drive URLs found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing ${vendors.length} vendors...`);
    
    // Process each vendor
    const results: CompressionResult[] = [];
    for (const vendor of vendors) {
      const result = await processVendor(supabase, vendor);
      results.push(result);
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Calculate statistics
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const totalOriginalSize = results
      .filter(r => r.original_size)
      .reduce((sum, r) => sum + (r.original_size || 0), 0);
    const totalCompressedSize = results
      .filter(r => r.compressed_size)
      .reduce((sum, r) => sum + (r.compressed_size || 0), 0);
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        successful,
        failed,
        total_original_size_bytes: totalOriginalSize,
        total_compressed_size_bytes: totalCompressedSize,
        compression_ratio: totalOriginalSize > 0 
          ? ((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(2) + '%'
          : 'N/A',
        results,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        stack: error instanceof Error ? error.stack : undefined,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
