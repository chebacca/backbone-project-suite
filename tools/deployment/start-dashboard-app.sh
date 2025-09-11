#!/bin/bash

# 🚀 Start Dashboard Web App (connects to shared emulators)
# Run this AFTER starting shared emulators with ./start-shared-emulators.sh

set -e

echo "📱 Starting Dashboard Web App..."
echo "==============================="

# Check if shared emulators are running
if ! curl -s http://localhost:4000 > /dev/null 2>&1; then
    echo "❌ Shared emulators not running!"
    echo "   Please start them first: ./start-shared-emulators.sh"
    exit 1
fi

echo "✅ Shared emulators detected"

# Navigate to Dashboard
cd "Dashboard-v14_2"

# Set emulator environment variables
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
export FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001
export FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

echo "🔧 Environment configured for shared emulators"

# Build web app
echo "🏗️  Building Dashboard web app..."
cd apps/web
npm run build
cd ../..

# Start hosting emulator
echo "🚀 Starting Dashboard hosting on port 3000..."
firebase serve --only hosting --port 3000 --project backbone-logic

echo "✅ Dashboard available at: http://localhost:3000"
