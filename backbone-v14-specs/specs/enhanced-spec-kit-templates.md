# Enhanced Spec Kit Templates Based on Real Codebase Analysis

## Overview

This document provides enhanced Spec Kit templates based on comprehensive analysis of the actual BACKBONE v14.2 codebase. These templates reflect real patterns found in production code and enable AI-assisted development that matches existing architecture.

## Template 1: Large Feature Component (1,000+ lines)

**Based on Real Examples:**
- `InventoryPage.tsx` (13,623 lines)
- `NewLayout.tsx` (2,744 lines)
- `NotesPage.tsx` (1,529 lines)

### Specification Template

```markdown
# [Feature Name] Large Component Specification

## Overview
This specification defines a large feature component following the BACKBONE v14.2 architecture patterns for components exceeding 1,000 lines.

## Requirements
- **Self-contained architecture** with minimal props
- **Comprehensive state management** (200+ lines)
- **Firebase integration** with organization scoping
- **Theme integration** with both useTheme and useEnhancedThemeMode
- **Error handling** with try-catch blocks
- **Performance optimization** with useCallback and useMemo

## Component Structure

### 1. State Management Section (Lines 1-200)
```typescript
interface [ComponentName]State {
  // View management
  activeView: ViewType;
  loading: boolean;
  error: string | null;
  
  // Data management
  data: DataType[];
  selectedItems: string[];
  
  // UI state
  dialogOpen: boolean;
  searchTerm: string;
  filters: FilterType;
}

const [ComponentName]: React.FC = () => {
  // State declarations
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DataType[]>([]);
```

### 2. Context Integration Section (Lines 200-300)
```typescript
  // MANDATORY context integration
  const theme = useTheme();
  const { mode, customizations } = useEnhancedThemeMode();
  const { user, organizationId } = useAuth();
  const { hierarchyLevel } = useUser();
```

### 3. Service Integration Section (Lines 300-500)
```typescript
  // Firebase service integration
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = jwtService.getToken();
      const response = await apiClient.get('/api/[endpoint]', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);
```

### 4. Event Handlers Section (Lines 500-800)
```typescript
  // CRUD operations
  const handleCreate = useCallback(async (formData: FormData) => {
    try {
      const token = jwtService.getToken();
      const response = await apiClient.post('/api/[endpoint]', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setData(prev => [...prev, response.data.data]);
    } catch (error) {
      setError(error.message);
    }
  }, []);
  
  const handleUpdate = useCallback(async (id: string, formData: FormData) => {
    // Implementation
  }, []);
  
  const handleDelete = useCallback(async (id: string) => {
    // Implementation
  }, []);
```

### 5. Render Helpers Section (Lines 800-1000)
```typescript
  // Component render helpers
  const renderHeader = () => (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper
    }}>
      <Typography variant="h4" color="text.primary">
        [Feature Name]
      </Typography>
      <Button 
        variant="contained" 
        onClick={handleCreate}
        sx={{ borderRadius: theme.shape.borderRadius }}
      >
        Create New
      </Button>
    </Box>
  );
  
  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView data={data} />;
      case 'table':
        return <TableView data={data} onEdit={handleUpdate} onDelete={handleDelete} />;
      case 'analytics':
        return <AnalyticsView data={data} />;
      default:
        return null;
    }
  };
```

### 6. Main Render Section (Lines 1000+)
```typescript
  // Main component render
  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.palette.background.default
    }}>
      {renderHeader()}
      
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : (
          renderContent()
        )}
      </Box>
    </Box>
  );
};
```

## Dependencies
- React 18+ with TypeScript
- Material-UI v5
- Firebase SDK
- Custom hooks: useTheme, useEnhancedThemeMode, useAuth, useUser
- Services: jwtService, apiClient

## Testing Requirements
- Unit tests for all event handlers
- Integration tests for Firebase operations
- Component testing for render helpers
- Performance testing for large datasets

## Performance Considerations
- Use useCallback for all event handlers
- Implement useMemo for expensive calculations
- Use React.lazy for code splitting
- Implement virtualization for large lists
```

## Template 2: Firebase Functions API Implementation

**Based on Real Example:** `functions/src/index.ts` (2,318 lines)

### Specification Template

```markdown
# [API Feature] Firebase Functions Specification

## Overview
This specification defines Firebase Functions implementation following BACKBONE v14.2 patterns for comprehensive API endpoints.

## Requirements
- **Firebase Admin SDK** integration
- **Express.js** application structure
- **Authentication middleware** with token validation
- **Organization scoping** for all data operations
- **Role-based permissions** with hierarchy levels
- **Comprehensive error handling** with consistent response format

## Implementation Structure

### 1. Setup and Imports (Lines 1-100)
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import { Request, Response, NextFunction } from 'express';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const app = express();
```

### 2. Security Helpers (Lines 25-100)
```typescript
function getHierarchyFromRole(role: string): number {
  const roleHierarchy: Record<string, number> = {
    'SUPERADMIN': 100, 'ADMIN': 100, 'admin': 90, 'owner': 100,
    'MANAGER': 80, 'POST_COORDINATOR': 70, 'PRODUCER': 65,
    'EDITOR': 60, 'member': 50, 'viewer': 10, 'USER': 30, 'GUEST': 10
  };
  return roleHierarchy[role] || 30;
}

function getPermissionsFromRole(role: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    'SUPERADMIN': ['read:all', 'write:all', 'admin:all', 'delete:all'],
    'ADMIN': ['read:all', 'write:all', 'admin:users', 'admin:team'],
    'member': ['read:org', 'write:assigned'],
    'viewer': ['read:assigned']
  };
  return rolePermissions[role] || ['read:own', 'write:own'];
}
```

### 3. Authentication Middleware (Lines 85-200)
```typescript
const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized: No token provided' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
};

const validateOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userOrg = await getUserOrganization(req.user.uid);
    if (!userOrg) {
      return res.status(403).json({ 
        success: false, 
        error: 'No organization access' 
      });
    }
    req.user.organizationId = userOrg.id;
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'Organization validation failed' 
    });
  }
};
```

### 4. API Endpoints (Lines 200-2000)
```typescript
// GET endpoint pattern
app.get('/api/[resource]', authenticateToken, validateOrganization, async (req: Request, res: Response) => {
  try {
    const data = await db.collection('[collection]')
      .where('organizationId', '==', req.user.organizationId)
      .get();
    
    const results = data.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    res.json({ 
      success: true, 
      data: results 
    });
  } catch (error) {
    console.error('Error fetching [resource]:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST endpoint pattern
app.post('/api/[resource]', authenticateToken, validateOrganization, async (req: Request, res: Response) => {
  try {
    const { [fields] } = req.body;
    
    // Input validation
    if (![validation]) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid input data' 
      });
    }
    
    const newItem = {
      id: generateId(),
      organizationId: req.user.organizationId,
      createdBy: req.user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      [fields]
    };
    
    await db.collection('[collection]').doc(newItem.id).set(newItem);
    
    res.json({ 
      success: true, 
      data: newItem 
    });
  } catch (error) {
    console.error('Error creating [resource]:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
```

### 5. Export Function (Lines 2300+)
```typescript
export const api = functions.https.onRequest(app);
```

## Security Requirements
- Firebase Auth token validation on all endpoints
- Organization-based data isolation
- Role-based access control with hierarchy levels
- Input validation and sanitization
- Comprehensive error logging

## Performance Requirements
- Efficient Firestore queries with proper indexing
- Pagination for large datasets
- Caching strategies for frequently accessed data
- Connection pooling for database operations

## Testing Requirements
- Unit tests for all middleware functions
- Integration tests for API endpoints
- Security testing for authentication flows
- Performance testing for high-load scenarios
```

## Template 3: Mode-Aware Component

**Based on Real Example:** `ModeAwareRouter.tsx` (585 lines)

### Specification Template

```markdown
# [Component Name] Mode-Aware Component Specification

## Overview
This specification defines a mode-aware component that adapts behavior based on the current operational mode (standalone vs network).

## Requirements
- **Mode context integration** with useModeAwareness hook
- **Conditional rendering** based on current mode
- **Mode switching capability** with user feedback
- **Feature availability checking** based on mode
- **Seamless mode transitions** without data loss

## Implementation Structure

### 1. Mode Context Integration
```typescript
interface ModeAwareComponentProps {
  requiredMode?: 'standalone' | 'shared_network';
  children: React.ReactNode;
}

const [ComponentName]: React.FC<ModeAwareComponentProps> = ({ 
  requiredMode, 
  children 
}) => {
  const { currentMode, switchMode, isFeatureAvailable } = useModeAwareness();
  const { user } = useAuth();
  const theme = useTheme();
```

### 2. Mode Validation
```typescript
  // Mode requirement validation
  if (requiredMode && currentMode !== requiredMode) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100vh',
        padding: theme.spacing(3),
        textAlign: 'center'
      }}>
        <Typography variant="h5" gutterBottom color="text.primary">
          Mode Switch Required
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          This feature requires {requiredMode} mode to function properly.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => switchMode(requiredMode)}
          sx={{ 
            mt: 2,
            borderRadius: theme.shape.borderRadius 
          }}
        >
          Switch to {requiredMode} Mode
        </Button>
      </Box>
    );
  }
```

### 3. Mode-Specific Rendering
```typescript
  // Feature availability checking
  const renderModeSpecificFeatures = () => (
    <Box>
      {isFeatureAvailable('real-time-collaboration') && (
        <CollaborationPanel />
      )}
      {isFeatureAvailable('offline-sync') && (
        <OfflineSyncIndicator />
      )}
      {isFeatureAvailable('local-storage') && (
        <LocalStorageManager />
      )}
    </Box>
  );
  
  // Mode-specific styling
  const getModeStyles = () => ({
    backgroundColor: currentMode === 'standalone' 
      ? theme.palette.background.default 
      : theme.palette.background.paper,
    border: currentMode === 'network' 
      ? `1px solid ${theme.palette.primary.main}` 
      : 'none'
  });
```

### 4. Main Render
```typescript
  return (
    <Box sx={getModeStyles()}>
      {renderModeSpecificFeatures()}
      {children}
    </Box>
  );
};
```

## Mode-Specific Features
- **Standalone Mode**: Local storage, offline capabilities, file system access
- **Network Mode**: Real-time collaboration, shared resources, cloud sync
- **Shared Features**: Core functionality available in both modes

## Dependencies
- Mode awareness context and hooks
- Authentication context
- Theme integration
- Feature availability service

## Testing Requirements
- Mode switching functionality tests
- Feature availability validation tests
- Component behavior tests for each mode
- Integration tests with mode context
```

## Template 4: Service Layer Implementation

### Specification Template

```markdown
# [Service Name] Service Layer Specification

## Overview
This specification defines a service layer implementation following BACKBONE v14.2 patterns for Firebase integration and API communication.

## Requirements
- **Firebase integration** with organization scoping
- **Authentication headers** on all requests
- **Unified base URL** utility usage
- **Comprehensive error handling** with logging
- **TypeScript interfaces** for all data types

## Implementation Structure

### 1. Service Class Definition
```typescript
class [ServiceName]Service {
  private baseURL: string;
  
  constructor() {
    this.baseURL = getApiBaseUrl(); // MANDATORY: Use unified utility
  }
  
  // Standard CRUD operations
  async getAll(): Promise<[DataType][]> {
    try {
      const token = jwtService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await apiClient.get(`${this.baseURL}/api/[endpoint]`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch [resource]:', error);
      throw error;
    }
  }
  
  async getById(id: string): Promise<[DataType]> {
    try {
      const token = jwtService.getToken();
      const response = await apiClient.get(`${this.baseURL}/api/[endpoint]/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch [resource] ${id}:`, error);
      throw error;
    }
  }
  
  async create(data: Create[DataType]Data): Promise<[DataType]> {
    try {
      const token = jwtService.getToken();
      const response = await apiClient.post(`${this.baseURL}/api/[endpoint]`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to create [resource]:', error);
      throw error;
    }
  }
  
  async update(id: string, data: Update[DataType]Data): Promise<[DataType]> {
    try {
      const token = jwtService.getToken();
      const response = await apiClient.put(`${this.baseURL}/api/[endpoint]/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`Failed to update [resource] ${id}:`, error);
      throw error;
    }
  }
  
  async delete(id: string): Promise<void> {
    try {
      const token = jwtService.getToken();
      await apiClient.delete(`${this.baseURL}/api/[endpoint]/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error(`Failed to delete [resource] ${id}:`, error);
      throw error;
    }
  }
}

export const [serviceName]Service = new [ServiceName]Service();
```

### 2. TypeScript Interfaces
```typescript
interface [DataType] {
  id: string;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional fields
}

interface Create[DataType]Data {
  // Fields for creation
}

interface Update[DataType]Data {
  // Fields for updates
}
```

## Security Requirements
- Authentication token validation
- Organization-scoped data access
- Input validation and sanitization
- Secure error handling

## Performance Requirements
- Efficient API calls with proper caching
- Request deduplication for concurrent calls
- Proper error recovery mechanisms
- Connection timeout handling

## Testing Requirements
- Unit tests for all service methods
- Integration tests with Firebase
- Error handling validation tests
- Performance benchmarking tests
```

## Implementation Guidelines

### 1. Template Usage
- Use these templates as starting points for new components
- Adapt patterns to specific feature requirements
- Maintain consistency with existing codebase patterns
- Follow security and performance guidelines

### 2. AI Integration
- Provide these templates to AI coding assistants
- Use templates for code generation prompts
- Maintain template updates based on codebase evolution
- Validate generated code against template patterns

### 3. Quality Assurance
- Validate all generated code against templates
- Ensure security patterns are implemented
- Verify performance requirements are met
- Test integration with existing systems

These enhanced templates are based on real analysis of the BACKBONE v14.2 codebase and provide accurate patterns for AI-assisted development that matches the existing architecture and coding standards.
