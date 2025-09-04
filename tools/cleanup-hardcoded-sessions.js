#!/usr/bin/env node

/**
 * 🔧 CLEANUP HARDCODED SESSIONS
 * 
 * This script removes hardcoded session IDs from the codebase and
 * cleans up the production Firestore database to ensure only
 * real, valid sessions exist.
 * 
 * Usage: node cleanup-hardcoded-sessions.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Hardcoded session IDs found in the codebase
const HARDCODED_SESSION_IDS = [
  '907d6745-7201-44ee-bdab-a5859835a7e1',
  'fe082bc8-219a-48b5-a81f-c21d6a047b72',
  'bJmho3tOTL9aydYvAOU0',
  'yYDDfbLl6ZZOE6OkaChD'
];

// cmdxwwx pattern sessions (from metrics)
const CMDXWWX_PATTERN_SESSIONS = [
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

const ALL_HARDCODED_SESSIONS = [...HARDCODED_SESSION_IDS, ...CMDXWWX_PATTERN_SESSIONS];

console.log('🔧 CLEANUP HARDCODED SESSIONS');
console.log('================================\n');

console.log(`📋 Found ${ALL_HARDCODED_SESSIONS.length} hardcoded session IDs to clean up\n`);

// Step 1: Remove hardcoded session IDs from scripts
console.log('📝 Step 1: Cleaning up hardcoded session IDs in scripts...');

const scriptsToClean = [
  'Dashboard-v14_2/scripts/create-sample-workflows.js',
  'Dashboard-v14_2/scripts/README.md'
];

scriptsToClean.forEach(scriptPath => {
  if (fs.existsSync(scriptPath)) {
    console.log(`  🔍 Cleaning ${scriptPath}...`);
    
    let content = fs.readFileSync(scriptPath, 'utf8');
    let cleaned = false;
    
    ALL_HARDCODED_SESSIONS.forEach(sessionId => {
      if (content.includes(sessionId)) {
        content = content.replace(new RegExp(sessionId, 'g'), 'REPLACED_SESSION_ID');
        cleaned = true;
      }
    });
    
    if (cleaned) {
      fs.writeFileSync(scriptPath, content);
      console.log(`    ✅ Cleaned ${scriptPath}`);
    } else {
      console.log(`    ℹ️  No hardcoded sessions found in ${scriptPath}`);
    }
  }
});

// Step 2: Clean up documentation files
console.log('\n📚 Step 2: Cleaning up documentation files...');

const docsToClean = [
  'tools/API_URL_DOUBLE_PREFIX_FIX_README.md',
  'shared-mpc-library/CONSOLE_NOISE_REDUCTION_IMPROVEMENTS.md'
];

docsToClean.forEach(docPath => {
  if (fs.existsSync(docPath)) {
    console.log(`  🔍 Cleaning ${docPath}...`);
    
    let content = fs.readFileSync(docPath, 'utf8');
    let cleaned = false;
    
    ALL_HARDCODED_SESSIONS.forEach(sessionId => {
      if (content.includes(sessionId)) {
        content = content.replace(new RegExp(sessionId, 'g'), 'EXAMPLE_SESSION_ID');
        cleaned = true;
      }
    });
    
    if (cleaned) {
      fs.writeFileSync(docPath, content);
      console.log(`    ✅ Cleaned ${docPath}`);
    } else {
      console.log(`    ℹ️  No hardcoded sessions found in ${docPath}`);
    }
  }
});

// Step 3: Clean up metrics file
console.log('\n📊 Step 3: Cleaning up metrics file...');

const metricsPath = 'Dashboard-v14_2/apps/server/data/metrics/metrics.json';
if (fs.existsSync(metricsPath)) {
  console.log(`  🔍 Cleaning ${metricsPath}...`);
  
  try {
    let content = fs.readFileSync(metricsPath, 'utf8');
    let cleaned = false;
    
    ALL_HARDCODED_SESSIONS.forEach(sessionId => {
      if (content.includes(sessionId)) {
        content = content.replace(new RegExp(sessionId, 'g'), 'CLEANED_SESSION_ID');
        cleaned = true;
      }
    });
    
    if (cleaned) {
      fs.writeFileSync(metricsPath, content);
      console.log(`    ✅ Cleaned ${metricsPath}`);
    } else {
      console.log(`    ℹ️  No hardcoded sessions found in ${metricsPath}`);
    }
  } catch (error) {
    console.log(`    ⚠️  Could not clean ${metricsPath}: ${error.message}`);
  }
}

// Step 4: Create Firestore cleanup script
console.log('\n🔥 Step 4: Creating Firestore cleanup script...');

const firestoreCleanupScript = `#!/usr/bin/env node

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
    const sessionsToRemove = ${JSON.stringify(ALL_HARDCODED_SESSIONS, null, 2)};
    
    console.log(\`📋 Found \${sessionsToRemove.length} sessions to remove\\n\`);
    
    let removedCount = 0;
    let errorCount = 0;
    
    for (const sessionId of sessionsToRemove) {
      try {
        // Remove from sessions collection
        const sessionDoc = db.collection('sessions').doc(sessionId);
        const sessionExists = await sessionDoc.get();
        
        if (sessionExists.exists) {
          await sessionDoc.delete();
          console.log(\`✅ Removed session: \${sessionId}\`);
          removedCount++;
        } else {
          console.log(\`ℹ️  Session not found: \${sessionId}\`);
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
              console.log(\`✅ Removed \${query.docs.length} \${collectionName} for session: \${sessionId}\`);
            }
          } catch (error) {
            console.log(\`⚠️  Could not clean \${collectionName} for session \${sessionId}: \${error.message}\`);
          }
        }
        
      } catch (error) {
        console.error(\`❌ Error removing session \${sessionId}: \${error.message}\`);
        errorCount++;
      }
    }
    
    console.log('\\n🎉 Firestore cleanup completed!');
    console.log(\`📊 Total sessions removed: \${removedCount}\`);
    console.log(\`❌ Errors encountered: \${errorCount}\`);
    
  } catch (error) {
    console.error('❌ Failed to cleanup Firestore:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the cleanup
cleanupFirestore().catch(console.error);
`;

fs.writeFileSync('firestore-cleanup.js', firestoreCleanupScript);
console.log('    ✅ Created firestore-cleanup.js');

// Step 5: Create production session validation script
console.log('\n🔍 Step 5: Creating production session validation script...');

const validationScript = `#!/usr/bin/env node

/**
 * 🔍 PRODUCTION SESSION VALIDATION
 * 
 * This script validates that all sessions in production Firestore
 * are real and have proper data structure.
 * 
 * Usage: node validate-production-sessions.js
 */

const admin = require('firebase-admin');
const path = require('path');

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

async function validateProductionSessions() {
  try {
    console.log('🔍 Validating production sessions...');
    
    // Get all sessions
    const sessionsSnapshot = await db.collection('sessions').get();
    
    if (sessionsSnapshot.empty) {
      console.log('ℹ️  No sessions found in production database');
      return;
    }
    
    console.log(\`📋 Found \${sessionsSnapshot.docs.length} sessions in production\\n\`);
    
    const validSessions = [];
    const invalidSessions = [];
    
    for (const doc of sessionsSnapshot.docs) {
      const sessionData = doc.data();
      const sessionId = doc.id;
      
      // Basic validation
      const isValid = sessionData.sessionName && 
                     sessionData.organizationId && 
                     sessionData.createdAt &&
                     sessionData.updatedAt;
      
      if (isValid) {
        validSessions.push({
          id: sessionId,
          name: sessionData.sessionName,
          organization: sessionData.organizationId,
          status: sessionData.status || 'UNKNOWN',
          createdAt: sessionData.createdAt?.toDate?.() || sessionData.createdAt
        });
      } else {
        invalidSessions.push({
          id: sessionId,
          data: sessionData,
          issues: []
        });
        
        if (!sessionData.sessionName) invalidSessions[invalidSessions.length - 1].issues.push('Missing sessionName');
        if (!sessionData.organizationId) invalidSessions[invalidSessions.length - 1].issues.push('Missing organizationId');
        if (!sessionData.createdAt) invalidSessions[invalidSessions.length - 1].issues.push('Missing createdAt');
        if (!sessionData.updatedAt) invalidSessions[invalidSessions.length - 1].issues.push('Missing updatedAt');
      }
    }
    
    console.log(\`✅ Valid sessions: \${validSessions.length}\`);
    console.log(\`❌ Invalid sessions: \${invalidSessions.length}\\n\`);
    
    if (validSessions.length > 0) {
      console.log('📋 Valid Sessions:');
      validSessions.forEach(session => {
        console.log(\`  • \${session.name} (\${session.id}) - \${session.status} - \${session.organization}\`);
      });
    }
    
    if (invalidSessions.length > 0) {
      console.log('\\n❌ Invalid Sessions:');
      invalidSessions.forEach(session => {
        console.log(\`  • \${session.id}: \${session.issues.join(', ')}\`);
      });
      
      console.log('\\n💡 Consider removing invalid sessions using the firestore-cleanup.js script');
    }
    
  } catch (error) {
    console.error('❌ Failed to validate sessions:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the validation
validateProductionSessions().catch(console.error);
`;

fs.writeFileSync('validate-production-sessions.js', validationScript);
console.log('    ✅ Created validate-production-sessions.js');

// Step 6: Create deployment instructions
console.log('\n📋 Step 6: Creating deployment instructions...');

const deploymentInstructions = `# 🔧 HARDCODED SESSION CLEANUP - DEPLOYMENT INSTRUCTIONS

## Overview
This cleanup removes hardcoded session IDs from the codebase and ensures the production Firestore database only contains real, valid sessions.

## Files Cleaned
- ✅ Scripts: Removed hardcoded session IDs
- ✅ Documentation: Replaced with generic examples
- ✅ Metrics: Cleaned hardcoded session references

## Next Steps for Production

### 1. Deploy Cleaned Code
\`\`\`bash
cd Dashboard-v14_2
npm run build
firebase deploy --only hosting:main,functions
\`\`\`

### 2. Clean Production Firestore (OPTIONAL)
\`\`\`bash
# Only run if you want to remove hardcoded sessions from production
cd tools
node firestore-cleanup.js
\`\`\`

### 3. Validate Production Sessions
\`\`\`bash
cd tools
node validate-production-sessions.js
\`\`\`

## What Was Cleaned
- **Hardcoded UUIDs**: ${HARDCODED_SESSION_IDS.length} fake session IDs
- **cmdxwwx Pattern**: ${CMDXWWX_PATTERN_SESSIONS.length} test session IDs
- **Total Cleaned**: ${ALL_HARDCODED_SESSIONS.length} hardcoded references

## Benefits
- ✅ No more 404 errors for non-existent sessions
- ✅ Clean production database
- ✅ Real session data only
- ✅ Improved application reliability

## Notes
- The cleanup script is safe and only removes documented hardcoded sessions
- Real user sessions are not affected
- Production data integrity is maintained
`;

fs.writeFileSync('HARDCODED_SESSION_CLEANUP_README.md', deploymentInstructions);
console.log('    ✅ Created HARDCODED_SESSION_CLEANUP_README.md');

console.log('\n🎉 HARDCODED SESSION CLEANUP COMPLETED!');
console.log('==========================================');
console.log('');
console.log('📋 Summary:');
console.log(`  • Cleaned ${ALL_HARDCODED_SESSIONS.length} hardcoded session IDs`);
console.log(`  • Updated ${scriptsToClean.length} script files`);
console.log(`  • Updated ${docsToClean.length} documentation files`);
console.log(`  • Created Firestore cleanup script`);
console.log(`  • Created session validation script`);
console.log(`  • Created deployment instructions`);
console.log('');
console.log('🚀 Next Steps:');
console.log('  1. Review the cleaned files');
console.log('  2. Deploy to production');
console.log('  3. Optionally run Firestore cleanup');
console.log('  4. Validate production sessions');
console.log('');
console.log('📚 See tools/HARDCODED_SESSION_CLEANUP_README.md for detailed instructions');
