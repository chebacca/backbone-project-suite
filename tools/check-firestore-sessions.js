#!/usr/bin/env node

/**
 * 🔍 CHECK FIRESTORE SESSIONS
 * 
 * This script checks the production Firestore database for sessions
 * and identifies any problematic or hardcoded session IDs.
 * 
 * Usage: node check-firestore-sessions.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin with application default credentials
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function checkFirestoreSessions() {
  try {
    console.log('🔍 CHECKING FIRESTORE SESSIONS');
    console.log('================================\n');
    
    // Check sessions collection
    console.log('📋 Checking sessions collection...');
    const sessionsSnapshot = await db.collection('sessions').get();
    
    let sessions = [];
    let suspiciousSessions = [];
    let invalidSessions = [];
    let orphanedWorkflows = [];
    
    if (sessionsSnapshot.empty) {
      console.log('ℹ️  No sessions found in database');
    } else {
      console.log(`📊 Found ${sessionsSnapshot.docs.length} sessions in database\n`);
      
      sessionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          name: data.sessionName || data.name || 'No Name',
          organization: data.organizationId || 'No Org',
          status: data.status || 'Unknown',
          createdAt: data.createdAt?.toDate?.() || data.createdAt || 'Unknown',
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || 'Unknown'
        });
      });
      
      // Display sessions
      sessions.forEach((session, index) => {
        console.log(`${index + 1}. ${session.name}`);
        console.log(`   ID: ${session.id}`);
        console.log(`   Organization: ${session.organization}`);
        console.log(`   Status: ${session.status}`);
        console.log(`   Created: ${session.createdAt}`);
        console.log(`   Updated: ${session.updatedAt}`);
        console.log('');
      });
      
      // Check for suspicious patterns
      console.log('🔍 Analyzing session IDs for patterns...\n');
      
      const suspiciousSessions = sessions.filter(session => {
        // Check for hardcoded UUIDs
        const hardcodedPatterns = [
          '907d6745-7201-44ee-bdab-a5859835a7e1',
          'fe082bc8-219a-48b5-a81f-c21d6a047b72',
          'bJmho3tOTL9aydYvAOU0',
          'yYDDfbLl6ZZOE6OkaChD',
          'e8559b4f-9524-41f7-95a7-ebd4098bb0d3'
        ];
        
        // Check for cmdxwwx pattern
        const cmdxwwxPattern = /^cmdxwwx/;
        
        return hardcodedPatterns.includes(session.id) || cmdxwwxPattern.test(session.id);
      });
      
      if (suspiciousSessions.length > 0) {
        console.log('⚠️  SUSPICIOUS SESSIONS FOUND:');
        console.log('===============================');
        suspiciousSessions.forEach(session => {
          console.log(`❌ ${session.name} (${session.id})`);
        });
        console.log('');
      } else {
        console.log('✅ No suspicious session IDs found\n');
      }
      
      // Check for missing required fields
      const invalidSessions = sessions.filter(session => {
        return !session.name || !session.organization || !session.createdAt;
      });
      
      if (invalidSessions.length > 0) {
        console.log('⚠️  INVALID SESSIONS (Missing Required Fields):');
        console.log('===============================================');
        invalidSessions.forEach(session => {
          const missing = [];
          if (!session.name) missing.push('name');
          if (!session.organization) missing.push('organization');
          if (!session.createdAt) missing.push('createdAt');
          
          console.log(`❌ ${session.id}: Missing ${missing.join(', ')}`);
        });
        console.log('');
      } else {
        console.log('✅ All sessions have required fields\n');
      }
    }
    
    // Check sessionWorkflows collection
    console.log('📋 Checking sessionWorkflows collection...');
    const workflowsSnapshot = await db.collection('sessionWorkflows').get();
    
    if (workflowsSnapshot.empty) {
      console.log('ℹ️  No session workflows found in database');
    } else {
      console.log(`📊 Found ${workflowsSnapshot.docs.length} session workflows in database\n`);
      
      // Check for orphaned workflows (sessions that don't exist)
      const workflowSessionIds = new Set();
      workflowsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.sessionId) {
          workflowSessionIds.add(data.sessionId);
        }
      });
      
      const existingSessionIds = new Set(sessions.map(s => s.id));
      const orphanedWorkflows = Array.from(workflowsSnapshot.docs).filter(doc => {
        const data = doc.data();
        return data.sessionId && !existingSessionIds.has(data.sessionId);
      });
      
      if (orphanedWorkflows.length > 0) {
        console.log('⚠️  ORPHANED WORKFLOWS (Referencing Non-Existent Sessions):');
        console.log('==========================================================');
        orphanedWorkflows.forEach(doc => {
          const data = doc.data();
          console.log(`❌ Workflow ${doc.id} references non-existent session: ${data.sessionId}`);
        });
        console.log('');
      } else {
        console.log('✅ All workflows reference existing sessions\n');
      }
    }
    
    // Summary
    console.log('📊 SUMMARY');
    console.log('===========');
    console.log(`Total Sessions: ${sessionsSnapshot.docs.length}`);
    console.log(`Total Workflows: ${workflowsSnapshot.docs.length}`);
    console.log(`Suspicious Sessions: ${suspiciousSessions.length}`);
    console.log(`Invalid Sessions: ${invalidSessions.length}`);
    console.log(`Orphaned Workflows: ${orphanedWorkflows.length}`);
    
    if (suspiciousSessions.length > 0 || invalidSessions.length > 0 || orphanedWorkflows.length > 0) {
      console.log('\n⚠️  ISSUES FOUND - Consider running cleanup scripts');
    } else {
      console.log('\n✅ Database looks clean!');
    }
    
  } catch (error) {
    console.error('❌ Error checking Firestore:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the check
checkFirestoreSessions().catch(console.error);
