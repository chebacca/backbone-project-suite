# Firebase Authentication Token Fix

## Problem Description

The error message `"No authentication token available"` occurs in the ProjectSelectionService when trying to fetch available projects. This happens because:

1. Firebase Authentication is not properly initialized
2. The authentication token is not correctly stored in localStorage
3. The token is not being properly retrieved when needed

This issue specifically affects the web-only mode when running on Firebase hosting.

## Solution

We've created several scripts to help diagnose and fix this issue:

1. `fix-firebase-auth-token.js` - A browser-based script to fix authentication issues
2. `fix-projectselection-auth-error.js` - A specialized script for the ProjectSelectionService error
3. `fix-firebase-auth.sh` - A command-line script to set up Firebase authentication

## How to Use the Fix Scripts

### Browser Fix (Recommended for most users)

1. Open your browser and navigate to the application page where you're seeing the error
2. Open the browser's developer console (F12 or right-click → Inspect → Console)
3. Copy and paste the contents of `fix-projectselection-auth-error.js` into the console
4. Press Enter to execute the script
5. Follow the prompts if you need to sign in
6. The script will attempt to fix the issue without requiring a page refresh

### Command Line Fix

1. Make the script executable:
   ```bash
   chmod +x fix-firebase-auth.sh
   ```

2. Run the script from the project root directory:
   ```bash
   ./fix-firebase-auth.sh
   ```

3. Follow the prompts to log in to Firebase if needed
4. The script will generate authentication check and browser fix scripts

## How the Fix Works

The fix addresses several potential issues:

1. **Firebase Initialization**: Ensures Firebase is properly initialized with the correct configuration
2. **Authentication State**: Checks if the user is already authenticated and gets a fresh token if needed
3. **Token Storage**: Stores the authentication token in all required localStorage locations
4. **JWT Service Integration**: Sets the token in the JWT service if available
5. **ProjectSelectionService Fix**: Attempts to directly fix the ProjectSelectionService by refreshing its authentication state

## Troubleshooting

If the fix doesn't work immediately:

1. **Refresh the page** after running the script
2. Check the browser console for any error messages
3. Make sure you're using the correct email and password for Firebase Authentication
4. Verify that localStorage is enabled in your browser
5. Try clearing your browser cache and cookies, then run the fix script again

## Prevention

To prevent this issue in the future:

1. Always ensure Firebase Authentication is properly initialized before accessing Firestore
2. Store authentication tokens in all required locations (jwt_token, auth_token, team_member_token)
3. Implement proper error handling and recovery for authentication failures
4. Consider implementing a centralized token management service

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Web SDK Reference](https://firebase.google.com/docs/reference/js)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
