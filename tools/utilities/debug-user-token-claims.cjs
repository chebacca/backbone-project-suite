#!/usr/bin/env node

/**
 * Debug User Token Claims
 * Check what claims the enterprise user has in their Firebase token
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration
const firebaseConfig = {
  projectId: 'backbone-logic',
  apiKey: 'AIzaSyDFnIzSYCdPsDDdvP1lympVxEeUn0AQhWs',
  authDomain: 'backbone-logic.firebaseapp.com',
  databaseURL: 'https://backbone-logic-default-rtdb.firebaseio.com',
  storageBucket: 'backbone-logic.firebasestorage.app',
  messagingSenderId: '749245129278',
  appId: '1:749245129278:web:dfa5647101ea160a3b276f',
  measurementId: 'G-8SZRDQ4XVR'
};

async function debugUserToken() {
  console.log('🔍 Debugging User Token Claims...\n');
  
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
    // Sign in with enterprise user
    const userCredential = await signInWithEmailAndPassword(auth, 'enterprise.user@enterprisemedia.com', 'Enterprise123!');
    const user = userCredential.user;
    
    console.log('✅ Authentication successful');
    console.log(`   User ID: ${user.uid}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Display Name: ${user.displayName}`);
    
    // Get the ID token to inspect claims
    const idToken = await user.getIdToken();
    const tokenResult = await user.getIdTokenResult();
    
    console.log('\n🔑 Token Claims:');
    console.log('================');
    console.log(JSON.stringify(tokenResult.claims, null, 2));
    
    // Check specific claims that the rules are looking for
    console.log('\n🎯 Key Claims for Firestore Rules:');
    console.log('===================================');
    console.log(`organizationId: ${tokenResult.claims.organizationId || 'NOT SET'}`);
    console.log(`organizations: ${JSON.stringify(tokenResult.claims.organizations) || 'NOT SET'}`);
    console.log(`role: ${tokenResult.claims.role || 'NOT SET'}`);
    console.log(`email: ${tokenResult.claims.email || 'NOT SET'}`);
    
    // Check if user is enterprise
    const isEnterprise = user.email.includes('@enterprisemedia.com');
    console.log(`isEnterprise: ${isEnterprise}`);
    
    console.log('\n📋 Analysis:');
    console.log('============');
    
    if (!tokenResult.claims.organizationId && !tokenResult.claims.organizations) {
      console.log('❌ PROBLEM: User has no organization claims in token');
      console.log('   This will cause Firestore rules to fail');
      console.log('   Solution: Need to set custom claims for the user');
    } else {
      console.log('✅ User has organization claims');
    }
    
    if (!tokenResult.claims.role) {
      console.log('❌ PROBLEM: User has no role claim in token');
      console.log('   This will cause role-based rules to fail');
    } else {
      console.log('✅ User has role claim');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the debug
if (require.main === module) {
  debugUserToken().catch(console.error);
}

module.exports = { debugUserToken };