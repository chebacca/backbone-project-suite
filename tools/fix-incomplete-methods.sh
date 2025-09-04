#!/bin/bash

# Bulk Fix Script 3: Fix Incomplete Array Method Calls
# This script fixes patterns like:
# array.method(item => { ... ) : []
# Missing closing parentheses or incomplete callback functions

echo "🔧 Starting bulk fix for incomplete array method calls..."

# Pattern 1: Fix incomplete forEach with missing closing parenthesis
echo "Fixing incomplete forEach calls..."
find src -name "*.tsx" -type f -exec sed -i '' 's/\.forEach(\([^)]*\)\s*)\s*:\s*undefined\s*=>/\.forEach(\1) => {/g' {} \;

# Pattern 2: Fix incomplete map calls in JSX
echo "Fixing incomplete map calls in JSX..."
find src -name "*.tsx" -type f -exec sed -i '' 's/\.map((\([^)]*\))\s*:\s*\[\]\s*=>/\.map((\1) => (/g' {} \;

# Pattern 3: Fix incomplete filter calls
echo "Fixing incomplete filter calls..."
find src -name "*.tsx" -type f -exec sed -i '' 's/\.filter(\([^)]*\)\s*)\s*;\s*$/\.filter(\1));/g' {} \;

# Pattern 4: Fix incomplete find calls
echo "Fixing incomplete find calls..."
find src -name "*.tsx" -type f -exec sed -i '' 's/\.find(\([^)]*\)\s*)\s*;\s*$/\.find(\1));/g' {} \;

# Pattern 5: Fix malformed ternary operators with missing closing parenthesis
echo "Fixing malformed ternary operators..."
find src -name "*.tsx" -type f -exec sed -i '' 's/Array\.isArray(\([^)]*\)) \? \([^)]*\)\.\([a-zA-Z]*\)(\([^)]*\))\s*)\s*:\s*\([^;]*\);/Array.isArray(\1) ? \2.\3(\4) : \5;/g' {} \;

# Pattern 6: Fix incomplete reduce calls
echo "Fixing incomplete reduce calls..."
find src -name "*.tsx" -type f -exec sed -i '' 's/\.reduce((\([^)]*\))\s*;\s*$/\.reduce((\1) => \1 + (asset.value || 0), 0);/g' {} \;

echo "✅ Incomplete method call fixes completed!"
