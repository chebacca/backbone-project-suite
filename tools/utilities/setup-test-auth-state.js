#!/usr/bin/env node

/**
 * 🔧 Test Auth State Setup Script
 * Populates localStorage with the necessary auth state to test the toolbar fixes
 */

console.log('🔧 Setting up test auth state for toolbar testing...\n');

// Simulate the WebOnlyStartupFlow completion
const testAuthState = {
  // Firebase tokens (simulated)
  firebase_id_token: 'test-firebase-token-12345',
  auth_token: 'test-firebase-token-12345',
  team_member_token: 'test-team-member-token-67890',
  
  // User data (already present)
  current_user: JSON.stringify({
    id: "enterprise-user-123",
    email: "enterprise.user@enterprisemedia.com", 
    name: "Enterprise User",
    role: "ADMIN",
    organizationId: "enterprise-media-org",
    isTeamMember: true,
    licenseType: "ENTERPRISE",
    status: "active"
  }),
  
  team_member: JSON.stringify({
    id: "enterprise-user-123",
    email: "enterprise.user@enterprisemedia.com",
    name: "Enterprise User", 
    role: "ADMIN",
    organizationId: "enterprise-media-org",
    isTeamMember: true,
    licenseType: "ENTERPRISE",
    status: "active"
  }),
  
  // Project selection (simulated)
  selected_project: JSON.stringify({
    id: "test-project-001",
    name: "Test Project 2025",
    description: "Test project for toolbar verification",
    mode: "Network",
    status: "active",
    teamMemberRole: "ADMIN",
    storageBackend: "firestore",
    selectedAt: new Date().toISOString()
  }),
  
  project_role: "ADMIN",
  
  // Auth flags
  is_authenticated: "true",
  firebase_authenticated: "true",
  
  // WebOnlyStartupFlow completion flags
  webonly_startup_completed: "true",
  webonly_has_launched: "true",
  webonly_main_app_rendered: "true"
};

console.log('📋 Setting up localStorage with test data...');

// Create a simple HTML file that will set the localStorage
const setupScript = `
<!DOCTYPE html>
<html>
<head>
    <title>Auth State Setup</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .info { background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 10px 0; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>🔧 Auth State Setup</h1>
    
    <div class="info">
        <h3>This page will populate localStorage with test auth data</h3>
        <p>After clicking "Setup Auth State", you can test the toolbar fixes at:</p>
        <p><strong>https://backbone-client.web.app</strong></p>
    </div>
    
    <button onclick="setupAuthState()">Setup Auth State</button>
    <button onclick="checkAuthState()">Check Current State</button>
    <button onclick="goToApp()">Go to Dashboard App</button>
    
    <div id="result"></div>
    
    <script>
        const testAuthState = ${JSON.stringify(testAuthState, null, 2)};
        
        function setupAuthState() {
            console.log('🔧 Setting up test auth state...');
            
            // Set all auth state in localStorage
            Object.entries(testAuthState).forEach(([key, value]) => {
                localStorage.setItem(key, value);
                console.log(\`Set \${key}: \${typeof value === 'string' ? value.substring(0, 50) + '...' : value}\`);
            });
            
            document.getElementById('result').innerHTML = \`
                <div class="success">
                    <h3>✅ Auth State Setup Complete!</h3>
                    <p>All test data has been populated in localStorage.</p>
                    <p>You can now test the toolbar and navigation drawer at the main app.</p>
                </div>
            \`;
        }
        
        function checkAuthState() {
            const authKeys = Object.keys(testAuthState);
            const currentState = {};
            
            authKeys.forEach(key => {
                const value = localStorage.getItem(key);
                currentState[key] = value ? (key.includes('token') ? '***PRESENT***' : value) : null;
            });
            
            document.getElementById('result').innerHTML = \`
                <div class="info">
                    <h3>📊 Current Auth State:</h3>
                    <pre>\${JSON.stringify(currentState, null, 2)}</pre>
                </div>
            \`;
        }
        
        function goToApp() {
            window.open('https://backbone-client.web.app', '_blank');
        }
        
        // Auto-setup on page load
        window.addEventListener('load', () => {
            console.log('🔧 Auto-setting up auth state...');
            setupAuthState();
        });
    </script>
</body>
</html>
`;

const fs = require('fs');
fs.writeFileSync('setup-auth-state.html', setupScript);

console.log('✅ Created setup-auth-state.html');
console.log('\n🎯 Next Steps:');
console.log('1. Open setup-auth-state.html in your browser');
console.log('2. It will automatically populate localStorage with test data');
console.log('3. Then visit https://backbone-client.web.app to test the toolbar');
console.log('\n🔍 What to Look For:');
console.log('• User menu should appear in the toolbar');
console.log('• Project pill should show "Test Project 2025"');
console.log('• Navigation drawer should populate with items');
console.log('• No console errors about React hooks');
