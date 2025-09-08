/**
 * Check for existing Network Delivery Bibles in Firestore
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function checkNetworkDeliveryBibles() {
  try {
    console.log('🔍 Checking for Network Delivery Bibles in Firestore...');
    
    // Get all documents from networkDeliveryBibles collection
    const biblesSnapshot = await db.collection('networkDeliveryBibles').get();
    
    console.log(`📚 Found ${biblesSnapshot.size} Network Delivery Bibles`);
    
    if (biblesSnapshot.size > 0) {
      console.log('\n📋 Bible Details:');
      biblesSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n${index + 1}. Bible ID: ${doc.id}`);
        console.log(`   File Name: ${data.fileName || 'Unknown'}`);
        console.log(`   Status: ${data.status || 'Unknown'}`);
        console.log(`   Organization ID: ${data.organizationId || 'Unknown'}`);
        console.log(`   Project ID: ${data.projectId || 'None'}`);
        console.log(`   Uploaded By: ${data.uploadedBy || 'Unknown'}`);
        console.log(`   Deliverable Count: ${data.deliverableCount || 0}`);
        console.log(`   Uploaded At: ${data.uploadedAt ? new Date(data.uploadedAt._seconds * 1000).toISOString() : 'Unknown'}`);
      });
    } else {
      console.log('\n❌ No Network Delivery Bibles found in the database');
      console.log('💡 This might be why the NetworkDeliveryBibleBot is not showing any data');
    }
    
    // Check for deliverables in any bible
    console.log('\n🔍 Checking for deliverables...');
    let totalDeliverables = 0;
    
    for (const bibleDoc of biblesSnapshot.docs) {
      const deliverablesSnapshot = await db.collection('networkDeliveryBibles')
        .doc(bibleDoc.id)
        .collection('deliverables')
        .get();
      
      if (deliverablesSnapshot.size > 0) {
        console.log(`📋 Bible "${bibleDoc.data().fileName}" has ${deliverablesSnapshot.size} deliverables`);
        totalDeliverables += deliverablesSnapshot.size;
      }
    }
    
    console.log(`\n📊 Total deliverables across all bibles: ${totalDeliverables}`);
    
    // Check organizations
    console.log('\n🔍 Checking organizations...');
    const orgsSnapshot = await db.collection('organizations').get();
    console.log(`🏢 Found ${orgsSnapshot.size} organizations`);
    
    if (orgsSnapshot.size > 0) {
      orgsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${data.name || 'Unknown'} (ID: ${data.organizationId || doc.id})`);
      });
    }
    
    // Check for enterprise user specifically
    console.log('\n🔍 Checking for enterprise user...');
    const usersSnapshot = await db.collection('users')
      .where('email', '==', 'enterprise.user@enterprisemedia.com')
      .get();
    
    if (!usersSnapshot.empty) {
      const userData = usersSnapshot.docs[0].data();
      console.log('✅ Found enterprise user:', {
        email: userData.email,
        organizationId: userData.organizationId,
        role: userData.role
      });
    } else {
      console.log('❌ Enterprise user not found in users collection');
    }
    
    // Check team members
    const teamMembersSnapshot = await db.collection('teamMembers')
      .where('email', '==', 'enterprise.user@enterprisemedia.com')
      .get();
    
    if (!teamMembersSnapshot.empty) {
      const teamMemberData = teamMembersSnapshot.docs[0].data();
      console.log('✅ Found enterprise user in team members:', {
        email: teamMemberData.email,
        organizationId: teamMemberData.organizationId,
        role: teamMemberData.role
      });
    } else {
      console.log('❌ Enterprise user not found in teamMembers collection');
    }
    
  } catch (error) {
    console.error('❌ Error checking Network Delivery Bibles:', error);
  }
}

// Run the check
checkNetworkDeliveryBibles();
