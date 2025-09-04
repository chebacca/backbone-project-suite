#!/usr/bin/env node

/**
 * 🐛 DEBUG SESSION LOADING
 * 
 * This script helps debug where the hardcoded session IDs are coming from
 * by checking various potential sources in the codebase.
 */

const fs = require('fs');
const path = require('path');

// Hardcoded session IDs that are causing 404 errors
const problematicSessionIds = [
  '907d6745-7201-44ee-bdab-a5859835a7e1',
  'e8559b4f-9524-41f7-95a7-ebd4098bb0d3',
  'fe082bc8-219a-48b5-a81f-c21d6a047b72'
];

// Directories to search
const searchDirs = [
  '../Dashboard-v14_2/apps/web/src',
  '../Dashboard-v14_2/apps/web/public',
  '../Dashboard-v14_2/apps/web/dist',
  '../Dashboard-v14_2/apps/web/build',
  '../Dashboard-v14_2/functions/src',
  '../Dashboard-v14_2/scripts'
];

// File extensions to search
const searchExtensions = ['.js', '.ts', '.tsx', '.jsx', '.json', '.html', '.md'];

// Function to search for session IDs in a file
function searchFileForSessionIds(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const found = [];
    
    problematicSessionIds.forEach(sessionId => {
      if (content.includes(sessionId)) {
        found.push({
          sessionId,
          filePath: path.relative(process.cwd(), filePath),
          context: extractContext(content, sessionId)
        });
      }
    });
    
    return found;
  } catch (error) {
    return [];
  }
}

// Function to extract context around found session ID
function extractContext(content, sessionId) {
  const index = content.indexOf(sessionId);
  if (index === -1) return '';
  
  const start = Math.max(0, index - 100);
  const end = Math.min(content.length, index + sessionId.length + 100);
  return content.substring(start, end).replace(/\n/g, '\\n');
}

// Function to recursively search directories
function searchDirectory(dirPath, results = []) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other common directories
        if (!['node_modules', '.git', 'build', 'dist', 'coverage'].includes(item)) {
          searchDirectory(fullPath, results);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (searchExtensions.includes(ext)) {
          const found = searchFileForSessionIds(fullPath);
          results.push(...found);
        }
      }
    }
  } catch (error) {
    // Skip directories we can't access
  }
  
  return results;
}

// Main search function
function main() {
  console.log('🔍 DEBUGGING SESSION LOADING');
  console.log('==============================\n');
  
  console.log('Searching for hardcoded session IDs...\n');
  
  const allResults = [];
  
  searchDirs.forEach(dir => {
    const fullDir = path.resolve(dir);
    if (fs.existsSync(fullDir)) {
      console.log(`📁 Searching: ${dir}`);
      const results = searchDirectory(fullDir);
      allResults.push(...results);
    } else {
      console.log(`❌ Directory not found: ${dir}`);
    }
  });
  
  console.log('\n📊 SEARCH RESULTS');
  console.log('==================\n');
  
  if (allResults.length === 0) {
    console.log('✅ No hardcoded session IDs found in source code');
    console.log('\n🔍 This means the session IDs are being loaded from:');
    console.log('   - localStorage/sessionStorage');
    console.log('   - Browser cache');
    console.log('   - External API responses');
    console.log('   - Database queries');
    console.log('   - Generated/compiled code');
  } else {
    console.log(`❌ Found ${allResults.length} instances of hardcoded session IDs:\n`);
    
    allResults.forEach((result, index) => {
      console.log(`${index + 1}. Session ID: ${result.sessionId}`);
      console.log(`   File: ${result.filePath}`);
      console.log(`   Context: ${result.context}`);
      console.log('');
    });
  }
  
  // Check for potential data sources
  console.log('🔍 CHECKING POTENTIAL DATA SOURCES');
  console.log('===================================\n');
  
  // Check if there are any data files
  const dataFiles = [
    '../Dashboard-v14_2/apps/web/src/data',
    '../Dashboard-v14_2/apps/web/public/data',
    '../Dashboard-v14_2/apps/web/src/config',
    '../Dashboard-v14_2/apps/web/src/constants'
  ];
  
  dataFiles.forEach(dataDir => {
    const fullDataDir = path.resolve(dataDir);
    if (fs.existsSync(fullDataDir)) {
      console.log(`📁 Data directory exists: ${dataDir}`);
      try {
        const files = fs.readdirSync(fullDataDir);
        console.log(`   Files: ${files.join(', ')}`);
      } catch (error) {
        console.log(`   Error reading directory: ${error.message}`);
      }
    }
  });
  
  // Check for environment variables or config files
  const configFiles = [
    '../Dashboard-v14_2/apps/web/.env',
    '../Dashboard-v14_2/apps/web/.env.local',
    '../Dashboard-v14_2/apps/web/.env.production',
    '../Dashboard-v14_2/apps/web/config.js',
    '../Dashboard-v14_2/apps/web/config.ts'
  ];
  
  console.log('\n📁 Checking config files...');
  configFiles.forEach(configFile => {
    const fullConfigFile = path.resolve(configFile);
    if (fs.existsSync(fullConfigFile)) {
      console.log(`✅ Found: ${configFile}`);
      try {
        const content = fs.readFileSync(fullConfigFile, 'utf8');
        if (content.includes('session') || content.includes('SESSION')) {
          console.log(`   Contains session-related configuration`);
        }
      } catch (error) {
        console.log(`   Error reading file: ${error.message}`);
      }
    }
  });
  
  console.log('\n🎯 NEXT STEPS');
  console.log('==============');
  console.log('1. Check browser localStorage/sessionStorage');
  console.log('2. Check browser network tab for API responses');
  console.log('3. Check if session IDs are generated dynamically');
  console.log('4. Check if they come from external services');
  console.log('5. Check if they are embedded in compiled/built code');
}

// Run the search
main();
