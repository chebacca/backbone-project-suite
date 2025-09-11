#!/bin/bash

# 🌐 Start Licensing Website with Emulators
# This script builds and serves the licensing website through Firebase emulators

echo "🌐 Starting Licensing Website with Firebase Emulators..."

# Navigate to licensing website directory
cd "dashboard-v14-licensing-website 2" || exit 1

# Set emulator environment variables
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
export FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001
export FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

echo "🔧 Environment variables set for emulators"

# Build the licensing website
echo "🏗️ Building licensing website..."
npm run build

echo "✅ Build complete!"

# Start hosting emulator on different port
echo "🌐 Starting hosting emulator on port 8080..."
echo "📊 Shared Emulator UI: http://localhost:4000"
echo "🌐 Licensing Website will be available at: http://localhost:8080"
echo ""
echo "🔑 Test Credentials (same as Dashboard):"
echo "   Email: enterprise.user@enterprisemedia.com"
echo "   Password: Enterprise123!"
echo ""

firebase emulators:start --only hosting --port 8080
