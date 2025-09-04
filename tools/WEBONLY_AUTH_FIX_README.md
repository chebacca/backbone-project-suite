# WebOnly Authentication Fix

This document explains the authentication token issue in web-only mode and provides solutions to fix it.

## Problem Description

The application is encountering the following error:

```
[ProjectSelectionService] Error fetching projects: Error: No authentication token available
```

This error occurs when:
1. The Firebase authentication token is missing or expired
2. The token is not properly stored in localStorage
3. The ProjectSelectionService fails to retrieve the token

## Root Causes

1. **Token Expiration**: Firebase ID tokens expire after 60 minutes
2. **Token Storage Issues**: Tokens not properly stored across all required storage locations
3. **Redundant API Calls**: Excessive API calls may be causing rate limiting or token validation issues
4. **Initialization Sequence**: Firebase Auth might not be fully initialized before API calls are made

## Solution Files

Three fix scripts have been created:

1. **fix-firebase-auth.js**: Basic fix that focuses on refreshing Firebase authentication tokens
2. **diagnose-webonly-api-calls.js**: Diagnostic tool to monitor and analyze API call patterns
3. **fix-webonly-auth-complete.js**: Comprehensive fix that addresses all identified issues

## How to Use

### Option 1: Simple Fix (Recommended)

Open the `simple-fix-injector.html` file in your browser and use one of these methods:

1. **Copy and Paste**: Copy the code snippet and paste it into your browser's console while on your application page
2. **Direct Injection**: Enter your application URL and click "Open with Fix" to open your app with the fix applied
3. **Bookmarklet**: Drag the "Auth Fix" link to your bookmarks bar and click it when you're on your application page

This simplified approach is the most reliable and handles the "auth is not defined" error by safely finding the Firebase Auth instance.

### Option 2: Basic Authentication Fix

Add this script tag to your HTML file or run in the browser console:

```html
<script src="fix-firebase-auth.js"></script>
```

This script will:
- Check if Firebase Auth is properly initialized
- Refresh the authentication token
- Ensure tokens are properly stored in localStorage
- Patch the ProjectSelectionService to handle token issues

### Option 3: API Call Diagnostics

Add this script tag to diagnose excessive API calls:

```html
<script src="diagnose-webonly-api-calls.js"></script>
```

Then use these commands in the browser console:
- `window.printApiCallSummary()` - Print summary of API calls
- `window.analyzeApiCallPatterns()` - Analyze API call patterns
- `window.resetApiCallCounters()` - Reset all counters

### Option 4: Comprehensive Fix

Add this script tag for a complete solution:

```html
<script src="fix-webonly-auth-complete.js"></script>
```

This script includes:
- All features from the basic authentication fix
- Periodic token refresh to prevent expiration
- API call throttling to reduce redundant requests
- Fallback mechanism with mock projects when API fails
- Detailed logging for troubleshooting

## Permanent Solution

For a permanent solution, integrate these changes into your codebase:

1. Add periodic token refresh in your authentication service
2. Implement proper token storage across all required locations
3. Add API call throttling to reduce redundant requests
4. Ensure Firebase Auth is fully initialized before making API calls
5. Add fallback mechanisms for critical API failures

## Testing

After applying the fix:

1. Refresh the page and check if projects load correctly
2. Open browser console and verify there are no authentication errors
3. Monitor API calls to ensure they're not excessive
4. Test after leaving the app idle for >60 minutes to verify token refresh works

## Troubleshooting

If issues persist:

1. Check browser console for error messages
2. Verify Firebase configuration is correct
3. Clear browser storage and cache, then try again
4. Ensure the user is properly authenticated with Firebase
5. Check network requests for API errors
