#!/bin/bash

# 🚀 BACKBONE v14.2 - Dual Project Emulator Setup (FIXED)
# 
# This script starts both projects with proper port separation:
# - Dashboard-v14_2: localhost:3000 (Auth: 9099, Firestore: 8080, Functions: 5001, UI: 4000)
# - Licensing Website: localhost:5001 (Auth: 9098, Firestore: 8081, Functions: 5002, UI: 4001)

set -e

echo "🔥 BACKBONE v14.2 - Dual Project Setup (FIXED)"
echo "=============================================="
echo ""

# Check Java installation
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Installing Java 11..."
    brew install openjdk@11
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

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "firebase.*emulators" || true
pkill -f "java.*firestore" || true
lsof -ti:3000,4000,4001,5001,5002,8080,8081,9098,9099,9199,9198 | xargs kill -9 2>/dev/null || true
sleep 3

# Function to start Dashboard project
start_dashboard() {
    echo "1️⃣  Starting Dashboard-v14_2..."
    cd "Dashboard-v14_2"
    
    # Install dependencies if needed
    if [ ! -d "functions/node_modules" ]; then
        echo "📦 Installing Dashboard Functions dependencies..."
        cd functions && npm install && cd ..
    fi
    
    # Build web app
    echo "🏗️  Building Dashboard web app..."
    cd apps/web && npm run build && cd ../..
    
    # Start emulators in background
    echo "🚀 Starting Dashboard emulators..."
    firebase emulators:start --project backbone-logic &
    DASHBOARD_PID=$!
    
    cd ..
    echo "✅ Dashboard started with PID: $DASHBOARD_PID"
    return 0
}

# Function to start Licensing Website
start_licensing() {
    echo "2️⃣  Starting Licensing Website..."
    cd "dashboard-v14-licensing-website 2"
    
    # Install dependencies if needed
    if [ ! -d "server/node_modules" ]; then
        echo "📦 Installing Licensing Server dependencies..."
        cd server && npm install && cd ..
    fi
    
    if [ ! -d "client/node_modules" ]; then
        echo "📦 Installing Licensing Client dependencies..."
        cd client && npm install && cd ..
    fi
    
    # Build client
    echo "🏗️  Building Licensing website..."
    npm run build
    
    # Start emulators in background
    echo "🚀 Starting Licensing emulators..."
    firebase emulators:start --project backbone-logic &
    LICENSING_PID=$!
    
    cd ..
    echo "✅ Licensing Website started with PID: $LICENSING_PID"
    return 0
}

# Start Dashboard project
start_dashboard
sleep 10

# Start Licensing Website
start_licensing
sleep 10

# Wait for emulators to initialize
echo ""
echo "⏳ Waiting for emulators to initialize..."
sleep 15

# Check emulator status
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
echo "📊 Dashboard-v14_2 Services:"
check_emulator "Web App" "http://localhost:3000"
check_emulator "Emulator UI" "http://localhost:4000"
check_emulator "Functions" "http://localhost:5001"
check_emulator "Firestore" "http://localhost:8080"
check_emulator "Auth" "http://localhost:9099"
check_emulator "Storage" "http://localhost:9199"

echo ""
echo "📊 Licensing Website Services:"
check_emulator "Web App" "http://localhost:5001"
check_emulator "Emulator UI" "http://localhost:4001"
check_emulator "Functions" "http://localhost:5002"
check_emulator "Firestore" "http://localhost:8081"
check_emulator "Auth" "http://localhost:9098"
check_emulator "Storage" "http://localhost:9198"

echo ""
echo "🎉 Both Projects Are Ready!"
echo "=========================="
echo ""
echo "🌐 Dashboard-v14_2:"
echo "   • Web App:      http://localhost:3000"
echo "   • Emulator UI:  http://localhost:4000"
echo "   • API:          http://localhost:5001/backbone-logic/us-central1/api"
echo ""
echo "🌐 Licensing Website:"
echo "   • Web App:      http://localhost:5001"
echo "   • Emulator UI:  http://localhost:4001"
echo "   • API:          http://localhost:5002/backbone-logic/us-central1/api"
echo ""
echo "🔐 Test Credentials (Both Projects):"
echo "   • admin@backbone.test (password: password123)"
echo "   • editor@backbone.test (password: password123)"
echo "   • producer@backbone.test (password: password123)"
echo "   • client@backbone.test (password: password123)"
echo ""
echo "💡 Usage Tips:"
echo "   • Open both URLs in different browser tabs"
echo "   • Both projects share the same Firebase project but use different emulator instances"
echo "   • Data is isolated between the two emulator sets"
echo "   • Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down all services..."
    pkill -f "firebase.*emulators" || true
    pkill -f "java.*firestore" || true
    lsof -ti:3000,4000,4001,5001,5002,8080,8081,9098,9099,9199,9198 | xargs kill -9 2>/dev/null || true
    echo "✅ Cleanup complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
echo "🔄 Both projects are running. Press Ctrl+C to stop all services."
while true; do
    sleep 10
    # Check if processes are still running
    if ! pgrep -f "firebase.*emulators" > /dev/null; then
        echo "⚠️  Some emulator processes stopped unexpectedly"
        echo "🔄 Attempting to restart..."
        sleep 5
        # Could add restart logic here if needed
    fi
done
