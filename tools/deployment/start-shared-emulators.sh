#!/bin/bash

# 🔥 BACKBONE v14.2 - Shared Firebase Emulators (MPC Library Implementation)
# 
# Based on MPC Library: FIREBASE_WEBONLY_PRODUCTION_MODE.md
# This starts SHARED Firebase emulators that both projects connect to:
# - Single Auth emulator (9099)
# - Single Firestore emulator (8080) 
# - Single Functions emulator (5001)
# - Single Storage emulator (9199)
# - Single UI (4000)
#
# Both web apps connect to these shared emulators on different hosting ports:
# - Dashboard: localhost:3000
# - Licensing: localhost:5001

set -e

echo "🔥 BACKBONE v14.2 - Shared Firebase Emulators (MPC Implementation)"
echo "================================================================="
echo ""

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

echo "🔥 Firebase CLI version: $(firebase --version)"

# Kill existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "firebase.*emulators" || true
pkill -f "java.*firestore" || true
lsof -ti:3000,4000,5001,8080,9099,9199 | xargs kill -9 2>/dev/null || true
sleep 3

# Set Firebase project
echo "🔧 Setting Firebase project..."
firebase use backbone-logic

# Start shared emulators from root (using unified firebase.json)
echo "🚀 Starting shared Firebase emulators..."
echo "   • Auth: localhost:9099"
echo "   • Firestore: localhost:8080"
echo "   • Functions: localhost:5001"
echo "   • Storage: localhost:9199"
echo "   • UI: localhost:4000"
echo ""

# Start emulators in background
firebase emulators:start --only auth,firestore,functions,storage,ui --project backbone-logic &
EMULATOR_PID=$!

# Wait for emulators to start
echo "⏳ Waiting for emulators to initialize..."
sleep 15

# Check emulator status
echo "🔍 Checking shared emulator status..."
check_emulator() {
    local name="$1"
    local url="$2"
    if curl -s "$url" > /dev/null 2>&1; then
        echo "✅ $name: $url"
        return 0
    else
        echo "❌ $name: $url (not responding)"
        return 1
    fi
}

check_emulator "Emulator UI" "http://localhost:4000"
check_emulator "Auth Emulator" "http://localhost:9099"
check_emulator "Firestore Emulator" "http://localhost:8080"
check_emulator "Functions Emulator" "http://localhost:5001"
check_emulator "Storage Emulator" "http://localhost:9199"

echo ""
echo "🌱 Seeding emulators with test data..."

# Seed auth emulator with test users
FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 node seed-auth-emulator.cjs &
sleep 5

echo ""
echo "🎉 Shared Firebase Emulators Ready!"
echo "==================================="
echo ""
echo "🔗 Shared Services:"
echo "   • Emulator UI:  http://localhost:4000"
echo "   • Auth:         http://localhost:9099"
echo "   • Firestore:    http://localhost:8080"
echo "   • Functions:    http://localhost:5001"
echo "   • Storage:      http://localhost:9199"
echo ""
echo "📱 To start web apps (in separate terminals):"
echo ""
echo "   Terminal 2 - Dashboard:"
echo "   cd Dashboard-v14_2/apps/web"
echo "   export FIRESTORE_EMULATOR_HOST=localhost:8080"
echo "   export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099"
echo "   npm run build"
echo "   cd ../.. && firebase emulators:start --only hosting --port 3000"
echo ""
echo "   Terminal 3 - Licensing:"
echo "   cd 'dashboard-v14-licensing-website 2'"
echo "   export FIRESTORE_EMULATOR_HOST=localhost:8080"
echo "   export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099"
echo "   npm run build"
echo "   firebase emulators:start --only hosting --port 5001"
echo ""
echo "🔐 Test Credentials:"
echo "   • admin@backbone.test (password: password123)"
echo "   • enterprise.user@enterprisemedia.com (password: Enterprise123!)"
echo "   • chebacca@gmail.com (password: admin1234)"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down shared emulators..."
    pkill -f "firebase.*emulators" || true
    pkill -f "java.*firestore" || true
    echo "✅ Cleanup complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
echo "🔄 Shared emulators running. Press Ctrl+C to stop."
echo "💡 Both projects will connect to these shared emulators."
while true; do
    sleep 10
    if ! pgrep -f "firebase.*emulators" > /dev/null; then
        echo "⚠️  Emulator processes stopped unexpectedly"
        break
    fi
done
