#!/bin/bash

# Dry Run Script - Shows what would be fixed without making changes
# This script analyzes the codebase and reports all patterns that would be fixed

echo "🔍 DRY RUN: Analyzing codebase for syntax patterns..."
echo "=================================================="
echo ""

# Function to count and show matches
show_matches() {
    local pattern="$1"
    local description="$2"
    local files=$(find src -name "*.tsx" -type f -exec grep -l "$pattern" {} \; 2>/dev/null)
    local count=$(find src -name "*.tsx" -type f -exec grep -c "$pattern" {} \; 2>/dev/null | awk '{sum += $1} END {print sum}')
    
    if [ "$count" -gt 0 ]; then
        echo "📋 $description: $count matches found"
        echo "   Files affected:"
        for file in $files; do
            local line_count=$(grep -c "$pattern" "$file" 2>/dev/null)
            if [ "$line_count" -gt 0 ]; then
                echo "   - $file ($line_count matches)"
                # Show first few matches as examples
                grep -n "$pattern" "$file" 2>/dev/null | head -3 | sed 's/^/     Line /'
            fi
        done
        echo ""
    else
        echo "✅ $description: No issues found"
        echo ""
    fi
}

echo "1. MALFORMED TERNARY OPERATORS"
echo "==============================="

show_matches "Array\.isArray([^)]*) ? [^)]*\.filter([^)]*)$" "Filter operations missing : []"
show_matches "Array\.isArray([^)]*) ? [^)]*\.map([^)]*)$" "Map operations missing : []"
show_matches "Array\.isArray([^)]*) ? [^)]*\.forEach([^)]*)$" "ForEach operations missing : undefined"
show_matches "Array\.isArray([^)]*) ? [^)]*\.find([^)]*)$" "Find operations missing : undefined"
show_matches "Array\.isArray([^)]*) ? [^)]*\.some([^)]*)$" "Some operations missing : false"
show_matches "Array\.isArray([^)]*) ? [^)]*\.includes([^)]*)$" "Includes operations missing : false"
show_matches "Array\.isArray([^)]*) ? [^)]*\.join([^)]*)$" "Join operations missing : ''"
show_matches "Array\.isArray([^)]*) ? [^)]*\.reduce([^)]*)$" "Reduce operations missing default value"

echo "2. INCORRECT PROPERTY ACCESS"
echo "============================"

show_matches "[a-zA-Z_][a-zA-Z0-9_]*\.([a-zA-Z_][a-zA-Z0-9_]*" "Object.(property patterns"
show_matches "[a-zA-Z_][a-zA-Z0-9_]*\.([a-zA-Z_][a-zA-Z0-9_]*.*Array\.isArray" "Property access in Array.isArray checks"

echo "3. INCOMPLETE METHOD CALLS"
echo "=========================="

show_matches "\.forEach([^)]*)\s*)\s*:\s*undefined\s*=>" "Incomplete forEach calls"
show_matches "\.map(([^)]*)\s*:\s*\[\]\s*=>" "Incomplete map calls in JSX"
show_matches "\.filter([^)]*)\s*)\s*;$" "Incomplete filter calls"
show_matches "\.find([^)]*)\s*)\s*;$" "Incomplete find calls"
show_matches "\.reduce(([^)]*)\s*;$" "Incomplete reduce calls"

echo "4. ARRAY.ISARRAY ON STRINGS"
echo "==========================="

show_matches "([a-zA-Z_][a-zA-Z0-9_]*) && Array\.isArray(\1) ? \1\.includes" "Array.isArray check on string with includes"
show_matches "([a-zA-Z_][a-zA-Z0-9_]*) && Array\.isArray(\1) ? \1\.slice" "Array.isArray check on string with slice"
show_matches "([a-zA-Z_][a-zA-Z0-9_]*) && Array\.isArray(\1) ? \1\.charAt" "Array.isArray check on string with charAt"
show_matches "([a-zA-Z_][a-zA-Z0-9_]*) && Array\.isArray(\1) ? \1\.toLowerCase" "Array.isArray check on string with toLowerCase"

echo "5. SPECIFIC COMPLEX PATTERNS"
echo "============================"

show_matches "name: \`Agent \${id\.slice(0, 8);" "Incomplete object literal"
show_matches "request\.resolve(api(request\.config);" "Missing closing parenthesis"
show_matches "<EmojiGrid" "Incorrect JSX component name"
show_matches "timestamp: new Date([^)]*)\.toISOString()," "Timestamp type mismatch"

echo "6. MALFORMED IF CONDITIONS"
echo "=========================="

show_matches "if (([^)]*) && Array\.isArray([^)]*) ? [^)]*)) : false)" "Malformed if with ternary"
show_matches "if (([^)]*) && Array\.isArray([^)]*) ? [^)]*) : false)" "If conditions with malformed ternary"

echo "=================================================="
echo "🎯 SUMMARY"
echo "=================================================="

# Count total issues
total_files=$(find src -name "*.tsx" -type f | wc -l | tr -d ' ')
affected_files=$(find src -name "*.tsx" -type f -exec grep -l "Array\.isArray.*) ?" {} \; 2>/dev/null | wc -l | tr -d ' ')
total_issues=$(find src -name "*.tsx" -type f -exec grep -c "Array\.isArray.*) ?" {} \; 2>/dev/null | awk '{sum += $1} END {print sum}')

echo "📊 Total .tsx files: $total_files"
echo "📊 Files with issues: $affected_files"
echo "📊 Total issues found: $total_issues"
echo ""

if [ "$total_issues" -gt 0 ]; then
    echo "⚠️  Issues found that would be fixed by the bulk scripts."
    echo "   Run './run-all-fixes.sh' to apply all fixes."
    echo "   Or run './backup-and-fix.sh' for a safe fix with backup."
else
    echo "✅ No issues found! The codebase looks clean."
fi

echo ""
echo "🔍 Dry run completed."
