#!/usr/bin/env node

/**
 * 🧹 Complete Cleanup and Seed Script for BACKBONE v14.2
 * 
 * This script performs a complete cleanup of all Firestore collections
 * except for the chebacca@gmail.com admin user, then runs the enterprise
 * mock data generation script.
 */

const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const { execSync } = require('child_process');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: 'backbone-logic',
      credential: admin.credential.applicationDefault()
    });
  } catch (error) {
    console.log('⚠️  Firebase Admin SDK initialization failed:', error.message);
    admin.initializeApp({
      projectId: 'backbone-logic'
    });
  }
}

const db = admin.firestore();
const auth = getAuth();

// Collections to clean up (excluding system collections)
const COLLECTIONS_TO_CLEAN = [
  'organizations',
  'users',
  'teamMembers',
  'team_members',
  'projects',
  'projectAssignments',
  'clients',
  'sessions',
  'workflows',
  'assets',
  'inventoryItems',
  'networks',
  'networkIPAssignments',
  'mediaFiles',
  'aiAgents',
  'agents',
  'messageSessions',
  'messages',
  'subscriptions',
  'licenses',
  'payments',
  'timecards',
  'user_timecards',
  'timecard_entries',
  'timecard_templates',
  'pbm_schedules',
  'datasets',
  'datasetAssignments',
  'roles',
  'schemas',
  'notifications',
  'auditLogs',
  'reports',
  'usage_analytics',
  'webhook_events',
  'networkDeliveryBibles',
  'privacy_consents',
  'orgMembers',
  'schema_fields'
];

async function completeCleanup() {
  console.log('🧹 Starting Complete Cleanup of Firestore Collections');
  console.log('====================================================\n');

  let totalDeleted = 0;

  // Clean up Firestore collections
  for (const collectionName of COLLECTIONS_TO_CLEAN) {
    try {
      console.log(`🗑️  Cleaning collection: ${collectionName}`);
      
      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      if (snapshot.docs.length > 0) {
        await batch.commit();
        console.log(`   ✅ Deleted ${snapshot.docs.length} documents from ${collectionName}`);
        totalDeleted += snapshot.docs.length;
      } else {
        console.log(`   ℹ️  No documents found in ${collectionName}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Error cleaning ${collectionName}: ${error.message}`);
    }
  }

  // Clean up Firebase Auth users (except chebacca@gmail.com)
  console.log('\n🔐 Cleaning up Firebase Auth users...');
  try {
    const listUsersResult = await auth.listUsers();
    const batch = db.batch();
    let authUsersDeleted = 0;

    for (const userRecord of listUsersResult.users) {
      if (userRecord.email !== 'chebacca@gmail.com') {
        try {
          await auth.deleteUser(userRecord.uid);
          console.log(`   🗑️  Deleted Firebase Auth user: ${userRecord.email}`);
          authUsersDeleted++;
        } catch (error) {
          console.log(`   ⚠️  Error deleting user ${userRecord.email}: ${error.message}`);
        }
      } else {
        console.log(`   ✅ Preserved admin user: ${userRecord.email}`);
      }
    }

    console.log(`✅ Deleted ${authUsersDeleted} Firebase Auth users (preserved chebacca@gmail.com)`);
  } catch (error) {
    console.log(`⚠️  Error cleaning Firebase Auth users: ${error.message}`);
  }

  console.log(`\n🎉 Complete cleanup finished!`);
  console.log(`   📊 Total Firestore documents deleted: ${totalDeleted}`);
  console.log(`   🔐 Firebase Auth users cleaned (preserved chebacca@gmail.com)`);
}

async function runEnterpriseSeeding() {
  console.log('\n🚀 Starting Enterprise Mock Data Generation');
  console.log('==========================================\n');

  try {
    // Run the enterprise mock data script with authentication
    execSync('node generate-enterprise-mock-data.js --authenticate', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('\n✅ Enterprise seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Error running enterprise seeding:', error.message);
    throw error;
  }
}

async function main() {
  try {
    // Step 1: Complete cleanup
    await completeCleanup();
    
    // Step 2: Run enterprise seeding
    await runEnterpriseSeeding();
    
    console.log('\n🎉 COMPLETE CLEANUP AND SEEDING FINISHED!');
    console.log('==========================================');
    console.log('✅ All collections cleaned (preserved chebacca@gmail.com)');
    console.log('✅ Enterprise mock data generated');
    console.log('✅ Firebase Auth users created for login capability');
    console.log('✅ Ready for Dashboard and Licensing projects');
    
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
