const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function fixRemainingDefaultBibles() {
  console.log('🔧 FIXING REMAINING DEFAULT ORGANIZATION IDS');
  console.log('='.repeat(60));
  
  try {
    // Find all bibles with organizationId: "default"
    console.log('🔍 Finding bibles with organizationId: "default"...');
    const biblesRef = db.collection('networkDeliveryBibles');
    const defaultBibles = await biblesRef
      .where('organizationId', '==', 'default')
      .get();
    
    console.log(`Found ${defaultBibles.size} bibles with organizationId: "default"`);
    
    if (defaultBibles.empty) {
      console.log('✅ No bibles need fixing!');
      return;
    }
    
    // Update each bible and its deliverables
    const batch = db.batch();
    let updateCount = 0;
    let deliverableCount = 0;
    
    for (const bibleDoc of defaultBibles.docs) {
      const bibleData = bibleDoc.data();
      console.log(`📖 Fixing bible: ${bibleData.fileName} (${bibleDoc.id})`);
      
      // Update the bible document
      batch.update(bibleDoc.ref, {
        organizationId: 'enterprise-org-001',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      updateCount++;
      
      // Get and update all deliverables for this bible
      const deliverablesRef = bibleDoc.ref.collection('deliverables');
      const deliverables = await deliverablesRef.get();
      
      console.log(`   📋 Found ${deliverables.size} deliverables to update`);
      
      for (const deliverableDoc of deliverables.docs) {
        batch.update(deliverableDoc.ref, {
          organizationId: 'enterprise-org-001',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        deliverableCount++;
      }
    }
    
    // Commit all updates
    console.log('');
    console.log('💾 Committing updates...');
    console.log(`   📖 Bibles to update: ${updateCount}`);
    console.log(`   📋 Deliverables to update: ${deliverableCount}`);
    
    await batch.commit();
    
    console.log('✅ Successfully updated all organization IDs!');
    
    // Verify the fix
    console.log('');
    console.log('🔍 Verifying the fix...');
    const enterpriseBibles = await biblesRef
      .where('organizationId', '==', 'enterprise-org-001')
      .get();
    
    console.log(`✅ Found ${enterpriseBibles.size} bibles with organizationId: "enterprise-org-001"`);
    
    const remainingDefaultBibles = await biblesRef
      .where('organizationId', '==', 'default')
      .get();
    
    console.log(`📊 Remaining bibles with organizationId: "default": ${remainingDefaultBibles.size}`);
    
    if (remainingDefaultBibles.size === 0) {
      console.log('🎉 ALL BIBLES SUCCESSFULLY FIXED!');
    }
    
  } catch (error) {
    console.error('❌ Error fixing organization IDs:', error);
  }
}

// Run the fix
fixRemainingDefaultBibles().then(() => {
  console.log('🏁 Fix complete');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fix failed:', error);
  process.exit(1);
});
