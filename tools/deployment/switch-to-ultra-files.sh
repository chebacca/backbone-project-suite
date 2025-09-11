#!/bin/bash

# 🔄 Switch to Ultra-Aggressive Firebase Files
# This script replaces current files with ultra-aggressive hook bypass versions

echo "🔄 Switching to ultra-aggressive Firebase files..."

# Navigate to the web app directory
cd "Dashboard-v14_2/apps/web/src"

# Backup current files (including clean versions)
echo "📦 Backing up current files..."
cp main.tsx main-current.tsx.bak
cp lib/firebase-init.ts lib/firebase-init-current.ts.bak

# Also backup clean versions if they exist
if [ -f "main-clean.tsx" ]; then
    cp main-clean.tsx main-clean.tsx.bak
fi

if [ -f "lib/firebase-init-clean.ts" ]; then
    cp lib/firebase-init-clean.ts lib/firebase-init-clean.ts.bak
fi

# Replace with ultra versions
echo "🔄 Replacing with ultra-aggressive versions..."
cp main-ultra.tsx main.tsx
cp lib/firebase-init-ultra.ts lib/firebase-init.ts

echo "✅ Ultra-aggressive files are now active!"
echo ""
echo "📋 What was changed:"
echo "  - main.tsx → main-current.tsx.bak (backed up)"
echo "  - lib/firebase-init.ts → lib/firebase-init-current.ts.bak (backed up)"
echo "  - main-ultra.tsx → main.tsx (activated)"
echo "  - lib/firebase-init-ultra.ts → lib/firebase-init.ts (activated)"
echo ""
echo "🎯 Key improvements in ultra version:"
echo "  - Complete hook isolation using iframe technique"
echo "  - Dynamic module imports to avoid cached interference"
echo "  - Retry mechanisms for Auth and Firestore"
echo "  - Delayed React loading after Firebase is ready"
echo "  - Ultra-aggressive hook neutralization"
echo ""
echo "🚀 Next steps:"
echo "  1. Run: npm run build"
echo "  2. Run: firebase deploy --only hosting:backbone-client"
echo "  3. Test login at: https://backbone-client.web.app"
echo ""
echo "🔄 To restore previous files: ./restore-from-ultra.sh"
