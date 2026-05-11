#!/usr/bin/env node
/**
 * Parallel migration of vendor_images from Google Drive to Supabase
 * Uses concurrent processing for significantly faster migration
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envLines = envContent.split('\n');
  for (const line of envLines) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      if (!process.env[key]) process.env[key] = value.replace(/^"|"$/g, '');
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration
const CONFIG = {
  concurrency: parseInt(process.env.MIGRATION_CONCURRENCY || '10'), // Number of parallel workers
  batchSize: parseInt(process.env.MIGRATION_BATCH_SIZE || '50'),   // Images per batch
  delayBetweenBatches: parseInt(process.env.MIGRATION_BATCH_DELAY || '2000'), // ms between batches
  requestTimeout: parseInt(process.env.MIGRATION_TIMEOUT || '15000'), // ms per request
  retryAttempts: parseInt(process.env.MIGRATION_RETRIES || '2'),   // Retry failed images
};

interface VendorImage {
  id: number;
  vendor_id: number;
  image_url: string;
  display_order: number;
}

interface Result {
  success: boolean;
  id: number;
  vendor_id: number;
  previous_url: string;
  new_url?: string;
  error?: string;
  size_kb?: number;
  retry_count?: number;
}

function extractGoogleDriveId(url: string): string | null {
  const proxyMatch = url.match(/id%3D([a-zA-Z0-9_-]+)/);
  if (proxyMatch) return proxyMatch[1];
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  const ucMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) return ucMatch[1];
  const openMatch = url.match(/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch) return openMatch[1];
  return null;
}

async function downloadImage(url: string): Promise<Buffer | null> {
  // If it's a googleusercontent.com URL, download directly
  if (url.includes('googleusercontent.com') || url.includes('blogger.googleusercontent.com')) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(CONFIG.requestTimeout),
      });
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch { return null; }
  }
  
  // Otherwise extract Google Drive ID
  const fileId = extractGoogleDriveId(url);
  if (!fileId) return null;
  
  const urls = [
    `https://drive.google.com/uc?export=download&id=${fileId}`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
  ];
  
  for (const tryUrl of urls) {
    try {
      const response = await fetch(tryUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(CONFIG.requestTimeout),
      });
      if (!response.ok) continue;
      const contentType = response.headers.get('content-type');
      if (!contentType?.startsWith('image/')) continue;
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch { continue; }
  }
  return null;
}

async function uploadToSupabase(buffer: Buffer, fileName: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('vendor-assets')
      .upload(`gallery/${fileName}`, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage.from('vendor-assets').getPublicUrl(`gallery/${fileName}`);
    return publicUrl;
  } catch { return null; }
}

async function processImage(image: VendorImage, retryCount = 0): Promise<Result> {
  const buffer = await downloadImage(image.image_url);
  if (!buffer) {
    return { 
      success: false, 
      id: image.id, 
      vendor_id: image.vendor_id, 
      previous_url: image.image_url, 
      error: 'Download failed',
      retry_count: retryCount 
    };
  }
  
  const sizeKb = Math.round(buffer.length / 1024);
  const fileName = `vendor-${image.vendor_id}-img-${image.id}-${Date.now()}.jpg`;
  const publicUrl = await uploadToSupabase(buffer, fileName);
  
  if (!publicUrl) {
    return { 
      success: false, 
      id: image.id, 
      vendor_id: image.vendor_id, 
      previous_url: image.image_url, 
      error: 'Upload failed',
      retry_count: retryCount 
    };
  }
  
  const { error: updateError } = await supabase
    .from('vendor_images')
    .update({ image_url: publicUrl })
    .eq('id', image.id);
  
  if (updateError) {
    return { 
      success: false, 
      id: image.id, 
      vendor_id: image.vendor_id, 
      previous_url: image.image_url, 
      error: `Update failed: ${updateError.message}`,
      retry_count: retryCount 
    };
  }
  
  return { 
    success: true, 
    id: image.id, 
    vendor_id: image.vendor_id, 
    previous_url: image.image_url, 
    new_url: publicUrl, 
    size_kb: sizeKb,
    retry_count: retryCount 
  };
}

async function processBatch(images: VendorImage[], startIndex: number): Promise<Result[]> {
  const promises = images.map(async (image, index) => {
    let result = await processImage(image);
    let retryCount = 0;
    
    // Retry failed images
    while (!result.success && retryCount < CONFIG.retryAttempts) {
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
      result = await processImage(image, retryCount);
    }
    
    // Update progress
    process.stdout.write(`\r[${startIndex + index + 1}/${totalImages}] ${result.success ? '✅' : '❌'} Image ${image.id} (vendor ${image.vendor_id})${result.size_kb ? ` ${result.size_kb}KB` : ''}${result.retry_count ? ` (retry ${result.retry_count})` : ''}`);
    
    return result;
  });
  
  return Promise.all(promises);
}

let totalImages = 0;

async function main() {
  console.log('\n🚀 PARALLEL MIGRATE ALL VENDOR IMAGES\n');
  console.log('=' .repeat(80));
  console.log(`🔧 Configuration:`);
  console.log(`   Concurrency: ${CONFIG.concurrency} workers`);
  console.log(`   Batch size: ${CONFIG.batchSize} images`);
  console.log(`   Batch delay: ${CONFIG.delayBetweenBatches}ms`);
  console.log(`   Request timeout: ${CONFIG.requestTimeout}ms`);
  console.log(`   Retry attempts: ${CONFIG.retryAttempts}`);
  console.log('=' .repeat(80));
  
  // Check backup exists
  const backupsDir = path.resolve(__dirname, '../backups');
  const latestLink = path.join(backupsDir, 'vendor-images-latest.json');
  if (!fs.existsSync(latestLink)) {
    console.log('⚠️  No backup found! Run: npx tsx scripts/backup-vendor-images.ts\n');
    process.exit(1);
  }
  console.log('✅ Backup verified\n');
  
  // Fetch all images
  console.log('🔍 Fetching all vendor_images with Google Drive URLs...');
  const { data: images, error } = await supabase
    .from('vendor_images')
    .select('id, vendor_id, image_url, display_order')
    .or('image_url.like.%drive.google.com%,image_url.like.%googleusercontent.com%,image_url.like.%uc?export=view%,image_url.like.%image-proxy%')
    .order('id');
  
  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  if (!images || images.length === 0) {
    console.log('✅ No images to migrate!');
    process.exit(0);
  }
  
  totalImages = images.length;
  console.log(`\n📊 Total images to migrate: ${totalImages}\n`);
  console.log('=' .repeat(80));
  console.log('');
  
  // Process images in parallel batches
  const results: Result[] = [];
  const startTime = Date.now();
  
  for (let i = 0; i < images.length; i += CONFIG.batchSize) {
    const batch = images.slice(i, i + CONFIG.batchSize);
    const batchResults = await processBatch(batch, i);
    results.push(...batchResults);
    
    // Progress summary for batch
    const batchSuccessful = batchResults.filter(r => r.success).length;
    const batchFailed = batchResults.filter(r => !r.success).length;
    console.log(`\n   Batch ${Math.floor(i / CONFIG.batchSize) + 1}: ${batchSuccessful}✅ ${batchFailed}❌`);
    
    // Delay between batches to avoid rate limiting
    if (i + CONFIG.batchSize < images.length) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenBatches));
    }
  }
  
  console.log('\n');
  
  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  
  // Summary
  console.log('=' .repeat(80));
  console.log('\n📊 FINAL SUMMARY\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalSize = successful.reduce((sum, r) => sum + (r.size_kb || 0), 0);
  const imagesPerMinute = Math.round(results.length / parseFloat(duration));
  
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`📈 Total: ${results.length}`);
  console.log(`💾 Total uploaded: ${(totalSize / 1024).toFixed(2)} MB`);
  console.log(`⏱️  Duration: ${duration} minutes`);
  console.log(`🚀 Speed: ${imagesPerMinute} images/minute\n`);
  
  if (failed.length > 0) {
    console.log('⚠️  Failed images:\n');
    for (const r of failed.slice(0, 10)) {
      console.log(`  ID ${r.id}: ${r.error}${r.retry_count ? ` (after ${r.retry_count} retries)` : ''}`);
    }
    if (failed.length > 10) console.log(`  ... and ${failed.length - 10} more`);
    console.log('');
  }
  
  // Save report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const reportPath = path.join(backupsDir, `vendor-images-migration-parallel-${timestamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({ 
    timestamp, 
    config: CONFIG,
    summary: { 
      total: results.length, 
      successful: successful.length, 
      failed: failed.length, 
      total_mb: (totalSize / 1024).toFixed(2), 
      duration_minutes: duration,
      images_per_minute: imagesPerMinute
    }, 
    results 
  }, null, 2));
  console.log(`📝 Report saved: ${reportPath}\n`);
  
  console.log('=' .repeat(80));
  console.log('\n🎉 Parallel migration complete!\n');
}

main().catch(console.error);
