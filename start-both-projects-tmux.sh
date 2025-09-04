#!/bin/bash

# 🚀 Launch Both Projects with tmux (Better Process Management)
# This script starts both projects in separate tmux sessions for easy management

echo "🚀 Starting Both Projects with tmux..."
echo "====================================="

# Check if emulators are running
if ! curl -s http://localhost:4000 > /dev/null 2>&1; then
    echo "❌ Firebase emulators are not running!"
    echo "Please start them first with:"
    echo "  cd Dashboard-v14_2"
    echo "  export PATH=\"/opt/homebrew/opt/openjdk@11/bin:\$PATH\""
    echo "  firebase emulators:start --only auth,firestore,functions --project backbone-logic"
    echo ""
    exit 1
fi

echo "✅ Firebase emulators detected"

# Set emulator environment variables
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
export FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001
export FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

# Check if tmux is available
if ! command -v tmux &> /dev/null; then
    echo "❌ tmux is not installed. Installing with Homebrew..."
    brew install tmux
fi

# Kill existing sessions if they exist
tmux kill-session -t dashboard-app 2>/dev/null
tmux kill-session -t licensing-website 2>/dev/null

echo "🏗️ Building Dashboard web app..."
cd "Dashboard-v14_2/apps/web"
npm run build
cd ../../..

echo "🏗️ Building Licensing website..."
cd "dashboard-v14-licensing-website 2"
npm run build
cd ..

echo "✅ Both builds complete!"

# Start Dashboard in tmux session
echo "📱 Starting Dashboard web app in tmux session 'dashboard-app'..."
tmux new-session -d -s dashboard-app -c "Dashboard-v14_2" \
    "export FIRESTORE_EMULATOR_HOST=localhost:8080 && \
     export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 && \
     export FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001 && \
     export FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199 && \
     firebase emulators:start --only hosting --port 3000"

# Start Licensing website in tmux session
echo "🌐 Starting Licensing website in tmux session 'licensing-website'..."
tmux new-session -d -s licensing-website -c "dashboard-v14-licensing-website 2" \
    "export FIRESTORE_EMULATOR_HOST=localhost:8080 && \
     export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 && \
     export FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001 && \
     export FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199 && \
     firebase emulators:start --only hosting --port 8080"

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
echo "📋 tmux Commands:"
echo "   tmux attach -t dashboard-app    # View Dashboard logs"
echo "   tmux attach -t licensing-website # View Licensing logs"
echo "   tmux list-sessions              # List all sessions"
echo "   tmux kill-session -t dashboard-app # Stop Dashboard"
echo "   tmux kill-session -t licensing-website # Stop Licensing"
echo ""
echo "⏳ Waiting 5 seconds for startup..."
sleep 5

# Show status
echo "📊 Session Status:"
tmux list-sessions | grep -E "(dashboard-app|licensing-website)" || echo "Sessions starting..."

echo ""
echo "✅ Both projects should be running now!"
echo "🌐 Open your browser and visit the URLs above"
