#!/usr/bin/env node
/**
 * Migrate ALL vendor_images from Google Drive to Supabase in one go
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
        signal: AbortSignal.timeout(15000),
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
        signal: AbortSignal.timeout(15000),
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

async function processImage(image: VendorImage, index: number, total: number): Promise<Result> {
  const prefix = `[${index + 1}/${total}]`;
  process.stdout.write(`${prefix} Processing image ${image.id} (vendor ${image.vendor_id})... `);
  
  const buffer = await downloadImage(image.image_url);
  if (!buffer) {
    console.log('❌ DOWNLOAD FAILED');
    return { success: false, id: image.id, vendor_id: image.vendor_id, previous_url: image.image_url, error: 'Download failed' };
  }
  
  const sizeKb = Math.round(buffer.length / 1024);
  const fileName = `vendor-${image.vendor_id}-img-${image.id}-${Date.now()}.jpg`;
  const publicUrl = await uploadToSupabase(buffer, fileName);
  
  if (!publicUrl) {
    console.log('❌ UPLOAD FAILED');
    return { success: false, id: image.id, vendor_id: image.vendor_id, previous_url: image.image_url, error: 'Upload failed' };
  }
  
  const { error: updateError } = await supabase
    .from('vendor_images')
    .update({ image_url: publicUrl })
    .eq('id', image.id);
  
  if (updateError) {
    console.log('❌ UPDATE FAILED');
    return { success: false, id: image.id, vendor_id: image.vendor_id, previous_url: image.image_url, error: `Update failed: ${updateError.message}` };
  }
  
  console.log(`✅ ${sizeKb}KB`);
  return { success: true, id: image.id, vendor_id: image.vendor_id, previous_url: image.image_url, new_url: publicUrl, size_kb: sizeKb };
}

async function main() {
  console.log('\n🖼️  MIGRATE ALL VENDOR IMAGES\n');
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
  
  console.log(`\n📊 Total images to migrate: ${images.length}\n`);
  console.log('=' .repeat(80));
  console.log('');
  
  // Process all images
  const results: Result[] = [];
  const startTime = Date.now();
  
  for (let i = 0; i < images.length; i++) {
    const result = await processImage(images[i], i, images.length);
    results.push(result);
    
    // Small delay to avoid rate limiting
    if (i < images.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  
  // Summary
  console.log('\n' + '=' .repeat(80));
  console.log('\n📊 FINAL SUMMARY\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalSize = successful.reduce((sum, r) => sum + (r.size_kb || 0), 0);
  
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`📈 Total: ${results.length}`);
  console.log(`💾 Total uploaded: ${(totalSize / 1024).toFixed(2)} MB`);
  console.log(`⏱️  Duration: ${duration} minutes\n`);
  
  if (failed.length > 0) {
    console.log('⚠️  Failed images:\n');
    for (const r of failed.slice(0, 10)) {
      console.log(`  ID ${r.id}: ${r.error}`);
    }
    if (failed.length > 10) console.log(`  ... and ${failed.length - 10} more`);
    console.log('');
  }
  
  // Save report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const reportPath = path.join(backupsDir, `vendor-images-migration-${timestamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({ timestamp, summary: { total: results.length, successful: successful.length, failed: failed.length, total_mb: (totalSize / 1024).toFixed(2), duration_minutes: duration }, results }, null, 2));
  console.log(`📝 Report saved: ${reportPath}\n`);
  
  console.log('=' .repeat(80));
  console.log('\n🎉 Migration complete!\n');
}

main().catch(console.error);
