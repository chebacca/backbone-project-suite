#!/usr/bin/env node

/**
 * Check License Type for Enterprise User
 * 
 * This script specifically checks the licenseType field for enterprise.user@enterprisemedia.com
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function checkLicenseType() {
  console.log('🔍 Checking licenseType for enterprise.user@enterprisemedia.com...\n');
  
  try {
    // Check users collection
    console.log('1. Checking users collection...');
    const usersQuery = db.collection('users').where('email', '==', 'enterprise.user@enterprisemedia.com');
    const usersSnapshot = await usersQuery.get();
    
    if (!usersSnapshot.empty) {
      usersSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n   User Document ${index + 1} (ID: ${doc.id}):`);
        console.log(`     Email: ${data.email}`);
        console.log(`     Name: ${data.name || data.displayName || 'N/A'}`);
        console.log(`     Role: ${data.role || 'N/A'}`);
        console.log(`     License Type: ${data.licenseType || 'NOT SET'}`);
        console.log(`     Organization ID: ${data.organizationId || 'N/A'}`);
        console.log(`     Is Team Member: ${data.isTeamMember || 'N/A'}`);
        
        if (!data.licenseType) {
          console.log(`     ❌ LICENSE TYPE IS MISSING!`);
        } else if (data.licenseType === 'BASIC') {
          console.log(`     ⚠️  LICENSE TYPE IS BASIC (should be ENTERPRISE)`);
        } else if (data.licenseType === 'ENTERPRISE') {
          console.log(`     ✅ LICENSE TYPE IS ENTERPRISE (correct)`);
        }
      });
    } else {
      console.log('   ❌ No users found with enterprise email');
    }
    
    // Check teamMembers collection
    console.log('\n2. Checking teamMembers collection...');
    const teamQuery = db.collection('teamMembers').where('email', '==', 'enterprise.user@enterprisemedia.com');
    const teamSnapshot = await teamQuery.get();
    
    if (!teamSnapshot.empty) {
      teamSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n   Team Member Document ${index + 1} (ID: ${doc.id}):`);
        console.log(`     Email: ${data.email}`);
        console.log(`     Name: ${data.name || 'N/A'}`);
        console.log(`     Role: ${data.role || 'N/A'}`);
        console.log(`     License Type: ${data.licenseType || 'NOT SET'}`);
        console.log(`     Organization ID: ${data.organizationId || 'N/A'}`);
        console.log(`     Status: ${data.status || 'N/A'}`);
        
        if (!data.licenseType) {
          console.log(`     ❌ LICENSE TYPE IS MISSING!`);
        } else if (data.licenseType === 'BASIC') {
          console.log(`     ⚠️  LICENSE TYPE IS BASIC (should be ENTERPRISE)`);
        } else if (data.licenseType === 'ENTERPRISE') {
          console.log(`     ✅ LICENSE TYPE IS ENTERPRISE (correct)`);
        }
      });
    } else {
      console.log('   ❌ No team members found with enterprise email');
    }
    
    // Check licenses collection
    console.log('\n3. Checking licenses collection...');
    const licensesQuery = db.collection('licenses').where('userEmail', '==', 'enterprise.user@enterprisemedia.com');
    const licensesSnapshot = await licensesQuery.get();
    
    if (!licensesSnapshot.empty) {
      licensesSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n   License Document ${index + 1} (ID: ${doc.id}):`);
        console.log(`     User Email: ${data.userEmail}`);
        console.log(`     License Key: ${data.key || 'N/A'}`);
        console.log(`     Tier: ${data.tier || 'NOT SET'}`);
        console.log(`     Status: ${data.status || 'N/A'}`);
        console.log(`     Organization ID: ${data.organizationId || 'N/A'}`);
        
        if (!data.tier) {
          console.log(`     ❌ LICENSE TIER IS MISSING!`);
        } else if (data.tier === 'BASIC') {
          console.log(`     ⚠️  LICENSE TIER IS BASIC (should be ENTERPRISE)`);
        } else if (data.tier === 'ENTERPRISE') {
          console.log(`     ✅ LICENSE TIER IS ENTERPRISE (correct)`);
        }
      });
    } else {
      console.log('   ❌ No licenses found for enterprise email');
    }
    
  } catch (error) {
    console.error('❌ Error checking license type:', error);
  }
}

// Run the check
checkLicenseType().then(() => {
  console.log('\n✅ License type check complete');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
