#!/usr/bin/env node

/**
 * Minimal Bible Test Script
 * Creates only the essential data needed to test deliverables functionality
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Configuration
const ENTERPRISE_CONFIG = {
  organizationId: 'enterprise-org-001',
  organizationName: 'Enterprise Media Solutions',
  adminUserId: '2ysTqv3pwiXyKxOeExAfEKOIh7K2',
  adminEmail: 'enterprise.user@enterprisemedia.com',
  domain: 'enterprisemedia.com'
};

async function cleanupMinimalData() {
  console.log('🧹 Cleaning up existing minimal test data...');
  
  try {
    // Delete existing bibles and deliverables
    const biblesSnapshot = await db.collection('networkDeliveryBibles').get();
    const batch = db.batch();
    
    for (const doc of biblesSnapshot.docs) {
      // Delete deliverables subcollection
      const deliverablesSnapshot = await doc.ref.collection('deliverables').get();
      deliverablesSnapshot.docs.forEach(deliverableDoc => {
        batch.delete(deliverableDoc.ref);
      });
      
      // Delete bible document
      batch.delete(doc.ref);
    }
    
    // Delete user documents
    const usersSnapshot = await db.collection('users').get();
    usersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete team member documents
    const teamMembersSnapshot = await db.collection('teamMembers').get();
    teamMembersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete org member documents
    const orgMembersSnapshot = await db.collection('orgMembers').get();
    orgMembersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    // Clean up Firebase Auth
    try {
      await admin.auth().deleteUser(ENTERPRISE_CONFIG.adminUserId);
      console.log('🗑️ Deleted Firebase Auth user');
    } catch (error) {
      console.log('ℹ️ Firebase Auth user not found (already deleted)');
    }
    
    console.log('✅ Cleanup complete');
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
}

async function createMinimalData() {
  console.log('🚀 Creating minimal test data...');
  
  try {
    // 1. Create Firebase Auth user
    try {
      await admin.auth().createUser({
        uid: ENTERPRISE_CONFIG.adminUserId,
        email: ENTERPRISE_CONFIG.adminEmail,
        password: 'Enterprise123!',
        displayName: 'Enterprise Admin'
      });
      console.log('✅ Created Firebase Auth user');
    } catch (error) {
      if (error.code === 'auth/uid-already-exists') {
        console.log('ℹ️ Firebase Auth user already exists');
      } else {
        throw error;
      }
    }
    
    // 2. Create user document
    await db.collection('users').doc(ENTERPRISE_CONFIG.adminUserId).set({
      id: ENTERPRISE_CONFIG.adminUserId,
      email: ENTERPRISE_CONFIG.adminEmail,
      firstName: 'Enterprise',
      lastName: 'Admin',
      name: 'Enterprise Admin',
      organizationId: ENTERPRISE_CONFIG.organizationId,
      role: 'OWNER',
      status: 'ACTIVE',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Created user document');
    
    // 3. Create team member document
    await db.collection('teamMembers').doc(ENTERPRISE_CONFIG.adminUserId).set({
      id: ENTERPRISE_CONFIG.adminUserId,
      email: ENTERPRISE_CONFIG.adminEmail,
      firstName: 'Enterprise',
      lastName: 'Admin',
      name: 'Enterprise Admin',
      organizationId: ENTERPRISE_CONFIG.organizationId,
      role: 'ADMIN',
      status: 'ACTIVE',
      department: 'Production',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Created team member document');
    
    // 4. Create delivery bible with deliverables
    const bibleId = `bible_${Date.now()}_test`;
    
    // Create bible document
    await db.collection('networkDeliveryBibles').doc(bibleId).set({
      id: bibleId,
      fileName: 'Tell Me More Season 1 - Deliverables.pdf',
      fileType: 'Netflix Series',
      status: 'parsed_successfully',
      organizationId: ENTERPRISE_CONFIG.organizationId,
      projectId: null,
      uploadedBy: ENTERPRISE_CONFIG.adminUserId,
      uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      rawText: 'Network Delivery Bible: Tell Me More Season 1 - Complete post-production and legal deliverables for TMM Season 1',
      deliverableCount: 8,
      parsedAt: admin.firestore.FieldValue.serverTimestamp(),
      description: 'Complete post-production and legal deliverables for TMM Season 1'
    });
    console.log('✅ Created delivery bible');
    
    // 5. Create deliverables
    const deliverables = [
      {
        deliverableName: 'Fair Use Legal Opinion Letter',
        category: 'Legal',
        deadline: 'Before first IMF delivery',
        priority: 'critical',
        status: 'not_started',
        specifications: ['Legal opinion from qualified attorney', 'Cover all third-party content usage', 'Include fair use analysis'],
        sourceText: 'Fair Use Legal Opinion Letter - Before first IMF delivery'
      },
      {
        deliverableName: 'Fact Check Document',
        category: 'Legal',
        deadline: 'Include in PIX email notification',
        priority: 'high',
        status: 'not_started',
        specifications: ['Verify all factual claims', 'Document sources', 'Legal review required'],
        sourceText: 'Fact Check Document - Include in PIX email notification'
      },
      {
        deliverableName: 'IMF Package',
        category: 'Video',
        deadline: 'Sunday by 9am ET',
        priority: 'critical',
        status: 'not_started',
        specifications: ['ProRes 422 HQ format', 'Complete video package', 'Quality control passed'],
        sourceText: 'IMF Package - Sunday by 9am ET'
      },
      {
        deliverableName: 'IMF Textless',
        category: 'Video',
        deadline: 'Within a week of passing QC',
        priority: 'high',
        status: 'not_started',
        specifications: ['Textless version of IMF', 'Same technical specs as main IMF', 'No graphics or text overlays'],
        sourceText: 'IMF Textless - Within a week of passing QC'
      },
      {
        deliverableName: '5.1 Near Field Audio Stems',
        category: 'Audio',
        deadline: 'Within a week of passing QC',
        priority: 'high',
        status: 'not_started',
        specifications: ['5.1 surround sound format', 'Individual audio stems', 'Broadcast quality'],
        sourceText: '5.1 Near Field Audio Stems - Within a week of passing QC'
      },
      {
        deliverableName: '5.1 Near Field Mix minus Narration',
        category: 'Audio',
        deadline: 'Within a week of passing QC',
        priority: 'medium',
        status: 'not_started',
        specifications: ['5.1 mix without narration track', 'Music and effects only', 'Same levels as main mix'],
        sourceText: '5.1 Near Field Mix minus Narration - Within a week of passing QC'
      },
      {
        deliverableName: 'Music Cue Sheets',
        category: 'Music',
        deadline: 'Before wrap',
        priority: 'high',
        status: 'not_started',
        specifications: ['Complete music cue documentation', 'Timing and usage details', 'Rights clearance info'],
        sourceText: 'Music Cue Sheets - Before wrap'
      },
      {
        deliverableName: 'Hot Sheets',
        category: 'Production',
        deadline: 'Next day after field shoot',
        priority: 'medium',
        status: 'not_started',
        specifications: ['Daily production reports', 'Shot lists and notes', 'Next day delivery required'],
        sourceText: 'Hot Sheets - Next day after field shoot'
      }
    ];
    
    const batch = db.batch();
    
    deliverables.forEach((deliverable, index) => {
      const deliverableId = `${bibleId}_deliverable_${index}`;
      const deliverableRef = db.collection('networkDeliveryBibles')
        .doc(bibleId)
        .collection('deliverables')
        .doc(deliverableId);
      
      batch.set(deliverableRef, {
        id: deliverableId,
        bibleId: bibleId,
        organizationId: ENTERPRISE_CONFIG.organizationId,
        projectId: null,
        title: deliverable.deliverableName,
        deliverableName: deliverable.deliverableName,
        description: `${deliverable.deliverableName} - ${deliverable.deadline}`,
        category: deliverable.category,
        priority: deliverable.priority,
        status: deliverable.status,
        deadline: deliverable.deadline,
        specifications: deliverable.specifications,
        sourceText: deliverable.sourceText,
        notes: '',
        userComments: '',
        assignedTo: ENTERPRISE_CONFIG.adminUserId,
        assignedAt: admin.firestore.FieldValue.serverTimestamp(),
        progressPercentage: 0,
        estimatedStartDate: null,
        estimatedCompletionDate: null,
        actualStartDate: null,
        actualCompletionDate: null,
        relatedSessions: [],
        relatedMedia: [],
        gaps: [],
        recommendations: [],
        attachments: [],
        requiresApproval: deliverable.priority === 'critical',
        approvalStatus: 'pending',
        approvedBy: null,
        approvedAt: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log(`✅ Created ${deliverables.length} deliverables`);
    
    console.log('\n🎉 MINIMAL TEST DATA CREATED SUCCESSFULLY!');
    console.log('==========================================');
    console.log('📧 Email: enterprise.user@enterprisemedia.com');
    console.log('🔒 Password: Enterprise123!');
    console.log('🏢 Organization: Enterprise Media Solutions');
    console.log('📖 Bible: Tell Me More Season 1 - Deliverables.pdf');
    console.log(`📋 Deliverables: ${deliverables.length} items`);
    console.log('🔧 Organization ID: enterprise-org-001');
    console.log('\n✅ Ready to test deliverables functionality!');
    
  } catch (error) {
    console.error('❌ Error creating minimal data:', error);
    throw error;
  }
}

async function main() {
  try {
    const args = process.argv.slice(2);
    
    if (args.includes('--cleanup')) {
      await cleanupMinimalData();
      return;
    }
    
    // Always cleanup first, then create
    await cleanupMinimalData();
    await createMinimalData();
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
