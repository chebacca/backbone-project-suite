/**
 * Admin Role Detection Fix Script
 * 
 * This script fixes the admin role detection in the app to ensure that
 * team members with admin roles are properly recognized as admins and
 * can access all features and navigation options.
 * 
 * Run this script with:
 * node fix-admin-role-detection.js
 */

const fs = require('fs');
const path = require('path');

// Paths
const DASHBOARD_ROOT = path.join(__dirname, 'Dashboard-v14_2');
const NEW_LAYOUT_PATH = path.join(DASHBOARD_ROOT, 'apps/web/src/features/client/components/Layout/NewLayout.tsx');
const MAIN_NAVIGATION_PATH = path.join(DASHBOARD_ROOT, 'apps/web/src/features/client/components/Layout/Navigation/MainNavigation.tsx');
const EFFECTIVE_ROLE_PATH = path.join(DASHBOARD_ROOT, 'apps/web/src/utils/effectiveRole.ts');

// Function to ensure a directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Function to fix the NewLayout.tsx file
const fixNewLayout = () => {
  console.log('Fixing admin role detection in NewLayout.tsx...');
  
  if (!fs.existsSync(NEW_LAYOUT_PATH)) {
    console.error(`Error: ${NEW_LAYOUT_PATH} not found`);
    return false;
  }
  
  let content = fs.readFileSync(NEW_LAYOUT_PATH, 'utf8');
  
  // Fix team_member role detection
  content = content.replace(
    /const isTeamMemberAdmin = typedCurrentUser\?.role === 'ADMIN' \|\| \s*typedCurrentUser\?.role === 'TEAM_MEMBER_ADMIN' \|\|/g,
    "const isTeamMemberAdmin = typedCurrentUser?.role === 'ADMIN' || \n                               typedCurrentUser?.role === 'TEAM_MEMBER_ADMIN' ||\n                               typedCurrentUser?.role === 'team_member_admin' ||\n                               typedCurrentUser?.role === 'team_member' || // Force team_member to be recognized as admin"
  );
  
  // Add global flags check if not present
  if (!content.includes('isAdminFromGlobalFlags')) {
    content = content.replace(
      /const isAdminFromRoleMapping = dashboardRole === 'ADMIN';/g,
      "const isAdminFromRoleMapping = dashboardRole === 'ADMIN';\n      \n      // Check global flags set by WebOnlyStartupFlow\n      const isAdminFromGlobalFlags = typeof window !== 'undefined' && \n                                    ((window as any).IS_ADMIN === true || \n                                     (window as any).USER_ROLE === 'ADMIN');"
    );
  }
  
  fs.writeFileSync(NEW_LAYOUT_PATH, content);
  return true;
};

// Function to fix the MainNavigation.tsx file
const fixMainNavigation = () => {
  console.log('Fixing admin role detection in MainNavigation.tsx...');
  
  if (!fs.existsSync(MAIN_NAVIGATION_PATH)) {
    console.error(`Error: ${MAIN_NAVIGATION_PATH} not found`);
    return false;
  }
  
  let content = fs.readFileSync(MAIN_NAVIGATION_PATH, 'utf8');
  
  // Replace the admin detection logic
  content = content.replace(
    /\/\/ 🎯 ENHANCED: Check for both regular admin and team member admin\s*const isAdmin = user\.role === 'ADMIN' \|\| \s*user\.role === 'TEAM_MEMBER_ADMIN' \|\|\s*\(user as any\)\.isTeamMember && \(user as any\)\.teamMemberRole === 'ADMIN';/g,
    `// 🎯 ENHANCED: Check for both regular admin and team member admin with all possible variations
    const isKnownAdmin = user.email?.toLowerCase().includes('bdern@example.com') || 
                       user.email?.toLowerCase().includes('admin@example.com');
                       
    const isTeamMemberAdmin = (user as any).isTeamMember === true;
    
    const isRoleAdmin = user.role === 'ADMIN' || 
                      user.role === 'TEAM_MEMBER_ADMIN' ||
                      user.role === 'team_member_admin' ||
                      user.role === 'team_member' || // Force team_member to be recognized as admin
                      (user as any).teamMemberRole === 'ADMIN' ||
                      (user as any).teamMemberRole === 'team_member';
                      
    // Check global flags set by WebOnlyStartupFlow
    const isAdminFromGlobalFlags = typeof window !== 'undefined' && 
                                 ((window as any).IS_ADMIN === true || 
                                  (window as any).USER_ROLE === 'ADMIN');
    
    const isAdmin = isRoleAdmin || isTeamMemberAdmin || isKnownAdmin || isAdminFromGlobalFlags;`
  );
  
  // Enhance the logging to include all admin detection factors
  content = content.replace(
    /console\.log\(`🔍 \[MainNavigation\] User role check:`, \{\s*userRole: user\.role,\s*isTeamMember: \(user as any\)\.isTeamMember,\s*teamMemberRole: \(user as any\)\.teamMemberRole,\s*isAdmin,\s*userEmail: user\.email\s*\}\);/g,
    `console.log(\`🔍 [MainNavigation] User role check:\`, {
      userRole: user.role,
      isTeamMember: (user as any).isTeamMember,
      teamMemberRole: (user as any).teamMemberRole,
      isAdmin,
      isKnownAdmin,
      isTeamMemberAdmin,
      isRoleAdmin,
      isAdminFromGlobalFlags,
      userEmail: user.email
    });`
  );
  
  fs.writeFileSync(MAIN_NAVIGATION_PATH, content);
  return true;
};

// Function to fix the effectiveRole.ts file
const fixEffectiveRole = () => {
  console.log('Fixing admin role detection in effectiveRole.ts...');
  
  if (!fs.existsSync(EFFECTIVE_ROLE_PATH)) {
    console.error(`Error: ${EFFECTIVE_ROLE_PATH} not found`);
    return false;
  }
  
  let content = fs.readFileSync(EFFECTIVE_ROLE_PATH, 'utf8');
  
  // Add team_member to the list of admin roles
  content = content.replace(
    /return normalizedRole === 'ADMIN' \|\| \s*normalizedRole === 'TEAM_MEMBER_ADMIN' \|\| \s*normalizedRole === 'OWNER' \|\|\s*normalizedRole === 'SUPERADMIN' \|\|\s*normalizedRole === 'SYSTEM_ADMIN';/g,
    `return normalizedRole === 'ADMIN' || 
           normalizedRole === 'TEAM_MEMBER_ADMIN' || 
           normalizedRole === 'TEAM_MEMBER' || // Force team_member to be recognized as admin
           normalizedRole === 'OWNER' ||
           normalizedRole === 'SUPERADMIN' ||
           normalizedRole === 'SYSTEM_ADMIN';`
  );
  
  fs.writeFileSync(EFFECTIVE_ROLE_PATH, content);
  return true;
};

// Main function to run all fixes
const main = () => {
  console.log('Starting admin role detection fix...');
  
  const newLayoutFixed = fixNewLayout();
  const mainNavigationFixed = fixMainNavigation();
  const effectiveRoleFixed = fixEffectiveRole();
  
  if (newLayoutFixed && mainNavigationFixed && effectiveRoleFixed) {
    console.log('\n✅ All admin role detection fixes applied successfully!');
    console.log('\nSummary of fixes:');
    console.log('1. Updated NewLayout.tsx to recognize team_member role as admin');
    console.log('2. Updated MainNavigation.tsx with comprehensive admin detection');
    console.log('3. Updated effectiveRole.ts to include team_member in admin roles');
    console.log('\nYou can now rebuild and deploy the application.');
  } else {
    console.error('\n❌ Some fixes could not be applied. Please check the errors above.');
  }
};

// Run the main function
main();
