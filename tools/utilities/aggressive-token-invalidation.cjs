#!/usr/bin/env node

/**
 * 🔥 AGGRESSIVE TOKEN INVALIDATION
 * 
 * This script aggressively invalidates all tokens and forces a complete refresh
 * for the enterprise user to ensure they get the updated custom claims.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (uses default credentials)
if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'backbone-logic' });
}

const auth = admin.auth();

async function aggressiveTokenInvalidation() {
  try {
    console.log('🔥 Aggressive Token Invalidation for Enterprise User...\n');

    const email = 'enterprise.user@enterprisemedia.com';
    
    // Get Firebase user
    const firebaseUser = await auth.getUserByEmail(email);
    console.log(`🔍 Found Firebase user: ${email} (UID: ${firebaseUser.uid})`);
    
    // Step 1: Revoke all refresh tokens (invalidates all existing tokens)
    console.log('\n🔄 Step 1: Revoking all existing refresh tokens...');
    await auth.revokeRefreshTokens(firebaseUser.uid);
    console.log('✅ All refresh tokens revoked');
    
    // Step 2: Update the custom claims again (force refresh)
    console.log('\n🔄 Step 2: Re-setting custom claims to force update...');
    const enhancedClaims = {
      email: email,
      role: 'OWNER',
      
      // Primary organization
      organizationId: 'enterprise-org-001',
      
      // Secondary organization  
      secondaryOrganizationId: 'enterprise_media_org',
      
      // All accessible organizations (include all variants)
      accessibleOrganizations: [
        'enterprise_media_org',
        'enterprise-org-001',
        'enterprise-media-org',
        'enterprise-org-001'
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
      
      // Force refresh metadata
      lastClaimsUpdate: new Date().toISOString(),
      claimsVersion: '2.1',
      forceRefresh: Date.now()
    };
    
    await auth.setCustomUserClaims(firebaseUser.uid, enhancedClaims);
    console.log('✅ Custom claims updated with force refresh');
    
    // Step 3: Revoke tokens again after claims update
    console.log('\n🔄 Step 3: Revoking tokens again after claims update...');
    await auth.revokeRefreshTokens(firebaseUser.uid);
    console.log('✅ Tokens revoked again');
    
    // Step 4: Verify the new state
    const updatedUserRecord = await auth.getUser(firebaseUser.uid);
    console.log(`\n🕐 New tokens valid after: ${new Date(updatedUserRecord.tokensValidAfterTime).toISOString()}`);
    console.log(`🕐 Current time: ${new Date().toISOString()}`);
    
    console.log('\n🎉 Aggressive token invalidation completed!');
    
    console.log('\n🚨 CRITICAL INSTRUCTIONS FOR USER:');
    console.log('1. 🚪 COMPLETELY CLOSE the browser (not just the tab)');
    console.log('2. 🧹 CLEAR ALL browser data for the site:');
    console.log('   - Open new browser window');
    console.log('   - Go to Settings > Privacy > Clear browsing data');
    console.log('   - Select "All time" and check all boxes');
    console.log('   - Clear data');
    console.log('3. 🔄 RESTART the browser completely');
    console.log('4. 🌐 Navigate to the licensing website fresh');
    console.log('5. 🔑 Log in again');
    
    console.log('\n🔧 ALTERNATIVE (if still having issues):');
    console.log('- Try using an incognito/private browser window');
    console.log('- Or try a different browser entirely');
    console.log('- This will bypass all caching issues');
    
  } catch (error) {
    console.error('❌ Error in aggressive token invalidation:', error);
    process.exit(1);
  }
}

// Run the aggressive invalidation
aggressiveTokenInvalidation()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
