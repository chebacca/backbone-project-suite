#!/bin/bash

# 🔄 Restore Original Firebase Files
# This script restores the original files from backup

echo "🔄 Restoring original Firebase files..."

# Navigate to the web app directory
cd "Dashboard-v14_2/apps/web/src"

# Check if backups exist
if [ ! -f "main-original.tsx.bak" ] || [ ! -f "lib/firebase-init-original.ts.bak" ]; then
    echo "❌ Backup files not found. Cannot restore."
    echo "   Make sure you ran switch-to-clean-files.sh first."
    exit 1
fi

# Restore original files
echo "📦 Restoring original files..."
cp main-original.tsx.bak main.tsx
cp lib/firebase-init-original.ts.bak lib/firebase-init.ts

echo "✅ Original files restored!"
echo ""
echo "📋 What was restored:"
echo "  - main-original.tsx.bak → main.tsx"
echo "  - lib/firebase-init-original.ts.bak → lib/firebase-init.ts"
echo ""
echo "🧹 Cleaning up backup files..."
rm main-original.tsx.bak
rm lib/firebase-init-original.ts.bak

echo "✅ Cleanup complete!"
