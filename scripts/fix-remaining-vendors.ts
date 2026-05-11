#!/usr/bin/env node
/**
 * Fix remaining 16 vendors with problematic URLs
 * Downloads directly from Google Drive and uploads to Supabase
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

interface Vendor {
  id: number;
  business_name: string;
  logo_url: string;
}

interface FixResult {
  success: boolean;
  vendor_id: number;
  business_name: string;
  previous_url: string;
  new_url?: string;
  error?: string;
}

// Extract Google Drive ID from various URL formats
function extractGoogleDriveId(url: string): string | null {
  // From image-proxy URL: /api/image-proxy?url=https%3A%2F%2Fdrive.google.com%2Fuc%3Fexport%3Dview%26id%3D{ID}
  const proxyMatch = url.match(/id%3D([a-zA-Z0-9_-]+)/);
  if (proxyMatch) return proxyMatch[1];
  
  // From /file/d/{ID}/view
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  
  // From uc?export=view&id={ID}
  const ucMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) return ucMatch[1];
  
  // From open?id={ID}
  const openMatch = url.match(/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch) return openMatch[1];
  
  return null;
}

// Download image from Google Drive direct URL
async function downloadFromGoogleDrive(fileId: string): Promise<Buffer | null> {
  const urls = [
    `https://drive.google.com/uc?export=download&id=${fileId}`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
  ];
  
  for (const url of urls) {
    try {
      console.log(`   Trying: ${url.substring(0, 60)}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) continue;
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.startsWith('image/')) {
        // Might be HTML redirect page, skip
        continue;
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
      
    } catch (error) {
      console.log(`   Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return null;
}

// Download from Google User Content ( lh3.googleusercontent.com )
async function downloadFromGoogleUserContent(url: string): Promise<Buffer | null> {
  try {
    console.log(`   Downloading from googleusercontent.com...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`   Failed: HTTP ${response.status}`);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
    
  } catch (error) {
    console.log(`   Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

// Upload to Supabase Storage
async function uploadToSupabase(buffer: Buffer, fileName: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('vendor-assets')
      .upload(`logos/${fileName}`, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    
    if (error) {
      console.error(`   Upload error: ${error.message}`);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('vendor-assets')
      .getPublicUrl(`logos/${fileName}`);
    
    return publicUrl;
    
  } catch (error) {
    console.error(`   Upload exception: ${error}`);
    return null;
  }
}

// Process a single vendor
async function processVendor(vendor: Vendor): Promise<FixResult> {
  console.log(`\n🔧 Processing: ${vendor.business_name} (ID: ${vendor.id})`);
  console.log(`   Current URL: ${vendor.logo_url.substring(0, 70)}...`);
  
  let imageBuffer: Buffer | null = null;
  let source = '';
  
  // Check URL type and download accordingly
  if (vendor.logo_url.includes('googleusercontent.com')) {
    // Direct download from googleusercontent.com
    imageBuffer = await downloadFromGoogleUserContent(vendor.logo_url);
    source = 'googleusercontent.com';
    
  } else {
    // Extract Google Drive ID and download
    const fileId = extractGoogleDriveId(vendor.logo_url);
    
    if (!fileId) {
      return {
        success: false,
        vendor_id: vendor.id,
        business_name: vendor.business_name,
        previous_url: vendor.logo_url,
        error: 'Could not extract Google Drive ID from URL',
      };
    }
    
    console.log(`   Extracted File ID: ${fileId}`);
    imageBuffer = await downloadFromGoogleDrive(fileId);
    source = 'Google Drive';
  }
  
  if (!imageBuffer) {
    return {
      success: false,
      vendor_id: vendor.id,
      business_name: vendor.business_name,
      previous_url: vendor.logo_url,
      error: `Failed to download from ${source}`,
    };
  }
  
  console.log(`   Downloaded: ${(imageBuffer.length / 1024).toFixed(1)} KB`);
  
  // Generate filename
  const timestamp = Date.now();
  const fileName = `vendor-${vendor.id}-${timestamp}.jpg`;
  
  // Upload to Supabase
  const publicUrl = await uploadToSupabase(imageBuffer, fileName);
  
  if (!publicUrl) {
    return {
      success: false,
      vendor_id: vendor.id,
      business_name: vendor.business_name,
      previous_url: vendor.logo_url,
      error: 'Failed to upload to Supabase Storage',
    };
  }
  
  console.log(`   Uploaded: ${publicUrl.substring(0, 70)}...`);
  
  // Update vendor record
  const { error: updateError } = await supabase
    .from('vendors')
    .update({ logo_url: publicUrl })
    .eq('id', vendor.id);
  
  if (updateError) {
    return {
      success: false,
      vendor_id: vendor.id,
      business_name: vendor.business_name,
      previous_url: vendor.logo_url,
      error: `Database update failed: ${updateError.message}`,
    };
  }
  
  console.log(`   ✅ Updated database`);
  
  return {
    success: true,
    vendor_id: vendor.id,
    business_name: vendor.business_name,
    previous_url: vendor.logo_url,
    new_url: publicUrl,
  };
}

async function main() {
  console.log('\n🔧 FIX REMAINING 16 VENDORS\n');
  console.log('=' .repeat(80));
  
  // Fetch the 16 remaining vendors
  const { data: vendors, error } = await supabase
    .from('vendors')
    .select('id, business_name, logo_url')
    .or('logo_url.like.%drive.google.com%,logo_url.like.%googleusercontent.com%,logo_url.like.%uc?export=view%,logo_url.like.%image-proxy%')
    .order('id');
  
  if (error) {
    console.error('❌ Error fetching vendors:', error.message);
    process.exit(1);
  }
  
  if (!vendors || vendors.length === 0) {
    console.log('✅ No remaining vendors to fix!');
    process.exit(0);
  }
  
  console.log(`Found ${vendors.length} vendors to process\n`);
  
  // Process each vendor
  const results: FixResult[] = [];
  
  for (const vendor of vendors) {
    const result = await processVendor(vendor);
    results.push(result);
    
    // Small delay between vendors
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n' + '=' .repeat(80));
  console.log('\n📊 SUMMARY\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`📈 Total: ${results.length}\n`);
  
  if (failed.length > 0) {
    console.log('⚠️  Failed vendors:\n');
    for (const result of failed) {
      console.log(`  • ${result.business_name} (ID: ${result.vendor_id})`);
      console.log(`    Error: ${result.error}\n`);
    }
  }
  
  if (successful.length > 0) {
    console.log('✨ Successfully fixed:\n');
    for (const result of successful) {
      console.log(`  • ${result.business_name} (ID: ${result.vendor_id})`);
    }
    console.log('');
  }
  
  // Save report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const reportPath = path.resolve(__dirname, `../backups/fix-remaining-report-${timestamp}.json`);
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
    },
    results,
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📝 Report saved: ${reportPath}\n`);
  
  console.log('=' .repeat(80));
  console.log('\n🎉 Done!\n');
}

main().catch(console.error);
