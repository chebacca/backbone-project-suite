#!/bin/bash

# Bulk Fix Script 4: Fix Malformed Array.isArray Checks on Strings
# This script fixes patterns like:
# (string && Array.isArray(string) ? string.includes(...) : false)
# Where string is actually a string, not an array

echo "🔧 Starting bulk fix for malformed Array.isArray checks on strings..."

# Pattern 1: Fix Array.isArray checks on string variables for includes
echo "Fixing Array.isArray checks on strings with includes..."
find src -name "*.tsx" -type f -exec sed -i '' 's/(\([a-zA-Z_][a-zA-Z0-9_]*\) && Array\.isArray(\1) ? \1\.includes(\([^)]*\)) : false)/(\1 \&\& \1.includes(\2))/g' {} \;

# Pattern 2: Fix Array.isArray checks on string variables for slice
echo "Fixing Array.isArray checks on strings with slice..."
find src -name "*.tsx" -type f -exec sed -i '' 's/(\([a-zA-Z_][a-zA-Z0-9_]*\) && Array\.isArray(\1) ? \1\.slice(\([^)]*\)) : "")/(\1 ? \1.slice(\2) : "")/g' {} \;

# Pattern 3: Fix Array.isArray checks on string variables for charAt
echo "Fixing Array.isArray checks on strings with charAt..."
find src -name "*.tsx" -type f -exec sed -i '' 's/(\([a-zA-Z_][a-zA-Z0-9_]*\) && Array\.isArray(\1) ? \1\.charAt(\([^)]*\)) : "")/(\1 ? \1.charAt(\2) : "")/g' {} \;

# Pattern 4: Fix Array.isArray checks on string variables for toLowerCase
echo "Fixing Array.isArray checks on strings with toLowerCase..."
find src -name "*.tsx" -type f -exec sed -i '' 's/(\([a-zA-Z_][a-zA-Z0-9_]*\) && Array\.isArray(\1) ? \1\.toLowerCase(\([^)]*\)) : "")/(\1 ? \1.toLowerCase(\2) : "")/g' {} \;

# Pattern 5: Fix Array.isArray checks on string variables for replace
echo "Fixing Array.isArray checks on strings with replace..."
find src -name "*.tsx" -type f -exec sed -i '' 's/(\([a-zA-Z_][a-zA-Z0-9_]*\) && Array\.isArray(\1) ? \1\.replace(\([^)]*\)) : "")/(\1 ? \1.replace(\2) : "")/g' {} \;

# Pattern 6: Fix Array.isArray checks on string variables for split
echo "Fixing Array.isArray checks on strings with split..."
find src -name "*.tsx" -type f -exec sed -i '' 's/(\([a-zA-Z_][a-zA-Z0-9_]*\) && Array\.isArray(\1) ? \1\.split(\([^)]*\)) : \[\])/(\1 ? \1.split(\2) : [])/g' {} \;

# Pattern 7: Fix Array.isArray checks on string variables for startsWith
echo "Fixing Array.isArray checks on strings with startsWith..."
find src -name "*.tsx" -type f -exec sed -i '' 's/(\([a-zA-Z_][a-zA-Z0-9_]*\) && Array\.isArray(\1) ? \1\.startsWith(\([^)]*\)) : false)/(\1 \&\& \1.startsWith(\2))/g' {} \;

# Pattern 8: Fix Array.isArray checks on string variables for endsWith
echo "Fixing Array.isArray checks on strings with endsWith..."
find src -name "*.tsx" -type f -exec sed -i '' 's/(\([a-zA-Z_][a-zA-Z0-9_]*\) && Array\.isArray(\1) ? \1\.endsWith(\([^)]*\)) : false)/(\1 \&\& \1.endsWith(\2))/g' {} \;

echo "✅ Array.isArray string fixes completed!"
