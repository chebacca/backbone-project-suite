#!/bin/bash

# 🔄 Switch to Clean Firebase Files for Testing
# This script temporarily replaces the current files with our clean versions

echo "🔄 Switching to clean Firebase files for testing..."

# Navigate to the web app directory
cd "Dashboard-v14_2/apps/web/src"

# Backup current files
echo "📦 Backing up current files..."
cp main.tsx main-original.tsx.bak
cp lib/firebase-init.ts lib/firebase-init-original.ts.bak

# Replace with clean versions
echo "🔄 Replacing with clean versions..."
cp main-clean.tsx main.tsx
cp lib/firebase-init-clean.ts lib/firebase-init.ts

echo "✅ Clean files are now active!"
echo ""
echo "📋 What was changed:"
echo "  - main.tsx → main-original.tsx.bak (backed up)"
echo "  - lib/firebase-init.ts → lib/firebase-init-original.ts.bak (backed up)"
echo "  - main-clean.tsx → main.tsx (active)"
echo "  - lib/firebase-init-clean.ts → lib/firebase-init.ts (active)"
echo ""
echo "🧪 To test:"
echo "  1. Open test-firebase-clean.html in your browser first"
echo "  2. If that works, try building and running the web app"
echo "  3. Focus on testing Firebase Auth login in WebOnlyStartupFlow"
echo ""
echo "🔄 To restore original files, run: ./restore-original-files.sh"
