#!/usr/bin/env node

/**
 * 🔍 DEBUG USER TOKEN CLAIMS
 * 
 * This script checks what custom claims are actually in the user's current Firebase token
 * and compares them with what we expect to be there.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (uses default credentials)
if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'backbone-logic' });
}

const auth = admin.auth();

async function debugUserTokenClaims() {
  try {
    console.log('🔍 Debugging User Token Claims...\n');

    const email = 'enterprise.user@enterprisemedia.com';
    
    // Get Firebase user
    const firebaseUser = await auth.getUserByEmail(email);
    console.log(`🔍 Found Firebase user: ${email} (UID: ${firebaseUser.uid})`);
    
    // Get current user record with custom claims
    const userRecord = await auth.getUser(firebaseUser.uid);
    console.log('\n📋 Current custom claims in Firebase Auth:');
    console.log(JSON.stringify(userRecord.customClaims, null, 2));
    
    // Check tokens valid after time
    console.log(`\n🕐 Tokens valid after: ${new Date(userRecord.tokensValidAfterTime).toISOString()}`);
    console.log(`🕐 Current time: ${new Date().toISOString()}`);
    
    // Check if custom claims include expected organization access
    const claims = userRecord.customClaims || {};
    
    console.log('\n🔍 CLAIMS ANALYSIS:');
    console.log(`✅ Email: ${claims.email || 'MISSING'}`);
    console.log(`✅ Role: ${claims.role || 'MISSING'}`);
    console.log(`✅ Primary Organization: ${claims.organizationId || 'MISSING'}`);
    console.log(`✅ Secondary Organization: ${claims.secondaryOrganizationId || 'MISSING'}`);
    console.log(`✅ Accessible Organizations: ${JSON.stringify(claims.accessibleOrganizations || [])}`);
    console.log(`✅ Effective Hierarchy: ${claims.effectiveHierarchy || 'MISSING'}`);
    console.log(`✅ Permissions: ${JSON.stringify(claims.permissions || [])}`);
    
    // Check if user has access to the organization they're trying to query
    const targetOrg = 'enterprise_media_org';
    const hasAccess = claims.organizationId === targetOrg || 
                     claims.secondaryOrganizationId === targetOrg ||
                     (claims.accessibleOrganizations && claims.accessibleOrganizations.includes(targetOrg));
    
    console.log(`\n🎯 ACCESS CHECK for "${targetOrg}":`, hasAccess ? '✅ ALLOWED' : '❌ DENIED');
    
    if (!hasAccess) {
      console.log('\n🚨 PROBLEM IDENTIFIED:');
      console.log(`The user is trying to access organization "${targetOrg}" but their custom claims don't include access to it.`);
      console.log('\n🔧 SOLUTION: Update custom claims to include this organization.');
    } else {
      console.log('\n✅ CLAIMS LOOK CORRECT:');
      console.log('The user should have access. The issue might be:');
      console.log('1. Token caching in the browser');
      console.log('2. Firebase rules not matching the claims properly');
      console.log('3. The app is using an old cached token');
    }
    
    // Generate a test custom token to verify claims work
    console.log('\n🧪 GENERATING TEST TOKEN...');
    const testToken = await auth.createCustomToken(firebaseUser.uid, claims);
    console.log('✅ Test token generated successfully (claims are valid)');
    
  } catch (error) {
    console.error('❌ Error debugging user token claims:', error);
    process.exit(1);
  }
}

// Run the debug
debugUserTokenClaims()
  .then(() => {
    console.log('\n✅ Debug completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });
