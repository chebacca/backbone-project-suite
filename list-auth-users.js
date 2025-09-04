#!/usr/bin/env node

const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'backbone-logic' });
}

const auth = getAuth();

async function listAuthUsers() {
  try {
    const listUsersResult = await auth.listUsers();
    console.log('🔐 Firebase Auth Users Available for Login:');
    console.log('==========================================');
    
    listUsersResult.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.displayName || 'No display name'}`);
    });
    
    console.log(`\n📊 Total users: ${listUsersResult.users.length}`);
    console.log(`\n🔑 Default password for @enterprisemedia.com users: Enterprise123!`);
    console.log(`🔑 Password for chebacca@gmail.com: admin1234`);
    console.log(`🔑 Password for other @example.com users: password123`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

listAuthUsers().then(() => process.exit(0));
