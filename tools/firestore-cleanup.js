#!/usr/bin/env node

/**
 * 🔥 FIRESTORE CLEANUP SCRIPT
 * 
 * This script removes hardcoded/fake sessions from the production Firestore database
 * and ensures only real, valid sessions exist.
 * 
 * Usage: node firestore-cleanup.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Firebase service account file not found. Please create firebase-service-account.json');
  console.log('💡 You can download it from Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function cleanupFirestore() {
  try {
    console.log('🚀 Starting Firestore cleanup...');
    
    // Sessions to remove
    const sessionsToRemove = [
  "907d6745-7201-44ee-bdab-a5859835a7e1",
  "fe082bc8-219a-48b5-a81f-c21d6a047b72",
  "bJmho3tOTL9aydYvAOU0",
  "yYDDfbLl6ZZOE6OkaChD",
  "cmdxwwxvj000210sm2encg0df",
  "cmdxwwxvk000310smefv88jub",
  "cmdxwwxwi000j10smwq9rovx2",
  "cmdxwwxwg000i10smkg2sidwn",
  "cmdxwwxwe000h10smp1uqtbpv",
  "cmdxwwxwd000g10smnpzsw1mn",
  "cmdxwwxwb000f10smo3o8irpd",
  "cmdxwwxw8000e10sm8vwvckmy",
  "cmdxwwxw5000d10smcuir56a5",
  "cmdxwwxw4000c10sm3e1uxw7k",
  "cmdxwwxw1000b10sm205vurbo",
  "cmdxwwxvz000a10smh5jax0nm",
  "cmdxwwxvx000910smg19sizf7",
  "cmdxwwxvu000810sm5b9p1bmz",
  "cmdxwwxvs000710smh1qmubf6",
  "cmdxwwxvr000610smlz90x4fm",
  "cmdxwwxvp000510smcfuxxryr",
  "cmdxwwxvm000410smeezcywb1",
  "cmdxwwxvh000110smeh5wadq4",
  "cmdxwwxvb000010smxmfuzvdx",
  "cmdxwwuhky000f863u6swdrq00",
  "cmdxwwuhku000e863u68ib62bf",
  "cmdxwwuhki0001863uy8f4z3zi",
  "cmdxwwuhkc0000863ub0uiof11",
  "cmdnyd2ke0001u2rw2gzpdext",
  "cmdnyc7fk0003a7ofr2m0jpip",
  "cmdny89bx0001a7ofndb3pske"
];
    
    console.log(`📋 Found ${sessionsToRemove.length} sessions to remove\n`);
    
    let removedCount = 0;
    let errorCount = 0;
    
    for (const sessionId of sessionsToRemove) {
      try {
        // Remove from sessions collection
        const sessionDoc = db.collection('sessions').doc(sessionId);
        const sessionExists = await sessionDoc.get();
        
        if (sessionExists.exists) {
          await sessionDoc.delete();
          console.log(`✅ Removed session: ${sessionId}`);
          removedCount++;
        } else {
          console.log(`ℹ️  Session not found: ${sessionId}`);
        }
        
        // Remove from sessionWorkflows collection
        const workflowQuery = await db.collection('sessionWorkflows')
          .where('sessionId', '==', sessionId)
          .get();
        
        if (!workflowQuery.empty) {
          const batch = db.batch();
          workflowQuery.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
          console.log(`✅ Removed ${workflowQuery.docs.length} workflows for session: ${sessionId}`);
        }
        
        // Remove from other related collections
        const collectionsToClean = [
          'sessionTasks',
          'sessionReviews',
          'postProductionTasks',
          'sessionAnalytics'
        ];
        
        for (const collectionName of collectionsToClean) {
          try {
            const query = await db.collection(collectionName)
              .where('sessionId', '==', sessionId)
              .get();
            
            if (!query.empty) {
              const batch = db.batch();
              query.docs.forEach(doc => {
                batch.delete(doc.ref);
              });
              await batch.commit();
              console.log(`✅ Removed ${query.docs.length} ${collectionName} for session: ${sessionId}`);
            }
          } catch (error) {
            console.log(`⚠️  Could not clean ${collectionName} for session ${sessionId}: ${error.message}`);
          }
        }
        
      } catch (error) {
        console.error(`❌ Error removing session ${sessionId}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Firestore cleanup completed!');
    console.log(`📊 Total sessions removed: ${removedCount}`);
    console.log(`❌ Errors encountered: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Failed to cleanup Firestore:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the cleanup
cleanupFirestore().catch(console.error);
