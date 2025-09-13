# 🚀 Cursor CLI Complete Reference Guide
## BACKBONE v14.2 - All Available Commands & Capabilities

---

## 📋 **QUICK REFERENCE CARD**

### **🎯 Most Common Commands**
```bash
# Open main project
./tools/cursor-cli-workflow.sh dashboard

# Open specific feature
./tools/cursor-cli-workflow.sh feature inventory

# Build and deploy
./tools/cursor-firebase-build.sh build-deploy hosting

# Open file at specific line
cursor --goto 100:1 Dashboard-v14_2/functions/src/index.ts
```

---

## 🔧 **CURSOR CLI WORKFLOW SCRIPT**
### **File:** `./tools/cursor-cli-workflow.sh`

### **📁 Project Navigation**
```bash
# Open main dashboard project
./tools/cursor-cli-workflow.sh dashboard

# Open licensing website project
./tools/cursor-cli-workflow.sh licensing

# Open complete development environment (all projects)
./tools/cursor-cli-workflow.sh dev-env
```

### **🎯 Feature-Specific Navigation**
```bash
# Open specific features
./tools/cursor-cli-workflow.sh feature inventory
./tools/cursor-cli-workflow.sh feature sessions
./tools/cursor-cli-workflow.sh feature client
./tools/cursor-cli-workflow.sh feature timecard
./tools/cursor-cli-workflow.sh feature callsheets
```

### **⚙️ Configuration Management**
```bash
# Open all configuration files
./tools/cursor-cli-workflow.sh config
# Opens: .cursor-settings.json, .cursor-auto-features.json, firebase.json, firebaseConfig.ts

# Open Firebase Functions
./tools/cursor-cli-workflow.sh functions
# Opens: functions/src/index.ts
```

### **📚 Library & Documentation**
```bash
# Open shared MPC library
./tools/cursor-cli-workflow.sh library

# Open specific library document
./tools/cursor-cli-workflow.sh library CURSOR_AUTO_OPTIMIZATION_GUIDE.md
./tools/cursor-cli-workflow.sh library COMPLETE_COMPONENT_CREATION_GUIDE.md
./tools/cursor-cli-workflow.sh library CURSOR_CLI_INTEGRATION_MPC.md
```

### **📄 File-Specific Operations**
```bash
# Open specific file
./tools/cursor-cli-workflow.sh file apps/web/src/features/inventory/InventoryPage.tsx

# Open file at specific line
./tools/cursor-cli-workflow.sh file apps/web/src/features/inventory/InventoryPage.tsx 100

# Open build and deploy workflow
./tools/cursor-cli-workflow.sh build-deploy
```

### **❓ Help & Information**
```bash
# Show all available commands
./tools/cursor-cli-workflow.sh help
```

---

## 🔥 **CURSOR FIREBASE BUILD SCRIPT**
### **File:** `./tools/cursor-firebase-build.sh`

### **🏗️ Build Operations**
```bash
# Build web application only
./tools/cursor-firebase-build.sh build

# Show build status and project info
./tools/cursor-firebase-build.sh status
```

### **🚀 Deployment Operations**
```bash
# Deploy hosting only
./tools/cursor-firebase-build.sh deploy hosting

# Deploy functions only
./tools/cursor-firebase-build.sh deploy functions

# Deploy both hosting and functions
./tools/cursor-firebase-build.sh deploy both
```

### **⚡ Combined Operations**
```bash
# Build and deploy hosting in one command
./tools/cursor-firebase-build.sh build-deploy hosting

# Build and deploy functions in one command
./tools/cursor-firebase-build.sh build-deploy functions

# Build and deploy everything
./tools/cursor-firebase-build.sh build-deploy both
```

### **🔍 Health & Monitoring**
```bash
# Run health check on deployed API
./tools/cursor-firebase-build.sh health

# Open build files in Cursor after build
./tools/cursor-firebase-build.sh open
```

### **❓ Help & Information**
```bash
# Show all available commands
./tools/cursor-firebase-build.sh help
```

---

## 🎯 **DIRECT CURSOR CLI COMMANDS**

### **📁 File Operations**
```bash
# Open single file
cursor Dashboard-v14_2/functions/src/index.ts
cursor Dashboard-v14_2/apps/web/src/features/inventory/InventoryPage.tsx

# Open multiple files
cursor Dashboard-v14_2/functions/src/index.ts Dashboard-v14_2/apps/web/src/services/firebaseConfig.ts

# Open directory
cursor Dashboard-v14_2/apps/web/src/features/inventory/
cursor Dashboard-v14_2/functions/
```

### **📍 Line-Specific Navigation**
```bash
# Open file at specific line
cursor --goto 100:1 Dashboard-v14_2/functions/src/index.ts
cursor --goto 50:1 Dashboard-v14_2/apps/web/src/features/inventory/InventoryPage.tsx

# Open file at specific line and column
cursor --goto 100:5 Dashboard-v14_2/functions/src/index.ts
```

### **🪟 Window Management**
```bash
# Open in new window
cursor --new-window Dashboard-v14_2/

# Add to existing window
cursor --add "dashboard-v14-licensing-website 2/"

# Wait for window to close before returning
cursor --wait Dashboard-v14_2/functions/src/index.ts
```

### **📊 Information Commands**
```bash
# Show Cursor version
cursor --version

# Show help
cursor --help
```

---

## 🎯 **COMMON DEVELOPMENT WORKFLOWS**

### **🔧 Feature Development Workflow**
```bash
# 1. Open feature directory
./tools/cursor-cli-workflow.sh feature inventory

# 2. Open related files
cursor Dashboard-v14_2/apps/web/src/features/inventory/InventoryPage.tsx \
      Dashboard-v14_2/apps/web/src/features/inventory/CreateAssetModal.tsx \
      Dashboard-v14_2/functions/src/index.ts

# 3. Open shared library for reference
./tools/cursor-cli-workflow.sh library COMPLETE_COMPONENT_CREATION_GUIDE.md

# 4. Build and test
./tools/cursor-firebase-build.sh build-deploy hosting
```

### **🔥 Firebase Functions Development**
```bash
# 1. Open functions
./tools/cursor-cli-workflow.sh functions

# 2. Open related service files
cursor Dashboard-v14_2/apps/web/src/services/firebaseConfig.ts \
      Dashboard-v14_2/apps/web/src/services/ProjectDatasetFilterService.ts

# 3. Deploy functions
./tools/cursor-firebase-build.sh deploy functions

# 4. Test API
./tools/cursor-firebase-build.sh health
```

### **⚙️ Configuration Management**
```bash
# 1. Open all config files
./tools/cursor-cli-workflow.sh config

# 2. Edit specific configurations
cursor Dashboard-v14_2/.cursor-settings.json
cursor Dashboard-v14_2/.cursor-auto-features.json
cursor Dashboard-v14_2/firebase.json

# 3. Test configuration
./tools/cursor-firebase-build.sh build
```

### **🚀 Complete Development Environment**
```bash
# 1. Open everything
./tools/cursor-cli-workflow.sh dev-env

# 2. Build and deploy
./tools/cursor-firebase-build.sh build-deploy both

# 3. Verify deployment
./tools/cursor-firebase-build.sh health
```

---

## 🎯 **SPECIFIC FILE PATTERNS**

### **📁 Critical Files to Open**
```bash
# Main application files
cursor Dashboard-v14_2/apps/web/src/main.tsx
cursor Dashboard-v14_2/apps/web/src/App.tsx

# Firebase configuration
cursor Dashboard-v14_2/apps/web/src/services/firebaseConfig.ts
cursor Dashboard-v14_2/functions/src/index.ts

# Large feature components
cursor Dashboard-v14_2/apps/web/src/features/inventory/InventoryPage.tsx
cursor Dashboard-v14_2/apps/web/src/features/sessions/ProjectSessionsPage.tsx
cursor Dashboard-v14_2/apps/web/src/features/client/pages/Notes.tsx

# Service files
cursor Dashboard-v14_2/apps/web/src/services/ProjectDatasetFilterService.ts
cursor Dashboard-v14_2/apps/web/src/services/FirebaseMessagingService.ts
```

### **⚙️ Configuration Files**
```bash
# Cursor configuration
cursor Dashboard-v14_2/.cursor-settings.json
cursor Dashboard-v14_2/.cursor-auto-features.json
cursor Dashboard-v14_2/.cursorrules

# Firebase configuration
cursor Dashboard-v14_2/firebase.json
cursor firestore.rules
cursor storage.rules

# Build configuration
cursor Dashboard-v14_2/apps/web/package.json
cursor Dashboard-v14_2/apps/web/esbuild.config.js
```

### **📚 Documentation Files**
```bash
# Shared library
cursor shared-mpc-library/CURSOR_AUTO_OPTIMIZATION_GUIDE.md
cursor shared-mpc-library/COMPLETE_COMPONENT_CREATION_GUIDE.md
cursor shared-mpc-library/CURSOR_CLI_INTEGRATION_MPC.md
cursor shared-mpc-library/FIREBASE_PERSISTENCE_ARCHITECTURE_MPC.md
```

---

## 🎯 **ADVANCED PATTERNS**

### **🔍 Multi-File Development**
```bash
# Open related files for feature development
cursor Dashboard-v14_2/apps/web/src/features/inventory/InventoryPage.tsx \
      Dashboard-v14_2/apps/web/src/features/inventory/CreateAssetModal.tsx \
      Dashboard-v14_2/functions/src/index.ts

# Open service and component files together
cursor Dashboard-v14_2/apps/web/src/services/ProjectDatasetFilterService.ts \
      Dashboard-v14_2/apps/web/src/features/chat/user-messaging/components/ChatPage.tsx
```

### **📍 Line-Specific Development**
```bash
# Open specific function sections
cursor --goto 100:1 Dashboard-v14_2/functions/src/index.ts  # Authentication
cursor --goto 500:1 Dashboard-v14_2/functions/src/index.ts  # Team Members
cursor --goto 1000:1 Dashboard-v14_2/functions/src/index.ts # Projects

# Open specific component sections
cursor --goto 50:1 Dashboard-v14_2/apps/web/src/features/inventory/InventoryPage.tsx  # State
cursor --goto 200:1 Dashboard-v14_2/apps/web/src/features/inventory/InventoryPage.tsx # Render
```

### **🪟 Window Management**
```bash
# Open main project in new window
cursor --new-window Dashboard-v14_2/

# Add licensing website to same window
cursor --add "dashboard-v14-licensing-website 2/"

# Add shared library to same window
cursor --add shared-mpc-library/
```

---

## 🎯 **PRODUCTIVITY TIPS**

### **⚡ Create Aliases (Add to ~/.zshrc)**
```bash
# Cursor CLI aliases
alias c='cursor'
alias co='cursor .'
alias cn='cursor --new-window'
alias ca='cursor --add'

# Project-specific aliases
alias backbone='cursor "/Users/chebrooks/Documents/IDE_Project/BACKBONE 14_2 & Website 2 full project files/Dashboard-v14_2/"'
alias licensing='cursor "/Users/chebrooks/Documents/IDE_Project/BACKBONE 14_2 & Website 2 full project files/dashboard-v14-licensing-website 2/"'
alias functions='cursor "/Users/chebrooks/Documents/IDE_Project/BACKBONE 14_2 & Website 2 full project files/Dashboard-v14_2/functions/src/index.ts"'
alias inventory='cursor "/Users/chebrooks/Documents/IDE_Project/BACKBONE 14_2 & Website 2 full project files/Dashboard-v14_2/apps/web/src/features/inventory/"'
```

### **🚀 Quick Navigation Functions**
```bash
# Add to ~/.zshrc
backbone() { cursor "/Users/chebrooks/Documents/IDE_Project/BACKBONE 14_2 & Website 2 full project files/Dashboard-v14_2/"; }
licensing() { cursor "/Users/chebrooks/Documents/IDE_Project/BACKBONE 14_2 & Website 2 full project files/dashboard-v14-licensing-website 2/"; }
functions() { cursor "/Users/chebrooks/Documents/IDE_Project/BACKBONE 14_2 & Website 2 full project files/Dashboard-v14_2/functions/src/index.ts"; }
inventory() { cursor "/Users/chebrooks/Documents/IDE_Project/BACKBONE 14_2 & Website 2 full project files/Dashboard-v14_2/apps/web/src/features/inventory/"; }
```

### **🔧 Terminal Integration**
```bash
# Combine terminal commands with Cursor CLI
cd "/Users/chebrooks/Documents/IDE_Project/BACKBONE 14_2 & Website 2 full project files" && \
cursor Dashboard-v14_2/ && \
echo "Opening BACKBONE Dashboard in Cursor..."

# Build and open result
./tools/cursor-firebase-build.sh build && \
cursor Dashboard-v14_2/apps/web/public/
```

---

## 🎯 **ERROR PREVENTION & VALIDATION**

### **✅ Safe Commands (Read-Only)**
```bash
# These commands only show information, no changes made
./tools/cursor-firebase-build.sh status
./tools/cursor-firebase-build.sh help
./tools/cursor-cli-workflow.sh help
cursor --version
cursor --help
```

### **⚠️ Action Commands (Make Changes)**
```bash
# These commands make changes to your project
./tools/cursor-firebase-build.sh build
./tools/cursor-firebase-build.sh deploy
./tools/cursor-cli-workflow.sh dashboard
cursor file.txt
```

### **🔍 Validation Workflow**
```bash
# 1. Check status first
./tools/cursor-firebase-build.sh status

# 2. Build and verify
./tools/cursor-firebase-build.sh build

# 3. Deploy and test
./tools/cursor-firebase-build.sh deploy hosting
./tools/cursor-firebase-build.sh health
```

---

## 🎯 **TROUBLESHOOTING**

### **❌ Common Issues**
```bash
# Cursor CLI not found
# Solution: Install via Command Palette in Cursor

# Permission denied on scripts
# Solution: chmod +x tools/*.sh

# Firebase deployment fails
# Solution: Check firebase.json and authentication
```

### **🔍 Debug Commands**
```bash
# Check Cursor CLI installation
cursor --version

# Check script permissions
ls -la tools/*.sh

# Check Firebase configuration
cursor Dashboard-v14_2/firebase.json
```

---

## 🎯 **SUMMARY**

You now have **complete control** over your BACKBONE v14.2 development workflow with:

- **🚀 2 automation scripts** with 20+ commands
- **🎯 Direct Cursor CLI** with 10+ options
- **📁 Project navigation** for all features
- **🔥 Firebase integration** for build/deploy
- **⚙️ Configuration management** for all settings
- **📚 Library access** for documentation
- **🔍 Health monitoring** for deployments
- **⚡ Productivity shortcuts** and aliases

**Start with the most common commands and gradually explore the advanced features!**
