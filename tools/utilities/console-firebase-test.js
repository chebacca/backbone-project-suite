// 🔍 BACKBONE Firebase Debug Test
// Copy and paste this into the browser console at https://backbone-client.web.app

console.log('🔍 BACKBONE Firebase Debug Test');
console.log('================================');

// Check Firebase objects
console.log('🔥 Firebase Objects:');
console.log('  window.firebaseApp:', !!window.firebaseApp, window.firebaseApp);
console.log('  window.firebaseAuth:', !!window.firebaseAuth, window.firebaseAuth);
console.log('  window.firebaseFirestore:', !!window.firebaseFirestore, window.firebaseFirestore);

// Check BACKBONE flags
console.log('🎯 BACKBONE Flags:');
console.log('  window.WEBONLY_MODE:', window.WEBONLY_MODE);
console.log('  window.USE_FIRESTORE:', window.USE_FIRESTORE);
console.log('  window.DISABLE_HTTP_API:', window.DISABLE_HTTP_API);

// Check localStorage
console.log('💾 LocalStorage:');
const authKeys = ['firebase_id_token', 'team_member_token', 'auth_token', 'jwt_token', 'token', 'is_authenticated', 'firebase_authenticated'];
authKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`  ${key}:`, value ? 'present' : 'missing', value ? `(${value.substring(0, 20)}...)` : '');
});

// Test Firebase readiness (simulate ensureFirebaseAuthReady)
console.log('🧪 Testing Firebase Readiness:');
const hasFirebaseApp = !!window.firebaseApp;
const hasFirebaseAuth = !!window.firebaseAuth;

console.log('  hasFirebaseApp:', hasFirebaseApp);
console.log('  hasFirebaseAuth:', hasFirebaseAuth);

if (hasFirebaseApp && hasFirebaseAuth) {
    try {
        const testCurrentUser = window.firebaseAuth.currentUser;
        console.log('✅ Firebase Auth validation passed');
        console.log('  Current user:', testCurrentUser ? testCurrentUser.email : 'anonymous');
        console.log('🎉 Firebase is ready - sign-in should work!');
    } catch (authTestError) {
        console.log('❌ Firebase Auth validation failed:', authTestError.message);
    }
} else {
    console.log('❌ Firebase is NOT ready - this would cause sign-in to fail');
    console.log('💡 Check if Firebase initialization completed in main.tsx');
}

// Test functions
console.log('🧪 Test Functions:');
console.log('  window.testFirebase:', typeof window.testFirebase);
console.log('  window.testConsole:', typeof window.testConsole);

if (typeof window.testFirebase === 'function') {
    console.log('🔥 Running window.testFirebase():');
    window.testFirebase();
}

// Check for any Firebase initialization errors
console.log('🔍 Checking for initialization errors...');
console.log('  Check the console above for any Firebase initialization errors');

console.log('================================');
console.log('🔍 BACKBONE Firebase Debug Complete');
