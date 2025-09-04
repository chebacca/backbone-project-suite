#!/usr/bin/env node

/**
 * 🔥 Seed Both Firebase Emulator Instances
 * 
 * This script seeds both emulator instances with test users:
 * - Dashboard emulators (ports 9099, 8080)
 * - Licensing emulators (ports 9098, 8081)
 */

const { initializeApp } = require('firebase/app');
const { getAuth, connectAuthEmulator, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator, doc, setDoc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  projectId: 'backbone-logic',
  apiKey: 'demo-api-key',
  authDomain: 'backbone-logic.firebaseapp.com',
  storageBucket: 'backbone-logic.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456'
};

// Test users to create
const testUsers = [
  { email: 'admin@backbone.test', password: 'password123', role: 'admin', name: 'Admin User' },
  { email: 'editor@backbone.test', password: 'password123', role: 'editor', name: 'Editor User' },
  { email: 'producer@backbone.test', password: 'password123', role: 'producer', name: 'Producer User' },
  { email: 'client@backbone.test', password: 'password123', role: 'client', name: 'Client User' },
  { email: 'enterprise.user@enterprisemedia.com', password: 'Enterprise123!', role: 'admin', name: 'Enterprise User' },
  { email: 'chebacca@gmail.com', password: 'admin1234', role: 'admin', name: 'Chebacca Admin' }
];

async function seedEmulatorInstance(authPort, firestorePort, instanceName) {
  console.log(`\n🌱 Seeding ${instanceName} (Auth: ${authPort}, Firestore: ${firestorePort})...`);
  
  try {
    // Initialize Firebase app for this instance
    const app = initializeApp(firebaseConfig, instanceName);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    // Connect to emulators
    connectAuthEmulator(auth, `http://localhost:${authPort}`, { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', firestorePort);
    
    console.log(`✅ Connected to ${instanceName} emulators`);
    
    // Create test users
    for (const user of testUsers) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
        const uid = userCredential.user.uid;
        
        // Add user document to Firestore
        await setDoc(doc(db, 'users', uid), {
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: new Date(),
          organizationId: 'enterprise-media-solutions',
          isActive: true
        });
        
        console.log(`   ✅ Created user: ${user.email} (${user.role})`);
        
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`   ⚠️  User already exists: ${user.email}`);
        } else {
          console.error(`   ❌ Failed to create user ${user.email}:`, error.message);
        }
      }
    }
    
    console.log(`✅ ${instanceName} seeding completed`);
    
  } catch (error) {
    console.error(`❌ Failed to seed ${instanceName}:`, error.message);
  }
}

async function main() {
  console.log('🔥 Seeding Both Firebase Emulator Instances');
  console.log('============================================');
  
  // Wait a bit for emulators to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Seed Dashboard emulators
  await seedEmulatorInstance(9099, 8080, 'dashboard');
  
  // Seed Licensing emulators
  await seedEmulatorInstance(9098, 8081, 'licensing');
  
  console.log('\n🎉 Both emulator instances seeded successfully!');
  console.log('\n🔐 Test Credentials (Both Projects):');
  testUsers.forEach(user => {
    console.log(`   • ${user.email} (password: ${user.password}) - Role: ${user.role}`);
  });
  
  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

// Run the seeding
main().catch(console.error);
