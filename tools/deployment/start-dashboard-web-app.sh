#!/bin/bash

# 🚀 Start Dashboard Web App with Emulators
# This script builds and serves the Dashboard-v14_2 web app through Firebase emulators

echo "🚀 Starting Dashboard Web App with Firebase Emulators..."

# Navigate to Dashboard directory
cd "Dashboard-v14_2" || exit 1

# Set emulator environment variables
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
export FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001
export FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

echo "🔧 Environment variables set for emulators"

# Build the web application
echo "🏗️ Building web application..."
cd apps/web
npm run build
cd ../..

echo "✅ Build complete!"

# Start hosting emulator
echo "🌐 Starting hosting emulator on port 3000..."
echo "📊 Emulator UI available at: http://localhost:4000"
echo "📱 Web App will be available at: http://localhost:3000"
echo ""
echo "🔑 Test Credentials:"
echo "   Email: enterprise.user@enterprisemedia.com"
echo "   Password: Enterprise123!"
echo ""

firebase emulators:start --only hosting --port 3000
