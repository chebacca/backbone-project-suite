#!/bin/bash

# Bulk Fix Script 2: Fix Incorrect Property Access Patterns
# This script fixes patterns like:
# object.(property instead of object.property

echo "🔧 Starting bulk fix for incorrect property access patterns..."

# Pattern 1: Fix object.(property patterns
echo "Fixing object.(property patterns..."
find src -name "*.tsx" -type f -exec sed -i '' 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\.(\([a-zA-Z_][a-zA-Z0-9_]*\)/(\1.\2/g' {} \;

# Pattern 2: Fix more complex property access with nested patterns
echo "Fixing nested property access patterns..."
find src -name "*.tsx" -type f -exec sed -i '' 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\.(\([a-zA-Z_][a-zA-Z0-9_]*\) && Array\.isArray(\([^)]*\))/(\1.\2 \&\& Array.isArray(\3)/g' {} \;

# Pattern 3: Fix property access in ternary conditions
echo "Fixing property access in ternary conditions..."
find src -name "*.tsx" -type f -exec sed -i '' 's/(\([a-zA-Z_][a-zA-Z0-9_]*\)\.(\([a-zA-Z_][a-zA-Z0-9_]*\) \&\& Array\.isArray(\([^)]*\))/(\1.\2 \&\& Array.isArray(\3)/g' {} \;

echo "✅ Property access fixes completed!"
