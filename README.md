# BACKBONE v14.2 - Complete Project Suite

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)

This repository contains the complete BACKBONE v14.2 project suite, including the main web application, licensing website, shared documentation, deployment infrastructure, and all supporting tools.

## 🚀 Live Applications

- **Main Web App**: [https://backbone-client.web.app](https://backbone-client.web.app)
- **API Endpoints**: [https://us-central1-backbone-logic.cloudfunctions.net](https://us-central1-backbone-logic.cloudfunctions.net)
- **Licensing Website**: [https://backbone-logic.web.app](https://backbone-logic.web.app)

## 🏗️ Project Architecture

### Core Applications

#### 📱 Dashboard-v14_2/ - Main Web Application
- **Technology**: React + TypeScript + esbuild
- **Hosting**: Firebase Hosting (`backbone-client` target)
- **Backend**: Firebase Functions + Firestore
- **Features**: 
  - Complete team management system
  - Project and session workflows
  - AI integration (Gemini API)
  - Real-time collaboration
  - Multi-tenant organization support

#### 🌐 dashboard-v14-licensing-website 2/ - Licensing Website
- **Technology**: Next.js + TypeScript
- **Hosting**: Firebase Hosting (`backbone-logic` target)
- **Features**:
  - License management and validation
  - Stripe payment integration
  - Marketing and documentation pages
  - User registration and onboarding

### Supporting Infrastructure

#### 📚 shared-mpc-library/ - Documentation & Best Practices
- Comprehensive documentation library (538+ markdown files)
- Firebase implementation patterns
- API integration guides
- Security best practices
- Deployment procedures

#### 🚀 deployment/ - Deployment Scripts & Automation
- Firebase deployment automation
- Multi-target hosting deployment
- DMG packaging for desktop apps
- Environment synchronization scripts

#### 🔧 tools/ - Utility Scripts & Maintenance
- Database maintenance scripts
- User authentication utilities
- Data migration tools
- Health check and monitoring scripts

### Configuration & Rules

- **`firebase.json`** - Firebase project configuration
- **`firestore.rules`** - Firestore security rules
- **`storage.rules`** - Firebase Storage security rules
- **`package.json`** - Root package configuration

## 🚀 Quick Start

### Prerequisites

```bash
# Required tools
node -v    # v18+ required
npm -v     # Latest version
firebase --version  # Firebase CLI
git --version
```

### Initial Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd "BACKBONE 14_2 & Website 2 full project files"

# Install root dependencies
npm install

# Setup main web application
cd Dashboard-v14_2/apps/web
npm install
cd ../../

# Setup licensing website
cd "dashboard-v14-licensing-website 2"
npm install
cd ../

# Login to Firebase (if not already logged in)
firebase login
```

## 🔨 Development Workflow

### Building Applications

#### Main Web Application
```bash
# Navigate to web app directory
cd Dashboard-v14_2/apps/web

# Install dependencies (if not done)
npm install

# Build for production
npm run build

# Navigate back to root for deployment
cd ../../
```

#### Licensing Website
```bash
# Navigate to licensing website
cd "dashboard-v14-licensing-website 2"

# Install dependencies (if not done)
npm install

# Build for production
npm run build

# Navigate back to root
cd ../
```

### Deployment Commands

#### Deploy Main Web Application
```bash
# From project root
firebase deploy --only hosting:backbone-client
```

#### Deploy Licensing Website
```bash
# From project root
firebase deploy --only hosting:backbone-logic
```

#### Deploy Everything (Hosting + Functions)
```bash
# Deploy all Firebase services
firebase deploy --only hosting,functions

# Or deploy everything
firebase deploy
```

#### Health Check
```bash
# Verify API is running
curl https://us-central1-backbone-logic.cloudfunctions.net/api/health
```

## 📁 Directory Structure

```
BACKBONE 14_2 & Website 2 full project files/
├── 📱 Dashboard-v14_2/                    # Main web application
│   ├── apps/web/                          # Web app source
│   ├── firebase.json                      # Firebase config
│   └── functions/                         # Firebase Functions
├── 🌐 dashboard-v14-licensing-website 2/  # Licensing website
│   ├── client/                            # Next.js frontend
│   ├── server/                            # Backend logic
│   └── shared/                            # Shared utilities
├── 📚 shared-mpc-library/                 # Documentation library
├── 🚀 deployment/                         # Deployment scripts
├── 🔧 tools/                              # Utility scripts
├── 🧪 testing/                            # Test files
├── 📋 firebase.json                       # Root Firebase config
├── 🔒 firestore.rules                     # Database security
├── 🔒 storage.rules                       # Storage security
└── 📦 package.json                        # Root dependencies
```

## 🔧 Available Scripts

### Root Level Commands
```bash
# Development (if configured)
npm run dev

# Build both projects
npm run build

# Deploy both projects
npm run deploy
```

### Project-Specific Commands
Each project maintains its own `package.json` with specific scripts:

- **Dashboard-v14_2/apps/web/package.json** - Main app scripts
- **dashboard-v14-licensing-website 2/package.json** - Licensing website scripts

## 🔐 Security & Configuration

### Environment Variables
- All sensitive configuration stored in Firebase environment variables
- No service account keys committed to repository
- Environment-specific configurations properly isolated

### Security Rules
- **Firestore Rules**: Multi-tenant data isolation
- **Storage Rules**: File access control
- **Authentication**: Firebase Auth integration
- **API Security**: Token-based authentication on all endpoints

### Firebase Project Details
- **Project ID**: `backbone-logic`
- **Region**: `us-central1`
- **Hosting Targets**:
  - `backbone-client` → Main web application
  - `backbone-logic` → Licensing website

## 🔄 Git Workflow

This repository uses a **monorepo** structure that preserves the individual git histories of both projects:

- **Dashboard-v14_2** maintains its own git history (currently on `mui-upgrade-phase2` branch)
- **dashboard-v14-licensing-website 2** maintains its own git history (currently on `main` branch)
- Root repository unifies everything for deployment and documentation

### Branch Strategy
- `main` - Production-ready code
- `development` - Integration branch
- Feature branches for specific improvements

## 📊 API Documentation

### Authentication Required
All API endpoints require Firebase Authentication:
```bash
Authorization: Bearer <firebase-id-token>
```

### Response Format
```typescript
// Success Response
{
  success: true,
  data: { ... }
}

// Error Response
{
  success: false,
  error: "Human readable message",
  errorDetails: "Technical details"
}
```

### Key Endpoints
- **Authentication**: `/api/auth/*`
- **Team Management**: `/api/team/*`
- **Organizations**: `/api/organizations/*`
- **Projects**: `/api/projects/*`
- **Sessions**: `/api/sessions/*`
- **AI Integration**: `/api/ai/*`
- **Licensing**: `/api/licensing/*`
- **Payments**: `/api/payments/*`

## 🧪 Testing

### Test Files Location
- Root level: `test-*.html`, `test-*.js`, `test-*.cjs`
- Testing directory: `testing/auth/`
- Individual projects maintain their own test suites

### Running Tests
```bash
# Run project-specific tests
cd Dashboard-v14_2/apps/web && npm test
cd "dashboard-v14-licensing-website 2" && npm test
```

## 📈 Monitoring & Health Checks

### Health Endpoints
```bash
# API Health Check
curl https://us-central1-backbone-logic.cloudfunctions.net/api/health

# Function Health Check
curl https://us-central1-backbone-logic.cloudfunctions.net/healthCheck
```

### Logging
- Firebase Functions logs available in Firebase Console
- Application logs integrated with Firebase Analytics
- Error tracking and performance monitoring enabled

## 🚨 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear caches and rebuild
cd Dashboard-v14_2/apps/web
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Deployment Issues
```bash
# Verify Firebase login
firebase login --reauth

# Check project configuration
firebase projects:list
firebase use backbone-logic
```

#### Permission Errors
```bash
# Verify Firebase permissions
firebase projects:list
firebase functions:log
```

### Getting Help
1. Check the `shared-mpc-library/` for detailed documentation
2. Review deployment scripts in `deployment/` directory
3. Check Firebase Console for real-time logs and metrics

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- TypeScript for all new code
- ESLint configuration enforced
- Prettier for code formatting
- Comprehensive error handling required

## 📄 License

[Your License Information Here]

## 📞 Support & Contact

[Your Support Information Here]

---

**Built with ❤️ using Firebase, React, TypeScript, and Next.js**

*Last updated: December 2024*
