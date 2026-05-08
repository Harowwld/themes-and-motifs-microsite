#!/bin/bash
# Cleanup orphan images from vendor-assets bucket
# Usage: ./scripts/cleanup-orphans.sh

echo "Running orphan image cleanup..."
npx tsx scripts/cleanup-orphan-images.ts
