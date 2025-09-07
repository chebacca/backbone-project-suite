#!/usr/bin/env node

/**
 * Check Deliverables for Enterprise User
 * 
 * This script checks if deliverables were properly created for enterprise.user@enterprisemedia.com
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function checkDeliverables() {
  console.log('📖 Checking deliverables for enterprise.user@enterprisemedia.com...\n');
  
  try {
    // Check networkDeliveryBibles collection
    console.log('1. Checking networkDeliveryBibles collection...');
    const biblesQuery = db.collection('networkDeliveryBibles').where('uploadedBy', '==', 'enterprise.user@enterprisemedia.com');
    const biblesSnapshot = await biblesQuery.get();
    
    if (!biblesSnapshot.empty) {
      console.log(`✅ Found ${biblesSnapshot.docs.length} delivery bibles:\n`);
      
      for (const doc of biblesSnapshot.docs) {
        const data = doc.data();
        console.log(`   📖 Bible: ${data.fileName}`);
        console.log(`      Type: ${data.fileType}`);
        console.log(`      Description: ${data.description}`);
        console.log(`      Total Deliverables: ${data.deliverableCount}`);
        console.log(`      Organization: ${data.organizationId}`);
        console.log(`      Status: ${data.status}`);
        
        // Check deliverables sub-collection
        console.log(`\n   📋 Checking deliverables for this bible...`);
        const deliverablesSnapshot = await db.collection('networkDeliveryBibles')
          .doc(doc.id)
          .collection('deliverables')
          .get();
        
        if (!deliverablesSnapshot.empty) {
          console.log(`      ✅ Found ${deliverablesSnapshot.docs.length} deliverables:`);
          
          const categories = {};
          const statuses = {};
          
          deliverablesSnapshot.docs.forEach(deliverableDoc => {
            const deliverableData = deliverableDoc.data();
            
            // Count by category
            if (!categories[deliverableData.category]) {
              categories[deliverableData.category] = 0;
            }
            categories[deliverableData.category]++;
            
            // Count by status
            if (!statuses[deliverableData.status]) {
              statuses[deliverableData.status] = 0;
            }
            statuses[deliverableData.status]++;
            
            console.log(`         • ${deliverableData.deliverableName}`);
            console.log(`           Category: ${deliverableData.category}`);
            console.log(`           Status: ${deliverableData.status}`);
            console.log(`           Priority: ${deliverableData.priority}`);
            console.log(`           Deadline: ${deliverableData.deadline}`);
          });
          
          console.log(`\n      📊 Summary by Category:`);
          Object.entries(categories).forEach(([category, count]) => {
            console.log(`         ${category}: ${count} deliverables`);
          });
          
          console.log(`\n      📊 Summary by Status:`);
          Object.entries(statuses).forEach(([status, count]) => {
            console.log(`         ${status}: ${count} deliverables`);
          });
          
        } else {
          console.log(`      ❌ No deliverables found in sub-collection`);
        }
        
        console.log('\n' + '-'.repeat(60) + '\n');
      }
    } else {
      console.log('❌ No delivery bibles found for enterprise user');
    }
    
    // Also check if there are any bibles for the organization
    console.log('2. Checking all bibles for enterprise organization...');
    const orgBiblesQuery = db.collection('networkDeliveryBibles').where('organizationId', '==', 'enterprise-org-001');
    const orgBiblesSnapshot = await orgBiblesQuery.get();
    
    if (!orgBiblesSnapshot.empty) {
      console.log(`✅ Found ${orgBiblesSnapshot.docs.length} bibles for organization enterprise-org-001:`);
      orgBiblesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`   • ${data.fileName} (${data.deliverableCount} deliverables)`);
      });
    } else {
      console.log('❌ No delivery bibles found for enterprise organization');
    }
    
  } catch (error) {
    console.error('❌ Error checking deliverables:', error);
  }
}

// Run the check
checkDeliverables().then(() => {
  console.log('\n✅ Deliverables check complete');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
