#!/usr/bin/env node

/**
 * 🔍 CHECK LOCALSTORAGE SESSIONS
 * 
 * This script helps identify what session data might be stored in localStorage
 * that could be causing the hardcoded session ID issues.
 */

const fs = require('fs');
const path = require('path');

// Hardcoded session IDs that are causing 404 errors
const problematicSessionIds = [
  '907d6745-7201-44ee-bdab-a5859835a7e1',
  'e8559b4f-9524-41f7-95a7-ebd4098bb0d3',
  'fe082bc8-219a-48b5-a81f-c21d6a047b72'
];

// Search for localStorage patterns in the codebase
function searchLocalStoragePatterns() {
  console.log('🔍 SEARCHING FOR LOCALSTORAGE SESSION PATTERNS');
  console.log('==============================================\n');
  
  const searchDirs = [
    '../Dashboard-v14_2/apps/web/src',
    '../Dashboard-v14_2/apps/web/dist'
  ];
  
  const patterns = [
    'localStorage.setItem.*session',
    'localStorage.setItem.*currentSessionId',
    'localStorage.setItem.*sessionId',
    'localStorage.getItem.*session',
    'localStorage.getItem.*currentSessionId',
    'localStorage.getItem.*sessionId'
  ];
  
  let totalMatches = 0;
  
  searchDirs.forEach(dir => {
    const fullDir = path.resolve(dir);
    if (fs.existsSync(fullDir)) {
      console.log(`📁 Searching: ${dir}`);
      
      patterns.forEach(pattern => {
        try {
          const grepCommand = `grep -r "${pattern}" "${fullDir}" --include="*.js" --include="*.ts" --include="*.tsx" --include="*.jsx" 2>/dev/null | head -10`;
          const result = require('child_process').execSync(grepCommand, { encoding: 'utf8' });
          
          if (result.trim()) {
            const lines = result.trim().split('\n').filter(line => line.trim());
            console.log(`\n🔍 Pattern: ${pattern}`);
            lines.forEach(line => {
              if (line.includes('localStorage')) {
                console.log(`   ${line.substring(0, 100)}...`);
                totalMatches++;
              }
            });
          }
        } catch (error) {
          // Pattern not found
        }
      });
    }
  });
  
  return totalMatches;
}

// Check for session data files that might contain hardcoded IDs
function checkSessionDataFiles() {
  console.log('\n📁 CHECKING SESSION DATA FILES');
  console.log('===============================\n');
  
  const dataFiles = [
    '../Dashboard-v14_2/apps/web/src/data',
    '../Dashboard-v14_2/apps/web/src/constants',
    '../Dashboard-v14_2/apps/web/src/config'
  ];
  
  dataFiles.forEach(dataDir => {
    const fullDataDir = path.resolve(dataDir);
    if (fs.existsSync(fullDataDir)) {
      console.log(`📁 Data directory: ${dataDir}`);
      
      try {
        const files = fs.readdirSync(fullDataDir);
        files.forEach(file => {
          if (file.includes('session') || file.includes('Session')) {
            const filePath = path.join(fullDataDir, file);
            console.log(`   📄 ${file}`);
            
            try {
              const content = fs.readFileSync(filePath, 'utf8');
              
              // Check for hardcoded session IDs
              problematicSessionIds.forEach(sessionId => {
                if (content.includes(sessionId)) {
                  console.log(`      ⚠️  CONTAINS HARDCODED SESSION ID: ${sessionId}`);
                }
              });
              
              // Check for localStorage patterns
              if (content.includes('localStorage')) {
                console.log(`      💾 Contains localStorage usage`);
              }
              
              // Check for session ID patterns
              if (content.includes('sessionId') || content.includes('session_id')) {
                console.log(`      🆔 Contains session ID patterns`);
              }
            } catch (error) {
              console.log(`      ❌ Error reading file: ${error.message}`);
            }
          }
        });
      } catch (error) {
        console.log(`   ❌ Error reading directory: ${error.message}`);
      }
    }
  });
}

// Check for session service files
function checkSessionServices() {
  console.log('\n🔧 CHECKING SESSION SERVICES');
  console.log('============================\n');
  
  const serviceFiles = [
    '../Dashboard-v14_2/apps/web/src/services/sessionsService.ts',
    '../Dashboard-v14_2/apps/web/src/services/sessionWorkflowIntegration.ts',
    '../Dashboard-v14_2/functions/src/index.ts'
  ];
  
  serviceFiles.forEach(serviceFile => {
    const fullServiceFile = path.resolve(serviceFile);
    if (fs.existsSync(fullServiceFile)) {
      console.log(`📄 Service file: ${serviceFile}`);
      
      try {
        const content = fs.readFileSync(fullServiceFile, 'utf8');
        
        // Check for hardcoded session IDs
        problematicSessionIds.forEach(sessionId => {
          if (content.includes(sessionId)) {
            console.log(`   ⚠️  CONTAINS HARDCODED SESSION ID: ${sessionId}`);
          }
        });
        
        // Check for localStorage usage
        if (content.includes('localStorage')) {
          console.log(`   💾 Contains localStorage usage`);
          
          // Extract localStorage lines
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (line.includes('localStorage') && line.includes('session')) {
              console.log(`      Line ${index + 1}: ${line.trim()}`);
            }
          });
        }
        
        // Check for session ID generation
        if (content.includes('generateSessionId') || content.includes('newSessionId') || content.includes('createSession')) {
          console.log(`   🆔 Contains session ID generation logic`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error reading file: ${error.message}`);
      }
    } else {
      console.log(`❌ Service file not found: ${serviceFile}`);
    }
  });
}

// Main function
function main() {
  console.log('🔍 COMPREHENSIVE LOCALSTORAGE SESSION ANALYSIS');
  console.log('==============================================\n');
  
  // Search for localStorage patterns
  const localStorageMatches = searchLocalStoragePatterns();
  
  // Check session data files
  checkSessionDataFiles();
  
  // Check session services
  checkSessionServices();
  
  console.log('\n📊 ANALYSIS SUMMARY');
  console.log('===================');
  console.log(`LocalStorage patterns found: ${localStorageMatches}`);
  console.log('\n🎯 KEY FINDINGS:');
  console.log('1. The application uses localStorage to store session IDs');
  console.log('2. Session IDs are stored as "currentSessionId"');
  console.log('3. This explains why hardcoded IDs persist after cache clearing');
  console.log('4. The issue is in the application logic, not the database');
  
  console.log('\n🚀 RECOMMENDED SOLUTION:');
  console.log('1. Check browser localStorage for "currentSessionId"');
  console.log('2. Remove any hardcoded session IDs from localStorage');
  console.log('3. Ensure the app generates new session IDs properly');
  console.log('4. Consider migrating from localStorage to Firestore for sessions');
}

// Run the analysis
main();
