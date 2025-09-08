#!/usr/bin/env node

/**
 * FIRESTORE COLLECTION SCANNER
 * 
 * Automatically scans both Dashboard and Licensing projects for Firestore collection usage
 * and generates comprehensive security rules to prevent permission issues.
 * 
 * Usage: node collection-scanner.js [--generate-rules] [--deploy]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FirestoreCollectionScanner {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.dashboardPath = path.join(this.projectRoot, 'Dashboard-v14_2');
    this.licensingPath = path.join(this.projectRoot, 'dashboard-v14-licensing-website 2');
    this.rulesPath = path.join(this.dashboardPath, 'firestore-comprehensive.rules');
    
    this.collections = new Set();
    this.collectionSources = new Map(); // Track where each collection is used
    this.lastScanTime = new Date();
  }

  /**
   * Main scanning function - discovers all collections across both projects
   */
  async scanAllCollections() {
    console.log('🔍 Starting comprehensive Firestore collection scan...');
    
    // Scan both projects
    await this.scanProject(this.dashboardPath, 'Dashboard-v14_2');
    await this.scanProject(this.licensingPath, 'Licensing Website');
    
    console.log(`✅ Scan complete! Found ${this.collections.size} unique collections`);
    
    return {
      collections: Array.from(this.collections).sort(),
      sources: Object.fromEntries(this.collectionSources),
      scanTime: this.lastScanTime,
      totalCollections: this.collections.size
    };
  }

  /**
   * Scan a specific project directory for collection usage
   */
  async scanProject(projectPath, projectName) {
    if (!fs.existsSync(projectPath)) {
      console.warn(`⚠️  Project path not found: ${projectPath}`);
      return;
    }

    console.log(`📂 Scanning ${projectName}...`);
    
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const files = this.findFiles(projectPath, extensions);
    
    let collectionsFound = 0;
    
    for (const file of files) {
      const collections = this.extractCollectionsFromFile(file);
      collections.forEach(collection => {
        this.collections.add(collection);
        
        // Track source information
        if (!this.collectionSources.has(collection)) {
          this.collectionSources.set(collection, []);
        }
        this.collectionSources.get(collection).push({
          project: projectName,
          file: path.relative(this.projectRoot, file)
        });
        
        collectionsFound++;
      });
    }
    
    console.log(`   Found ${collectionsFound} collection references in ${files.length} files`);
  }

  /**
   * Recursively find all files with specified extensions
   */
  findFiles(dir, extensions, files = []) {
    if (!fs.existsSync(dir)) return files;
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        
        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            // Skip node_modules, .git, and other irrelevant directories
            const skipDirs = [
              'node_modules', '.git', 'dist', 'build', 'public', 
              'logs', 'tmp', 'temp', '.next', '.nuxt', 'coverage',
              'airflow', 'venv', '__pycache__', '.pytest_cache'
            ];
            
            if (!skipDirs.includes(item)) {
              this.findFiles(fullPath, extensions, files);
            }
          } else if (extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        } catch (statError) {
          // Skip files/directories that can't be accessed (broken symlinks, permission issues)
          console.warn(`⚠️  Skipping inaccessible path: ${fullPath} (${statError.code})`);
          continue;
        }
      }
    } catch (readError) {
      console.warn(`⚠️  Could not read directory: ${dir} (${readError.code})`);
    }
    
    return files;
  }

  /**
   * Extract collection names from a single file
   */
  extractCollectionsFromFile(filePath) {
    const collections = new Set();
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Multiple patterns to catch different collection usage styles
      const patterns = [
        /collection\(['"`]([^'"`]+)['"`]\)/g,           // collection('name')
        /collection\(\s*['"`]([^'"`]+)['"`]\s*\)/g,     // collection( 'name' )
        /\.collection\(['"`]([^'"`]+)['"`]\)/g,         // .collection('name')
        /firestore\(\)\.collection\(['"`]([^'"`]+)['"`]\)/g, // firestore().collection('name')
        /db\.collection\(['"`]([^'"`]+)['"`]\)/g,       // db.collection('name')
      ];
      
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const collectionName = match[1];
          
          // Filter out obvious non-collection names
          if (this.isValidCollectionName(collectionName)) {
            collections.add(collectionName);
          }
        }
      });
      
    } catch (error) {
      console.warn(`⚠️  Error reading file ${filePath}: ${error.message}`);
    }
    
    return collections;
  }

  /**
   * Validate if a string is likely a valid collection name
   */
  isValidCollectionName(name) {
    // Filter out obvious non-collection names
    const invalidPatterns = [
      /^[A-Z_]+$/, // ALL_CAPS constants
      /\$\{/, // Template literals
      /\s/, // Contains spaces
      /^(true|false|null|undefined)$/, // Boolean/null values
      /^[0-9]+$/, // Pure numbers
      /^(get|post|put|delete|patch)$/i, // HTTP methods
      /^(string|number|boolean|object|array)$/i, // Type names
    ];
    
    return name.length > 0 && 
           name.length < 100 && 
           !invalidPatterns.some(pattern => pattern.test(name));
  }

  /**
   * Generate comprehensive Firestore security rules
   */
  generateFirestoreRules(collections) {
    console.log('🛡️  Generating comprehensive Firestore security rules...');
    
    const rules = this.buildRulesTemplate(collections);
    
    // Write to rules file
    fs.writeFileSync(this.rulesPath, rules, 'utf8');
    console.log(`✅ Rules written to: ${this.rulesPath}`);
    
    return rules;
  }

  /**
   * Build the complete Firestore rules template
   */
  buildRulesTemplate(collections) {
    const timestamp = new Date().toISOString();
    
    return `rules_version = '2';

// ============================================================================
// BACKBONE v14.2 COMPREHENSIVE FIRESTORE SECURITY RULES
// ============================================================================
// 
// Auto-generated on: ${timestamp}
// Collections covered: ${collections.length}
// 
// This file is automatically generated by the collection scanner.
// DO NOT EDIT MANUALLY - changes will be overwritten.
// 
// To regenerate: node tools/firestore-automation/collection-scanner.js --generate-rules
// ============================================================================

service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserId() {
      return request.auth.uid;
    }
    
    function getUserEmail() {
      return request.auth.token.email;
    }
    
    function isSuperAdmin() {
      return isAuthenticated() && (
        getUserEmail() in ['admin@backbone.com', 'support@backbone.com'] ||
        hasAnyRole(['SUPER_ADMIN', 'SYSTEM_ADMIN'])
      );
    }
    
    function hasRole(role) {
      return isAuthenticated() && 
             request.auth.token.role == role;
    }
    
    function hasAnyRole(roles) {
      return isAuthenticated() && 
             request.auth.token.role in roles;
    }
    
    function canAccessOrganization(orgId) {
      return isAuthenticated() && (
        request.auth.token.organizationId == orgId ||
        request.auth.token.organizations != null && 
        orgId in request.auth.token.organizations ||
        isSuperAdmin()
      );
    }
    
    function isOwner() {
      return hasAnyRole(['OWNER', 'ADMIN']);
    }
    
    function isAdmin() {
      return hasAnyRole(['ADMIN', 'OWNER']);
    }
    
    function isEnterpriseUser() {
      return isAuthenticated() && (
        getUserEmail().matches('.*@enterprisemedia.com') ||
        hasAnyRole(['ENTERPRISE_USER', 'ENTERPRISE_ADMIN'])
      );
    }

    // ============================================================================
    // AUTO-GENERATED COLLECTION RULES
    // ============================================================================
    
${this.generateCollectionRules(collections)}
    
    // ============================================================================
    // FALLBACK RULES
    // ============================================================================
    
    // Allow authenticated users to access any collection not explicitly covered
    // This ensures the app doesn't break if new collections are added
    match /{document=**} {
      allow read, write: if isAuthenticated() && (
        isSuperAdmin() ||
        isEnterpriseUser() ||
        isAuthenticated()
      );
    }
  }
}`;
  }

  /**
   * Generate rules for all discovered collections
   */
  generateCollectionRules(collections) {
    const sortedCollections = collections.sort();
    let rules = '';
    
    // Group collections by category for better organization
    const categories = this.categorizeCollections(sortedCollections);
    
    Object.entries(categories).forEach(([category, colls]) => {
      rules += `    // ${category.toUpperCase()} COLLECTIONS\n`;
      
      colls.forEach(collection => {
        rules += this.generateSingleCollectionRule(collection);
      });
      
      rules += '\n';
    });
    
    return rules;
  }

  /**
   * Categorize collections for better organization
   */
  categorizeCollections(collections) {
    const categories = {
      'System & Health': [],
      'User & Organization': [],
      'Project Management': [],
      'Session & Workflow': [],
      'Media & Assets': [],
      'Communication': [],
      'Financial': [],
      'Production': [],
      'Quality Control': [],
      'AI & Automation': [],
      'Network & Infrastructure': [],
      'Timecard & Scheduling': [],
      'Testing & Development': [],
      'Other': []
    };
    
    collections.forEach(collection => {
      const category = this.determineCollectionCategory(collection);
      categories[category].push(collection);
    });
    
    // Remove empty categories
    Object.keys(categories).forEach(key => {
      if (categories[key].length === 0) {
        delete categories[key];
      }
    });
    
    return categories;
  }

  /**
   * Determine the category for a collection based on its name
   */
  determineCollectionCategory(collection) {
    const patterns = {
      'System & Health': /^(_health|health|cleanupLogs|migrationResults|lifecycleRules|setupProfiles)$/,
      'User & Organization': /^(users|userSettings|userPreferences|userMemoryProfiles|organizations|orgMembers|teamMembers)$/,
      'Project Management': /^(projects|projectTeamMembers|projectDatasets|projectActivities|projectAssignments|projectRoles|projectRoleAssignments)$/,
      'Session & Workflow': /^(sessions|sessionArchives|sessionAssignments|sessionFiles|sessionFileTags|sessionRoles|sessionTags|sessionWorkflows|workflows|workflowAssignments|workflowDiagrams|unifiedSessionAssignments|unifiedSessionSteps|unifiedStepProgressions|unifiedWorkflowInstances)$/,
      'Media & Assets': /^(assets|mediaFiles|mediaIndexes|edl_data|entityLocations)$/,
      'Communication': /^(chats|messages|messageSessions|collaborationInvitations|notes|brainChatMessages|brainChatSessions)$/,
      'Financial': /^(budgets|clients|contacts|contactGroups|invoices|invoiceItems|payments|subscriptions|transactions|licenses|licenseValidations)$/,
      'Production': /^(callsheets|callSheets|dailyCallSheetRecords|productionCrewMembers|productionDepartments|productionRoles|productionSessions|productionStages|productionTasks|productionTaskAssignees|postProductionTasks|posts|stages)$/,
      'Quality Control': /^(qc|qcChecklistItems|qcReports|qcSessions|qcStatuses|reviews|reviewApprovals|reviewAssignments|reviewNotes|reviewSessions)$/,
      'AI & Automation': /^(agents|aiAgents|automationExecutions|brainSessions|conversationPatterns|domainKnowledge|memorySlots)$/,
      'Network & Infrastructure': /^(networks|networkIP|networkIPAssignments|networkIPRanges|ipRanges|servers|networkDeliveryBibles)$/,
      'Timecard & Scheduling': /^(timecard_approvals|timecard_configurations|timecard_entries|timecard_template_assignments|timecard_templates|timecards|user_timecards|session_timecard_links|schedulerEvents|schedulerTasks)$/,
      'Testing & Development': /^(test|testCollection|temp|demoSessions)$/,
    };
    
    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern.test(collection)) {
        return category;
      }
    }
    
    return 'Other';
  }

  /**
   * Generate security rule for a single collection
   */
  generateSingleCollectionRule(collection) {
    // Special cases for certain collections
    const specialRules = this.getSpecialRules(collection);
    if (specialRules) {
      return specialRules;
    }
    
    // Standard rule template
    return `    match /${collection}/{docId} {
      allow read, write: if isAuthenticated() && (
        canAccessOrganization(resource.data.organizationId) ||
        isSuperAdmin() ||
        isEnterpriseUser() ||
        isAuthenticated()
      );
    }
    
`;
  }

  /**
   * Get special rules for collections that need custom logic
   */
  getSpecialRules(collection) {
    const specialCases = {
      'users': `    match /users/{userId} {
      allow read, write: if isAuthenticated() && (
        userId == getUserId() ||
        isSuperAdmin() ||
        isAdmin()
      );
    }
    
`,
      'userSettings': `    match /userSettings/{userId} {
      allow read, write: if isAuthenticated() && (
        userId == getUserId() ||
        isSuperAdmin()
      );
    }
    
`,
      'userPreferences': `    match /userPreferences/{userId} {
      allow read, write: if isAuthenticated() && (
        userId == getUserId() ||
        isSuperAdmin()
      );
    }
    
`,
      'user_timecards': `    match /user_timecards/{timecardId} {
      allow read, write: if isAuthenticated() && (
        resource.data.userId == getUserId() ||
        canAccessOrganization(resource.data.organizationId) ||
        isSuperAdmin()
      );
    }
    
`,
      'test': `    match /test/{testId} {
      allow read, write: if isAuthenticated();
    }
    
`,
      'testCollection': `    match /testCollection/{testId} {
      allow read, write: if isAuthenticated();
    }
    
`,
      'temp': `    match /temp/{tempId} {
      allow read, write: if isAuthenticated();
    }
    
`,
      '_health': `    match /_health/{docId} {
      allow read, write: if isAuthenticated();
    }
    
`,
      'health': `    match /health/{docId} {
      allow read, write: if isAuthenticated();
    }
    
`,
    };
    
    return specialCases[collection];
  }

  /**
   * Deploy the rules to Firebase
   */
  async deployRules() {
    console.log('🚀 Deploying Firestore rules to Firebase...');
    
    try {
      const result = execSync('firebase deploy --only firestore:rules --project backbone-logic', {
        cwd: this.dashboardPath,
        encoding: 'utf8'
      });
      
      console.log('✅ Rules deployed successfully!');
      console.log(result);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to deploy rules:', error.message);
      return false;
    }
  }

  /**
   * Generate a comprehensive report
   */
  generateReport(scanResults) {
    const report = {
      scanTime: scanResults.scanTime,
      totalCollections: scanResults.totalCollections,
      collections: scanResults.collections,
      sources: scanResults.sources,
      categories: this.categorizeCollections(scanResults.collections),
      summary: {
        dashboardCollections: 0,
        licensingCollections: 0,
        sharedCollections: 0
      }
    };
    
    // Calculate summary statistics
    scanResults.collections.forEach(collection => {
      const sources = scanResults.sources[collection] || [];
      const inDashboard = sources.some(s => s.project === 'Dashboard-v14_2');
      const inLicensing = sources.some(s => s.project === 'Licensing Website');
      
      if (inDashboard && inLicensing) {
        report.summary.sharedCollections++;
      } else if (inDashboard) {
        report.summary.dashboardCollections++;
      } else if (inLicensing) {
        report.summary.licensingCollections++;
      }
    });
    
    return report;
  }

  /**
   * Save scan results and report
   */
  saveResults(scanResults, report) {
    const outputDir = path.join(this.projectRoot, 'tools/firestore-automation/reports');
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save detailed scan results
    const resultsFile = path.join(outputDir, `collection-scan-${timestamp}.json`);
    fs.writeFileSync(resultsFile, JSON.stringify(scanResults, null, 2));
    
    // Save human-readable report
    const reportFile = path.join(outputDir, `collection-report-${timestamp}.md`);
    const reportContent = this.formatReportAsMarkdown(report);
    fs.writeFileSync(reportFile, reportContent);
    
    // Save latest results (overwrite)
    const latestResultsFile = path.join(outputDir, 'latest-scan.json');
    fs.writeFileSync(latestResultsFile, JSON.stringify(scanResults, null, 2));
    
    const latestReportFile = path.join(outputDir, 'latest-report.md');
    fs.writeFileSync(latestReportFile, reportContent);
    
    console.log(`📊 Results saved to: ${outputDir}`);
    
    return { resultsFile, reportFile };
  }

  /**
   * Format report as Markdown
   */
  formatReportAsMarkdown(report) {
    return `# Firestore Collection Scan Report

**Generated:** ${report.scanTime.toISOString()}
**Total Collections:** ${report.totalCollections}

## Summary

- **Dashboard-only Collections:** ${report.summary.dashboardCollections}
- **Licensing-only Collections:** ${report.summary.licensingCollections}
- **Shared Collections:** ${report.summary.sharedCollections}

## Collections by Category

${Object.entries(report.categories).map(([category, collections]) => 
  `### ${category}\n${collections.map(c => `- \`${c}\``).join('\n')}`
).join('\n\n')}

## All Collections

${report.collections.map(c => `- \`${c}\``).join('\n')}

## Collection Sources

${Object.entries(report.sources).map(([collection, sources]) => 
  `### \`${collection}\`\n${sources.map(s => `- **${s.project}**: \`${s.file}\``).join('\n')}`
).join('\n\n')}
`;
  }
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const generateRules = args.includes('--generate-rules');
  const deploy = args.includes('--deploy');
  const verbose = args.includes('--verbose');
  
  const scanner = new FirestoreCollectionScanner();
  
  try {
    // Scan for collections
    const scanResults = await scanner.scanAllCollections();
    
    if (verbose) {
      console.log('\n📋 Discovered Collections:');
      scanResults.collections.forEach(c => console.log(`  - ${c}`));
    }
    
    // Generate report
    const report = scanner.generateReport(scanResults);
    const { resultsFile, reportFile } = scanner.saveResults(scanResults, report);
    
    console.log(`\n📊 Summary:`);
    console.log(`  - Total Collections: ${report.totalCollections}`);
    console.log(`  - Dashboard-only: ${report.summary.dashboardCollections}`);
    console.log(`  - Licensing-only: ${report.summary.licensingCollections}`);
    console.log(`  - Shared: ${report.summary.sharedCollections}`);
    
    // Generate rules if requested
    if (generateRules) {
      scanner.generateFirestoreRules(scanResults.collections);
    }
    
    // Deploy if requested
    if (deploy && generateRules) {
      await scanner.deployRules();
    }
    
    console.log('\n✅ Collection scan complete!');
    console.log(`📄 Report: ${reportFile}`);
    console.log(`📊 Data: ${resultsFile}`);
    
  } catch (error) {
    console.error('❌ Error during scan:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = FirestoreCollectionScanner;
