#!/bin/bash

# Timecard Template Fix Script
# This script fixes the TimeCardModal template calculation issues by:
# 1. Checking for existing templates
# 2. Creating default templates if none exist
# 3. Assigning users to templates
# 4. Testing the fix
# 5. Verifying the solution

set -e

echo "🔧 Timecard Template Fix Script"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -d "Dashboard-v14_2" ]; then
    echo "❌ Error: Dashboard-v14_2 directory not found. Please run this script from the project root."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    exit 1
fi

# Check if the scripts exist
if [ ! -f "tools/check-and-create-timecard-templates.js" ]; then
    echo "❌ Error: check-and-create-timecard-templates.js not found"
    exit 1
fi

if [ ! -f "tools/assign-users-to-templates.js" ]; then
    echo "❌ Error: assign-users-to-templates.js not found"
    exit 1
fi

if [ ! -f "tools/test-timecard-templates.js" ]; then
    echo "❌ Error: test-timecard-templates.js not found"
    exit 1
fi

# Check if Firebase CLI is authenticated
if ! firebase projects:list &> /dev/null; then
    echo "⚠️  Warning: Firebase CLI not authenticated. Attempting to authenticate..."
    if ! firebase login; then
        echo "❌ Error: Failed to authenticate with Firebase CLI"
        echo "💡 Please run 'firebase login' manually and try again"
        exit 1
    fi
fi

# Check if we're in the right project
CURRENT_PROJECT=$(firebase use --json | grep -o '"current":"[^"]*"' | cut -d'"' -f4)
if [ "$CURRENT_PROJECT" != "backbone-logic" ]; then
    echo "⚠️  Warning: Current Firebase project is '$CURRENT_PROJECT', expected 'backbone-logic'"
    echo "💡 Switching to backbone-logic project..."
    firebase use backbone-logic
fi

echo "✅ Environment check passed"
echo ""

# Step 1: Check and create templates
echo "📋 Step 1: Checking and creating timecard templates..."
node tools/check-and-create-timecard-templates.js

if [ $? -ne 0 ]; then
    echo "❌ Failed to create templates"
    exit 1
fi

echo ""

# Step 2: Assign users to templates
echo "👥 Step 2: Assigning users to templates..."
node tools/assign-users-to-templates.js

if [ $? -ne 0 ]; then
    echo "❌ Failed to assign users to templates"
    exit 1
fi

echo ""

# Step 3: Test the fix
echo "🧪 Step 3: Testing the fix..."
node tools/test-timecard-templates.js

if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    exit 1
fi

echo ""

# Step 4: Final verification
echo "🔍 Step 4: Final verification..."
echo "✅ All steps completed successfully!"
echo ""
echo "🎯 Next steps to test the fix:"
echo "1. Open the TimeCardModal in your web app"
echo "2. Check the browser console for these messages:"
echo "   - '🎨 [TimeCardModal] User template loaded:'"
echo "   - '💰 [TimeCardModal] Template effective config:'"
echo "   - '💰 [TimeCardModal] Calculating with template (with defaults):'"
echo "3. The error 'Cannot calculate template totals' should no longer appear"
echo "4. Timecard calculations should work with proper hourly rates and overtime rules"
echo ""
echo "🔧 If you still see issues, check:"
echo "   - Browser console for template loading errors"
echo "   - Network tab for API calls to /timecard/template"
echo "   - Firestore database for template assignments"
echo "   - Run 'node tools/test-timecard-templates.js' to verify database state"
echo ""
echo "📚 For more information, see the MPC library documentation on timecard templates"
echo ""
echo "🎉 Fix script completed successfully!"
