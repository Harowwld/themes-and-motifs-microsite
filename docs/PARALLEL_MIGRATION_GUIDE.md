# Parallel Vendor Image Migration Guide

## Overview

The parallel migration script processes vendor images concurrently, providing significant speed improvements over the sequential version.

## Performance Comparison

| Version | Processing | Concurrency | Speed (typical) |
|---------|------------|-------------|-----------------|
| Sequential | One by one | 1 | ~12 images/minute |
| Parallel | Batch processing | 10 (configurable) | ~60+ images/minute |

## Usage

### Basic Usage
```bash
npx tsx scripts/migrate-all-vendor-images-parallel.ts 2>&1 | tee /tmp/parallel-migration.log
```

### Configuration Options

Configure via environment variables:

```bash
# Number of parallel workers (default: 10)
export MIGRATION_CONCURRENCY=15

# Images per batch (default: 50)
export MIGRATION_BATCH_SIZE=100

# Delay between batches in ms (default: 2000)
export MIGRATION_BATCH_DELAY=1000

# Request timeout per image in ms (default: 15000)
export MIGRATION_TIMEOUT=20000

# Retry attempts for failed images (default: 2)
export MIGRATION_RETRIES=3
```

### Example Configurations

#### Conservative (stable connection)
```bash
export MIGRATION_CONCURRENCY=5
export MIGRATION_BATCH_SIZE=25
export MIGRATION_BATCH_DELAY=3000
npx tsx scripts/migrate-all-vendor-images-parallel.ts
```

#### Aggressive (fast connection)
```bash
export MIGRATION_CONCURRENCY=20
export MIGRATION_BATCH_SIZE=100
export MIGRATION_BATCH_DELAY=500
npx tsx scripts/migrate-all-vendor-images-parallel.ts
```

#### Rate Limited (avoid hitting limits)
```bash
export MIGRATION_CONCURRENCY=3
export MIGRATION_BATCH_SIZE=20
export MIGRATION_BATCH_DELAY=5000
npx tsx scripts/migrate-all-vendor-images-parallel.ts
```

## Features

### Parallel Processing
- Processes multiple images simultaneously
- Configurable concurrency limits
- Batch processing with delays to avoid rate limiting

### Retry Logic
- Automatic retries for failed images
- Exponential backoff between retries
- Configurable retry attempts

### Progress Tracking
- Real-time progress updates
- Batch completion summaries
- Performance metrics (images/minute)

### Error Handling
- Individual image failures don't stop the migration
- Detailed error reporting
- Failed image summary with retry counts

## Output Example

```
🚀 PARALLEL MIGRATE ALL VENDOR IMAGES

================================================================================
🔧 Configuration:
   Concurrency: 10 workers
   Batch size: 50 images
   Batch delay: 2000ms
   Request timeout: 15000ms
   Retry attempts: 2
================================================================================
✅ Backup verified

🔍 Fetching all vendor_images with Google Drive URLs...
📊 Total images to migrate: 500

================================================================================

[1/500] ✅ Image 123 (vendor 45) 245KB
[2/500] ✅ Image 124 (vendor 45) 189KB
...
[50/500] ❌ Image 173 (vendor 67) Download failed (retry 2)
   Batch 1: 48✅ 2❌

[51/500] ✅ Image 174 (vendor 68) 312KB
...

================================================================================

📊 FINAL SUMMARY

✅ Successful: 485
❌ Failed: 15
📈 Total: 500
💾 Total uploaded: 125.67 MB
⏱️ Duration: 8.3 minutes
🚀 Speed: 60 images/minute
```

## Monitoring

### Real-time Monitoring
```bash
# Watch the log file in real-time
tail -f /tmp/parallel-migration.log
```

### Progress Check
The script shows:
- Current image being processed
- Success/failure status
- File size for successful uploads
- Retry count for failed attempts

## Troubleshooting

### Common Issues

1. **Rate Limiting**
   - Reduce `MIGRATION_CONCURRENCY`
   - Increase `MIGRATION_BATCH_DELAY`

2. **Timeout Errors**
   - Increase `MIGRATION_TIMEOUT`
   - Check network connectivity

3. **Memory Issues**
   - Reduce `MIGRATION_BATCH_SIZE`
   - Reduce `MIGRATION_CONCURRENCY`

### Recovery

If the migration fails partway through:
1. Check the report file for failed images
2. Run the script again - it will skip already migrated images
3. Use the sequential version for problematic images

## Reports

Reports are saved to `backups/vendor-images-migration-parallel-*.json` with:
- Configuration used
- Complete results with retry counts
- Performance metrics
- Failed image details

## Safety

- Always run backup first: `npx tsx scripts/backup-vendor-images.ts`
- Can restore with: `npx tsx scripts/restore-vendor-images.ts`
- Reports include all details for audit trail
