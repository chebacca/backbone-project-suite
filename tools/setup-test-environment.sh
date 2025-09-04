#!/bin/bash

# Setup script for User Registration Flow Test
# This script helps set up the testing environment

set -e

echo "🚀 Setting up User Registration Flow Test Environment"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "test-user-registration-flow.js" ]; then
    echo "❌ Error: test-user-registration-flow.js not found in current directory"
    echo "Please run this script from the directory containing the test files"
    exit 1
fi

# Check Node.js version
echo "🔍 Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ is required (current: $(node --version))"
    echo "Please upgrade Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if Firebase CLI is installed
echo "🔍 Checking Firebase CLI..."
if ! command -v firebase &> /dev/null; then
    echo "⚠️  Warning: Firebase CLI is not installed"
    echo "You may need to install it for some operations:"
    echo "  npm install -g firebase-tools"
else
    echo "✅ Firebase CLI version: $(firebase --version)"
fi

# Check Firebase authentication
echo "🔍 Checking Firebase authentication..."
if firebase projects:list &> /dev/null; then
    echo "✅ Firebase CLI is authenticated"
    CURRENT_PROJECT=$(firebase use --only=projectId 2>/dev/null || echo "No project selected")
    echo "   Current project: $CURRENT_PROJECT"
else
    echo "⚠️  Warning: Firebase CLI is not authenticated"
    echo "Run 'firebase login' to authenticate"
fi

# Install dependencies
echo "📦 Installing test dependencies..."
if [ -f "test-user-registration-package.json" ]; then
    echo "Installing from test-user-registration-package.json..."
    npm install --package-lock-only
    npm ci
else
    echo "Installing dependencies directly..."
    npm install firebase-admin@^12.0.0 axios@^1.6.0 speakeasy@^2.0.0 qrcode@^1.5.3
fi

echo "✅ Dependencies installed"

# Check environment variables
echo "🔍 Checking environment configuration..."
echo ""

# Check for Firebase credentials
if [ -n "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "✅ GOOGLE_APPLICATION_CREDENTIALS is set: $GOOGLE_APPLICATION_CREDENTIALS"
    if [ -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
        echo "✅ Service account key file exists"
    else
        echo "⚠️  Warning: Service account key file not found"
    fi
else
    echo "ℹ️  GOOGLE_APPLICATION_CREDENTIALS not set"
    echo "   Using Application Default Credentials (ADC)"
    echo "   Make sure you're authenticated with: gcloud auth application-default login"
fi

# Check for Firebase project ID
if [ -n "$FIREBASE_PROJECT_ID" ]; then
    echo "✅ FIREBASE_PROJECT_ID is set: $FIREBASE_PROJECT_ID"
else
    echo "ℹ️  FIREBASE_PROJECT_ID not set"
    echo "   Will use default from firebase.json or gcloud config"
fi

echo ""
echo "🔧 Configuration Steps:"
echo "======================"
echo "1. Update API_BASE_URL in test-user-registration-flow.js if your server runs on a different port"
echo "2. Ensure your server is running and accessible"
echo "3. Verify Firebase project configuration"
echo "4. Check that email service is configured for email verification tests"
echo ""

# Check if server is accessible
echo "🔍 Checking server accessibility..."
if [ -n "$API_BASE_URL" ]; then
    SERVER_URL="$API_BASE_URL"
else
    SERVER_URL="http://localhost:3001"
fi

if curl -s --connect-timeout 5 "$SERVER_URL/health" > /dev/null 2>&1; then
    echo "✅ Server is accessible at $SERVER_URL"
elif curl -s --connect-timeout 5 "$SERVER_URL" > /dev/null 2>&1; then
    echo "✅ Server is accessible at $SERVER_URL"
else
    echo "⚠️  Warning: Server may not be accessible at $SERVER_URL"
    echo "   Make sure your server is running and update API_BASE_URL if needed"
fi

echo ""
echo "🎯 Ready to run tests!"
echo "======================"
echo "Run the test with:"
echo "  node test-user-registration-flow.js"
echo ""
echo "Or with npm:"
echo "  npm test"
echo ""
echo "📝 Test Configuration:"
echo "======================"
echo "Test User: chrismole@example.com"
echo "Password: TestPassword123!"
echo "API Base URL: $SERVER_URL"
echo "Firebase Project: $FIREBASE_PROJECT_ID"
echo ""
echo "⚠️  Important Notes:"
echo "==================="
echo "1. This test will create and then delete a real user account"
echo "2. Make sure you're testing against a development/staging environment"
echo "3. The test user will receive a real email verification email"
echo "4. 2FA setup will require manual intervention in some cases"
echo "5. Cleanup will remove all test data created during the test"
echo ""
echo "🚀 Setup complete! You can now run the comprehensive user registration test."
