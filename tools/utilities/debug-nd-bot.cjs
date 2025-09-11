/**
 * Debug script for Network Delivery Bible Bot
 * Tests the API endpoints and data flow
 */

const https = require('https');

// Test Firebase Functions endpoint
async function testFirebaseEndpoint() {
  console.log('🔍 Testing Firebase Functions endpoint...');
  
  const options = {
    hostname: 'us-central1-backbone-logic.cloudfunctions.net',
    port: 443,
    path: '/api/network-delivery/bibles',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📡 Response Status:', res.statusCode);
        console.log('📡 Response Headers:', res.headers);
        console.log('📡 Response Body:', data);
        resolve({ status: res.statusCode, data: JSON.parse(data || '{}') });
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });
    
    req.end();
  });
}

// Test health check endpoint
async function testHealthCheck() {
  console.log('🔍 Testing health check endpoint...');
  
  const options = {
    hostname: 'us-central1-backbone-logic.cloudfunctions.net',
    port: 443,
    path: '/api/health',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📡 Health Check Status:', res.statusCode);
        console.log('📡 Health Check Response:', data);
        resolve({ status: res.statusCode, data: JSON.parse(data || '{}') });
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Health check error:', error);
      reject(error);
    });
    
    req.end();
  });
}

// Main test function
async function runTests() {
  try {
    console.log('🚀 Starting Network Delivery Bible Bot Debug Tests...\n');
    
    // Test 1: Health check
    console.log('='.repeat(50));
    console.log('TEST 1: Health Check');
    console.log('='.repeat(50));
    await testHealthCheck();
    
    console.log('\n');
    
    // Test 2: Network Delivery endpoint
    console.log('='.repeat(50));
    console.log('TEST 2: Network Delivery Bibles Endpoint');
    console.log('='.repeat(50));
    await testFirebaseEndpoint();
    
    console.log('\n✅ Debug tests completed');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
}

// Run the tests
runTests();
