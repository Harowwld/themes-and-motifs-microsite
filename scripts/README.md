# Google Drive Image Migration Scripts

## 🚀 Quick Commands

```bash
# 1. Backup (ALWAYS DO THIS FIRST!)
npx tsx scripts/backup-google-drive-urls.ts

# 2. Test with dry run
npx tsx scripts/migrate-google-drive-images.ts --dry-run

# 3. Migrate one vendor (test)
npx tsx scripts/migrate-google-drive-images.ts --vendor-id=889 --edge-function

# 4. Migrate batch
npx tsx scripts/migrate-google-drive-images.ts --batch-size=10 --edge-function

# 5. If something goes wrong - RESTORE
npx tsx scripts/restore-google-drive-urls.ts --dry-run  # Preview first
npx tsx scripts/restore-google-drive-urls.ts           # Actually restore
```

## 📁 Files

| File | Purpose |
|------|---------|
| `backup-google-drive-urls.ts` | Save original URLs before migration |
| `migrate-google-drive-images.ts` | Download, compress, upload to Supabase |
| `restore-google-drive-urls.ts` | Rollback to original Google Drive URLs |
| `compress-and-upload-images/index.ts` | Edge Function (deploy to Supabase) |

## 📊 Status

- **361 vendors** have Google Drive logo URLs
- **vendor-assets** bucket ready in Supabase
- Backup creates: `backups/google-drive-urls-*.json`

## 🔒 Safety Features

1. **Backup required** - Migration won't run without backup
2. **Dry run mode** - Preview changes before committing
3. **One-by-one restore** - Can restore single vendors
4. **Full rollback** - Restore all from backup
5. **Reports saved** - All operations logged to JSON files

## 📖 Full Guide

See: `docs/MIGRATE_GOOGLE_DRIVE_IMAGES.md`
