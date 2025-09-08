# Real Codebase Component Patterns Specification

## Overview

This specification documents the actual component patterns found in the BACKBONE v14.2 codebase, based on comprehensive analysis of existing code. These patterns form the foundation for AI-assisted development and consistent code generation.

## Large Component Architecture Patterns

### Pattern 1: Feature Dashboard Components (1,000+ lines)

**Real Examples:**
- `InventoryPage.tsx` (13,623 lines)
- `NewLayout.tsx` (2,744 lines)  
- `NotesPage.tsx` (1,529 lines)
- `MultiAssetInputModal.tsx` (1,892 lines)

**Structure Pattern:**
```typescript
interface LargeComponentProps {
  // Minimal props - self-contained components
}

const LargeFeatureComponent: React.FC<LargeComponentProps> = () => {
  // 1. State Management (Lines 1-200)
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DataType[]>([]);
  
  // 2. Context Integration (Lines 200-300)
  const theme = useTheme();
  const { mode, customizations } = useEnhancedThemeMode();
  const { user, organizationId } = useAuth();
  const { hierarchyLevel } = useUser();
  
  // 3. Service Integration (Lines 300-500)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await jwtService.getToken();
      const response = await apiClient.get('/api/endpoint', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);
  
  // 4. Effect Hooks (Lines 500-600)
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // 5. Event Handlers (Lines 600-800)
  const handleCreate = useCallback(async (formData: FormData) => {
    // Implementation
  }, []);
  
  const handleUpdate = useCallback(async (id: string, formData: FormData) => {
    // Implementation
  }, []);
  
  const handleDelete = useCallback(async (id: string) => {
    // Implementation
  }, []);
  
  // 6. Render Helpers (Lines 800-1000)
  const renderHeader = () => (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.divider}`
    }}>
      <Typography variant="h4">Feature Title</Typography>
      <Button variant="contained" onClick={handleCreate}>
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
  
  // 7. Main Render (Lines 1000+)
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
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          renderContent()
        )}
      </Box>
    </Box>
  );
};
```

### Pattern 2: Firebase Functions API Implementation

**Real Example:** `functions/src/index.ts` (2,318 lines)

**Structure Pattern:**
```typescript
// 1. Imports and Setup (Lines 1-100)
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import { Request, Response, NextFunction } from 'express';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// 2. Security Helpers (Lines 25-100)
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
    // ... more roles
  };
  return rolePermissions[role] || ['read:own', 'write:own'];
}

// 3. Middleware (Lines 85-200)
const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

const validateOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userOrg = await getUserOrganization(req.user.uid);
    if (!userOrg) {
      return res.status(403).json({ success: false, error: 'No organization access' });
    }
    req.user.organizationId = userOrg.id;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Organization validation failed' });
  }
};

// 4. API Endpoints (Lines 200-2000)
// Authentication Endpoints
app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    // Implementation with Firebase Auth
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Team Member Endpoints
app.get('/team-members', authenticateToken, validateOrganization, async (req: Request, res: Response) => {
  try {
    const teamMembers = await db.collection('teamMembers')
      .where('organizationId', '==', req.user.organizationId)
      .get();
    
    const data = teamMembers.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Export Function (Lines 2300+)
export const api = functions.https.onRequest(app);
```

### Pattern 3: Mode-Aware Component Architecture

**Real Example:** `ModeAwareRouter.tsx` (585 lines)

**Structure Pattern:**
```typescript
interface ModeAwareComponentProps {
  requiredMode?: 'standalone' | 'shared_network';
  children: React.ReactNode;
}

const ModeAwareComponent: React.FC<ModeAwareComponentProps> = ({ 
  requiredMode, 
  children 
}) => {
  // 1. Mode Context Integration
  const { currentMode, switchMode } = useModeAwareness();
  const { user } = useAuth();
  
  // 2. Mode Validation
  if (requiredMode && currentMode !== requiredMode) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100vh',
        padding: 3
      }}>
        <Typography variant="h5" gutterBottom>
          Mode Switch Required
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          This feature requires {requiredMode} mode.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => switchMode(requiredMode)}
          sx={{ mt: 2 }}
        >
          Switch to {requiredMode} Mode
        </Button>
      </Box>
    );
  }
  
  // 3. Mode-Specific Rendering
  return (
    <Box sx={{ 
      backgroundColor: currentMode === 'standalone' 
        ? 'background.default' 
        : 'background.paper' 
    }}>
      {children}
    </Box>
  );
};

// Usage in Routes
<Route 
  path="/projects/new/standalone" 
  element={
    <ProtectedRoute requiredMode="standalone">
      <AppLayout>
        <CreateProjectPage />
      </AppLayout>
    </ProtectedRoute>
  } 
/>
```

### Pattern 4: Hierarchy-Based Access Control

**Real Example:** `routes/index.tsx` (217 lines)

**Structure Pattern:**
```typescript
interface HierarchyGuardProps {
  minimumLevel: number;
  children: React.ReactNode;
}

const HierarchyGuard: React.FC<HierarchyGuardProps> = ({ 
  minimumLevel, 
  children 
}) => {
  const { hierarchyLevel, role } = useUser();
  
  if (hierarchyLevel < minimumLevel) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '400px',
        textAlign: 'center'
      }}>
        <Typography variant="h6" color="error" gutterBottom>
          Insufficient Permissions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your role ({role}) requires level {minimumLevel} access.
          Current level: {hierarchyLevel}
        </Typography>
      </Box>
    );
  }
  
  return <>{children}</>;
};

// Usage in Routes
<Route 
  path="/contacts" 
  element={
    <HierarchyGuard minimumLevel={30}>
      <ContactsPage />
    </HierarchyGuard>
  } 
/>
<Route 
  path="/inventory" 
  element={
    <HierarchyGuard minimumLevel={40}>
      <InventoryPage />
    </HierarchyGuard>
  } 
/>
<Route 
  path="/admin/users" 
  element={
    <HierarchyGuard minimumLevel={90}>
      <UserManagementPage />
    </HierarchyGuard>
  } 
/>
```

## Service Layer Patterns

### Pattern 5: Firebase Service Integration

**Real Example:** Service classes throughout both projects

**Structure Pattern:**
```typescript
class FeatureService {
  private baseURL: string;
  
  constructor() {
    this.baseURL = getApiBaseUrl(); // Unified base URL utility
  }
  
  // Standard CRUD Operations
  async getAll(): Promise<FeatureItem[]> {
    try {
      const token = jwtService.getToken();
      const response = await apiClient.get(`${this.baseURL}/api/feature`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch items:', error);
      throw error;
    }
  }
  
  async getById(id: string): Promise<FeatureItem> {
    try {
      const token = jwtService.getToken();
      const response = await apiClient.get(`${this.baseURL}/api/feature/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch item ${id}:`, error);
      throw error;
    }
  }
  
  async create(data: CreateFeatureItemData): Promise<FeatureItem> {
    try {
      const token = jwtService.getToken();
      const response = await apiClient.post(`${this.baseURL}/api/feature`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to create item:', error);
      throw error;
    }
  }
  
  async update(id: string, data: UpdateFeatureItemData): Promise<FeatureItem> {
    try {
      const token = jwtService.getToken();
      const response = await apiClient.put(`${this.baseURL}/api/feature/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Failed to update item ${id}:`, error);
      throw error;
    }
  }
  
  async delete(id: string): Promise<void> {
    try {
      const token = jwtService.getToken();
      await apiClient.delete(`${this.baseURL}/api/feature/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error(`Failed to delete item ${id}:`, error);
      throw error;
    }
  }
}

export const featureService = new FeatureService();
```

## Theme Integration Patterns

### Pattern 6: Consistent Theme Usage

**Real Example:** Throughout all components

**Structure Pattern:**
```typescript
const ComponentWithTheme: React.FC<ComponentProps> = (props) => {
  // 1. Theme Hooks (Always include both)
  const theme = useTheme();
  const { mode, customizations } = useEnhancedThemeMode();
  
  // 2. Consistent Styling Patterns
  const styles = {
    container: {
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(2),
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: theme.shadows[1]
    },
    header: {
      borderBottom: `1px solid ${theme.palette.divider}`,
      paddingBottom: theme.spacing(1),
      marginBottom: theme.spacing(2)
    },
    button: {
      borderRadius: theme.shape.borderRadius,
      textTransform: 'none' as const,
      fontWeight: theme.typography.fontWeightMedium
    }
  };
  
  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
        <Typography variant="h6" color="text.primary">
          Component Header
        </Typography>
      </Box>
      <Button sx={styles.button} variant="contained">
        Action Button
      </Button>
    </Box>
  );
};
```

## Error Handling Patterns

### Pattern 7: Comprehensive Error Handling

**Structure Pattern:**
```typescript
const ComponentWithErrorHandling: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleAsyncOperation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Async operation
      const result = await someAsyncOperation();
      
      // Handle success
      console.log('Operation successful:', result);
    } catch (error) {
      console.error('Operation failed:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);
  
  if (error) {
    return (
      <Alert severity="error" sx={{ margin: 2 }}>
        <AlertTitle>Error</AlertTitle>
        {error}
        <Button onClick={() => setError(null)} sx={{ mt: 1 }}>
          Dismiss
        </Button>
      </Alert>
    );
  }
  
  return (
    <Box>
      {loading && <CircularProgress />}
      {/* Component content */}
    </Box>
  );
};
```

## Implementation Guidelines

### 1. Component Size Management
- **Large Components (1,000+ lines)**: Use section comments and helper functions
- **Feature Organization**: Group related functionality in feature folders
- **Lazy Loading**: Always use React.lazy for page-level components

### 2. Firebase Integration Requirements
- **Authentication**: Always include Bearer token in headers
- **Organization Scoping**: All data queries must include organization validation
- **Error Handling**: Consistent error response format across all endpoints

### 3. Mode Awareness Integration
- **Component Adaptation**: Use mode context for conditional rendering
- **Route Protection**: Include mode requirements in protected routes
- **Feature Availability**: Check mode-specific feature availability

### 4. Security Implementation
- **Hierarchy Validation**: Use numeric hierarchy levels (10-100 scale)
- **Role-Based Access**: Implement role-based permissions
- **Token Management**: Secure token handling with automatic refresh

These patterns represent the actual implementation found in the BACKBONE v14.2 codebase and should be used as the foundation for all new development and AI-assisted code generation.
