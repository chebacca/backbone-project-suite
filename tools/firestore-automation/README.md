# 🔥 Firestore Automation System

## 🎯 Overview

The Firestore Automation System automatically keeps your Firestore collections and security rules synchronized across both the Dashboard v14.2 and Licensing Website projects. This prevents the "Missing or insufficient permissions" errors that occur when new collections are added without corresponding security rules.

## 🚀 Quick Start

### 1. Install Git Hooks (Recommended)
```bash
# Run from project root
./tools/firestore-automation/git-hooks/install-hooks.sh
```

This installs Git hooks that automatically:
- Scan for new collections before each commit
- Generate updated Firestore rules
- Validate rules syntax
- Add updated rules to your commit

### 2. Manual Collection Scan
```bash
# Scan for collections
node tools/firestore-automation/collection-scanner.js

# Scan and generate rules
node tools/firestore-automation/collection-scanner.js --generate-rules

# Scan, generate, and deploy rules
node tools/firestore-automation/collection-scanner.js --generate-rules --deploy
```

### 3. Monitor for Permission Issues
```bash
# One-time check
node tools/firestore-automation/monitoring/permission-monitor.js

# Continuous monitoring
node tools/firestore-automation/monitoring/permission-monitor.js --continuous
```

## 📁 System Components

### 🔍 Collection Scanner (`collection-scanner.js`)
Automatically discovers all Firestore collections used across both projects and generates comprehensive security rules.

**Features:**
- Scans TypeScript, JavaScript, TSX, and JSX files
- Detects collection usage patterns: `collection('name')`, `db.collection('name')`, etc.
- Categorizes collections by functionality
- Generates comprehensive security rules
- Tracks collection sources and usage

**Usage:**
```bash
node collection-scanner.js [options]

Options:
  --generate-rules    Generate Firestore security rules
  --deploy           Deploy rules to Firebase (requires --generate-rules)
  --verbose          Show detailed output
```

### 🪝 Git Hooks
Automatic validation and rule generation integrated into your Git workflow.

**Pre-commit Hook:**
- Scans modified files for new collections
- Updates Firestore rules if new collections found
- Validates rules syntax
- Adds updated rules to commit

**Installation:**
```bash
./tools/firestore-automation/git-hooks/install-hooks.sh
```

### 🔄 CI/CD Pipeline (`.github/workflows/firestore-automation.yml`)
GitHub Actions workflow that automatically handles collection scanning and rule deployment.

**Triggers:**
- Push to main/develop branches
- Pull requests
- Manual workflow dispatch

**Features:**
- Scans for new collections
- Generates and validates rules
- Deploys rules to production (main branch only)
- Comments on PRs with scan results
- Creates review issues for manual verification

### 📊 Permission Monitor (`monitoring/permission-monitor.js`)
Real-time monitoring for Firestore permission errors with automatic remediation.

**Features:**
- Tests access to all known collections
- Detects permission errors
- Triggers automatic remediation
- Sends alerts via webhooks
- Logs errors and generates reports

**Usage:**
```bash
# One-time check
node monitoring/permission-monitor.js

# Continuous monitoring
node monitoring/permission-monitor.js --continuous

# With webhook alerts
node monitoring/permission-monitor.js --webhook-url=https://your-webhook.com

# Custom settings
node monitoring/permission-monitor.js --continuous --threshold=3 --interval=30000
```

## 🛡️ Security Rules Generation

### Rule Structure
The system generates comprehensive security rules with the following structure:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions for authentication and authorization
    function isAuthenticated() { ... }
    function canAccessOrganization(orgId) { ... }
    function isSuperAdmin() { ... }
    function isEnterpriseUser() { ... }
    
    // Auto-generated collection rules
    match /collectionName/{docId} {
      allow read, write: if isAuthenticated() && (
        canAccessOrganization(resource.data.organizationId) ||
        isSuperAdmin() ||
        isEnterpriseUser()
      );
    }
    
    // Fallback rule for new collections
    match /{document=**} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

### Collection Categories
Collections are automatically categorized for better organization:

- **System & Health**: `_health`, `health`, `cleanupLogs`
- **User & Organization**: `users`, `organizations`, `orgMembers`, `teamMembers`
- **Project Management**: `projects`, `projectTeamMembers`, `projectDatasets`
- **Session & Workflow**: `sessions`, `workflows`, `unifiedWorkflowInstances`
- **Media & Assets**: `assets`, `mediaFiles`, `mediaIndexes`
- **Communication**: `chats`, `messages`, `collaborationInvitations`
- **Financial**: `budgets`, `invoices`, `payments`, `subscriptions`
- **Production**: `callsheets`, `productionSessions`, `productionTasks`
- **Quality Control**: `qc`, `qcReports`, `reviews`
- **AI & Automation**: `agents`, `aiAgents`, `brainSessions`
- **Network & Infrastructure**: `networks`, `servers`, `networkDeliveryBibles`
- **Timecard & Scheduling**: `timecards`, `schedulerEvents`
- **Testing & Development**: `test`, `testCollection`, `temp`

### Special Rules
Certain collections get special security rules:

- **User Collections**: `users`, `userSettings` - Only accessible by the user or admins
- **Test Collections**: `test`, `temp` - Accessible by any authenticated user
- **Health Collections**: `_health`, `health` - Accessible by any authenticated user

## 📊 Monitoring & Alerting

### Permission Error Detection
The monitoring system detects permission errors by:
1. Testing access to all known collections
2. Identifying permission-denied errors
3. Tracking error frequency per collection
4. Triggering alerts when thresholds are exceeded

### Automatic Remediation
When permission errors are detected:
1. **Scan**: Run collection scanner to find new collections
2. **Generate**: Create updated security rules
3. **Deploy**: Deploy rules to Firebase
4. **Verify**: Re-test failed collections
5. **Alert**: Send success/failure notifications

### Alert Types
- **Permission Error Alert**: When permission errors are detected
- **Remediation Success**: When automatic fixes work
- **Remediation Failure**: When automatic fixes fail
- **New Collections**: When new collections are discovered

## 🔧 Configuration

### Environment Variables
```bash
# Firebase project
FIREBASE_PROJECT=backbone-logic

# Webhook for alerts (optional)
WEBHOOK_URL=https://your-webhook-url.com

# Monitoring settings
ALERT_THRESHOLD=5           # Errors before triggering remediation
MONITORING_INTERVAL=60000   # Check interval in milliseconds
```

### Firebase Setup
Ensure Firebase CLI is configured:
```bash
firebase login
firebase use backbone-logic
```

For CI/CD, set up the `FIREBASE_TOKEN` secret:
```bash
firebase login:ci
# Copy the token to GitHub Secrets as FIREBASE_TOKEN
```

## 📋 File Structure

```
tools/firestore-automation/
├── README.md                          # This documentation
├── collection-scanner.js              # Main collection scanner
├── git-hooks/                         # Git integration
│   ├── install-hooks.sh              # Hook installer
│   └── pre-commit                    # Pre-commit hook
├── monitoring/                       # Monitoring system
│   └── permission-monitor.js         # Permission monitor
├── reports/                          # Generated reports
│   ├── latest-scan.json             # Latest scan results
│   ├── latest-report.md             # Human-readable report
│   └── collection-scan-*.json       # Historical scans
├── alerts/                          # Alert notifications
│   └── alert-*.json                 # Alert history
└── logs/                           # Error logs
    └── permission-errors.log       # Permission error log
```

## 🚀 Deployment Workflow

### Development Workflow
1. **Code Changes**: Make changes to your projects
2. **Git Commit**: Pre-commit hook automatically scans and updates rules
3. **Push**: Changes are pushed with updated rules
4. **CI/CD**: GitHub Actions validates and deploys rules

### Manual Deployment
```bash
# 1. Scan for collections
node tools/firestore-automation/collection-scanner.js --verbose

# 2. Generate rules
node tools/firestore-automation/collection-scanner.js --generate-rules

# 3. Validate rules (optional)
cd Dashboard-v14_2
firebase firestore:rules --project backbone-logic --dry-run

# 4. Deploy rules
firebase deploy --only firestore:rules --project backbone-logic
```

## 🔍 Troubleshooting

### Common Issues

#### "Collection scanner not found"
```bash
# Ensure you're in the project root
cd "/path/to/BACKBONE 14_2 & Website 2 full project files"

# Check if scanner exists
ls -la tools/firestore-automation/collection-scanner.js
```

#### "Firebase CLI not configured"
```bash
# Login to Firebase
firebase login

# Set project
firebase use backbone-logic

# Test access
firebase projects:list
```

#### "Permission errors persist after rule deployment"
```bash
# Wait for rule propagation (can take up to 10 minutes)
# Check Firebase Console for rule deployment status
# Verify user authentication and custom claims

# Manual permission test
node tools/firestore-automation/monitoring/permission-monitor.js
```

#### "Git hooks not working"
```bash
# Reinstall hooks
./tools/firestore-automation/git-hooks/install-hooks.sh

# Check hook permissions
ls -la .git/hooks/pre-commit

# Test hook manually
.git/hooks/pre-commit
```

### Debug Mode
Enable verbose logging:
```bash
# Collection scanner
node tools/firestore-automation/collection-scanner.js --verbose

# Permission monitor
node tools/firestore-automation/monitoring/permission-monitor.js --continuous --verbose
```

### Log Files
Check log files for detailed information:
- `tools/firestore-automation/logs/permission-errors.log` - Permission errors
- `tools/firestore-automation/alerts/alert-*.json` - Alert history
- `tools/firestore-automation/reports/latest-report.md` - Latest scan report

## 🎯 Best Practices

### 1. Regular Monitoring
Set up continuous monitoring in production:
```bash
# Run as a service or cron job
node tools/firestore-automation/monitoring/permission-monitor.js --continuous --webhook-url=YOUR_WEBHOOK
```

### 2. Code Review
Always review generated rules before deployment:
- Check `Dashboard-v14_2/firestore-comprehensive.rules`
- Verify access patterns match your security requirements
- Test with different user roles

### 3. Testing
Test new collections in both projects:
- Dashboard v14.2: Verify admin and user access
- Licensing Website: Verify organization-based access
- Enterprise users: Verify special permissions

### 4. Backup
Keep backups of working rules:
```bash
# Backup current rules
cp Dashboard-v14_2/firestore-comprehensive.rules Dashboard-v14_2/firestore-comprehensive.rules.backup
```

### 5. Documentation
Document custom collections and their access patterns:
- Add comments to collection usage in code
- Update security requirements documentation
- Maintain collection ownership records

## 🔄 Maintenance

### Weekly Tasks
- Review permission error logs
- Check for new collections in scan reports
- Verify rule deployment status
- Update webhook URLs if needed

### Monthly Tasks
- Clean up old scan reports and logs
- Review and optimize security rules
- Update monitoring thresholds if needed
- Test disaster recovery procedures

### Quarterly Tasks
- Review and update documentation
- Audit collection access patterns
- Update automation scripts if needed
- Review security rule effectiveness

## 🆘 Support

### Getting Help
1. Check this documentation
2. Review log files and error messages
3. Test with manual commands
4. Check Firebase Console for rule status
5. Verify authentication and permissions

### Reporting Issues
When reporting issues, include:
- Error messages and logs
- Steps to reproduce
- Current scan results
- Firebase project configuration
- Authentication details (without sensitive data)

## 🎉 Success Metrics

The automation system is working correctly when:
- ✅ No "Missing or insufficient permissions" errors
- ✅ New collections automatically get security rules
- ✅ Rules deploy successfully on every change
- ✅ Both projects access all required collections
- ✅ Monitoring detects and fixes issues automatically

## 📈 Future Enhancements

Planned improvements:
- Real-time collection detection using Firebase Functions
- Advanced rule optimization based on usage patterns
- Integration with Firebase Security Rules testing
- Automated performance monitoring
- Custom rule templates for different collection types
- Integration with external monitoring systems (DataDog, New Relic, etc.)

---

**🔥 Your Firestore collections and rules are now automatically synchronized!**

This automation system ensures that your complex multi-project setup stays secure and functional as you continue to develop and add new features.

