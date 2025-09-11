/**
 * Fix Network Delivery Bible Bot Organization Consistency
 * 
 * Problem: The enterprise user has data split across two organization IDs:
 * - enterprise-org-001 (from original mock data)
 * - enterprise-media-org (from various fix scripts)
 * 
 * Solution: Consolidate everything under enterprise-org-001 (the original)
 * since that's what the generate-enterprise-mock-data.js script uses.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

const CANONICAL_ORG_ID = 'enterprise-org-001'; // Use the original from mock data
const OLD_ORG_ID = 'enterprise-media-org';
const ENTERPRISE_USER_EMAIL = 'enterprise.user@enterprisemedia.com';
const ENTERPRISE_USER_UID = '2ysTqv3pwiXyKxOeExAfEKOIh7K2';

async function fixOrganizationConsistency() {
  try {
    console.log('🔧 Starting Network Delivery Bible Bot Organization Consistency Fix...');
    console.log(`📋 Canonical Organization ID: ${CANONICAL_ORG_ID}`);
    console.log(`📋 Old Organization ID to migrate: ${OLD_ORG_ID}`);
    
    // Step 1: Fix the user document
    console.log('\n1️⃣ Fixing user document...');
    const userDoc = await db.collection('users').doc(ENTERPRISE_USER_UID).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.organizationId !== CANONICAL_ORG_ID) {
        console.log(`   Updating user organizationId from ${userData.organizationId} to ${CANONICAL_ORG_ID}`);
        await db.collection('users').doc(ENTERPRISE_USER_UID).update({
          organizationId: CANONICAL_ORG_ID
        });
        console.log('   ✅ User document updated');
      } else {
        console.log('   ✅ User document already has correct organizationId');
      }
    }
    
    // Step 2: Fix team member document
    console.log('\n2️⃣ Fixing team member document...');
    const teamMemberQuery = await db.collection('teamMembers')
      .where('email', '==', ENTERPRISE_USER_EMAIL)
      .get();
    
    if (!teamMemberQuery.empty) {
      for (const doc of teamMemberQuery.docs) {
        const data = doc.data();
        if (data.organizationId !== CANONICAL_ORG_ID) {
          console.log(`   Updating team member organizationId from ${data.organizationId} to ${CANONICAL_ORG_ID}`);
          await doc.ref.update({
            organizationId: CANONICAL_ORG_ID
          });
          console.log('   ✅ Team member document updated');
        } else {
          console.log('   ✅ Team member document already has correct organizationId');
        }
      }
    }
    
    // Step 3: Fix Network Delivery Bibles
    console.log('\n3️⃣ Fixing Network Delivery Bibles...');
    const biblesQuery = await db.collection('networkDeliveryBibles')
      .where('organizationId', '==', OLD_ORG_ID)
      .get();
    
    console.log(`   Found ${biblesQuery.size} bibles with old organization ID`);
    
    for (const doc of biblesQuery.docs) {
      const data = doc.data();
      console.log(`   Updating bible "${data.fileName}" organizationId to ${CANONICAL_ORG_ID}`);
      await doc.ref.update({
        organizationId: CANONICAL_ORG_ID
      });
      
      // Also update any deliverables in this bible
      const deliverablesQuery = await doc.ref.collection('deliverables').get();
      console.log(`     Found ${deliverablesQuery.size} deliverables to update`);
      
      for (const deliverableDoc of deliverablesQuery.docs) {
        const deliverableData = deliverableDoc.data();
        if (deliverableData.organizationId === OLD_ORG_ID) {
          await deliverableDoc.ref.update({
            organizationId: CANONICAL_ORG_ID
          });
        }
      }
    }
    
    console.log('   ✅ Network Delivery Bibles updated');
    
    // Step 4: Ensure canonical organization exists
    console.log('\n4️⃣ Ensuring canonical organization exists...');
    const orgDoc = await db.collection('organizations').doc(CANONICAL_ORG_ID).get();
    
    if (!orgDoc.exists) {
      console.log('   Creating canonical organization document...');
      await db.collection('organizations').doc(CANONICAL_ORG_ID).set({
        organizationId: CANONICAL_ORG_ID,
        name: 'Enterprise Media Solutions',
        tier: 'enterprise',
        status: 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        adminEmail: ENTERPRISE_USER_EMAIL,
        domain: 'enterprisemedia.com',
        industry: 'Media Production',
        size: 'Enterprise',
        timezone: 'America/New_York',
        country: 'United States'
      });
      console.log('   ✅ Canonical organization created');
    } else {
      console.log('   ✅ Canonical organization already exists');
    }
    
    // Step 5: Verify the fix
    console.log('\n5️⃣ Verifying the fix...');
    
    // Check user
    const updatedUserDoc = await db.collection('users').doc(ENTERPRISE_USER_UID).get();
    const userOrgId = updatedUserDoc.data()?.organizationId;
    console.log(`   User organizationId: ${userOrgId} ${userOrgId === CANONICAL_ORG_ID ? '✅' : '❌'}`);
    
    // Check team member
    const updatedTeamMemberQuery = await db.collection('teamMembers')
      .where('email', '==', ENTERPRISE_USER_EMAIL)
      .get();
    
    if (!updatedTeamMemberQuery.empty) {
      const teamMemberOrgId = updatedTeamMemberQuery.docs[0].data()?.organizationId;
      console.log(`   Team member organizationId: ${teamMemberOrgId} ${teamMemberOrgId === CANONICAL_ORG_ID ? '✅' : '❌'}`);
    }
    
    // Check bibles
    const canonicalBiblesQuery = await db.collection('networkDeliveryBibles')
      .where('organizationId', '==', CANONICAL_ORG_ID)
      .get();
    
    const oldBiblesQuery = await db.collection('networkDeliveryBibles')
      .where('organizationId', '==', OLD_ORG_ID)
      .get();
    
    console.log(`   Bibles with canonical org ID: ${canonicalBiblesQuery.size} ✅`);
    console.log(`   Bibles with old org ID: ${oldBiblesQuery.size} ${oldBiblesQuery.size === 0 ? '✅' : '❌'}`);
    
    console.log('\n🎉 Organization consistency fix completed!');
    console.log(`\n📋 Summary:`);
    console.log(`   - All data now uses organization ID: ${CANONICAL_ORG_ID}`);
    console.log(`   - NetworkDeliveryBibleBot should now fetch all bibles correctly`);
    console.log(`   - User authentication should work consistently`);
    
  } catch (error) {
    console.error('❌ Error fixing organization consistency:', error);
  }
}

// Run the fix
fixOrganizationConsistency();
