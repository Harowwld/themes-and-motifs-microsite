#!/usr/bin/env node
/**
 * Check all migrated images for size > 2MB
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

const LIMIT = 2 * 1024 * 1024; // 2MB

async function checkImageSize(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength) : null;
  } catch {
    return null;
  }
}

async function main() {
  console.log('\n🔍 CHECKING IMAGE SIZES\n');
  console.log('=' .repeat(80));
  console.log(`📏 Limit: 2MB (${LIMIT} bytes)\n`);

  // Get all Supabase Storage images
  const { data: images, error } = await supabase
    .from('vendor_images')
    .select('id, vendor_id, image_url')
    .like('image_url', '%vendor-assets%')
    .order('id');

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  console.log(`📊 Total images to check: ${images.length}\n`);
  console.log('=' .repeat(80));

  const overLimit: { id: number; vendor_id: number; size_mb: number; url: string }[] = [];
  const checked: { id: number; vendor_id: number; size_kb: number }[] = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    process.stdout.write(`\r[${i + 1}/${images.length}] Checking image ${img.id}...`);

    const size = await checkImageSize(img.image_url);
    if (size !== null) {
      const sizeKb = Math.round(size / 1024);
      checked.push({ id: img.id, vendor_id: img.vendor_id, size_kb: sizeKb });

      if (size > LIMIT) {
        overLimit.push({
          id: img.id,
          vendor_id: img.vendor_id,
          size_mb: parseFloat((size / 1024 / 1024).toFixed(2)),
          url: img.image_url
        });
      }
    }
  }

  console.log('\n\n' + '=' .repeat(80));
  console.log('\n📊 RESULTS\n');

  const totalSize = checked.reduce((sum, c) => sum + c.size_kb, 0);
  const avgSize = Math.round(totalSize / checked.length);
  const maxSize = Math.max(...checked.map(c => c.size_kb));
  const minSize = Math.min(...checked.map(c => c.size_kb));

  console.log(`📈 Total checked: ${checked.length}`);
  console.log(`📏 Average size: ${avgSize}KB`);
  console.log(`📏 Largest: ${Math.round(maxSize / 1024)}MB`);
  console.log(`📏 Smallest: ${minSize}KB`);
  console.log(`⚠️  Over 2MB: ${overLimit.length}`);

  if (overLimit.length > 0) {
    console.log('\n⚠️  IMAGES OVER 2MB:\n');
    for (const img of overLimit) {
      console.log(`  ID ${img.id} (vendor ${img.vendor_id}): ${img.size_mb}MB`);
    }
  } else {
    console.log('\n✅ All images are under 2MB!');
  }

  console.log('');
}

main().catch(console.error);
