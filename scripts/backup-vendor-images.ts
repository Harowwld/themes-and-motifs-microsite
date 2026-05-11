#!/usr/bin/env node
/**
 * Backup vendor_images URLs before migration
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

async function backup() {
  console.log('\n💾 BACKUP VENDOR IMAGES\n');
  console.log('=' .repeat(80));
  
  const { data: images, error } = await supabase
    .from('vendor_images')
    .select('id, vendor_id, image_url, display_order, created_at')
    .or('image_url.like.%drive.google.com%,image_url.like.%googleusercontent.com%,image_url.like.%uc?export=view%,image_url.like.%image-proxy%')
    .order('vendor_id, display_order');
  
  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  if (!images || images.length === 0) {
    console.log('✅ No Google Drive URLs found');
    process.exit(0);
  }
  
  console.log(`✅ Found ${images.length} vendor_images with Google Drive URLs\n`);
  
  const backupData = {
    metadata: {
      created_at: new Date().toISOString(),
      total_images: images.length,
      table: 'vendor_images',
    },
    images,
  };
  
  const backupsDir = path.resolve(__dirname, '../backups');
  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupFile = path.join(backupsDir, `vendor-images-${timestamp}.json`);
  
  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
  
  console.log(`📁 File: ${backupFile}`);
  console.log(`📊 Total images: ${images.length}\n`);
  
  // Create symlink
  const latestLink = path.join(backupsDir, 'vendor-images-latest.json');
  try {
    if (fs.existsSync(latestLink)) fs.unlinkSync(latestLink);
    fs.symlinkSync(backupFile, latestLink);
  } catch (e) { /* ignore */ }
  
  console.log('=' .repeat(80));
  console.log('\n🎉 Backup complete!\n');
}

backup().catch(console.error);
