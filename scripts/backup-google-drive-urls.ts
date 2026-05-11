#!/usr/bin/env node
/**
 * Backup Google Drive URLs before migration
 * 
 * Usage:
 *   npx tsx scripts/backup-google-drive-urls.ts
 * 
 * Creates a backup file at: backups/google-drive-urls-YYYY-MM-DD-HHMMSS.json
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      if (!process.env[key]) {
        process.env[key] = value.replace(/^"|"$/g, '');
      }
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

interface VendorBackup {
  id: number;
  business_name: string;
  logo_url: string;
  backed_up_at: string;
}

async function backupGoogleDriveUrls() {
  console.log('\n💾 BACKUP GOOGLE DRIVE URLS\n');
  console.log('=' .repeat(80));
  
  // Fetch vendors with Google Drive URLs
  console.log('🔍 Finding vendors with Google Drive URLs...\n');
  
  const { data: vendors, error } = await supabase
    .from('vendors')
    .select('id, business_name, logo_url')
    .or('logo_url.like.%drive.google.com%,logo_url.like.%googleusercontent.com%,logo_url.like.%uc?export=view%')
    .order('id');
  
  if (error) {
    console.error('❌ Error fetching vendors:', error.message);
    process.exit(1);
  }
  
  if (!vendors || vendors.length === 0) {
    console.log('✅ No vendors with Google Drive URLs found');
    process.exit(0);
  }
  
  console.log(`✅ Found ${vendors.length} vendors with Google Drive URLs\n`);
  
  // Prepare backup data
  const backupData = {
    metadata: {
      created_at: new Date().toISOString(),
      total_vendors: vendors.length,
      supabase_url: supabaseUrl,
      version: '1.0.0',
    },
    vendors: vendors.map(v => ({
      id: v.id,
      business_name: v.business_name,
      logo_url: v.logo_url,
      backed_up_at: new Date().toISOString(),
    })),
  };
  
  // Ensure backups directory exists
  const backupsDir = path.resolve(__dirname, '../backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupFile = path.join(backupsDir, `google-drive-urls-${timestamp}.json`);
  
  // Write backup file
  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
  
  console.log('✅ Backup created successfully!\n');
  console.log(`📁 File: ${backupFile}`);
  console.log(`📊 Total vendors backed up: ${vendors.length}`);
  console.log(`🕐 Created at: ${backupData.metadata.created_at}`);
  
  // Show sample
  console.log('\n📋 Sample entries:\n');
  for (const vendor of vendors.slice(0, 3)) {
    console.log(`  ID ${vendor.id}: ${vendor.business_name}`);
    console.log(`  URL: ${vendor.logo_url.substring(0, 70)}...\n`);
  }
  
  if (vendors.length > 3) {
    console.log(`  ... and ${vendors.length - 3} more\n`);
  }
  
  // Create a symlink to latest backup
  const latestLink = path.join(backupsDir, 'latest.json');
  try {
    if (fs.existsSync(latestLink)) {
      fs.unlinkSync(latestLink);
    }
    fs.symlinkSync(backupFile, latestLink);
    console.log('🔗 Created symlink: backups/latest.json\n');
  } catch (e) {
    // Ignore symlink errors on Windows
  }
  
  console.log('=' .repeat(80));
  console.log('\n🎉 Backup complete!\n');
  console.log('Next steps:');
  console.log('  1. Run migration: npx tsx scripts/migrate-google-drive-images.ts');
  console.log('  2. If needed, restore: npx tsx scripts/restore-google-drive-urls.ts');
  console.log('');
}

backupGoogleDriveUrls().catch(console.error);
