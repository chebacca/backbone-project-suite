#!/usr/bin/env node

/**
 * 🔧 FIX ENTERPRISE USER SETUP
 * 
 * This script ensures the enterprise.user@enterprisemedia.com has proper
 * organization membership for the dataset routing system tests.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'backbone-logic' });
}

const db = admin.firestore();
const auth = admin.auth();

async function fixEnterpriseUserSetup() {
  try {
    console.log('🔧 Fixing Enterprise User Setup...\n');

    // 1. Get user by email
    const userRecord = await auth.getUserByEmail('enterprise.user@enterprisemedia.com');
    console.log(`🔍 Found user: ${userRecord.email} (UID: ${userRecord.uid})`);

    // 2. Check current Firestore user document
    const userDocRef = db.collection('users').doc(userRecord.uid);
    const userDoc = await userDocRef.get();

    let userData = {};
    if (userDoc.exists) {
      userData = userDoc.data();
      console.log('📋 Current user data:', JSON.stringify(userData, null, 2));
    } else {
      console.log('❌ No Firestore user document found - will create one');
    }

    // 3. Ensure user has organization membership
    const organizationId = 'enterprise_media_org';
    const updatedUserData = {
      ...userData,
      email: userRecord.email,
      name: userData.name || 'Enterprise Admin',
      organizationId: organizationId,
      role: userData.role || 'admin',
      tier: userData.tier || 'ENTERPRISE',
      isActive: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Add createdAt if it doesn't exist
      ...(userData.createdAt ? {} : { createdAt: admin.firestore.FieldValue.serverTimestamp() })
    };

    // 4. Update/create user document
    await userDocRef.set(updatedUserData, { merge: true });
    console.log(`✅ Updated user document with organizationId: ${organizationId}`);

    // 5. Check if organization exists, create if needed
    const orgDocRef = db.collection('organizations').doc(organizationId);
    const orgDoc = await orgDocRef.get();

    if (!orgDoc.exists) {
      console.log('🏢 Creating organization document...');
      const orgData = {
        id: organizationId,
        name: 'Enterprise Media Organization',
        type: 'enterprise',
        tier: 'ENTERPRISE',
        ownerId: userRecord.uid,
        members: [userRecord.uid],
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      await orgDocRef.set(orgData);
      console.log('✅ Organization created successfully');
    } else {
      console.log('✅ Organization already exists');
      
      // Ensure user is in organization members
      const orgData = orgDoc.data();
      const members = orgData.members || [];
      if (!members.includes(userRecord.uid)) {
        await orgDocRef.update({
          members: admin.firestore.FieldValue.arrayUnion(userRecord.uid),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Added user to organization members');
      }
    }

    // 6. Create test project if it doesn't exist
    const projectId = 'corporate_video_project';
    const projectDocRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectDocRef.get();

    if (!projectDoc.exists) {
      console.log('📁 Creating test project...');
      const projectData = {
        id: projectId,
        name: 'Corporate Video - Incredible Cotton Shirt',
        description: 'Test project for dataset routing system',
        organizationId: organizationId,
        ownerId: userRecord.uid,
        status: 'ACTIVE',
        type: 'video_production',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      await projectDocRef.set(projectData);
      console.log('✅ Test project created successfully');
    } else {
      console.log('✅ Test project already exists');
    }

    // 7. Verify setup
    console.log('\n🔍 VERIFICATION:');
    const finalUserDoc = await userDocRef.get();
    const finalUserData = finalUserDoc.data();
    
    console.log(`✅ User Email: ${finalUserData.email}`);
    console.log(`✅ Organization ID: ${finalUserData.organizationId}`);
    console.log(`✅ Role: ${finalUserData.role}`);
    console.log(`✅ Tier: ${finalUserData.tier}`);

    console.log('\n🎉 Enterprise user setup completed successfully!');
    console.log('The user is now ready for dataset routing system tests.\n');

  } catch (error) {
    console.error('❌ Error fixing enterprise user setup:', error);
    process.exit(1);
  }
}

// Run the fix
fixEnterpriseUserSetup();
