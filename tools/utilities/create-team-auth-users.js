#!/usr/bin/env node

/**
 * Create Firebase Auth users for all team members in Firestore
 */

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = getFirestore();
const auth = getAuth();

async function createAuthForTeamMembers() {
  console.log('🔐 Creating Firebase Auth users for all team members...');
  
  try {
    // Get all team members from Firestore
    const teamMembersSnapshot = await db.collection('teamMembers').get();
    console.log(`📊 Found ${teamMembersSnapshot.size} team members in Firestore`);
    
    let created = 0;
    let existing = 0;
    let errors = 0;
    
    for (const doc of teamMembersSnapshot.docs) {
      const teamMember = doc.data();
      const email = teamMember.email;
      const name = teamMember.name || `${teamMember.firstName || ''} ${teamMember.lastName || ''}`.trim();
      
      if (!email) {
        console.log(`⚠️  Skipping team member without email: ${name}`);
        continue;
      }
      
      try {
        // Check if user already exists
        try {
          await auth.getUserByEmail(email);
          console.log(`✅ Auth user already exists: ${email}`);
          existing++;
          continue;
        } catch (error) {
          // User doesn't exist, create them
        }
        
        // Create Firebase Auth user
        const userRecord = await auth.createUser({
          uid: teamMember.uid || undefined,
          email: email,
          password: 'Enterprise123!', // Default password for all team members
          displayName: name,
          emailVerified: true
        });
        
        console.log(`✅ Created auth user: ${email} (${name})`);
        created++;
        
      } catch (error) {
        console.log(`❌ Error creating user ${email}: ${error.message}`);
        errors++;
      }
    }
    
    console.log(`\n🎉 Team member auth creation complete!`);
    console.log(`✅ Successfully created: ${created} users`);
    console.log(`✅ Already existed: ${existing} users`);
    console.log(`❌ Errors: ${errors} users`);
    console.log(`📊 Total processed: ${created + existing + errors} users`);
    console.log(`\n🔑 All team members can login with password: Enterprise123!`);
    
    // List some example credentials
    console.log(`\n📋 Example Team Member Credentials:`);
    console.log(`   • enterprise.user@enterprisemedia.com (Password: Enterprise123!)`);
    console.log(`   • Any @enterprisemedia.com email (Password: Enterprise123!)`);
    console.log(`   • chebacca@gmail.com (Password: admin1234)`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createAuthForTeamMembers().then(() => process.exit(0)).catch(console.error);
