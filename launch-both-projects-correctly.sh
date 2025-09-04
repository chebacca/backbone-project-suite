#!/bin/bash

# Launch Both Projects with Correct Configuration
echo "🚀 Launching Dashboard and Licensing Website with Firebase Emulators"

# Set Java path
export PATH="/opt/homebrew/opt/openjdk@11/bin:$PATH"

# Kill any existing hosting processes
echo "🧹 Cleaning up existing hosting processes..."
pkill -f "firebase.*hosting" 2>/dev/null || true
sleep 2

# Start Dashboard hosting emulator (port 3000)
echo "📱 Starting Dashboard Web App..."
cd "Dashboard-v14_2"
firebase emulators:start --only hosting:main --project backbone-logic &
DASHBOARD_PID=$!
echo "Dashboard PID: $DASHBOARD_PID"

# Wait a moment
sleep 3

# Start Licensing website hosting emulator (port 5001) 
echo "🌐 Starting Licensing Website..."
cd "../dashboard-v14-licensing-website 2"
firebase emulators:start --only hosting:main --project backbone-logic &
LICENSING_PID=$!
echo "Licensing PID: $LICENSING_PID"

# Wait for both to start
echo "⏳ Waiting for both applications to start..."
sleep 8

# Check what's running
echo "🔍 Checking what's running on each port..."
echo "=== Dashboard (port 3000) ==="
curl -s http://localhost:3000 | grep -i title || echo "Not responding"

echo "=== Licensing (port 5001) ==="  
curl -s http://localhost:5001 | grep -i title || echo "Not responding"

echo "=== Alternative ports ==="
echo "Port 5002:"
curl -s http://localhost:5002 | grep -i title || echo "Not responding"
echo "Port 5007:"
curl -s http://localhost:5007 | grep -i title || echo "Not responding"

# Open browsers
echo "🌐 Opening applications in browser..."
open http://localhost:3000 2>/dev/null || open http://localhost:5002 2>/dev/null || echo "Dashboard not accessible"
open http://localhost:5001 2>/dev/null || open http://localhost:5007 2>/dev/null || echo "Licensing not accessible"
open http://localhost:4000 2>/dev/null || echo "Emulator UI not accessible"

echo "✅ Launch complete!"
echo "📊 Firebase Emulator UI: http://localhost:4000"
echo "🔑 Test with: chebacca@gmail.com / CheAdmin2024!"

# Keep script running
echo "Press Ctrl+C to stop all processes..."
wait
