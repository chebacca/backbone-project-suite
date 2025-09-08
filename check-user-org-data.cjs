#!/usr/bin/env node

/**
 * 🔍 CHECK USER ORGANIZATION DATA
 * 
 * This script checks what organization ID is stored in the user's Firestore document
 * to understand why the licensing website is using the wrong organization.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (uses default credentials)
if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'backbone-logic' });
}

const db = admin.firestore();

async function checkUserOrgData() {
  try {
    console.log('🔍 Checking User Organization Data...\n');

    const email = 'enterprise.user@enterprisemedia.com';
    const firebaseUid = '2ysTqv3pwiXyKxOeExAfEKOIh7K2';
    
    console.log(`👤 User: ${email}`);
    console.log(`🔑 Firebase UID: ${firebaseUid}`);
    
    // Check 1: User document by email (document ID)
    console.log('\n🔍 Check 1: User document by email (document ID)...');
    try {
      const userDocByEmail = await db.collection('users').doc(email).get();
      if (userDocByEmail.exists()) {
        const userData = userDocByEmail.data();
        console.log(`✅ Found user document by email:`);
        console.log(`  - Organization ID: ${userData.organizationId}`);
        console.log(`  - Role: ${userData.role}`);
        console.log(`  - Firebase UID: ${userData.firebaseUid}`);
      } else {
        console.log(`❌ No user document found with email as document ID`);
      }
    } catch (error) {
      console.log(`❌ Error checking user by email: ${error.message}`);
    }
    
    // Check 2: User document by Firebase UID query
    console.log('\n🔍 Check 2: User document by Firebase UID query...');
    try {
      const userByUidQuery = await db.collection('users')
        .where('firebaseUid', '==', firebaseUid)
        .get();
      
      if (!userByUidQuery.empty) {
        userByUidQuery.forEach(doc => {
          const userData = doc.data();
          console.log(`✅ Found user document by Firebase UID:`);
          console.log(`  - Document ID: ${doc.id}`);
          console.log(`  - Organization ID: ${userData.organizationId}`);
          console.log(`  - Role: ${userData.role}`);
          console.log(`  - Email: ${userData.email}`);
        });
      } else {
        console.log(`❌ No user document found with Firebase UID: ${firebaseUid}`);
      }
    } catch (error) {
      console.log(`❌ Error checking user by UID: ${error.message}`);
    }
    
    // Check 3: All user documents with this email
    console.log('\n🔍 Check 3: All user documents with this email...');
    try {
      const usersByEmailQuery = await db.collection('users')
        .where('email', '==', email)
        .get();
      
      if (!usersByEmailQuery.empty) {
        console.log(`✅ Found ${usersByEmailQuery.size} user document(s) with email ${email}:`);
        usersByEmailQuery.forEach((doc, index) => {
          const userData = doc.data();
          console.log(`  Document ${index + 1}:`);
          console.log(`    - Document ID: ${doc.id}`);
          console.log(`    - Organization ID: ${userData.organizationId}`);
          console.log(`    - Role: ${userData.role}`);
          console.log(`    - Firebase UID: ${userData.firebaseUid}`);
        });
      } else {
        console.log(`❌ No user documents found with email: ${email}`);
      }
    } catch (error) {
      console.log(`❌ Error checking users by email query: ${error.message}`);
    }
    
    // Check 4: Team member document
    console.log('\n🔍 Check 4: Team member document...');
    try {
      const teamMemberQuery = await db.collection('teamMembers')
        .where('email', '==', email)
        .get();
      
      if (!teamMemberQuery.empty) {
        teamMemberQuery.forEach((doc, index) => {
          const teamData = doc.data();
          console.log(`✅ Found team member document ${index + 1}:`);
          console.log(`  - Document ID: ${doc.id}`);
          console.log(`  - Organization ID: ${teamData.organizationId}`);
          console.log(`  - Role: ${teamData.role}`);
          console.log(`  - Firebase UID: ${teamData.firebaseUid}`);
        });
      } else {
        console.log(`❌ No team member documents found with email: ${email}`);
      }
    } catch (error) {
      console.log(`❌ Error checking team members: ${error.message}`);
    }
    
    console.log('\n🎯 ANALYSIS:');
    console.log('The licensing website gets the organization ID from the user\'s Firestore document.');
    console.log('If the document has the wrong organization ID, that\'s why it\'s querying the wrong organization.');
    
  } catch (error) {
    console.error('❌ Error checking user organization data:', error);
    process.exit(1);
  }
}

// Run the check
checkUserOrgData()
  .then(() => {
    console.log('\n✅ User organization data check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ User organization data check failed:', error);
    process.exit(1);
  });
