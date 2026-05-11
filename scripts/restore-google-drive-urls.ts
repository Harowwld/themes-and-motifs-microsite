#!/usr/bin/env node
/**
 * Restore Google Drive URLs from backup
 * 
 * Usage:
 *   npx tsx scripts/restore-google-drive-urls.ts [options]
 * 
 * Options:
 *   --backup-file=PATH   Specific backup file to restore from
 *   --vendor-id=N        Restore only specific vendor ID
 *   --dry-run            Show what would be restored without making changes
 *   --latest             Use latest backup file (default)
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
  backupFile: null as string | null,
  vendorId: null as number | null,
  dryRun: false,
  useLatest: true,
};

for (const arg of args) {
  if (arg.startsWith('--backup-file=')) {
    options.backupFile = arg.split('=')[1];
    options.useLatest = false;
  } else if (arg.startsWith('--vendor-id=')) {
    options.vendorId = parseInt(arg.split('=')[1], 10);
  } else if (arg === '--dry-run') {
    options.dryRun = true;
  } else if (arg === '--latest') {
    options.useLatest = true;
    options.backupFile = null;
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

interface RestoreResult {
  success: boolean;
  vendor_id: number;
  business_name: string;
  previous_url?: string;
  restored_url: string;
  error?: string;
}

async function findBackupFile(): Promise<string | null> {
  if (options.backupFile) {
    const customPath = path.resolve(options.backupFile);
    if (fs.existsSync(customPath)) {
      return customPath;
    }
    console.error(`❌ Backup file not found: ${customPath}`);
    return null;
  }
  
  if (options.useLatest) {
    const latestPath = path.resolve(__dirname, '../backups/latest.json');
    if (fs.existsSync(latestPath)) {
      // Resolve symlink to actual file
      const realPath = fs.realpathSync(latestPath);
      return realPath;
    }
    
    // Fallback: find most recent backup
    const backupsDir = path.resolve(__dirname, '../backups');
    if (!fs.existsSync(backupsDir)) {
      console.error('❌ Backups directory not found');
      return null;
    }
    
    const files = fs.readdirSync(backupsDir)
      .filter(f => f.startsWith('google-drive-urls-') && f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      console.error('❌ No backup files found');
      return null;
    }
    
    return path.join(backupsDir, files[0]);
  }
  
  return null;
}

async function restoreVendor(
  supabase: any,
  vendor: VendorBackup,
  currentUrl: string | null
): Promise<RestoreResult> {
  try {
    // Check if already has Google Drive URL (no need to restore)
    if (currentUrl && (
      currentUrl.includes('drive.google.com') ||
      currentUrl.includes('googleusercontent.com') ||
      currentUrl.includes('uc?export=view')
    )) {
      return {
        success: false,
        vendor_id: vendor.id,
        business_name: vendor.business_name,
        previous_url: currentUrl,
        restored_url: vendor.logo_url,
        error: 'Already has Google Drive URL (not migrated)',
      };
    }
    
    if (options.dryRun) {
      return {
        success: true,
        vendor_id: vendor.id,
        business_name: vendor.business_name,
        previous_url: currentUrl || 'null',
        restored_url: vendor.logo_url,
      };
    }
    
    // Update vendor record
    const { error } = await supabase
      .from('vendors')
      .update({ logo_url: vendor.logo_url })
      .eq('id', vendor.id);
    
    if (error) {
      return {
        success: false,
        vendor_id: vendor.id,
        business_name: vendor.business_name,
        previous_url: currentUrl || 'null',
        restored_url: vendor.logo_url,
        error: `Database update failed: ${error.message}`,
      };
    }
    
    return {
      success: true,
      vendor_id: vendor.id,
      business_name: vendor.business_name,
      previous_url: currentUrl || 'null',
      restored_url: vendor.logo_url,
    };
    
  } catch (error) {
    return {
      success: false,
      vendor_id: vendor.id,
      business_name: vendor.business_name,
      previous_url: currentUrl || 'null',
      restored_url: vendor.logo_url,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function main() {
  console.log('\n🔄 RESTORE GOOGLE DRIVE URLS\n');
  console.log('=' .repeat(80));
  
  if (options.dryRun) {
    console.log('\n🏃 DRY RUN MODE - No changes will be made\n');
  }
  
  // Find backup file
  const backupFile = await findBackupFile();
  if (!backupFile) {
    process.exit(1);
  }
  
  console.log(`📁 Backup file: ${backupFile}\n`);
  
  // Load backup
  let backupData: {
    metadata: {
      created_at: string;
      total_vendors: number;
    };
    vendors: VendorBackup[];
  };
  
  try {
    const content = fs.readFileSync(backupFile, 'utf-8');
    backupData = JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to parse backup file:', error);
    process.exit(1);
  }
  
  console.log('📊 Backup Info:');
  console.log(`  Created: ${backupData.metadata.created_at}`);
  console.log(`  Total vendors: ${backupData.metadata.total_vendors}`);
  console.log('');
  
  // Filter to specific vendor if requested
  let vendorsToRestore = backupData.vendors;
  if (options.vendorId) {
    vendorsToRestore = vendorsToRestore.filter(v => v.id === options.vendorId);
    if (vendorsToRestore.length === 0) {
      console.error(`❌ Vendor ID ${options.vendorId} not found in backup`);
      process.exit(1);
    }
  }
  
  console.log(`🔧 Will restore ${vendorsToRestore.length} vendor(s)\n`);
  
  // Fetch current vendor data to compare
  console.log('🔍 Fetching current vendor data...\n');
  
  const vendorIds = vendorsToRestore.map(v => v.id);
  const { data: currentVendors, error: fetchError } = await supabase
    .from('vendors')
    .select('id, business_name, logo_url')
    .in('id', vendorIds);
  
  if (fetchError) {
    console.error('❌ Failed to fetch current vendor data:', fetchError.message);
    process.exit(1);
  }
  
  const currentUrlMap = new Map(
    (currentVendors || []).map(v => [v.id, v.logo_url])
  );
  
  // Restore each vendor
  console.log('🔄 Restoring vendors...\n');
  
  const results: RestoreResult[] = [];
  
  for (const vendor of vendorsToRestore) {
    const currentUrl = currentUrlMap.get(vendor.id);
    const result = await restoreVendor(supabase, vendor, currentUrl || null);
    results.push(result);
    
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${vendor.business_name} (ID: ${vendor.id})`);
    
    if (result.success) {
      console.log(`   ${result.previous_url?.substring(0, 50)}...`);
      console.log(`   → ${result.restored_url.substring(0, 50)}...\n`);
    } else {
      console.log(`   Error: ${result.error}\n`);
    }
  }
  
  // Summary
  console.log('=' .repeat(80));
  console.log('\n📊 RESTORE SUMMARY\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const skipped = failed.filter(r => r.error?.includes('Already has Google Drive'));
  const actualFailed = failed.filter(r => !r.error?.includes('Already has Google Drive'));
  
  console.log(`✅ Successfully restored: ${successful.length}`);
  console.log(`⏭️  Skipped (already Google Drive): ${skipped.length}`);
  console.log(`❌ Failed: ${actualFailed.length}`);
  console.log(`📈 Total: ${results.length}\n`);
  
  if (actualFailed.length > 0) {
    console.log('⚠️  Failed restorations:\n');
    for (const result of actualFailed) {
      console.log(`  • ${result.business_name} (ID: ${result.vendor_id})`);
      console.log(`    Error: ${result.error}`);
    }
    console.log('');
  }
  
  if (!options.dryRun && successful.length > 0) {
    // Save restore report
    const reportsDir = path.resolve(__dirname, '../backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const reportFile = path.join(reportsDir, `restore-report-${timestamp}.json`);
    
    const report = {
      timestamp: new Date().toISOString(),
      restored_from: backupFile,
      summary: {
        total: results.length,
        successful: successful.length,
        skipped: skipped.length,
        failed: actualFailed.length,
      },
      results,
    };
    
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`📝 Restore report saved: ${reportFile}\n`);
  }
  
  console.log('=' .repeat(80));
  console.log('\n🎉 Restore complete!\n');
  
  if (options.dryRun) {
    console.log('🏃 This was a dry run. No changes were made.');
    console.log('   Run without --dry-run to actually restore.\n');
  }
}

main().catch(console.error);
