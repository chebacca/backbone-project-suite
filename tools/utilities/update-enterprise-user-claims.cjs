#!/usr/bin/env node

/**
 * Update Enterprise User Custom Claims
 * 
 * This script directly updates the Firebase custom claims for enterprise.user@enterprisemedia.com
 * to include all the organization access and hierarchy data needed for the licensing website.
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, 'Dashboard-v14_2/apps/web/functions/config/serviceAccountKey.json');

// Try different possible locations for the service account key
let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (error) {
  try {
    serviceAccount = require('./Dashboard-v14_2/functions/config/serviceAccountKey.json');
  } catch (error2) {
    try {
      serviceAccount = require('./functions/config/serviceAccountKey.json');
    } catch (error3) {
      console.error('❌ Could not find serviceAccountKey.json in any expected location');
      console.error('Tried:');
      console.error('- Dashboard-v14_2/apps/web/functions/config/serviceAccountKey.json');
      console.error('- Dashboard-v14_2/functions/config/serviceAccountKey.json');
      console.error('- functions/config/serviceAccountKey.json');
      process.exit(1);
    }
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function updateEnterpriseUserClaims() {
  try {
    console.log('🔧 Updating Enterprise User Custom Claims...\n');

    const email = 'enterprise.user@enterprisemedia.com';
    
    // Get Firebase user
    const firebaseUser = await admin.auth().getUserByEmail(email);
    console.log(`🔍 Found Firebase user: ${email} (UID: ${firebaseUser.uid})`);
    
    // Get user data from both collections
    const userDoc = await db.collection('users').doc(email).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    
    const teamMemberQuery = await db.collection('teamMembers').where('email', '==', email).get();
    const teamMemberData = !teamMemberQuery.empty ? teamMemberQuery.docs[0].data() : null;
    
    console.log('\n📊 Current Data:');
    if (userData) {
      console.log(`✅ Users collection - Organization: ${userData.organizationId}, Role: ${userData.role}`);
    }
    if (teamMemberData) {
      console.log(`✅ TeamMembers collection - Organization: ${teamMemberData.organizationId}, Role: ${teamMemberData.role}`);
    }
    
    // Create comprehensive custom claims
    const enhancedClaims = {
      email: email,
      role: userData?.role || 'admin',
      
      // Primary organization (from users collection)
      organizationId: userData?.organizationId || 'enterprise_media_org',
      
      // Secondary organization (from teamMembers collection)  
      secondaryOrganizationId: teamMemberData?.organizationId || 'enterprise-org-001',
      
      // All accessible organizations
      accessibleOrganizations: [
        userData?.organizationId || 'enterprise_media_org',
        teamMemberData?.organizationId || 'enterprise-org-001',
        'enterprise-media-org', // Alternative naming
        'enterprise-org-001'    // Ensure both variants
      ],
      
      // Team member specific data
      teamMemberRole: teamMemberData?.role || 'admin',
      isTeamMember: !!teamMemberData,
      
      // Hierarchy system data (admin level)
      teamMemberHierarchy: 90,  // Admin level
      dashboardHierarchy: 100,  // Full admin
      effectiveHierarchy: 100,  // Max of both
      
      // Enhanced permissions for admin user
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
      
      // Role mapping for dual system
      roleMapping: {
        licensingRole: teamMemberData?.role || 'admin',
        availableDashboardRoles: ['ADMIN', 'SUPERADMIN'],
        selectedDashboardRole: 'ADMIN',
        templateRole: 'admin'
      },
      
      // Additional metadata
      lastClaimsUpdate: new Date().toISOString(),
      claimsVersion: '2.0'
    };
    
    console.log('\n🔧 Setting comprehensive custom claims...');
    await admin.auth().setCustomUserClaims(firebaseUser.uid, enhancedClaims);
    
    console.log('✅ Custom claims updated successfully!');
    
    // Verify the claims were set
    const updatedUserRecord = await admin.auth().getUser(firebaseUser.uid);
    console.log('\n🔍 VERIFICATION - New custom claims:');
    console.log(JSON.stringify(updatedUserRecord.customClaims, null, 2));
    
    console.log('\n🎉 Enterprise user custom claims updated successfully!');
    console.log('The user now has comprehensive access to:');
    console.log('- enterprise_media_org (primary organization)');
    console.log('- enterprise-org-001 (secondary organization)');
    console.log('- Full admin permissions and hierarchy level 100');
    console.log('- Enhanced role mapping for dual system compatibility');
    
    console.log('\n📋 Next Steps:');
    console.log('1. User should log out and log back in to get new token');
    console.log('2. New token will include all organization access');
    console.log('3. Firebase rules will now allow access to both organizations');
    
  } catch (error) {
    console.error('❌ Error updating enterprise user claims:', error);
    process.exit(1);
  }
}

// Run the update
updateEnterpriseUserClaims()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
