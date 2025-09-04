# Web-Only User Management Fix

This fix addresses two critical issues in the web-only mode user management:

1. **"No project context set" error** when updating team member backbone roles
2. **404 Not Found error** when trying to update users via the admin API

## The Issues

### No Project Context Set

The error occurs in `UserManagementPage.tsx` when trying to update a team member's backbone role. The `TeamMemberService` requires a project context to be set before calling `updateTeamMemberBackboneRole`, but it's not being set early enough in the component lifecycle.

Error message:
```
Failed to update team member backbone role: Error: No project context set
```

### 404 Not Found Error

The admin API is trying to call `https://api-oup5qxogca-uc.a.run.app/api/admin/users/{userId}` but this endpoint doesn't exist on the Cloud Functions server in web-only mode.

Error message:
```
PUT https://api-oup5qxogca-uc.a.run.app/api/admin/users/{userId} 404 (Not Found)
```

## The Solution

Instead of modifying the large `UserManagementPage.tsx` file directly, we've created a script that:

1. Patches the `TeamMemberService.updateTeamMemberBackboneRole` method to auto-detect the project context when needed
2. Intercepts admin API calls to update users and uses Firestore directly in web-only mode

## How to Apply the Fix

1. Run the injection script:
   ```
   node inject-webonly-user-management-fix.js
   ```

2. This will add the fix script to the HTML file that serves the web application.

3. Deploy the updated HTML file to Firebase hosting.

## How It Works

The fix script:

1. Waits for the application to initialize
2. Patches the `TeamMemberService.updateTeamMemberBackboneRole` method to auto-detect project context
3. Patches the `adminApi.put` method to handle user updates in web-only mode using Firestore directly

## Testing

To test the fix:

1. Deploy the updated HTML file to Firebase hosting
2. Log in to the application in web-only mode
3. Navigate to the User Management page
4. Try to update a user's role or other information
5. Check the console for any errors

If the fix is working correctly, you should see:
- No "No project context set" errors
- No 404 errors when updating users
- User updates should be saved successfully

## Limitations

This is a temporary fix until a proper solution can be implemented in the codebase. It relies on patching methods at runtime, which may break if the underlying code changes significantly.
