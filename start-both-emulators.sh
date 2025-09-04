#!/bin/bash

# 🔥 BACKBONE v14.2 - Unified Firebase Emulator Suite
# 
# This script starts Firebase emulators for both projects:
# - Dashboard-v14_2 (Main App): Ports 4000, 5000, 8080, 9099, 5001, 9199
# - dashboard-v14-licensing-website 2 (Licensing): Ports 4001, 5001, 8081, 9098, 5002, 9198

set -e

echo "🔥 Starting BACKBONE v14.2 Firebase Emulator Suite"
echo "=================================================="
echo ""

# Check Java installation
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Installing Java 11..."
    brew install openjdk@11
    export PATH="/opt/homebrew/opt/openjdk@11/bin:$PATH"
fi

# Ensure Java is in PATH
export PATH="/opt/homebrew/opt/openjdk@11/bin:$PATH"
echo "☕ Java version: $(java -version 2>&1 | head -n 1)"

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

echo "🔥 Firebase CLI version: $(firebase --version)"
echo ""

# Kill any existing emulator processes
echo "🧹 Cleaning up existing emulator processes..."
pkill -f "firebase.*emulators" || true
pkill -f "java.*firestore" || true
sleep 3

# Function to start emulators for a project
start_project_emulators() {
    local project_name="$1"
    local project_dir="$2"
    local ui_port="$3"
    
    echo "🚀 Starting emulators for $project_name..."
    echo "   Directory: $project_dir"
    echo "   UI Port: $ui_port"
    
    if [ ! -d "$project_dir" ]; then
        echo "❌ Directory not found: $project_dir"
        return 1
    fi
    
    if [ ! -f "$project_dir/firebase.json" ]; then
        echo "❌ firebase.json not found in: $project_dir"
        return 1
    fi
    
    # Start emulators in background
    cd "$project_dir"
    
    # Install functions dependencies if needed
    if [ -d "functions" ] && [ ! -d "functions/node_modules" ]; then
        echo "📦 Installing Functions dependencies for $project_name..."
        cd functions && npm install && cd ..
    elif [ -d "server" ] && [ ! -d "server/node_modules" ]; then
        echo "📦 Installing Server dependencies for $project_name..."
        cd server && npm install && cd ..
    fi
    
    # Start emulators
    firebase emulators:start --project backbone-logic &
    local pid=$!
    echo "   Started with PID: $pid"
    
    # Return to original directory
    cd - > /dev/null
    
    return 0
}

# Start Dashboard-v14_2 emulators
echo "1️⃣  Starting Dashboard-v14_2 emulators..."
start_project_emulators "Dashboard-v14_2" "Dashboard-v14_2" "4000"
DASHBOARD_PID=$!

# Wait a bit before starting the second project
sleep 5

# Start licensing website emulators
echo ""
echo "2️⃣  Starting Licensing Website emulators..."
start_project_emulators "Licensing Website" "dashboard-v14-licensing-website 2" "4001"
LICENSING_PID=$!

# Wait for emulators to initialize
echo ""
echo "⏳ Waiting for emulators to initialize..."
sleep 15

# Check if emulators are running
echo ""
echo "🔍 Checking emulator status..."

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

echo ""
echo "📊 Dashboard-v14_2 Emulators:"
check_emulator "Emulator UI" "http://localhost:4000"
check_emulator "Web App" "http://localhost:5000"
check_emulator "Firestore" "http://localhost:8080"
check_emulator "Auth" "http://localhost:9099"
check_emulator "Functions" "http://localhost:5001"
check_emulator "Storage" "http://localhost:9199"

echo ""
echo "📊 Licensing Website Emulators:"
check_emulator "Emulator UI" "http://localhost:4001"
check_emulator "Web App" "http://localhost:5001"
check_emulator "Firestore" "http://localhost:8081"
check_emulator "Auth" "http://localhost:9098"
check_emulator "Functions" "http://localhost:5002"
check_emulator "Storage" "http://localhost:9198"

echo ""
echo "🎉 BACKBONE v14.2 Emulator Suite is ready!"
echo "=========================================="
echo ""
echo "🌐 Dashboard-v14_2 URLs:"
echo "   • Emulator UI:  http://localhost:4000"
echo "   • Web App:      http://localhost:5000"
echo "   • API:          http://localhost:5001/backbone-logic/us-central1/api"
echo ""
echo "🌐 Licensing Website URLs:"
echo "   • Emulator UI:  http://localhost:4001"
echo "   • Web App:      http://localhost:5001"
echo "   • API:          http://localhost:5002/backbone-logic/us-central1/api"
echo ""
echo "🔐 Shared Test Accounts:"
echo "   • admin@backbone.test (password: password123)"
echo "   • editor@backbone.test (password: password123)"
echo "   • producer@backbone.test (password: password123)"
echo "   • client@backbone.test (password: password123)"
echo ""
echo "💡 Development Tips:"
echo "   • Both projects share the same Firebase project (backbone-logic)"
echo "   • Use different ports to avoid conflicts"
echo "   • Data persists between restarts in ./emulator-data/"
echo "   • Press Ctrl+C to stop all emulators"
echo ""
echo "🔧 Environment Setup:"
echo "   • Set REACT_APP_EMULATOR_MODE=true in your apps"
echo "   • Use http://localhost:5001 for Dashboard API calls"
echo "   • Use http://localhost:5002 for Licensing API calls"
echo ""

# Setup initial data for Dashboard project
if [ -f "Dashboard-v14_2/emulator-setup.js" ]; then
    echo "📊 Setting up initial test data..."
    cd "Dashboard-v14_2"
    node emulator-setup.js || echo "⚠️  Initial data setup failed, but emulators are running"
    cd ..
fi

echo "✨ Ready for development! Both projects are running with emulators."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down emulators..."
    pkill -f "firebase.*emulators" || true
    pkill -f "java.*firestore" || true
    echo "✅ Cleanup complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
echo "🔄 Emulators are running. Press Ctrl+C to stop all services."
while true; do
    sleep 10
    # Check if processes are still running
    if ! pgrep -f "firebase.*emulators" > /dev/null; then
        echo "⚠️  Emulator processes stopped unexpectedly"
        break
    fi
done
