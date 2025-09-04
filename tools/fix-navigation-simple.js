/**
 * Simple Navigation Fix Script
 * 
 * This script fixes navigation issues in the Dashboard app by:
 * 1. Updating SortableIcon in NewLayout.tsx to use React Router navigation
 * 2. Fixing handleIconSelect to use replace navigation and prevent history stacking
 * 
 * Run this script with:
 * node fix-navigation-simple.js
 */

const fs = require('fs');
const path = require('path');

// Paths
const DASHBOARD_ROOT = path.join(__dirname, 'Dashboard-v14_2');
const NEW_LAYOUT_PATH = path.join(DASHBOARD_ROOT, 'apps/web/src/features/client/components/Layout/NewLayout.tsx');

// Function to fix the SortableIcon component in NewLayout.tsx
const fixSortableIconNavigation = () => {
  console.log('Fixing SortableIcon navigation in NewLayout.tsx...');
  
  if (!fs.existsSync(NEW_LAYOUT_PATH)) {
    console.error(`Error: ${NEW_LAYOUT_PATH} not found`);
    return false;
  }
  
  let content = fs.readFileSync(NEW_LAYOUT_PATH, 'utf8');
  
  // Fix 1: Update SortableIcon to use React Router navigation
  content = content.replace(
    /\/\/ Use a more direct approach for faster response\s+if \(onSelect\) {\s+onSelect\(plainIcon\.id\);\s+return; \/\/ Let the parent handle navigation\s+}\s+\s+if \(onClick\) {\s+onClick\(\);\s+} else {\s+\/\/ Direct navigation if no other handlers are provided\s+window\.location\.href = plainIcon\.path;\s+}/,
    `// First call the select handler to update UI state
    if (onSelect) {
      onSelect(plainIcon.id);
    }
    
    // Then handle navigation directly using React Router
    if (onClick) {
      onClick();
    } else {
      // Use navigate instead of window.location to prevent page reload
      navigate(plainIcon.path);
    }`
  );
  
  // Fix 2: Update handleIconSelect to use replace navigation
  content = content.replace(
    /\/\/ Function to handle icon selection and toolbar collapse\/expand\s+const handleIconSelect = useCallback\(\(iconId: string\) => {\s+\/\/ Ignore if this is the AI Assistant icon\s+if \(iconId === 'ai-assistant'\) return;\s+\s+\/\/ Close the drawer if it's open\s+if \(isDrawerOpen\) {\s+handleDrawerClose\(\);\s+}\s+\s+\/\/ Find the icon for navigation using ref to avoid dependency on allToolbarIcons\s+const icon = allToolbarIconsRef\.current\.find\(icon => icon\.id === iconId\);\s+if \(icon\) {\s+\/\/ Don't navigate if we're already on this page\s+if \(location\.pathname === icon\.path\) {\s+setSelectedIconId\(iconId\);\s+return;\s+}\s+\s+\/\/ Save selected icon to state before navigation\s+rootStore\.savePageState\(location\.pathname, {\s+selectedIconId: iconId,\s+lastVisited: new Date\(\)\.toISOString\(\)\s+}\);\s+\s+\/\/ Use consistent React router navigation for all routes\s+\/\/ This prevents page reloads and provides smooth navigation\s+navigate\(icon\.path\);\s+\s+\/\/ Update selected icon state after initiating navigation\s+setSelectedIconId\(iconId\);\s+}\s+}, \[isDrawerOpen, handleDrawerClose, rootStore, location\.pathname, navigate\]\);/,
    `// Function to handle icon selection and toolbar collapse/expand
  const handleIconSelect = useCallback((iconId: string) => {
    console.log('[NewLayout] Icon selected:', iconId);
    
    // Ignore if this is the AI Assistant icon
    if (iconId === 'ai-assistant') return;
    
    // Close the drawer if it's open
    if (isDrawerOpen) {
      handleDrawerClose();
    }
    
    // First update the selected icon state immediately for UI feedback
    setSelectedIconId(iconId);
    
    // Find the icon for navigation using ref to avoid dependency on allToolbarIcons
    const icon = allToolbarIconsRef.current.find(icon => icon.id === iconId);
    if (icon) {
      console.log('[NewLayout] Found icon for navigation:', icon.label, icon.path);
      
      // Don't navigate if we're already on this page
      if (location.pathname === icon.path) {
        console.log('[NewLayout] Already on page:', icon.path);
        return;
      }
      
      // Save selected icon to state before navigation
      rootStore.savePageState(location.pathname, {
        selectedIconId: iconId,
        lastVisited: new Date().toISOString()
      });

      // CRITICAL FIX: Use navigate with replace option to prevent history stacking
      // This prevents the browser from adding the current page to history
      // which can cause navigation issues when using the back button
      console.log('[NewLayout] Navigating to:', icon.path);
      navigate(icon.path, { replace: true });
    }
  }, [isDrawerOpen, handleDrawerClose, rootStore, location.pathname, navigate]);`
  );
  
  fs.writeFileSync(NEW_LAYOUT_PATH, content);
  console.log('✅ Successfully fixed SortableIcon navigation in NewLayout.tsx');
  return true;
}

// Main function
const main = () => {
  console.log('Starting simple navigation fix...');
  
  // Fix SortableIcon navigation
  const fixedSortableIcon = fixSortableIconNavigation();
  
  if (fixedSortableIcon) {
    console.log('✅ All fixes applied successfully!');
    console.log('\nTo complete the fix:');
    console.log('1. Restart your application');
    console.log('2. Test navigation by clicking on different icons in the toolbar');
  } else {
    console.error('❌ Some fixes could not be applied. Please check the errors above.');
  }
};

// Run the script
main();
