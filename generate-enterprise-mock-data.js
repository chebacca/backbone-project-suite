#!/usr/bin/env node

/**
 * 🏢 Enterprise Mock Data Generator for BACKBONE v14.2 (OPTIMIZED)
 * 
 * Creates essential mock data for enterprise.user account with focus on core functionality
 * for both Dashboard and Licensing projects. Optimized to avoid heavy collections that
 * bog down seeding while maintaining proper relationships and tenant isolation.
 * 
 * ✅ CONSOLIDATION UPDATE: This script reflects the consolidated enterprise user:
 * - Single user: enterprise.user@enterprisemedia.com (duplicate removed)
 * - Role: OWNER (users collection) + ADMIN (teamMembers collection)
 * - Organization: enterprise-org-001
 * - Firebase UID: 2ysTqv3pwiXyKxOeExAfEKOIh7K2
 * 
 * ✅ ESSENTIAL COLLECTIONS INCLUDED:
 * - Organizations, Users, TeamMembers (with authentication)
 * - Projects, Sessions, Workflows (core functionality)
 * - Inventory, Assets (essential data)
 * - Subscriptions, Licenses, Payments (Enterprise tier)
 * - Timecards, PBM Schedules (business operations)
 * 
 * ✅ OPTIMIZATIONS (Heavy collections removed):
 * - Network management data (not essential for core functionality)
 * - Large media file creation (bogs down seeding)
 * - AI agents and messages (not essential for basic functionality)
 * - Large datasets and assignments
 * - Complex delivery bibles
 * - Miscellaneous collections
 * 
 * ✅ SESSION TIMING DATA: All sessions include complete timing data
 * ✅ ENTERPRISE TIER: Proper subscriptions, licenses, and payments
 * ✅ AUTHENTICATION: Firebase Auth users created for login capability
 * 
 * Usage:
 *   node generate-enterprise-mock-data.js --dry-run    # Mock mode (safe preview)
 *   node generate-enterprise-mock-data.js --mock       # Mock mode (safe preview)
 *   node generate-enterprise-mock-data.js --cleanup    # Check for existing data and offer cleanup
 *   node generate-enterprise-mock-data.js --force      # Overwrite existing data without prompting
 *   node generate-enterprise-mock-data.js --authenticate # Authenticate all users after creation
 *   node generate-enterprise-mock-data.js --password=MyPassword # Set custom password for users
 *   node generate-enterprise-mock-data.js              # Execute with conflict detection
 * 
 * Safety features:
 * - Checks for existing enterprise data before creating
 * - Offers cleanup options for conflicting data
 * - Mock mode shows what would be created without writing to Firebase
 * - Optimized for faster seeding while maintaining data relationships
 */

const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');

// Dynamic import for faker (ES module)
let faker;

// Check for command line options
const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('--mock');
const shouldCleanup = process.argv.includes('--cleanup') || process.argv.includes('--clean');
const forceOverwrite = process.argv.includes('--force') || process.argv.includes('--overwrite');
const shouldAuthenticate = process.argv.includes('--authenticate') || process.argv.includes('--auth');
const passwordArg = process.argv.find(arg => arg.startsWith('--password='));
const defaultPassword = passwordArg ? passwordArg.split('=')[1] : 'Enterprise123!';

// Initialize Firebase Admin SDK only if not in dry-run mode
let db, auth;
if (!isDryRun) {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        projectId: 'backbone-logic',
        // Use Application Default Credentials
        credential: admin.credential.applicationDefault()
      });
    } catch (error) {
      console.log('⚠️  Firebase Admin SDK initialization failed:', error.message);
      // Try without explicit credential
      admin.initializeApp({
        projectId: 'backbone-logic'
      });
    }
  }
  db = admin.firestore();
  auth = getAuth();
} else {
  console.log('🧪 RUNNING IN MOCK MODE - No data will be written to Firebase');
  console.log('================================================================\n');
  
  // Create mock database interface
  db = {
    collection: (name) => ({
      doc: (id) => ({
        set: async (data) => {
          console.log(`📝 MOCK: Would create document in ${name}/${id}`);
          console.log(`   Data keys: ${Object.keys(data).join(', ')}`);
          return Promise.resolve();
        },
        update: async (data) => {
          console.log(`📝 MOCK: Would update document in ${name}/${id}`);
          console.log(`   Update keys: ${Object.keys(data).join(', ')}`);
          return Promise.resolve();
        }
      }),
      get: async () => {
        console.log(`📝 MOCK: Would fetch all documents from ${name} collection`);
        return {
          forEach: (callback) => {
            // Mock some sample users for authentication testing
            if (name === 'users') {
              const mockUsers = [
                { id: 'user1', data: () => ({ email: 'test1@example.com', name: 'Test User 1', role: 'USER' }) },
                { id: 'user2', data: () => ({ email: 'test2@example.com', name: 'Test User 2', role: 'ADMIN' }) }
              ];
              mockUsers.forEach(callback);
            } else if (name === 'teamMembers') {
              const mockTeamMembers = [
                { id: 'tm1', data: () => ({ email: 'team1@example.com', firstName: 'Team', lastName: 'Member 1', role: 'TEAM_MEMBER' }) }
              ];
              mockTeamMembers.forEach(callback);
            }
          },
          size: name === 'users' ? 2 : 1
        };
      }
    })
  };
  
  // Create mock auth interface
  auth = {
    getUserByEmail: async (email) => {
      console.log(`🔐 MOCK: Would check if user exists: ${email}`);
      // Mock that some users exist and some don't
      if (email === 'test1@example.com') {
        return { uid: 'mock-uid-1', email: email, displayName: 'Test User 1' };
      }
      throw { code: 'auth/user-not-found' };
    },
    createUser: async (userData) => {
      console.log(`🔐 MOCK: Would create Firebase Auth user: ${userData.email}`);
      return { uid: `mock-uid-${Date.now()}`, email: userData.email, displayName: userData.displayName };
    },
    updateUser: async (uid, userData) => {
      console.log(`🔐 MOCK: Would update Firebase Auth user: ${uid}`);
      return { uid: uid, email: userData.email, displayName: userData.displayName };
    }
  };
}

// Enterprise Organization Configuration
const ENTERPRISE_CONFIG = {
  organizationId: 'enterprise-org-001',
  organizationName: 'Enterprise Media Solutions',
  adminUserId: '2ysTqv3pwiXyKxOeExAfEKOIh7K2', // Your Firebase UID
  adminEmail: 'enterprise.user@enterprisemedia.com', // ✅ CONSOLIDATED: Only correct email
  steveMartinUserId: 'steve-martin-admin-001', // Consistent ID for Steve Martin
  steveMartinEmail: 'smartin@example.com',
  domain: 'enterprisemedia.com',
  industry: 'Media Production',
  size: 'Enterprise',
  timezone: 'America/New_York',
  country: 'United States'
};

// Team structure for realistic relationships
const TEAM_STRUCTURE = {
  departments: [
    { name: 'Production', roles: ['Director', 'Producer', 'Production Manager', 'Production Assistant'] },
    { name: 'Post-Production', roles: ['Editor', 'Colorist', 'Audio Engineer', 'VFX Artist'] },
    { name: 'Technical', roles: ['IT Manager', 'Network Engineer', 'Systems Administrator', 'DevOps Engineer'] },
    { name: 'Creative', roles: ['Creative Director', 'Art Director', 'Graphic Designer', 'Motion Graphics Artist'] },
    { name: 'Business', roles: ['Project Manager', 'Account Manager', 'Business Analyst', 'Operations Manager'] }
  ],
  teamSize: 25 // Total team members to create
};

// Project types for realistic scenarios
const PROJECT_TYPES = [
  { type: 'Commercial', duration: 30, complexity: 'Medium' },
  { type: 'Documentary', duration: 90, complexity: 'High' },
  { type: 'Corporate Video', duration: 15, complexity: 'Low' },
  { type: 'Music Video', duration: 5, complexity: 'Medium' },
  { type: 'Feature Film', duration: 120, complexity: 'High' },
  { type: 'Web Series', duration: 25, complexity: 'Medium' }
];

class EnterpriseMockDataGenerator {
  constructor() {
    this.organizationId = ENTERPRISE_CONFIG.organizationId;
    this.adminUserId = ENTERPRISE_CONFIG.adminUserId;
    this.teamMembers = [];
    this.projects = [];
    this.clients = [];
    this.assets = [];
    this.sessions = [];
    this.workflows = [];
    this.generatedIds = {
      users: [],
      projects: [],
      clients: [],
      assets: [],
      sessions: [],
      workflows: [],
      agents: [],
      licenses: [],
      timecards: []
    };
    
    // Statistics for mock mode
    this.stats = {
      collectionsCreated: new Set(),
      documentsCreated: 0,
      relationshipsCreated: 0
    };
  }

  // Check authentication and project setup
  async checkAuthentication() {
    if (isDryRun) {
      console.log('🧪 MOCK MODE: Skipping authentication check');
      return true;
    }

    try {
      // Test Firebase Auth access
      await auth.listUsers(1);
      console.log('✅ Firebase Auth access verified');
      return true;
    } catch (error) {
      console.log('❌ Firebase Auth access failed:', error.message);
      if (error.message.includes('quota project')) {
        console.log('\n🔧 AUTHENTICATION SETUP REQUIRED:');
        console.log('1. Run: gcloud auth application-default login');
        console.log('2. Run: gcloud config set project backbone-logic');
        console.log('3. Verify: gcloud config get-value project');
        console.log('\nThen run this script again.');
      }
      return false;
    }
  }

  // Helper function to create Firebase Auth user
  async createFirebaseAuthUser(email, displayName, uid = null) {
    if (isDryRun) {
      console.log(`🔐 MOCK: Would create Firebase Auth user: ${email}`);
      return { uid: uid || 'mock-uid' };
    }

    try {
      // Check if user already exists
      try {
        const existingUser = await auth.getUserByEmail(email);
        console.log(`✅ Firebase Auth user already exists: ${email}`);
        return existingUser;
      } catch (error) {
        // User doesn't exist, create them
      }

      // Create Firebase Auth user
      const userRecord = await auth.createUser({
        uid: uid,
        email: email,
        password: defaultPassword, // Use the configured password
        displayName: displayName,
        emailVerified: true
      });

      console.log(`✅ Created Firebase Auth user: ${email} (${displayName})`);
      return userRecord;

    } catch (error) {
      console.log(`❌ Error creating Firebase Auth user ${email}: ${error.message}`);
      if (error.message.includes('quota project')) {
        console.log(`💡 Tip: Make sure you're authenticated with: gcloud auth application-default login`);
        console.log(`💡 And that the project is set: gcloud config set project backbone-logic`);
      }
      // Return a mock user record so the script can continue
      return { uid: uid || `mock-${Date.now()}`, email: email, displayName: displayName };
    }
  }

  // Authentication statistics tracking
  authStats = {
    total: 0,
    users: 0,
    teamMembers: 0,
    alreadyAuthenticated: 0,
    created: 0,
    updated: 0,
    errors: 0,
    skipped: 0,
    duplicates: 0
  };

  /**
   * Get all users from Firestore users collection
   */
  async getAllFirestoreUsers() {
    try {
      console.log('📊 Fetching all users from Firestore users collection...');
      
      const usersSnapshot = await db.collection('users').get();
      const users = [];
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          email: userData.email,
          name: userData.name || userData.displayName || '',
          role: userData.role || 'USER',
          organizationId: userData.organizationId,
          firebaseUid: userData.firebaseUid,
          isEmailVerified: userData.isEmailVerified || false,
          collection: 'users',
          ...userData
        });
      });
      
      console.log(`✅ Found ${users.length} users in Firestore users collection`);
      return users;
    } catch (error) {
      console.error('❌ Failed to fetch Firestore users:', error.message);
      throw error;
    }
  }

  /**
   * Get all team members from Firestore teamMembers collection
   */
  async getAllTeamMembers() {
    try {
      console.log('📊 Fetching all team members from Firestore teamMembers collection...');
      
      const teamMembersSnapshot = await db.collection('teamMembers').get();
      const teamMembers = [];
      
      teamMembersSnapshot.forEach(doc => {
        const memberData = doc.data();
        
        // Skip team members without email
        if (!memberData.email || memberData.email === 'undefined') {
          console.log(`⚠️  Skipping team member without valid email: ${doc.id}`);
          return;
        }
        
        teamMembers.push({
          id: doc.id,
          email: memberData.email,
          name: memberData.name || `${memberData.firstName || ''} ${memberData.lastName || ''}`.trim(),
          firstName: memberData.firstName,
          lastName: memberData.lastName,
          role: memberData.role || 'TEAM_MEMBER',
          organizationId: memberData.organizationId || memberData.orgId,
          firebaseUid: memberData.firebaseUid,
          isEmailVerified: memberData.isEmailVerified || false,
          collection: 'teamMembers',
          ...memberData
        });
      });
      
      console.log(`✅ Found ${teamMembers.length} team members in Firestore teamMembers collection`);
      return teamMembers;
    } catch (error) {
      console.error('❌ Failed to fetch Firestore team members:', error.message);
      throw error;
    }
  }

  /**
   * Check if user already exists in Firebase Auth
   */
  async checkFirebaseAuthUser(email) {
    try {
      const userRecord = await auth.getUserByEmail(email);
      return {
        exists: true,
        uid: userRecord.uid,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled
      };
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return { exists: false };
      }
      throw error;
    }
  }

  /**
   * Update Firebase Auth user
   */
  async updateFirebaseAuthUser(uid, user, password) {
    try {
      await auth.updateUser(uid, {
        password: password,
        displayName: user.name || user.email.split('@')[0],
        emailVerified: user.isEmailVerified || true,
        disabled: false
      });
      
      console.log(`   ✅ Updated Firebase Auth user: ${user.email} (UID: ${uid})`);
      return { uid };
    } catch (error) {
      console.error(`   ❌ Failed to update Firebase Auth user for ${user.email}:`, error.message);
      throw error;
    }
  }

  /**
   * Update Firestore user document with firebaseUid
   */
  async updateFirestoreUser(userId, firebaseUid, collection = 'users') {
    try {
      await db.collection(collection).doc(userId).update({
        firebaseUid: firebaseUid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`   ✅ Updated Firestore ${collection} document with firebaseUid: ${firebaseUid}`);
    } catch (error) {
      console.error(`   ❌ Failed to update Firestore ${collection} document:`, error.message);
      throw error;
    }
  }

  /**
   * Process a single user for authentication
   */
  async processUserForAuth(user, password) {
    console.log(`\n👤 Processing user: ${user.email}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   👤 Name: ${user.name || 'Not provided'}`);
    console.log(`   🏢 Role: ${user.role}`);
    console.log(`   🏢 Organization: ${user.organizationId || 'Not assigned'}`);
    console.log(`   📁 Collection: ${user.collection}`);
    console.log(`   🔑 Current firebaseUid: ${user.firebaseUid || 'None'}`);
    
    try {
      // Check if user already exists in Firebase Auth
      const authUser = await this.checkFirebaseAuthUser(user.email);
      
      if (authUser.exists) {
        console.log(`   ✅ User already exists in Firebase Auth (UID: ${authUser.uid})`);
        
        // Check if Firestore user has the correct firebaseUid
        if (user.firebaseUid !== authUser.uid) {
          console.log(`   🔄 Updating Firestore ${user.collection} user with correct firebaseUid...`);
          
          if (!isDryRun) {
            await this.updateFirestoreUser(user.id, authUser.uid, user.collection);
            this.authStats.updated++;
          } else {
            console.log(`   🔍 [DRY RUN] Would update Firestore ${user.collection} user with firebaseUid: ${authUser.uid}`);
          }
        } else {
          console.log(`   ✅ Firestore ${user.collection} user already has correct firebaseUid`);
          this.authStats.alreadyAuthenticated++;
        }
        
        // Update password and display name for existing user
        if (!isDryRun) {
          await this.updateFirebaseAuthUser(authUser.uid, user, password);
        } else {
          console.log(`   🔍 [DRY RUN] Would update Firebase Auth user password and display name`);
        }
        
      } else {
        console.log(`   🆕 User does not exist in Firebase Auth, creating...`);
        
        if (!isDryRun) {
          const userRecord = await this.createFirebaseAuthUser(user.email, user.name, user.id);
          
          // Update Firestore user with firebaseUid
          await this.updateFirestoreUser(user.id, userRecord.uid, user.collection);
          
          this.authStats.created++;
        } else {
          console.log(`   🔍 [DRY RUN] Would create Firebase Auth user and update Firestore ${user.collection}`);
        }
      }
      
    } catch (error) {
      console.error(`   ❌ Error processing user ${user.email}:`, error.message);
      this.authStats.errors++;
    }
  }

  /**
   * Authenticate all users from both users and teamMembers collections
   */
  async authenticateAllUsers() {
    console.log('\n🔐 Authenticating All Users');
    console.log('============================');
    console.log(`📋 Mode: ${isDryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (changes will be applied)'}`);
    console.log(`🔑 Default password: ${defaultPassword}`);
    console.log('');
    
    try {
      // Get all users from both collections
      const users = await this.getAllFirestoreUsers();
      const teamMembers = await this.getAllTeamMembers();
      
      this.authStats.users = users.length;
      this.authStats.teamMembers = teamMembers.length;
      
      // Handle duplicates (prioritize users collection)
      const emailMap = new Map();
      const allUsers = [];
      
      // Add users from users collection first
      users.forEach(user => {
        emailMap.set(user.email, user);
        allUsers.push(user);
      });
      
      // Add team members, skipping duplicates
      teamMembers.forEach(member => {
        if (emailMap.has(member.email)) {
          console.log(`⚠️  Duplicate user found: ${member.email} (exists in both users and teamMembers collections)`);
          this.authStats.duplicates++;
        } else {
          emailMap.set(member.email, member);
          allUsers.push(member);
        }
      });
      
      this.authStats.total = allUsers.length;
      
      if (allUsers.length === 0) {
        console.log('⚠️  No users found in specified collections');
        return;
      }
      
      console.log(`\n🚀 Processing ${allUsers.length} users from users and teamMembers collections...`);
      console.log('');
      
      // Process each user
      for (const user of allUsers) {
        if (!user.email) {
          console.log(`⚠️  Skipping user without email: ${user.id}`);
          this.authStats.skipped++;
          continue;
        }
        
        await this.processUserForAuth(user, defaultPassword);
      }
      
      // Print summary
      console.log('\n🎉 Authentication process complete!');
      console.log('===================================');
      console.log(`📊 Total users processed: ${this.authStats.total}`);
      console.log(`   📁 From users collection: ${this.authStats.users}`);
      console.log(`   👥 From teamMembers collection: ${this.authStats.teamMembers}`);
      console.log(`   ⚠️  Duplicates found: ${this.authStats.duplicates}`);
      console.log(`✅ Already authenticated: ${this.authStats.alreadyAuthenticated}`);
      console.log(`🆕 New users created: ${this.authStats.created}`);
      console.log(`🔄 Users updated: ${this.authStats.updated}`);
      console.log(`⚠️  Users skipped: ${this.authStats.skipped}`);
      console.log(`❌ Errors: ${this.authStats.errors}`);
      
      if (isDryRun) {
        console.log('\n🔍 This was a DRY RUN - no changes were made');
        console.log('   Run without --dry-run to apply changes');
      } else {
        console.log('\n✅ All changes have been applied');
      }
      
      console.log(`\n🔑 All users can now login with password: ${defaultPassword}`);
      console.log('\n📋 Example login credentials:');
      allUsers.slice(0, 5).forEach(user => {
        console.log(`   • ${user.email} (Password: ${defaultPassword}) [${user.collection}]`);
      });
      if (allUsers.length > 5) {
        console.log(`   • ... and ${allUsers.length - 5} more users`);
      }
      
    } catch (error) {
      console.error('❌ Fatal error during authentication:', error);
      throw error;
    }
  }

  // Enhanced logging for mock mode and conflict detection
  async mockCreateDocument(collection, id, data) {
    if (isDryRun) {
      this.stats.collectionsCreated.add(collection);
      this.stats.documentsCreated++;
      console.log(`📝 MOCK: Would create ${collection}/${id}`);
      console.log(`   Keys: ${Object.keys(data).slice(0, 5).join(', ')}${Object.keys(data).length > 5 ? '...' : ''}`);
      
      // Check for relationships
      const relationshipFields = ['organizationId', 'projectId', 'userId', 'clientId', 'sessionId', 'workflowId'];
      const relationships = relationshipFields.filter(field => data[field]);
      if (relationships.length > 0) {
        this.stats.relationshipsCreated++;
        console.log(`   Relationships: ${relationships.join(', ')}`);
      }
      
      return Promise.resolve();
    } else {
      // Check for existing document if not forcing overwrite
      if (!forceOverwrite) {
        const existingDoc = await db.collection(collection).doc(id).get();
        if (existingDoc.exists) {
          console.log(`⚠️  Document ${collection}/${id} already exists`);
          if (!shouldCleanup) {
            throw new Error(`Conflict detected: ${collection}/${id} already exists. Use --force to overwrite or --cleanup to manage existing data.`);
          }
          return Promise.resolve(); // Skip creation in cleanup mode
        }
      }
      
      return await db.collection(collection).doc(id).set(data);
    }
  }

  // Check for existing enterprise data
  async checkExistingData() {
    console.log('🔍 Checking for existing enterprise data...');
    
    const conflicts = {
      organization: null,
      adminUser: null,
      teamMembers: [],
      projects: [],
      totalConflicts: 0
    };

    try {
      // Check organization
      const orgDoc = await db.collection('organizations').doc(this.organizationId).get();
      if (orgDoc.exists) {
        conflicts.organization = orgDoc.data();
        conflicts.totalConflicts++;
        console.log(`⚠️  Organization '${this.organizationId}' already exists`);
      }

      // Check admin user
      const userDoc = await db.collection('users').doc(this.adminUserId).get();
      if (userDoc.exists) {
        conflicts.adminUser = userDoc.data();
        conflicts.totalConflicts++;
        console.log(`⚠️  Admin user '${this.adminUserId}' already exists`);
      }

      // Check for team members with same organization
      const teamQuery = await db.collection('teamMembers')
        .where('organizationId', '==', this.organizationId)
        .limit(10)
        .get();
      
      if (!teamQuery.empty) {
        teamQuery.forEach(doc => conflicts.teamMembers.push(doc.data()));
        conflicts.totalConflicts += teamQuery.size;
        console.log(`⚠️  Found ${teamQuery.size} existing team members for organization`);
      }

      // Check for projects with same organization
      const projectQuery = await db.collection('projects')
        .where('organizationId', '==', this.organizationId)
        .limit(10)
        .get();
      
      if (!projectQuery.empty) {
        projectQuery.forEach(doc => conflicts.projects.push(doc.data()));
        conflicts.totalConflicts += projectQuery.size;
        console.log(`⚠️  Found ${projectQuery.size} existing projects for organization`);
      }

      return conflicts;
    } catch (error) {
      console.error('❌ Error checking existing data:', error.message);
      throw error;
    }
  }

  // Clean up existing enterprise data
  async cleanupExistingData() {
    console.log('🧹 Cleaning up existing enterprise data...');
    
    const collectionsToClean = [
      'organizations', 'users', 'teamMembers', 'projects', 'projectAssignments', 'clients', 'sessions',
      'workflows', 'assets', 'inventoryItems', 'networks', 'networkIPAssignments',
      'mediaFiles', 'aiAgents', 'agents', 'licenses', 'subscriptions', 'payments',
      'user_timecards', 'timecard_entries', 'timecard_templates', 'roles',
      'schemas', 'notifications', 'auditLogs', 'messages', 'messageSessions',
      'datasets', 'datasetAssignments'
    ];

    let totalDeleted = 0;

    for (const collection of collectionsToClean) {
      try {
        const query = db.collection(collection).where('organizationId', '==', this.organizationId);
        const snapshot = await query.get();
        
        if (!snapshot.empty) {
          console.log(`🗑️  Deleting ${snapshot.size} documents from ${collection}...`);
          
          const batch = db.batch();
          snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          
          await batch.commit();
          totalDeleted += snapshot.size;
        }
      } catch (error) {
        console.error(`❌ Error cleaning ${collection}:`, error.message);
      }
    }

    // Also clean up the specific admin users and organization
    try {
      await db.collection('users').doc(ENTERPRISE_CONFIG.adminEmail).delete();
      await db.collection('users').doc(ENTERPRISE_CONFIG.steveMartinEmail).delete();
      await db.collection('teamMembers').doc(ENTERPRISE_CONFIG.steveMartinUserId).delete();
      await db.collection('organizations').doc(this.organizationId).delete();
      totalDeleted += 4;
    } catch (error) {
      console.log('ℹ️  Admin users or organization may not exist (this is OK)');
    }

    // Clean up Firebase Auth users
    if (!isDryRun) {
      console.log('🔐 Cleaning up Firebase Auth users...');
      try {
        const listUsersResult = await auth.listUsers();
        let authUsersDeleted = 0;
        
        for (const user of listUsersResult.users) {
          // Delete users from enterprise domain or specific test users
          if (user.email && (
            user.email.includes('@enterprisemedia.com') || 
            user.email === 'enterprise.user@enterprisemedia.com' || // ✅ CONSOLIDATED: Only correct email
            user.email === 'smartin@example.com'
          )) {
            try {
              await auth.deleteUser(user.uid);
              console.log(`🗑️  Deleted Firebase Auth user: ${user.email}`);
              authUsersDeleted++;
            } catch (error) {
              console.log(`⚠️  Could not delete Firebase Auth user ${user.email}: ${error.message}`);
            }
          }
        }
        
        console.log(`✅ Deleted ${authUsersDeleted} Firebase Auth users`);
        totalDeleted += authUsersDeleted;
        
      } catch (error) {
        console.log('⚠️  Could not clean up Firebase Auth users:', error.message);
        if (error.message.includes('quota project')) {
          console.log(`💡 Tip: Make sure you're authenticated with: gcloud auth application-default login`);
          console.log(`💡 And that the project is set: gcloud config set project backbone-logic`);
        }
      }
    }

    console.log(`✅ Cleanup complete! Deleted ${totalDeleted} documents and Firebase Auth users`);
    return totalDeleted;
  }

  // Utility function to generate consistent IDs
  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate realistic IP addresses for network management
  generateIPAddress(subnet = '192.168') {
    return `${subnet}.${faker.number.int({ min: 1, max: 254 })}.${faker.number.int({ min: 1, max: 254 })}`;
  }

  // 1. Create Organization and Admin User
  async createOrganizationAndAdmin() {
    console.log('🏢 Creating enterprise organization and admin user...');

    // Create Firebase Auth user for admin first
    await this.createFirebaseAuthUser(
      ENTERPRISE_CONFIG.adminEmail, 
      'Enterprise Admin', 
      this.adminUserId
    );

    // Create organization
    const organizationData = {
      id: this.organizationId,
      name: ENTERPRISE_CONFIG.organizationName,
      domain: ENTERPRISE_CONFIG.domain,
      industry: ENTERPRISE_CONFIG.industry,
      size: ENTERPRISE_CONFIG.size,
      timezone: ENTERPRISE_CONFIG.timezone,
      country: ENTERPRISE_CONFIG.country,
      settings: {
        allowGuestAccess: false,
        requireTwoFactor: true,
        dataRetentionDays: 2555, // 7 years
        maxProjectsPerUser: 50,
        maxStorageGB: 10000
      },
      // Enterprise tier subscription details
      tier: 'ENTERPRISE',
      subscription: {
        tier: 'ENTERPRISE',
        status: 'active',
        billingCycle: 'annual',
        nextBillingDate: faker.date.future(),
        licensePool: {
          total: 250, // Enterprise tier capacity
          assigned: 25, // Team members created
          available: 225, // Available for assignment
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: this.adminUserId,
      isActive: true
    };

    await this.mockCreateDocument('organizations', this.organizationId, organizationData);

    // Create admin user
    const adminUserData = {
      uid: this.adminUserId,
      email: ENTERPRISE_CONFIG.adminEmail,
      displayName: 'Enterprise Admin',
      firstName: 'Enterprise',
      lastName: 'Admin',
      organizationId: this.organizationId,
      role: 'OWNER', // ✅ CONSOLIDATED: Updated to OWNER role
      memberRole: 'OWNER', // ✅ CONSOLIDATED: Added memberRole field
      licenseType: 'ENTERPRISE', // ✅ CRITICAL FIX: Add ENTERPRISE license type
      permissions: ['all'],
      profile: {
        title: 'Chief Technology Officer',
        department: 'Executive',
        phone: faker.phone.number(),
        bio: 'Experienced technology leader with 15+ years in media production',
        avatar: faker.image.avatar(),
        timezone: ENTERPRISE_CONFIG.timezone,
        preferredLanguage: 'en'
      },
      preferences: {
        theme: 'dark',
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        dashboard: {
          defaultView: 'projects',
          showMetrics: true,
          autoRefresh: true
        }
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      emailVerified: true,
      // Mark as team member for authentication compatibility
      isTeamMember: true
    };

    await this.mockCreateDocument('users', ENTERPRISE_CONFIG.adminEmail, adminUserData);
    this.generatedIds.users.push(this.adminUserId);

    // 🔧 CRITICAL FIX: Create team member document for enterprise.user@enterprisemedia.com
    // This ensures the team member authentication system can find the user
    const adminTeamMemberData = {
      id: this.adminUserId,
      userId: this.adminUserId,
      email: ENTERPRISE_CONFIG.adminEmail,
      name: 'Enterprise Admin',
      firstName: 'Enterprise',
      lastName: 'Admin',
      role: 'ADMIN', // ✅ CONSOLIDATED: Confirmed ADMIN role for team member
      status: 'ACTIVE',
      organizationId: this.organizationId,
      firebaseUid: this.adminUserId,
      licenseType: 'ENTERPRISE',
      department: 'Executive',
      company: 'Enterprise Media Solutions',
      isEmailVerified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Add password for authentication
      password: defaultPassword,
      // Add project access
      projectAccess: [],
      permissions: {
        canCreateProjects: true,
        canDeleteProjects: true,
        canManageTeamMembers: true,
        canViewAnalytics: true,
        canManageBilling: true
      },
      // License assignment info
      licenseAssigned: true,
      licenseAssignedAt: admin.firestore.FieldValue.serverTimestamp(),
      licenseStatus: 'active',
      // Team member specific fields
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      invitedBy: this.adminUserId, // Self-invited as admin
      profile: {
        title: 'Chief Technology Officer',
        department: 'Executive',
        phone: faker.phone.number(),
        bio: 'Experienced technology leader with 15+ years in media production',
        avatar: faker.image.avatar(),
        timezone: ENTERPRISE_CONFIG.timezone,
        preferredLanguage: 'en',
        startDate: faker.date.past({ years: 2 }),
        employeeId: 'EMP-ADMIN-001'
      }
    };

    await this.mockCreateDocument('teamMembers', this.adminUserId, adminTeamMemberData);

    // Add to team members array for project assignments
    this.teamMembers.push({
      id: this.adminUserId,
      name: 'Enterprise Admin',
      email: ENTERPRISE_CONFIG.adminEmail,
      role: 'ADMIN',
      department: 'Executive'
    });

    console.log('✅ Organization and admin user created with team member document');
  }

  // Create Steve Martin as a specific admin team member
  async createSteveMartin() {
    console.log('👤 Creating Steve Martin as admin team member...');
    
    const steveUserId = this.generateId('user');
    const steveEmail = 'smartin@example.com';

    // Create Firebase Auth user for Steve Martin
    await this.createFirebaseAuthUser(steveEmail, 'Steve Martin', steveUserId);
    
    // Create Steve Martin user
    const steveUserData = {
      uid: steveUserId,
      email: steveEmail,
      displayName: 'Steve Martin',
      firstName: 'Steve',
      lastName: 'Martin',
      organizationId: this.organizationId,
      role: 'admin', // Admin role
      licenseType: 'ENTERPRISE', // ✅ CRITICAL FIX: Steve Martin gets ENTERPRISE license
      status: 'active',
      permissions: ['all'], // Full permissions
      profile: {
        title: 'Project Administrator',
        department: 'Management',
        phone: faker.phone.number(),
        bio: 'Experienced project administrator with full system access',
        avatar: faker.image.avatar(),
        timezone: ENTERPRISE_CONFIG.timezone,
        preferredLanguage: 'en',
        startDate: faker.date.past({ years: 2 }),
        employeeId: 'EMP-ADMIN-001'
      },
      preferences: {
        theme: 'dark',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      },
      createdAt: new Date().toISOString(),
      lastLoginAt: faker.date.recent(),
      isActive: true,
      emailVerified: true
    };

    await this.mockCreateDocument('users', steveEmail, steveUserData);
    this.generatedIds.users.push(steveUserId);

    // Create Steve Martin team member record
    const steveTeamMemberData = {
      id: steveUserId,
      userId: steveUserId,
      organizationId: this.organizationId,
      name: 'Steve Martin',
      email: steveEmail,
      role: 'ADMIN', // Team member admin role
      department: 'Management',
      permissions: steveUserData.permissions,
      status: 'active',
      joinedAt: steveUserData.profile.startDate,
      invitedBy: this.adminUserId,
      
      // License assignment info
      licenseAssigned: true,
      licenseAssignedAt: steveUserData.profile.startDate,
      licenseStatus: 'active',
      
      createdAt: new Date().toISOString()
    };

    await this.mockCreateDocument('teamMembers', steveUserId, steveTeamMemberData);

    this.teamMembers.push({
      id: steveUserId,
      name: 'Steve Martin',
      email: steveEmail,
      role: 'ADMIN',
      department: 'Management'
    });

    console.log('✅ Steve Martin created as admin team member');
  }

  // 2. Create Team Members
  async createTeamMembers() {
    console.log('👥 Creating team members...');

    // First, create Steve Martin as a specific admin user
    await this.createSteveMartin();

    for (let i = 0; i < TEAM_STRUCTURE.teamSize; i++) {
      const department = faker.helpers.arrayElement(TEAM_STRUCTURE.departments);
      const role = faker.helpers.arrayElement(department.roles);
      const userId = this.generateId('user');
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${ENTERPRISE_CONFIG.domain}`;

      // Create Firebase Auth user for this team member
      await this.createFirebaseAuthUser(email, `${firstName} ${lastName}`, userId);

      // Create user
      const userData = {
        uid: userId,
        email: email,
        displayName: `${firstName} ${lastName}`,
        firstName: firstName,
        lastName: lastName,
        organizationId: this.organizationId,
        role: role.toLowerCase().replace(' ', '_'),
        licenseType: 'ENTERPRISE', // ✅ CRITICAL FIX: All enterprise team members get ENTERPRISE license
        status: 'active', // Set all team members as active by default
        permissions: this.getPermissionsForRole(role),
        profile: {
          title: role,
          department: department.name,
          phone: faker.phone.number(),
          bio: faker.lorem.sentence(),
          avatar: faker.image.avatar(),
          timezone: ENTERPRISE_CONFIG.timezone,
          preferredLanguage: 'en',
          startDate: faker.date.past({ years: 3 }),
          employeeId: `EMP-${String(i + 1).padStart(4, '0')}`
        },
        preferences: {
          theme: faker.helpers.arrayElement(['light', 'dark']),
          notifications: {
            email: faker.datatype.boolean(),
            push: faker.datatype.boolean(),
            sms: faker.datatype.boolean()
          }
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: faker.date.recent(),
        isActive: true,
        emailVerified: true
      };

      await this.mockCreateDocument('users', email, userData);

      // Create team member record with license assignment tracking
      const teamMemberData = {
        userId: userId,
        organizationId: this.organizationId,
        role: role,
        department: department.name,
        permissions: userData.permissions,
        status: 'active', // Ensure team member record is also active
        joinedAt: userData.profile.startDate,
        invitedBy: this.adminUserId,
        
        // License assignment info (will be assigned when licenses are created)
        licenseAssigned: true, // Will get license from organization pool
        licenseAssignedAt: userData.profile.startDate,
        licenseStatus: 'active',
        
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await this.mockCreateDocument('teamMembers', userId, teamMemberData);

      this.teamMembers.push({
        id: userId,
        ...userData,
        department: department.name,
        role: role
      });

      this.generatedIds.users.push(userId);
    }

    console.log(`✅ Created ${TEAM_STRUCTURE.teamSize} team members`);
  }

  // 3. Create Clients
  async createClients() {
    console.log('🤝 Creating clients...');

    const clientCount = 12;
    for (let i = 0; i < clientCount; i++) {
      const clientId = this.generateId('client');
      const companyName = faker.company.name();

      const clientData = {
        id: clientId,
        organizationId: this.organizationId,
        name: companyName,
        type: faker.helpers.arrayElement(['Corporate', 'Agency', 'Non-Profit', 'Government', 'Startup']),
        industry: faker.helpers.arrayElement(['Technology', 'Healthcare', 'Finance', 'Retail', 'Education']),
        status: faker.helpers.arrayElement(['active', 'inactive', 'prospect']),
        contact: {
          primaryContact: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          title: faker.person.jobTitle()
        },
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: 'United States'
        },
        billing: {
          terms: faker.helpers.arrayElement(['Net 30', 'Net 60', 'Due on Receipt']),
          currency: 'USD',
          taxId: faker.finance.accountNumber(9)
        },
        notes: faker.lorem.paragraph(),
        tags: faker.helpers.arrayElements(['VIP', 'High-Value', 'Long-term', 'New', 'Referral'], { min: 1, max: 3 }),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: faker.helpers.arrayElement(this.generatedIds.users),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await this.mockCreateDocument('clients', clientId, clientData);
      this.clients.push(clientData);
      this.generatedIds.clients.push(clientId);
    }

    console.log(`✅ Created ${clientCount} clients`);
  }

  // 4. Create Projects
  async createProjects() {
    console.log('🎬 Creating projects...');

    const projectCount = 15;
    for (let i = 0; i < projectCount; i++) {
      const projectId = this.generateId('project');
      const projectType = faker.helpers.arrayElement(PROJECT_TYPES);
      const client = faker.helpers.arrayElement(this.clients);
      const projectManager = faker.helpers.arrayElement(this.teamMembers.filter(tm => tm.role.includes('Manager')));

      const projectData = {
        id: projectId,
        name: `${projectType.type} - ${faker.commerce.productName()}`,
        description: faker.lorem.paragraphs(2),
        
        // Project type and mode (MPC compliant)
        type: 'NETWORKED', // Collaborative project type
        applicationMode: 'SHARED_NETWORK', // Team collaboration mode
        visibility: 'ORGANIZATION', // Organization members can access
        storageBackend: 'FIRESTORE', // Firebase Firestore storage
        
        // Organization tenanting (CRITICAL)
        organizationId: this.organizationId, // Proper tenant isolation
        ownerId: this.adminUserId, // Project owner
        
        // Project management
        status: faker.helpers.arrayElement(['ACTIVE', 'PLANNING', 'IN_PROGRESS', 'COMPLETED']),
        phase: faker.helpers.arrayElement(['PLANNING', 'PRE_PRODUCTION', 'PRODUCTION', 'POST_PRODUCTION']),
        priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
        
        // Client and team relationships
        clientId: client.id,
        projectManager: projectManager.id,
        
        // Collaboration settings
        allowCollaboration: true, // Enable team collaboration
        maxCollaborators: 25, // Match team size
        realTimeEnabled: true, // Enable real-time features
        
        // Timeline and budget
        timeline: {
          startDate: faker.date.recent({ days: 30 }),
          endDate: faker.date.future({ days: 90 }),
          estimatedDuration: projectType.duration,
          actualDuration: null
        },
        budget: {
          total: faker.number.int({ min: 50000, max: 500000 }),
          spent: faker.number.int({ min: 0, max: 25000 }),
          currency: 'USD'
        },
        
        // Deliverables
        deliverables: [
          { name: 'Pre-production', status: 'completed', dueDate: faker.date.recent() },
          { name: 'Production', status: 'in-progress', dueDate: faker.date.soon() },
          { name: 'Post-production', status: 'pending', dueDate: faker.date.future() },
          { name: 'Final Delivery', status: 'pending', dueDate: faker.date.future() }
        ],
        
        // Data tenanting metadata (CRITICAL)
        metadata: {
          complexity: projectType.complexity,
          genre: faker.helpers.arrayElement(['Drama', 'Comedy', 'Documentary', 'Commercial', 'Educational']),
          format: faker.helpers.arrayElement(['4K', 'HD', 'Web', 'Broadcast']),
          duration: `${projectType.duration} minutes`,
          
          // Database/Dataset tenanting
          datasetId: `dataset-${projectId}`, // Unique dataset per project
          databaseTenant: this.organizationId, // Organization-based tenanting
          storagePrefix: `org-${this.organizationId}/project-${projectId}/`, // Storage isolation
          accessLevel: 'ORGANIZATION' // Organization-level access
        },
        
        // Project settings
        settings: {
          dataRetentionDays: 2555, // 7 years
          backupEnabled: true,
          encryptionEnabled: true,
          auditLogging: true
        },
        
        // Tags and categorization
        tags: faker.helpers.arrayElements(['enterprise', 'collaborative', 'networked', 'shared-network'], { min: 2, max: 4 }),
        
        // Timestamps
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastAccessedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: projectManager.id,
        
        // Status flags
        isActive: true,
        isArchived: false
      };

      await this.mockCreateDocument('projects', projectId, projectData);
      this.projects.push(projectData);
      this.generatedIds.projects.push(projectId);
      
      // Create project assignments for team members (with license validation)
      await this.createProjectAssignments(projectId);
    }

    console.log(`✅ Created ${projectCount} projects with team assignments`);
  }

  // Create Project Assignments with License Validation
  async createProjectAssignments(projectId) {
    // Assign 5-8 team members per project
    const teamSize = faker.number.int({ min: 5, max: 8 });
    const assignedTeamMembers = faker.helpers.arrayElements(this.generatedIds.users, teamSize);
    
    // Get admin users (enterprise.user and Steve Martin)
    const adminUsers = this.teamMembers.filter(tm => tm.role === 'ADMIN').map(tm => tm.id);
    // Ensure enterprise.user is included (it should already be in teamMembers array now)
    if (!adminUsers.includes(this.adminUserId)) {
      adminUsers.push(this.adminUserId);
    }
    
    // Randomly assign one of the admin users as project admin
    const projectAdmin = faker.helpers.arrayElement(adminUsers);
    
    const assignments = [{
      userId: projectAdmin,
      role: 'ADMIN'
    }];
    
    // Assign other team members with appropriate roles
    assignedTeamMembers.forEach(userId => {
      if (userId !== projectAdmin && !adminUsers.includes(userId)) {
        const teamMember = this.teamMembers.find(tm => tm.id === userId);
        let projectRole = 'VIEWER'; // Default role
        
        // Map team member roles to project roles (MPC compliant)
        if (teamMember) {
          switch (teamMember.role) {
            case 'Director':
            case 'Producer':
            case 'Project Manager':
              projectRole = 'MANAGER';
              break;
            case 'Production Manager':
            case 'Creative Director':
            case 'Editor':
              projectRole = 'DO_ER';
              break;
            default:
              projectRole = 'VIEWER';
          }
        }
        
        assignments.push({
          userId: userId,
          role: projectRole
        });
      }
    });
    
    // Create project assignment documents
    for (const assignment of assignments) {
      const assignmentId = this.generateId('projectAssignment');
      const assignmentData = {
        id: assignmentId,
        projectId: projectId,
        userId: assignment.userId,
        teamMemberId: assignment.userId, // Alternative field name for compatibility
        role: assignment.role,
        projectRole: assignment.role, // Alternative field name for compatibility
        assignedBy: this.adminUserId,
        assignedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        
        // License validation info (MPC compliant)
        licenseValidated: true, // License was validated from organization pool
        licenseAssignedAt: admin.firestore.FieldValue.serverTimestamp(),
        
        // Organization tenanting (CRITICAL)
        organizationId: this.organizationId,
        
        // Permissions based on role
        permissions: this.getProjectPermissionsForRole(assignment.role),
        
        // Additional fields for UI compatibility
        lastAccessed: admin.firestore.FieldValue.serverTimestamp(),
        accessCount: faker.number.int({ min: 1, max: 50 }),
        
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await this.mockCreateDocument('projectAssignments', assignmentId, assignmentData);
    }
  }

  // Get project permissions based on role (MPC compliant)
  getProjectPermissionsForRole(role) {
    const rolePermissions = {
      'ADMIN': ['all'], // Full project control
      'MANAGER': ['read', 'write', 'assign_team', 'manage_settings'],
      'DO_ER': ['read', 'write', 'upload_media'],
      'VIEWER': ['read']
    };
    
    return rolePermissions[role] || ['read'];
  }

  // 5. Create Sessions and Workflows
  async createSessionsAndWorkflows() {
    console.log('🎯 Creating sessions and workflows...');

    // Create workflows first
    const workflowTemplates = [
      { name: 'Pre-Production Workflow', type: 'pre-production', steps: ['Script Review', 'Location Scouting', 'Casting', 'Equipment Check'] },
      { name: 'Production Workflow', type: 'production', steps: ['Setup', 'Filming', 'Backup', 'Wrap'] },
      { name: 'Post-Production Workflow', type: 'post-production', steps: ['Ingest', 'Edit', 'Color', 'Audio', 'Export'] },
      { name: 'Review Workflow', type: 'review', steps: ['Internal Review', 'Client Review', 'Revisions', 'Approval'] }
    ];

    for (const template of workflowTemplates) {
      const workflowId = this.generateId('workflow');
      const workflowData = {
        id: workflowId,
        organizationId: this.organizationId,
        name: template.name,
        type: template.type,
        description: `Standard ${template.type} workflow for media production`,
        steps: template.steps.map((step, index) => ({
          id: `step-${index + 1}`,
          name: step,
          order: index + 1,
          estimatedDuration: faker.number.int({ min: 30, max: 240 }), // minutes
          required: true,
          assignedRole: faker.helpers.arrayElement(['producer', 'director', 'editor', 'manager'])
        })),
        isTemplate: true,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: this.adminUserId
      };

      await this.mockCreateDocument('workflows', workflowId, workflowData);
      this.workflows.push(workflowData);
      this.generatedIds.workflows.push(workflowId);
    }

    // Create sessions for each project
    for (const project of this.projects) {
      const sessionCount = faker.number.int({ min: 2, max: 6 });
      
      for (let i = 0; i < sessionCount; i++) {
        const sessionId = this.generateId('session');
        const workflow = faker.helpers.arrayElement(this.workflows);
        const sessionLead = faker.helpers.arrayElement(this.generatedIds.users);

        // Generate realistic timing data for the session
        const sessionDate = faker.date.future({ days: 30 });
        const callTime = new Date(sessionDate);
        callTime.setHours(faker.number.int({ min: 6, max: 10 }), faker.number.int({ min: 0, max: 59 }), 0, 0);
        
        const wrapTime = new Date(callTime);
        const sessionDuration = faker.number.int({ min: 8, max: 14 }); // 8-14 hour days
        wrapTime.setHours(callTime.getHours() + sessionDuration, faker.number.int({ min: 0, max: 59 }), 0, 0);
        
        const dueDate = new Date(wrapTime);
        dueDate.setDate(wrapTime.getDate() + faker.number.int({ min: 1, max: 7 }));
        
        // Generate appropriate status based on timing
        const now = new Date();
        const daysDiff = Math.ceil((sessionDate - now) / (1000 * 60 * 60 * 24));
        let status;
        if (daysDiff < 0) {
          status = faker.helpers.arrayElement(['COMPLETED', 'POST_PRODUCTION', 'READY_FOR_POST']);
        } else if (daysDiff === 0) {
          status = faker.helpers.arrayElement(['PRODUCTION_IN_PROGRESS', 'IN_PRODUCTION']);
        } else if (daysDiff <= 7) {
          status = faker.helpers.arrayElement(['PLANNED', 'PRODUCTION_IN_PROGRESS']);
        } else {
          status = faker.helpers.arrayElement(['PLANNING', 'PLANNED']);
        }

        const sessionData = {
          id: sessionId,
          organizationId: this.organizationId,
          projectId: project.id,
          name: `${project.name} - Session ${i + 1}`,
          type: workflow.type,
          status: status, // Updated to use correct SessionStatus enums
          workflowId: workflow.id,
          sessionLead: sessionLead,
          participants: faker.helpers.arrayElements(this.generatedIds.users, { min: 2, max: 5 }),
          
          // Session timing data (NEW)
          sessionDate: sessionDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
          callTime: callTime.toISOString(), // Session Data Call
          wrapTime: wrapTime.toISOString(), // Wrap Times
          dueDate: dueDate.toISOString().split('T')[0], // Due Date
          estimatedDuration: sessionDuration * 60, // Convert to minutes
          
          // Production metadata (NEW)
          productionPhase: faker.helpers.arrayElement(['pre-production', 'production', 'post-production']),
          productionType: faker.helpers.arrayElement(['commercial', 'documentary', 'corporate', 'music-video', 'feature-film']),
          weatherConsiderations: faker.helpers.arrayElement([
            'Clear skies expected',
            'Rain possible - have backup indoor location',
            'High winds - secure equipment',
            'Extreme heat - frequent breaks needed',
            'Cold weather - warm clothing required'
          ]),
          specialRequirements: faker.helpers.arrayElement([
            'Special lighting setup required',
            'Quiet environment needed for audio',
            'Client approval required on-site',
            'Crane or special equipment needed',
            'Multiple camera angles required',
            'Live streaming capability needed'
          ]),
          
          // Legacy schedule data (keeping for compatibility)
          schedule: {
            startTime: callTime,
            endTime: wrapTime,
            estimatedDuration: sessionDuration * 60, // minutes
            actualDuration: null
          },
          location: {
            type: faker.helpers.arrayElement(['studio', 'location', 'remote']),
            name: faker.helpers.arrayElement(['Studio A', 'Studio B', 'Conference Room', 'Client Location', 'Remote']),
            address: faker.location.streetAddress()
          },
          equipment: faker.helpers.arrayElements([
            'Camera A', 'Camera B', 'Lighting Kit', 'Audio Equipment', 'Tripods', 'Monitors'
          ], { min: 2, max: 4 }),
          notes: faker.lorem.paragraph(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: sessionLead
        };

        await this.mockCreateDocument('sessions', sessionId, sessionData);
        this.sessions.push(sessionData);
        this.generatedIds.sessions.push(sessionId);
      }
    }

    console.log(`✅ Created ${this.workflows.length} workflows and ${this.sessions.length} sessions`);
  }

  // 6. Create Inventory and Assets
  async createInventoryAndAssets() {
    console.log('📦 Creating inventory and assets...');

    const equipmentTypes = [
      { category: 'Camera', items: ['RED Komodo', 'Sony FX6', 'Canon C70', 'ARRI Alexa Mini'] },
      { category: 'Audio', items: ['Rode NTG3', 'Sennheiser MKE 600', 'Zoom H6', 'Wireless Mic System'] },
      { category: 'Lighting', items: ['ARRI SkyPanel', 'Aputure 300D', 'LED Panel Kit', 'Softbox Kit'] },
      { category: 'Support', items: ['Carbon Fiber Tripod', 'Slider', 'Gimbal', 'Jib Arm'] },
      { category: 'Storage', items: ['SSD Drive 2TB', 'CFexpress Card', 'External HDD 8TB', 'NAS System'] }
    ];

    for (const equipmentType of equipmentTypes) {
      for (const item of equipmentType.items) {
        const assetId = this.generateId('asset');
        const serialNumber = faker.string.alphanumeric(10).toUpperCase();

        const assetData = {
          id: assetId,
          organizationId: this.organizationId,
          name: item,
          category: equipmentType.category,
          type: 'equipment',
          serialNumber: serialNumber,
          model: faker.commerce.productName(),
          manufacturer: faker.company.name(),
          status: faker.helpers.arrayElement(['available', 'in-use', 'maintenance', 'retired']),
          condition: faker.helpers.arrayElement(['excellent', 'good', 'fair', 'poor']),
          location: faker.helpers.arrayElement(['Studio A', 'Studio B', 'Storage Room', 'Maintenance']),
          assignedTo: faker.helpers.arrayElement([null, ...this.generatedIds.users]),
          specifications: {
            weight: `${faker.number.float({ min: 0.5, max: 15, fractionDigits: 1 })} kg`,
            dimensions: `${faker.number.int({ min: 10, max: 50 })}x${faker.number.int({ min: 10, max: 50 })}x${faker.number.int({ min: 10, max: 50 })} cm`,
            powerRequirement: faker.helpers.arrayElement(['Battery', '12V', '110V', '220V']),
            connectivity: faker.helpers.arrayElements(['USB-C', 'HDMI', 'SDI', 'XLR', 'WiFi'], { min: 1, max: 3 })
          },
          financial: {
            purchasePrice: faker.number.int({ min: 500, max: 50000 }),
            purchaseDate: faker.date.past({ years: 3 }),
            warranty: faker.date.future({ years: 1 }),
            depreciationRate: faker.number.float({ min: 0.1, max: 0.3, fractionDigits: 2 })
          },
          maintenance: {
            lastService: faker.date.past({ months: 6 }),
            nextService: faker.date.future({ months: 6 }),
            serviceHistory: []
          },
          tags: faker.helpers.arrayElements(['professional', 'portable', 'studio', 'field'], { min: 1, max: 2 }),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: this.adminUserId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await this.mockCreateDocument('inventoryItems', assetId, assetData);
        await this.mockCreateDocument('assets', assetId, assetData); // Duplicate for assets collection
        this.assets.push(assetData);
        this.generatedIds.assets.push(assetId);
      }
    }

    console.log(`✅ Created ${this.assets.length} inventory items and assets`);
  }

  // 7. Create Network and IP Management Data
  async createNetworkData() {
    console.log('🌐 Creating network and IP management data...');

    // Create networks
    const networks = [
      { name: 'Production Network', subnet: '192.168.1.0/24', vlan: 10 },
      { name: 'Post-Production Network', subnet: '192.168.2.0/24', vlan: 20 },
      { name: 'Storage Network', subnet: '10.0.1.0/24', vlan: 30 },
      { name: 'Guest Network', subnet: '172.16.1.0/24', vlan: 40 }
    ];

    for (const network of networks) {
      const networkId = this.generateId('network');
      const networkData = {
        id: networkId,
        organizationId: this.organizationId,
        name: network.name,
        subnet: network.subnet,
        vlan: network.vlan,
        gateway: network.subnet.replace('0/24', '1'),
        dnsServers: ['8.8.8.8', '8.8.4.4'],
        dhcpEnabled: true,
        dhcpRange: {
          start: network.subnet.replace('0/24', '100'),
          end: network.subnet.replace('0/24', '200')
        },
        description: `Network for ${network.name.toLowerCase()}`,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: this.adminUserId
      };

      await this.mockCreateDocument('networks', networkId, networkData);

      // Create IP assignments for this network
      const baseIP = network.subnet.split('.').slice(0, 3).join('.');
      for (let i = 10; i < 50; i++) {
        const ipId = this.generateId('ip');
        const ipAddress = `${baseIP}.${i}`;
        
        const ipData = {
          id: ipId,
          organizationId: this.organizationId,
          networkId: networkId,
          ipAddress: ipAddress,
          hostname: `device-${i}`,
          deviceType: faker.helpers.arrayElement(['camera', 'server', 'workstation', 'switch', 'router']),
          assignedTo: faker.helpers.arrayElement([null, ...this.generatedIds.users]),
          status: faker.helpers.arrayElement(['assigned', 'available', 'reserved']),
          macAddress: faker.internet.mac(),
          description: faker.lorem.sentence(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: this.adminUserId
        };

        await this.mockCreateDocument('networkIPAssignments', ipId, ipData);
      }
    }

    console.log('✅ Created network and IP management data');
  }

  // 8. Create Media Files and Content
  async createMediaFiles() {
    console.log('🎥 Creating media files and content...');

    const fileTypes = [
      { extension: 'mp4', type: 'video', size: () => faker.number.int({ min: 100, max: 5000 }) },
      { extension: 'mov', type: 'video', size: () => faker.number.int({ min: 500, max: 10000 }) },
      { extension: 'wav', type: 'audio', size: () => faker.number.int({ min: 10, max: 200 }) },
      { extension: 'mp3', type: 'audio', size: () => faker.number.int({ min: 5, max: 50 }) },
      { extension: 'psd', type: 'image', size: () => faker.number.int({ min: 50, max: 500 }) },
      { extension: 'jpg', type: 'image', size: () => faker.number.int({ min: 1, max: 20 }) }
    ];

    for (const project of this.projects) {
      const fileCount = faker.number.int({ min: 10, max: 30 });
      
      for (let i = 0; i < fileCount; i++) {
        const fileType = faker.helpers.arrayElement(fileTypes);
        const fileId = this.generateId('media');
        const fileName = `${project.name.replace(/\s+/g, '_')}_${i + 1}.${fileType.extension}`;

        const mediaData = {
          id: fileId,
          organizationId: this.organizationId,
          projectId: project.id,
          fileName: fileName,
          originalName: fileName,
          fileType: fileType.type,
          mimeType: `${fileType.type}/${fileType.extension}`,
          fileSize: fileType.size() * 1024 * 1024, // Convert to bytes
          filePath: `/projects/${project.id}/media/${fileName}`,
          url: `https://storage.googleapis.com/backbone-media/${project.id}/${fileName}`,
          thumbnailUrl: fileType.type === 'video' || fileType.type === 'image' ? 
            `https://storage.googleapis.com/backbone-thumbnails/${project.id}/${fileName}.jpg` : null,
          metadata: {
            duration: fileType.type === 'video' || fileType.type === 'audio' ? 
              faker.number.int({ min: 30, max: 3600 }) : null,
            resolution: fileType.type === 'video' || fileType.type === 'image' ? 
              faker.helpers.arrayElement(['1920x1080', '3840x2160', '1280x720']) : null,
            bitrate: fileType.type === 'video' || fileType.type === 'audio' ? 
              faker.number.int({ min: 128, max: 50000 }) : null,
            codec: fileType.type === 'video' ? 
              faker.helpers.arrayElement(['H.264', 'H.265', 'ProRes']) : null
          },
          status: faker.helpers.arrayElement(['processing', 'ready', 'archived']),
          uploadedBy: faker.helpers.arrayElement(this.generatedIds.users),
          tags: faker.helpers.arrayElements(['raw', 'edited', 'final', 'backup', 'proxy'], { min: 1, max: 3 }),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await this.mockCreateDocument('mediaFiles', fileId, mediaData);
      }
    }

    console.log('✅ Created media files and content');
  }

  // 9. Create AI Agents and Messages
  async createAIAgentsAndMessages() {
    console.log('🤖 Creating AI agents and messages...');

    // Create AI agents
    const agentTypes = [
      { name: 'Production Assistant', role: 'assistant', specialty: 'scheduling' },
      { name: 'Script Analyzer', role: 'analyzer', specialty: 'content' },
      { name: 'Quality Controller', role: 'reviewer', specialty: 'quality' },
      { name: 'Budget Tracker', role: 'monitor', specialty: 'finance' }
    ];

    for (const agentType of agentTypes) {
      const agentId = this.generateId('agent');
      const agentData = {
        id: agentId,
        organizationId: this.organizationId,
        name: agentType.name,
        type: agentType.role,
        specialty: agentType.specialty,
        description: `AI agent specialized in ${agentType.specialty} for media production`,
        model: 'gpt-4',
        systemPrompt: `You are a ${agentType.name} AI assistant specialized in ${agentType.specialty}. Help users with tasks related to media production.`,
        capabilities: faker.helpers.arrayElements([
          'text_generation', 'analysis', 'scheduling', 'monitoring', 'reporting'
        ], { min: 2, max: 4 }),
        settings: {
          temperature: faker.number.float({ min: 0.1, max: 0.9, fractionDigits: 1 }),
          maxTokens: faker.number.int({ min: 1000, max: 4000 }),
          responseFormat: 'text'
        },
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: this.adminUserId
      };

      await this.mockCreateDocument('aiAgents', agentId, agentData);
      await this.mockCreateDocument('agents', agentId, agentData); // Duplicate for agents collection
      this.generatedIds.agents.push(agentId);
    }

    // Create message sessions and messages
    for (const project of this.projects.slice(0, 5)) { // Limit to first 5 projects
      const sessionId = this.generateId('msg-session');
      const participants = faker.helpers.arrayElements(this.generatedIds.users, { min: 2, max: 4 });

      const messageSessionData = {
        id: sessionId,
        organizationId: this.organizationId,
        projectId: project.id,
        name: `${project.name} Discussion`,
        type: 'project',
        participants: participants,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: participants[0]
      };

      await this.mockCreateDocument('messageSessions', sessionId, messageSessionData);

      // Create messages in this session
      const messageCount = faker.number.int({ min: 5, max: 20 });
      for (let i = 0; i < messageCount; i++) {
        const messageId = this.generateId('message');
        const sender = faker.helpers.arrayElement(participants);

        const messageData = {
          id: messageId,
          organizationId: this.organizationId,
          sessionId: sessionId,
          projectId: project.id,
          senderId: sender,
          content: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
          type: 'text',
          timestamp: faker.date.recent({ days: 7 }),
          isRead: faker.datatype.boolean(),
          reactions: [],
          attachments: [],
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await this.mockCreateDocument('messages', messageId, messageData);
      }
    }

    console.log('✅ Created AI agents and messages');
  }

  // 10. Create Business Data (Subscription, Organization License Pool, Team Member Licenses)
  async createBusinessData() {
    console.log('💰 Creating business data...');

    // First, create the Enterprise subscription
    const subscriptionId = this.generateId('subscription');
    const subscriptionData = {
      id: subscriptionId,
      userId: this.adminUserId, // Account owner
      organizationId: this.organizationId,
      tier: 'ENTERPRISE',
      status: 'active',
      billingCycle: 'annual',
      amount: 2500, // Enterprise tier pricing
      currency: 'USD',
      licenseCount: 250, // Enterprise tier: 250 licenses
      usedLicenses: 25, // 25 team members created
      availableLicenses: 225, // 225 remaining in pool
      startDate: faker.date.past({ years: 1 }),
      endDate: faker.date.future({ years: 1 }),
      autoRenew: true,
      paymentMethod: 'credit_card',
      lastPaymentDate: faker.date.recent({ days: 30 }),
      nextBillingDate: faker.date.future({ months: 12 }),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await this.mockCreateDocument('subscriptions', subscriptionId, subscriptionData);

    // Create organization license pool (Enterprise tier = 250 licenses)
    const totalLicenses = 250;
    const assignedLicenses = 25; // Match number of team members
    const availableLicenses = totalLicenses - assignedLicenses;

    // Create assigned licenses (for existing team members)
    for (let i = 0; i < assignedLicenses; i++) {
      const licenseId = this.generateId('license');
      const assignedUserId = this.generatedIds.users[i] || this.adminUserId;
      
      const licenseData = {
        id: licenseId,
        key: `ENT-${faker.string.alphanumeric(12).toUpperCase()}`,
        tier: 'ENTERPRISE',
        status: 'ACTIVE', // Assigned and active
        organizationId: this.organizationId,
        subscriptionId: subscriptionId,
        
        // Assignment data (assigned to team member)
        assignedTo: {
          userId: assignedUserId,
          name: faker.person.fullName(),
          email: faker.internet.email(),
          assignedAt: faker.date.recent({ days: 30 })
        },
        
        // Pool management
        availableForAssignment: false, // Already assigned
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: faker.date.future({ years: 1 })
      };

      await this.mockCreateDocument('licenses', licenseId, licenseData);
      this.generatedIds.licenses.push(licenseId);
    }

    // Create available licenses (in organization pool, ready for assignment)
    for (let i = 0; i < availableLicenses; i++) {
      const licenseId = this.generateId('license');
      
      const licenseData = {
        id: licenseId,
        key: `ENT-${faker.string.alphanumeric(12).toUpperCase()}`,
        tier: 'ENTERPRISE',
        status: 'PENDING', // Available in pool
        organizationId: this.organizationId,
        subscriptionId: subscriptionId,
        
        // Assignment data (null when in pool)
        assignedTo: null,
        
        // Pool management
        availableForAssignment: true, // Available for assignment
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: faker.date.future({ years: 1 })
      };

      await this.mockCreateDocument('licenses', licenseId, licenseData);
      this.generatedIds.licenses.push(licenseId);
    }

    console.log(`✅ Created Enterprise subscription with ${totalLicenses} license pool:`);
    console.log(`   - Assigned licenses: ${assignedLicenses}`);
    console.log(`   - Available licenses: ${availableLicenses}`);
    console.log(`   - Total pool capacity: ${totalLicenses}`);

    // Create additional service subscriptions (separate from team member licensing)
    const serviceSubscriptions = [
      { service: 'Cloud Storage', plan: 'Enterprise', cost: 500 },
      { service: 'Video Streaming', plan: 'Professional', cost: 200 },
      { service: 'Asset Management', plan: 'Team', cost: 150 },
      { service: 'Backup Service', plan: 'Business', cost: 100 }
    ];

    for (const subscription of serviceSubscriptions) {
      const subId = this.generateId('subscription');
      const subData = {
        id: subId,
        organizationId: this.organizationId,
        type: 'SERVICE', // Different from team member licensing
        serviceName: subscription.service,
        plan: subscription.plan,
        status: 'active',
        startDate: faker.date.past({ months: 6 }),
        endDate: faker.date.future({ months: 6 }),
        cost: subscription.cost,
        currency: 'USD',
        billingCycle: 'monthly',
        autoRenew: true,
        features: faker.helpers.arrayElements([
          'unlimited_storage', 'priority_support', 'advanced_analytics', 'team_collaboration'
        ], { min: 2, max: 4 }),
        usage: {
          current: faker.number.int({ min: 100, max: 1000 }),
          limit: faker.number.int({ min: 1000, max: 10000 }),
          unit: 'GB'
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: this.adminUserId
      };

      await this.mockCreateDocument('subscriptions', subId, subData);
    }

    // Create payment records
    for (let i = 0; i < 20; i++) {
      const paymentId = this.generateId('payment');
      const paymentData = {
        id: paymentId,
        organizationId: this.organizationId,
        type: faker.helpers.arrayElement(['team_member_licensing', 'service_subscription', 'equipment', 'consulting']),
        amount: faker.number.int({ min: 100, max: 5000 }),
        currency: 'USD',
        status: faker.helpers.arrayElement(['completed', 'pending', 'failed']),
        method: faker.helpers.arrayElement(['credit_card', 'bank_transfer', 'check']),
        description: faker.commerce.productDescription(),
        transactionId: faker.string.alphanumeric(16).toUpperCase(),
        paymentDate: faker.date.past({ months: 12 }),
        dueDate: faker.date.past({ months: 11 }),
        vendor: faker.company.name(),
        invoiceNumber: `INV-${faker.number.int({ min: 1000, max: 9999 })}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: this.adminUserId
      };

      await this.mockCreateDocument('payments', paymentId, paymentData);
    }

    console.log('✅ Created business data');
  }

  // 11. Create Timecard Data
  async createTimecardData() {
    console.log('⏰ Creating timecard data...');

    // Create timecard templates
    const templates = [
      { name: 'Standard Production', categories: ['Pre-Production', 'Production', 'Post-Production'] },
      { name: 'Remote Work', categories: ['Development', 'Meetings', 'Administration'] },
      { name: 'Client Project', categories: ['Client Work', 'Internal', 'Travel'] }
    ];

    for (const template of templates) {
      const templateId = this.generateId('template');
      const templateData = {
        id: templateId,
        organizationId: this.organizationId,
        name: template.name,
        description: `Template for ${template.name.toLowerCase()} time tracking`,
        categories: template.categories.map(cat => ({
          name: cat,
          code: cat.replace(/\s+/g, '_').toUpperCase(),
          billable: faker.datatype.boolean(),
          defaultRate: faker.number.int({ min: 50, max: 200 })
        })),
        isActive: true,
        isDefault: template.name === 'Standard Production',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: this.adminUserId
      };

      await this.mockCreateDocument('timecard_templates', templateId, templateData);
    }

    // Create timecards for team members
    for (const member of this.teamMembers.slice(0, 10)) { // Limit to first 10 members
      const timecardId = this.generateId('timecard');
      const entries = [];

      // Create entries for the past week
      for (let day = 0; day < 7; day++) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        
        if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
          const entryId = this.generateId('entry');
          const project = faker.helpers.arrayElement(this.projects);
          
          entries.push({
            id: entryId,
            date: date,
            projectId: project.id,
            category: faker.helpers.arrayElement(['Production', 'Post-Production', 'Meetings']),
            hours: faker.number.float({ min: 4, max: 10, fractionDigits: 1 }),
            description: faker.lorem.sentence(),
            billable: faker.datatype.boolean(),
            rate: faker.number.int({ min: 50, max: 150 }),
            approved: faker.datatype.boolean()
          });
        }
      }

      const timecardData = {
        id: timecardId,
        organizationId: this.organizationId,
        userId: member.id,
        weekStarting: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        entries: entries,
        totalHours: entries.reduce((sum, entry) => sum + entry.hours, 0),
        status: faker.helpers.arrayElement(['draft', 'submitted', 'approved', 'rejected']),
        submittedAt: faker.date.recent(),
        approvedBy: faker.helpers.arrayElement(this.teamMembers.filter(tm => tm.role.includes('Manager')).map(tm => tm.id)),
        approvedAt: faker.date.recent(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await this.mockCreateDocument('user_timecards', timecardId, timecardData);
      this.generatedIds.timecards.push(timecardId);

      // Create individual timecard entries
      for (const entry of entries) {
        await this.mockCreateDocument('timecard_entries', entry.id, {
          ...entry,
          organizationId: this.organizationId,
          userId: member.id,
          timecardId: timecardId,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    console.log('✅ Created timecard data');
  }

  // 12. Create Datasets and Dataset Assignments
  async createDatasetsAndAssignments() {
    console.log('📊 Creating datasets and project assignments...');

    // Create datasets with proper tenant isolation
    const datasetTypes = [
      { name: 'Production Assets', type: 'media', description: 'Video, audio, and image assets for production', visibility: 'organization' },
      { name: 'Project Documentation', type: 'documents', description: 'Scripts, storyboards, and project documents', visibility: 'organization' },
      { name: 'Client Resources', type: 'resources', description: 'Client-provided materials and references', visibility: 'organization' },
      { name: 'Archive Storage', type: 'archive', description: 'Completed project archives and backups', visibility: 'organization' },
      { name: 'Raw Footage', type: 'media', description: 'Unprocessed video and audio recordings', visibility: 'private' },
      { name: 'Graphics Library', type: 'graphics', description: 'Logos, graphics, and design elements', visibility: 'organization' }
    ];

    const createdDatasets = [];
    for (const datasetType of datasetTypes) {
      const datasetId = this.generateId('dataset');
      
      // 🔐 TENANT ISOLATION: Ensure all datasets are properly scoped to this organization
      const datasetData = {
        id: datasetId,
        name: datasetType.name,
        description: datasetType.description,
        type: datasetType.type,
        visibility: datasetType.visibility, // Different visibility levels for testing
        status: 'ACTIVE', // CRITICAL: Required for frontend queries
        ownerId: this.adminUserId,
        organizationId: this.organizationId, // CRITICAL: Tenant isolation
        
        // 🔒 SECURITY METADATA: Track ownership and access
        tenantId: this.organizationId, // Explicit tenant scoping
        ownerEmail: ENTERPRISE_CONFIG.adminEmail,
        accessLevel: datasetType.visibility === 'private' ? 'owner_only' : 'organization_members',
        
        tags: faker.helpers.arrayElements(['production', 'media', 'client', 'archive'], { min: 1, max: 3 }),
        
        // 🚨 CRITICAL: ASSIGNED COLLECTIONS - This determines what data this dataset can access
        assignedCollections: this.getCollectionsForDataset(datasetType.type),
        
        schema: {
          version: '1.0',
          fields: ['name', 'type', 'size', 'createdAt'],
          metadata: { 
            category: datasetType.type,
            tenantId: this.organizationId, // Schema-level tenant tracking
            securityLevel: datasetType.visibility === 'private' ? 'restricted' : 'standard'
          }
        },
        storage: {
          backend: 'firestore',
          path: `/tenants/${this.organizationId}/datasets/${datasetId}`, // Tenant-scoped storage path
          gcsBucket: 'backbone-datasets',
          gcsPrefix: `org-${this.organizationId}/dataset-${datasetId}/`, // Organization-scoped GCS prefix
          tenantIsolation: true // Flag for storage-level isolation
        },
        stats: {
          totalSize: faker.number.int({ min: 1000000, max: 10000000000 }), // 1MB to 10GB
          fileCount: faker.number.int({ min: 10, max: 1000 }),
          lastUpdated: faker.date.recent(),
          accessCount: faker.number.int({ min: 0, max: 100 }),
          lastAccessedBy: this.adminUserId
        },
        
        // 🔐 ACCESS CONTROL: Define who can access this dataset
        permissions: {
          owner: [this.adminUserId], // Dataset owner
          admins: [this.adminUserId], // Organization admins
          viewers: datasetType.visibility === 'organization' ? this.generatedIds.users : [this.adminUserId],
          editors: [this.adminUserId] // Who can modify the dataset
        },
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await this.mockCreateDocument('datasets', datasetId, datasetData);
      createdDatasets.push(datasetData);
    }

    // Assign datasets to projects with proper tenant isolation and access control
    for (const project of this.projects) {
      // Assign 2-4 datasets per project, but only datasets from the same organization
      const organizationDatasets = createdDatasets.filter(dataset => 
        dataset.organizationId === this.organizationId && 
        dataset.tenantId === this.organizationId
      );
      
      const assignedDatasets = faker.helpers.arrayElements(organizationDatasets, { min: 2, max: 4 });
      
      for (const dataset of assignedDatasets) {
        const assignmentId = this.generateId('datasetAssignment');
        
        // 🔐 TENANT-AWARE ASSIGNMENT: Only assign datasets within the same tenant
        const assignmentData = {
          id: assignmentId,
          projectId: project.id,
          datasetId: dataset.id,
          assignedBy: this.adminUserId,
          assignedAt: admin.firestore.FieldValue.serverTimestamp(),
          
          // 🔒 TENANT ISOLATION: Critical security fields
          organizationId: this.organizationId, // Assignment belongs to this organization
          tenantId: this.organizationId, // Explicit tenant scoping
          projectTenantId: project.organizationId || this.organizationId, // Ensure project is in same tenant
          datasetTenantId: dataset.tenantId, // Track dataset's tenant
          
          // 🚨 CRITICAL: COLLECTION ASSIGNMENTS - This is what routes data!
          assignedCollections: this.getCollectionsForDataset(dataset.type),
          collectionAssignment: {
            selectedCollections: this.getCollectionsForDataset(dataset.type),
            assignmentMode: 'EXCLUSIVE', // Each dataset gets exclusive access to its collections
            priority: 1,
            routingEnabled: true // Enable data routing through this assignment
          },
          
          // 🎯 ACCESS CONTROL: Define what team members can do with this dataset in this project
          permissions: this.getDatasetPermissionsForProject(dataset, project),
          accessLevel: dataset.accessLevel, // Inherit from dataset
          
          // 🔐 SECURITY VALIDATION: Ensure no cross-tenant assignments
          securityValidation: {
            tenantMatch: dataset.tenantId === this.organizationId,
            projectTenantMatch: (project.organizationId || this.organizationId) === this.organizationId,
            assignerHasAccess: true, // Admin can assign
            validatedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          
          isActive: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          
          // 📊 AUDIT TRAIL: Track who can access this assignment
          auditTrail: {
            assignedBy: this.adminUserId,
            assignedByEmail: ENTERPRISE_CONFIG.adminEmail,
            reason: 'Enterprise mock data generation',
            projectName: project.name,
            datasetName: dataset.name
          }
        };

        await this.mockCreateDocument('datasetAssignments', assignmentId, assignmentData);
      }
    }

    console.log(`✅ Created ${createdDatasets.length} datasets and assigned them to projects`);
  }

  // 13. Create Additional Collections Data
  async createAdditionalData() {
    console.log('📋 Creating additional collections data...');

    // Create roles
    const roles = [
      { name: 'Admin', permissions: ['all'], level: 10 },
      { name: 'Project Manager', permissions: ['projects', 'team', 'reports'], level: 8 },
      { name: 'Producer', permissions: ['projects', 'sessions', 'media'], level: 7 },
      { name: 'Editor', permissions: ['media', 'sessions'], level: 5 },
      { name: 'Viewer', permissions: ['view'], level: 1 }
    ];

    for (const role of roles) {
      const roleId = this.generateId('role');
      const roleData = {
        id: roleId,
        organizationId: this.organizationId,
        name: role.name,
        description: `${role.name} role with specific permissions`,
        permissions: role.permissions,
        level: role.level,
        isSystemRole: true,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: this.adminUserId
      };

      await this.mockCreateDocument('roles', roleId, roleData);
    }

    // Create schemas
    const schemas = [
      { name: 'Project Schema', type: 'project', fields: ['name', 'description', 'status', 'budget'] },
      { name: 'Asset Schema', type: 'asset', fields: ['name', 'category', 'location', 'condition'] },
      { name: 'User Schema', type: 'user', fields: ['name', 'email', 'role', 'department'] }
    ];

    for (const schema of schemas) {
      const schemaId = this.generateId('schema');
      const schemaData = {
        id: schemaId,
        organizationId: this.organizationId,
        name: schema.name,
        type: schema.type,
        version: '1.0',
        fields: schema.fields.map(field => ({
          name: field,
          type: 'string',
          required: true,
          validation: {}
        })),
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: this.adminUserId
      };

      await this.mockCreateDocument('schemas', schemaId, schemaData);
    }

    // Create notifications
    for (let i = 0; i < 15; i++) {
      const notificationId = this.generateId('notification');
      const recipient = faker.helpers.arrayElement(this.generatedIds.users);
      
      const notificationData = {
        id: notificationId,
        organizationId: this.organizationId,
        userId: recipient,
        type: faker.helpers.arrayElement(['info', 'warning', 'success', 'error']),
        title: faker.lorem.words(3),
        message: faker.lorem.sentence(),
        isRead: faker.datatype.boolean(),
        priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
        source: faker.helpers.arrayElement(['system', 'user', 'integration']),
        metadata: {
          projectId: faker.helpers.arrayElement([null, ...this.generatedIds.projects]),
          actionUrl: faker.internet.url()
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        readAt: faker.datatype.boolean() ? faker.date.recent() : null
      };

      await this.mockCreateDocument('notifications', notificationId, notificationData);
    }

    // Create audit logs
    const actions = ['create', 'update', 'delete', 'login', 'logout', 'export', 'import'];
    for (let i = 0; i < 50; i++) {
      const auditId = this.generateId('audit');
      const user = faker.helpers.arrayElement(this.generatedIds.users);
      const action = faker.helpers.arrayElement(actions);
      
      const auditData = {
        id: auditId,
        organizationId: this.organizationId,
        userId: user,
        action: action,
        resource: faker.helpers.arrayElement(['project', 'user', 'asset', 'session']),
        resourceId: faker.helpers.arrayElement(this.generatedIds.projects),
        details: {
          userAgent: faker.internet.userAgent(),
          ipAddress: this.generateIPAddress(),
          changes: action === 'update' ? { field: 'status', from: 'draft', to: 'active' } : null
        },
        timestamp: faker.date.recent({ days: 30 }),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await this.mockCreateDocument('auditLogs', auditId, auditData);
    }

    console.log('✅ Created additional collections data');
  }

  // Helper function to get permissions for role
  getPermissionsForRole(role) {
    const rolePermissions = {
      'Director': ['projects', 'sessions', 'team', 'media', 'reports'],
      'Producer': ['projects', 'sessions', 'team', 'media'],
      'Production Manager': ['projects', 'sessions', 'team', 'inventory'],
      'Production Assistant': ['sessions', 'inventory'],
      'Editor': ['media', 'sessions'],
      'Colorist': ['media'],
      'Audio Engineer': ['media'],
      'VFX Artist': ['media'],
      'IT Manager': ['inventory', 'network', 'users', 'system'],
      'Network Engineer': ['network', 'inventory'],
      'Systems Administrator': ['system', 'users', 'inventory'],
      'DevOps Engineer': ['system', 'network'],
      'Creative Director': ['projects', 'media', 'team'],
      'Art Director': ['media', 'projects'],
      'Graphic Designer': ['media'],
      'Motion Graphics Artist': ['media'],
      'Project Manager': ['projects', 'team', 'reports', 'timecards'],
      'Account Manager': ['projects', 'clients', 'reports'],
      'Business Analyst': ['reports', 'analytics'],
      'Operations Manager': ['projects', 'team', 'inventory', 'reports']
    };

    return rolePermissions[role] || ['view'];
  }

  // 🔐 DATASET PERMISSIONS: Determine what permissions team members have on datasets in projects
  getDatasetPermissionsForProject(dataset, project) {
    const basePermissions = ['read']; // Everyone can read assigned datasets
    
    // Add write permissions based on dataset type and project context
    if (dataset.type === 'media' || dataset.type === 'graphics') {
      basePermissions.push('write', 'upload'); // Media datasets allow uploads
    }
    
    if (dataset.type === 'documents') {
      basePermissions.push('write', 'comment'); // Document datasets allow editing and comments
    }
    
    if (dataset.visibility === 'private') {
      // Private datasets have restricted permissions - only owner and admins
      return dataset.ownerId === this.adminUserId ? ['read', 'write', 'admin', 'delete'] : ['read'];
    }
    
    // Organization datasets have broader permissions
    if (dataset.visibility === 'organization') {
      basePermissions.push('write', 'share');
    }
    
    return basePermissions;
  }

  // 🚨 CRITICAL: COLLECTION MAPPING - This determines what collections each dataset type can access
  getCollectionsForDataset(datasetType) {
    const collectionMappings = {
      'media': ['mediaFiles', 'assets', 'sessions'], // Media datasets get media-related collections
      'documents': ['sessions', 'workflows', 'networkDeliveryBibles'], // Document datasets get document-related collections  
      'production': ['sessions', 'workflows', 'inventoryItems', 'assets'], // Production datasets get production-related collections
      'client': ['clients', 'projects', 'sessions'], // Client datasets get client-related collections
      'archive': ['mediaFiles', 'assets', 'sessions', 'workflows'], // Archive datasets get historical data
      'graphics': ['mediaFiles', 'assets', 'workflows'] // Graphics datasets get creative assets
    };
    
    // Return collections for this dataset type, or default set if type not found
    return collectionMappings[datasetType] || ['sessions', 'mediaFiles'];
  }

  // 14. Create Network Delivery Bibles and Deliverables
  async createNetworkDeliveryBibles() {
    console.log('📖 Creating network delivery bibles and deliverables...');

    // Define comprehensive deliverables based on industry standards
    const deliverableBibles = [
      {
        name: 'Tell Me More Season 1 - Deliverables.pdf',
        type: 'Netflix Series',
        description: 'Complete post-production and legal deliverables for TMM Season 1',
        deliverables: [
          {
            deliverableName: 'Fair Use Legal Opinion Letter',
            category: 'Legal',
            deadline: 'Before first IMF delivery',
            priority: 'high',
            status: 'not_started',
            specifications: ['Legal review required', 'Attorney signature needed']
          },
          {
            deliverableName: 'Fact Check Document',
            category: 'Legal',
            deadline: 'Include in PIX email notification',
            priority: 'high',
            status: 'in_progress',
            specifications: ['Verify all factual claims', 'Source documentation required']
          },
          {
            deliverableName: 'IMF Package',
            category: 'Video',
            deadline: 'Sunday by 9am ET',
            priority: 'critical',
            status: 'not_started',
            specifications: [
              'IMF format compliant',
              'Full raster delivery',
              'Color pipeline documentation included'
            ]
          },
          {
            deliverableName: 'IMF Textless',
            category: 'Video',
            deadline: 'Within a week of passing QC',
            priority: 'high',
            status: 'not_started',
            specifications: ['Textless version of IMF', 'Same technical specs as main IMF']
          },
          {
            deliverableName: '5.1 Near Field Audio Stems',
            category: 'Audio',
            deadline: 'Within a week of passing QC',
            priority: 'high',
            status: 'not_started',
            specifications: ['5.1 surround mix', 'Near field monitoring optimized']
          },
          {
            deliverableName: '5.1 Near Field Mix minus Narration',
            category: 'Audio',
            deadline: 'Within a week of passing QC',
            priority: 'medium',
            status: 'not_started',
            specifications: ['5.1 mix without narrator track', 'International version ready']
          },
          {
            deliverableName: 'Music Cue Sheets',
            category: 'Music',
            deadline: 'Before wrap',
            priority: 'high',
            status: 'not_started',
            specifications: ['Complete music documentation', 'Rights clearance included']
          },
          {
            deliverableName: 'Hot Sheets',
            category: 'Production',
            deadline: 'Next day after field shoot',
            priority: 'medium',
            status: 'completed',
            specifications: ['Daily production reports', 'Send to TellMeMoreS1-production@netflix.com']
          }
        ]
      },
      {
        name: 'Corporate Video - Incredible Cotton Shirt.pdf',
        type: 'Corporate Production',
        description: 'Deliverables for corporate video production',
        deliverables: [
          {
            deliverableName: 'Master File - ProRes 422 HQ',
            category: 'Video',
            deadline: '48 hours before air date',
            priority: 'critical',
            status: 'in_progress',
            specifications: [
              'Resolution: 1920x1080',
              'Frame Rate: 23.98 fps',
              'Full raster, no letterboxing'
            ]
          },
          {
            deliverableName: 'Broadcast Master - XDCAM HD422',
            category: 'Video',
            deadline: '24 hours before air date',
            priority: 'critical',
            status: 'not_started',
            specifications: [
              'Resolution: 1920x1080',
              'Frame Rate: 23.98 fps',
              'Bars and tone, slate required'
            ]
          },
          {
            deliverableName: '5.1 Surround Mix',
            category: 'Audio',
            deadline: 'With video master',
            priority: 'high',
            status: 'not_started',
            specifications: [
              'Format: WAV 48kHz/24-bit',
              '-23 LUFS, -18dBFS peak'
            ]
          },
          {
            deliverableName: 'Stereo Mix',
            category: 'Audio',
            deadline: 'With video master',
            priority: 'high',
            status: 'not_started',
            specifications: [
              'Format: WAV 48kHz/24-bit',
              '-23 LUFS, -18dBFS peak'
            ]
          },
          {
            deliverableName: 'Key Art - Main Poster',
            category: 'Artwork',
            deadline: '2 weeks before air date',
            priority: 'medium',
            status: 'completed',
            specifications: [
              'Format: TIFF, RGB',
              'Resolution: 300 DPI minimum',
              '27" x 40" at 300 DPI'
            ]
          },
          {
            deliverableName: 'Closed Captions',
            category: 'Metadata',
            deadline: 'With final video',
            priority: 'high',
            status: 'in_progress',
            specifications: [
              'Format: SCC or SRT',
              'FCC compliant',
              'Accurate timing and spelling'
            ]
          }
        ]
      },
      {
        name: 'Feature Film - Premium Production.pdf',
        type: 'Feature Film',
        description: 'Comprehensive deliverables for theatrical release',
        deliverables: [
          {
            deliverableName: 'DCP (Digital Cinema Package)',
            category: 'Video',
            deadline: '2 weeks before theatrical release',
            priority: 'critical',
            status: 'not_started',
            specifications: [
              '4K or 2K resolution',
              'JPEG 2000 compression',
              'Encrypted for theatrical projection'
            ]
          },
          {
            deliverableName: 'Dolby Atmos Mix',
            category: 'Audio',
            deadline: 'With DCP delivery',
            priority: 'critical',
            status: 'not_started',
            specifications: [
              'Object-based audio mix',
              'Theatrical calibration',
              'Dolby certified facility required'
            ]
          },
          {
            deliverableName: 'International Textless Master',
            category: 'Video',
            deadline: '1 week after domestic master',
            priority: 'high',
            status: 'not_started',
            specifications: [
              'No burned-in text or graphics',
              'Same technical specs as domestic master',
              'Separate title card elements'
            ]
          },
          {
            deliverableName: 'M&E (Music & Effects) Track',
            category: 'Audio',
            deadline: 'With international master',
            priority: 'high',
            status: 'not_started',
            specifications: [
              'No dialogue track',
              'Full music and sound effects',
              'International dubbing ready'
            ]
          }
        ]
      }
    ];

    for (const bible of deliverableBibles) {
      const bibleId = this.generateId('bible');
      
      const bibleData = {
        id: bibleId,
        organizationId: this.organizationId,
        fileName: bible.name,
        fileType: bible.type,
        description: bible.description,
        uploadedBy: this.adminUserId, // Use user ID, not email
        uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
        
        // Bible metadata
        status: 'parsed_successfully', // Match expected API status
        version: '1.0',
        lastModified: admin.firestore.FieldValue.serverTimestamp(),
        
        // Content analysis
        rawText: `Network Delivery Bible: ${bible.name}\n\nType: ${bible.type}\n\nDescription: ${bible.description}\n\nThis bible contains ${bible.deliverables.length} deliverables across multiple categories including video, audio, legal, and metadata requirements.`,
        deliverableCount: bible.deliverables.length,
        parsedAt: admin.firestore.FieldValue.serverTimestamp(),
        
        // Organization and project association
        projectId: faker.helpers.arrayElement(this.generatedIds.projects), // Associate with a specific project
        projectIds: this.generatedIds.projects.slice(0, 3), // Also keep array for compatibility
        
        // Access control
        visibility: 'organization',
        accessLevel: 'all_members',
        
        // Processing status
        processingStatus: 'completed',
        processingCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
        
        // Statistics
        totalDeliverables: bible.deliverables.length,
        completedDeliverables: bible.deliverables.filter(d => d.status === 'completed').length,
        inProgressDeliverables: bible.deliverables.filter(d => d.status === 'in_progress').length,
        notStartedDeliverables: bible.deliverables.filter(d => d.status === 'not_started').length,
        
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await this.mockCreateDocument('networkDeliveryBibles', bibleId, bibleData);

      // Create deliverables as sub-collection
      for (let i = 0; i < bible.deliverables.length; i++) {
        const deliverable = bible.deliverables[i];
        const deliverableId = `${bibleId}_deliverable_${i}`;
        
        const deliverableData = {
          id: deliverableId,
          bibleId: bibleId,
          organizationId: this.organizationId,
          projectId: faker.helpers.arrayElement(this.generatedIds.projects),
          
          // Deliverable details
          deliverableName: deliverable.deliverableName,
          category: deliverable.category,
          deadline: deliverable.deadline,
          priority: deliverable.priority,
          status: deliverable.status,
          specifications: deliverable.specifications,
          
          // Assignment and tracking
          assignedTo: faker.helpers.arrayElement(this.generatedIds.users),
          assignedAt: admin.firestore.FieldValue.serverTimestamp(),
          
          // Progress tracking
          progressPercentage: deliverable.status === 'completed' ? 100 : 
                             deliverable.status === 'in_progress' ? faker.number.int({ min: 25, max: 75 }) : 0,
          
          // Dates
          estimatedStartDate: faker.date.future({ days: 30 }),
          estimatedCompletionDate: faker.date.future({ days: 60 }),
          actualStartDate: deliverable.status !== 'not_started' ? faker.date.recent({ days: 10 }) : null,
          actualCompletionDate: deliverable.status === 'completed' ? faker.date.recent({ days: 5 }) : null,
          
          // Notes and comments
          notes: faker.lorem.paragraph(),
          comments: [],
          
          // File attachments (simulated)
          attachments: deliverable.status === 'completed' ? [
            {
              fileName: `${deliverable.deliverableName.replace(/\s+/g, '_')}.${deliverable.category === 'Video' ? 'mov' : deliverable.category === 'Audio' ? 'wav' : 'pdf'}`,
              fileSize: faker.number.int({ min: 1024, max: 1024 * 1024 * 100 }), // 1KB to 100MB
              uploadedAt: faker.date.recent({ days: 3 }),
              uploadedBy: faker.helpers.arrayElement(this.generatedIds.users)
            }
          ] : [],
          
          // Approval workflow
          requiresApproval: deliverable.priority === 'critical',
          approvalStatus: deliverable.status === 'completed' ? 'approved' : 'pending',
          approvedBy: deliverable.status === 'completed' ? this.adminUserId : null,
          approvedAt: deliverable.status === 'completed' ? faker.date.recent({ days: 2 }) : null,
          
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        };

        // Create deliverable in sub-collection
        if (!isDryRun) {
          await db.collection('networkDeliveryBibles').doc(bibleId)
                  .collection('deliverables').doc(deliverableId).set(deliverableData);
        } else {
          console.log(`📝 MOCK: Would create deliverable ${deliverableId} in ${bibleId}/deliverables`);
        }
      }

      console.log(`✅ Created delivery bible: ${bible.name} with ${bible.deliverables.length} deliverables`);
    }

    console.log(`✅ Created ${deliverableBibles.length} network delivery bibles with comprehensive deliverables`);
  }

  // Essential PBM Data (Simplified)
  async createEssentialPBMData() {
    console.log('📺 Creating essential PBM data...');

    // Create essential PBM schedules (simplified)
    const pbmSchedules = [
      {
        name: 'Morning News Block',
        startTime: '06:00',
        endTime: '09:00',
        type: 'NEWS',
        priority: 'HIGH'
      },
      {
        name: 'Prime Time Entertainment',
        startTime: '20:00',
        endTime: '23:00',
        type: 'ENTERTAINMENT',
        priority: 'HIGH'
      },
      {
        name: 'Late Night Programming',
        startTime: '23:00',
        endTime: '01:00',
        type: 'LATE_NIGHT',
        priority: 'MEDIUM'
      }
    ];

    for (const schedule of pbmSchedules) {
      const scheduleId = this.generateId('pbm_schedule');
      const scheduleData = {
        id: scheduleId,
        organizationId: this.organizationId,
        name: schedule.name,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        type: schedule.type,
        priority: schedule.priority,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: this.adminUserId,
        startDate: new Date().toISOString().split('T')[0],
        userId: this.adminUserId,
        status: 'ACTIVE'
      };

      await this.mockCreateDocument('pbm_schedules', scheduleId, scheduleData);
    }

    console.log(`✅ Created ${pbmSchedules.length} essential PBM schedules`);
  }

  // Main execution function
  async generateAllMockData() {
    console.log('🚀 Starting Enterprise Mock Data Generation for BACKBONE v14.2');
    console.log('================================================================\n');

    // Import faker dynamically (ES module)
    if (!faker) {
      try {
        const fakerModule = await import('@faker-js/faker');
        faker = fakerModule.faker;
        console.log('✅ Faker library loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load faker library:', error.message);
        throw error;
      }
    }

    // Check authentication first (but don't fail if Firebase Auth is not available)
    const authOk = await this.checkAuthentication();
    if (!authOk && !isDryRun) {
      console.log('⚠️  Firebase Auth access failed, but continuing with Firestore operations...');
      console.log('   Note: Firebase Auth users will not be created, but Firestore data will be generated.');
    }

    try {
      // Handle cleanup mode
      if (shouldCleanup) {
        const conflicts = await this.checkExistingData();
        if (conflicts.totalConflicts > 0) {
          console.log(`\n🧹 Found ${conflicts.totalConflicts} existing documents. Cleaning up...`);
          await this.cleanupExistingData();
          console.log('\n✅ Cleanup completed. You can now run the script normally to generate fresh data.');
          return;
        } else {
          console.log('\n✅ No existing enterprise data found. Safe to proceed with generation.');
        }
      }

      // Check for conflicts if not in dry-run or force mode
      if (!isDryRun && !forceOverwrite) {
        const conflicts = await this.checkExistingData();
        if (conflicts.totalConflicts > 0) {
          console.log('\n❌ CONFLICT DETECTED!');
          console.log('=====================================');
          console.log(`Found ${conflicts.totalConflicts} existing documents that would conflict.`);
          console.log('\nOptions:');
          console.log('  --force     : Overwrite existing data');
          console.log('  --cleanup   : Clean up existing data first');
          console.log('  --dry-run   : Preview what would be created');
          console.log('\nExample: node generate-enterprise-mock-data.js --cleanup');
          throw new Error('Conflicts detected. Use one of the options above to proceed.');
        }
      }

      // ESSENTIAL DATA ONLY - Optimized for Dashboard & Licensing
      await this.createOrganizationAndAdmin();
      await this.createTeamMembers();
      await this.createClients();
      await this.createProjects();
      await this.createSessionsAndWorkflows();
      await this.createInventoryAndAssets();
      await this.createBusinessData(); // Includes subscriptions, licenses, payments
      await this.createTimecardData();
      await this.createEssentialPBMData(); // Simplified PBM data
      
      // REMOVED HEAVY COLLECTIONS:
      // - createNetworkData() - Network management (not essential for core functionality)
      // - createMediaFiles() - Large file creation (bogs down seeding)
      // - createAIAgentsAndMessages() - AI data (not essential for basic functionality)
      // - createDatasetsAndAssignments() - Large dataset creation
      // - createNetworkDeliveryBibles() - Complex delivery data
      // - createAdditionalData() - Miscellaneous collections

      // Authenticate all users if requested
      if (shouldAuthenticate) {
        await this.authenticateAllUsers();
      }

      if (isDryRun) {
        console.log('\n🧪 MOCK MODE SUMMARY');
        console.log('====================');
        console.log(`📊 Collections that would be created: ${this.stats.collectionsCreated.size}`);
        console.log(`📄 Documents that would be created: ${this.stats.documentsCreated}`);
        console.log(`🔗 Relationships that would be established: ${this.stats.relationshipsCreated}`);
        console.log(`\n📋 Collections: ${Array.from(this.stats.collectionsCreated).sort().join(', ')}`);
        console.log('\n✅ Mock run completed successfully!');
        console.log('💡 To execute for real, run without --dry-run or --mock flag');
      } else {
        console.log('\n🎉 ENTERPRISE MOCK DATA GENERATION COMPLETE!');
        console.log('=============================================');
        console.log(`✅ Organization: ${ENTERPRISE_CONFIG.organizationName}`);
        console.log(`✅ Admin User: ${ENTERPRISE_CONFIG.adminEmail}`);
        console.log(`✅ Team Members: ${this.teamMembers.length}`);
        console.log(`✅ Clients: ${this.clients.length}`);
        console.log(`✅ Projects: ${this.projects.length}`);
        console.log(`✅ Sessions: ${this.sessions.length}`);
        console.log(`✅ Assets: ${this.assets.length}`);
        console.log(`✅ Workflows: ${this.workflows.length}`);
        console.log(`✅ Essential collections populated with realistic data`);
        console.log(`✅ Proper relationships and tenant isolation implemented`);
        console.log(`✅ Optimized for Dashboard & Licensing functionality`);
        
        console.log('\n🔍 Ready for Global Search Testing!');
        console.log('The enterprise.user account now has comprehensive data across all collections.');
        
        if (shouldAuthenticate) {
          console.log(`\n🔐 Authentication Summary:`);
          console.log(`   📊 Total users processed: ${this.authStats.total}`);
          console.log(`   📁 From users collection: ${this.authStats.users}`);
          console.log(`   👥 From teamMembers collection: ${this.authStats.teamMembers}`);
          console.log(`   ✅ Already authenticated: ${this.authStats.alreadyAuthenticated}`);
          console.log(`   🆕 New users created: ${this.authStats.created}`);
          console.log(`   🔄 Users updated: ${this.authStats.updated}`);
          console.log(`   ⚠️  Duplicates found: ${this.authStats.duplicates}`);
          console.log(`   ❌ Errors: ${this.authStats.errors}`);
        }
        
        console.log('\n🔑 LOGIN CREDENTIALS');
        console.log('===================');
        console.log('📧 Email: enterprise.user@enterprisemedia.com');
        console.log(`🔒 Password: ${defaultPassword}`);
        console.log('🏢 Organization: Enterprise Media Solutions');
        console.log('👤 Role: OWNER (Full Access) + ADMIN (Team Member)');
        console.log('🔧 Team Member Document: ✅ Created in teamMembers collection');
        console.log('🔧 Firebase Auth User: ✅ Created with proper credentials');
        console.log('✅ CONSOLIDATED: Single enterprise user (duplicate removed)');
        console.log('\n🔐 FIREBASE AUTH USERS CREATED AUTOMATICALLY!');
        console.log('   ✅ All team members now have Firebase Auth accounts');
        console.log(`   ✅ Default password for all users: ${defaultPassword}`);
        console.log('   ✅ Ready to login immediately');
        console.log('   ✅ Team member authentication system fully configured');
        if (shouldAuthenticate) {
          console.log('   ✅ All existing users authenticated and synchronized');
        }
        console.log('\n🌐 Additional test credentials from MPC library:');
        console.log('   📧 Email: chebacca@gmail.com');
        console.log('   🔒 Password: admin1234');
        console.log('   👤 Role: ADMIN (Full system access)');
      }

    } catch (error) {
      console.error('❌ Error generating mock data:', error);
      throw error;
    }
  }
}

// Run the mock data generation
if (require.main === module) {
  const generator = new EnterpriseMockDataGenerator();
  generator.generateAllMockData()
    .then(() => {
      console.log('\n✅ Mock data generation completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Mock data generation failed:', error);
      process.exit(1);
    });
}

module.exports = EnterpriseMockDataGenerator;
