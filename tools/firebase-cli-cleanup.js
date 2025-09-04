#!/usr/bin/env node

/**
 * 🔥 FIREBASE CLI CLEANUP SCRIPT
 * 
 * This script uses Firebase CLI authentication to remove hardcoded sessions
 * from the production Firestore database.
 * 
 * Usage: node firebase-cli-cleanup.js
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Hardcoded session IDs to remove
const HARDCODED_SESSIONS = [
  '907d6745-7201-44ee-bdab-a5859835a7e1',
  'fe082bc8-219a-48b5-a81f-c21d6a047b72',
  'bJmho3tOTL9aydYvAOU0',
  'yYDDfbLl6ZZOE6OkaChD',
  'e8559b4f-9524-41f7-95a7-ebd4098bb0d3', // New one from error logs
  'cmdxwwxvj000210sm2encg0df',
  'cmdxwwxvk000310smefv88jub',
  'cmdxwwxwi000j10smwq9rovx2',
  'cmdxwwxwg000i10smkg2sidwn',
  'cmdxwwxwe000h10smp1uqtbpv',
  'cmdxwwxwd000g10smnpzsw1mn',
  'cmdxwwxwb000f10smo3o8irpd',
  'cmdxwwxw8000e10sm8vwvckmy',
  'cmdxwwxw5000d10smcuir56a5',
  'cmdxwwxw4000c10sm3e1uxw7k',
  'cmdxwwxw1000b10sm205vurbo',
  'cmdxwwxvz000a10smh5jax0nm',
  'cmdxwwxvx000910smg19sizf7',
  'cmdxwwxvu000810sm5b9p1bmz',
  'cmdxwwxvs000710smh1qmubf6',
  'cmdxwwxvr000610smlz90x4fm',
  'cmdxwwxvp000510smcfuxxryr',
  'cmdxwwxvm000410smeezcywb1',
  'cmdxwwxvh000110smeh5wadq4',
  'cmdxwwxvb000010smxmfuzvdx',
  'cmdxwwuhky000f863u6swdrq00',
  'cmdxwwuhku000e863u68ib62bf',
  'cmdxwwuhki0001863uy8f4z3zi',
  'cmdxwwuhkc0000863ub0uiof11',
  'cmdnyd2ke0001u2rw2gzpdext',
  'cmdnyc7fk0003a7ofr2m0jpip',
  'cmdny89bx0001a7ofndb3pske'
];

console.log('🔥 FIREBASE CLI CLEANUP SCRIPT');
console.log('===============================\n');

console.log(`📋 Found ${HARDCODED_SESSIONS.length} hardcoded session IDs to remove\n`);

// Check if Firebase CLI is available
try {
  execSync('firebase --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Firebase CLI not found. Please install: npm install -g firebase-tools');
  process.exit(1);
}

// Check if authenticated
try {
  execSync('firebase projects:list', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Not authenticated with Firebase. Please run: firebase login');
  process.exit(1);
}

console.log('✅ Firebase CLI authentication verified\n');

// Create a temporary script for Firestore operations
const firestoreScript = `
const admin = require('firebase-admin');

// Initialize with application default credentials
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function cleanupSessions() {
  const sessionsToRemove = ${JSON.stringify(HARDCODED_SESSIONS, null, 2)};
  
  console.log('🚀 Starting Firestore cleanup...');
  console.log(\`📋 Removing \${sessionsToRemove.length} hardcoded sessions\\n\`);
  
  let removedCount = 0;
  let notFoundCount = 0;
  
  for (const sessionId of sessionsToRemove) {
    try {
      // Check if session exists in sessions collection
      const sessionDoc = db.collection('sessions').doc(sessionId);
      const sessionSnapshot = await sessionDoc.get();
      
      if (sessionSnapshot.exists) {
        await sessionDoc.delete();
        console.log(\`✅ Removed session: \${sessionId}\`);
        removedCount++;
      } else {
        console.log(\`ℹ️  Session not found: \${sessionId}\`);
        notFoundCount++;
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
        console.log(\`✅ Removed \${workflowQuery.docs.length} workflows for session: \${sessionId}\`);
      }
      
      // Remove from other collections
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
            console.log(\`✅ Removed \${query.docs.length} \${collectionName} for session: \${sessionId}\`);
          }
        } catch (error) {
          // Collection might not exist, continue
        }
      }
      
    } catch (error) {
      console.error(\`❌ Error processing session \${sessionId}: \${error.message}\`);
    }
  }
  
  console.log('\\n🎉 Firestore cleanup completed!');
  console.log(\`📊 Sessions removed: \${removedCount}\`);
  console.log(\`📊 Sessions not found: \${notFoundCount}\`);
  
  process.exit(0);
}

cleanupSessions().catch(error => {
  console.error('❌ Cleanup failed:', error);
  process.exit(1);
});
`;

// Write the temporary script with .cjs extension for CommonJS
fs.writeFileSync('temp-firestore-cleanup.cjs', firestoreScript);

console.log('🔧 Running Firestore cleanup...\n');

try {
  // Run the cleanup script with Firebase application default credentials
  execSync('node temp-firestore-cleanup.cjs', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  // Clean up temporary file
  fs.unlinkSync('temp-firestore-cleanup.cjs');
  
} catch (error) {
  console.error('❌ Cleanup failed:', error.message);
  
  // Clean up temporary file
  if (fs.existsSync('temp-firestore-cleanup.cjs')) {
    fs.unlinkSync('temp-firestore-cleanup.cjs');
  }
  
  process.exit(1);
}
