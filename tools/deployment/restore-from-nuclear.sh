#!/bin/bash

# 🔄 Restore Files from Nuclear Backup
# This script restores the previous files from nuclear backup

echo "🔄 Restoring files from nuclear backup..."

# Navigate to the web app directory
cd "Dashboard-v14_2/apps/web/src"

# Check if backups exist
if [ ! -f "main-pre-nuclear.tsx.bak" ] || [ ! -f "lib/firebase-init-pre-nuclear.ts.bak" ]; then
    echo "❌ Nuclear backup files not found. Cannot restore."
    echo "   Make sure you ran switch-to-nuclear-files.sh first."
    exit 1
fi

# Restore previous files
echo "📦 Restoring previous files..."
cp main-pre-nuclear.tsx.bak main.tsx
cp lib/firebase-init-pre-nuclear.ts.bak lib/firebase-init.ts

echo "✅ Previous files restored!"
echo ""
echo "📋 What was restored:"
echo "  - main-pre-nuclear.tsx.bak → main.tsx"
echo "  - lib/firebase-init-pre-nuclear.ts.bak → lib/firebase-init.ts"
echo ""
echo "🔄 Nuclear files are still available:"
echo "  - main-nuclear.tsx (nuclear main with all providers)"
echo "  - lib/firebase-init-nuclear.ts (nuclear Firebase initialization)"
echo ""
echo "🚀 To switch back to nuclear: ./switch-to-nuclear-files.sh"
