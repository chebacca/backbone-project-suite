const admin = require('firebase-admin');

console.log('🔍 Checking Lissa\'s Firebase user status...\n');

// Initialize Firebase Admin
try {
  console.log('1️⃣ Initializing Firebase Admin SDK...');
  
  const projectId = 'backbone-logic';
  console.log(`   Project ID: ${projectId}`);
  
  if (!admin.apps.length) {
    console.log('   Using Application Default Credentials...');
    admin.initializeApp({ projectId });
  }
  
  console.log('   ✅ Firebase Admin SDK initialized successfully\n');
} catch (error) {
  console.error('   ❌ Failed to initialize Firebase Admin SDK:', error.message);
  process.exit(1);
}

const auth = admin.auth();

async function checkLissaUser() {
  const email = 'lissa@apple.com';
  
  try {
    console.log('2️⃣ Checking Firebase user for:', email);
    
    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    
    console.log('✅ User found!');
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   Display Name: ${userRecord.displayName}`);
    console.log(`   Email Verified: ${userRecord.emailVerified}`);
    console.log(`   Disabled: ${userRecord.disabled}`);
    console.log(`   Created: ${userRecord.metadata.creationTime}`);
    console.log(`   Last Sign In: ${userRecord.metadata.lastSignInTime}`);
    
    // Check if we can sign in with the password
    console.log('\n3️⃣ Testing password authentication...');
    
    try {
      // Try to sign in with the password
      const signInResult = await auth.verifyPassword(email, 'Admin1234!');
      console.log('✅ Password verification successful!');
    } catch (error) {
      console.log('❌ Password verification failed:', error.message);
      
      // Try to update the password
      console.log('\n4️⃣ Attempting to update password...');
      try {
        await auth.updateUser(userRecord.uid, {
          password: 'Admin1234!'
        });
        console.log('✅ Password updated successfully!');
        
        // Test again
        console.log('\n5️⃣ Testing updated password...');
        try {
          await auth.verifyPassword(email, 'Admin1234!');
          console.log('✅ Updated password verification successful!');
        } catch (error2) {
          console.log('❌ Updated password verification still failed:', error2.message);
        }
      } catch (updateError) {
        console.log('❌ Failed to update password:', updateError.message);
      }
    }
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log('❌ User not found in Firebase Auth');
      console.log('   This means the user was never created or was deleted');
    } else {
      console.error('❌ Error checking user:', error.message);
    }
  }
}

async function main() {
  try {
    await checkLissaUser();
    process.exit(0);
  } catch (error) {
    console.error('❌ Check failed:', error.message);
    process.exit(1);
  }
}

main();
