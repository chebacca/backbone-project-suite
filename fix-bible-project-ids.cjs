#!/usr/bin/env node

/**
 * Fix Bible Project ID Mismatches
 * 
 * This script fixes the project ID mismatches in the networkDeliveryBibles collection
 * to ensure they match the actual project IDs in the projects collection.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function fixBibleProjectIds() {
  try {
    console.log('🔧 Fixing Bible Project ID Mismatches...');
    
    // Get all projects in the enterprise organization
    const projectsSnapshot = await db.collection('projects')
      .where('organizationId', '==', 'enterprise-media-org')
      .get();
    
    const projects = {};
    projectsSnapshot.forEach(doc => {
      const data = doc.data();
      projects[data.name] = doc.id;
      console.log(`📁 Project: "${data.name}" -> ID: ${doc.id}`);
    });
    
    // Get all bibles
    const biblesSnapshot = await db.collection('networkDeliveryBibles')
      .where('organizationId', '==', 'enterprise-media-org')
      .get();
    
    console.log(`\n📚 Found ${biblesSnapshot.size} bibles to check...`);
    
    const batch = db.batch();
    let updates = 0;
    
    biblesSnapshot.forEach(doc => {
      const data = doc.data();
      const fileName = data.fileName;
      
      // Extract project name from file name and match to actual project ID
      let correctProjectId = null;
      
      if (fileName.includes('Corporate Video - Incredible Cotton Shirt')) {
        correctProjectId = projects['Corporate Video - Incredible Cotton Shirt'] || 'corporate-video-project';
      } else if (fileName.includes('Commercial - Frozen Steel Shirt')) {
        correctProjectId = projects['Commercial - Frozen Steel Shirt'] || 'commercial-project';
      } else if (fileName.includes('Web Series - Behind the Fabric')) {
        correctProjectId = projects['Web Series - Behind the Fabric'] || 'web-series-project';
      } else if (fileName.includes('Tell Me More Season 1')) {
        // This one doesn't have a matching project, keep as is
        correctProjectId = data.projectId;
      }
      
      if (correctProjectId && correctProjectId !== data.projectId) {
        console.log(`🔄 Updating bible "${fileName}": ${data.projectId} -> ${correctProjectId}`);
        batch.update(doc.ref, { projectId: correctProjectId });
        updates++;
      } else {
        console.log(`✅ Bible "${fileName}" already has correct project ID: ${data.projectId}`);
      }
    });
    
    if (updates > 0) {
      await batch.commit();
      console.log(`\n✅ Updated ${updates} bibles with correct project IDs`);
    } else {
      console.log('\n✅ All bibles already have correct project IDs');
    }
    
    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const updatedBiblesSnapshot = await db.collection('networkDeliveryBibles')
      .where('organizationId', '==', 'enterprise-media-org')
      .get();
    
    updatedBiblesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`📚 Bible: "${data.fileName}" -> Project: ${data.projectId}`);
    });
    
    console.log('\n🎉 Project ID fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing bible project IDs:', error);
    throw error;
  }
}

// Run the fix
if (require.main === module) {
  fixBibleProjectIds()
    .then(() => {
      console.log('\n✅ Bible project ID fix completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Bible project ID fix failed:', error);
      process.exit(1);
    });
}

module.exports = { fixBibleProjectIds };
