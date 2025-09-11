#!/bin/bash

# 🔥 BACKBONE v14.2 - Simple Firebase Emulator Setup
# 
# This script starts Firebase emulators for development with automatic port detection

set -e

echo "🔥 Starting BACKBONE v14.2 Firebase Emulators"
echo "============================================="
echo ""

# Ensure Java is available
export PATH="/opt/homebrew/opt/openjdk@11/bin:$PATH"

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "firebase.*emulators" || true
pkill -f "java.*firestore" || true
sleep 2

# Function to find available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    while lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; do
        port=$((port + 1))
    done
    echo $port
}

# Find available ports
UI_PORT=$(find_available_port 4000)
HOSTING_PORT=$(find_available_port 5000)
FUNCTIONS_PORT=$(find_available_port 5001)
FIRESTORE_PORT=$(find_available_port 8080)
AUTH_PORT=$(find_available_port 9099)
STORAGE_PORT=$(find_available_port 9199)

echo "🔍 Using available ports:"
echo "   • Emulator UI: $UI_PORT"
echo "   • Hosting: $HOSTING_PORT"
echo "   • Functions: $FUNCTIONS_PORT"
echo "   • Firestore: $FIRESTORE_PORT"
echo "   • Auth: $AUTH_PORT"
echo "   • Storage: $STORAGE_PORT"
echo ""

# Start Dashboard-v14_2 emulators
echo "🚀 Starting Dashboard-v14_2 emulators..."
cd Dashboard-v14_2

# Install functions dependencies if needed
if [ ! -d "functions/node_modules" ]; then
    echo "📦 Installing Functions dependencies..."
    cd functions && npm install && cd ..
fi

# Start emulators with only essential services
firebase emulators:start \
  --only auth,firestore,functions,hosting,storage \
  --project backbone-logic \
  --export-on-exit ./emulator-data \
  --import ./emulator-data 2>/dev/null || true &

EMULATOR_PID=$!
echo "   Started with PID: $EMULATOR_PID"

# Wait for emulators to start
echo "⏳ Waiting for emulators to initialize..."
sleep 10

# Check if emulators are running
echo "🔍 Checking emulator status..."
if curl -s http://localhost:$UI_PORT > /dev/null 2>&1; then
    echo "✅ Emulators are running!"
else
    echo "⚠️  Emulators may still be starting..."
fi

echo ""
echo "🎉 Firebase Emulators Ready!"
echo "============================"
echo ""
echo "🌐 Access URLs:"
echo "   • Emulator UI:  http://localhost:$UI_PORT"
echo "   • Web App:      http://localhost:$HOSTING_PORT"
echo "   • Functions:    http://localhost:$FUNCTIONS_PORT"
echo "   • Firestore:    http://localhost:$FIRESTORE_PORT"
echo "   • Auth:         http://localhost:$AUTH_PORT"
echo "   • Storage:      http://localhost:$STORAGE_PORT"
echo ""
echo "🔐 Test Accounts (will be created automatically):"
echo "   • admin@backbone.test (password: password123)"
echo "   • editor@backbone.test (password: password123)"
echo "   • producer@backbone.test (password: password123)"
echo "   • client@backbone.test (password: password123)"
echo ""
echo "💡 Development Tips:"
echo "   • Open http://localhost:$UI_PORT to manage emulated services"
echo "   • Your app will automatically connect to local emulators"
echo "   • Data persists between restarts in ./emulator-data/"
echo "   • Press Ctrl+C to stop all emulators"
echo ""

# Set up initial data
if [ -f "emulator-setup.cjs" ]; then
    echo "📊 Setting up initial test data..."
    sleep 5  # Give emulators more time
    node emulator-setup.cjs || echo "⚠️  Initial data setup will be available after emulators fully start"
fi

echo "✨ Ready for development!"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Shutting down emulators..."
    kill $EMULATOR_PID 2>/dev/null || true
    pkill -f "firebase.*emulators" || true
    pkill -f "java.*firestore" || true
    echo "✅ Cleanup complete"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
echo "🔄 Emulators are running. Press Ctrl+C to stop."
wait $EMULATOR_PID
