#!/usr/bin/env node

/**
 * Batch fix script for hardcoded API URLs
 * 
 * This script automatically fixes hardcoded '/api/' URLs in multiple files
 * by replacing them with getApiUrl() calls and adding the necessary import.
 */

const fs = require('fs');
const path = require('path');

// Files that have been manually fixed
const FIXED_FILES = [
    'src/contexts/UnifiedTimecardContext.tsx',
    'src/contexts/UnifiedSessionContext.tsx',
    'src/features/chat/user-messaging/components/MessageCreateSessionDialog.tsx',
    'src/components/UnifiedUserAssignmentDialog.tsx',
    'src/features/chat/user-messaging/components/ChatPage.tsx',
    'src/features/client/pages/ReportPage.tsx',
    'src/features/sessions/components/CreateCalendarEventDialog.tsx',
    'src/features/sessions/components/post-production3/tables/hooks.ts',
    'src/components/RoleSelector.tsx',
    'src/services/WebOnlyStartupController.ts',
    'src/utils/quickAuthTest.ts',
    'src/utils/loginFlowDebugger.ts'
];

// Remaining files to fix in this batch
const FILES_TO_FIX = [
    'src/features/research/components/WebResearch.tsx',
    'src/features/chat/user-messaging/api/sessionChatIntegration.ts',
    'src/features/sessions/components/unified-workflow/displays/UnifiedTaskList.tsx',
    'src/features/sessions/components/unified-workflow/UnifiedStepDocumentationDialog.tsx',
    'src/features/sessions/components/workflow/WorkflowNodeFileAttachmentDialog.tsx',
    'src/features/sessions/components/workflow/WorkflowNodeUnifiedDialog.tsx',
    'src/features/sessions/components/post-production3/tables/SimpleWorkflowSessionsTable.tsx',
    'src/features/sessions/components/post-production/components/SyncComparisonPanel.tsx',
    'src/features/Inventory/components/GoogleMapView.tsx',
    'src/features/client/contexts/ResearchSessionContext.tsx',
    'src/features/client/components/Layout/MessagesDropdown.tsx',
    'src/utils/projectTestUtilities.ts',
    'src/components/auth/AppleSignInButton.tsx',
    'src/services/firebaseCloudMessaging.ts',
    'src/services/enhancedErrorReporting.ts',
    'src/services/combinedSessionsApi.ts'
];

function hasGetApiUrlImport(content) {
    return content.includes("import { getApiUrl }") || 
           content.includes("from '@/utils/api'") && content.includes("getApiUrl");
}

function addGetApiUrlImport(content) {
    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ') && lines[i].includes('from ')) {
            lastImportIndex = i;
        }
    }
    
    if (lastImportIndex !== -1) {
        // Check if there's already an import from '@/utils/api'
        const existingApiImport = lines.find(line => 
            line.includes("from '@/utils/api'") || line.includes('from "@/utils/api"')
        );
        
        if (existingApiImport) {
            // Add getApiUrl to existing import
            const index = lines.findIndex(line => line === existingApiImport);
            if (!existingApiImport.includes('getApiUrl')) {
                lines[index] = existingApiImport.replace(
                    /import\s*\{\s*([^}]+)\s*\}/,
                    (match, imports) => `import { ${imports.trim()}, getApiUrl }`
                );
            }
        } else {
            // Add new import after the last import
            lines.splice(lastImportIndex + 1, 0, "import { getApiUrl } from '@/utils/api';");
        }
    }
    
    return lines.join('\n');
}

function fixApiCalls(content) {
    // Replace fetch('/api/...') with fetch(getApiUrl('...'))
    content = content.replace(
        /fetch\s*\(\s*['"`]\/api\/([^'"`]+)['"`]/g,
        "fetch(getApiUrl('$1')"
    );
    
    // Replace fetch(`/api/...`) with fetch(getApiUrl(`...`))
    content = content.replace(
        /fetch\s*\(\s*`\/api\/([^`]+)`/g,
        "fetch(getApiUrl(`$1`)"
    );
    
    return content;
}

function fixFile(filePath, isDryRun = false) {
    try {
        console.log(`🔧 ${isDryRun ? 'Would fix' : 'Fixing'} ${filePath}...`);
        
        if (!fs.existsSync(filePath)) {
            console.log(`   ⚠️  File not found: ${filePath}`);
            return false;
        }
        
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Add import if needed
        if (!hasGetApiUrlImport(content)) {
            content = addGetApiUrlImport(content);
            if (isDryRun) {
                console.log(`   📝 Would add: import { getApiUrl } from '@/utils/api';`);
            }
        }
        
        // Fix API calls
        const beforeFix = content;
        content = fixApiCalls(content);
        
        // Show what would be changed
        if (isDryRun && content !== originalContent) {
            const lines = originalContent.split('\n');
            const newLines = content.split('\n');
            
            for (let i = 0; i < Math.max(lines.length, newLines.length); i++) {
                if (lines[i] !== newLines[i]) {
                    if (lines[i] && lines[i].includes("fetch('/api/")) {
                        console.log(`   📝 Line ${i + 1}: ${lines[i].trim()}`);
                        console.log(`   ➡️  Would change to: ${newLines[i].trim()}`);
                    }
                }
            }
        }
        
        // Only write if content changed and not dry run
        if (content !== originalContent) {
            if (!isDryRun) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`   ✅ Fixed ${filePath}`);
            } else {
                console.log(`   ✅ Would fix ${filePath}`);
            }
            return true;
        } else {
            console.log(`   ℹ️  No changes needed for ${filePath}`);
            return false;
        }
        
    } catch (error) {
        console.error(`   ❌ Error ${isDryRun ? 'analyzing' : 'fixing'} ${filePath}:`, error.message);
        return false;
    }
}

function main() {
    const isDryRun = process.argv.includes('--dry-run');
    console.log(`🚀 ${isDryRun ? 'DRY RUN: ' : ''}Batch fixing hardcoded API URLs...\n`);
    
    let fixedCount = 0;
    let totalFiles = FILES_TO_FIX.length;
    
    for (const file of FILES_TO_FIX) {
        if (fixFile(file, isDryRun)) {
            fixedCount++;
        }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ${isDryRun ? 'Would fix' : 'Fixed'}: ${fixedCount}/${totalFiles} files`);
    console.log(`   Remaining files to fix manually: ${27 - FIXED_FILES.length - fixedCount}`);
    
    if (fixedCount > 0) {
        console.log('\n🎯 Next steps:');
        if (isDryRun) {
            console.log('1. Run without --dry-run to apply changes');
            console.log('2. Test the build: npm run build');
            console.log('3. Test the application in web-only mode');
        } else {
            console.log('1. Test the build: npm run build');
            console.log('2. Test the application in web-only mode');
            console.log('3. Continue with remaining files if needed');
        }
    }
}

if (require.main === module) {
    main();
}
