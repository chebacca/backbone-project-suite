# 🔐 Component Authorization Guide - Unified Auth System

## 🎯 How Components Will Authorize Themselves

After implementing the unified auth system, components will use a **layered authorization approach** with multiple patterns for different use cases.

## 🏗️ **Authorization Architecture**

### **1. Route-Level Protection (Primary)**
```tsx
// routes/index.tsx - Re-enabled with proper auth
<Route 
  path="/admin/users" 
  element={
    <RoleGuard allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <UserManagementPage />
    </RoleGuard>
  } 
/>
```

### **2. Component-Level Guards (Secondary)**
```tsx
// Inside components
const MyComponent = () => {
  const { user, isAuthenticated } = useUnifiedAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <RoleBasedRenderer requiredRoles={['ADMIN']}>
      <AdminContent />
    </RoleBasedRenderer>
  );
};
```

### **3. Feature-Level Permissions (Granular)**
```tsx
// Using tier permissions
const MyFeature = () => {
  const { hasFeatureAccess, hasPermission } = useTierPermissions();
  
  if (!hasFeatureAccess('inventory.core')) {
    return <UpgradePrompt feature="inventory.core" />;
  }
  
  if (!hasPermission('inventory.core', 'edit')) {
    return <ReadOnlyView />;
  }
  
  return <FullInventoryEditor />;
};
```

## 🔧 **Implementation Patterns**

### **Pattern 1: Route Protection (Recommended)**
```tsx
// routes/index.tsx
import { RoleGuard } from '@/features/auth/components/RoleGuard';
import { PrivateRoute } from '@/features/auth/components/PrivateRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <DashboardPage />
        </PrivateRoute>
      } />
      
      {/* Role-protected routes */}
      <Route path="/admin/*" element={
        <RoleGuard allowedRoles={['ADMIN', 'SUPERADMIN']}>
          <AdminRoutes />
        </RoleGuard>
      } />
      
      {/* Feature-protected routes */}
      <Route path="/inventory" element={
        <FeatureGuard feature="inventory.core">
          <InventoryPage />
        </FeatureGuard>
      } />
    </Routes>
  );
};
```

### **Pattern 2: Component-Level Authorization**
```tsx
// components/AdminPanel.tsx
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { RoleBasedRenderer } from '@/features/auth/components/RoleBasedRenderer';

const AdminPanel = () => {
  const { user, isAuthenticated } = useUnifiedAuth();
  
  // Basic auth check
  if (!isAuthenticated) {
    return <div>Please log in to access this feature.</div>;
  }
  
  return (
    <div>
      <h1>Admin Panel</h1>
      
      {/* Role-based content rendering */}
      <RoleBasedRenderer requiredRoles={['ADMIN', 'SUPERADMIN']}>
        <UserManagementSection />
      </RoleBasedRenderer>
      
      <RoleBasedRenderer requiredRoles={['SUPERADMIN']}>
        <SystemSettingsSection />
      </RoleBasedRenderer>
      
      {/* Permission-based content */}
      <RoleBasedRenderer requiresEdit={true}>
        <EditControls />
      </RoleBasedRenderer>
    </div>
  );
};
```

### **Pattern 3: Feature-Level Permissions**
```tsx
// components/InventoryManager.tsx
import { useTierPermissions } from '@/hooks/useTierPermissions';

const InventoryManager = () => {
  const { 
    hasFeatureAccess, 
    hasPermission, 
    canAccessRoute,
    tierPermissions 
  } = useTierPermissions();
  
  // Check feature access
  if (!hasFeatureAccess('inventory.core')) {
    return (
      <UpgradePrompt 
        feature="inventory.core"
        currentTier={tierPermissions?.tier}
        requiredTier="PRO"
      />
    );
  }
  
  return (
    <div>
      <h1>Inventory Manager</h1>
      
      {/* Permission-based controls */}
      {hasPermission('inventory.core', 'create') && (
        <CreateItemButton />
      )}
      
      {hasPermission('inventory.core', 'edit') && (
        <EditControls />
      )}
      
      {hasPermission('inventory.core', 'delete') && (
        <DeleteButton />
      )}
    </div>
  );
};
```

### **Pattern 4: Service-Level Authorization**
```tsx
// services/inventoryService.ts
import { unifiedFirebaseAuth } from './UnifiedFirebaseAuth';
import { roleContextService } from './roleContextService';

export class InventoryService {
  async createItem(itemData: any) {
    // Check authentication
    if (!unifiedFirebaseAuth.isAuthenticated()) {
      throw new Error('Authentication required');
    }
    
    // Check permissions
    if (!roleContextService.hasPermission('inventory.core', 'create')) {
      throw new Error('Insufficient permissions');
    }
    
    // Proceed with operation
    return await this.apiClient.post('/inventory', itemData);
  }
  
  async deleteItem(itemId: string) {
    // Check authentication
    if (!unifiedFirebaseAuth.isAuthenticated()) {
      throw new Error('Authentication required');
    }
    
    // Check permissions
    if (!roleContextService.hasPermission('inventory.core', 'delete')) {
      throw new Error('Insufficient permissions');
    }
    
    // Proceed with operation
    return await this.apiClient.delete(`/inventory/${itemId}`);
  }
}
```

## 🛡️ **Authorization Hooks & Utilities**

### **Primary Hook: useUnifiedAuth**
```tsx
// All components use this single hook
const { 
  user, 
  isAuthenticated, 
  isLoading, 
  login, 
  logout,
  hasRole,
  hasPermission,
  getOrganizationId 
} = useUnifiedAuth();
```

### **Role Management Hook: useEnhancedUserRole**
```tsx
// For complex role logic
const { 
  effectiveRole, 
  isTeamMember, 
  isOrganizationOwner,
  projectRole,
  teamRole 
} = useEnhancedUserRole(user);
```

### **Permission Hook: useTierPermissions**
```tsx
// For feature and tier-based permissions
const { 
  hasFeatureAccess, 
  hasPermission, 
  canAccessRoute,
  tierPermissions 
} = useTierPermissions();
```

## 🔄 **Authorization Flow**

### **1. User Authentication**
```tsx
// User logs in through UnifiedAuthProvider
const login = async (credentials) => {
  const user = await unifiedFirebaseAuth.login(credentials);
  // User data includes: role, permissions, organizationId, etc.
};
```

### **2. Route Access Check**
```tsx
// Route guard checks authentication and role
<RoleGuard allowedRoles={['ADMIN']}>
  <AdminPage />
</RoleGuard>
```

### **3. Component Permission Check**
```tsx
// Component checks specific permissions
const canEdit = hasPermission('inventory.core', 'edit');
const canDelete = hasPermission('inventory.core', 'delete');
```

### **4. Service Authorization**
```tsx
// Service validates permissions before API calls
if (!roleContextService.hasPermission('inventory.core', 'create')) {
  throw new Error('Insufficient permissions');
}
```

## 📋 **Migration Strategy**

### **Step 1: Update Route Protection**
```tsx
// Before (disabled)
<Route path="/admin" element={<AdminPage />} />

// After (protected)
<Route path="/admin" element={
  <RoleGuard allowedRoles={['ADMIN', 'SUPERADMIN']}>
    <AdminPage />
  </RoleGuard>
} />
```

### **Step 2: Update Component Imports**
```tsx
// Before (legacy)
import { useAuth } from '@/contexts/AuthContext';
import { useTeamMemberAuth } from '@/contexts/TeamMemberAuthContext';

// After (unified)
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
```

### **Step 3: Update Permission Checks**
```tsx
// Before (multiple systems)
const isAdmin = user?.role === 'ADMIN' || user?.teamMemberRole === 'ADMIN';

// After (unified)
const isAdmin = hasRole('ADMIN');
```

## 🎯 **Key Benefits**

1. **Single Source of Truth**: All auth logic in `UnifiedAuthProvider`
2. **Consistent API**: Same hooks and patterns everywhere
3. **Type Safety**: Full TypeScript support
4. **Performance**: Optimized re-renders and caching
5. **Security**: Centralized permission validation
6. **Maintainability**: One system to update and debug

## 🚨 **Important Notes**

1. **All components must use `useUnifiedAuth`** - no more legacy auth hooks
2. **Routes must be protected** - no more "DIRECT LAUNCH MODE"
3. **Services must validate permissions** - no more bypassing auth
4. **Role mapping is automatic** - team member roles are mapped to dashboard roles
5. **Tier permissions are enforced** - features are gated by subscription level

This unified approach ensures that every component knows exactly how to authorize itself while maintaining security and consistency across the entire application.
