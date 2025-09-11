/**
 * Find Project Assignments for Enterprise User
 * Search through Firestore collections to find project assignments
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (using environment variables like other scripts)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function findProjectAssignments() {
  console.log('🔍 Searching for project assignments for enterprise.user@enterprisemedia.com...\n');
  
  const teamMemberEmail = 'enterprise.user@enterprisemedia.com';
  const teamMemberId = '2ysTqv3pwiXyKxOeExAfEKOIh7K2';
  const organizationId = 'enterprise-org-001';
  
  // Collections to check for project assignments
  const collections = [
    'projectTeamMembers',
    'project_team_members', 
    'projectAssignments',
    'project_assignments',
    'teamMemberProjects',
    'team_member_projects'
  ];
  
  let foundAssignments = false;
  
  for (const collectionName of collections) {
    try {
      console.log(`--- Checking ${collectionName} collection ---`);
      
      // Get all documents in the collection first (small collections)
      const allDocs = await db.collection(collectionName).limit(50).get();
      
      if (allDocs.empty) {
        console.log(`📭 Collection ${collectionName} is empty or doesn't exist`);
        continue;
      }
      
      console.log(`📊 Found ${allDocs.size} total documents in ${collectionName}`);
      
      // Check each document for our user
      let userAssignments = [];
      allDocs.forEach(doc => {
        const data = doc.data();
        
        // Check if this document relates to our user
        if (data.teamMemberEmail === teamMemberEmail || 
            data.teamMemberId === teamMemberId ||
            data.email === teamMemberEmail ||
            data.userId === teamMemberId) {
          userAssignments.push({ id: doc.id, data });
        }
      });
      
      if (userAssignments.length > 0) {
        console.log(`✅ Found ${userAssignments.length} assignments for enterprise user:`);
        foundAssignments = true;
        
        userAssignments.forEach(assignment => {
          console.log(`  📋 Document ID: ${assignment.id}`);
          console.log(`     Project ID: ${assignment.data.projectId || assignment.data.projectName || 'Unknown'}`);
          console.log(`     Role: ${assignment.data.role || assignment.data.teamMemberRole || 'Unknown'}`);
          console.log(`     Status: ${assignment.data.status || assignment.data.isActive || 'Unknown'}`);
          console.log(`     Assigned: ${assignment.data.assignedAt || assignment.data.createdAt || 'Unknown'}`);
          console.log(`     Full Data: ${JSON.stringify(assignment.data, null, 2)}`);
          console.log('');
        });
      } else {
        console.log(`📭 No assignments found for enterprise user in ${collectionName}`);
      }
      
    } catch (error) {
      console.error(`❌ Error checking ${collectionName}:`, error.message);
    }
    console.log('');
  }
  
  // Also check projects collection
  console.log('--- Checking projects collection for enterprise organization ---');
  try {
    const projectsSnapshot = await db.collection('projects')
      .where('organizationId', '==', organizationId)
      .get();
    
    if (!projectsSnapshot.empty) {
      console.log(`📊 Found ${projectsSnapshot.size} projects in organization ${organizationId}:`);
      projectsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  📋 Project ID: ${doc.id}`);
        console.log(`     Name: ${data.name || data.projectName || 'Unnamed'}`);
        console.log(`     Status: ${data.status || 'Unknown'}`);
        console.log(`     Created: ${data.createdAt || 'Unknown'}`);
        console.log(`     Owner: ${data.ownerId || data.createdBy || 'Unknown'}`);
        console.log('');
      });
    } else {
      console.log('📭 No projects found for organization');
    }
  } catch (error) {
    console.error('❌ Error checking projects:', error.message);
  }
  
  // Summary
  console.log('\n🎯 SUMMARY:');
  console.log('===========');
  if (foundAssignments) {
    console.log('✅ Found project assignments in Firestore');
  } else {
    console.log('❌ No project assignments found in Firestore');
    console.log('📝 This explains why the frontend shows "No projects available"');
    console.log('💡 The project access data exists in the API response but not in Firestore collections');
  }
}

findProjectAssignments().then(() => process.exit(0)).catch(console.error);
