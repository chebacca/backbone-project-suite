#!/bin/bash

# 🌐 Start Licensing Website (connects to shared emulators)
# Run this AFTER starting shared emulators with ./start-shared-emulators.sh

set -e

echo "🌐 Starting Licensing Website..."
echo "==============================="

# Check if shared emulators are running
if ! curl -s http://localhost:4000 > /dev/null 2>&1; then
    echo "❌ Shared emulators not running!"
    echo "   Please start them first: ./start-shared-emulators.sh"
    exit 1
fi

echo "✅ Shared emulators detected"

# Navigate to Licensing Website
cd "dashboard-v14-licensing-website 2"

# Set emulator environment variables
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
export FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001
export FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

echo "🔧 Environment configured for shared emulators"

# Build website
echo "🏗️  Building Licensing website..."
npm run build

# Start hosting emulator
echo "🚀 Starting Licensing hosting on port 5001..."
firebase serve --only hosting --port 5001 --project backbone-logic

echo "✅ Licensing Website available at: http://localhost:5001"
