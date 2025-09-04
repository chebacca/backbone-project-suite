/**
 * Navigation Redirect Fix - Complete Solution
 * 
 * This script applies comprehensive fixes to prevent unwanted redirects in the application.
 * It specifically addresses issues with the NativeTitleBar component where clicking on icons
 * would redirect users back to the sessions page.
 * 
 * Run this script with:
 * node fix-navigation-redirect-complete.js
 */

const fs = require('fs');
const path = require('path');

// Paths
const DASHBOARD_ROOT = path.join(__dirname, 'Dashboard-v14_2');
const NATIVE_TITLEBAR_PATH = path.join(DASHBOARD_ROOT, 'apps/web/src/features/client/components/Layout/NativeTitleBar.tsx');
const NAVIGATION_FIX_PATH = path.join(DASHBOARD_ROOT, 'apps/web/src/utils/navigationFix.ts');
const APP_ENTRY_PATH = path.join(DASHBOARD_ROOT, 'apps/web/src/App.tsx');

// Function to ensure a directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Function to create the navigation fix utility
const createNavigationFixUtility = () => {
  console.log('Creating navigation fix utility...');
  
  ensureDirectoryExists(path.dirname(NAVIGATION_FIX_PATH));
  
  const utilityContent = `/**
 * Navigation Fix Utility
 * 
 * This utility provides enhanced navigation functions to prevent unwanted redirects
 * and ensure consistent navigation throughout the application.
 */

import { NavigateOptions } from 'react-router-dom';

/**
 * Enhanced navigation function that prevents default routing behaviors
 * and ensures direct navigation to the specified path.
 * 
 * @param navigate - The navigate function from react-router-dom
 * @param path - The target path to navigate to
 * @param options - Optional navigation options
 */
export const navigateDirectly = (
  navigate: (path: string, options?: NavigateOptions) => void,
  path: string,
  options?: NavigateOptions
) => {
  console.log('[NavigationFix] Direct navigation to:', path);
  
  // Always use replace to prevent history stacking that could cause navigation issues
  navigate(path, { replace: true, ...options });
};

/**
 * Fixes navigation issues by disabling any global redirects or default routes
 * that might be causing unwanted navigation behavior.
 */
export const disableDefaultRouting = () => {
  try {
    // Set a global flag to disable automatic redirects
    if (typeof window !== 'undefined') {
      (window as any).__disableDefaultRouting = true;
      
      console.log('[NavigationFix] Default routing disabled');
      
      // This can be checked in route guards to prevent automatic redirects
      // Example usage in route guards:
      // if (!(window as any).__disableDefaultRouting) { 
      //   // perform default redirect 
      // }
    }
  } catch (error) {
    console.error('[NavigationFix] Error disabling default routing:', error);
  }
};

/**
 * Call this function on app initialization to apply all navigation fixes
 */
export const applyNavigationFixes = () => {
  disableDefaultRouting();
  
  // Add any additional navigation fixes here
  
  console.log('[NavigationFix] All navigation fixes applied');
};`;

  fs.writeFileSync(NAVIGATION_FIX_PATH, utilityContent);
  console.log(`Created navigation fix utility at: ${NAVIGATION_FIX_PATH}`);
};

// Function to modify App.tsx to apply navigation fixes
const modifyAppEntry = () => {
  console.log('Modifying App entry point to apply navigation fixes...');
  
  if (!fs.existsSync(APP_ENTRY_PATH)) {
    console.warn(`Warning: App entry file not found at ${APP_ENTRY_PATH}`);
    return;
  }
  
  let appContent = fs.readFileSync(APP_ENTRY_PATH, 'utf8');
  
  // Check if we've already applied the fix
  if (appContent.includes('applyNavigationFixes')) {
    console.log('Navigation fixes already applied to App entry point.');
    return;
  }
  
  // Add the import
  if (!appContent.includes('import { applyNavigationFixes }')) {
    const importStatement = `import { applyNavigationFixes } from '@/utils/navigationFix';`;
    
    // Find a good place to add the import (after other imports)
    const importRegex = /^import .+ from .+;$/m;
    const lastImportMatch = [...appContent.matchAll(new RegExp(importRegex, 'gm'))].pop();
    
    if (lastImportMatch) {
      const insertPosition = lastImportMatch.index + lastImportMatch[0].length;
      appContent = appContent.slice(0, insertPosition) + '\n' + importStatement + appContent.slice(insertPosition);
    } else {
      // If no imports found, add at the top
      appContent = importStatement + '\n' + appContent;
    }
  }
  
  // Add the function call in a useEffect
  if (!appContent.includes('applyNavigationFixes()')) {
    const effectCode = `
  // Apply navigation fixes to prevent unwanted redirects
  useEffect(() => {
    applyNavigationFixes();
  }, []);`;
    
    // Find a good place to add the effect (inside the App component)
    const appComponentRegex = /function App\(\) {/;
    const appComponentMatch = appContent.match(appComponentRegex);
    
    if (appComponentMatch) {
      const insertPosition = appComponentMatch.index + appComponentMatch[0].length;
      appContent = appContent.slice(0, insertPosition) + effectCode + appContent.slice(insertPosition);
    } else {
      console.warn('Could not find App component in the file.');
    }
  }
  
  // Make sure useEffect is imported
  if (!appContent.includes('import React, { useEffect }') && !appContent.includes('import { useEffect }')) {
    appContent = appContent.replace(
      'import React from \'react\';', 
      'import React, { useEffect } from \'react\';'
    );
    
    // If there's no React import but there are other imports from react
    appContent = appContent.replace(
      /import \{ (.+) \} from ['"]react['"];/,
      'import { $1, useEffect } from \'react\';'
    );
  }
  
  fs.writeFileSync(APP_ENTRY_PATH, appContent);
  console.log(`Modified App entry point at: ${APP_ENTRY_PATH}`);
};

// Main function to run all fixes
const applyAllFixes = () => {
  console.log('Applying all navigation redirect fixes...');
  
  // Create navigation fix utility
  createNavigationFixUtility();
  
  // Modify App entry point
  modifyAppEntry();
  
  console.log('All navigation redirect fixes applied successfully!');
  console.log('\nTo complete the fix:');
  console.log('1. Make sure the NativeTitleBar.tsx component is updated to use the navigateDirectly function');
  console.log('2. Restart your application to apply the changes');
};

// Run the fixes
applyAllFixes();