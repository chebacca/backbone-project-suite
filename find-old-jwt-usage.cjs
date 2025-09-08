#!/usr/bin/env node

/**
 * JWT Token Migration Audit Script
 * 
 * This script finds all files using the old JWT token setup and provides
 * recommendations for migrating to the new unified Firebase Auth system.
 * 
 * Usage: node find-old-jwt-usage.cjs
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SEARCH_DIRECTORIES = [
  'Dashboard-v14_2/apps/web/src',
  'dashboard-v14-licensing-website 2/src'
];

const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'public',
  '.next',
  'coverage',
  '*.min.js',
  '*.map'
];

// Patterns to search for old JWT usage
const JWT_PATTERNS = [
  // Direct jwtService usage
  {
    pattern: /jwtService\./g,
    description: 'Direct jwtService usage',
    severity: 'HIGH',
    replacement: 'Use unifiedFirebaseAuth or authService wrapper'
  },
  {
    pattern: /import.*jwtService/g,
    description: 'jwtService imports',
    severity: 'HIGH',
    replacement: 'Import unifiedFirebaseAuth instead'
  },
  {
    pattern: /from.*jwtService/g,
    description: 'jwtService imports (from syntax)',
    severity: 'HIGH',
    replacement: 'Import unifiedFirebaseAuth instead'
  },
  
  // Token method calls
  {
    pattern: /\.getToken\(\)/g,
    description: 'getToken() method calls',
    severity: 'MEDIUM',
    replacement: 'Use await authService.getToken() or unifiedFirebaseAuth.getIdToken()'
  },
  {
    pattern: /\.setToken\(/g,
    description: 'setToken() method calls',
    severity: 'MEDIUM',
    replacement: 'Firebase Auth handles tokens automatically'
  },
  {
    pattern: /\.removeToken\(/g,
    description: 'removeToken() method calls',
    severity: 'MEDIUM',
    replacement: 'Use unifiedFirebaseAuth.logout()'
  },
  {
    pattern: /\.clearToken\(/g,
    description: 'clearToken() method calls',
    severity: 'MEDIUM',
    replacement: 'Use unifiedFirebaseAuth.logout()'
  },
  
  // localStorage token access
  {
    pattern: /localStorage\.getItem\(['"`]jwt_token['"`]\)/g,
    description: 'Direct localStorage JWT token access',
    severity: 'MEDIUM',
    replacement: 'Use unifiedFirebaseAuth.getIdToken()'
  },
  {
    pattern: /localStorage\.setItem\(['"`]jwt_token['"`]/g,
    description: 'Direct localStorage JWT token setting',
    severity: 'MEDIUM',
    replacement: 'Firebase Auth handles token storage automatically'
  },
  {
    pattern: /localStorage\.removeItem\(['"`]jwt_token['"`]\)/g,
    description: 'Direct localStorage JWT token removal',
    severity: 'LOW',
    replacement: 'Use unifiedFirebaseAuth.logout()'
  },
  
  // sessionStorage token access
  {
    pattern: /sessionStorage\.getItem\(['"`]jwt_token['"`]\)/g,
    description: 'Direct sessionStorage JWT token access',
    severity: 'MEDIUM',
    replacement: 'Use unifiedFirebaseAuth.getIdToken()'
  },
  {
    pattern: /sessionStorage\.setItem\(['"`]jwt_token['"`]/g,
    description: 'Direct sessionStorage JWT token setting',
    severity: 'MEDIUM',
    replacement: 'Firebase Auth handles token storage automatically'
  },
  
  // Authorization header patterns
  {
    pattern: /Bearer.*\$\{.*jwt.*\}/g,
    description: 'Bearer token with JWT variable',
    severity: 'MEDIUM',
    replacement: 'Use Firebase ID token in Authorization header'
  },
  {
    pattern: /Authorization.*jwt/gi,
    description: 'Authorization header with JWT reference',
    severity: 'MEDIUM',
    replacement: 'Use Firebase ID token in Authorization header'
  },
  
  // JWT decode/parse patterns
  {
    pattern: /jwt\.decode/g,
    description: 'JWT decode operations',
    severity: 'LOW',
    replacement: 'Firebase Auth provides user info directly'
  },
  {
    pattern: /atob.*jwt/g,
    description: 'Manual JWT token parsing',
    severity: 'LOW',
    replacement: 'Use Firebase Auth user properties'
  },
  
  // Legacy auth patterns
  {
    pattern: /getAuthHeaders.*jwt/gi,
    description: 'Auth headers with JWT reference',
    severity: 'MEDIUM',
    replacement: 'Update to use Firebase ID token'
  },
  {
    pattern: /token.*=.*jwt/gi,
    description: 'Token assignment from JWT',
    severity: 'MEDIUM',
    replacement: 'Use unifiedFirebaseAuth.getIdToken()'
  }
];

// File extensions to search
const SEARCH_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte'];

class JWTMigrationAuditor {
  constructor() {
    this.results = [];
    this.fileCount = 0;
    this.issueCount = 0;
  }

  /**
   * Check if a file should be excluded
   */
  shouldExclude(filePath) {
    return EXCLUDE_PATTERNS.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(filePath);
      }
      return filePath.includes(pattern);
    });
  }

  /**
   * Check if file extension should be searched
   */
  shouldSearchFile(filePath) {
    const ext = path.extname(filePath);
    return SEARCH_EXTENSIONS.includes(ext);
  }

  /**
   * Scan a single file for JWT patterns
   */
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const fileIssues = [];

      JWT_PATTERNS.forEach(({ pattern, description, severity, replacement }) => {
        lines.forEach((line, lineNumber) => {
          const matches = line.match(pattern);
          if (matches) {
            matches.forEach(match => {
              fileIssues.push({
                line: lineNumber + 1,
                content: line.trim(),
                match,
                description,
                severity,
                replacement
              });
              this.issueCount++;
            });
          }
        });
      });

      if (fileIssues.length > 0) {
        this.results.push({
          file: filePath,
          issues: fileIssues
        });
      }

      this.fileCount++;
    } catch (error) {
      console.warn(`⚠️  Could not read file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Recursively scan directory
   */
  scanDirectory(dirPath) {
    try {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        
        if (this.shouldExclude(fullPath)) {
          return;
        }

        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          this.scanDirectory(fullPath);
        } else if (stat.isFile() && this.shouldSearchFile(fullPath)) {
          this.scanFile(fullPath);
        }
      });
    } catch (error) {
      console.warn(`⚠️  Could not scan directory ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Generate migration recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const severityCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    const patternCounts = {};

    this.results.forEach(({ file, issues }) => {
      issues.forEach(issue => {
        severityCounts[issue.severity]++;
        patternCounts[issue.description] = (patternCounts[issue.description] || 0) + 1;
      });
    });

    // Priority recommendations
    if (severityCounts.HIGH > 0) {
      recommendations.push({
        priority: 1,
        title: 'Replace Direct jwtService Usage',
        description: `Found ${severityCounts.HIGH} high-priority issues with direct jwtService usage`,
        action: 'Replace with unifiedFirebaseAuth or authService wrapper'
      });
    }

    if (severityCounts.MEDIUM > 0) {
      recommendations.push({
        priority: 2,
        title: 'Update Token Method Calls',
        description: `Found ${severityCounts.MEDIUM} medium-priority token method calls`,
        action: 'Update to use async Firebase Auth methods'
      });
    }

    if (severityCounts.LOW > 0) {
      recommendations.push({
        priority: 3,
        title: 'Clean Up Legacy Patterns',
        description: `Found ${severityCounts.LOW} low-priority legacy patterns`,
        action: 'Remove or update when convenient'
      });
    }

    return { recommendations, severityCounts, patternCounts };
  }

  /**
   * Generate detailed report
   */
  generateReport() {
    const { recommendations, severityCounts, patternCounts } = this.generateRecommendations();

    console.log('\n🔍 JWT TOKEN MIGRATION AUDIT REPORT');
    console.log('=====================================\n');

    // Summary
    console.log('📊 SUMMARY:');
    console.log(`   Files scanned: ${this.fileCount}`);
    console.log(`   Files with issues: ${this.results.length}`);
    console.log(`   Total issues found: ${this.issueCount}`);
    console.log(`   High priority: ${severityCounts.HIGH}`);
    console.log(`   Medium priority: ${severityCounts.MEDIUM}`);
    console.log(`   Low priority: ${severityCounts.LOW}\n`);

    // Recommendations
    if (recommendations.length > 0) {
      console.log('🎯 MIGRATION RECOMMENDATIONS:');
      recommendations.forEach(rec => {
        console.log(`   ${rec.priority}. ${rec.title}`);
        console.log(`      ${rec.description}`);
        console.log(`      Action: ${rec.action}\n`);
      });
    }

    // Pattern breakdown
    console.log('📋 ISSUE BREAKDOWN BY PATTERN:');
    Object.entries(patternCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([pattern, count]) => {
        console.log(`   ${pattern}: ${count} occurrences`);
      });
    console.log('');

    // Detailed file results
    if (this.results.length > 0) {
      console.log('📁 DETAILED RESULTS:\n');
      
      this.results.forEach(({ file, issues }) => {
        console.log(`📄 ${file}`);
        console.log(`   Issues: ${issues.length}\n`);
        
        issues.forEach(issue => {
          const severityIcon = issue.severity === 'HIGH' ? '🔴' : 
                              issue.severity === 'MEDIUM' ? '🟡' : '🟢';
          console.log(`   ${severityIcon} Line ${issue.line}: ${issue.description}`);
          console.log(`      Match: "${issue.match}"`);
          console.log(`      Code: ${issue.content}`);
          console.log(`      Fix: ${issue.replacement}\n`);
        });
        
        console.log('   ' + '─'.repeat(60) + '\n');
      });
    }

    // Migration guide
    console.log('🚀 MIGRATION GUIDE:');
    console.log('===================\n');
    console.log('1. HIGH PRIORITY - Replace jwtService imports:');
    console.log('   OLD: import { jwtService } from "./jwtService"');
    console.log('   NEW: import { unifiedFirebaseAuth } from "./UnifiedFirebaseAuth"\n');
    
    console.log('2. MEDIUM PRIORITY - Update token method calls:');
    console.log('   OLD: const token = jwtService.getToken()');
    console.log('   NEW: const token = await unifiedFirebaseAuth.getIdToken()\n');
    
    console.log('3. LOW PRIORITY - Remove manual token storage:');
    console.log('   OLD: localStorage.setItem("jwt_token", token)');
    console.log('   NEW: // Firebase Auth handles this automatically\n');
    
    console.log('4. Update Authorization headers:');
    console.log('   OLD: Authorization: `Bearer ${jwtToken}`');
    console.log('   NEW: Authorization: `Bearer ${await unifiedFirebaseAuth.getIdToken()}`\n');

    console.log('📚 HELPFUL RESOURCES:');
    console.log('   - UnifiedFirebaseAuth: Dashboard-v14_2/apps/web/src/services/UnifiedFirebaseAuth.ts');
    console.log('   - AuthService wrapper: Dashboard-v14_2/apps/web/src/services/authService.ts');
    console.log('   - Example usage: NetworkDeliveryBibleBot.tsx (recently updated)\n');

    return {
      fileCount: this.fileCount,
      issueCount: this.issueCount,
      results: this.results,
      recommendations,
      severityCounts,
      patternCounts
    };
  }

  /**
   * Run the audit
   */
  run() {
    console.log('🔍 Starting JWT Token Migration Audit...\n');
    
    SEARCH_DIRECTORIES.forEach(dir => {
      const fullPath = path.resolve(dir);
      if (fs.existsSync(fullPath)) {
        console.log(`📂 Scanning: ${dir}`);
        this.scanDirectory(fullPath);
      } else {
        console.warn(`⚠️  Directory not found: ${dir}`);
      }
    });

    return this.generateReport();
  }
}

// Export for use as module or run directly
if (require.main === module) {
  const auditor = new JWTMigrationAuditor();
  const results = auditor.run();
  
  // Save results to file
  const reportPath = 'jwt-migration-audit-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Detailed report saved to: ${reportPath}`);
  
  // Exit with appropriate code
  process.exit(results.issueCount > 0 ? 1 : 0);
} else {
  module.exports = JWTMigrationAuditor;
}
