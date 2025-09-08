#!/usr/bin/env node

/**
 * COMPREHENSIVE FIREBASE SCANNER
 * 
 * Automatically scans both Dashboard and Licensing projects for:
 * - Firestore Collections (for security rules)
 * - Firebase Functions (for deployment)
 * - Firestore Indexes (for query optimization)
 * 
 * Usage: node firebase-scanner.js [--generate-all] [--deploy]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import the existing collection scanner
const FirestoreCollectionScanner = require('./collection-scanner');

class ComprehensiveFirebaseScanner extends FirestoreCollectionScanner {
  constructor() {
    super();
    
    // Additional properties for functions and indexes
    this.functions = new Map(); // functionName -> { file, exports, triggers }
    this.indexes = new Map(); // collection -> [{ fields, type }]
    this.queries = new Map(); // collection -> [{ fields, operations }]
    
    // Firebase Functions paths
    this.functionsPath = path.join(this.dashboardPath, 'functions');
    this.functionsIndexPath = path.join(this.functionsPath, 'src/index.ts');
    
    // Firestore indexes paths
    this.indexesPath = path.join(this.dashboardPath, 'firestore-comprehensive.indexes.json');
  }

  /**
   * Main scanning function - discovers collections, functions, and indexes
   */
  async scanAllFirebaseComponents() {
    console.log('🔍 Starting comprehensive Firebase component scan...');
    
    // Scan collections (from parent class)
    const collectionResults = await this.scanAllCollections();
    
    // Scan Firebase Functions
    const functionResults = await this.scanFirebaseFunctions();
    
    // Scan Firestore queries to determine needed indexes
    const queryResults = await this.scanFirestoreQueries();
    
    // Analyze existing indexes
    const indexResults = await this.analyzeExistingIndexes();
    
    console.log(`✅ Comprehensive scan complete!`);
    console.log(`   Collections: ${collectionResults.collections.length}`);
    console.log(`   Functions: ${functionResults.functions.length}`);
    console.log(`   Queries: ${queryResults.totalQueries}`);
    console.log(`   Indexes: ${indexResults.totalIndexes}`);
    
    return {
      collections: collectionResults,
      functions: functionResults,
      queries: queryResults,
      indexes: indexResults,
      scanTime: new Date(),
      summary: {
        totalCollections: collectionResults.collections.length,
        totalFunctions: functionResults.functions.length,
        totalQueries: queryResults.totalQueries,
        totalIndexes: indexResults.totalIndexes,
        missingIndexes: queryResults.missingIndexes || 0
      }
    };
  }

  /**
   * Scan Firebase Functions
   */
  async scanFirebaseFunctions() {
    console.log('🔥 Scanning Firebase Functions...');
    
    const functions = [];
    const functionSources = new Map();
    
    if (!fs.existsSync(this.functionsPath)) {
      console.warn('⚠️  Firebase Functions directory not found');
      return { functions: [], sources: {} };
    }
    
    // Scan the main functions index file
    if (fs.existsSync(this.functionsIndexPath)) {
      const indexFunctions = this.extractFunctionsFromFile(this.functionsIndexPath);
      indexFunctions.forEach(func => {
        functions.push(func);
        functionSources.set(func.name, [{
          file: path.relative(this.projectRoot, this.functionsIndexPath),
          type: func.type,
          trigger: func.trigger
        }]);
      });
    }
    
    // Scan additional function files in src directory
    const srcPath = path.join(this.functionsPath, 'src');
    if (fs.existsSync(srcPath)) {
      const functionFiles = this.findFiles(srcPath, ['.ts', '.js']);
      
      for (const file of functionFiles) {
        if (file === this.functionsIndexPath) continue; // Already scanned
        
        const fileFunctions = this.extractFunctionsFromFile(file);
        fileFunctions.forEach(func => {
          if (!functions.find(f => f.name === func.name)) {
            functions.push(func);
            
            if (!functionSources.has(func.name)) {
              functionSources.set(func.name, []);
            }
            functionSources.get(func.name).push({
              file: path.relative(this.projectRoot, file),
              type: func.type,
              trigger: func.trigger
            });
          }
        });
      }
    }
    
    console.log(`   Found ${functions.length} Firebase Functions`);
    
    return {
      functions,
      sources: Object.fromEntries(functionSources),
      totalFunctions: functions.length
    };
  }

  /**
   * Extract Firebase Functions from a file
   */
  extractFunctionsFromFile(filePath) {
    const functions = [];
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Patterns to detect Firebase Functions
      const patterns = [
        // exports.functionName = functions.https.onRequest(...)
        /exports\.(\w+)\s*=\s*functions\.(\w+)\.(\w+)\(/g,
        // export const functionName = functions.https.onRequest(...)
        /export\s+const\s+(\w+)\s*=\s*functions\.(\w+)\.(\w+)\(/g,
        // functions.https.onRequest(...) with variable assignment
        /const\s+(\w+)\s*=\s*functions\.(\w+)\.(\w+)\(/g,
        // Direct function exports
        /functions\.(\w+)\.(\w+)\(/g
      ];
      
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const functionName = match[1] || `unnamed_${Date.now()}`;
          const serviceType = match[2]; // https, firestore, auth, etc.
          const trigger = match[3]; // onRequest, onCall, onCreate, etc.
          
          if (this.isValidFunctionName(functionName, serviceType, trigger)) {
            functions.push({
              name: functionName,
              type: serviceType,
              trigger: trigger,
              file: filePath
            });
          }
        }
      });
      
    } catch (error) {
      console.warn(`⚠️  Error reading function file ${filePath}: ${error.message}`);
    }
    
    return functions;
  }

  /**
   * Validate if a detected function is actually a Firebase Function
   */
  isValidFunctionName(name, serviceType, trigger) {
    const validServiceTypes = ['https', 'firestore', 'auth', 'storage', 'database', 'pubsub', 'analytics'];
    const validTriggers = ['onRequest', 'onCall', 'onCreate', 'onUpdate', 'onDelete', 'onWrite'];
    
    return name && 
           name.length > 0 && 
           name.length < 100 &&
           validServiceTypes.includes(serviceType) &&
           validTriggers.includes(trigger) &&
           !/^(import|export|const|let|var|function)$/.test(name);
  }

  /**
   * Scan Firestore queries to determine needed indexes
   */
  async scanFirestoreQueries() {
    console.log('📊 Scanning Firestore queries for index requirements...');
    
    const queries = [];
    const queryPatterns = new Map(); // collection -> query patterns
    
    // Scan both projects for Firestore queries
    const projects = [
      { path: this.dashboardPath, name: 'Dashboard-v14_2' },
      { path: this.licensingPath, name: 'Licensing Website' }
    ];
    
    for (const project of projects) {
      if (!fs.existsSync(project.path)) continue;
      
      const files = this.findFiles(project.path, ['.ts', '.tsx', '.js', '.jsx']);
      
      for (const file of files) {
        const fileQueries = this.extractQueriesFromFile(file);
        fileQueries.forEach(query => {
          queries.push({
            ...query,
            project: project.name,
            file: path.relative(this.projectRoot, file)
          });
          
          // Group by collection
          if (!queryPatterns.has(query.collection)) {
            queryPatterns.set(query.collection, []);
          }
          queryPatterns.get(query.collection).push(query);
        });
      }
    }
    
    // Analyze query patterns to determine needed indexes
    const neededIndexes = this.analyzeQueryPatternsForIndexes(queryPatterns);
    
    console.log(`   Found ${queries.length} Firestore queries`);
    console.log(`   Identified ${neededIndexes.length} potential index requirements`);
    
    return {
      queries,
      queryPatterns: Object.fromEntries(queryPatterns),
      neededIndexes,
      totalQueries: queries.length,
      missingIndexes: neededIndexes.length
    };
  }

  /**
   * Extract Firestore queries from a file
   */
  extractQueriesFromFile(filePath) {
    const queries = [];
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Patterns to detect Firestore queries
      const patterns = [
        // .where('field', '==', value)
        /\.where\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]/g,
        // .orderBy('field', 'desc')
        /\.orderBy\s*\(\s*['"`]([^'"`]+)['"`](?:\s*,\s*['"`]([^'"`]+)['"`])?\)/g,
        // .limit(number)
        /\.limit\s*\(\s*(\d+)\s*\)/g,
        // collection('name').where(...)
        /collection\s*\(\s*['"`]([^'"`]+)['"`]\s*\)[^;]*\.where\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]/g,
        // collection('name').orderBy(...)
        /collection\s*\(\s*['"`]([^'"`]+)['"`]\s*\)[^;]*\.orderBy\s*\(\s*['"`]([^'"`]+)['"`](?:\s*,\s*['"`]([^'"`]+)['"`])?\)/g
      ];
      
      // Extract collection references first
      const collectionMatches = content.matchAll(/collection\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g);
      const collections = new Set();
      
      for (const match of collectionMatches) {
        collections.add(match[1]);
      }
      
      // For each collection, look for query patterns
      collections.forEach(collection => {
        const collectionRegex = new RegExp(
          `collection\\s*\\(\\s*['"\`]${collection}['"\`]\\s*\\)([^;]+)`,
          'g'
        );
        
        let match;
        while ((match = collectionRegex.exec(content)) !== null) {
          const queryChain = match[1];
          const query = this.parseQueryChain(collection, queryChain);
          
          if (query.fields.length > 0) {
            queries.push(query);
          }
        }
      });
      
    } catch (error) {
      console.warn(`⚠️  Error reading query file ${filePath}: ${error.message}`);
    }
    
    return queries;
  }

  /**
   * Parse a Firestore query chain to extract fields and operations
   */
  parseQueryChain(collection, queryChain) {
    const query = {
      collection,
      fields: [],
      operations: [],
      orderBy: [],
      limit: null
    };
    
    // Extract where clauses
    const whereMatches = queryChain.matchAll(/\.where\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]/g);
    for (const match of whereMatches) {
      query.fields.push(match[1]);
      query.operations.push({
        field: match[1],
        operator: match[2],
        type: 'where'
      });
    }
    
    // Extract orderBy clauses
    const orderByMatches = queryChain.matchAll(/\.orderBy\s*\(\s*['"`]([^'"`]+)['"`](?:\s*,\s*['"`]([^'"`]+)['"`])?\)/g);
    for (const match of orderByMatches) {
      const field = match[1];
      const direction = match[2] || 'asc';
      
      query.fields.push(field);
      query.orderBy.push({ field, direction });
      query.operations.push({
        field,
        direction,
        type: 'orderBy'
      });
    }
    
    // Extract limit
    const limitMatch = queryChain.match(/\.limit\s*\(\s*(\d+)\s*\)/);
    if (limitMatch) {
      query.limit = parseInt(limitMatch[1]);
    }
    
    return query;
  }

  /**
   * Analyze query patterns to determine needed indexes
   */
  analyzeQueryPatternsForIndexes(queryPatterns) {
    const neededIndexes = [];
    
    queryPatterns.forEach((queries, collection) => {
      // Group queries by field combinations
      const fieldCombinations = new Map();
      
      queries.forEach(query => {
        // Create a key for this field combination
        const whereFields = query.operations
          .filter(op => op.type === 'where')
          .map(op => `${op.field}:${op.operator}`)
          .sort();
        
        const orderByFields = query.operations
          .filter(op => op.type === 'orderBy')
          .map(op => `${op.field}:${op.direction}`)
          .sort();
        
        const key = [...whereFields, ...orderByFields].join(',');
        
        if (key && !fieldCombinations.has(key)) {
          fieldCombinations.set(key, {
            collection,
            fields: [
              ...query.operations.filter(op => op.type === 'where'),
              ...query.operations.filter(op => op.type === 'orderBy')
            ],
            queryCount: 1
          });
        } else if (key) {
          fieldCombinations.get(key).queryCount++;
        }
      });
      
      // Convert to index requirements
      fieldCombinations.forEach((combo, key) => {
        if (combo.fields.length > 1) { // Only multi-field queries need composite indexes
          neededIndexes.push({
            collection: combo.collection,
            fields: combo.fields.map(field => ({
              fieldPath: field.field,
              order: field.type === 'orderBy' ? 
                (field.direction === 'desc' ? 'DESCENDING' : 'ASCENDING') : 
                'ASCENDING'
            })),
            queryCount: combo.queryCount,
            priority: combo.queryCount > 5 ? 'high' : combo.queryCount > 2 ? 'medium' : 'low'
          });
        }
      });
    });
    
    return neededIndexes;
  }

  /**
   * Analyze existing Firestore indexes
   */
  async analyzeExistingIndexes() {
    console.log('📋 Analyzing existing Firestore indexes...');
    
    const existingIndexes = [];
    const indexFiles = [
      this.indexesPath,
      path.join(this.dashboardPath, 'firestore.indexes.json'),
      path.join(this.dashboardPath, 'firestore-inventory-indexes.json'),
      path.join(this.dashboardPath, 'firestore-nd-indexes.json')
    ];
    
    for (const indexFile of indexFiles) {
      if (fs.existsSync(indexFile)) {
        try {
          const indexData = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
          
          if (indexData.indexes && Array.isArray(indexData.indexes)) {
            indexData.indexes.forEach(index => {
              existingIndexes.push({
                ...index,
                source: path.basename(indexFile)
              });
            });
          }
        } catch (error) {
          console.warn(`⚠️  Error reading index file ${indexFile}: ${error.message}`);
        }
      }
    }
    
    console.log(`   Found ${existingIndexes.length} existing indexes`);
    
    return {
      indexes: existingIndexes,
      totalIndexes: existingIndexes.length,
      indexFiles: indexFiles.filter(f => fs.existsSync(f))
    };
  }

  /**
   * Generate comprehensive Firebase configuration
   */
  async generateFirebaseConfiguration(scanResults) {
    console.log('🛠️  Generating comprehensive Firebase configuration...');
    
    // Generate Firestore rules (from parent class)
    const rules = this.generateFirestoreRules(scanResults.collections.collections);
    
    // Generate Firebase Functions deployment config
    const functionsConfig = this.generateFunctionsConfig(scanResults.functions);
    
    // Generate comprehensive Firestore indexes
    const indexesConfig = this.generateIndexesConfig(scanResults.queries, scanResults.indexes);
    
    // Generate firebase.json configuration
    const firebaseConfig = this.generateFirebaseJson(scanResults);
    
    return {
      rules,
      functionsConfig,
      indexesConfig,
      firebaseConfig
    };
  }

  /**
   * Generate Firebase Functions configuration
   */
  generateFunctionsConfig(functionResults) {
    const config = {
      functions: functionResults.functions,
      deployment: {
        runtime: 'nodejs20',
        region: 'us-central1',
        memory: '512MB',
        timeout: '60s'
      },
      environment: {
        NODE_ENV: 'production'
      }
    };
    
    // Write functions deployment script
    const deployScript = this.generateFunctionsDeployScript(functionResults);
    const deployScriptPath = path.join(this.functionsPath, 'deploy-functions-auto.sh');
    
    if (fs.existsSync(this.functionsPath)) {
      fs.writeFileSync(deployScriptPath, deployScript);
      console.log(`✅ Functions deploy script written to: ${deployScriptPath}`);
    }
    
    return config;
  }

  /**
   * Generate Functions deployment script
   */
  generateFunctionsDeployScript(functionResults) {
    return `#!/bin/bash

# ============================================================================
# FIREBASE FUNCTIONS AUTO-DEPLOYMENT SCRIPT
# ============================================================================
# 
# Auto-generated on: ${new Date().toISOString()}
# Functions found: ${functionResults.functions.length}
# 
# This script automatically deploys all discovered Firebase Functions.
# ============================================================================

set -e

echo "🔥 Deploying Firebase Functions..."

# Check if we're in the functions directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from functions directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Deploy functions
echo "🚀 Deploying functions to Firebase..."
firebase deploy --only functions --project backbone-logic

echo "✅ Functions deployment complete!"

# List deployed functions
echo ""
echo "📋 Deployed Functions:"
${functionResults.functions.map(func => `echo "  - ${func.name} (${func.type}.${func.trigger})"`).join('\n')}

echo ""
echo "🌐 Functions URLs:"
echo "  - API Base: https://api-oup5qxogca-uc.a.run.app"
echo "  - Health Check: https://healthcheck-oup5qxogca-uc.a.run.app"
`;
  }

  /**
   * Generate comprehensive Firestore indexes configuration
   */
  generateIndexesConfig(queryResults, indexResults) {
    const existingIndexes = indexResults.indexes || [];
    const neededIndexes = queryResults.neededIndexes || [];
    
    // Merge existing and needed indexes, avoiding duplicates
    const allIndexes = [...existingIndexes];
    
    neededIndexes.forEach(needed => {
      const exists = existingIndexes.some(existing => 
        existing.collectionGroup === needed.collection &&
        JSON.stringify(existing.fields) === JSON.stringify(needed.fields)
      );
      
      if (!exists) {
        allIndexes.push({
          collectionGroup: needed.collection,
          queryScope: 'COLLECTION',
          fields: needed.fields
        });
      }
    });
    
    const indexesConfig = {
      indexes: allIndexes,
      fieldOverrides: []
    };
    
    // Write comprehensive indexes file
    const indexesPath = path.join(this.dashboardPath, 'firestore-comprehensive.indexes.json');
    fs.writeFileSync(indexesPath, JSON.stringify(indexesConfig, null, 2));
    console.log(`✅ Comprehensive indexes written to: ${indexesPath}`);
    
    return indexesConfig;
  }

  /**
   * Generate firebase.json configuration
   */
  generateFirebaseJson(scanResults) {
    const config = {
      hosting: [
        {
          target: 'backbone-client',
          public: 'apps/web/public',
          ignore: ['firebase.json', '**/.*', '**/node_modules/**'],
          rewrites: [
            {
              source: '/api/**',
              function: 'api'
            },
            {
              source: '**',
              destination: '/index.html'
            }
          ]
        }
      ],
      functions: [
        {
          source: 'functions',
          codebase: 'default',
          runtime: 'nodejs20',
          ignore: [
            'node_modules',
            '.git',
            'firebase-debug.log',
            'firebase-debug.*.log'
          ]
        }
      ],
      firestore: {
        rules: 'firestore-comprehensive.rules',
        indexes: 'firestore-comprehensive.indexes.json'
      },
      storage: {
        rules: 'storage.rules'
      }
    };
    
    // Write firebase.json
    const firebaseJsonPath = path.join(this.dashboardPath, 'firebase.json');
    fs.writeFileSync(firebaseJsonPath, JSON.stringify(config, null, 2));
    console.log(`✅ Firebase configuration written to: ${firebaseJsonPath}`);
    
    return config;
  }

  /**
   * Deploy all Firebase components
   */
  async deployAllComponents() {
    console.log('🚀 Deploying all Firebase components...');
    
    try {
      // Deploy Firestore rules and indexes
      console.log('🛡️  Deploying Firestore rules and indexes...');
      execSync('firebase deploy --only firestore --project backbone-logic', {
        cwd: this.dashboardPath,
        stdio: 'inherit'
      });
      
      // Deploy Firebase Functions
      console.log('🔥 Deploying Firebase Functions...');
      execSync('firebase deploy --only functions --project backbone-logic', {
        cwd: this.dashboardPath,
        stdio: 'inherit'
      });
      
      // Deploy Firebase Hosting
      console.log('🌐 Deploying Firebase Hosting...');
      execSync('firebase deploy --only hosting --project backbone-logic', {
        cwd: this.dashboardPath,
        stdio: 'inherit'
      });
      
      console.log('✅ All Firebase components deployed successfully!');
      return true;
      
    } catch (error) {
      console.error('❌ Firebase deployment failed:', error.message);
      return false;
    }
  }

  /**
   * Generate comprehensive report
   */
  generateComprehensiveReport(scanResults) {
    const report = {
      ...scanResults,
      recommendations: this.generateRecommendations(scanResults),
      deployment: {
        rulesFile: 'firestore-comprehensive.rules',
        indexesFile: 'firestore-comprehensive.indexes.json',
        functionsPath: 'functions/',
        configFile: 'firebase.json'
      },
      // Ensure sources exist for compatibility with parent class
      sources: scanResults.collections?.sources || {},
      categories: this.categorizeCollections(scanResults.collections?.collections || [])
    };
    
    return report;
  }

  /**
   * Save comprehensive scan results and report
   */
  saveResults(scanResults, report) {
    const outputDir = path.join(this.projectRoot, 'tools/firestore-automation/reports');
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save detailed scan results
    const resultsFile = path.join(outputDir, `firebase-scan-${timestamp}.json`);
    fs.writeFileSync(resultsFile, JSON.stringify(scanResults, null, 2));
    
    // Save human-readable report
    const reportFile = path.join(outputDir, `firebase-report-${timestamp}.md`);
    const reportContent = this.formatFirebaseReportAsMarkdown(report);
    fs.writeFileSync(reportFile, reportContent);
    
    // Save latest results (overwrite)
    const latestResultsFile = path.join(outputDir, 'latest-firebase-scan.json');
    fs.writeFileSync(latestResultsFile, JSON.stringify(scanResults, null, 2));
    
    const latestReportFile = path.join(outputDir, 'latest-firebase-report.md');
    fs.writeFileSync(latestReportFile, reportContent);
    
    console.log(`📊 Results saved to: ${outputDir}`);
    
    return { resultsFile, reportFile };
  }

  /**
   * Format comprehensive Firebase report as Markdown
   */
  formatFirebaseReportAsMarkdown(report) {
    return `# Comprehensive Firebase Scan Report

**Generated:** ${report.scanTime.toISOString()}

## Summary

- **Collections:** ${report.summary.totalCollections}
- **Firebase Functions:** ${report.summary.totalFunctions}
- **Firestore Queries:** ${report.summary.totalQueries}
- **Existing Indexes:** ${report.summary.totalIndexes}
- **Missing Indexes:** ${report.summary.missingIndexes}

## 🔥 Firebase Functions

${report.functions.functions.map(func => 
  `### \`${func.name}\`
- **Type**: ${func.type}
- **Trigger**: ${func.trigger}
- **File**: \`${func.file}\``
).join('\n\n')}

## 📊 Firestore Query Analysis

### Queries by Collection
${Object.entries(report.queries.queryPatterns).map(([collection, queries]) => 
  `#### \`${collection}\`
- **Query Count**: ${queries.length}
- **Unique Patterns**: ${new Set(queries.map(q => q.fields.join(','))).size}`
).join('\n\n')}

### Missing Indexes (High Priority)
${report.queries.neededIndexes
  .filter(idx => idx.priority === 'high')
  .map(idx => `- **${idx.collection}**: ${idx.fields.map(f => f.fieldPath).join(', ')} (${idx.queryCount} queries)`)
  .join('\n')}

## 🛡️ Collections & Security Rules

${report.collections.collections.map(c => `- \`${c}\``).join('\n')}

## 📋 Existing Indexes

${report.indexes.indexes.map(idx => 
  `- **${idx.collectionGroup}**: ${idx.fields ? idx.fields.map(f => f.fieldPath).join(', ') : 'N/A'}`
).join('\n')}

## 💡 Recommendations

${report.recommendations.map(rec => 
  `### ${rec.type.toUpperCase()} - ${rec.priority.toUpperCase()}
${rec.message}`
).join('\n\n')}

## 🚀 Deployment Configuration

- **Rules File**: \`${report.deployment.rulesFile}\`
- **Indexes File**: \`${report.deployment.indexesFile}\`
- **Functions Path**: \`${report.deployment.functionsPath}\`
- **Config File**: \`${report.deployment.configFile}\`
`;
  }

  /**
   * Generate recommendations based on scan results
   */
  generateRecommendations(scanResults) {
    const recommendations = [];
    
    // Collection recommendations
    if (scanResults.collections.totalCollections > 100) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: `Large number of collections (${scanResults.collections.totalCollections}). Consider consolidating related data.`
      });
    }
    
    // Function recommendations
    if (scanResults.functions.totalFunctions === 0) {
      recommendations.push({
        type: 'architecture',
        priority: 'low',
        message: 'No Firebase Functions detected. Consider using Functions for server-side logic.'
      });
    }
    
    // Index recommendations
    if (scanResults.queries.missingIndexes > 10) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: `${scanResults.queries.missingIndexes} queries may need indexes for optimal performance.`
      });
    }
    
    // Security recommendations
    recommendations.push({
      type: 'security',
      priority: 'high',
      message: 'Review generated security rules to ensure they match your access requirements.'
    });
    
    return recommendations;
  }
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const generateAll = args.includes('--generate-all');
  const deploy = args.includes('--deploy');
  const verbose = args.includes('--verbose');
  
  const scanner = new ComprehensiveFirebaseScanner();
  
  try {
    // Comprehensive scan
    const scanResults = await scanner.scanAllFirebaseComponents();
    
    if (verbose) {
      console.log('\n📋 Scan Results Summary:');
      console.log(`  Collections: ${scanResults.summary.totalCollections}`);
      console.log(`  Functions: ${scanResults.summary.totalFunctions}`);
      console.log(`  Queries: ${scanResults.summary.totalQueries}`);
      console.log(`  Indexes: ${scanResults.summary.totalIndexes}`);
      console.log(`  Missing Indexes: ${scanResults.summary.missingIndexes}`);
    }
    
    // Generate comprehensive report
    const report = scanner.generateComprehensiveReport(scanResults);
    const { resultsFile, reportFile } = scanner.saveResults(scanResults, report);
    
    // Generate Firebase configuration if requested
    if (generateAll) {
      const config = await scanner.generateFirebaseConfiguration(scanResults);
      console.log('✅ Firebase configuration generated');
    }
    
    // Deploy if requested
    if (deploy && generateAll) {
      const success = await scanner.deployAllComponents();
      if (!success) {
        process.exit(1);
      }
    }
    
    console.log('\n✅ Comprehensive Firebase scan complete!');
    console.log(`📄 Report: ${reportFile}`);
    console.log(`📊 Data: ${resultsFile}`);
    
    // Show recommendations
    if (report.recommendations && report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => {
        const priority = rec.priority.toUpperCase();
        console.log(`  [${priority}] ${rec.message}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error during comprehensive scan:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ComprehensiveFirebaseScanner;
