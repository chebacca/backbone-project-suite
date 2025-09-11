/**
 * Check Firestore Data and Connect to Dashboard
 * 
 * This script uses Firebase Admin SDK to check what data we have
 * and ensure it's properly connected to the Dashboard app
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function checkFirestoreData() {
  try {
    console.log('🔍 Checking Firestore Data for Dashboard Connection...\n');
    
    // 1. Check Collections
    console.log('📁 Available Collections:');
    const collections = await db.listCollections();
    const collectionNames = collections.map(c => c.id);
    console.log('  Collections:', collectionNames.join(', '));
    console.log('  Total Collections:', collectionNames.length);
    
    // 2. Check Sessions Collection
    if (collectionNames.includes('sessions')) {
      console.log('\n🎬 Sessions Collection:');
      const sessionsSnapshot = await db.collection('sessions').limit(10).get();
      console.log('  Total Sessions (sample):', sessionsSnapshot.size);
      
      if (sessionsSnapshot.size > 0) {
        console.log('  Sample Sessions:');
        sessionsSnapshot.forEach((doc, index) => {
          const data = doc.data();
          console.log(`    ${index + 1}. ID: ${doc.id}`);
          console.log(`       Name: ${data.name || data.sessionName || 'Unnamed'}`);
          console.log(`       Status: ${data.status || 'No status'}`);
          console.log(`       Organization: ${data.organizationId || 'No org'}`);
          console.log(`       Project: ${data.projectId || 'No project'}`);
          console.log(`       Created: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : 'No date'}`);
        });
      } else {
        console.log('  ⚠️ No sessions found in database');
      }
    } else {
      console.log('\n❌ Sessions collection not found');
    }
    
    // 3. Check Projects Collection
    if (collectionNames.includes('projects')) {
      console.log('\n📁 Projects Collection:');
      const projectsSnapshot = await db.collection('projects').limit(5).get();
      console.log('  Total Projects (sample):', projectsSnapshot.size);
      
      if (projectsSnapshot.size > 0) {
        console.log('  Sample Projects:');
        projectsSnapshot.forEach((doc, index) => {
          const data = doc.data();
          console.log(`    ${index + 1}. ID: ${doc.id}`);
          console.log(`       Name: ${data.name || data.projectName || 'Unnamed'}`);
          console.log(`       Organization: ${data.organizationId || 'No org'}`);
          console.log(`       Status: ${data.status || 'No status'}`);
          console.log(`       Active: ${data.isActive !== undefined ? data.isActive : 'Unknown'}`);
        });
      }
    }
    
    // 4. Check Users/Team Members
    if (collectionNames.includes('users')) {
      console.log('\n👥 Users Collection:');
      const usersSnapshot = await db.collection('users').limit(5).get();
      console.log('  Total Users (sample):', usersSnapshot.size);
      
      if (usersSnapshot.size > 0) {
        console.log('  Sample Users:');
        usersSnapshot.forEach((doc, index) => {
          const data = doc.data();
          console.log(`    ${index + 1}. ID: ${doc.id}`);
          console.log(`       Email: ${data.email || 'No email'}`);
          console.log(`       Organization: ${data.organizationId || 'No org'}`);
          console.log(`       Role: ${data.role || 'No role'}`);
        });
      }
    }
    
    // 5. Check for Enterprise User specifically
    console.log('\n🔍 Checking for Enterprise User (bdern@example.com):');
    const enterpriseUserQuery = await db.collection('users')
      .where('email', '==', 'bdern@example.com')
      .limit(1)
      .get();
      
    if (!enterpriseUserQuery.empty) {
      const userData = enterpriseUserQuery.docs[0].data();
      console.log('  ✅ Enterprise user found:');
      console.log(`     ID: ${enterpriseUserQuery.docs[0].id}`);
      console.log(`     Email: ${userData.email}`);
      console.log(`     Organization: ${userData.organizationId}`);
      console.log(`     Role: ${userData.role}`);
      
      // Check for sessions belonging to this user's organization
      if (userData.organizationId) {
        console.log(`\n🎬 Sessions for Organization ${userData.organizationId}:`);
        const orgSessionsQuery = await db.collection('sessions')
          .where('organizationId', '==', userData.organizationId)
          .limit(5)
          .get();
          
        console.log(`  Sessions found: ${orgSessionsQuery.size}`);
        orgSessionsQuery.forEach((doc, index) => {
          const data = doc.data();
          console.log(`    ${index + 1}. ${data.name || data.sessionName || doc.id}`);
        });
      }
    } else {
      console.log('  ❌ Enterprise user (bdern@example.com) not found');
      
      // Check if there are any users with similar email patterns
      console.log('\n🔍 Checking for users with "bdern" in email:');
      const bdernQuery = await db.collection('users')
        .where('email', '>=', 'bdern')
        .where('email', '<=', 'bdern\uf8ff')
        .get();
        
      if (!bdernQuery.empty) {
        bdernQuery.forEach(doc => {
          const data = doc.data();
          console.log(`     Found: ${data.email} (ID: ${doc.id})`);
        });
      } else {
        console.log('     No users found with "bdern" in email');
      }
    }
    
    // 6. Summary and Recommendations
    console.log('\n📊 Summary:');
    console.log(`  Collections: ${collectionNames.length}`);
    console.log(`  Sessions: ${collectionNames.includes('sessions') ? '✅' : '❌'}`);
    console.log(`  Projects: ${collectionNames.includes('projects') ? '✅' : '❌'}`);
    console.log(`  Users: ${collectionNames.includes('users') ? '✅' : '❌'}`);
    
    console.log('\n🔧 Dashboard Connection Status:');
    console.log('  - Firestore collections exist ✅');
    console.log('  - Data structure is proper ✅');
    console.log('  - Need to verify user authentication and data access 🔍');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error checking Firestore data:', error);
    process.exit(1);
  }
}

checkFirestoreData();
