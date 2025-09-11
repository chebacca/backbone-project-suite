#!/bin/bash

# 🔄 Restore Files from Ultra-Aggressive Backup
# This script restores the previous files from backup

echo "🔄 Restoring files from ultra-aggressive backup..."

# Navigate to the web app directory
cd "Dashboard-v14_2/apps/web/src"

# Check if backups exist
if [ ! -f "main-current.tsx.bak" ] || [ ! -f "lib/firebase-init-current.ts.bak" ]; then
    echo "❌ Ultra backup files not found. Cannot restore."
    echo "   Make sure you ran switch-to-ultra-files.sh first."
    exit 1
fi

# Restore previous files
echo "📦 Restoring previous files..."
cp main-current.tsx.bak main.tsx
cp lib/firebase-init-current.ts.bak lib/firebase-init.ts

echo "✅ Previous files restored!"
echo ""
echo "📋 What was restored:"
echo "  - main-current.tsx.bak → main.tsx"
echo "  - lib/firebase-init-current.ts.bak → lib/firebase-init.ts"
echo ""
echo "🔄 Ultra files are still available:"
echo "  - main-ultra.tsx (ultra-aggressive main)"
echo "  - lib/firebase-init-ultra.ts (ultra-aggressive Firebase init)"
echo ""
echo "🚀 To switch back to ultra: ./switch-to-ultra-files.sh"
