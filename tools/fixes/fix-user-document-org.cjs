#!/usr/bin/env node

/**
 * 🔧 FIX USER DOCUMENT ORGANIZATION
 * 
 * The user has two documents in the users collection:
 * 1. Document with Firebase UID as ID - has wrong organization (enterprise_media_org)
 * 2. Document with email as ID - has correct organization (enterprise-org-001)
 * 
 * This script fixes the Firebase UID document to have the correct organization.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (uses default credentials)
if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'backbone-logic' });
}

const db = admin.firestore();

async function fixUserDocumentOrg() {
  try {
    console.log('🔧 Fixing User Document Organization...\n');

    const email = 'enterprise.user@enterprisemedia.com';
    const firebaseUid = '2ysTqv3pwiXyKxOeExAfEKOIh7K2';
    
    console.log('🎯 PROBLEM IDENTIFIED:');
    console.log('- User has TWO documents in users collection');
    console.log(`- Document "${firebaseUid}" has organization: enterprise_media_org (WRONG)`);
    console.log(`- Document "${email}" has organization: enterprise-org-001 (CORRECT)`);
    console.log('- Licensing website finds the Firebase UID document first, gets wrong org');
    
    console.log('\n🔧 SOLUTION:');
    console.log('- Update the Firebase UID document to have the correct organization');
    console.log('- This will make both documents consistent');
    
    // Get the correct data from the email document
    console.log('\n🔍 Getting correct data from email document...');
    const emailDoc = await db.collection('users').doc(email).get();
    
    if (!emailDoc.exists) {
      throw new Error('Email document not found');
    }
    
    const correctData = emailDoc.data();
    console.log(`✅ Found correct data:`);
    console.log(`  - Organization: ${correctData.organizationId}`);
    console.log(`  - Role: ${correctData.role}`);
    
    // Update the Firebase UID document
    console.log('\n🔄 Updating Firebase UID document...');
    await db.collection('users').doc(firebaseUid).update({
      organizationId: correctData.organizationId, // enterprise-org-001
      role: correctData.role, // OWNER
      email: email,
      firebaseUid: firebaseUid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      organizationFixed: true
    });
    
    console.log('✅ Firebase UID document updated successfully');
    
    // Verify the fix
    console.log('\n🔍 VERIFICATION:');
    const updatedDoc = await db.collection('users').doc(firebaseUid).get();
    const updatedData = updatedDoc.data();
    
    console.log(`✅ Updated document now has:`);
    console.log(`  - Organization: ${updatedData.organizationId}`);
    console.log(`  - Role: ${updatedData.role}`);
    console.log(`  - Email: ${updatedData.email}`);
    
    console.log('\n🎉 User document organization fixed!');
    
    console.log('\n📋 EXPECTED RESULT:');
    console.log('- Licensing website will now find the correct organization');
    console.log('- Queries will target enterprise-org-001 where the data actually exists');
    console.log('- Permission errors should be resolved');
    
    console.log('\n🔄 NEXT STEPS:');
    console.log('1. User should refresh the licensing website');
    console.log('2. App should now query the correct organization');
    console.log('3. Data should load successfully');
    
  } catch (error) {
    console.error('❌ Error fixing user document organization:', error);
    process.exit(1);
  }
}

// Run the fix
fixUserDocumentOrg()
  .then(() => {
    console.log('\n✅ User document organization fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ User document organization fix failed:', error);
    process.exit(1);
  });
