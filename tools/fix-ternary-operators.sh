#!/bin/bash

# Bulk Fix Script 1: Fix Malformed Ternary Operators
# This script fixes patterns like:
# Array.isArray(array) ? array.method(...) 
# Missing the : [] or : false part

echo "🔧 Starting bulk fix for malformed ternary operators..."

# Pattern 1: Fix filter operations missing : []
echo "Fixing filter operations..."
find src -name "*.tsx" -type f -exec sed -i '' 's/Array\.isArray(\([^)]*\)) ? \([^)]*\)\.filter(\([^)]*\))$/Array.isArray(\1) ? \2.filter(\3) : []/g' {} \;

# Pattern 2: Fix map operations missing : []
echo "Fixing map operations..."
find src -name "*.tsx" -type f -exec sed -i '' 's/Array\.isArray(\([^)]*\)) ? \([^)]*\)\.map(\([^)]*\))$/Array.isArray(\1) ? \2.map(\3) : []/g' {} \;

# Pattern 3: Fix forEach operations missing : undefined
echo "Fixing forEach operations..."
find src -name "*.tsx" -type f -exec sed -i '' 's/Array\.isArray(\([^)]*\)) ? \([^)]*\)\.forEach(\([^)]*\))$/Array.isArray(\1) ? \2.forEach(\3) : undefined/g' {} \;

# Pattern 4: Fix find operations missing : undefined
echo "Fixing find operations..."
find src -name "*.tsx" -type f -exec sed -i '' 's/Array\.isArray(\([^)]*\)) ? \([^)]*\)\.find(\([^)]*\))$/Array.isArray(\1) ? \2.find(\3) : undefined/g' {} \;

# Pattern 5: Fix some operations missing : false
echo "Fixing some operations..."
find src -name "*.tsx" -type f -exec sed -i '' 's/Array\.isArray(\([^)]*\)) ? \([^)]*\)\.some(\([^)]*\))$/Array.isArray(\1) ? \2.some(\3) : false/g' {} \;

# Pattern 6: Fix includes operations missing : false
echo "Fixing includes operations..."
find src -name "*.tsx" -type f -exec sed -i '' 's/Array\.isArray(\([^)]*\)) ? \([^)]*\)\.includes(\([^)]*\))$/Array.isArray(\1) ? \2.includes(\3) : false/g' {} \;

# Pattern 7: Fix join operations missing : ''
echo "Fixing join operations..."
find src -name "*.tsx" -type f -exec sed -i '' 's/Array\.isArray(\([^)]*\)) ? \([^)]*\)\.join(\([^)]*\))$/Array.isArray(\1) ? \2.join(\3) : ""/g' {} \;

# Pattern 8: Fix reduce operations missing : 0 or appropriate default
echo "Fixing reduce operations..."
find src -name "*.tsx" -type f -exec sed -i '' 's/Array\.isArray(\([^)]*\)) ? \([^)]*\)\.reduce(\([^)]*\))$/Array.isArray(\1) ? \2.reduce(\3) : 0/g' {} \;

# Pattern 9: Fix length operations missing : 0
echo "Fixing length operations..."
find src -name "*.tsx" -type f -exec sed -i '' 's/Array\.isArray(\([^)]*\)) ? \([^)]*\)\.length$/Array.isArray(\1) ? \2.length : 0/g' {} \;

echo "✅ Ternary operator fixes completed!"
