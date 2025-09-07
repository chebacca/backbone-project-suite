#!/usr/bin/env node

/**
 * Check Team Member Data in Firestore
 * 
 * This script checks what team member data exists in Firestore
 * for the enterprise.user@enterprisemedia.com account
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function checkTeamMemberData() {
  console.log('🔍 Checking team member data for enterprise.user@enterprisemedia.com...\n');
  
  try {
    // First, find the organization ID for the enterprise user
    console.log('1. Looking for enterprise user in users collection...');
    const usersQuery = db.collection('users').where('email', '==', 'enterprise.user@enterprisemedia.com');
    
    const usersSnapshot = await usersQuery.get();
    let enterpriseUser = null;
    let organizationId = null;
    
    if (!usersSnapshot.empty) {
      enterpriseUser = usersSnapshot.docs[0].data();
      organizationId = enterpriseUser.organizationId || enterpriseUser.organization?.id;
      console.log('✅ Found enterprise user:', {
        id: usersSnapshot.docs[0].id,
        email: enterpriseUser.email,
        name: enterpriseUser.name,
        firstName: enterpriseUser.firstName,
        lastName: enterpriseUser.lastName,
        organizationId: organizationId
      });
    } else {
      console.log('❌ Enterprise user not found in users collection');
      return;
    }
    
    if (!organizationId) {
      console.log('❌ No organization ID found for enterprise user');
      return;
    }
    
    console.log(`\n2. Checking team members for organization: ${organizationId}\n`);
    
    // Check different collections for team member data
    const collections = [
      'teamMembers',
      'team_members',
      'orgMembers', 
      'org_members',
      'users'
    ];
    
    for (const collectionName of collections) {
      console.log(`\n--- Checking ${collectionName} collection ---`);
      
      try {
        const teamQuery = db.collection(collectionName).where('organizationId', '==', organizationId);
        
        const snapshot = await teamQuery.get();
        
        if (snapshot.empty) {
          console.log(`📭 No documents found in ${collectionName} collection`);
        } else {
          console.log(`📊 Found ${snapshot.docs.length} documents in ${collectionName} collection:`);
          
          snapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`\n  ${index + 1}. Document ID: ${doc.id}`);
            console.log(`     Email: ${data.email || 'N/A'}`);
            console.log(`     Name: ${data.name || 'N/A'}`);
            console.log(`     First Name: ${data.firstName || 'N/A'}`);
            console.log(`     Last Name: ${data.lastName || 'N/A'}`);
            console.log(`     Role: ${data.role || 'N/A'}`);
            console.log(`     Status: ${data.status || 'N/A'}`);
            console.log(`     Department: ${data.department || 'N/A'}`);
            console.log(`     Created At: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : 'N/A'}`);
            
            // Check if this looks like placeholder data
            if (data.email && data.email.includes('@placeholder.com')) {
              console.log(`     ⚠️  PLACEHOLDER DATA DETECTED`);
            }
            
            if (data.firstName && (data.firstName.startsWith('tm-') || data.firstName === 'Unknown')) {
              console.log(`     ⚠️  PLACEHOLDER FIRST NAME DETECTED`);
            }
          });
        }
      } catch (error) {
        console.log(`❌ Error querying ${collectionName}:`, error.message);
      }
    }
    
    // Also check for any documents that might have the enterprise user's email
    console.log(`\n3. Searching for documents with enterprise email across collections...\n`);
    
    for (const collectionName of collections) {
      console.log(`\n--- Searching ${collectionName} for enterprise email ---`);
      
      try {
        const emailQuery = db.collection(collectionName).where('email', '==', 'enterprise.user@enterprisemedia.com');
        
        const snapshot = await emailQuery.get();
        
        if (!snapshot.empty) {
          console.log(`📧 Found ${snapshot.docs.length} documents with enterprise email in ${collectionName}:`);
          
          snapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`\n  ${index + 1}. Document ID: ${doc.id}`);
            console.log(`     Email: ${data.email}`);
            console.log(`     Name: ${data.name || 'N/A'}`);
            console.log(`     First Name: ${data.firstName || 'N/A'}`);
            console.log(`     Last Name: ${data.lastName || 'N/A'}`);
            console.log(`     Role: ${data.role || 'N/A'}`);
            console.log(`     Organization ID: ${data.organizationId || 'N/A'}`);
          });
        }
      } catch (error) {
        console.log(`❌ Error searching ${collectionName}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking team member data:', error);
  }
}

// Run the check
checkTeamMemberData().then(() => {
  console.log('\n✅ Team member data check complete');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
