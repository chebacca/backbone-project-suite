#!/bin/bash

# Master Bulk Fix Script
# Runs all fix scripts in the correct order

echo "🚀 Starting comprehensive bulk fix for all syntax patterns..."
echo "=================================================="

# Make all scripts executable
chmod +x fix-ternary-operators.sh
chmod +x fix-property-access.sh
chmod +x fix-incomplete-methods.sh
chmod +x fix-array-isarray-strings.sh
chmod +x fix-specific-patterns.sh

# Run fixes in order
echo "Step 1/5: Fixing ternary operators..."
./fix-ternary-operators.sh

echo ""
echo "Step 2/5: Fixing property access patterns..."
./fix-property-access.sh

echo ""
echo "Step 3/5: Fixing incomplete method calls..."
./fix-incomplete-methods.sh

echo ""
echo "Step 4/5: Fixing Array.isArray on strings..."
./fix-array-isarray-strings.sh

echo ""
echo "Step 5/5: Fixing specific complex patterns..."
./fix-specific-patterns.sh

echo ""
echo "=================================================="
echo "🎉 All bulk fixes completed!"
echo ""
echo "Next steps:"
echo "1. Run 'pnpm run build' to check for remaining errors"
echo "2. Review changes with 'git diff' before committing"
echo "3. Test the application to ensure functionality"
echo ""
echo "If there are still errors, they may require manual fixes."
