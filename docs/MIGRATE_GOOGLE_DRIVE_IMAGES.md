# Google Drive Image Migration Guide

## Overview

This solution automatically migrates vendor logo images from Google Drive to Supabase Storage with compression.

## Prerequisites

1. **Supabase CLI** installed
2. **Supabase Service Role Key** in your `.env` file
3. **vendor-assets** bucket exists (it does!)

## Quick Start

### ⚠️ IMPORTANT: Backup First!

**Always backup before migrating!** This saves your original Google Drive URLs so you can restore them if needed.

```bash
# Create backup of all Google Drive URLs
npx tsx scripts/backup-google-drive-urls.ts
```

This creates: `backups/google-drive-urls-YYYY-MM-DD-HHMMSS.json`

### Step 1: Deploy the Edge Function

```bash
# Deploy the function to Supabase
npx supabase functions deploy compress-and-upload-images

# Set environment variables for the function
npx supabase secrets set SUPABASE_URL=your_supabase_url
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 2: Run the Migration Script

```bash
# Dry run - see what would be migrated (no changes)
npx tsx scripts/migrate-google-drive-images.ts --dry-run

# Migrate a single vendor (for testing)
npx tsx scripts/migrate-google-drive-images.ts --vendor-id=889 --edge-function

# Migrate batch of 10 vendors
npx tsx scripts/migrate-google-drive-images.ts --batch-size=10 --edge-function

# Migrate all (run multiple times)
npx tsx scripts/migrate-google-drive-images.ts --batch-size=50 --edge-function
```

## 🔄 Restore (Rollback)

If something goes wrong, restore original Google Drive URLs:

```bash
# Restore from latest backup (dry run first)
npx tsx scripts/restore-google-drive-urls.ts --dry-run

# Actually restore
npx tsx scripts/restore-google-drive-urls.ts

# Restore specific vendor only
npx tsx scripts/restore-google-drive-urls.ts --vendor-id=889

# Restore from specific backup file
npx tsx scripts/restore-google-drive-urls.ts --backup-file=backups/google-drive-urls-2024-01-15-120000.json
```

**What gets restored:**
- Original Google Drive URLs in vendor records
- No changes to uploaded Supabase Storage files (they remain)

## File Structure

```
backups/
├── google-drive-urls-2024-01-15-120000.json  # Backup files
├── google-drive-urls-2024-01-15-130000.json
├── latest.json -> google-drive-urls-...       # Symlink to latest
├── restore-report-2024-01-15-140000.json      # Restore reports
└── migration-report-2024-01-15-140000.json  # Migration reports
```

## What It Does

1. **Extracts** Google Drive file IDs from various URL formats
2. **Downloads** images from Google Drive (with retry logic)
3. **Compresses** images to under 2MB using Canvas API
4. **Uploads** to Supabase Storage (`vendor-assets/logos/`)
5. **Updates** vendor records with new Supabase URLs

## Google Drive URL Formats Supported

- `https://drive.google.com/file/d/{ID}/view`
- `https://drive.google.com/uc?export=view&id={ID}`
- `https://drive.google.com/open?id={ID}`
- `https://drive.google.com/thumbnail?id={ID}`

## Compression Settings

- **Target size**: 2MB maximum
- **Max dimensions**: 1200x1200px
- **Format**: JPEG
- **Quality**: 90% → 30% (adaptive based on size)

## Monitoring Progress

Check migration results in the generated `migration-report.json` file.

## Troubleshooting

### Backup Issues

#### "No backup found"
Migration script requires a backup before running (for safety). Create one:
```bash
npx tsx scripts/backup-google-drive-urls.ts
```

#### Backup file is old
Backups don't expire, but you should create a fresh one before major migrations:
```bash
# Create new backup (won't overwrite old ones)
npx tsx scripts/backup-google-drive-urls.ts
```

### Restore Issues

#### "Vendor not found in backup"
- The vendor was added after the backup was created
- Check backup age: `ls -la backups/`
- Use a newer backup file with `--backup-file=`

#### "Already has Google Drive URL (not migrated)"
This vendor was already restored or was never migrated. No action needed.

#### "Failed to restore - Database update failed"
- Check Supabase connection
- Verify you have write permissions
- Try restoring specific vendor: `--vendor-id=ID`

### Migration Issues

### "Failed to download image from Google Drive"
- Google Drive may be rate limiting
- Try again with smaller batch size
- Some files may require manual download

### "Failed to upload to storage"
- Check Supabase Storage bucket permissions
- Verify `vendor-assets` bucket exists and is public

### Edge Function Timeout
- Default timeout is 50 seconds
- Reduce batch size if hitting timeout
- Function will process what it can before timeout

## Manual Alternative

If automatic migration fails, you can:

1. Download images manually from Google Drive
2. Compress using tools like:
   - [TinyPNG](https://tinypng.com/)
   - [Squoosh](https://squoosh.app/)
3. Upload to Supabase Storage
4. Update vendor records manually

## Current Status

Found **361 vendors** with Google Drive logo URLs that need migration.
