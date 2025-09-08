#!/usr/bin/env node

/**
 * 🔄 FORCE TOKEN REFRESH FOR ENTERPRISE USER
 * 
 * This script forces the Firebase Auth token to refresh for enterprise.user@enterprisemedia.com
 * so they get a new token with the updated custom claims.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (uses default credentials)
if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'backbone-logic' });
}

const auth = admin.auth();

async function forceTokenRefresh() {
  try {
    console.log('🔄 Forcing Token Refresh for Enterprise User...\n');

    const email = 'enterprise.user@enterprisemedia.com';
    
    // Get Firebase user
    const firebaseUser = await auth.getUserByEmail(email);
    console.log(`🔍 Found Firebase user: ${email} (UID: ${firebaseUser.uid})`);
    
    // Get current custom claims
    const userRecord = await auth.getUser(firebaseUser.uid);
    console.log('📋 Current custom claims:', JSON.stringify(userRecord.customClaims, null, 2));
    
    // Force revoke all refresh tokens to invalidate existing tokens
    console.log('\n🔄 Revoking all existing refresh tokens...');
    await auth.revokeRefreshTokens(firebaseUser.uid);
    console.log('✅ All refresh tokens revoked');
    
    // Get the updated user record to see the new validSince timestamp
    const updatedUserRecord = await auth.getUser(firebaseUser.uid);
    console.log(`🕐 New validSince timestamp: ${new Date(updatedUserRecord.tokensValidAfterTime).toISOString()}`);
    
    console.log('\n🎉 Token refresh forced successfully!');
    console.log('\n📋 IMPORTANT INSTRUCTIONS:');
    console.log('1. The user MUST completely log out of the licensing website');
    console.log('2. Clear browser cache/cookies for the site (optional but recommended)');
    console.log('3. Log back in to get a fresh token with updated custom claims');
    console.log('4. The new token will include all organization access permissions');
    
    console.log('\n🔧 Alternative: If still having issues, the user can:');
    console.log('- Open browser developer tools');
    console.log('- Go to Application > Storage > Clear storage');
    console.log('- Refresh the page and log in again');
    
  } catch (error) {
    console.error('❌ Error forcing token refresh:', error);
    process.exit(1);
  }
}

// Run the refresh
forceTokenRefresh()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
