#!/usr/bin/env node

/**
 * User Template Assignment Script
 * 
 * This script assigns users to timecard templates so they can access
 * the template configuration for timecard calculations.
 * 
 * Usage: node tools/assign-users-to-templates.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with Application Default Credentials
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function assignUsersToTemplates() {
  try {
    console.log('🔍 Checking for users and templates...');
    
    // Get all active users
    const usersSnapshot = await db.collection('users').get();
    if (usersSnapshot.empty) {
      console.log('❌ No users found in the database');
      return;
    }
    
    // Get all active templates
    const templatesSnapshot = await db.collection('timecard_templates').get();
    if (templatesSnapshot.empty) {
      console.log('❌ No timecard templates found. Run check-and-create-timecard-templates.js first.');
      return;
    }
    
    console.log(`✅ Found ${usersSnapshot.size} users and ${templatesSnapshot.size} templates`);
    
    // Get existing assignments
    const assignmentsSnapshot = await db.collection('timecard_template_assignments').get();
    const existingAssignments = new Map();
    
    assignmentsSnapshot.forEach(doc => {
      const data = doc.data();
      existingAssignments.set(data.userId, {
        id: doc.id,
        templateId: data.templateId,
        isActive: data.isActive
      });
    });
    
    console.log(`📋 Found ${existingAssignments.size} existing template assignments`);
    
    // Get the Standard template (or first available template)
    let defaultTemplate = null;
    for (const doc of templatesSnapshot.docs) {
      const data = doc.data();
      if (data.name === 'Standard') {
        defaultTemplate = { id: doc.id, ...data };
        break;
      }
    }
    
    if (!defaultTemplate) {
      defaultTemplate = { id: templatesSnapshot.docs[0].id, ...templatesSnapshot.docs[0].data() };
    }
    
    console.log(`🎯 Using default template: ${defaultTemplate.name} (ID: ${defaultTemplate.id})`);
    
    // Assign users to templates
    let newAssignments = 0;
    let updatedAssignments = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      // Skip if user already has an active assignment
      if (existingAssignments.has(userId)) {
        const assignment = existingAssignments.get(userId);
        if (assignment.isActive) {
          console.log(`✅ User ${userData.email || userId} already has active template assignment`);
          continue;
        }
      }
      
      // Create or update assignment
      const assignmentData = {
        userId: userId,
        templateId: defaultTemplate.id,
        isActive: true,
        assignedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        assignedBy: 'system',
        notes: 'Auto-assigned by system script'
      };
      
      if (existingAssignments.has(userId)) {
        // Update existing assignment
        const assignment = existingAssignments.get(userId);
        await db.collection('timecard_template_assignments').doc(assignment.id).update(assignmentData);
        console.log(`🔄 Updated template assignment for user ${userData.email || userId}`);
        updatedAssignments++;
      } else {
        // Create new assignment
        await db.collection('timecard_template_assignments').add(assignmentData);
        console.log(`➕ Created template assignment for user ${userData.email || userId}`);
        newAssignments++;
      }
    }
    
    console.log(`\n🎉 Assignment summary:`);
    console.log(`   - New assignments: ${newAssignments}`);
    console.log(`   - Updated assignments: ${updatedAssignments}`);
    console.log(`   - Total users processed: ${usersSnapshot.size}`);
    
    // Verify assignments
    console.log('\n🔍 Verifying assignments...');
    const finalAssignmentsSnapshot = await db.collection('timecard_template_assignments').get();
    const activeAssignments = finalAssignmentsSnapshot.docs.filter(doc => doc.data().isActive);
    
    console.log(`✅ Active template assignments: ${activeAssignments.length}`);
    
    // Show some sample assignments
    activeAssignments.slice(0, 5).forEach(doc => {
      const data = doc.data();
      console.log(`   - User: ${data.userId}, Template: ${data.templateId}`);
    });
    
    if (activeAssignments.length > 5) {
      console.log(`   ... and ${activeAssignments.length - 5} more`);
    }
    
    console.log('\n🎯 Next steps:');
    console.log('1. Test the TimeCardModal to see if template calculations work');
    console.log('2. Check browser console for template loading messages');
    console.log('3. Verify effectiveConfig and template are now populated');
    
  } catch (error) {
    console.error('❌ Error assigning users to templates:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  assignUsersToTemplates()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { assignUsersToTemplates };
