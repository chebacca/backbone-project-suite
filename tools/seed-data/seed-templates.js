#!/usr/bin/env node

/**
 * 🎯 FOCUSED TEMPLATE SEEDER
 * 
 * This script specifically seeds timecard and callsheet templates
 * that are required for the application to function properly.
 * 
 * Run after: node generate-enterprise-mock-data.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

class TemplateSeeder {
  constructor() {
    this.organizationId = 'enterprise-org-001';
    this.userId = 'enterprise-user-id'; // Will be updated with actual user ID
    this.faker = null;
  }

  async initializeFaker() {
    if (!this.faker) {
      const { faker } = await import('@faker-js/faker');
      this.faker = faker;
    }
  }

  async seedTimecardTemplates() {
    console.log('📋 Seeding timecard templates...');
    
    const templates = [
      {
        name: 'Default',
        description: 'Default timecard template for all users',
        isActive: true,
        organizationId: this.organizationId,
        rules: {
          hourlyRate: 25.00,
          overtimeThreshold: 8.0,
          overtimeMultiplier: 1.5,
          doubleTimeThreshold: 12.0,
          doubleTimeMultiplier: 2.0,
          mealBreakThreshold: 6.0,
          mealPenaltyHours: 1.0,
          maxHoursPerDay: 16.0,
          maxHoursPerWeek: 60.0,
          requireMealBreak: true,
          allowWeekendWork: true,
          allowHolidayWork: true
        },
        fields: [
          { name: 'timeIn', type: 'time', required: true, label: 'Time In' },
          { name: 'timeOut', type: 'time', required: true, label: 'Time Out' },
          { name: 'mealBreakStart', type: 'time', required: false, label: 'Meal Break Start' },
          { name: 'mealBreakEnd', type: 'time', required: false, label: 'Meal Break End' },
          { name: 'project', type: 'text', required: true, label: 'Project' },
          { name: 'description', type: 'textarea', required: false, label: 'Description' },
          { name: 'hourlyRate', type: 'number', required: false, label: 'Hourly Rate' }
        ],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Production Crew',
        description: 'Timecard template for production crew members',
        isActive: true,
        organizationId: this.organizationId,
        rules: {
          hourlyRate: 35.00,
          overtimeThreshold: 8.0,
          overtimeMultiplier: 1.5,
          doubleTimeThreshold: 12.0,
          doubleTimeMultiplier: 2.0,
          mealBreakThreshold: 6.0,
          mealPenaltyHours: 1.0,
          maxHoursPerDay: 16.0,
          maxHoursPerWeek: 60.0,
          requireMealBreak: true,
          allowWeekendWork: true,
          allowHolidayWork: true
        },
        fields: [
          { name: 'timeIn', type: 'time', required: true, label: 'Time In' },
          { name: 'timeOut', type: 'time', required: true, label: 'Time Out' },
          { name: 'mealBreakStart', type: 'time', required: false, label: 'Meal Break Start' },
          { name: 'mealBreakEnd', type: 'time', required: false, label: 'Meal Break End' },
          { name: 'project', type: 'text', required: true, label: 'Project' },
          { name: 'location', type: 'text', required: true, label: 'Location' },
          { name: 'equipment', type: 'text', required: false, label: 'Equipment Used' },
          { name: 'description', type: 'textarea', required: false, label: 'Description' },
          { name: 'hourlyRate', type: 'number', required: false, label: 'Hourly Rate' }
        ],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Post Production',
        description: 'Timecard template for post-production team',
        isActive: true,
        organizationId: this.organizationId,
        rules: {
          hourlyRate: 40.00,
          overtimeThreshold: 8.0,
          overtimeMultiplier: 1.5,
          doubleTimeThreshold: 12.0,
          doubleTimeMultiplier: 2.0,
          mealBreakThreshold: 6.0,
          mealPenaltyHours: 1.0,
          maxHoursPerDay: 16.0,
          maxHoursPerWeek: 60.0,
          requireMealBreak: true,
          allowWeekendWork: true,
          allowHolidayWork: true
        },
        fields: [
          { name: 'timeIn', type: 'time', required: true, label: 'Time In' },
          { name: 'timeOut', type: 'time', required: true, label: 'Time Out' },
          { name: 'mealBreakStart', type: 'time', required: false, label: 'Meal Break Start' },
          { name: 'mealBreakEnd', type: 'time', required: false, label: 'Meal Break End' },
          { name: 'project', type: 'text', required: true, label: 'Project' },
          { name: 'software', type: 'text', required: false, label: 'Software Used' },
          { name: 'tasks', type: 'textarea', required: false, label: 'Tasks Completed' },
          { name: 'description', type: 'textarea', required: false, label: 'Description' },
          { name: 'hourlyRate', type: 'number', required: false, label: 'Hourly Rate' }
        ],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    const createdTemplates = [];
    for (const template of templates) {
      const docRef = await db.collection('timecard_templates').add(template);
      createdTemplates.push({ id: docRef.id, ...template });
      console.log(`✅ Created timecard template: ${template.name}`);
    }

    return createdTemplates;
  }

  async seedCallsheetTemplates() {
    console.log('📋 Seeding callsheet templates...');
    
    const templates = [
      {
        name: 'Standard Production',
        description: 'Standard production callsheet template',
        isActive: true,
        organizationId: this.organizationId,
        sections: [
          {
            name: 'Production Info',
            fields: [
              { name: 'projectName', type: 'text', required: true, label: 'Project Name' },
              { name: 'director', type: 'text', required: true, label: 'Director' },
              { name: 'producer', type: 'text', required: true, label: 'Producer' },
              { name: 'date', type: 'date', required: true, label: 'Shoot Date' },
              { name: 'location', type: 'text', required: true, label: 'Location' },
              { name: 'callTime', type: 'time', required: true, label: 'Call Time' }
            ]
          },
          {
            name: 'Crew',
            fields: [
              { name: 'cameraOp', type: 'text', required: true, label: 'Camera Operator' },
              { name: 'soundOp', type: 'text', required: true, label: 'Sound Operator' },
              { name: 'grip', type: 'text', required: false, label: 'Grip' },
              { name: 'electric', type: 'text', required: false, label: 'Electric' }
            ]
          },
          {
            name: 'Equipment',
            fields: [
              { name: 'camera', type: 'text', required: true, label: 'Camera' },
              { name: 'lenses', type: 'text', required: true, label: 'Lenses' },
              { name: 'audio', type: 'text', required: true, label: 'Audio Equipment' },
              { name: 'lighting', type: 'text', required: false, label: 'Lighting' }
            ]
          }
        ],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Documentary',
        description: 'Documentary production callsheet template',
        isActive: true,
        organizationId: this.organizationId,
        sections: [
          {
            name: 'Production Info',
            fields: [
              { name: 'projectName', type: 'text', required: true, label: 'Project Name' },
              { name: 'director', type: 'text', required: true, label: 'Director' },
              { name: 'producer', type: 'text', required: true, label: 'Producer' },
              { name: 'date', type: 'date', required: true, label: 'Shoot Date' },
              { name: 'location', type: 'text', required: true, label: 'Location' },
              { name: 'callTime', type: 'time', required: true, label: 'Call Time' },
              { name: 'subject', type: 'text', required: true, label: 'Subject/Interviewee' }
            ]
          },
          {
            name: 'Crew',
            fields: [
              { name: 'cameraOp', type: 'text', required: true, label: 'Camera Operator' },
              { name: 'soundOp', type: 'text', required: true, label: 'Sound Operator' },
              { name: 'interviewer', type: 'text', required: false, label: 'Interviewer' }
            ]
          },
          {
            name: 'Equipment',
            fields: [
              { name: 'camera', type: 'text', required: true, label: 'Camera' },
              { name: 'lenses', type: 'text', required: true, label: 'Lenses' },
              { name: 'audio', type: 'text', required: true, label: 'Audio Equipment' },
              { name: 'lighting', type: 'text', required: false, label: 'Lighting' }
            ]
          }
        ],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    const createdTemplates = [];
    for (const template of templates) {
      const docRef = await db.collection('callsheet_templates').add(template);
      createdTemplates.push({ id: docRef.id, ...template });
      console.log(`✅ Created callsheet template: ${template.name}`);
    }

    return createdTemplates;
  }

  async seedDailyCallsheetRecords() {
    console.log('📋 Seeding daily callsheet records...');
    
    const records = [];
    const statuses = ['active', 'completed', 'pending', 'cancelled'];
    
    // Generate 20 daily callsheet records
    for (let i = 0; i < 20; i++) {
      const record = {
        title: this.faker.company.catchPhrase(),
        description: this.faker.lorem.paragraph(),
        status: this.faker.helpers.arrayElement(statuses),
        projectId: this.faker.string.uuid(),
        projectName: this.faker.company.name(),
        date: this.faker.date.recent({ days: 30 }),
        callTime: this.faker.date.recent({ days: 1 }),
        location: this.faker.location.streetAddress(),
        director: this.faker.person.fullName(),
        producer: this.faker.person.fullName(),
        crew: [
          { name: this.faker.person.fullName(), role: 'Camera Operator' },
          { name: this.faker.person.fullName(), role: 'Sound Operator' },
          { name: this.faker.person.fullName(), role: 'Grip' }
        ],
        equipment: [
          { name: 'Camera', value: 'Sony FX6' },
          { name: 'Lenses', value: '24-70mm, 85mm' },
          { name: 'Audio', value: 'Wireless Lavs, Boom Mic' }
        ],
        notes: this.faker.lorem.sentence(),
        organizationId: this.organizationId,
        createdBy: this.userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = await db.collection('dailyCallSheetRecords').add(record);
      records.push({ id: docRef.id, ...record });
    }
    
    console.log(`✅ Created ${records.length} daily callsheet records`);
    return records;
  }

  async assignTemplatesToUsers() {
    console.log('📋 Assigning templates to users...');
    
    // Get all users in the organization
    const usersSnapshot = await db.collection('users')
      .where('organizationId', '==', this.organizationId)
      .get();
    
    if (usersSnapshot.empty) {
      console.log('⚠️  No users found in organization. Skipping template assignments.');
      return;
    }
    
    // Get the default timecard template
    const templatesSnapshot = await db.collection('timecard_templates')
      .where('organizationId', '==', this.organizationId)
      .where('name', '==', 'Default')
      .limit(1)
      .get();
    
    if (templatesSnapshot.empty) {
      console.log('⚠️  No default timecard template found. Skipping assignments.');
      return;
    }
    
    const defaultTemplate = templatesSnapshot.docs[0];
    
    // Assign default template to all users
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      
      // Check if assignment already exists
      const existingAssignment = await db.collection('timecard_template_assignments')
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .limit(1)
        .get();
      
      if (existingAssignment.empty) {
        await db.collection('timecard_template_assignments').add({
          userId: userId,
          templateId: defaultTemplate.id,
          isActive: true,
          assignedBy: 'system',
          assignedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Assigned default template to user: ${userId}`);
      }
    }
  }

  async run() {
    try {
      console.log('🚀 Starting Template Seeding Process');
      console.log('=====================================');
      
      // Initialize faker
      await this.initializeFaker();
      
      // Update userId with actual enterprise user ID
      const userSnapshot = await db.collection('users')
        .where('email', '==', 'enterprise.user@enterprisemedia.com')
        .limit(1)
        .get();
      
      if (!userSnapshot.empty) {
        this.userId = userSnapshot.docs[0].id;
        console.log(`✅ Found enterprise user: ${this.userId}`);
      } else {
        console.log('⚠️  Enterprise user not found. Using placeholder ID.');
      }
      
      // Seed templates
      const timecardTemplates = await this.seedTimecardTemplates();
      const callsheetTemplates = await this.seedCallsheetTemplates();
      const dailyRecords = await this.seedDailyCallsheetRecords();
      
      // Assign templates to users
      await this.assignTemplatesToUsers();
      
      console.log('\n✅ Template Seeding Complete!');
      console.log('==============================');
      console.log(`📋 Timecard Templates: ${timecardTemplates.length}`);
      console.log(`📋 Callsheet Templates: ${callsheetTemplates.length}`);
      console.log(`📋 Daily Callsheet Records: ${dailyRecords.length}`);
      console.log('\n🎯 Ready for application testing!');
      
    } catch (error) {
      console.error('❌ Template seeding failed:', error);
      throw error;
    }
  }
}

// Run the seeder
const seeder = new TemplateSeeder();
seeder.run()
  .then(() => {
    console.log('🎉 Template seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Template seeding failed:', error);
    process.exit(1);
  });
