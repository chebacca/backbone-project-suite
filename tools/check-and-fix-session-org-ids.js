#!/usr/bin/env node

/**
 * Check and Fix Session Organization IDs
 * 
 * This script checks if sessions in Firestore have organizationId fields
 * and adds them if they're missing.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function checkAndFixSessionOrgIds() {
  console.log('🔧 [Session Org IDs] Starting check for missing organizationId fields in sessions...');
  
  try {
    // 1. Check sessions collection
    console.log('📋 [Session Org IDs] Checking sessions collection...');
    const sessionsQuery = await db.collection('sessions').get();
    
    console.log(`📊 [Session Org IDs] Found ${sessionsQuery.docs.length} sessions total`);
    
    let sessionsWithoutOrgId = 0;
    let sessionsWithOrgId = 0;
    const batch = db.batch();
    
    for (const doc of sessionsQuery.docs) {
      const data = doc.data();
      const sessionId = doc.id;
      
      if (!data.organizationId) {
        console.log(`🔍 [Session Org IDs] Session ${sessionId} missing organizationId`);
        console.log(`   - Session name: ${data.name || 'Unnamed'}`);
        console.log(`   - Created by: ${data.createdBy || 'Unknown'}`);
        console.log(`   - Created at: ${data.createdAt?.toDate?.() || data.createdAt || 'Unknown'}`);
        
        // Set default organization ID - you can customize this logic
        let organizationId = 'enterprise-org-001'; // Default for enterprise users
        
        // Try to determine org from createdBy user
        if (data.createdBy) {
          try {
            const userDoc = await db.collection('users').doc(data.createdBy).get();
            if (userDoc.exists && userDoc.data().organizationId) {
              organizationId = userDoc.data().organizationId;
              console.log(`   - Found org ID from user: ${organizationId}`);
            } else {
              // Try team members
              const tmQuery = await db.collection('teamMembers').where('id', '==', data.createdBy).limit(1).get();
              if (!tmQuery.empty && tmQuery.docs[0].data().organizationId) {
                organizationId = tmQuery.docs[0].data().organizationId;
                console.log(`   - Found org ID from team member: ${organizationId}`);
              }
            }
          } catch (error) {
            console.warn(`   - Could not lookup user ${data.createdBy}:`, error.message);
          }
        }
        
        console.log(`✅ [Session Org IDs] Setting organizationId: ${organizationId} for session ${sessionId}`);
        batch.update(doc.ref, { organizationId });
        sessionsWithoutOrgId++;
      } else {
        sessionsWithOrgId++;
        console.log(`✅ [Session Org IDs] Session ${sessionId} already has organizationId: ${data.organizationId}`);
      }
    }
    
    // 2. Commit the batch if there are changes
    if (sessionsWithoutOrgId > 0) {
      console.log('💾 [Session Org IDs] Committing changes...');
      await batch.commit();
      console.log(`✅ [Session Org IDs] Fixed ${sessionsWithoutOrgId} sessions`);
    } else {
      console.log('✅ [Session Org IDs] No fixes needed - all sessions have organizationId');
    }
    
    // 3. Summary
    console.log('');
    console.log('📊 [Session Org IDs] Summary:');
    console.log(`   - Total sessions: ${sessionsQuery.docs.length}`);
    console.log(`   - Sessions with organizationId: ${sessionsWithOrgId}`);
    console.log(`   - Sessions fixed: ${sessionsWithoutOrgId}`);
    
    // 4. Test query with organization ID
    console.log('');
    console.log('🔍 [Session Org IDs] Testing query with organizationId...');
    const testQuery = await db.collection('sessions')
      .where('organizationId', '==', 'enterprise-org-001')
      .get();
    
    console.log(`✅ [Session Org IDs] Query test: Found ${testQuery.docs.length} sessions for enterprise-org-001`);
    
    if (testQuery.docs.length > 0) {
      console.log('   Sample sessions:');
      testQuery.docs.slice(0, 3).forEach(doc => {
        const data = doc.data();
        console.log(`   - ${doc.id}: ${data.name || 'Unnamed'} (${data.status || 'No status'})`);
      });
    }
    
    console.log('');
    console.log('🎉 [Session Org IDs] Fix completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Refresh your browser to clear any cached data');
    console.log('2. The sessions should now load properly');
    console.log('3. Check the console for "✅ Found org ID" instead of "⚠️ No org ID found"');
    
  } catch (error) {
    console.error('❌ [Session Org IDs] Error:', error);
    process.exit(1);
  }
}

// Run the fix
checkAndFixSessionOrgIds()
  .then(() => {
    console.log('✅ [Session Org IDs] Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ [Session Org IDs] Script failed:', error);
    process.exit(1);
  });
