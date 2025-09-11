/**
 * Check Enterprise User Data Connection
 */

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function checkEnterpriseUserData() {
  try {
    console.log('🔍 Checking Enterprise User Data Connection...\n');
    
    const enterpriseEmail = 'enterprise.user@enterprisemedia.com';
    const organizationId = 'enterprise-org-001';
    
    console.log(`👤 Checking user: ${enterpriseEmail}`);
    console.log(`🏢 Organization: ${organizationId}\n`);
    
    // 1. Check user document
    const userDoc = await db.collection('users').doc(enterpriseEmail).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('✅ User document found:');
      console.log(`   Email: ${userData.email}`);
      console.log(`   Organization: ${userData.organizationId}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   Status: ${userData.status || 'No status'}`);
    } else {
      console.log('❌ User document not found in Firestore');
    }
    
    // 2. Check sessions for this organization
    console.log(`\n🎬 Sessions for organization ${organizationId}:`);
    const sessionsQuery = await db.collection('sessions')
      .where('organizationId', '==', organizationId)
      .limit(10)
      .get();
      
    console.log(`   Found ${sessionsQuery.size} sessions`);
    
    if (sessionsQuery.size > 0) {
      console.log('   Sample sessions:');
      sessionsQuery.forEach((doc, index) => {
        const data = doc.data();
        console.log(`     ${index + 1}. ${data.name || data.sessionName || doc.id}`);
        console.log(`        Status: ${data.status}`);
        console.log(`        Project: ${data.projectId || 'No project'}`);
      });
    }
    
    // 3. Check projects for this organization
    console.log(`\n📁 Projects for organization ${organizationId}:`);
    const projectsQuery = await db.collection('projects')
      .where('organizationId', '==', organizationId)
      .limit(10)
      .get();
      
    console.log(`   Found ${projectsQuery.size} projects`);
    
    if (projectsQuery.size > 0) {
      console.log('   Sample projects:');
      projectsQuery.forEach((doc, index) => {
        const data = doc.data();
        console.log(`     ${index + 1}. ${data.name || data.projectName || doc.id}`);
        console.log(`        Status: ${data.status || 'No status'}`);
      });
    }
    
    // 4. Check team members
    console.log(`\n👥 Team members for organization ${organizationId}:`);
    const teamMembersQuery = await db.collection('teamMembers')
      .where('organizationId', '==', organizationId)
      .limit(5)
      .get();
      
    console.log(`   Found ${teamMembersQuery.size} team members`);
    
    if (teamMembersQuery.size > 0) {
      console.log('   Sample team members:');
      teamMembersQuery.forEach((doc, index) => {
        const data = doc.data();
        console.log(`     ${index + 1}. ${data.email || doc.id}`);
        console.log(`        Role: ${data.role || 'No role'}`);
        console.log(`        Status: ${data.status || 'No status'}`);
      });
    }
    
    // 5. Summary
    console.log('\n📊 Data Summary for Dashboard:');
    console.log(`   User exists: ${userDoc.exists ? '✅' : '❌'}`);
    console.log(`   Sessions available: ${sessionsQuery.size > 0 ? '✅' : '❌'} (${sessionsQuery.size})`);
    console.log(`   Projects available: ${projectsQuery.size > 0 ? '✅' : '❌'} (${projectsQuery.size})`);
    console.log(`   Team members: ${teamMembersQuery.size > 0 ? '✅' : '❌'} (${teamMembersQuery.size})`);
    
    console.log('\n🔧 Dashboard Login Instructions:');
    console.log(`   Email: ${enterpriseEmail}`);
    console.log(`   Password: [Use the existing password for this user]`);
    console.log(`   Expected data: ${sessionsQuery.size} sessions, ${projectsQuery.size} projects`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkEnterpriseUserData();
