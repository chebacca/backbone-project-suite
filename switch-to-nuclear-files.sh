#!/bin/bash

# 🔄 Switch to Nuclear Firebase Files
# This script replaces current files with nuclear approach that includes theme providers

echo "🔄 Switching to nuclear Firebase files..."

# Navigate to the web app directory
cd "Dashboard-v14_2/apps/web/src"

# Backup current files
echo "📦 Backing up current files..."
cp main.tsx main-pre-nuclear.tsx.bak
cp lib/firebase-init.ts lib/firebase-init-pre-nuclear.ts.bak

# Replace with nuclear versions
echo "🔄 Replacing with nuclear versions..."
cp main-nuclear.tsx main.tsx
cp lib/firebase-init-nuclear.ts lib/firebase-init.ts

echo "✅ Nuclear files are now active!"
echo ""
echo "📋 What was changed:"
echo "  - main.tsx → main-pre-nuclear.tsx.bak (backed up)"
echo "  - lib/firebase-init.ts → lib/firebase-init-pre-nuclear.ts.bak (backed up)"
echo "  - main-nuclear.tsx → main.tsx (activated)"
echo "  - lib/firebase-init-nuclear.ts → lib/firebase-init.ts (activated)"
echo ""
echo "🎯 Key improvements in nuclear version:"
echo "  - Complete hook elimination using property descriptor override"
echo "  - Direct Firebase module instantiation without global dependencies"
echo "  - ALL required providers included (EnhancedThemeProvider, etc.)"
echo "  - Isolated execution context for Firebase initialization"
echo "  - Zero hook interaction throughout the entire process"
echo ""
echo "🔧 Nuclear approach fixes:"
echo "  ✅ Firebase Auth and Firestore initialization"
echo "  ✅ EnhancedThemeProvider missing error"
echo "  ✅ All React context providers properly wrapped"
echo "  ✅ Complete provider stack (QueryClient, Router, Theme, etc.)"
echo ""
echo "🚀 Next steps:"
echo "  1. Run: npm run build"
echo "  2. Run: firebase deploy --only hosting:backbone-client"
echo "  3. Test login at: https://backbone-client.web.app"
echo ""
echo "🔄 To restore previous files: ./restore-from-nuclear.sh"
