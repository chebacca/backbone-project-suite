#!/usr/bin/env node

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
    
    console.log(`📋 Found ${sessionsSnapshot.docs.length} sessions in production\n`);
    
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
    
    console.log(`✅ Valid sessions: ${validSessions.length}`);
    console.log(`❌ Invalid sessions: ${invalidSessions.length}\n`);
    
    if (validSessions.length > 0) {
      console.log('📋 Valid Sessions:');
      validSessions.forEach(session => {
        console.log(`  • ${session.name} (${session.id}) - ${session.status} - ${session.organization}`);
      });
    }
    
    if (invalidSessions.length > 0) {
      console.log('\n❌ Invalid Sessions:');
      invalidSessions.forEach(session => {
        console.log(`  • ${session.id}: ${session.issues.join(', ')}`);
      });
      
      console.log('\n💡 Consider removing invalid sessions using the firestore-cleanup.js script');
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
