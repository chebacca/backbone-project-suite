# Authentication 401 Error Fix

## Problem Description

You are experiencing a cascade of 401 Unauthorized errors across multiple API endpoints in the BACKBONE v14.2 web application. The error pattern shows:

```
GET https://api-oup5qxogca-uc.a.run.app/inventory 401 (Unauthorized)
GET https://api-oup5qxogca-uc.a.run.app/api/users 401 (Unauthorized)
POST https://api-oup5qxogca-uc.a.run.app/api/auth/refresh 400 (Bad Request)
GET https://api-oup5qxogca-uc.a.run.app/schemas 401 (Unauthorized)
GET https://api-oup5qxogca-uc.a.run.app/map/layouts 401 (Unauthorized)
GET https://api-oup5qxogca-uc.a.run.app/network-ip 401 (Unauthorized)
```

## Root Cause

This issue occurs when:
1. **Firebase ID token has expired** - The user's authentication session has timed out
2. **Token refresh failure** - The refresh endpoint is returning 400 Bad Request, indicating the refresh token is also invalid
3. **Authentication state mismatch** - There's a disconnect between the client-side stored tokens and the server-side authentication state

The user ID `g8dkre0woUWYDvj6jeARh1ekeBa2` suggests this is a Firebase UID that has lost its valid authentication session.

## Solution Options

### Option 1: Browser Console Fix (Immediate)

1. Open the browser developer console (F12)
2. Copy and paste the entire contents of `fix-authentication-401-errors.js`
3. Press Enter to execute the script
4. The script will automatically clear all authentication data and redirect to login

### Option 2: HTML Fix Page (User-Friendly)

1. Open `auth-401-fix.html` in your browser
2. Click "Fix Authentication Issues" button
3. Wait for the process to complete
4. You'll be automatically redirected to the login page

### Option 3: Manual Quick Fix

Run this in the browser console:
```javascript
// Clear critical authentication tokens
localStorage.removeItem('firebase_id_token');
localStorage.removeItem('team_member_token');
localStorage.removeItem('auth_token');
localStorage.removeItem('jwt_token');
localStorage.removeItem('token');

// Redirect to login
window.location.href = '/login';
```

## What the Fix Does

1. **Clears Authentication Tokens**
   - Removes all Firebase ID tokens
   - Clears team member tokens
   - Removes JWT tokens and refresh tokens
   - Cleans up localStorage and sessionStorage

2. **Firebase Sign Out**
   - Properly signs out from Firebase Auth
   - Clears Firebase authentication state
   - Removes custom claims and permissions

3. **Cache Cleanup**
   - Clears browser authentication caches
   - Removes any stored user data
   - Resets authentication flags

4. **Clean Redirect**
   - Redirects to login page
   - Ensures fresh authentication flow
   - Prevents authentication loops

## Prevention

To prevent this issue in the future:

1. **Regular Token Refresh** - The app should automatically refresh tokens before they expire
2. **Proper Error Handling** - 401 errors should trigger automatic logout and redirect
3. **Session Monitoring** - Monitor authentication health and proactively refresh tokens

## Technical Details

### Firebase Authentication Flow
- The app uses Firebase Authentication with custom claims
- Tokens expire after 1 hour by default
- Refresh tokens should automatically renew ID tokens
- When refresh fails, complete re-authentication is required

### API Authentication
- All API calls require `Authorization: Bearer <firebase-id-token>` header
- Firebase Functions verify the token on each request
- Invalid/expired tokens result in 401 Unauthorized responses

### Web-Only Mode
- This is a web-only Firebase project (no local backend)
- All authentication flows through Firebase Auth
- API endpoints are Firebase Functions deployed to Cloud Run

## Files Created

1. `fix-authentication-401-errors.js` - Console script for immediate fix
2. `auth-401-fix.html` - User-friendly HTML interface
3. `AUTH_401_ERROR_FIX_README.md` - This documentation

## Next Steps After Fix

1. **Log in again** - Use your credentials to authenticate
2. **Verify permissions** - Ensure your user has the correct roles and permissions
3. **Test functionality** - Confirm all features work properly after re-authentication
4. **Monitor for recurrence** - Watch for similar authentication issues

## Support

If the fix doesn't resolve the issue:

1. Check Firebase Console for user status
2. Verify the user exists in Firestore with correct permissions
3. Check Firebase Functions logs for authentication errors
4. Contact system administrator if user account issues persist

---

**Note**: This fix is safe and only clears client-side authentication data. Your user account and data remain intact on the server.
