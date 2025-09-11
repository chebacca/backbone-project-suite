#!/usr/bin/env node

/**
 * Fix Enterprise User Dual Organization Custom Claims
 * 
 * The enterprise.user@enterprisemedia.com user needs access to data from both:
 * - enterprise-org-001 (teamMembers collection)
 * - enterprise_media_org (users collection)
 * 
 * This script updates their Firebase custom claims to include both organizations.
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, 'Dashboard-v14_2/apps/web/functions/config/serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixEnterpriseDualOrgClaims() {
  try {
    console.log('🔧 Fixing Enterprise User Dual Organization Custom Claims...\n');

    const email = 'enterprise.user@enterprisemedia.com';
    
    // Get Firebase user
    const firebaseUser = await admin.auth().getUserByEmail(email);
    console.log(`🔍 Found Firebase user: ${email} (UID: ${firebaseUser.uid})`);
    
    // Get current custom claims
    const userRecord = await admin.auth().getUser(firebaseUser.uid);
    console.log('📋 Current custom claims:', JSON.stringify(userRecord.customClaims, null, 2));
    
    // Get user data from both collections
    const userDoc = await db.collection('users').doc(email).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    
    const teamMemberQuery = await db.collection('teamMembers').where('email', '==', email).get();
    const teamMemberData = !teamMemberQuery.empty ? teamMemberQuery.docs[0].data() : null;
    
    console.log('\n📊 User Data Analysis:');
    if (userData) {
      console.log(`✅ Users collection - Organization: ${userData.organizationId}, Role: ${userData.role}`);
    }
    if (teamMemberData) {
      console.log(`✅ TeamMembers collection - Organization: ${teamMemberData.organizationId}, Role: ${teamMemberData.role}`);
    }
    
    // Create enhanced custom claims with dual organization support
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
        teamMemberData?.organizationId || 'enterprise-org-001'
      ],
      
      // Team member specific data
      teamMemberRole: teamMemberData?.role || 'admin',
      isTeamMember: !!teamMemberData,
      
      // Hierarchy system data
      teamMemberHierarchy: 90, // Admin level
      dashboardHierarchy: 100, // Full admin
      effectiveHierarchy: 100, // Max of both
      
      // Enhanced permissions
      permissions: [
        'read:all',
        'write:all', 
        'admin:users',
        'admin:team',
        'admin:licenses',
        'admin:projects'
      ],
      
      // Role mapping
      roleMapping: {
        licensingRole: teamMemberData?.role || 'admin',
        availableDashboardRoles: ['ADMIN', 'SUPERADMIN'],
        selectedDashboardRole: 'ADMIN',
        templateRole: 'admin'
      }
    };
    
    console.log('\n🔧 Setting enhanced custom claims...');
    await admin.auth().setCustomUserClaims(firebaseUser.uid, enhancedClaims);
    
    console.log('✅ Enhanced custom claims set successfully!');
    console.log('📋 New custom claims:', JSON.stringify(enhancedClaims, null, 2));
    
    // Verify the claims were set
    const updatedUserRecord = await admin.auth().getUser(firebaseUser.uid);
    console.log('\n🔍 VERIFICATION - Updated custom claims:');
    console.log(JSON.stringify(updatedUserRecord.customClaims, null, 2));
    
    console.log('\n🎉 Enterprise user dual organization custom claims fixed successfully!');
    console.log('The user now has access to both organizations:');
    console.log('- enterprise_media_org (primary)');
    console.log('- enterprise-org-001 (secondary)');
    
  } catch (error) {
    console.error('❌ Error fixing enterprise dual org claims:', error);
    process.exit(1);
  }
}

// Run the fix
fixEnterpriseDualOrgClaims()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
