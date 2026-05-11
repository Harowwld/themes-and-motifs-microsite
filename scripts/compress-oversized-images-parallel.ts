#!/usr/bin/env node
/**
 * Parallel compression of oversized images in vendor-assets bucket
 * Uses sharp for resize + JPEG compression with concurrent processing
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

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

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 80;
const CONCURRENCY = 8; // Parallel workers
const BATCH_DELAY = 1000; // ms between batches

// List of oversized images (from SQL query)
const OVERSIZED_IMAGES = [
  { name: "gallery/vendor-212-img-751-1778481008985.jpg", size_mb: 14.00 },
  { name: "gallery/vendor-592-img-1041-1778481409330.jpg", size_mb: 11.00 },
  { name: "gallery/vendor-212-img-753-1778481043492.jpg", size_mb: 11.00 },
  { name: "gallery/vendor-212-img-745-1778480917736.jpg", size_mb: 9.00 },
  { name: "gallery/vendor-592-img-1037-1778481323252.jpg", size_mb: 9.00 },
  { name: "gallery/vendor-592-img-1037-1778480427338.jpg", size_mb: 9.00 },
  { name: "gallery/vendor-270-img-2255-1778480729000.jpg", size_mb: 8.00 },
  { name: "gallery/vendor-205-img-445-1778480294002.jpg", size_mb: 8.00 },
  { name: "gallery/vendor-205-img-468-1778480703792.jpg", size_mb: 7.00 },
  { name: "gallery/vendor-212-img-749-1778480987140.jpg", size_mb: 7.00 },
  { name: "gallery/vendor-293-img-6245-1778480848252.jpg", size_mb: 7.00 },
  { name: "gallery/vendor-212-img-752-1778480379179.jpg", size_mb: 7.00 },
  { name: "gallery/vendor-212-img-752-1778481029872.jpg", size_mb: 7.00 },
  { name: "gallery/vendor-205-img-452-1778480382333.jpg", size_mb: 7.00 },
  { name: "gallery/vendor-205-img-452-1778480472025.jpg", size_mb: 7.00 },
  { name: "gallery/vendor-293-img-6238-1778480846561.jpg", size_mb: 6.00 },
  { name: "gallery/vendor-205-img-455-1778480519091.jpg", size_mb: 6.00 },
  { name: "gallery/vendor-205-img-446-1778480310858.jpg", size_mb: 6.00 },
  { name: "gallery/vendor-293-img-6242-1778480849919.jpg", size_mb: 6.00 },
  { name: "gallery/vendor-293-img-6250-1778480852348.jpg", size_mb: 6.00 },
  { name: "logos/vendor-720-1778479911100.jpg", size_mb: 6.00 },
  { name: "gallery/vendor-205-img-462-1778480617616.jpg", size_mb: 6.00 },
  { name: "gallery/vendor-592-img-1035-1778481288484.jpg", size_mb: 5.00 },
  { name: "gallery/vendor-222-img-4772-1778480820067.jpg", size_mb: 5.00 },
  { name: "gallery/vendor-592-img-1039-1778481376272.jpg", size_mb: 5.00 },
  { name: "gallery/vendor-212-img-747-1778480969962.jpg", size_mb: 5.00 },
  { name: "gallery/vendor-592-img-1038-1778481352229.jpg", size_mb: 5.00 },
  { name: "gallery/vendor-205-img-461-1778480578717.jpg", size_mb: 5.00 },
  { name: "gallery/vendor-592-img-1033-1778481238927.jpg", size_mb: 4.00 },
  { name: "gallery/vendor-592-img-1033-1778480430306.jpg", size_mb: 4.00 },
  { name: "gallery/vendor-212-img-754-1778481061268.jpg", size_mb: 4.00 },
  { name: "gallery/vendor-592-img-1034-1778481266888.jpg", size_mb: 4.00 },
  { name: "gallery/vendor-592-img-1040-1778481391204.jpg", size_mb: 4.00 },
  { name: "gallery/vendor-592-img-1040-1778480427112.jpg", size_mb: 4.00 },
  { name: "gallery/vendor-592-img-1036-1778481304661.jpg", size_mb: 4.00 },
  { name: "gallery/vendor-270-img-2252-1778480721375.jpg", size_mb: 3.00 },
  { name: "gallery/vendor-592-img-1032-1778481226534.jpg", size_mb: 3.00 },
  { name: "gallery/vendor-592-img-1032-1778480422906.jpg", size_mb: 3.00 },
  { name: "gallery/vendor-203-img-416-1778480238533.jpg", size_mb: 3.00 },
  { name: "gallery/vendor-675-img-6545-1778481071801.jpg", size_mb: 3.00 },
  { name: "gallery/vendor-205-img-447-1778480324531.jpg", size_mb: 3.00 },
  { name: "gallery/vendor-506-img-2358-1778480758779.jpg", size_mb: 3.00 },
  { name: "gallery/vendor-205-img-444-1778480284299.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-212-img-746-1778480961446.jpg", size_mb: 2.00 },
  { name: "logos/vendor-459-1778479872765.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-212-img-748-1778480979177.jpg", size_mb: 2.00 },
  { name: "logos/vendor-546-1778479881613.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-898-img-6400-1778480930717.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-205-img-449-1778480401134.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-506-img-2347-1778480760635.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-205-img-443-1778480277148.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-270-img-2246-1778480720873.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-414-img-7594-1778481462892.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-222-img-4774-1778480796808.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-506-img-2351-1778480762050.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-205-img-454-1778480506409.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-205-img-454-1778480382575.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-212-img-750-1778481000319.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-329-img-6497-1778480950097.jpg", size_mb: 2.00 },
  { name: "logos/vendor-670-1778479902980.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-329-img-6498-1778480948448.jpg", size_mb: 2.00 },
  { name: "logos/vendor-855-1778479923693.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-204-img-6893-1778481223842.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-476-img-678-1778480749847.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-476-img-678-1778480380534.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-693-img-1511-1778480560526.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-205-img-450-1778480417657.jpg", size_mb: 2.00 },
  { name: "gallery/vendor-205-img-448-1778480363543.jpg", size_mb: 2.00 },
];

interface Result {
  name: string;
  old_mb: number;
  new_kb: number;
  success: boolean;
}

async function downloadFromStorage(filePath: string): Promise<Buffer | null> {
  try {
    const { data, error } = await supabase.storage
      .from('vendor-assets')
      .download(filePath);
    if (error || !data) return null;
    return Buffer.from(await data.arrayBuffer());
  } catch { return null; }
}

async function compressImage(buffer: Buffer): Promise<Buffer | null> {
  try {
    return await sharp(buffer)
      .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toBuffer();
  } catch { return null; }
}

async function uploadToStorage(buffer: Buffer, filePath: string): Promise<string | null> {
  try {
    const { error } = await supabase.storage
      .from('vendor-assets')
      .upload(filePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage.from('vendor-assets').getPublicUrl(filePath);
    return publicUrl;
  } catch { return null; }
}

async function processImage(file: { name: string; size_mb: number }, index: number): Promise<Result> {
  const buffer = await downloadFromStorage(file.name);
  if (!buffer) {
    return { name: file.name, old_mb: file.size_mb, new_kb: 0, success: false };
  }

  const compressed = await compressImage(buffer);
  if (!compressed) {
    return { name: file.name, old_mb: file.size_mb, new_kb: 0, success: false };
  }

  const newUrl = await uploadToStorage(compressed, file.name);
  if (!newUrl) {
    return { name: file.name, old_mb: file.size_mb, new_kb: 0, success: false };
  }

  const newKb = Math.round(compressed.length / 1024);
  process.stdout.write(`\r[${index + 1}/${OVERSIZED_IMAGES.length}] ✅ ${file.name} (${file.size_mb}MB → ${newKb}KB)`);
  
  return { name: file.name, old_mb: file.size_mb, new_kb: newKb, success: true };
}

async function processBatch(batch: { name: string; size_mb: number }[], startIndex: number): Promise<Result[]> {
  const promises = batch.map((file, i) => processImage(file, startIndex + i));
  return Promise.all(promises);
}

async function main() {
  console.log('\n🗜️  PARALLEL COMPRESS OVERSIZED IMAGES\n');
  console.log('=' .repeat(80));
  console.log(`📏 Max size: 2MB`);
  console.log(`📐 Max dimensions: ${MAX_WIDTH}x${MAX_HEIGHT}px`);
  console.log(`🎨 JPEG quality: ${QUALITY}%`);
  console.log(`⚡ Concurrency: ${CONCURRENCY} workers`);
  console.log(`📊 Images to compress: ${OVERSIZED_IMAGES.length}\n`);
  console.log('=' .repeat(80));

  const results: Result[] = [];
  const startTime = Date.now();

  // Process in batches
  for (let i = 0; i < OVERSIZED_IMAGES.length; i += CONCURRENCY) {
    const batch = OVERSIZED_IMAGES.slice(i, i + CONCURRENCY);
    const batchResults = await processBatch(batch, i);
    results.push(...batchResults);

    // Delay between batches
    if (i + CONCURRENCY < OVERSIZED_IMAGES.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
    }
  }

  console.log('\n\n' + '=' .repeat(80));
  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  
  console.log('\n📊 SUMMARY\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalSaved = results.reduce((sum, r) => sum + (r.old_mb * 1024 - r.new_kb), 0);

  console.log(`✅ Compressed: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`💾 Space saved: ${Math.round(totalSaved / 1024)}MB`);
  console.log(`⏱️  Duration: ${duration} minutes\n`);

  if (failed.length > 0) {
    console.log('⚠️  Failed files:');
    for (const f of failed) {
      console.log(`  ${f.name}`);
    }
    console.log('');
  }
}

main().catch(console.error);
