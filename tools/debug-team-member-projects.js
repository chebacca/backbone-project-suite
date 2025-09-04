#!/usr/bin/env node

/**
 * Debug Team Member Projects
 * 
 * This script checks what's actually in Firestore for team member project assignments
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function debugTeamMemberProjects() {
  console.log('🔍 [Debug] Checking team member project assignments...');
  
  try {
    // 1. Check what team members exist
    console.log('\n📋 [Debug] Checking team members collection...');
    const teamMembersQuery = await db.collection('teamMembers').get();
    
    if (teamMembersQuery.empty) {
      console.log('❌ No team members found');
      return;
    }
    
    console.log(`✅ Found ${teamMembersQuery.size} team members:`);
    teamMembersQuery.forEach(doc => {
      const data = doc.data();
      console.log(`   - ID: ${doc.id}, Email: ${data.email}, Status: ${data.status}, OrgId: ${data.organizationId}`);
    });
    
    // 2. Check project assignments
    console.log('\n📋 [Debug] Checking projectTeamMembers collection...');
    const projectAssignmentsQuery = await db.collection('projectTeamMembers').get();
    
    if (projectAssignmentsQuery.empty) {
      console.log('❌ No project assignments found');
    } else {
      console.log(`✅ Found ${projectAssignmentsQuery.size} project assignments:`);
      projectAssignmentsQuery.forEach(doc => {
        const data = doc.data();
        console.log(`   - Assignment ID: ${doc.id}`);
        console.log(`     Team Member ID: ${data.teamMemberId}`);
        console.log(`     Project ID: ${data.projectId}`);
        console.log(`     Role: ${data.role}`);
        console.log(`     Active: ${data.isActive}`);
        console.log(`     ---`);
      });
    }
    
    // 3. Check projects collection
    console.log('\n📋 [Debug] Checking projects collection...');
    const projectsQuery = await db.collection('projects').get();
    
    if (projectsQuery.empty) {
      console.log('❌ No projects found');
    } else {
      console.log(`✅ Found ${projectsQuery.size} projects:`);
      projectsQuery.forEach(doc => {
        const data = doc.data();
        console.log(`   - Project ID: ${doc.id}, Name: ${data.name}, Owner: ${data.ownerId}, Active: ${data.isActive}`);
      });
    }
    
    // 4. Try to match team member with projects
    console.log('\n🔍 [Debug] Trying to match team members with projects...');
    
    for (const teamMemberDoc of teamMembersQuery.docs) {
      const teamMemberId = teamMemberDoc.id;
      const teamMemberData = teamMemberDoc.data();
      
      console.log(`\n👤 Team Member: ${teamMemberData.email} (ID: ${teamMemberId})`);
      
      // Find assignments for this team member
      const assignments = projectAssignmentsQuery.docs.filter(doc => {
        const data = doc.data();
        return data.teamMemberId === teamMemberId && data.isActive;
      });
      
      if (assignments.length === 0) {
        console.log(`   ❌ No active project assignments found`);
        
        // Create a test assignment
        console.log(`   🔧 Creating test project assignment...`);
        
        // Get first available project
        if (!projectsQuery.empty) {
          const firstProject = projectsQuery.docs[0];
          const projectData = firstProject.data();
          
          const assignmentData = {
            teamMemberId: teamMemberId,
            projectId: firstProject.id,
            role: 'ADMIN',
            isActive: true,
            assignedAt: admin.firestore.FieldValue.serverTimestamp(),
            assignedBy: 'debug-script'
          };
          
          await db.collection('projectTeamMembers').add(assignmentData);
          console.log(`   ✅ Created assignment: ${teamMemberData.email} → ${projectData.name}`);
        }
      } else {
        console.log(`   ✅ Found ${assignments.length} active assignments:`);
        assignments.forEach(assignmentDoc => {
          const assignmentData = assignmentDoc.data();
          const project = projectsQuery.docs.find(p => p.id === assignmentData.projectId);
          const projectName = project ? project.data().name : 'Unknown Project';
          console.log(`     - ${projectName} (Role: ${assignmentData.role})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ [Debug] Error:', error);
  }
}

// Run the debug
debugTeamMemberProjects().then(() => {
  console.log('\n🎉 [Debug] Debug complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ [Debug] Fatal error:', error);
  process.exit(1);
});
