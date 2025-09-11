#!/usr/bin/env node

/**
 * 🔥 Enterprise Custom Claims Updater for BACKBONE v14.2
 * 
 * Updates Firebase custom claims for all enterprise users and team members
 * based on their roles and hierarchy levels. This ensures proper admin
 * recognition and permissions in the dashboard application.
 * 
 * Features:
 * - Role-based hierarchy mapping (1-100 scale)
 * - Comprehensive permission arrays
 * - Multi-organization access for enterprise users
 * - Admin detection and universal access flags
 * - License type and tier mapping
 * 
 * Usage:
 *   node update-enterprise-custom-claims.js --dry-run    # Preview changes
 *   node update-enterprise-custom-claims.js --force      # Apply changes
 *   node update-enterprise-custom-claims.js --user=email # Update specific user
 */

const admin = require('firebase-admin');

// Check for command line options
const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('--preview');
const forceUpdate = process.argv.includes('--force') || process.argv.includes('--apply');
const specificUserArg = process.argv.find(arg => arg.startsWith('--user='));
const specificUser = specificUserArg ? specificUserArg.split('=')[1] : null;

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'backbone-logic'
  });
}

const auth = admin.auth();
const db = admin.firestore();

// Enterprise configuration
const ENTERPRISE_CONFIG = {
  organizationId: 'enterprise-org-001',
  secondaryOrganizationId: 'enterprise-media-org',
  adminEmail: 'enterprise.user@enterprisemedia.com',
  licenseType: 'ENTERPRISE',
  tier: 'ENTERPRISE'
};

/**
 * Role to hierarchy mapping (1-100 scale)
 * Higher numbers = more permissions and access
 */
const ROLE_HIERARCHY_MAP = {
  // Management Tier (80-100)
  'ADMIN': 100,
  'SUPERADMIN': 100,
  'admin': 100,
  'owner': 100,
  'OWNER': 100,
  'MANAGER': 80,
  'Operations Manager': 80,
  'Project Manager': 75,
  
  // Production Tier (40-79)
  'Director': 70,
  'Creative Director': 70,
  'Producer': 65,
  'Production Manager': 60,
  'Editor': 60,
  'Art Director': 55,
  
  // Technical Tier (50-79)
  'IT Manager': 75,
  'Systems Administrator': 70,
  'DevOps Engineer': 65,
  'Network Engineer': 60,
  
  // Support Tier (10-49)
  'Production Assistant': 40,
  'Graphic Designer': 35,
  'Motion Graphics Artist': 35,
  'Audio Engineer': 35,
  'VFX Artist': 35,
  'Colorist': 35,
  'Account Manager': 45,
  'Business Analyst': 40,
  
  // Default roles
  'TEAM_MEMBER': 30,
  'USER': 20,
  'GUEST': 10,
  'member': 30,
  'viewer': 10
};

/**
 * Get hierarchy level for a role
 */
function getHierarchyForRole(role) {
  if (!role) return 20; // Default user level
  
  // Try exact match first
  if (ROLE_HIERARCHY_MAP[role]) {
    return ROLE_HIERARCHY_MAP[role];
  }
  
  // Try case-insensitive match
  const normalizedRole = role.toLowerCase();
  for (const [key, value] of Object.entries(ROLE_HIERARCHY_MAP)) {
    if (key.toLowerCase() === normalizedRole) {
      return value;
    }
  }
  
  // Try partial match for complex roles
  for (const [key, value] of Object.entries(ROLE_HIERARCHY_MAP)) {
    if (normalizedRole.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedRole)) {
      return value;
    }
  }
  
  return 30; // Default team member level
}

/**
 * Get permissions array based on hierarchy level
 */
function getPermissionsForHierarchy(hierarchy, role) {
  const permissions = [];
  
  // Base permissions for all users
  permissions.push('read:basic', 'write:own');
  
  // Level-based permissions
  if (hierarchy >= 30) {
    permissions.push('read:team', 'write:team', 'access:sessions', 'access:projects');
  }
  
  if (hierarchy >= 40) {
    permissions.push('read:inventory', 'write:inventory', 'access:media', 'access:reports');
  }
  
  if (hierarchy >= 50) {
    permissions.push('read:analytics', 'write:analytics', 'access:timecards');
  }
  
  if (hierarchy >= 60) {
    permissions.push('read:management', 'write:management', 'manage:team', 'access:billing');
  }
  
  if (hierarchy >= 70) {
    permissions.push('read:admin', 'write:admin', 'manage:projects', 'manage:users');
  }
  
  if (hierarchy >= 80) {
    permissions.push('admin:team', 'admin:projects', 'admin:licenses', 'admin:reports');
  }
  
  if (hierarchy >= 100) {
    permissions.push(
      'admin:all', 'read:all', 'write:all', 'delete:all', 'manage:all',
      'admin:users', 'admin:organizations', 'admin:settings', 'admin:billing'
    );
  }
  
  // Role-specific permissions
  if (role && (role.toLowerCase().includes('admin') || role.toLowerCase().includes('owner'))) {
    permissions.push('admin:all', 'read:all', 'write:all', 'delete:all');
  }
  
  return [...new Set(permissions)]; // Remove duplicates
}

/**
 * Determine dashboard role from team member role
 */
function getDashboardRole(teamMemberRole, hierarchy) {
  if (!teamMemberRole) return 'USER';
  
  const role = teamMemberRole.toLowerCase();
  
  if (role.includes('admin') || role.includes('owner') || hierarchy >= 100) {
    return 'ADMIN';
  }
  
  if (role.includes('manager') || role.includes('director') || hierarchy >= 80) {
    return 'MANAGER';
  }
  
  if (role.includes('producer') || role.includes('editor') || hierarchy >= 60) {
    return 'EDITOR';
  }
  
  return 'USER';
}

/**
 * Create comprehensive custom claims for a user
 */
function createCustomClaims(userData, teamMemberData = null) {
  // Determine primary role and organization
  const primaryRole = userData?.role || teamMemberData?.role || 'USER';
  const organizationId = userData?.organizationId || teamMemberData?.organizationId || ENTERPRISE_CONFIG.organizationId;
  
  // Calculate hierarchy
  const userHierarchy = getHierarchyForRole(userData?.role);
  const teamHierarchy = getHierarchyForRole(teamMemberData?.role);
  const effectiveHierarchy = Math.max(userHierarchy, teamHierarchy);
  
  // Determine roles
  const dashboardRole = getDashboardRole(teamMemberData?.role || userData?.role, effectiveHierarchy);
  const isAdmin = effectiveHierarchy >= 100 || 
                 primaryRole.toLowerCase().includes('admin') || 
                 primaryRole.toLowerCase().includes('owner');
  
  // Get permissions
  const permissions = getPermissionsForHierarchy(effectiveHierarchy, primaryRole);
  
  // Build compact claims (Firebase has 1000 character limit)
  const claims = {
    // Essential identity
    email: userData?.email || teamMemberData?.email,
    
    // Core role and organization
    role: dashboardRole,
    organizationId: organizationId,
    
    // Multi-organization access (compact)
    accessibleOrganizations: [
      organizationId,
      ENTERPRISE_CONFIG.organizationId,
      ENTERPRISE_CONFIG.secondaryOrganizationId
    ].filter(Boolean).filter((org, index, arr) => arr.indexOf(org) === index),
    
    // Team member essentials
    isTeamMember: !!teamMemberData,
    isOrganizationOwner: userData?.role === 'OWNER' || userData?.role === 'owner',
    teamMemberRole: teamMemberData?.role || userData?.role,
    
    // License and tier
    licenseType: ENTERPRISE_CONFIG.licenseType,
    
    // Hierarchy system (compact)
    effectiveHierarchy: effectiveHierarchy,
    
    // Essential permissions (compact - just key ones)
    permissions: isAdmin ? ['admin:all', 'read:all', 'write:all'] : 
                effectiveHierarchy >= 80 ? ['admin:team', 'manage:projects'] :
                effectiveHierarchy >= 60 ? ['manage:team', 'access:admin'] :
                ['read:team', 'write:team'],
    
    // Admin flags
    isEnterpriseAdmin: isAdmin,
    hasUniversalAccess: isAdmin,
    
    // Metadata (compact)
    claimsVersion: '4.1'
  };
  
  return claims;
}

/**
 * Get all users from Firestore
 */
async function getAllUsers() {
  console.log('📊 Fetching all users from Firestore...');
  
  const users = [];
  
  // Get users from users collection
  const usersSnapshot = await db.collection('users').get();
  usersSnapshot.forEach(doc => {
    const userData = doc.data();
    if (userData.email && userData.email !== 'undefined') {
      users.push({
        id: doc.id,
        collection: 'users',
        ...userData
      });
    }
  });
  
  // Get users from teamMembers collection
  const teamMembersSnapshot = await db.collection('teamMembers').get();
  teamMembersSnapshot.forEach(doc => {
    const memberData = doc.data();
    if (memberData.email && memberData.email !== 'undefined') {
      users.push({
        id: doc.id,
        collection: 'teamMembers',
        ...memberData
      });
    }
  });
  
  console.log(`✅ Found ${users.length} users total`);
  return users;
}

/**
 * Update custom claims for a Firebase Auth user
 */
async function updateUserClaims(email, claims) {
  try {
    // Get Firebase Auth user
    const authUser = await auth.getUserByEmail(email);
    
    if (isDryRun) {
      console.log(`🔍 [DRY RUN] Would update claims for ${email}:`);
      console.log(`   Role: ${claims.role}`);
      console.log(`   Hierarchy: ${claims.effectiveHierarchy}`);
      console.log(`   Organizations: ${claims.accessibleOrganizations?.join(', ')}`);
      console.log(`   Permissions: ${claims.permissions?.length} permissions`);
      console.log(`   Is Admin: ${claims.isEnterpriseAdmin}`);
      return;
    }
    
    // Set custom claims
    await auth.setCustomUserClaims(authUser.uid, claims);
    
    console.log(`✅ Updated claims for ${email}:`);
    console.log(`   Role: ${claims.role} (Hierarchy: ${claims.effectiveHierarchy})`);
    console.log(`   Organizations: ${claims.accessibleOrganizations?.join(', ')}`);
    console.log(`   Admin Access: ${claims.isEnterpriseAdmin ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error(`❌ Error updating claims for ${email}:`, error.message);
  }
}

/**
 * Main function to update all enterprise custom claims
 */
async function updateEnterpriseCustomClaims() {
  console.log('🔥 Updating Enterprise Custom Claims');
  console.log('=====================================');
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
  } else if (!forceUpdate) {
    console.log('❌ Use --force to apply changes or --dry-run to preview');
    process.exit(1);
  }
  
  try {
    let users = [];
    
    if (specificUser) {
      console.log(`🎯 Updating specific user: ${specificUser}`);
      users = await getAllUsers();
      users = users.filter(user => user.email === specificUser);
      
      if (users.length === 0) {
        console.log(`❌ User not found: ${specificUser}`);
        process.exit(1);
      }
    } else {
      users = await getAllUsers();
    }
    
    console.log(`\n🚀 Processing ${users.length} users...`);
    
    // Group users by email to handle duplicates
    const userMap = new Map();
    users.forEach(user => {
      if (!userMap.has(user.email)) {
        userMap.set(user.email, { userData: null, teamMemberData: null });
      }
      
      const entry = userMap.get(user.email);
      if (user.collection === 'users') {
        entry.userData = user;
      } else if (user.collection === 'teamMembers') {
        entry.teamMemberData = user;
      }
    });
    
    let processed = 0;
    let updated = 0;
    let errors = 0;
    
    for (const [email, { userData, teamMemberData }] of userMap) {
      try {
        processed++;
        console.log(`\n${processed}. Processing: ${email}`);
        
        // Create custom claims
        const claims = createCustomClaims(userData, teamMemberData);
        
        // Update Firebase Auth custom claims
        await updateUserClaims(email, claims);
        updated++;
        
      } catch (error) {
        console.error(`❌ Error processing ${email}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n🎉 Custom Claims Update Complete!');
    console.log('==================================');
    console.log(`📊 Total processed: ${processed}`);
    console.log(`✅ Successfully updated: ${updated}`);
    console.log(`❌ Errors: ${errors}`);
    
    if (!isDryRun) {
      console.log('\n📋 Next Steps:');
      console.log('   1. Users need to refresh their browser or re-login');
      console.log('   2. Firebase Auth tokens will include new claims');
      console.log('   3. Admin users should have universal access');
      console.log('   4. Navigation and toolbar should show all features');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the update
if (require.main === module) {
  updateEnterpriseCustomClaims()
    .then(() => {
      console.log('\n✅ Enterprise custom claims update completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Enterprise custom claims update failed:', error);
      process.exit(1);
    });
}

module.exports = {
  updateEnterpriseCustomClaims,
  createCustomClaims,
  getHierarchyForRole,
  getPermissionsForHierarchy
};
