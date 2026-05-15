#!/usr/bin/env node
/**
 * Unified script to migrate ALL remaining external images to Supabase Storage.
 * Covers: vendors, promos, vendor_images, and vendor_album_photos.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envLines = envContent.split('\n');
  for (const line of envLines) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      if (!process.env[key]) process.env[key] = value.replace(/^"|"$/g, '').trim();
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AssetRecord {
  table: string;
  id: number;
  vendor_id: number | null;
  url: string;
  column: string;
}

interface Result {
  success: boolean;
  table: string;
  id: number;
  previous_url: string;
  new_url?: string;
  error?: string;
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
  const fileId = extractGoogleDriveId(url);
  
  if (fileId) {
    const tryUrls = [
      `https://drive.google.com/uc?export=download&id=${fileId}`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`,
      `https://drive.google.com/uc?export=view&id=${fileId}`,
    ];
    
    for (const tryUrl of tryUrls) {
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
  } else {
    // Direct download for non-Google Drive URLs
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) return null;
      const contentType = response.headers.get('content-type');
      if (!contentType?.startsWith('image/')) {
         const ext = url.split(/[#?]/)[0].split('.').pop()?.toLowerCase();
         if (!['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(ext || '')) return null;
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch { return null; }
  }
  return null;
}

async function uploadToSupabase(buffer: Buffer, path: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('vendor-assets')
      .upload(path, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    if (error) {
      console.error(`  Upload error: ${error.message}`);
      return null;
    }
    const { data: { publicUrl } } = supabase.storage.from('vendor-assets').getPublicUrl(path);
    return publicUrl;
  } catch (e) { 
    console.error(`  Upload exception: ${e}`);
    return null; 
  }
}

async function main() {
  console.log('\n🚀 STARTING UNIFIED ASSET MIGRATION\n');
  console.log('=' .repeat(80));

  // 1. Fetch all external assets
  console.log('🔍 Scanning database for external URLs...');
  const externalAssets: AssetRecord[] = [];

  // Vendors Logo
  const { data: vendors } = await supabase.from('vendors').select('id, logo_url').not('logo_url', 'is', null).not('logo_url', 'ilike', '%supabase.co%');
  vendors?.forEach(v => externalAssets.push({ table: 'vendors', id: v.id, vendor_id: v.id, url: v.logo_url, column: 'logo_url' }));

  // Promos
  const { data: promos } = await supabase.from('promos').select('id, vendor_id, image_url').not('image_url', 'is', null).not('image_url', 'ilike', '%supabase.co%');
  promos?.forEach(p => externalAssets.push({ table: 'promos', id: p.id, vendor_id: p.vendor_id, url: p.image_url, column: 'image_url' }));

  // Vendor Images
  const { data: vImages } = await supabase.from('vendor_images').select('id, vendor_id, image_url').not('image_url', 'is', null).not('image_url', 'ilike', '%supabase.co%');
  vImages?.forEach(vi => externalAssets.push({ table: 'vendor_images', id: vi.id, vendor_id: vi.vendor_id, url: vi.image_url, column: 'image_url' }));

  // Vendor Album Photos
  const { data: vAlbumPhotos } = await supabase.from('vendor_album_photos').select('id, vendor_id, image_url').not('image_url', 'is', null).not('image_url', 'ilike', '%supabase.co%');
  vAlbumPhotos?.forEach(vap => externalAssets.push({ table: 'vendor_album_photos', id: vap.id, vendor_id: vap.vendor_id, url: vap.image_url, column: 'image_url' }));

  console.log(`✅ Found ${externalAssets.length} external assets to migrate.`);

  if (externalAssets.length === 0) {
    console.log('🎉 All assets are already in Supabase! Nothing to do.');
    process.exit(0);
  }

  // 2. Create Backup
  const backupsDir = path.resolve(__dirname, '../backups');
  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupFile = path.join(backupsDir, `pre-migration-assets-${timestamp}.json`);
  fs.writeFileSync(backupFile, JSON.stringify({ timestamp, assets: externalAssets }, null, 2));
  console.log(`💾 Backup saved to: ${backupFile}`);

  // 3. Process each asset in parallel
  const CONCURRENCY_LIMIT = 5;
  const results: Result[] = [];
  const startTime = Date.now();
  
  console.log(`🚀 Processing with concurrency limit of ${CONCURRENCY_LIMIT}...\n`);

  async function worker(queue: AssetRecord[]) {
    while (queue.length > 0) {
      const asset = queue.shift()!;
      const index = externalAssets.length - queue.length;
      const prefix = `[${index}/${externalAssets.length}]`;
      
      try {
        const buffer = await downloadImage(asset.url);
        if (!buffer) {
          console.log(`${prefix} ${asset.table} (ID ${asset.id}) ❌ DOWNLOAD FAILED`);
          results.push({ success: false, table: asset.table, id: asset.id, previous_url: asset.url, error: 'Download failed' });
          continue;
        }

        let folder = 'gallery';
        if (asset.table === 'vendors') folder = 'logos';
        if (asset.table === 'promos') folder = 'promos';
        
        const ext = asset.url.split(/[#?]/)[0].split('.').pop()?.toLowerCase() || 'jpg';
        const targetPath = `${folder}/${asset.vendor_id || 'unknown'}/asset-${asset.id}-${Date.now()}.${ext}`;

        const publicUrl = await uploadToSupabase(buffer, targetPath);
        if (!publicUrl) {
          console.log(`${prefix} ${asset.table} (ID ${asset.id}) ❌ UPLOAD FAILED`);
          results.push({ success: false, table: asset.table, id: asset.id, previous_url: asset.url, error: 'Upload failed' });
          continue;
        }

        const { error: updateError } = await supabase
          .from(asset.table)
          .update({ [asset.column]: publicUrl })
          .eq('id', asset.id);

        if (updateError) {
          console.log(`${prefix} ${asset.table} (ID ${asset.id}) ❌ DB UPDATE FAILED`);
          results.push({ success: false, table: asset.table, id: asset.id, previous_url: asset.url, error: `Update failed: ${updateError.message}` });
          continue;
        }

        console.log(`${prefix} ${asset.table} (ID ${asset.id}) ✅ Migrated!`);
        results.push({ success: true, table: asset.table, id: asset.id, previous_url: asset.url, new_url: publicUrl });
      } catch (e) {
        console.log(`${prefix} ${asset.table} (ID ${asset.id}) ❌ EXCEPTION: ${e}`);
        results.push({ success: false, table: asset.table, id: asset.id, previous_url: asset.url, error: `Exception: ${e}` });
      }
    }
  }

  const queue = [...externalAssets];
  const workers = Array.from({ length: CONCURRENCY_LIMIT }, () => worker(queue));
  await Promise.all(workers);

  // 4. Final Report
  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log('\n📊 MIGRATION SUMMARY\n');
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed:     ${failed.length}`);
  console.log(`⏱️  Duration:   ${duration} minutes\n`);

  const reportFile = path.join(backupsDir, `migration-report-${timestamp}.json`);
  fs.writeFileSync(reportFile, JSON.stringify({ timestamp, summary: { total: results.length, successful: successful.length, failed: failed.length, duration_minutes: duration }, results }, null, 2));
  console.log(`📝 Full report saved: ${reportFile}\n`);
  console.log('=' .repeat(80));
  console.log('\n🎉 Process complete!\n');
}

main().catch(console.error);
