#!/bin/bash

# 🔧 DEPLOY CLEANED CODE TO PRODUCTION
# 
# This script deploys the cleaned codebase to Firebase production
# after removing hardcoded session IDs.

set -e

echo "🚀 DEPLOYING CLEANED CODE TO PRODUCTION"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -d "../Dashboard-v14_2" ]; then
    echo "❌ Error: Dashboard-v14_2 directory not found"
    echo "   Please run this script from the tools/ directory"
    exit 1
fi

# Navigate to the main project directory
cd ../Dashboard-v14_2

echo "📁 Current directory: $(pwd)"
echo ""

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI not found"
    echo "   Please install Firebase CLI: npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged into Firebase
echo "🔐 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "❌ Error: Not authenticated with Firebase"
    echo "   Please run: firebase login"
    exit 1
fi

echo "✅ Firebase authentication verified"
echo ""

# Build the application
echo "🔨 Building application..."
if npm run build; then
    echo "✅ Build completed successfully"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""

# Deploy to Firebase
echo "🚀 Deploying to Firebase production..."
echo "   Project: backbone-logic"
echo "   Hosting: main (backbone-client.web.app)"
echo "   Functions: All functions"
echo ""

if firebase deploy --only hosting:main,functions; then
    echo ""
    echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "====================================="
    echo ""
    echo "✅ Application deployed to: https://backbone-client.web.app"
    echo "✅ API deployed to: https://api-oup5qxogca-uc.a.run.app"
    echo ""
    echo "🔧 Next Steps:"
    echo "   1. Test the application in production"
    echo "   2. Optionally run Firestore cleanup: cd tools && node firestore-cleanup.js"
    echo "   3. Validate sessions: cd tools && node validate-production-sessions.js"
    echo ""
    echo "📚 See tools/HARDCODED_SESSION_CLEANUP_README.md for more details"
else
    echo ""
    echo "❌ DEPLOYMENT FAILED"
    echo "===================="
    echo ""
    echo "Please check the error messages above and try again"
    exit 1
fi
