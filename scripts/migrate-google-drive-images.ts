#!/usr/bin/env node
/**
 * Script to migrate Google Drive images to Supabase Storage
 * 
 * Usage:
 *   npx tsx scripts/migrate-google-drive-images.ts [options]
 * 
 * Options:
 *   --batch-size=N     Process N vendors at a time (default: 10)
 *   --vendor-id=N      Process specific vendor ID only
 *   --dry-run          Show what would be done without making changes
 *   --edge-function    Use Edge Function (default: false, runs locally)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  batchSize: 10,
  vendorId: null as number | null,
  dryRun: false,
  useEdgeFunction: false,
};

for (const arg of args) {
  if (arg.startsWith('--batch-size=')) {
    options.batchSize = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--vendor-id=')) {
    options.vendorId = parseInt(arg.split('=')[1], 10);
  } else if (arg === '--dry-run') {
    options.dryRun = true;
  } else if (arg === '--edge-function') {
    options.useEdgeFunction = true;
  }
}

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
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Vendor {
  id: number;
  business_name: string;
  logo_url: string;
}

interface MigrationResult {
  success: boolean;
  vendor_id: number;
  business_name: string;
  original_url: string;
  new_url?: string;
  error?: string;
  original_size?: number;
  compressed_size?: number;
}

async function fetchVendorsWithGoogleDriveUrls(): Promise<Vendor[]> {
  console.log('🔍 Fetching vendors with Google Drive URLs...');
  
  let query = supabase
    .from('vendors')
    .select('id, business_name, logo_url')
    .or('logo_url.like.%drive.google.com%,logo_url.like.%googleusercontent.com%,logo_url.like.%uc?export=view%');
  
  if (options.vendorId) {
    query = query.eq('id', options.vendorId);
  }
  
  query = query.limit(options.batchSize);
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Failed to fetch vendors: ${error.message}`);
  }
  
  console.log(`✅ Found ${data?.length || 0} vendors with Google Drive URLs`);
  return data || [];
}

async function invokeEdgeFunction(vendors: Vendor[]): Promise<MigrationResult[]> {
  console.log('🚀 Invoking Edge Function...');
  
  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/compress-and-upload-images`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          batch_size: options.batchSize,
          specific_vendor_ids: options.vendorId ? [options.vendorId] : [],
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Edge Function failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    return result.results || [];
  } catch (error) {
    console.error('❌ Edge Function error:', error);
    throw error;
  }
}

async function runLocalMigration(vendors: Vendor[]): Promise<MigrationResult[]> {
  console.log('⚠️  Local migration not fully implemented');
  console.log('   Please deploy the Edge Function and use --edge-function flag');
  
  // Return mock results for dry run
  return vendors.map(v => ({
    success: false,
    vendor_id: v.id,
    business_name: v.business_name,
    original_url: v.logo_url,
    error: 'Local migration not implemented. Use --edge-function flag.',
  }));
}

async function displayResults(results: MigrationResult[]) {
  console.log('\n📊 MIGRATION RESULTS\n');
  console.log('=' .repeat(80));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`📈 Total: ${results.length}`);
  
  if (successful.length > 0) {
    const totalOriginal = successful.reduce((sum, r) => sum + (r.original_size || 0), 0);
    const totalCompressed = successful.reduce((sum, r) => sum + (r.compressed_size || 0), 0);
    const savings = ((1 - totalCompressed / totalOriginal) * 100).toFixed(1);
    
    console.log(`\n💾 Storage saved: ${(totalOriginal - totalCompressed / 1024 / 1024).toFixed(2)} MB (${savings}%)`);
  }
  
  if (failed.length > 0) {
    console.log('\n⚠️  Failed migrations:\n');
    for (const result of failed.slice(0, 5)) {
      console.log(`   • ${result.business_name} (ID: ${result.vendor_id})`);
      console.log(`     Error: ${result.error}`);
    }
    if (failed.length > 5) {
      console.log(`   ... and ${failed.length - 5} more`);
    }
  }
  
  if (successful.length > 0 && options.dryRun === false) {
    console.log('\n✨ Successfully migrated vendors:\n');
    for (const result of successful.slice(0, 5)) {
      console.log(`   • ${result.business_name} (ID: ${result.vendor_id})`);
      if (result.original_size && result.compressed_size) {
        const reduction = ((1 - result.compressed_size / result.original_size) * 100).toFixed(1);
        console.log(`     ${(result.original_size / 1024).toFixed(1)} KB → ${(result.compressed_size / 1024).toFixed(1)} KB (${reduction}%)`);
      }
    }
    if (successful.length > 5) {
      console.log(`   ... and ${successful.length - 5} more`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
}

async function saveReport(results: MigrationResult[]) {
  const reportPath = path.resolve(__dirname, '../migration-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    options,
    summary: {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    },
    results,
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📝 Report saved to: ${reportPath}`);
}

async function checkBackup(): Promise<boolean> {
  const backupsDir = path.resolve(__dirname, '../backups');
  const latestLink = path.join(backupsDir, 'latest.json');
  
  if (fs.existsSync(latestLink)) {
    const realPath = fs.realpathSync(latestLink);
    const stats = fs.statSync(realPath);
    const age = Date.now() - stats.mtime.getTime();
    const hours = age / (1000 * 60 * 60);
    
    console.log(`📁 Latest backup found: ${path.basename(realPath)}`);
    console.log(`   Age: ${hours.toFixed(1)} hours old\n`);
    return true;
  }
  
  const files = fs.readdirSync(backupsDir)
    .filter(f => f.startsWith('google-drive-urls-') && f.endsWith('.json'));
  
  if (files.length > 0) {
    console.log(`📁 Found ${files.length} backup(s) in backups/ directory\n`);
    return true;
  }
  
  return false;
}

async function promptForBackup(): Promise<void> {
  console.log('⚠️  No backup found!\n');
  console.log('It is STRONGLY recommended to backup before migrating.');
  console.log('\nRun this command first:');
  console.log('  npx tsx scripts/backup-google-drive-urls.ts\n');
  console.log('Or run migration with --skip-backup-check to proceed anyway.\n');
  process.exit(1);
}

async function main() {
  console.log('\n🖼️  GOOGLE DRIVE IMAGE MIGRATION TOOL\n');
  console.log('=' .repeat(80));
  console.log(`\nConfiguration:`);
  console.log(`  Batch size: ${options.batchSize}`);
  console.log(`  Vendor ID: ${options.vendorId || 'All'}`);
  console.log(`  Dry run: ${options.dryRun ? 'Yes' : 'No'}`);
  console.log(`  Use Edge Function: ${options.useEdgeFunction ? 'Yes' : 'No'}`);
  console.log('');
  
  if (options.dryRun) {
    console.log('🏃 DRY RUN MODE - No changes will be made\n');
  }
  
  // Safety check: require backup before migration
  if (!options.dryRun) {
    console.log('🔒 Safety Check: Verifying backup exists...\n');
    const hasBackup = await checkBackup();
    
    if (!hasBackup) {
      await promptForBackup();
    }
  }
  
  try {
    // Fetch vendors
    const vendors = await fetchVendorsWithGoogleDriveUrls();
    
    if (vendors.length === 0) {
      console.log('✅ No vendors with Google Drive URLs found!');
      process.exit(0);
    }
    
    if (options.dryRun) {
      console.log('\n📋 Would process the following vendors:\n');
      for (const vendor of vendors) {
        console.log(`   • ${vendor.business_name} (ID: ${vendor.id})`);
        console.log(`     URL: ${vendor.logo_url.substring(0, 60)}...`);
      }
      process.exit(0);
    }
    
    // Process vendors
    let results: MigrationResult[];
    
    if (options.useEdgeFunction) {
      results = await invokeEdgeFunction(vendors);
    } else {
      results = await runLocalMigration(vendors);
    }
    
    // Display results
    await displayResults(results);
    
    // Save report
    await saveReport(results);
    
    console.log('\n🎉 Migration complete!\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
