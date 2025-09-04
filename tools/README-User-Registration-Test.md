# User Registration Flow Test

## 🎯 Overview

This comprehensive test suite validates the complete user registration and onboarding process for the Backbone Logic licensing website. It tests the entire flow from user registration through team member creation and project setup.

## 🧪 What Gets Tested

### 1. **User Registration & Authentication**
- ✅ User registration via API endpoint
- ✅ Firebase Authentication user creation
- ✅ Firestore user document creation with proper fields
- ✅ Password hashing and security
- ✅ Terms and privacy policy acceptance tracking

### 2. **Email Verification**
- ✅ Email verification token generation
- ✅ Email verification API endpoint
- ✅ Database status updates after verification
- ✅ Welcome email sending (if configured)

### 3. **Two-Factor Authentication (2FA)**
- ✅ 2FA setup initiation
- ✅ QR code generation for authenticator apps
- ✅ TOTP code verification
- ✅ Backup codes generation
- ✅ Database updates for 2FA status

### 4. **Subscription & Billing**
- ✅ Subscription creation with different tiers (BASIC, PRO, ENTERPRISE)
- ✅ Payment method integration
- ✅ Billing address validation
- ✅ Tax calculation
- ✅ Organization creation for PRO/ENTERPRISE tiers

### 5. **Team Member Management**
- ✅ Team member creation by account owners
- ✅ Automatic Firebase Auth user creation for team members
- ✅ License type assignment
- ✅ Department and role management
- ✅ Organization linking

### 6. **Project Management**
- ✅ Project creation with proper settings
- ✅ Project ownership assignment
- ✅ Collaboration settings
- ✅ Storage backend configuration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase project configured
- Server running and accessible
- Proper authentication credentials

### 1. Setup Environment
```bash
# Make setup script executable
chmod +x setup-test-environment.sh

# Run setup script
./setup-test-environment.sh
```

### 2. Configure Test Settings
Edit `test-user-registration-flow.js` and update:
```javascript
const API_BASE_URL = 'http://localhost:3001'; // Your server URL
const FIREBASE_PROJECT_ID = 'backbone-logic'; // Your Firebase project
```

### 3. Run Tests
```bash
# Run with Node.js directly
node test-user-registration-flow.js

# Or with npm
npm test
```

## 📋 Test User Details

**Test Account**: `chrismole@example.com`
**Password**: `TestPassword123!`
**Name**: Chris Mole

This account will be:
- Created during testing
- Used for all subsequent operations
- Automatically cleaned up after testing

## 🔧 Configuration

### Environment Variables
```bash
# Firebase credentials (optional - uses ADC by default)
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"

# Firebase project ID (optional - uses default from gcloud)
export FIREBASE_PROJECT_ID="your-project-id"

# API base URL (optional - defaults to localhost:3001)
export API_BASE_URL="https://your-server.com"
```

### Firebase Authentication
The test uses Application Default Credentials (ADC) by default:
```bash
# Authenticate with gcloud
gcloud auth application-default login

# Or use Firebase CLI
firebase login
```

## 📊 Test Results

The test provides detailed output for each step:

```
🚀 Starting Comprehensive User Registration Flow Test
📧 Test User: chrismole@example.com
🌐 API Base URL: http://localhost:3001
🔥 Firebase Project: backbone-logic

🔐 Testing User Registration...
✅ PASS User Registration API
   User ID: abc123-def456-ghi789

🔥 Testing Firebase Auth User Creation...
✅ PASS Firebase Auth User Exists
   UID: firebase_uid_123
✅ PASS Firebase Auth Email Verified
   Email not verified (expected for new users)
✅ PASS Firebase Auth Display Name
   Display name: Chris Mole

📄 Testing Firestore User Document...
✅ PASS Firestore User Document Exists
   Document ID: abc123-def456-ghi789
✅ PASS User Email
   Email: chrismole@example.com
✅ PASS User Role
   Role: USER
✅ PASS Firebase UID Link
   Firebase UID: firebase_uid_123
...
```

## 🧹 Cleanup

The test automatically cleans up all created data:
- ✅ Firebase Auth users deleted
- ✅ Firestore documents removed
- ✅ Test projects cleaned up
- ✅ Team member accounts removed

## 🚨 Important Notes

### ⚠️ Safety Warnings
1. **This test creates real user accounts** - Only run against development/staging environments
2. **Real emails will be sent** - The test user will receive verification emails
3. **Firebase resources are created** - Ensure proper project permissions
4. **Database changes occur** - Backup important data before testing

### 🔒 Security Considerations
- Test runs with elevated permissions (Firebase Admin SDK)
- Uses real authentication flows
- May trigger security alerts in production environments
- Consider IP whitelisting for testing

## 🐛 Troubleshooting

### Common Issues

#### 1. Firebase Authentication Failed
```bash
# Check authentication
gcloud auth application-default login
firebase login

# Verify project access
firebase projects:list
```

#### 2. Server Connection Failed
```bash
# Check if server is running
curl http://localhost:3001/health

# Verify port configuration
netstat -tlnp | grep :3001
```

#### 3. Permission Denied
```bash
# Check Firebase project permissions
firebase use --only=projectId

# Verify service account has proper roles
# Required: Firebase Admin, Firestore Admin
```

#### 4. Email Service Issues
```bash
# Check email configuration
# Verify SendGrid API key or SMTP settings
# Check email logs in server console
```

### Debug Mode
Enable detailed logging by setting environment variables:
```bash
export DEBUG=firebase-admin:*
export NODE_ENV=development
```

## 📚 API Endpoints Tested

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-email` - Email verification
- `POST /auth/2fa/setup/initiate` - 2FA setup start
- `POST /auth/2fa/setup/verify` - 2FA setup completion

### Subscriptions
- `POST /api/payments/create-subscription` - Create subscription

### Team Management
- `POST /api/team-members` - Create team member

### Projects
- `POST /api/projects` - Create project

## 🔄 Continuous Integration

This test can be integrated into CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run User Registration Tests
  run: |
    npm install
    node test-user-registration-flow.js
  env:
    GOOGLE_APPLICATION_CREDENTIALS: ${{ secrets.FIREBASE_CREDENTIALS }}
    FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
    API_BASE_URL: ${{ secrets.TEST_API_URL }}
```

## 📈 Performance Metrics

The test tracks:
- ✅ Test execution time
- ✅ Success/failure rates
- ✅ API response times
- ✅ Database operation performance
- ✅ Firebase operation latency

## 🤝 Contributing

To add new test cases:
1. Add test function to the main test file
2. Update the `runTests()` function
3. Add cleanup logic if needed
4. Update this README with new test details

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Firebase console logs
3. Check server application logs
4. Verify environment configuration

## 📄 License

This test suite is part of the Backbone Logic project and follows the same licensing terms.
