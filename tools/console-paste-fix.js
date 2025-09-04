// Copy and paste this entire script into your browser console to fix the "No authentication token available" error
(async function() {
  console.log('🔧 Starting Authentication Fix...');
  
  // Find Firebase Auth
  let auth = null;
  
  // Try multiple ways to get Firebase Auth
  if (window.firebaseAuth) {
    console.log('✅ Found Firebase Auth in window.firebaseAuth');
    auth = window.firebaseAuth;
  } else if (window.firebase && typeof window.firebase.auth === 'function') {
    console.log('✅ Getting Firebase Auth from window.firebase');
    auth = window.firebase.auth();
    window.firebaseAuth = auth;
  } else if (typeof firebase !== 'undefined' && typeof firebase.auth === 'function') {
    console.log('✅ Getting Firebase Auth from global firebase');
    auth = firebase.auth();
    window.firebaseAuth = auth;
  } else {
    console.error('❌ Firebase Auth not found');
  }
  
  // Refresh token if auth is available
  let token = null;
  if (auth && auth.currentUser) {
    try {
      console.log('🔄 Refreshing token...');
      token = await auth.currentUser.getIdToken(true);
      console.log('✅ Token refreshed successfully');
    } catch (e) {
      console.error('❌ Error refreshing token:', e);
    }
  } else {
    console.log('⚠️ No authenticated user found');
  }
  
  // Store token in localStorage
  if (token) {
    console.log('💾 Storing token in localStorage...');
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('team_member_token', token);
    localStorage.setItem('token', token);
    console.log('✅ Token stored successfully');
  }
  
  // Patch ProjectSelectionService if available
  let patched = false;
  if (window.projectSelectionService) {
    try {
      console.log('🔧 Patching projectSelectionService...');
      const originalMethod = window.projectSelectionService.fetchAvailableProjects;
      
      window.projectSelectionService.fetchAvailableProjects = async function() {
        console.log('🔧 Patched fetchAvailableProjects called');
        
        // Refresh token before calling original method
        if (auth && auth.currentUser) {
          const newToken = await auth.currentUser.getIdToken(true);
          if (newToken) {
            localStorage.setItem('jwt_token', newToken);
            localStorage.setItem('auth_token', newToken);
            localStorage.setItem('team_member_token', newToken);
            localStorage.setItem('token', newToken);
          }
        }
        
        // Call original method
        return await originalMethod.apply(this, arguments);
      };
      
      console.log('✅ Successfully patched projectSelectionService');
      patched = true;
    } catch (e) {
      console.error('❌ Error patching projectSelectionService:', e);
    }
  } else {
    console.log('⚠️ projectSelectionService not found');
  }
  
  console.log('✅ Authentication fix completed');
  
  if (patched) {
    console.log('🔄 Try refreshing the page or navigating to trigger the patched method');
  } else {
    console.log('⚠️ Could not patch projectSelectionService. Try refreshing the page and running this script again.');
  }
})();
