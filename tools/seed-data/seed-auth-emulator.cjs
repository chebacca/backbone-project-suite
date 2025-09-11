const admin = require('firebase-admin');

// Initialize Firebase Admin SDK for emulators
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function seedAuthEmulator() {
  console.log('🌱 Seeding Authentication Emulator with team members...');
  
  try {
    // Get all users from Firestore
    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Found ${usersSnapshot.size} users in Firestore`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const email = userData.email;
      const displayName = userData.displayName || `${userData.firstName} ${userData.lastName}`;
      const uid = userData.uid;
      
      try {
        // Create user in Authentication
        await auth.createUser({
          uid: uid,
          email: email,
          displayName: displayName,
          password: 'Enterprise123!', // Default password for all users
          emailVerified: true
        });
        
        console.log(`✅ Created auth user: ${email} (${displayName})`);
        successCount++;
        
      } catch (error) {
        if (error.code === 'auth/uid-already-exists') {
          console.log(`⚠️  User already exists: ${email}`);
          successCount++;
        } else {
          console.error(`❌ Error creating user ${email}:`, error.message);
          errorCount++;
        }
      }
    }
    
    console.log(`\n🎉 Authentication seeding complete!`);
    console.log(`✅ Successfully created/verified: ${successCount} users`);
    if (errorCount > 0) {
      console.log(`❌ Errors: ${errorCount} users`);
    }
    
    // Test credentials
    console.log(`\n🔑 Test Credentials:`);
    console.log(`Email: enterprise.user@enterprisemedia.com`);
    console.log(`Password: Enterprise123!`);
    console.log(`\n🌐 Login URLs:`);
    console.log(`Dashboard: http://localhost:5002`);
    console.log(`Licensing: http://localhost:5001`);
    
  } catch (error) {
    console.error('❌ Error seeding authentication:', error);
  }
}

// Run the seeding
seedAuthEmulator().then(() => {
  console.log('\n✨ Done! You can now login to both applications.');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
