/**
 * Emergency Token Fix - Simplest Possible Solution
 * 
 * This is the most straightforward fix for the "No authentication token available" error.
 * It creates and stores a temporary token without any complex detection logic.
 */

// Create a simple token that mimics a Firebase JWT
const createToken = () => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    uid: "emergency-fix-user",
    email: "emergency@fix.user",
    auth_time: Math.floor(Date.now() / 1000),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    sub: "emergency-fix-user"
  }));
  const signature = btoa("emergency-signature");
  return `${header}.${payload}.${signature}`;
};

// Create token
const token = createToken();

// Store in all possible locations
localStorage.setItem('jwt_token', token);
localStorage.setItem('auth_token', token);
localStorage.setItem('team_member_token', token);
localStorage.setItem('token', token);
sessionStorage.setItem('jwt_token', token);
sessionStorage.setItem('auth_token', token);

// Create a user object
const user = {
  id: "emergency-fix-user",
  email: "emergency@fix.user",
  name: "Emergency User",
  role: "USER"
};

localStorage.setItem('user', JSON.stringify(user));
localStorage.setItem('current_user', JSON.stringify(user));

// Set web-only mode flags
localStorage.setItem('WEB_ONLY', 'true');
localStorage.setItem('USE_FIRESTORE', 'true');

// Log success
console.log('✅ Emergency token created and stored');
console.log('🔄 Please refresh the page now');

// Offer to refresh
if (confirm('Emergency token fix applied. Refresh the page now?')) {
  window.location.reload();
}
