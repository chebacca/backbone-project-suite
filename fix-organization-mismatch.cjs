#!/usr/bin/env node

/**
 * 🔧 FIX ORGANIZATION MISMATCH
 * 
 * The issue is that the user's data is in "enterprise-org-001" but the app
 * is trying to query "enterprise_media_org". Let's fix the custom claims
 * to match the actual data location.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (uses default credentials)
if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'backbone-logic' });
}

const auth = admin.auth();

async function fixOrganizationMismatch() {
  try {
    console.log('🔧 Fixing Organization Mismatch...\n');

    const email = 'enterprise.user@enterprisemedia.com';
    
    // Get Firebase user
    const firebaseUser = await auth.getUserByEmail(email);
    console.log(`🔍 Found Firebase user: ${email} (UID: ${firebaseUser.uid})`);
    
    console.log('\n🎯 PROBLEM IDENTIFIED:');
    console.log('- User data is stored in: "enterprise-org-001"');
    console.log('- App is trying to query: "enterprise_media_org"');
    console.log('- This causes permission errors because the data doesn\'t exist in the queried organization');
    
    console.log('\n🔧 SOLUTION:');
    console.log('- Set "enterprise-org-001" as the PRIMARY organization');
    console.log('- Keep "enterprise_media_org" as secondary for compatibility');
    console.log('- Ensure both are in accessibleOrganizations');
    
    // Create corrected custom claims
    const correctedClaims = {
      email: email,
      role: 'OWNER',
      
      // PRIMARY organization (where the data actually exists)
      organizationId: 'enterprise-org-001',
      
      // SECONDARY organization (for compatibility)  
      secondaryOrganizationId: 'enterprise_media_org',
      
      // All accessible organizations (both variants)
      accessibleOrganizations: [
        'enterprise-org-001',      // Primary - where data exists
        'enterprise_media_org',    // Secondary - for compatibility
        'enterprise-media-org',    // Alternative naming
        'enterprise-org-001'       // Ensure primary is listed multiple times
      ],
      
      // Team member data
      teamMemberRole: 'ADMIN',
      isTeamMember: true,
      
      // Hierarchy system (admin level)
      teamMemberHierarchy: 90,
      dashboardHierarchy: 100,
      effectiveHierarchy: 100,
      
      // Enhanced permissions
      permissions: [
        'read:all',
        'write:all', 
        'admin:users',
        'admin:team',
        'admin:licenses',
        'admin:projects',
        'admin:organizations',
        'delete:all'
      ],
      
      // Role mapping
      roleMapping: {
        licensingRole: 'admin',
        availableDashboardRoles: ['ADMIN', 'SUPERADMIN'],
        selectedDashboardRole: 'ADMIN',
        templateRole: 'admin'
      },
      
      // Fix metadata
      lastClaimsUpdate: new Date().toISOString(),
      claimsVersion: '2.2',
      organizationFix: 'primary-org-corrected'
    };
    
    console.log('\n🔄 Setting corrected custom claims...');
    await auth.setCustomUserClaims(firebaseUser.uid, correctedClaims);
    console.log('✅ Custom claims updated with correct organization priority');
    
    // Revoke tokens to force refresh
    console.log('\n🔄 Revoking tokens to force refresh...');
    await auth.revokeRefreshTokens(firebaseUser.uid);
    console.log('✅ Tokens revoked');
    
    // Verify the fix
    const updatedUserRecord = await auth.getUser(firebaseUser.uid);
    console.log('\n🔍 VERIFICATION - Updated custom claims:');
    console.log(`✅ Primary Organization: ${updatedUserRecord.customClaims.organizationId}`);
    console.log(`✅ Secondary Organization: ${updatedUserRecord.customClaims.secondaryOrganizationId}`);
    console.log(`✅ Accessible Organizations: ${JSON.stringify(updatedUserRecord.customClaims.accessibleOrganizations)}`);
    
    console.log('\n🎉 Organization mismatch fixed!');
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. 🚪 User should log out completely');
    console.log('2. 🧹 Clear browser cache/data');
    console.log('3. 🔑 Log back in');
    console.log('4. ✅ App should now find data in the correct organization');
    
    console.log('\n🔍 EXPECTED RESULT:');
    console.log('- No more "Missing or insufficient permissions" errors');
    console.log('- Data will load successfully from enterprise-org-001');
    console.log('- Full licensing website functionality restored');
    
  } catch (error) {
    console.error('❌ Error fixing organization mismatch:', error);
    process.exit(1);
  }
}

// Run the fix
fixOrganizationMismatch()
  .then(() => {
    console.log('\n✅ Organization mismatch fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Organization mismatch fix failed:', error);
    process.exit(1);
  });
