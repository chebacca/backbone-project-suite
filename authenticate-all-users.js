#!/usr/bin/env node

/**
 * Authenticate All Users Script
 * 
 * This script takes all users from both the Firestore users collection and teamMembers collection
 * and creates corresponding Firebase Auth users so they can sign into the app.
 * 
 * Features:
 * - Fetches all users from Firestore users collection
 * - Fetches all team members from Firestore teamMembers collection
 * - Handles duplicate users between collections (prioritizes users collection)
 * - Checks existing Firebase Auth users to avoid duplicates
 * - Creates Firebase Auth users for users not already authenticated
 * - Updates Firestore user documents with firebaseUid in both collections
 * - Supports dry-run mode for safe testing
 * - Comprehensive logging and error handling
 * 
 * Usage:
 *   node authenticate-all-users.js [--dry-run] [--password=PASSWORD] [--collections=users,teamMembers]
 * 
 * Examples:
 *   node authenticate-all-users.js --dry-run
 *   node authenticate-all-users.js --password=DefaultPassword123!
 *   node authenticate-all-users.js --collections=users,teamMembers --dry-run
 */

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const passwordArg = args.find(arg => arg.startsWith('--password='));
const defaultPassword = passwordArg ? passwordArg.split('=')[1] : 'DefaultPassword123!';
const collectionsArg = args.find(arg => arg.startsWith('--collections='));
const targetCollections = collectionsArg ? collectionsArg.split('=')[1].split(',') : ['users', 'teamMembers'];

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = getFirestore();
const auth = getAuth();

// Statistics tracking
const stats = {
  total: 0,
  users: 0,
  teamMembers: 0,
  alreadyAuthenticated: 0,
  created: 0,
  updated: 0,
  errors: 0,
  skipped: 0,
  duplicates: 0
};

/**
 * Get all users from Firestore users collection
 */
async function getAllFirestoreUsers() {
  try {
    console.log('📊 Fetching all users from Firestore users collection...');
    
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        email: userData.email,
        name: userData.name || userData.displayName || '',
        role: userData.role || 'USER',
        organizationId: userData.organizationId,
        firebaseUid: userData.firebaseUid,
        isEmailVerified: userData.isEmailVerified || false,
        collection: 'users',
        ...userData
      });
    });
    
    console.log(`✅ Found ${users.length} users in Firestore users collection`);
    return users;
  } catch (error) {
    console.error('❌ Failed to fetch Firestore users:', error.message);
    throw error;
  }
}

/**
 * Get all team members from Firestore teamMembers collection
 */
async function getAllTeamMembers() {
  try {
    console.log('📊 Fetching all team members from Firestore teamMembers collection...');
    
    const teamMembersSnapshot = await db.collection('teamMembers').get();
    const teamMembers = [];
    
    teamMembersSnapshot.forEach(doc => {
      const memberData = doc.data();
      
      // Skip team members without email
      if (!memberData.email || memberData.email === 'undefined') {
        console.log(`⚠️  Skipping team member without valid email: ${doc.id}`);
        return;
      }
      
      teamMembers.push({
        id: doc.id,
        email: memberData.email,
        name: memberData.name || `${memberData.firstName || ''} ${memberData.lastName || ''}`.trim(),
        firstName: memberData.firstName,
        lastName: memberData.lastName,
        role: memberData.role || 'TEAM_MEMBER',
        organizationId: memberData.organizationId || memberData.orgId,
        firebaseUid: memberData.firebaseUid,
        isEmailVerified: memberData.isEmailVerified || false,
        collection: 'teamMembers',
        ...memberData
      });
    });
    
    console.log(`✅ Found ${teamMembers.length} team members in Firestore teamMembers collection`);
    return teamMembers;
  } catch (error) {
    console.error('❌ Failed to fetch Firestore team members:', error.message);
    throw error;
  }
}

/**
 * Get all users from specified collections, handling duplicates
 */
async function getAllUsersFromCollections() {
  const allUsers = [];
  const emailMap = new Map(); // Track emails to handle duplicates
  
  // Fetch from users collection if requested
  if (targetCollections.includes('users')) {
    const users = await getAllFirestoreUsers();
    users.forEach(user => {
      emailMap.set(user.email, user);
      allUsers.push(user);
    });
    stats.users = users.length;
  }
  
  // Fetch from teamMembers collection if requested
  if (targetCollections.includes('teamMembers')) {
    const teamMembers = await getAllTeamMembers();
    teamMembers.forEach(member => {
      if (emailMap.has(member.email)) {
        // User exists in both collections, prioritize users collection
        console.log(`⚠️  Duplicate user found: ${member.email} (exists in both users and teamMembers collections)`);
        stats.duplicates++;
      } else {
        emailMap.set(member.email, member);
        allUsers.push(member);
      }
    });
    stats.teamMembers = teamMembers.length;
  }
  
  return allUsers;
}

/**
 * Check if user already exists in Firebase Auth
 */
async function checkFirebaseAuthUser(email) {
  try {
    const userRecord = await auth.getUserByEmail(email);
    return {
      exists: true,
      uid: userRecord.uid,
      displayName: userRecord.displayName,
      emailVerified: userRecord.emailVerified,
      disabled: userRecord.disabled
    };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return { exists: false };
    }
    throw error;
  }
}

/**
 * Create Firebase Auth user
 */
async function createFirebaseAuthUser(user, password) {
  try {
    const userRecord = await auth.createUser({
      email: user.email,
      password: password,
      displayName: user.name || user.email.split('@')[0],
      emailVerified: user.isEmailVerified || true,
      disabled: false
    });
    
    console.log(`   ✅ Created Firebase Auth user: ${user.email} (UID: ${userRecord.uid})`);
    return userRecord;
  } catch (error) {
    console.error(`   ❌ Failed to create Firebase Auth user for ${user.email}:`, error.message);
    throw error;
  }
}

/**
 * Update Firebase Auth user
 */
async function updateFirebaseAuthUser(uid, user, password) {
  try {
    await auth.updateUser(uid, {
      password: password,
      displayName: user.name || user.email.split('@')[0],
      emailVerified: user.isEmailVerified || true,
      disabled: false
    });
    
    console.log(`   ✅ Updated Firebase Auth user: ${user.email} (UID: ${uid})`);
    return { uid };
  } catch (error) {
    console.error(`   ❌ Failed to update Firebase Auth user for ${user.email}:`, error.message);
    throw error;
  }
}

/**
 * Update Firestore user document with firebaseUid
 */
async function updateFirestoreUser(userId, firebaseUid, collection = 'users') {
  try {
    await db.collection(collection).doc(userId).update({
      firebaseUid: firebaseUid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`   ✅ Updated Firestore ${collection} document with firebaseUid: ${firebaseUid}`);
  } catch (error) {
    console.error(`   ❌ Failed to update Firestore ${collection} document:`, error.message);
    throw error;
  }
}

/**
 * Process a single user
 */
async function processUser(user, password) {
  console.log(`\n👤 Processing user: ${user.email}`);
  console.log(`   📧 Email: ${user.email}`);
  console.log(`   👤 Name: ${user.name || 'Not provided'}`);
  console.log(`   🏢 Role: ${user.role}`);
  console.log(`   🏢 Organization: ${user.organizationId || 'Not assigned'}`);
  console.log(`   📁 Collection: ${user.collection}`);
  console.log(`   🔑 Current firebaseUid: ${user.firebaseUid || 'None'}`);
  
  try {
    // Check if user already exists in Firebase Auth
    const authUser = await checkFirebaseAuthUser(user.email);
    
    if (authUser.exists) {
      console.log(`   ✅ User already exists in Firebase Auth (UID: ${authUser.uid})`);
      
      // Check if Firestore user has the correct firebaseUid
      if (user.firebaseUid !== authUser.uid) {
        console.log(`   🔄 Updating Firestore ${user.collection} user with correct firebaseUid...`);
        
        if (!isDryRun) {
          await updateFirestoreUser(user.id, authUser.uid, user.collection);
          stats.updated++;
        } else {
          console.log(`   🔍 [DRY RUN] Would update Firestore ${user.collection} user with firebaseUid: ${authUser.uid}`);
        }
      } else {
        console.log(`   ✅ Firestore ${user.collection} user already has correct firebaseUid`);
        stats.alreadyAuthenticated++;
      }
      
      // Update password and display name for existing user
      if (!isDryRun) {
        await updateFirebaseAuthUser(authUser.uid, user, password);
      } else {
        console.log(`   🔍 [DRY RUN] Would update Firebase Auth user password and display name`);
      }
      
    } else {
      console.log(`   🆕 User does not exist in Firebase Auth, creating...`);
      
      if (!isDryRun) {
        const userRecord = await createFirebaseAuthUser(user, password);
        
        // Update Firestore user with firebaseUid
        await updateFirestoreUser(user.id, userRecord.uid, user.collection);
        
        stats.created++;
      } else {
        console.log(`   🔍 [DRY RUN] Would create Firebase Auth user and update Firestore ${user.collection}`);
      }
    }
    
  } catch (error) {
    console.error(`   ❌ Error processing user ${user.email}:`, error.message);
    stats.errors++;
  }
}

/**
 * Main function
 */
async function authenticateAllUsers() {
  console.log('🔐 Authenticate All Users Script');
  console.log('================================');
  console.log(`📋 Mode: ${isDryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (changes will be applied)'}`);
  console.log(`🔑 Default password: ${defaultPassword}`);
  console.log(`📁 Target collections: ${targetCollections.join(', ')}`);
  console.log('');
  
  try {
    // Get all users from specified collections
    const users = await getAllUsersFromCollections();
    stats.total = users.length;
    
    if (users.length === 0) {
      console.log('⚠️  No users found in specified collections');
      return;
    }
    
    console.log(`\n🚀 Processing ${users.length} users from ${targetCollections.join(' and ')} collections...`);
    console.log('');
    
    // Process each user
    for (const user of users) {
      if (!user.email) {
        console.log(`⚠️  Skipping user without email: ${user.id}`);
        stats.skipped++;
        continue;
      }
      
      await processUser(user, defaultPassword);
    }
    
    // Print summary
    console.log('\n🎉 Authentication process complete!');
    console.log('===================================');
    console.log(`📊 Total users processed: ${stats.total}`);
    console.log(`   📁 From users collection: ${stats.users}`);
    console.log(`   👥 From teamMembers collection: ${stats.teamMembers}`);
    console.log(`   ⚠️  Duplicates found: ${stats.duplicates}`);
    console.log(`✅ Already authenticated: ${stats.alreadyAuthenticated}`);
    console.log(`🆕 New users created: ${stats.created}`);
    console.log(`🔄 Users updated: ${stats.updated}`);
    console.log(`⚠️  Users skipped: ${stats.skipped}`);
    console.log(`❌ Errors: ${stats.errors}`);
    
    if (isDryRun) {
      console.log('\n🔍 This was a DRY RUN - no changes were made');
      console.log('   Run without --dry-run to apply changes');
    } else {
      console.log('\n✅ All changes have been applied');
    }
    
    console.log(`\n🔑 All users can now login with password: ${defaultPassword}`);
    console.log('\n📋 Example login credentials:');
    users.slice(0, 5).forEach(user => {
      console.log(`   • ${user.email} (Password: ${defaultPassword}) [${user.collection}]`);
    });
    if (users.length > 5) {
      console.log(`   • ... and ${users.length - 5} more users`);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
authenticateAllUsers()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
