#!/usr/bin/env node
/**
 * Retry failed vendor image migrations with extended timeout and retries
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

// Failed image IDs to retry
const FAILED_IDS = [7690, 7691, 7692, 7693, 7710, 7711, 7713, 7714, 7715, 7716];

// Extended settings for stubborn images
const TIMEOUT = 30000; // 30 seconds
const RETRIES = 4; // More retries

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
  if (url.includes('googleusercontent.com') || url.includes('blogger.googleusercontent.com')) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(TIMEOUT),
      });
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (e) { 
      console.log(`    → googleusercontent fetch error: ${e}`);
      return null; 
    }
  }
  
  const fileId = extractGoogleDriveId(url);
  if (!fileId) return null;
  
  const urls = [
    `https://drive.google.com/uc?export=download&id=${fileId}`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
    `https://docs.google.com/uc?export=download&id=${fileId}`,
  ];
  
  for (const tryUrl of urls) {
    try {
      const response = await fetch(tryUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(TIMEOUT),
      });
      if (!response.ok) {
        console.log(`    → ${response.status} ${response.statusText}`);
        continue;
      }
      const contentType = response.headers.get('content-type');
      if (!contentType?.startsWith('image/')) {
        console.log(`    → not an image: ${contentType}`);
        continue;
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (e) {
      console.log(`    → fetch error: ${e}`);
      continue;
    }
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

async function processImage(id: number): Promise<{success: boolean, id: number, error?: string, size_kb?: number, new_url?: string}> {
  // Fetch current URL
  const { data: image, error: fetchError } = await supabase
    .from('vendor_images')
    .select('id, vendor_id, image_url')
    .eq('id', id)
    .single();
  
  if (fetchError || !image) {
    return { success: false, id, error: 'Image not found' };
  }
  
  console.log(`\n🔄 Image ${id} (vendor ${image.vendor_id})`);
  console.log(`   URL: ${image.image_url.substring(0, 80)}...`);
  
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    console.log(`   Attempt ${attempt}/${RETRIES}...`);
    const buffer = await downloadImage(image.image_url);
    
    if (buffer) {
      const sizeKb = Math.round(buffer.length / 1024);
      const fileName = `vendor-${image.vendor_id}-img-${id}-retry-${Date.now()}.jpg`;
      const publicUrl = await uploadToSupabase(buffer, fileName);
      
      if (publicUrl) {
        const { error: updateError } = await supabase
          .from('vendor_images')
          .update({ image_url: publicUrl })
          .eq('id', id);
        
        if (!updateError) {
          return { success: true, id, size_kb: sizeKb, new_url: publicUrl };
        }
      }
    }
    
    if (attempt < RETRIES) {
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
  
  return { success: false, id, error: 'Download failed after all retries' };
}

async function main() {
  console.log('\n🔄 RETRY FAILED IMAGES\n');
  console.log('=' .repeat(80));
  console.log(`📋 Retrying ${FAILED_IDS.length} failed image IDs\n`);
  
  const results = [];
  for (const id of FAILED_IDS) {
    const result = await processImage(id);
    results.push(result);
    console.log(result.success ? `   ✅ Success: ${result.size_kb}KB` : `   ❌ Failed: ${result.error}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '=' .repeat(80));
  console.log('\n📊 SUMMARY\n');
  console.log(`✅ Successful: ${results.filter(r => r.success).length}`);
  console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);
  console.log('');
}

main().catch(console.error);
