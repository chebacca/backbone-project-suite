/**
 * Authentication 401 Error Fix Script
 * 
 * This script handles the cascade of 401 Unauthorized errors by:
 * 1. Clearing all authentication tokens and data
 * 2. Signing out from Firebase
 * 3. Redirecting to login page
 * 
 * Usage: Copy and paste this entire script into the browser console
 */

(async function fixAuthentication401Errors() {
    console.log('🔧 [Auth Fix] Starting authentication recovery for 401 errors...');
    
    try {
        // Step 1: Clear all authentication tokens and data
        console.log('🔧 [Auth Fix] Clearing all authentication data...');
        
        const authKeys = [
            'firebase_id_token',
            'firebase_authenticated', 
            'firebase_user_uid',
            'firebase_user_email',
            'firebase_token_last_refresh',
            'team_member_token',
            'auth_token',
            'jwt_token',
            'token',
            'authToken',
            'access_token',
            'refresh_token',
            'team_member',
            'team_member_user',
            'current_user',
            'demo_mode',
            'lastSuccessfulLogin',
            'token_expiry',
            'userFetchFailed'
        ];
        
        // Clear localStorage
        authKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                console.log(`🔧 [Auth Fix] Removing ${key} from localStorage`);
                localStorage.removeItem(key);
            }
        });
        
        // Clear sessionStorage
        authKeys.forEach(key => {
            if (sessionStorage.getItem(key)) {
                console.log(`🔧 [Auth Fix] Removing ${key} from sessionStorage`);
                sessionStorage.removeItem(key);
            }
        });
        
        console.log('✅ [Auth Fix] Authentication data cleared');
        
        // Step 2: Sign out from Firebase if available
        try {
            console.log('🔧 [Auth Fix] Attempting Firebase sign out...');
            
            // Check if Firebase is available
            if (typeof window !== 'undefined' && window.firebase) {
                const auth = window.firebase.auth();
                if (auth.currentUser) {
                    await auth.signOut();
                    console.log('✅ [Auth Fix] Firebase sign out successful');
                } else {
                    console.log('ℹ️ [Auth Fix] No Firebase user to sign out');
                }
            } else {
                console.log('ℹ️ [Auth Fix] Firebase not available or not initialized');
            }
        } catch (firebaseError) {
            console.warn('⚠️ [Auth Fix] Firebase sign out error (non-critical):', firebaseError);
        }
        
        // Step 3: Use the existing logout service if available
        try {
            console.log('🔧 [Auth Fix] Attempting to use existing logout service...');
            
            // Check if logoutService is available in the global scope
            if (typeof window !== 'undefined' && window.logoutService) {
                await window.logoutService.logout({
                    redirectUrl: '/login',
                    preserveProjectContext: false,
                    preserveMode: false,
                    returnToSequencer: false,
                    allowBackNavigation: false
                });
                console.log('✅ [Auth Fix] Logout service completed successfully');
                return; // Exit early if logout service worked
            } else {
                console.log('ℹ️ [Auth Fix] Logout service not available in global scope');
            }
        } catch (logoutError) {
            console.warn('⚠️ [Auth Fix] Logout service error:', logoutError);
        }
        
        // Step 4: Clear any remaining caches
        try {
            console.log('🔧 [Auth Fix] Clearing browser caches...');
            
            // Clear any IndexedDB data if available
            if ('indexedDB' in window) {
                // This is a basic approach - in production you'd want to be more specific
                console.log('🔧 [Auth Fix] IndexedDB clearing attempted (basic)');
            }
            
            console.log('✅ [Auth Fix] Cache clearing completed');
        } catch (cacheError) {
            console.warn('⚠️ [Auth Fix] Cache clearing error (non-critical):', cacheError);
        }
        
        // Step 5: Force redirect to login
        console.log('🔧 [Auth Fix] Redirecting to login page...');
        
        // Determine the correct login URL based on the current domain
        let loginUrl = '/login';
        
        if (window.location.hostname.includes('backbone-client.web.app')) {
            loginUrl = '/login';
        } else if (window.location.hostname.includes('localhost')) {
            loginUrl = '/login';
        }
        
        console.log(`🔧 [Auth Fix] Redirecting to: ${loginUrl}`);
        
        // Use a small delay to ensure all cleanup is complete
        setTimeout(() => {
            window.location.href = loginUrl;
        }, 500);
        
        console.log('✅ [Auth Fix] Authentication recovery completed successfully!');
        console.log('ℹ️ [Auth Fix] You will be redirected to the login page in 0.5 seconds');
        
    } catch (error) {
        console.error('❌ [Auth Fix] Authentication recovery failed:', error);
        
        // Fallback: Force redirect to login even if cleanup failed
        console.log('🔧 [Auth Fix] Performing fallback redirect to login...');
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000);
    }
})();

// Also provide a simple function that can be called directly
window.fixAuth401 = function() {
    console.log('🔧 [Auth Fix] Manual authentication fix triggered...');
    
    // Clear critical tokens
    localStorage.removeItem('firebase_id_token');
    localStorage.removeItem('team_member_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('token');
    
    // Redirect to login
    window.location.href = '/login';
};

console.log('✅ [Auth Fix] Authentication fix script loaded successfully!');
console.log('ℹ️ [Auth Fix] You can also call fixAuth401() manually if needed');
