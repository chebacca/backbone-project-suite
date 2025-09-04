#!/usr/bin/env node

/**
 * 🗑️ MAPLAYOUTS COLLECTION DELETION SCRIPT
 * 
 * This script safely deletes all documents from the 'mapLayouts' collection
 * in the Firestore database with dry-run capability for safety.
 * 
 * Usage: 
 *   node delete-maplayouts-collection.js --dry-run    # Preview what will be deleted
 *   node delete-maplayouts-collection.js --execute    # Actually delete the documents
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isExecute = args.includes('--execute');

if (!isDryRun && !isExecute) {
  console.log('❌ Please specify either --dry-run or --execute');
  console.log('Usage:');
  console.log('  node delete-maplayouts-collection.js --dry-run    # Preview what will be deleted');
  console.log('  node delete-maplayouts-collection.js --execute    # Actually delete the documents');
  process.exit(1);
}

// Initialize Firebase Admin with application default credentials
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function deleteMaplayoutsCollection() {
  try {
    console.log('🚀 Starting mapLayouts collection deletion...');
    console.log(`📋 Mode: ${isDryRun ? 'DRY RUN (preview only)' : 'EXECUTE (actual deletion)'}\n`);
    
    // Get all documents from mapLayouts collection
    const maplayoutsRef = db.collection('mapLayouts');
    const snapshot = await maplayoutsRef.get();
    
    if (snapshot.empty) {
      console.log('ℹ️  No documents found in mapLayouts collection');
      return;
    }
    
    console.log(`📊 Found ${snapshot.docs.length} documents in mapLayouts collection\n`);
    
    // Show document details
    snapshot.docs.forEach((doc, index) => {
      console.log(`${index + 1}. Document ID: ${doc.id}`);
      console.log(`   Data: ${JSON.stringify(doc.data(), null, 2)}`);
      console.log('');
    });
    
    if (isDryRun) {
      console.log('🔍 DRY RUN COMPLETE - No documents were actually deleted');
      console.log('💡 To actually delete these documents, run: node delete-maplayouts-collection.js --execute');
      return;
    }
    
    // Execute actual deletion
    console.log('🔥 EXECUTING DELETION...\n');
    
    let deletedCount = 0;
    let errorCount = 0;
    
    // Delete documents in batches (Firestore batch limit is 500)
    const batchSize = 500;
    const docs = snapshot.docs;
    
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = docs.slice(i, i + batchSize);
      
      batchDocs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      try {
        await batch.commit();
        deletedCount += batchDocs.length;
        console.log(`✅ Deleted batch ${Math.floor(i / batchSize) + 1}: ${batchDocs.length} documents`);
      } catch (error) {
        console.error(`❌ Error deleting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        errorCount += batchDocs.length;
      }
    }
    
    console.log('\n🎉 MapLayouts collection deletion completed!');
    console.log(`📊 Documents deleted: ${deletedCount}`);
    console.log(`❌ Errors encountered: ${errorCount}`);
    
    if (deletedCount > 0) {
      console.log('\n✅ All documents in mapLayouts collection have been successfully deleted');
    }
    
  } catch (error) {
    console.error('❌ Failed to delete mapLayouts collection:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the deletion
deleteMaplayoutsCollection().catch(console.error);
