# JWT to Firebase Auth Migration Guide

## 🎯 Overview

We've created a **catch-all wrapper system** that automatically redirects all old JWT service calls to the new Firebase Auth system. This means **most of your existing code will continue to work without changes** while using Firebase Auth under the hood.

## ✅ What's Already Working

### 1. JWT Service Calls (Automatic Migration)
All of these now automatically use Firebase Auth:

```typescript
// ✅ These all work automatically now:
import { jwtService } from './jwtService';

jwtService.getToken()           // → Uses Firebase ID token
jwtService.setToken(token)      // → Handled by Firebase Auth
jwtService.getUserFromToken()   // → Returns Firebase user
jwtService.isTokenValid()       // → Checks Firebase auth state
jwtService.logout()             // → Firebase logout
```

### 2. AuthService Wrapper (Already Updated)
```typescript
// ✅ This already works:
import { authService } from './authService';

await authService.getToken()    // → Firebase ID token
authService.isAuthenticated()   // → Firebase auth state
```

## 🔧 Manual Updates Still Needed

### 1. Direct localStorage Token Access
**Replace these patterns:**

```typescript
// ❌ OLD - Direct localStorage access
const token = localStorage.getItem('jwt_token');
const token = localStorage.getItem('auth_token');

// ✅ NEW - Use helper functions
import { getJWTToken } from './services/legacyTokenStorageWrapper';
const token = await getJWTToken();

// OR use the auth service
import { authService } from './services/authService';
const token = await authService.getToken();
```

### 2. Authorization Headers
**Replace these patterns:**

```typescript
// ❌ OLD - Manual Bearer token construction
headers: {
  'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
}

// ✅ NEW - Use helper function
import { createAuthHeader } from './services/legacyTokenStorageWrapper';
headers: {
  ...await createAuthHeader()
}

// OR use auth service
import { authService } from './services/authService';
const token = await authService.getToken();
headers: {
  'Authorization': token ? `Bearer ${token}` : ''
}
```

### 3. Token Storage Operations
**Replace these patterns:**

```typescript
// ❌ OLD - Manual token storage
localStorage.setItem('jwt_token', token);
localStorage.removeItem('jwt_token');

// ✅ NEW - Firebase handles automatically
// No action needed - Firebase Auth manages tokens automatically

// For logout, use:
import { unifiedFirebaseAuth } from './services/UnifiedFirebaseAuth';
await unifiedFirebaseAuth.logout();
```

## 🚀 Quick Migration Script

Use this script to find remaining issues:

```bash
# Run the JWT usage finder
node find-old-jwt-usage.cjs

# Focus on HIGH priority items first
```

## 📋 Priority Migration Order

### 1. HIGH Priority (Breaking Issues)
- [ ] Direct `jwtService` imports that aren't working
- [ ] Synchronous token access in async contexts
- [ ] Manual token generation/validation

### 2. MEDIUM Priority (Performance Issues)  
- [ ] Direct `localStorage.getItem('jwt_token')` calls
- [ ] Manual Authorization header construction
- [ ] Token validation logic

### 3. LOW Priority (Cleanup)
- [ ] Deprecated method calls
- [ ] Manual token storage operations
- [ ] Legacy token parsing

## 🔍 Common Patterns & Solutions

### Pattern 1: Async Token Access
```typescript
// ❌ OLD
const token = jwtService.getToken();
if (token) {
  // use token
}

// ✅ NEW
const token = await authService.getToken();
if (token) {
  // use token
}
```

### Pattern 2: API Request Headers
```typescript
// ❌ OLD
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
  }
});

// ✅ NEW
const response = await fetch(url, {
  headers: {
    ...await createAuthHeader()
  }
});
```

### Pattern 3: User Information
```typescript
// ❌ OLD
const user = jwtService.getUserFromToken();

// ✅ NEW
const user = unifiedFirebaseAuth.getCurrentUser();
```

## 🛠️ Helper Functions Available

### From `legacyTokenStorageWrapper.ts`:
- `getJWTToken()` - Async token retrieval
- `createAuthHeader()` - Authorization header creation
- `hasValidToken()` - Token validation check

### From `authService.ts`:
- `authService.getToken()` - Async Firebase ID token
- `authService.isAuthenticated()` - Auth state check
- `authService.getCurrentUser()` - User information

### From `unifiedFirebaseAuth.ts`:
- `unifiedFirebaseAuth.getIdToken()` - Direct Firebase token
- `unifiedFirebaseAuth.getCurrentUser()` - Firebase user
- `unifiedFirebaseAuth.isAuthenticated()` - Auth state

## 🚨 Deprecation Warnings

The wrapper system shows deprecation warnings in the console to help identify code that needs updating:

```
🚨 [DEPRECATED] jwtService.getToken() is deprecated. 
Use await unifiedFirebaseAuth.getIdToken() instead. 
This legacy wrapper will be removed in a future version.
```

## 📊 Migration Progress Tracking

Use this checklist to track your migration progress:

- [ ] All HIGH priority issues resolved
- [ ] All MEDIUM priority issues resolved  
- [ ] All LOW priority issues resolved
- [ ] No more deprecation warnings in console
- [ ] All tests passing
- [ ] Performance testing completed

## 🎉 Benefits After Migration

1. **Automatic Token Management** - Firebase handles refresh, expiry, storage
2. **Better Security** - Firebase Auth security best practices
3. **Simplified Code** - No manual token handling
4. **Real-time Auth State** - Automatic auth state synchronization
5. **Cross-tab Support** - Auth state synced across browser tabs

## 🆘 Need Help?

If you encounter issues during migration:

1. Check the console for deprecation warnings
2. Run the JWT usage finder script
3. Look for patterns in this guide
4. Test with the wrapper system first
5. Gradually migrate to direct Firebase Auth calls

The wrapper system ensures nothing breaks while you migrate at your own pace!
