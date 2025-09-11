const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function debugLoadBiblesCall() {
  console.log('🔍 DEBUGGING LOADBIBLES API CALL');
  console.log('='.repeat(60));
  
  try {
    // 1. Check what data exists in Firestore
    console.log('📚 1. CHECKING FIRESTORE DATA:');
    const biblesRef = db.collection('networkDeliveryBibles');
    
    // Check all bibles
    const allBibles = await biblesRef
      .orderBy('uploadedAt', 'desc')
      .limit(5)
      .get();
    
    console.log(`Total bibles in Firestore: ${allBibles.size}`);
    
    if (allBibles.empty) {
      console.log('❌ NO BIBLES IN FIRESTORE!');
      return;
    }
    
    allBibles.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.fileName}`);
      console.log(`   Organization: ${data.organizationId}`);
      console.log(`   Project: ${data.projectId}`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Deliverables: ${data.deliverableCount || 0}`);
    });
    
    console.log('');
    
    // 2. Check what the API endpoint should return
    console.log('📡 2. SIMULATING API ENDPOINT LOGIC:');
    
    const testUserId = '2ysTqv3pwiXyKxOeExAfEKOIh7K2';
    const testUserEmail = 'enterprise.user@enterprisemedia.com';
    const testProjectId = 'project-1757536469040-ydem1ti3c';
    
    // Simulate getUserOrganizationId
    let organizationId = null;
    
    try {
      const userDoc = await db.collection('users').doc(testUserId).get();
      if (userDoc.exists) {
        organizationId = userDoc.data()?.organizationId;
      }
    } catch (error) {
      console.log('No user in users collection');
    }
    
    if (!organizationId) {
      try {
        const teamMemberQuery = await db.collection('teamMembers')
          .where('email', '==', testUserEmail)
          .limit(1)
          .get();
        
        if (!teamMemberQuery.empty) {
          organizationId = teamMemberQuery.docs[0].data()?.organizationId;
        }
      } catch (error) {
        console.log('Error checking teamMembers');
      }
    }
    
    console.log(`User organization ID: ${organizationId}`);
    
    // Simulate the API query
    console.log('');
    console.log('🔍 3. SIMULATING API QUERY:');
    
    let apiQuery = biblesRef.where('organizationId', '==', organizationId);
    
    // Add project filter if provided
    if (testProjectId) {
      console.log(`Adding project filter: ${testProjectId}`);
      // Note: This might need a composite index
      try {
        const projectResults = await biblesRef
          .where('organizationId', '==', organizationId)
          .where('projectId', '==', testProjectId)
          .orderBy('uploadedAt', 'desc')
          .get();
        
        console.log(`Project-specific query results: ${projectResults.size} bibles`);
        
        if (projectResults.size > 0) {
          console.log('✅ Project-specific query works');
          projectResults.docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`   ${index + 1}. ${data.fileName} (${data.status})`);
          });
        } else {
          console.log('⚠️ Project-specific query returns empty - falling back to org-only');
        }
      } catch (error) {
        console.log(`❌ Project-specific query failed: ${error.message}`);
        console.log('   This might need a composite index');
      }
    }
    
    // Fallback to organization-only query
    console.log('');
    console.log('🔍 4. ORGANIZATION-ONLY QUERY:');
    
    const orgResults = await biblesRef
      .where('organizationId', '==', organizationId)
      .orderBy('uploadedAt', 'desc')
      .get();
    
    console.log(`Organization-only query results: ${orgResults.size} bibles`);
    
    if (orgResults.size > 0) {
      console.log('✅ Organization query works');
      orgResults.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. ${data.fileName} (${data.status})`);
      });
    } else {
      console.log('❌ Organization query returns empty');
    }
    
    console.log('');
    console.log('🔍 5. CHECKING FIREBASE FUNCTIONS LOGS:');
    console.log('   The Firebase Functions should be receiving the API call');
    console.log('   Check the Firebase Console logs for any errors');
    console.log('   URL: https://console.firebase.google.com/project/backbone-logic/functions/logs');
    
    console.log('');
    console.log('📊 SUMMARY:');
    console.log('='.repeat(40));
    
    if (orgResults.size > 0) {
      console.log('✅ Data exists and should be returned by API');
      console.log('🔍 If frontend is not seeing data, check:');
      console.log('   1. UniversalFirebaseInterceptor interference');
      console.log('   2. Authentication token issues');
      console.log('   3. CORS or network errors');
      console.log('   4. Frontend error handling');
    } else {
      console.log('❌ API would return empty results');
      console.log('🔧 Need to fix organization ID or data issues');
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

// Run the debug
debugLoadBiblesCall().then(() => {
  console.log('🏁 Debug complete');
  process.exit(0);
}).catch(error => {
  console.error('💥 Debug failed:', error);
  process.exit(1);
});
