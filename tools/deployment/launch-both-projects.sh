#!/bin/bash

# 🚀 Simple Launcher for Both Projects
# This script assumes both projects are already running and just opens the URLs

echo "🚀 Launching Both Projects in Browser..."
echo "======================================="

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

# Check if Dashboard is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ Dashboard web app is not running on port 3000!"
    echo "Please start it first with: ./start-dashboard-web-app.sh"
    echo ""
    exit 1
fi

# Check if Licensing website is running
if ! curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "❌ Licensing website is not running on port 8080!"
    echo "Please start it first with: ./start-licensing-website.sh"
    echo ""
    exit 1
fi

echo "✅ All services detected and running!"

# Open URLs in browser
echo "🌐 Opening applications in browser..."

# Open Dashboard web app
open "http://localhost:3000"
echo "📱 Dashboard web app opened: http://localhost:3000"

# Open Licensing website
open "http://localhost:8080"
echo "🌐 Licensing website opened: http://localhost:8080"

# Open Firebase Emulator UI
open "http://localhost:4000"
echo "📊 Firebase Emulator UI opened: http://localhost:4000"

echo ""
echo "🎉 All applications opened in browser!"
echo "====================================="
echo "📱 Dashboard Web App: http://localhost:3000"
echo "🌐 Licensing Website: http://localhost:8080"
echo "📊 Firebase Emulator UI: http://localhost:4000"
echo ""
echo "🔑 Test Credentials:"
echo "   Email: enterprise.user@enterprisemedia.com"
echo "   Password: Enterprise123!"
echo ""
echo "💡 Tip: Both apps share the same data - login to one and you're logged into both!"
