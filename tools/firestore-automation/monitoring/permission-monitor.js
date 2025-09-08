#!/usr/bin/env node

/**
 * FIRESTORE PERMISSION MONITOR
 * 
 * Monitors Firestore operations for permission errors and automatically
 * triggers collection scans and rule updates when issues are detected.
 * 
 * Usage: node permission-monitor.js [--webhook-url=URL] [--continuous]
 */

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FirestorePermissionMonitor {
  constructor(options = {}) {
    this.projectRoot = path.resolve(__dirname, '../../..');
    this.webhookUrl = options.webhookUrl;
    this.continuous = options.continuous || false;
    this.alertThreshold = options.alertThreshold || 5; // Alert after 5 permission errors
    this.monitoringInterval = options.monitoringInterval || 60000; // 1 minute
    
    this.permissionErrors = new Map(); // Track errors by collection
    this.lastScanTime = null;
    this.isMonitoring = false;
    
    this.initializeFirebase();
  }

  /**
   * Initialize Firebase Admin SDK
   */
  initializeFirebase() {
    try {
      // Initialize Firebase Admin (assumes service account is configured)
      this.app = initializeApp({
        projectId: 'backbone-logic'
      });
      
      this.db = getFirestore(this.app);
      this.auth = getAuth(this.app);
      
      console.log('✅ Firebase Admin SDK initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase:', error.message);
      process.exit(1);
    }
  }

  /**
   * Start monitoring for permission errors
   */
  async startMonitoring() {
    console.log('🔍 Starting Firestore permission monitoring...');
    this.isMonitoring = true;
    
    if (this.continuous) {
      // Continuous monitoring mode
      this.monitoringTimer = setInterval(() => {
        this.checkPermissionErrors();
      }, this.monitoringInterval);
      
      console.log(`📊 Continuous monitoring started (interval: ${this.monitoringInterval}ms)`);
    } else {
      // One-time check
      await this.checkPermissionErrors();
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
    
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }
    
    console.log('🛑 Monitoring stopped');
  }

  /**
   * Check for permission errors by testing collection access
   */
  async checkPermissionErrors() {
    console.log('🔍 Checking for permission errors...');
    
    try {
      // Get list of known collections from latest scan
      const collections = await this.getKnownCollections();
      
      if (collections.length === 0) {
        console.log('⚠️  No collections found in scan results. Running collection scan...');
        await this.runCollectionScan();
        return;
      }
      
      console.log(`📋 Testing access to ${collections.length} collections...`);
      
      const errors = [];
      const testPromises = collections.map(collection => 
        this.testCollectionAccess(collection)
      );
      
      const results = await Promise.allSettled(testPromises);
      
      results.forEach((result, index) => {
        const collection = collections[index];
        
        if (result.status === 'rejected') {
          const error = result.reason;
          
          if (this.isPermissionError(error)) {
            errors.push({
              collection,
              error: error.message,
              code: error.code,
              timestamp: new Date()
            });
            
            // Track error count
            const currentCount = this.permissionErrors.get(collection) || 0;
            this.permissionErrors.set(collection, currentCount + 1);
          }
        } else {
          // Clear error count for successful access
          this.permissionErrors.delete(collection);
        }
      });
      
      if (errors.length > 0) {
        console.log(`❌ Found ${errors.length} permission errors`);
        await this.handlePermissionErrors(errors);
      } else {
        console.log('✅ No permission errors detected');
      }
      
    } catch (error) {
      console.error('❌ Error during permission check:', error);
    }
  }

  /**
   * Test access to a specific collection
   */
  async testCollectionAccess(collectionName) {
    try {
      // Try to read from the collection (limit to 1 document to minimize impact)
      const snapshot = await this.db.collection(collectionName).limit(1).get();
      return { collection: collectionName, accessible: true, size: snapshot.size };
    } catch (error) {
      throw { collection: collectionName, error, accessible: false };
    }
  }

  /**
   * Check if an error is a permission error
   */
  isPermissionError(error) {
    const permissionErrorCodes = [
      'permission-denied',
      'unauthenticated',
      'insufficient-permissions'
    ];
    
    const permissionErrorMessages = [
      'Missing or insufficient permissions',
      'Permission denied',
      'Insufficient permissions',
      'PERMISSION_DENIED'
    ];
    
    return permissionErrorCodes.includes(error.code) ||
           permissionErrorMessages.some(msg => 
             error.message && error.message.includes(msg)
           );
  }

  /**
   * Handle detected permission errors
   */
  async handlePermissionErrors(errors) {
    console.log('🚨 Handling permission errors...');
    
    // Group errors by collection
    const errorsByCollection = new Map();
    errors.forEach(error => {
      if (!errorsByCollection.has(error.collection)) {
        errorsByCollection.set(error.collection, []);
      }
      errorsByCollection.get(error.collection).push(error);
    });
    
    // Check if any collection has exceeded the alert threshold
    const criticalCollections = [];
    for (const [collection, count] of this.permissionErrors.entries()) {
      if (count >= this.alertThreshold) {
        criticalCollections.push(collection);
      }
    }
    
    if (criticalCollections.length > 0) {
      console.log(`🚨 Critical: ${criticalCollections.length} collections have exceeded error threshold`);
      
      // Trigger automatic remediation
      await this.triggerAutomaticRemediation(criticalCollections, errors);
    }
    
    // Send alerts
    await this.sendAlert(errors, criticalCollections);
    
    // Log errors
    await this.logErrors(errors);
  }

  /**
   * Trigger automatic remediation for permission errors
   */
  async triggerAutomaticRemediation(criticalCollections, errors) {
    console.log('🔧 Triggering automatic remediation...');
    
    try {
      // Run collection scan to detect any new collections
      console.log('📊 Running collection scan...');
      await this.runCollectionScan();
      
      // Generate and deploy new rules
      console.log('🛡️  Generating and deploying new Firestore rules...');
      await this.generateAndDeployRules();
      
      // Wait a moment for rules to propagate
      console.log('⏳ Waiting for rules to propagate...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Re-test the critical collections
      console.log('🧪 Re-testing critical collections...');
      const retestResults = await Promise.allSettled(
        criticalCollections.map(collection => this.testCollectionAccess(collection))
      );
      
      const stillFailing = [];
      retestResults.forEach((result, index) => {
        if (result.status === 'rejected' && 
            this.isPermissionError(result.reason.error)) {
          stillFailing.push(criticalCollections[index]);
        }
      });
      
      if (stillFailing.length === 0) {
        console.log('✅ Automatic remediation successful!');
        
        // Clear error counts for resolved collections
        criticalCollections.forEach(collection => {
          this.permissionErrors.delete(collection);
        });
        
        await this.sendSuccessAlert(criticalCollections);
      } else {
        console.log(`⚠️  Automatic remediation partially successful. Still failing: ${stillFailing.join(', ')}`);
        await this.sendPartialSuccessAlert(criticalCollections, stillFailing);
      }
      
    } catch (error) {
      console.error('❌ Automatic remediation failed:', error);
      await this.sendRemediationFailureAlert(criticalCollections, error);
    }
  }

  /**
   * Run the collection scanner
   */
  async runCollectionScan() {
    const scannerPath = path.join(this.projectRoot, 'tools/firestore-automation/collection-scanner.js');
    
    try {
      execSync(`node "${scannerPath}"`, { 
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      
      this.lastScanTime = new Date();
      console.log('✅ Collection scan completed');
    } catch (error) {
      console.error('❌ Collection scan failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate and deploy Firestore rules
   */
  async generateAndDeployRules() {
    const scannerPath = path.join(this.projectRoot, 'tools/firestore-automation/collection-scanner.js');
    
    try {
      // Generate rules
      execSync(`node "${scannerPath}" --generate-rules`, { 
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      
      // Deploy rules
      execSync(`node "${scannerPath}" --generate-rules --deploy`, { 
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      
      console.log('✅ Rules generated and deployed');
    } catch (error) {
      console.error('❌ Rules generation/deployment failed:', error.message);
      throw error;
    }
  }

  /**
   * Get known collections from latest scan results
   */
  async getKnownCollections() {
    const scanResultsPath = path.join(
      this.projectRoot, 
      'tools/firestore-automation/reports/latest-scan.json'
    );
    
    try {
      if (fs.existsSync(scanResultsPath)) {
        const scanData = JSON.parse(fs.readFileSync(scanResultsPath, 'utf8'));
        return scanData.collections || [];
      }
    } catch (error) {
      console.warn('⚠️  Could not read scan results:', error.message);
    }
    
    return [];
  }

  /**
   * Send alert notification
   */
  async sendAlert(errors, criticalCollections) {
    const alert = {
      type: 'permission_error',
      timestamp: new Date().toISOString(),
      errors: errors.length,
      criticalCollections: criticalCollections.length,
      details: {
        errors: errors.map(e => ({
          collection: e.collection,
          error: e.error,
          code: e.code,
          timestamp: e.timestamp
        })),
        criticalCollections
      }
    };
    
    console.log('📢 Sending alert notification...');
    
    if (this.webhookUrl) {
      await this.sendWebhookAlert(alert);
    }
    
    // Always log to console and file
    console.log('🚨 PERMISSION ERROR ALERT:', JSON.stringify(alert, null, 2));
    await this.saveAlertToFile(alert);
  }

  /**
   * Send success alert after remediation
   */
  async sendSuccessAlert(resolvedCollections) {
    const alert = {
      type: 'remediation_success',
      timestamp: new Date().toISOString(),
      message: 'Automatic remediation successful',
      resolvedCollections,
      details: {
        action: 'Generated and deployed new Firestore rules',
        collections: resolvedCollections.length
      }
    };
    
    console.log('✅ Sending success alert...');
    
    if (this.webhookUrl) {
      await this.sendWebhookAlert(alert);
    }
    
    console.log('🎉 REMEDIATION SUCCESS:', JSON.stringify(alert, null, 2));
    await this.saveAlertToFile(alert);
  }

  /**
   * Send webhook alert
   */
  async sendWebhookAlert(alert) {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alert)
      });
      
      if (response.ok) {
        console.log('✅ Webhook alert sent successfully');
      } else {
        console.error('❌ Webhook alert failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Webhook alert error:', error.message);
    }
  }

  /**
   * Save alert to file
   */
  async saveAlertToFile(alert) {
    const alertsDir = path.join(this.projectRoot, 'tools/firestore-automation/alerts');
    
    // Ensure alerts directory exists
    if (!fs.existsSync(alertsDir)) {
      fs.mkdirSync(alertsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const alertFile = path.join(alertsDir, `alert-${timestamp}.json`);
    
    try {
      fs.writeFileSync(alertFile, JSON.stringify(alert, null, 2));
      console.log(`📄 Alert saved to: ${alertFile}`);
    } catch (error) {
      console.error('❌ Failed to save alert:', error.message);
    }
  }

  /**
   * Log errors to file
   */
  async logErrors(errors) {
    const logsDir = path.join(this.projectRoot, 'tools/firestore-automation/logs');
    
    // Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const logFile = path.join(logsDir, 'permission-errors.log');
    const logEntry = {
      timestamp: new Date().toISOString(),
      errors: errors.length,
      details: errors
    };
    
    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error('❌ Failed to log errors:', error.message);
    }
  }

  /**
   * Generate monitoring report
   */
  generateReport() {
    return {
      isMonitoring: this.isMonitoring,
      lastScanTime: this.lastScanTime,
      currentErrors: Object.fromEntries(this.permissionErrors),
      alertThreshold: this.alertThreshold,
      monitoringInterval: this.monitoringInterval,
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  
  const options = {
    webhookUrl: args.find(arg => arg.startsWith('--webhook-url='))?.split('=')[1],
    continuous: args.includes('--continuous'),
    alertThreshold: parseInt(args.find(arg => arg.startsWith('--threshold='))?.split('=')[1]) || 5,
    monitoringInterval: parseInt(args.find(arg => arg.startsWith('--interval='))?.split('=')[1]) || 60000
  };
  
  const monitor = new FirestorePermissionMonitor(options);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down monitor...');
    monitor.stopMonitoring();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down monitor...');
    monitor.stopMonitoring();
    process.exit(0);
  });
  
  try {
    await monitor.startMonitoring();
    
    if (!options.continuous) {
      console.log('✅ Permission check complete');
      process.exit(0);
    } else {
      console.log('🔄 Monitoring running... Press Ctrl+C to stop');
      
      // Keep the process alive
      setInterval(() => {
        const report = monitor.generateReport();
        console.log(`📊 Status: ${report.currentErrors ? Object.keys(report.currentErrors).length : 0} collections with errors`);
      }, 300000); // Status update every 5 minutes
    }
    
  } catch (error) {
    console.error('❌ Monitor error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = FirestorePermissionMonitor;
