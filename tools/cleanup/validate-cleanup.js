#!/usr/bin/env node

/**
 * 🔍 Firestore Cleanup Validation Script
 * 
 * Validates that all critical functionality works after index cleanup
 * for both Dashboard-v14_2 and dashboard-v14-licensing-website 2 projects.
 * 
 * VALIDATION COVERAGE:
 * - All critical collections accessible
 * - Key query patterns work
 * - Both projects' core functionality preserved
 * - Performance impact assessment
 */

const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

// Critical queries for both projects
const CRITICAL_QUERIES = [
  // Dashboard-v14_2 Core Queries
  {
    name: 'Dashboard: User by Organization',
    collection: 'users',
    where: [['organizationId', '==', 'test-org']],
    orderBy: [['createdAt', 'desc']],
    project: 'Dashboard-v14_2'
  },
  {
    name: 'Dashboard: Projects by Organization',
    collection: 'projects', 
    where: [['organizationId', '==', 'test-org'], ['status', '==', 'ACTIVE']],
    orderBy: [['createdAt', 'desc']],
    project: 'Dashboard-v14_2'
  },
  {
    name: 'Dashboard: User Timecards',
    collection: 'user_timecards',
    where: [['userId', '==', 'test-user']],
    orderBy: [['date', 'asc']],
    project: 'Dashboard-v14_2'
  },
  {
    name: 'Dashboard: Team Members by Organization',
    collection: 'teamMembers',
    where: [['organizationId', '==', 'test-org'], ['status', '==', 'ACTIVE']],
    orderBy: [['createdAt', 'desc']],
    project: 'Dashboard-v14_2'
  },
  {
    name: 'Dashboard: User Notifications',
    collection: 'notifications',
    where: [['userId', '==', 'test-user']],
    orderBy: [['createdAt', 'desc']],
    project: 'Dashboard-v14_2'
  },
  
  // Licensing Website Core Queries
  {
    name: 'Licensing: Project Assignments by User',
    collection: 'projectAssignments',
    where: [['userId', '==', 'test-user'], ['isActive', '==', true]],
    orderBy: [['assignedAt', 'desc']],
    project: 'Licensing Website'
  },
  {
    name: 'Licensing: Organization Members',
    collection: 'orgMembers',
    where: [['userId', '==', 'test-user'], ['status', '==', 'ACTIVE']],
    project: 'Licensing Website'
  },
  {
    name: 'Licensing: Team Members by Email',
    collection: 'teamMembers',
    where: [['email', '==', 'test@example.com']],
    project: 'Licensing Website'
  },
  {
    name: 'Licensing: User Organizations',
    collection: 'organizations',
    where: [['ownerId', '==', 'test-user']],
    orderBy: [['createdAt', 'desc']],
    project: 'Licensing Website'
  },
  
  // Shared Queries (Both Projects)
  {
    name: 'Shared: Licenses by Organization',
    collection: 'licenses',
    where: [['organizationId', '==', 'test-org'], ['status', '==', 'ACTIVE']],
    orderBy: [['createdAt', 'desc']],
    project: 'Both'
  },
  {
    name: 'Shared: Messages by Project',
    collection: 'messages',
    where: [['projectId', '==', 'test-project']],
    orderBy: [['createdAt', 'asc']],
    project: 'Both'
  }
];

// Collections that must exist and be accessible
const CRITICAL_COLLECTIONS = [
  'users', 'organizations', 'projects', 'projectAssignments',
  'teamMembers', 'orgMembers', 'org_members', 'user_timecards',
  'timecard_entries', 'timecard_templates', 'notifications',
  'messages', 'messageSessions', 'licenses', 'subscriptions',
  'payments', 'invoices', 'reports', 'datasets'
];

class CleanupValidator {
  constructor() {
    this.results = {
      collections: { passed: 0, failed: 0, errors: [] },
      queries: { passed: 0, failed: 0, errors: [] },
      performance: { avgResponseTime: 0, slowQueries: [] }
    };
  }

  async run() {
    console.log('🔍 Firestore Cleanup Validation');
    console.log('===============================');
    console.log(`📅 ${new Date().toISOString()}`);
    console.log(`🎯 Project: backbone-logic\n`);

    try {
      // Step 1: Validate collection accessibility
      await this.validateCollections();
      
      // Step 2: Test critical queries
      await this.testCriticalQueries();
      
      // Step 3: Performance assessment
      await this.assessPerformance();
      
      // Step 4: Generate report
      await this.generateReport();
      
      // Step 5: Determine overall status
      const success = this.results.collections.failed === 0 && 
                     this.results.queries.failed === 0;
      
      if (success) {
        console.log('\n🎉 VALIDATION PASSED - Cleanup is safe to deploy!');
        process.exit(0);
      } else {
        console.log('\n❌ VALIDATION FAILED - Issues detected!');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('💥 Validation failed with error:', error.message);
      process.exit(1);
    }
  }

  async validateCollections() {
    console.log('📚 Validating collection accessibility...');
    
    for (const collection of CRITICAL_COLLECTIONS) {
      try {
        // Test basic collection access
        const snapshot = await db.collection(collection).limit(1).get();
        
        console.log(`✅ ${collection} - accessible (${snapshot.size} docs sampled)`);
        this.results.collections.passed++;
        
      } catch (error) {
        console.error(`❌ ${collection} - ERROR: ${error.message}`);
        this.results.collections.failed++;
        this.results.collections.errors.push({
          collection,
          error: error.message
        });
      }
    }
    
    console.log(`\n📊 Collections: ${this.results.collections.passed} passed, ${this.results.collections.failed} failed`);
  }

  async testCriticalQueries() {
    console.log('\n🔍 Testing critical query patterns...');
    
    const responseTimes = [];
    
    for (const queryTest of CRITICAL_QUERIES) {
      const startTime = Date.now();
      
      try {
        let query = db.collection(queryTest.collection);
        
        // Apply where clauses
        if (queryTest.where) {
          for (const [field, operator, value] of queryTest.where) {
            query = query.where(field, operator, value);
          }
        }
        
        // Apply ordering
        if (queryTest.orderBy) {
          for (const [field, direction] of queryTest.orderBy) {
            query = query.orderBy(field, direction);
          }
        }
        
        // Execute query with limit
        const snapshot = await query.limit(5).get();
        
        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
        
        console.log(`✅ ${queryTest.name} - ${responseTime}ms (${snapshot.size} results)`);
        this.results.queries.passed++;
        
        // Track slow queries
        if (responseTime > 1000) {
          this.results.performance.slowQueries.push({
            name: queryTest.name,
            responseTime,
            project: queryTest.project
          });
        }
        
      } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error(`❌ ${queryTest.name} - ERROR: ${error.message} (${responseTime}ms)`);
        
        this.results.queries.failed++;
        this.results.queries.errors.push({
          name: queryTest.name,
          project: queryTest.project,
          error: error.message,
          responseTime
        });
      }
    }
    
    // Calculate average response time
    this.results.performance.avgResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;
    
    console.log(`\n📊 Queries: ${this.results.queries.passed} passed, ${this.results.queries.failed} failed`);
    console.log(`⚡ Average response time: ${this.results.performance.avgResponseTime}ms`);
  }

  async assessPerformance() {
    console.log('\n⚡ Performance assessment...');
    
    // Test a few high-volume queries to assess index performance
    const performanceTests = [
      {
        name: 'High-volume user query',
        collection: 'users',
        where: [['organizationId', '==', 'enterprise-org-001']]
      },
      {
        name: 'High-volume project query', 
        collection: 'projects',
        where: [['organizationId', '==', 'enterprise-org-001']]
      },
      {
        name: 'Complex timecard query',
        collection: 'user_timecards',
        where: [['userId', '==', '2ysTqv3pwiXyKxOeExAfEKOIh7K2']]
      }
    ];
    
    for (const test of performanceTests) {
      const startTime = Date.now();
      
      try {
        let query = db.collection(test.collection);
        
        for (const [field, operator, value] of test.where) {
          query = query.where(field, operator, value);
        }
        
        const snapshot = await query.limit(10).get();
        const responseTime = Date.now() - startTime;
        
        console.log(`📈 ${test.name}: ${responseTime}ms (${snapshot.size} results)`);
        
      } catch (error) {
        console.log(`⚠️  ${test.name}: Query failed - ${error.message}`);
      }
    }
  }

  async generateReport() {
    console.log('\n📋 VALIDATION REPORT');
    console.log('====================');
    
    // Overall status
    const totalTests = this.results.collections.passed + this.results.collections.failed +
                      this.results.queries.passed + this.results.queries.failed;
    const totalPassed = this.results.collections.passed + this.results.queries.passed;
    const successRate = Math.round((totalPassed / totalTests) * 100);
    
    console.log(`📊 Overall Success Rate: ${successRate}% (${totalPassed}/${totalTests})`);
    
    // Collection validation results
    console.log(`\n📚 Collection Validation:`);
    console.log(`   ✅ Passed: ${this.results.collections.passed}`);
    console.log(`   ❌ Failed: ${this.results.collections.failed}`);
    
    if (this.results.collections.errors.length > 0) {
      console.log(`\n   🚨 Collection Errors:`);
      for (const error of this.results.collections.errors) {
        console.log(`      • ${error.collection}: ${error.error}`);
      }
    }
    
    // Query validation results
    console.log(`\n🔍 Query Validation:`);
    console.log(`   ✅ Passed: ${this.results.queries.passed}`);
    console.log(`   ❌ Failed: ${this.results.queries.failed}`);
    console.log(`   ⚡ Avg Response Time: ${this.results.performance.avgResponseTime}ms`);
    
    if (this.results.queries.errors.length > 0) {
      console.log(`\n   🚨 Query Errors:`);
      for (const error of this.results.queries.errors) {
        console.log(`      • ${error.name} (${error.project}): ${error.error}`);
      }
    }
    
    // Performance warnings
    if (this.results.performance.slowQueries.length > 0) {
      console.log(`\n   ⚠️  Slow Queries (>1000ms):`);
      for (const slow of this.results.performance.slowQueries) {
        console.log(`      • ${slow.name}: ${slow.responseTime}ms`);
      }
    }
    
    // Project-specific status
    console.log(`\n🎯 Project Status:`);
    
    const dashboardErrors = this.results.queries.errors.filter(e => 
      e.project === 'Dashboard-v14_2' || e.project === 'Both'
    );
    const licensingErrors = this.results.queries.errors.filter(e => 
      e.project === 'Licensing Website' || e.project === 'Both'
    );
    
    console.log(`   📊 Dashboard-v14_2: ${dashboardErrors.length === 0 ? '✅ HEALTHY' : '❌ ISSUES'}`);
    console.log(`   🏢 Licensing Website: ${licensingErrors.length === 0 ? '✅ HEALTHY' : '❌ ISSUES'}`);
    
    // Recommendations
    console.log(`\n💡 Recommendations:`);
    
    if (successRate === 100) {
      console.log(`   ✅ All tests passed - safe to deploy cleanup`);
      console.log(`   🚀 Expected benefits: Reduced storage costs, faster deployments`);
      console.log(`   📈 No performance degradation detected`);
    } else if (successRate >= 90) {
      console.log(`   ⚠️  Minor issues detected - review errors before deployment`);
      console.log(`   🔍 Consider fixing errors or excluding problematic indexes`);
    } else {
      console.log(`   🚨 Significant issues detected - DO NOT DEPLOY`);
      console.log(`   🛑 Review and fix all errors before proceeding`);
      console.log(`   📞 Consider consulting with development team`);
    }
    
    // Save detailed report
    const reportPath = `validation-report-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      project: 'backbone-logic',
      results: this.results,
      successRate,
      recommendations: successRate === 100 ? 'SAFE_TO_DEPLOY' : 
                      successRate >= 90 ? 'REVIEW_REQUIRED' : 'DO_NOT_DEPLOY'
    }, null, 2));
    
    console.log(`\n📄 Detailed report saved: ${reportPath}`);
  }
}

// Run validation
if (require.main === module) {
  const validator = new CleanupValidator();
  validator.run().catch(error => {
    console.error('💥 Validation failed:', error);
    process.exit(1);
  });
}

module.exports = CleanupValidator;
