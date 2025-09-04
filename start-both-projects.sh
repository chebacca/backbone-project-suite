#!/bin/bash

# 🚀 Launch Both Projects with Firebase Emulators
# This script starts both the Dashboard web app and Licensing website simultaneously

echo "🚀 Starting Both Projects with Firebase Emulators..."
echo "=================================================="

# Check if emulators are already running
if ! curl -s http://localhost:4000 > /dev/null 2>&1; then
    echo "❌ Firebase emulators are not running!"
    echo "Please start them first with:"
    echo "  cd Dashboard-v14_2"
    echo "  export PATH=\"/opt/homebrew/opt/openjdk@11/bin:\$PATH\""
    echo "  firebase emulators:start --only auth,firestore,functions --project backbone-logic"
    echo ""
    exit 1
fi

echo "✅ Firebase emulators detected at http://localhost:4000"

# Set emulator environment variables
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
export FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001
export FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

echo "🔧 Environment variables set for emulators"

# Function to start Dashboard web app
start_dashboard() {
    echo "📱 Building and starting Dashboard web app..."
    cd "Dashboard-v14_2" || exit 1
    
    # Build the web application
    cd apps/web
    echo "🏗️ Building Dashboard web app..."
    npm run build
    cd ../..
    
    echo "✅ Dashboard build complete!"
    echo "🌐 Starting Dashboard hosting emulator on port 3000..."
    
    # Start hosting emulator in background
    firebase emulators:start --only hosting --port 3000 &
    DASHBOARD_PID=$!
    echo "📱 Dashboard PID: $DASHBOARD_PID"
}

# Function to start Licensing website
start_licensing() {
    echo "🌐 Building and starting Licensing website..."
    cd "../dashboard-v14-licensing-website 2" || exit 1
    
    # Build the licensing website
    echo "🏗️ Building Licensing website..."
    npm run build
    
    echo "✅ Licensing build complete!"
    echo "🌐 Starting Licensing hosting emulator on port 8080..."
    
    # Start hosting emulator in background
    firebase emulators:start --only hosting --port 8080 &
    LICENSING_PID=$!
    echo "🌐 Licensing PID: $LICENSING_PID"
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down both projects..."
    if [ ! -z "$DASHBOARD_PID" ]; then
        kill $DASHBOARD_PID 2>/dev/null
        echo "📱 Dashboard stopped"
    fi
    if [ ! -z "$LICENSING_PID" ]; then
        kill $LICENSING_PID 2>/dev/null
        echo "🌐 Licensing website stopped"
    fi
    echo "✅ Cleanup complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start both projects
start_dashboard
sleep 3  # Give dashboard time to start
start_licensing

echo ""
echo "🎉 Both projects are starting up!"
echo "=================================="
echo "📊 Firebase Emulator UI: http://localhost:4000"
echo "📱 Dashboard Web App: http://localhost:3000"
echo "🌐 Licensing Website: http://localhost:8080"
echo "🔧 API Endpoints: http://localhost:5001/backbone-logic/us-central1/api/*"
echo ""
echo "🔑 Test Credentials:"
echo "   Email: enterprise.user@enterprisemedia.com"
echo "   Password: Enterprise123!"
echo ""
echo "⏳ Waiting for builds to complete..."
echo "Press Ctrl+C to stop both projects"

# Wait for both processes
wait $DASHBOARD_PID $LICENSING_PID
