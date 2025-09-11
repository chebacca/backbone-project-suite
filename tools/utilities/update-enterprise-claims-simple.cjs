#!/usr/bin/env node

/**
 * 🔧 UPDATE ENTERPRISE USER CUSTOM CLAIMS
 * 
 * This script updates the Firebase custom claims for enterprise.user@enterprisemedia.com
 * to include comprehensive organization access for the licensing website.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (uses default credentials)
if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'backbone-logic' });
}

const db = admin.firestore();
const auth = admin.auth();

async function updateEnterpriseUserClaims() {
  try {
    console.log('🔧 Updating Enterprise User Custom Claims...\n');

    const email = 'enterprise.user@enterprisemedia.com';
    
    // Get Firebase user
    const firebaseUser = await auth.getUserByEmail(email);
    console.log(`🔍 Found Firebase user: ${email} (UID: ${firebaseUser.uid})`);
    
    // Get current custom claims
    const userRecord = await auth.getUser(firebaseUser.uid);
    console.log('📋 Current custom claims:', JSON.stringify(userRecord.customClaims, null, 2));
    
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
    
    // Create comprehensive custom claims with all possible organization variants
    const enhancedClaims = {
      email: email,
      role: userData?.role || 'admin',
      
      // Primary organization (from users collection)
      organizationId: userData?.organizationId || 'enterprise_media_org',
      
      // Secondary organization (from teamMembers collection)  
      secondaryOrganizationId: teamMemberData?.organizationId || 'enterprise-org-001',
      
      // All accessible organizations (include all possible variants)
      accessibleOrganizations: [
        'enterprise_media_org',
        'enterprise-org-001', 
        'enterprise-media-org',
        'enterprise-org-001',
        userData?.organizationId,
        teamMemberData?.organizationId
      ].filter(Boolean), // Remove any undefined values
      
      // Team member specific data
      teamMemberRole: teamMemberData?.role || 'admin',
      isTeamMember: true,
      
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
        licensingRole: 'admin',
        availableDashboardRoles: ['ADMIN', 'SUPERADMIN'],
        selectedDashboardRole: 'ADMIN',
        templateRole: 'admin'
      },
      
      // Additional metadata
      lastClaimsUpdate: new Date().toISOString(),
      claimsVersion: '2.0'
    };
    
    console.log('\n🔧 Setting comprehensive custom claims...');
    await auth.setCustomUserClaims(firebaseUser.uid, enhancedClaims);
    
    console.log('✅ Custom claims updated successfully!');
    
    // Verify the claims were set
    const updatedUserRecord = await auth.getUser(firebaseUser.uid);
    console.log('\n🔍 VERIFICATION - New custom claims:');
    console.log(JSON.stringify(updatedUserRecord.customClaims, null, 2));
    
    console.log('\n🎉 Enterprise user custom claims updated successfully!');
    console.log('\n📋 The user now has access to:');
    enhancedClaims.accessibleOrganizations.forEach(org => {
      if (org) console.log(`- ${org}`);
    });
    
    console.log('\n🔄 IMPORTANT: User must log out and log back in to get the new token with updated claims!');
    
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
