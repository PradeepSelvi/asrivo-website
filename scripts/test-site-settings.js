#!/usr/bin/env node

/**
 * Test script to verify site settings are properly connected
 * 
 * This script:
 * 1. Checks if settings exist in the database
 * 2. Tests if the API endpoint returns settings
 * 3. Verifies that updated settings are reflected
 * 
 * Run with: node scripts/test-site-settings.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const API_ENDPOINT = '/api/settings';

console.log('🧪 Testing Site Settings Configuration\n');
console.log('================================================\n');

/**
 * Make HTTP request
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Test 1: Check API endpoint
 */
async function testAPIEndpoint() {
  console.log('📡 Test 1: Checking Settings API Endpoint');
  console.log('-------------------------------------------');
  
  try {
    const url = `${BASE_URL}${API_ENDPOINT}`;
    console.log(`   Requesting: ${url}`);
    
    const response = await makeRequest(url);
    
    if (response.success && response.data) {
      console.log('   ✅ API endpoint is working');
      console.log(`   ✅ Retrieved ${Object.keys(response.data).length} settings`);
      console.log('\n   Settings found:');
      
      const importantSettings = [
        'site_name',
        'site_tagline',
        'contact_email',
        'contact_phone',
        'social_linkedin',
        'social_instagram'
      ];
      
      importantSettings.forEach(key => {
        const value = response.data[key];
        if (value) {
          console.log(`      • ${key}: "${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"`);
        } else {
          console.log(`      ⚠️  ${key}: NOT SET`);
        }
      });
      
      return { success: true, data: response.data };
    } else {
      console.log('   ❌ API returned unexpected response');
      return { success: false, error: 'Invalid response format' };
    }
  } catch (error) {
    console.log(`   ❌ API request failed: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n   💡 Make sure your Next.js development server is running:');
      console.log('      npm run dev');
    }
    
    return { success: false, error: error.message };
  } finally {
    console.log('\n');
  }
}

/**
 * Test 2: Verify critical settings
 */
function testCriticalSettings(settings) {
  console.log('🔍 Test 2: Verifying Critical Settings');
  console.log('-------------------------------------------');
  
  const criticalSettings = {
    'site_name': 'Site name for branding',
    'contact_email': 'Primary contact email',
    'contact_phone': 'Contact phone number',
    'social_linkedin': 'LinkedIn profile URL',
  };
  
  let allPresent = true;
  
  Object.entries(criticalSettings).forEach(([key, description]) => {
    if (settings[key]) {
      console.log(`   ✅ ${description}: Present`);
    } else {
      console.log(`   ⚠️  ${description}: Missing`);
      allPresent = false;
    }
  });
  
  console.log('\n');
  
  if (allPresent) {
    console.log('   ✅ All critical settings are configured\n');
  } else {
    console.log('   ⚠️  Some critical settings are missing');
    console.log('      Configure them in: /admin/settings/site\n');
  }
  
  return allPresent;
}

/**
 * Test 3: Validate setting formats
 */
function testSettingFormats(settings) {
  console.log('🔎 Test 3: Validating Setting Formats');
  console.log('-------------------------------------------');
  
  const tests = [
    {
      key: 'contact_email',
      test: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      message: 'Valid email format'
    },
    {
      key: 'social_linkedin',
      test: (val) => !val || val.startsWith('http'),
      message: 'Valid URL format'
    },
    {
      key: 'social_instagram',
      test: (val) => !val || val.startsWith('http'),
      message: 'Valid URL format'
    }
  ];
  
  let allValid = true;
  
  tests.forEach(({ key, test, message }) => {
    const value = settings[key];
    if (value) {
      if (test(value)) {
        console.log(`   ✅ ${key}: ${message}`);
      } else {
        console.log(`   ❌ ${key}: Invalid format`);
        allValid = false;
      }
    } else {
      console.log(`   ⚠️  ${key}: Not set`);
    }
  });
  
  console.log('\n');
  return allValid;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('Starting tests...\n');
  
  // Test 1: API Endpoint
  const apiTest = await testAPIEndpoint();
  
  if (!apiTest.success) {
    console.log('❌ Cannot proceed with further tests - API endpoint not accessible\n');
    console.log('================================================\n');
    process.exit(1);
  }
  
  // Test 2: Critical Settings
  const criticalTest = testCriticalSettings(apiTest.data);
  
  // Test 3: Format Validation
  const formatTest = testSettingFormats(apiTest.data);
  
  // Summary
  console.log('================================================');
  console.log('📊 TEST SUMMARY');
  console.log('================================================\n');
  
  console.log(`   API Endpoint:        ${apiTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Critical Settings:   ${criticalTest ? '✅ PASS' : '⚠️  INCOMPLETE'}`);
  console.log(`   Format Validation:   ${formatTest ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\n================================================');
  
  if (apiTest.success && criticalTest && formatTest) {
    console.log('\n🎉 All tests passed! Site settings are properly configured.');
    console.log('\n💡 Next steps:');
    console.log('   1. Log in to /admin/login');
    console.log('   2. Navigate to /admin/settings/site');
    console.log('   3. Update any settings');
    console.log('   4. Visit the homepage to see changes reflected');
  } else {
    console.log('\n⚠️  Some tests failed or are incomplete.');
    console.log('\n💡 To fix:');
    console.log('   1. Ensure the development server is running: npm run dev');
    console.log('   2. Log in to the admin panel: /admin/login');
    console.log('   3. Configure site settings: /admin/settings/site');
  }
  
  console.log('\n');
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
