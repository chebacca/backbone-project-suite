const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'backbone-logic'
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function fixEnterpriseAdminClaims() {
  console.log('🔧 Fixing Enterprise User Admin Claims...');
  console.log('============================================');

  try {
    const email = 'enterprise.user@enterprisemedia.com';
    
    // 1. Get Firebase Auth user
    console.log('\n1️⃣ Getting Firebase Auth user...');
    const authUser = await auth.getUserByEmail(email);
    console.log('✅ Auth user found:', {
      uid: authUser.uid,
      email: authUser.email,
      emailVerified: authUser.emailVerified
    });

    // 2. Get user document from Firestore
    console.log('\n2️⃣ Getting user document from Firestore...');
    const userDoc = await db.collection('users').doc(authUser.uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    
    if (userData) {
      console.log('✅ User document found:', {
        email: userData.email,
        organizationId: userData.organizationId,
        role: userData.role
      });
    } else {
      console.log('⚠️ User document not found in Firestore');
    }

    // 3. Get team member document
    console.log('\n3️⃣ Getting team member document...');
    const teamMemberQuery = await db.collection('teamMembers')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    let teamMemberData = null;
    if (!teamMemberQuery.empty) {
      teamMemberData = teamMemberQuery.docs[0].data();
      console.log('✅ Team member found:', {
        email: teamMemberData.email,
        organizationId: teamMemberData.organizationId,
        role: teamMemberData.role
      });
    } else {
      console.log('⚠️ Team member document not found');
    }

    // 4. Create comprehensive admin custom claims
    console.log('\n4️⃣ Setting comprehensive admin custom claims...');
    const adminClaims = {
      // Basic identity
      email: email,
      name: 'Enterprise Admin',
      
      // Primary role and organization
      role: 'ADMIN',
      organizationId: userData?.organizationId || teamMemberData?.organizationId || 'enterprise-org-001',
      
      // Secondary organization access
      secondaryOrganizationId: 'enterprise-media-org',
      
      // All accessible organizations
      accessibleOrganizations: [
        'enterprise-org-001',
        'enterprise-media-org',
        userData?.organizationId,
        teamMemberData?.organizationId
      ].filter(Boolean).filter((org, index, arr) => arr.indexOf(org) === index), // Remove duplicates
      
      // Team member data
      isTeamMember: true,
      isOrganizationOwner: true,
      teamMemberRole: teamMemberData?.role || 'admin',
      
      // License and tier
      licenseType: 'ENTERPRISE',
      tier: 'ENTERPRISE',
      
      // Hierarchy system (admin level = 100)
      teamMemberHierarchy: 100,
      dashboardHierarchy: 100,
      effectiveHierarchy: 100,
      
      // Dashboard role mapping
      dashboardRole: 'ADMIN',
      roleMapping: {
        licensingRole: teamMemberData?.role || 'admin',
        availableDashboardRoles: ['ADMIN', 'SUPERADMIN'],
        selectedDashboardRole: 'ADMIN',
        templateRole: 'admin'
      },
      
      // Comprehensive admin permissions
      permissions: [
        'read:all',
        'write:all',
        'admin:all',
        'admin:users',
        'admin:team',
        'admin:licenses',
        'admin:projects',
        'admin:organizations',
        'admin:settings',
        'admin:reports',
        'admin:billing',
        'delete:all',
        'manage:all'
      ],
      
      // Project access (all projects)
      projectAccess: ['*'], // Wildcard for all projects
      
      // Additional metadata
      lastClaimsUpdate: new Date().toISOString(),
      claimsVersion: '3.0',
      isEnterpriseAdmin: true,
      hasUniversalAccess: true
    };
    
    console.log('🔧 Setting custom claims with:', {
      role: adminClaims.role,
      organizationId: adminClaims.organizationId,
      accessibleOrganizations: adminClaims.accessibleOrganizations,
      effectiveHierarchy: adminClaims.effectiveHierarchy,
      permissionsCount: adminClaims.permissions.length
    });
    
    await auth.setCustomUserClaims(authUser.uid, adminClaims);
    console.log('✅ Custom claims updated successfully!');
    
    // 5. Verify the claims were set
    console.log('\n5️⃣ Verifying custom claims...');
    const updatedUserRecord = await auth.getUser(authUser.uid);
    const customClaims = updatedUserRecord.customClaims || {};
    
    console.log('✅ Verification complete:', {
      role: customClaims.role,
      organizationId: customClaims.organizationId,
      accessibleOrganizations: customClaims.accessibleOrganizations?.length || 0,
      effectiveHierarchy: customClaims.effectiveHierarchy,
      isEnterpriseAdmin: customClaims.isEnterpriseAdmin,
      hasUniversalAccess: customClaims.hasUniversalAccess,
      permissionsCount: customClaims.permissions?.length || 0
    });
    
    console.log('\n🎉 SUCCESS: Enterprise user now has full admin access!');
    console.log('📋 Next steps:');
    console.log('   1. User needs to refresh their browser or re-login');
    console.log('   2. Firebase Auth token will include new claims');
    console.log('   3. All navigation and toolbar items should be visible');
    console.log('   4. User should have universal access to all features');
    
  } catch (error) {
    console.error('❌ Error fixing enterprise admin claims:', error);
    throw error;
  }
}

// Run the fix
fixEnterpriseAdminClaims()
  .then(() => {
    console.log('\n✅ Enterprise admin claims fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Enterprise admin claims fix failed:', error);
    process.exit(1);
  });

