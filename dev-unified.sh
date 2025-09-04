#!/bin/bash

# 🚀 BACKBONE v14.2 - Unified Development Environment
# This script provides the long-term solution for local development

set -e

echo "🔥 BACKBONE v14.2 - Unified Development Environment"
echo "=================================================="

# Set Java path
export PATH="/opt/homebrew/opt/openjdk@11/bin:$PATH"

# Check prerequisites
echo "🔍 Checking prerequisites..."
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Installing..."
    brew install openjdk@11
    export PATH="/opt/homebrew/opt/openjdk@11/bin:$PATH"
fi

if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install: npm install -g firebase-tools"
    exit 1
fi

# Clean up any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "firebase.*emulators" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
sleep 2

# Build both applications
echo "🏗️ Building applications..."
echo "  📱 Building Dashboard..."
(cd Dashboard-v14_2/apps/web && npm run build) &
DASHBOARD_BUILD_PID=$!

echo "  🌐 Building Licensing Website..."
(cd "dashboard-v14-licensing-website 2" && pnpm build) &
LICENSING_BUILD_PID=$!

# Wait for builds to complete
wait $DASHBOARD_BUILD_PID
wait $LICENSING_BUILD_PID
echo "✅ Builds complete"

# Start unified Firebase emulators
echo "🔥 Starting unified Firebase emulators..."
firebase emulators:start --project backbone-logic &
EMULATOR_PID=$!

# Wait for emulators to start
echo "⏳ Waiting for emulators to initialize..."
sleep 10

# Seed data
echo "🌱 Seeding emulator data..."
echo "  📊 Seeding Firestore with enterprise data..."
(cd Dashboard-v14_2 && FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 node functions/generate-enterprise-mock-data.js) &
SEED_FIRESTORE_PID=$!

echo "  🔑 Seeding Authentication with users..."
(cd Dashboard-v14_2 && FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 node scripts/seed-firestore-users.cjs) &
SEED_AUTH_PID=$!

echo "  👥 Adding enterprise users to Authentication..."
(FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 node seed-auth-emulator.cjs) &
SEED_ENTERPRISE_PID=$!

# Start development servers
echo "🚀 Starting development servers..."
echo "  📱 Starting Dashboard dev server..."
(cd Dashboard-v14_2/apps/web && \
  export FIRESTORE_EMULATOR_HOST=localhost:8080 && \
  export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 && \
  export FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001 && \
  export FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199 && \
  npm run dev) &
DASHBOARD_DEV_PID=$!

echo "  🌐 Starting Licensing dev server..."
(cd "dashboard-v14-licensing-website 2/client" && \
  export FIRESTORE_EMULATOR_HOST=localhost:8080 && \
  export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 && \
  export FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001 && \
  export FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199 && \
  npm run dev) &
LICENSING_DEV_PID=$!

# Wait for seeding to complete
echo "⏳ Waiting for data seeding to complete..."
wait $SEED_FIRESTORE_PID
wait $SEED_AUTH_PID  
wait $SEED_ENTERPRISE_PID
echo "✅ Data seeding complete"

# Final setup
echo "🎯 Final setup..."
sleep 5

# Open applications
echo "🌐 Opening applications..."
open http://localhost:3000 2>/dev/null || echo "Dashboard will be available at http://localhost:3000"
open http://localhost:5173 2>/dev/null || echo "Licensing will be available at http://localhost:5173"
open http://localhost:4000 2>/dev/null || echo "Emulator UI available at http://localhost:4000"

echo ""
echo "✅ UNIFIED DEVELOPMENT ENVIRONMENT READY!"
echo "=========================================="
echo "📱 Dashboard Web App:    http://localhost:3000"
echo "🌐 Licensing Website:    http://localhost:5173"
echo "🔥 Firebase Emulator UI: http://localhost:4000"
echo "🔑 Test Login: chebacca@gmail.com / CheAdmin2024!"
echo ""
echo "💡 All services share the same Firebase emulators"
echo "📊 Data is synchronized across both applications"
echo "🛡️ Authentication works across both platforms"
echo ""
echo "Press Ctrl+C to stop all services..."

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Shutting down all services..."
    kill $EMULATOR_PID 2>/dev/null || true
    kill $DASHBOARD_DEV_PID 2>/dev/null || true
    kill $LICENSING_DEV_PID 2>/dev/null || true
    pkill -f "firebase.*emulators" 2>/dev/null || true
    pkill -f "npm.*dev" 2>/dev/null || true
    echo "✅ Cleanup complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
wait
