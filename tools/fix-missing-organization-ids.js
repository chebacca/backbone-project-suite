#!/usr/bin/env node

/**
 * Fix Missing Organization IDs
 * 
 * This script adds the missing organizationId field to user and team member records
 * that are causing the sessions API to fail.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function fixMissingOrganizationIds() {
  console.log('🔧 [Fix Organization IDs] Starting fix for missing organizationId fields...');
  
  try {
    // 1. Check team members collection
    console.log('📋 [Fix Organization IDs] Checking team members...');
    const teamMembersQuery = await db.collection('teamMembers').get();
    
    let fixedTeamMembers = 0;
    const batch = db.batch();
    
    for (const doc of teamMembersQuery.docs) {
      const data = doc.data();
      const email = data.email;
      
      // Check if organizationId is missing
      if (!data.organizationId) {
        console.log(`🔍 [Fix Organization IDs] Team member ${email} missing organizationId`);
        
        // Set default organization ID based on email domain or use enterprise default
        let organizationId = 'enterprise-org-001'; // Default for enterprise users
        
        if (email && email.includes('@')) {
          const domain = email.split('@')[1];
          if (domain === 'example.com') {
            organizationId = 'enterprise-org-001';
          }
        }
        
        console.log(`✅ [Fix Organization IDs] Setting organizationId: ${organizationId} for ${email}`);
        batch.update(doc.ref, { organizationId });
        fixedTeamMembers++;
      }
    }
    
    // 2. Check users collection
    console.log('📋 [Fix Organization IDs] Checking users...');
    const usersQuery = await db.collection('users').get();
    
    let fixedUsers = 0;
    
    for (const doc of usersQuery.docs) {
      const data = doc.data();
      const email = data.email || doc.id; // doc.id might be email
      
      // Check if organizationId is missing
      if (!data.organizationId) {
        console.log(`🔍 [Fix Organization IDs] User ${email} missing organizationId`);
        
        // Set default organization ID
        let organizationId = 'enterprise-org-001';
        
        if (email && email.includes('@')) {
          const domain = email.split('@')[1];
          if (domain === 'example.com') {
            organizationId = 'enterprise-org-001';
          }
        }
        
        console.log(`✅ [Fix Organization IDs] Setting organizationId: ${organizationId} for ${email}`);
        batch.update(doc.ref, { organizationId });
        fixedUsers++;
      }
    }
    
    // 3. Commit the batch
    if (fixedTeamMembers > 0 || fixedUsers > 0) {
      console.log('💾 [Fix Organization IDs] Committing changes...');
      await batch.commit();
      console.log(`✅ [Fix Organization IDs] Fixed ${fixedTeamMembers} team members and ${fixedUsers} users`);
    } else {
      console.log('✅ [Fix Organization IDs] No fixes needed - all records have organizationId');
    }
    
    // 4. Verify the fix by checking the specific user
    console.log('🔍 [Fix Organization IDs] Verifying fix for enterprise.user@example.com...');
    
    // Check by email in team members
    const tmQuery = await db.collection('teamMembers')
      .where('email', '==', 'enterprise.user@example.com')
      .limit(1)
      .get();
    
    if (!tmQuery.empty) {
      const userData = tmQuery.docs[0].data();
      console.log('✅ [Fix Organization IDs] Team member verification:', {
        email: userData.email,
        organizationId: userData.organizationId,
        role: userData.role
      });
    }
    
    // Check by email in users
    const userDoc = await db.collection('users').doc('enterprise.user@example.com').get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('✅ [Fix Organization IDs] User verification:', {
        email: userData.email || 'enterprise.user@example.com',
        organizationId: userData.organizationId,
        role: userData.role
      });
    }
    
    console.log('🎉 [Fix Organization IDs] Fix completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Refresh your browser to clear any cached data');
    console.log('2. The sessions should now load properly');
    console.log('3. Check the console for "✅ Found org ID" instead of "⚠️ No org ID found"');
    
  } catch (error) {
    console.error('❌ [Fix Organization IDs] Error:', error);
    process.exit(1);
  }
}

// Run the fix
fixMissingOrganizationIds()
  .then(() => {
    console.log('✅ [Fix Organization IDs] Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ [Fix Organization IDs] Script failed:', error);
    process.exit(1);
  });
