#!/bin/bash

# Bulk Fix Script 5: Fix Specific Complex Patterns
# This script fixes more complex patterns we've identified

echo "🔧 Starting bulk fix for specific complex patterns..."

# Pattern 1: Fix malformed ternary in template literals
echo "Fixing malformed ternary in template literals..."
find src -name "*.tsx" -type f -exec sed -i '' 's/\${(\([^}]*\) && Array\.isArray(\([^)]*\)) ? \([^}]*\))/\${\1 \&\& Array.isArray(\2) ? \3 : ""}/g' {} \;

# Pattern 2: Fix incomplete object literals in ternary
echo "Fixing incomplete object literals..."
find src -name "*.tsx" -type f -exec sed -i '' 's/name: `Agent \${id\.slice(0, 8);/name: `Agent \${id.slice(0, 8)}`,/g' {} \;

# Pattern 3: Fix malformed if conditions with ternary
echo "Fixing malformed if conditions..."
find src -name "*.tsx" -type f -exec sed -i '' 's/if ((\([^)]*\) && Array\.isArray(\([^)]*\)) ? \([^)]*\)) : false)/if (\1 \&\& Array.isArray(\2) ? \3 : false)/g' {} \;

# Pattern 4: Fix missing closing parentheses in function calls
echo "Fixing missing closing parentheses..."
find src -name "*.tsx" -type f -exec sed -i '' 's/request\.resolve(api(request\.config);/request.resolve(api(request.config));/g' {} \;

# Pattern 5: Fix malformed console.log statements
echo "Fixing console.log statements..."
find src -name "*.tsx" -type f -exec sed -i '' 's/console\.log(\([^)]*\) && Array\.isArray(\([^)]*\)) ? \([^)]*\));/console.log(\1 \&\& Array.isArray(\2) ? \3 : []);/g' {} \;

# Pattern 6: Fix malformed JSX component names
echo "Fixing JSX component names..."
find src -name "*.tsx" -type f -exec sed -i '' 's/<EmojiGrid/<Grid/g' {} \;

# Pattern 7: Fix malformed array push operations
echo "Fixing array push operations..."
find src -name "*.tsx" -type f -exec sed -i '' 's/(\([^)]*\) && Array\.isArray(\([^)]*\)) ? \([^)]*\)\.push(\([^)]*\))) : 0;/\3.push(\4);/g' {} \;

# Pattern 8: Fix timestamp type issues
echo "Fixing timestamp type issues..."
find src -name "*.tsx" -type f -exec sed -i '' 's/timestamp: new Date(\([^)]*\))\.toISOString(),/timestamp: new Date(\1),/g' {} \;

echo "✅ Specific pattern fixes completed!"
