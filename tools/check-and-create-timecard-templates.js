#!/usr/bin/env node

/**
 * Timecard Template Checker and Creator
 * 
 * This script checks if timecard templates exist in the Firestore database
 * and creates default templates if none are found.
 * 
 * Usage: node tools/check-and-create-timecard-templates.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with Application Default Credentials
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

// Default timecard templates
const defaultTemplates = [
  {
    name: 'Standard',
    description: 'Standard 8-hour workday with overtime after 8 hours',
    isActive: true,
    standardHoursPerDay: 8.0,
    hourlyRate: 25.0,
    overtimeThreshold: 8.0,
    doubleTimeThreshold: 12.0,
    overtimeMultiplier: 1.5,
    doubleTimeMultiplier: 2.0,
    mealBreakRequired: true,
    mealBreakThreshold: 6.0,
    mealPenaltyHours: 1.0,
    restBreakRequired: true,
    restBreakThreshold: 4.0,
    minimumTurnaround: 8.0,
    turnaroundViolationPenalty: 2.0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Premium',
    description: 'Premium rate with enhanced overtime benefits',
    isActive: true,
    standardHoursPerDay: 8.0,
    hourlyRate: 35.0,
    overtimeThreshold: 8.0,
    doubleTimeThreshold: 12.0,
    overtimeMultiplier: 1.75,
    doubleTimeMultiplier: 2.5,
    mealBreakRequired: true,
    mealBreakThreshold: 6.0,
    mealPenaltyHours: 1.5,
    restBreakRequired: true,
    restBreakThreshold: 4.0,
    minimumTurnaround: 8.0,
    turnaroundViolationPenalty: 3.0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Entry Level',
    description: 'Entry level position with standard benefits',
    isActive: true,
    standardHoursPerDay: 8.0,
    hourlyRate: 18.0,
    overtimeThreshold: 8.0,
    doubleTimeThreshold: 12.0,
    overtimeMultiplier: 1.5,
    doubleTimeMultiplier: 2.0,
    mealBreakRequired: true,
    mealBreakThreshold: 6.0,
    mealPenaltyHours: 1.0,
    restBreakRequired: true,
    restBreakThreshold: 4.0,
    minimumTurnaround: 8.0,
    turnaroundViolationPenalty: 1.5,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Freelance',
    description: 'Freelance contractor rates',
    isActive: true,
    standardHoursPerDay: 8.0,
    hourlyRate: 45.0,
    overtimeThreshold: 8.0,
    doubleTimeThreshold: 12.0,
    overtimeMultiplier: 1.25,
    doubleTimeMultiplier: 1.5,
    mealBreakRequired: false,
    mealBreakThreshold: 0.0,
    mealPenaltyHours: 0.0,
    restBreakRequired: false,
    restBreakThreshold: 0.0,
    minimumTurnaround: 0.0,
    turnaroundViolationPenalty: 0.0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function checkAndCreateTemplates() {
  try {
    console.log('🔍 Checking for existing timecard templates...');
    
    // Check if templates collection exists and has documents
    const templatesSnapshot = await db.collection('timecard_templates').get();
    
    if (templatesSnapshot.empty) {
      console.log('❌ No timecard templates found. Creating default templates...');
      
      // Create default templates
      const createdTemplates = [];
      for (const template of defaultTemplates) {
        const docRef = await db.collection('timecard_templates').add(template);
        createdTemplates.push({
          id: docRef.id,
          name: template.name
        });
        console.log(`✅ Created template: ${template.name} (ID: ${docRef.id})`);
      }
      
      console.log(`\n🎉 Successfully created ${createdTemplates.length} default templates:`);
      createdTemplates.forEach(t => console.log(`   - ${t.name}: ${t.id}`));
      
    } else {
      console.log(`✅ Found ${templatesSnapshot.size} existing timecard templates:`);
      
      templatesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.name} (ID: ${doc.id}, Active: ${data.isActive})`);
      });
      
      // Check if we have the essential templates
      const templateNames = templatesSnapshot.docs.map(doc => doc.data().name);
      const hasStandard = templateNames.includes('Standard');
      const hasDefault = templateNames.includes('Default');
      
      if (!hasStandard && !hasDefault) {
        console.log('\n⚠️  No Standard or Default template found. Creating Standard template...');
        
        const standardTemplate = defaultTemplates.find(t => t.name === 'Standard');
        if (standardTemplate) {
          const docRef = await db.collection('timecard_templates').add(standardTemplate);
          console.log(`✅ Created Standard template (ID: ${docRef.id})`);
        }
      }
    }
    
    // Check template assignments
    console.log('\n🔍 Checking template assignments...');
    const assignmentsSnapshot = await db.collection('timecard_template_assignments').get();
    
    if (assignmentsSnapshot.empty) {
      console.log('❌ No template assignments found.');
      console.log('💡 Users will need to be assigned to templates manually or through the admin interface.');
    } else {
      console.log(`✅ Found ${assignmentsSnapshot.size} template assignments:`);
      
      assignmentsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - User: ${data.userId}, Template: ${data.templateId}, Active: ${data.isActive}`);
      });
    }
    
    console.log('\n🎯 Next steps:');
    console.log('1. Assign users to appropriate templates via admin interface');
    console.log('2. Test timecard calculations with the new templates');
    console.log('3. Verify TimeCardModal is working correctly');
    
  } catch (error) {
    console.error('❌ Error checking/creating templates:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  checkAndCreateTemplates()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { checkAndCreateTemplates };
