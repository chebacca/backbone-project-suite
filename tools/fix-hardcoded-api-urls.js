#!/usr/bin/env node

/**
 * Script to fix hardcoded API URLs in the codebase
 * 
 * This script identifies files with hardcoded '/api/' URLs and provides
 * suggestions for fixing them to use getApiUrl() instead.
 * 
 * Usage: node tools/fix-hardcoded-api-urls.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DRY_RUN = process.argv.includes('--dry-run');

// Files that have been manually fixed
const FIXED_FILES = [
    'Dashboard-v14_2/apps/web/src/contexts/UnifiedTimecardContext.tsx'
];

// Common patterns to fix
const PATTERNS = [
    {
        pattern: /fetch\s*\(\s*['"`]\/api\/([^'"`]+)['"`]/g,
        replacement: "fetch(getApiUrl('$1')",
        description: "Replace fetch('/api/...') with fetch(getApiUrl('...'))"
    },
    {
        pattern: /fetch\s*\(\s*`\/api\/([^`]+)`/g,
        replacement: "fetch(getApiUrl(`$1`))",
        description: "Replace fetch(`/api/...`) with fetch(getApiUrl(`...`))"
    }
];

function findFilesWithHardcodedUrls() {
    try {
        const result = execSync(
            `grep -r "fetch.*'/api/" src --include="*.ts" --include="*.tsx" -l || grep -r 'fetch.*"/api/' src --include="*.ts" --include="*.tsx" -l || true`,
            { encoding: 'utf8' }
        );
        return result.trim().split('\n').filter(file => file && !FIXED_FILES.includes(file));
    } catch (error) {
        console.log('No files found with hardcoded API URLs (or grep failed)');
        return [];
    }
}

function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Check if file already imports getApiUrl
    const hasGetApiUrlImport = content.includes("import { getApiUrl }") || 
                              content.includes("from '@/utils/api'");
    
    // Find hardcoded API URLs
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        if (line.includes("fetch(") && line.includes("/api/")) {
            issues.push({
                line: index + 1,
                content: line.trim(),
                needsImport: !hasGetApiUrlImport
            });
        }
    });
    
    return issues;
}

function generateFixSuggestions(filePath, issues) {
    console.log(`\n📁 ${filePath}`);
    console.log('=' .repeat(60));
    
    if (issues.length === 0) {
        console.log('✅ No hardcoded API URLs found');
        return;
    }
    
    if (issues[0].needsImport) {
        console.log('🔧 Add import:');
        console.log("   import { getApiUrl } from '@/utils/api';");
        console.log('');
    }
    
    console.log('🔧 Fix these lines:');
    issues.forEach(issue => {
        console.log(`   Line ${issue.line}: ${issue.content}`);
        
        // Generate suggested fix
        let suggestion = issue.content;
        PATTERNS.forEach(pattern => {
            suggestion = suggestion.replace(pattern.pattern, pattern.replacement);
        });
        
        if (suggestion !== issue.content) {
            console.log(`   Suggested: ${suggestion}`);
        }
        console.log('');
    });
}

function main() {
    console.log('🔍 Finding files with hardcoded API URLs...\n');
    
    const files = findFilesWithHardcodedUrls();
    
    if (files.length === 0) {
        console.log('✅ No files found with hardcoded API URLs!');
        return;
    }
    
    console.log(`Found ${files.length} files that need fixing:`);
    
    let totalIssues = 0;
    
    files.forEach(file => {
        const issues = analyzeFile(file);
        totalIssues += issues.length;
        generateFixSuggestions(file, issues);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Summary: ${totalIssues} hardcoded API URLs found in ${files.length} files`);
    console.log('\n🎯 Next steps:');
    console.log('1. Add the getApiUrl import to files that need it');
    console.log('2. Replace hardcoded /api/ URLs with getApiUrl() calls');
    console.log('3. Test the changes in web-only mode');
    
    if (DRY_RUN) {
        console.log('\n💡 This was a dry run. Use without --dry-run to see actual suggestions.');
    }
}

if (require.main === module) {
    main();
}
