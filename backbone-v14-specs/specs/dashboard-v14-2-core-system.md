# Dashboard v14.2 Core System Specification

## Project Overview

**Project Name**: Dashboard v14.2  
**Type**: Firebase Web-Only Production Application  
**Architecture**: Monorepo with Mode Awareness System  
**Deployment**: Firebase Hosting + Functions + Firestore  
**Live URL**: https://backbone-client.web.app  

## Core Architecture Principles

### 1. Firebase-First Web-Only Architecture
- **NON-NEGOTIABLE**: All components must work in Firebase production environment
- No local development servers or Docker containers in production
- Firebase Authentication, Firestore, Functions, and Hosting only
- Web-only deployment with proper authentication flows

### 2. Mode Awareness System
- **Dual-Mode Support**: Standalone desktop and collaborative network modes
- **Intelligent Adaptation**: Components adapt based on current mode context
- **Zero Breaking Changes**: Existing code continues to work without modifications
- **Seamless Switching**: Mode changes without losing session state

### 3. Multi-Tenant Data Isolation
- **Organization-Based Access**: All data operations enforce organization membership
- **Security Rules**: Firestore rules prevent cross-tenant data access
- **Role-Based Permissions**: Admin, member, viewer roles with proper access control
- **Data Validation**: Input validation and sanitization for all user data

## Technology Stack

### Frontend
- **React 18** with TypeScript 5
- **Vite 5** for build system and development
- **Material-UI (MUI)** for component library
- **Firebase SDK** for authentication and data operations
- **Mode-aware components** with intelligent adaptation

### Backend
- **Firebase Functions** (Node.js 18+)
- **Firestore** for data storage and real-time updates
- **Firebase Authentication** for user management
- **Firebase Hosting** for static file serving

### Development Tools
- **pnpm** for package management
- **Turbo** for monorepo management
- **ESLint + TypeScript** for code quality
- **Firebase emulators** for local testing

## Core Components Specification

### 1. Authentication System
```typescript
interface AuthenticationSystem {
  // Firebase Auth integration
  provider: 'firebase';
  tokenManagement: {
    getToken: () => string | null;
    refreshToken: () => Promise<string>;
    logout: () => Promise<void>;
  };
  
  // Organization-based access
  organizationValidation: {
    getUserOrganizationId: () => string;
    validateOrganizationAccess: (orgId: string) => boolean;
  };
  
  // Role-based permissions
  roleManagement: {
    getCurrentRole: () => 'admin' | 'member' | 'viewer';
    hasPermission: (permission: string) => boolean;
  };
}
```

### 2. Mode Awareness System
```typescript
interface ModeAwarenessSystem {
  currentMode: 'standalone' | 'network';
  
  // Mode switching
  switchMode: (mode: 'standalone' | 'network') => void;
  
  // Component adaptation
  adaptComponent: (component: React.ComponentType, mode: string) => React.ComponentType;
  
  // Data isolation
  getDataContext: () => 'local' | 'shared';
  
  // Feature availability
  isFeatureAvailable: (feature: string) => boolean;
}
```

### 3. API Service Layer
```typescript
interface APIServiceLayer {
  // Unified base URL utility
  baseURL: string; // Uses getApiBaseUrl() utility
  
  // Authentication headers
  authHeaders: {
    Authorization: `Bearer ${token}`;
  };
  
  // Error handling
  errorHandling: {
    interceptors: {
      request: (config) => config;
      response: (response) => response;
      error: (error) => Promise.reject(error);
    };
  };
  
  // Service methods
  services: {
    auth: AuthService;
    projects: ProjectService;
    teamMembers: TeamMemberService;
    organizations: OrganizationService;
  };
}
```

### 4. Theme Integration System
```typescript
interface ThemeIntegrationSystem {
  // Theme hooks
  theme: {
    useTheme: () => Theme;
    useEnhancedThemeMode: () => {
      mode: 'light' | 'dark';
      customizations: ThemeCustomizations;
    };
  };
  
  // Styling patterns
  styling: {
    backgroundColor: 'theme.palette.background.paper';
    borderRadius: 'theme.shape.borderRadius';
    spacing: 'theme.spacing(2)';
    colors: 'theme.palette.*';
  };
  
  // Component integration
  componentIntegration: {
    sx: (styles: object) => object;
    themeValues: (path: string) => any;
  };
}
```

## Data Models Specification

### 1. User Model
```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  organizationId: string;
  role: 'admin' | 'member' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
}
```

### 2. Organization Model
```typescript
interface Organization {
  id: string;
  name: string;
  ownerId: string;
  members: string[]; // User IDs
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

### 3. Project Model
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  createdBy: string; // User ID
  teamMembers: string[]; // User IDs
  status: 'active' | 'archived' | 'draft';
  createdAt: Date;
  updatedAt: Date;
  mode: 'standalone' | 'network';
}
```

### 4. Team Member Model
```typescript
interface TeamMember {
  id: string;
  userId: string;
  organizationId: string;
  role: 'admin' | 'member' | 'viewer';
  permissions: string[];
  assignedProjects: string[]; // Project IDs
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

## API Endpoints Specification

### 1. Authentication Endpoints
```typescript
interface AuthEndpoints {
  '/api/auth/login': {
    method: 'POST';
    body: { email: string; password: string };
    response: { success: boolean; token: string; user: User };
  };
  
  '/api/auth/register': {
    method: 'POST';
    body: { email: string; password: string; displayName: string };
    response: { success: boolean; token: string; user: User };
  };
  
  '/api/auth/refresh': {
    method: 'POST';
    headers: { Authorization: string };
    response: { success: boolean; token: string };
  };
}
```

### 2. Project Management Endpoints
```typescript
interface ProjectEndpoints {
  '/api/projects': {
    GET: {
      headers: { Authorization: string };
      response: { success: boolean; data: Project[] };
    };
    POST: {
      headers: { Authorization: string };
      body: { name: string; description: string; mode: string };
      response: { success: boolean; data: Project };
    };
  };
  
  '/api/projects/:id': {
    GET: {
      headers: { Authorization: string };
      response: { success: boolean; data: Project };
    };
    PUT: {
      headers: { Authorization: string };
      body: Partial<Project>;
      response: { success: boolean; data: Project };
    };
    DELETE: {
      headers: { Authorization: string };
      response: { success: boolean };
    };
  };
}
```

### 3. Team Management Endpoints
```typescript
interface TeamEndpoints {
  '/api/team-members': {
    GET: {
      headers: { Authorization: string };
      response: { success: boolean; data: TeamMember[] };
    };
    POST: {
      headers: { Authorization: string };
      body: { userId: string; role: string; permissions: string[] };
      response: { success: boolean; data: TeamMember };
    };
  };
  
  '/api/team-members/:id': {
    PUT: {
      headers: { Authorization: string };
      body: Partial<TeamMember>;
      response: { success: boolean; data: TeamMember };
    };
    DELETE: {
      headers: { Authorization: string };
      response: { success: boolean };
    };
  };
}
```

## Security Requirements

### 1. Authentication Security
- Firebase Auth tokens required for all API calls
- Token validation on every request
- Automatic token refresh when expired
- Secure logout with token invalidation

### 2. Data Security
- Firestore security rules for all collections
- Organization-based data isolation
- Input validation and sanitization
- No sensitive data in client-side code

### 3. API Security
- Rate limiting on all endpoints
- CORS configuration for web-only access
- Request validation and sanitization
- Error handling without data exposure

## Performance Requirements

### 1. Web Performance
- Initial load time < 3 seconds
- Bundle size optimization
- Lazy loading for non-critical components
- Efficient Firebase queries with proper indexing

### 2. Real-time Features
- Efficient Firestore listeners
- Proper cleanup of subscriptions
- Optimistic updates where appropriate
- Minimal re-renders

### 3. Mode Switching Performance
- Mode changes < 500ms
- No data loss during mode switches
- Efficient component re-rendering
- Proper state management

## Testing Requirements

### 1. Unit Testing
- Component testing for all UI components
- Service testing for API layer
- Utility function testing
- 70% code coverage minimum

### 2. Integration Testing
- Firebase emulator testing
- API endpoint testing
- Authentication flow testing
- Mode switching testing

### 3. End-to-End Testing
- Complete user workflows
- Cross-browser compatibility
- Mobile responsiveness
- Performance testing

## Deployment Specification

### 1. Build Process
```bash
# Build web application
cd Dashboard-v14_2/apps/web && npm run build

# Deploy to Firebase
cd Dashboard-v14_2 && firebase deploy --only hosting
```

### 2. Environment Configuration
- Production: Firebase production environment
- Development: Firebase emulators
- Testing: Firebase emulators with test data

### 3. Monitoring and Logging
- Firebase Analytics for user behavior
- Error reporting and monitoring
- Performance monitoring
- Security event logging

## Compliance Requirements

### 1. Code Quality
- TypeScript strict mode enabled
- ESLint compliance required
- No unused imports or variables
- Proper error handling

### 2. Documentation
- All components must be documented
- API endpoints must have clear specifications
- Deployment procedures must be documented
- MPC library compliance required

### 3. Maintenance
- Regular dependency updates
- Security patch management
- Performance monitoring
- User feedback integration
