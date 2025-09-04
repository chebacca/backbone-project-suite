#!/bin/bash

# 🚀 BACKBONE v14.2 - Simple Unified Development Environment
echo "🔥 BACKBONE v14.2 - Simple Unified Development"
echo "=============================================="

# Set Java path
export PATH="/opt/homebrew/opt/openjdk@11/bin:$PATH"

# Clean up existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "firebase.*emulators" 2>/dev/null || true
sleep 2

# Start core emulators only (auth, firestore, functions, ui)
echo "🔥 Starting core Firebase emulators..."
firebase emulators:start --only auth,firestore,functions,ui --project backbone-logic &
EMULATOR_PID=$!

# Wait for emulators to start
echo "⏳ Waiting for emulators to initialize..."
sleep 8

# Seed data
echo "🌱 Seeding emulator data..."
echo "  📊 Seeding Firestore with enterprise data..."
(cd Dashboard-v14_2 && FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 node functions/generate-enterprise-mock-data.js) &
SEED_PID=$!

echo "  🔑 Seeding Authentication with users..."
(cd Dashboard-v14_2 && FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 node scripts/seed-firestore-users.cjs) &
AUTH_PID=$!

# Wait for seeding
echo "⏳ Waiting for data seeding..."
wait $SEED_PID
wait $AUTH_PID

# Add enterprise users to auth
echo "  👥 Adding enterprise users to Authentication..."
FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 node seed-auth-emulator.cjs

echo ""
echo "✅ EMULATORS READY!"
echo "=================="
echo "🔥 Firebase Emulator UI: http://localhost:4000"
echo "🔑 Test Login: chebacca@gmail.com / CheAdmin2024!"
echo ""
echo "📱 To serve Dashboard: cd Dashboard-v14_2/apps/web && npx serve public"
echo "🌐 To serve Licensing: cd 'dashboard-v14-licensing-website 2' && npx serve deploy"
echo ""
echo "Press Ctrl+C to stop emulators..."

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Shutting down emulators..."
    kill $EMULATOR_PID 2>/dev/null || true
    pkill -f "firebase.*emulators" 2>/dev/null || true
    echo "✅ Cleanup complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
wait
