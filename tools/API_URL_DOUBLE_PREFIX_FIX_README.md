# API URL Double Prefix Fix

## Problem Description

The application was experiencing 404 Not Found errors due to incorrect API URL construction that created double `/api/api/` prefixes in the URLs:

**Incorrect URLs (causing 404 errors):**
```
GET https://api-oup5qxogca-uc.a.run.app/api/api/workflow/sessions/907d6745-7201-44ee-bdab-a5859835a7e1/all
GET https://api-oup5qxogca-uc.a.run.app/api/api/workflow/sessions/fe082bc8-219a-48b5-a81f-c21d6a047b72/all
```

**Correct URLs (should work):**
```
GET https://api-oup5qxogca-uc.a.run.app/api/workflow/sessions/907d6745-7201-44ee-bdab-a5859835a7e1/all
GET https://api-oup5qxogca-uc.a.run.app/api/workflow/sessions/fe082bc8-219a-48b5-a81f-c21d6a047b72/all
```

## Root Cause

The issue was caused by inconsistent API URL construction across different services:

1. **Correct Pattern**: `${getApiBaseUrl()}/api/workflow/sessions/...`
   - `getApiBaseUrl()` returns `https://api-oup5qxogca-uc.a.run.app`
   - Final URL: `https://api-oup5qxogca-uc.a.run.app/api/workflow/sessions/...` ✅

2. **Incorrect Pattern**: `apiClient.get('/api/workflow/sessions/...')`
   - `apiClient` is already configured with base URL `https://api-oup5qxogca-uc.a.run.app/api`
   - Adding `/api/workflow/sessions/...` creates: `https://api-oup5qxogca-uc.a.run.app/api/api/workflow/sessions/...` ❌

## Files Fixed

The following services were updated to remove the double `/api/` prefix:

### 1. multiWorkflowService.ts
- **Line 85**: `/api/workflow/sessions/batch-get` → `/workflow/sessions/batch-get`
- **Line 229**: `/api/workflow/sessions/${cleanSessionId}/all` → `/workflow/sessions/${cleanSessionId}/all`
- **Line 346**: `/api/workflow/sessions/${cleanSessionId}/unassign` → `/workflow/sessions/${cleanSessionId}/unassign`

### 2. workflowTaskSyncApi.ts
- **Line 259**: `/api/workflow/sessions/${sessionId}/assign` → `/workflow/sessions/${sessionId}/assign`
- **Line 339**: `/api/workflow/sessions/${actualSessionId}` → `/workflow/sessions/${actualSessionId}`

### 3. unifiedWorkflowApi.ts
- **Line 174**: `/api/workflow/sessions/${cleanSessionId}/status` → `/workflow/sessions/${cleanSessionId}/status`
- **Line 294**: `/api/workflow/sessions/${cleanSessionId}/complete` → `/workflow/sessions/${cleanSessionId}/complete`

### 4. unifiedSessionWorkflowApi.ts
- **Line 295**: `/api/workflow/sessions/${sessionId}` → `/workflow/sessions/${sessionId}`
- **Line 646**: `/api/workflow/sessions/${cleanSessionId}/my-steps` → `/workflow/sessions/${cleanSessionId}/my-steps`
- **Line 690**: `/api/workflow/sessions/${cleanSessionId}/progress` → `/workflow/sessions/${cleanSessionId}/progress`
- **Line 709**: `/api/workflow/sessions/${cleanSessionId}/steps/${stepId}/start` → `/workflow/sessions/${cleanSessionId}/steps/${stepId}/start`
- **Line 733**: `/api/workflow/sessions/${cleanSessionId}/steps/${stepId}/complete` → `/workflow/sessions/${cleanSessionId}/steps/${stepId}/complete`

### 5. combinedSessionsApi.ts
- **Line 2078**: `/api/workflow/sessions/${sessionId}` → `/workflow/sessions/${sessionId}`
- **Line 2107**: `/api/workflow/sessions/${encodeURIComponent(sessionId)}/assign` → `/workflow/sessions/${encodeURIComponent(sessionId)}/assign`

### 6. workflowManagementService.ts
- **Line 31**: `/api/workflow/sessions/${encodeURIComponent(sessionId)}/unassign` → `/workflow/sessions/${encodeURIComponent(sessionId)}/unassign`
- **Line 68**: `/api/workflow/sessions/${encodeURIComponent(sessionId)}/assign` → `/workflow/sessions/${encodeURIComponent(sessionId)}/assign`
- **Line 111**: `/api/workflow/sessions/${sessionId}/status` → `/workflow/sessions/${sessionId}/status`

### 7. sessionWorkflowIntegration.ts
- **Line 104**: `/api/workflow/sessions/${sessionId}/all` → `/workflow/sessions/${sessionId}/all`

## API URL Construction Rules

### ✅ Correct Patterns

1. **Using fetch with getApiBaseUrl():**
   ```javascript
   fetch(`${getApiBaseUrl()}/api/workflow/sessions/${sessionId}`)
   ```

2. **Using apiClient (already has /api prefix):**
   ```javascript
   apiClient.get(`/workflow/sessions/${sessionId}`)
   ```

### ❌ Incorrect Patterns

1. **Double prefix with apiClient:**
   ```javascript
   apiClient.get(`/api/workflow/sessions/${sessionId}`) // Creates /api/api/
   ```

2. **Missing prefix with fetch:**
   ```javascript
   fetch(`${getApiBaseUrl()}/workflow/sessions/${sessionId}`) // Missing /api/
   ```

## Testing

A test script has been created to monitor and validate API URL construction:

### Files Created:
- `test-api-url-fix.js` - Browser console script to monitor network requests
- `API_URL_DOUBLE_PREFIX_FIX_README.md` - This documentation

### How to Test:

1. **Browser Console Test:**
   ```javascript
   // Copy and paste the contents of test-api-url-fix.js into browser console
   // It will monitor requests for 30 seconds and report any double /api/api/ URLs
   ```

2. **Manual URL Test:**
   ```javascript
   // Run this in console after loading the test script
   testApiUrls()
   ```

3. **Network Tab Verification:**
   - Open browser DevTools → Network tab
   - Navigate through the application
   - Look for workflow-related API calls
   - Verify URLs follow pattern: `https://api-oup5qxogca-uc.a.run.app/api/workflow/sessions/...`
   - Ensure no URLs have `/api/api/` double prefix

## Expected Results

After applying this fix:

1. **404 errors should be resolved** - Workflow session API calls should return 200 OK
2. **Correct URL format** - All URLs should have single `/api/` prefix
3. **Functional workflow features** - Session workflow operations should work properly

## Related Issues

This fix resolves the 404 errors that were occurring after the previous 401 authentication errors were resolved. The authentication fix cleared the expired tokens, but then revealed this underlying URL construction issue.

## Prevention

To prevent this issue in the future:

1. **Consistent API client usage** - Always use either `fetch` with full URL or `apiClient` with relative URL
2. **Code review** - Check for double prefix patterns in API calls
3. **Testing** - Use the provided test script to validate URL construction
4. **Documentation** - Follow the API URL construction rules outlined above

---

**Status**: ✅ Fixed - All identified services updated to use correct URL patterns
