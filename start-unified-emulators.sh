#!/bin/bash

# 🚀 BACKBONE v14.2 - Unified Emulator Solution (Working Version)
echo "🔥 BACKBONE v14.2 - Unified Emulator Solution"
echo "=============================================="

# Set Java path
export PATH="/opt/homebrew/opt/openjdk@11/bin:$PATH"

# Clean up
echo "🧹 Cleaning up existing processes..."
pkill -f "firebase.*emulators" 2>/dev/null || true
sleep 3

# Start emulators from root with unified config
echo "🔥 Starting unified Firebase emulators..."
firebase emulators:start --only auth,firestore,functions,ui --project backbone-logic

echo "✅ Emulators stopped."
