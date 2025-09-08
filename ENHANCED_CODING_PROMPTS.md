# 🚀 Enhanced Coding Prompts for BACKBONE v14.2

## Quick Reference Prompts

### **Component Creation Prompt**
```
Create a [ComponentName] component following the real BACKBONE v14.2 patterns:

REAL CODEBASE REFERENCES:
- InventoryPage.tsx (13,623 lines) - Large component structure
- NewLayout.tsx (2,744 lines) - Layout patterns
- functions/src/index.ts (2,318 lines) - Firebase integration

MANDATORY PATTERNS:
1. State Management (Lines 1-200):
   const [activeView, setActiveView] = useState<ViewType>('overview');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

2. Context Integration (Lines 200-300):
   const theme = useTheme();
   const { mode, customizations } = useEnhancedThemeMode();
   const { user, organizationId } = useAuth();

3. Firebase Service Integration (Lines 300-500):
   const token = jwtService.getToken();
   const response = await apiClient.get('/api/endpoint', {
     headers: { Authorization: `Bearer ${token}` }
   });

4. Organization Scoping:
   .where('organizationId', '==', organizationId)

5. Error Handling:
   try { /* operation */ } catch (error) { setError(error.message); }

6. Theme Integration:
   sx={{ backgroundColor: theme.palette.background.paper }}

Use the enhanced .cursorrules file for complete coding standards.
```

### **Firebase Functions Prompt**
```
Create a new API endpoint following the real Firebase Functions patterns from functions/src/index.ts (2,318 lines):

MANDATORY STRUCTURE:
1. Authentication Middleware:
   const authenticateToken = async (req, res, next) => {
     const token = req.headers.authorization?.split(' ')[1];
     const decodedToken = await admin.auth().verifyIdToken(token);
     req.user = decodedToken;
     next();
   };

2. Organization Validation:
   const validateOrganization = async (req, res, next) => {
     const userOrg = await getUserOrganization(req.user.uid);
     req.user.organizationId = userOrg.id;
     next();
   };

3. API Endpoint Pattern:
   app.get('/api/endpoint', authenticateToken, validateOrganization, async (req, res) => {
     try {
       const data = await db.collection('collection')
         .where('organizationId', '==', req.user.organizationId)
         .get();
       res.json({ success: true, data: data.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
     } catch (error) {
       res.status(500).json({ success: false, error: error.message });
     }
   });

4. Role Hierarchy:
   function getHierarchyFromRole(role: string): number {
     const roleHierarchy = { 'SUPERADMIN': 100, 'ADMIN': 100, 'member': 50, 'viewer': 10 };
     return roleHierarchy[role] || 30;
   }
```

### **Service Layer Prompt**
```
Create a service following the real BACKBONE v14.2 service patterns:

MANDATORY PATTERNS:
1. Service Class Structure:
   class FeatureService {
     private baseURL = getApiBaseUrl(); // MANDATORY: Use unified utility
     
     async getAll(): Promise<FeatureItem[]> {
       const token = jwtService.getToken();
       const response = await apiClient.get(`${this.baseURL}/api/feature`, {
         headers: { Authorization: `Bearer ${token}` }
       });
       return response.data.data;
     }
   }

2. Authentication Headers:
   headers: { Authorization: `Bearer ${token}` }

3. Error Handling:
   try { /* operation */ } catch (error) { console.error(error); throw error; }

4. TypeScript Interfaces:
   interface FeatureItem {
     id: string;
     organizationId: string;
     createdBy: string;
     createdAt: Date;
     updatedAt: Date;
   }
```

### **Mode-Aware Component Prompt**
```
Create a mode-aware component following the real ModeAwareRouter.tsx patterns (585 lines):

MANDATORY PATTERNS:
1. Mode Context Integration:
   const { currentMode, switchMode, isFeatureAvailable } = useModeAwareness();

2. Mode Validation:
   if (requiredMode && currentMode !== requiredMode) {
     return <ModeSwitchRequired requiredMode={requiredMode} />;
   }

3. Feature Availability:
   {isFeatureAvailable('real-time-collaboration') && <CollaborationPanel />}
   {isFeatureAvailable('offline-sync') && <OfflineSyncIndicator />}

4. Mode-Specific Styling:
   sx={{ backgroundColor: currentMode === 'standalone' ? 'background.default' : 'background.paper' }}
```

## 🎯 **Project-Specific Prompts**

### **Dashboard v14.2 Prompts**
```
For Dashboard v14.2 development, always include:
- Reference to InventoryPage.tsx (13,623 lines) for large components
- Firebase Functions patterns from functions/src/index.ts (2,318 lines)
- Mode awareness with useModeAwareness hook
- Hierarchy guards for access control
- Theme integration with useTheme() and useEnhancedThemeMode()
- Organization scoping for all data operations
```

### **Licensing Website Prompts**
```
For Licensing Website development, always include:
- Server patterns from server/src/index.ts (1,366 lines)
- Stripe integration with webhook verification
- Multi-tenant license management
- Dark theme with glassmorphism effects
- Role-based access control with Firebase Auth
- Organization scoping for all queries
```

## 🔧 **Quick Setup Commands**

```bash
# 1. Use enhanced .cursorrules (already done)
# Dashboard: Dashboard-v14_2/.cursorrules
# Licensing: dashboard-v14-licensing-website 2/.cursorrules

# 2. Reference Spec Kit templates
cd backbone-v14-specs
/specify create [feature-name]
/plan create [implementation-plan]
/tasks generate [development-tasks]

# 3. Use real codebase references
# Always mention specific files and line counts for context
```

## 📋 **Best Practices**

1. **Always reference real files** with line counts for context
2. **Use the enhanced .cursorrules** for automatic pattern recognition
3. **Include mandatory patterns** in every prompt
4. **Reference Spec Kit templates** for comprehensive specifications
5. **Use project-specific prompts** for Dashboard vs Licensing development
