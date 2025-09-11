#!/usr/bin/env node

/**
 * 🏢 Dual Organization Access Verification
 * Verifies enterprise.user@enterprisemedia.com has access to both organizations
 * Based on memory: enterprise-media-org and enterprise-org-001
 */

const https = require('https');

// Firebase configuration
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDFnIzSYCdPsDDdvP1lympVxEeUn0AQhWs",
  authDomain: "backbone-logic.firebaseapp.com",
  projectId: "backbone-logic"
};

const TEST_EMAIL = 'enterprise.user@enterprisemedia.com';
const TEST_PASSWORD = 'Enterprise123!';

console.log('🏢 Verifying Dual Organization Access');
console.log('====================================');
console.log(`📧 User: ${TEST_EMAIL}`);
console.log('🎯 Expected Organizations: enterprise-media-org, enterprise-org-001');
console.log('');

/**
 * Get Firebase Auth token
 */
async function getAuthToken() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      returnSecureToken: true
    });

    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      port: 443,
      path: `/v1/accounts:signInWithPassword?key=${FIREBASE_CONFIG.apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const response = JSON.parse(data);
        if (res.statusCode === 200 && response.idToken) {
          resolve(response.idToken);
        } else {
          reject(new Error(`Auth failed: ${JSON.stringify(response)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Query Firestore collection
 */
async function queryCollection(idToken, collectionId, whereClause = null) {
  return new Promise((resolve, reject) => {
    let query = {
      structuredQuery: {
        from: [{ collectionId }]
      }
    };

    if (whereClause) {
      query.structuredQuery.where = whereClause;
    }

    const postData = JSON.stringify(query);
    
    const options = {
      hostname: 'firestore.googleapis.com',
      port: 443,
      path: `/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents:runQuery`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            const documents = response.filter(item => item.document).map(item => item.document);
            resolve(documents);
          } else {
            reject(new Error(`Query failed: ${JSON.stringify(response)}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Check user document
 */
async function checkUserDocument(idToken) {
  console.log('👤 Checking users collection...');
  
  try {
    const whereClause = {
      fieldFilter: {
        field: { fieldPath: 'email' },
        op: 'EQUAL',
        value: { stringValue: TEST_EMAIL }
      }
    };
    
    const documents = await queryCollection(idToken, 'users', whereClause);
    
    if (documents.length > 0) {
      const userDoc = documents[0];
      const fields = userDoc.fields || {};
      
      console.log('✅ User document found:');
      console.log(`   Email: ${fields.email?.stringValue || 'N/A'}`);
      console.log(`   Organization ID: ${fields.organizationId?.stringValue || 'N/A'}`);
      console.log(`   Role: ${fields.role?.stringValue || 'N/A'}`);
      
      return fields.organizationId?.stringValue;
    } else {
      console.log('⚠️ No user document found');
      return null;
    }
  } catch (error) {
    console.log('❌ Error checking user document:', error.message);
    return null;
  }
}

/**
 * Check team member records
 */
async function checkTeamMemberRecords(idToken) {
  console.log('');
  console.log('👥 Checking teamMembers collection...');
  
  try {
    const whereClause = {
      fieldFilter: {
        field: { fieldPath: 'email' },
        op: 'EQUAL',
        value: { stringValue: TEST_EMAIL }
      }
    };
    
    const documents = await queryCollection(idToken, 'teamMembers', whereClause);
    
    if (documents.length > 0) {
      console.log(`✅ Found ${documents.length} team member record(s):`);
      
      const organizations = [];
      documents.forEach((doc, index) => {
        const fields = doc.fields || {};
        const orgId = fields.organizationId?.stringValue;
        
        console.log(`   Record ${index + 1}:`);
        console.log(`     Email: ${fields.email?.stringValue || 'N/A'}`);
        console.log(`     Organization: ${orgId || 'N/A'}`);
        console.log(`     Role: ${fields.role?.stringValue || 'N/A'}`);
        
        if (orgId) organizations.push(orgId);
      });
      
      return organizations;
    } else {
      console.log('⚠️ No team member records found');
      return [];
    }
  } catch (error) {
    console.log('❌ Error checking team member records:', error.message);
    return [];
  }
}

/**
 * Check projects for organizations
 */
async function checkProjectsForOrganizations(idToken, organizations) {
  console.log('');
  console.log('📁 Checking projects for organizations...');
  
  for (const orgId of organizations) {
    console.log(`   🔍 Organization: ${orgId}`);
    
    try {
      const whereClause = {
        fieldFilter: {
          field: { fieldPath: 'organizationId' },
          op: 'EQUAL',
          value: { stringValue: orgId }
        }
      };
      
      const documents = await queryCollection(idToken, 'projects', whereClause);
      console.log(`     Projects: ${documents.length} found`);
      
      // Check Network Delivery Bibles
      const bibleDocuments = await queryCollection(idToken, 'networkDeliveryBibles', whereClause);
      console.log(`     Network Delivery Bibles: ${bibleDocuments.length} found`);
      
    } catch (error) {
      console.log(`     ❌ Error checking projects for ${orgId}:`, error.message);
    }
  }
}

/**
 * Main verification function
 */
async function verifyDualOrgAccess() {
  try {
    console.log('🔐 Getting authentication token...');
    const idToken = await getAuthToken();
    console.log('✅ Authentication successful');
    console.log('');
    
    // Check user document
    const userOrgId = await checkUserDocument(idToken);
    
    // Check team member records
    const teamMemberOrgs = await checkTeamMemberRecords(idToken);
    
    // Combine all organizations
    const allOrgs = new Set();
    if (userOrgId) allOrgs.add(userOrgId);
    teamMemberOrgs.forEach(org => allOrgs.add(org));
    
    const uniqueOrgs = Array.from(allOrgs);
    
    console.log('');
    console.log('📊 Organization Access Summary:');
    console.log(`   Total Organizations: ${uniqueOrgs.length}`);
    uniqueOrgs.forEach((org, index) => {
      console.log(`   ${index + 1}. ${org}`);
    });
    
    // Check expected organizations
    const expectedOrgs = ['enterprise-media-org', 'enterprise-org-001'];
    console.log('');
    console.log('🎯 Expected vs Actual:');
    expectedOrgs.forEach(expectedOrg => {
      const hasAccess = uniqueOrgs.includes(expectedOrg);
      console.log(`   ${expectedOrg}: ${hasAccess ? '✅ FOUND' : '❌ MISSING'}`);
    });
    
    // Check projects for all organizations
    if (uniqueOrgs.length > 0) {
      await checkProjectsForOrganizations(idToken, uniqueOrgs);
    }
    
    console.log('');
    console.log('🎉 Dual organization access verification completed!');
    
    if (uniqueOrgs.length >= 2) {
      console.log('✅ User has access to multiple organizations as expected');
    } else {
      console.log('⚠️ User may not have access to multiple organizations');
    }
    
  } catch (error) {
    console.log('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Run verification
verifyDualOrgAccess();
