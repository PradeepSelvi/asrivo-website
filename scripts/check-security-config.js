#!/usr/bin/env node

/**
 * Configuration checker for security validation features
 * 
 * This script checks if all required environment variables and dependencies
 * are properly configured for email validation and password breach checking.
 * 
 * Run with: node scripts/check-security-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Security Configuration Checker\n');
console.log('================================================\n');

let issues = [];
let warnings = [];
let success = [];

// Check if .env.local exists
console.log('📁 Checking environment files...');
const envLocalPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (fs.existsSync(envLocalPath)) {
  success.push('.env.local file exists');
  console.log('   ✅ .env.local found');
} else {
  issues.push('.env.local file not found');
  console.log('   ❌ .env.local not found');
}

if (fs.existsSync(envExamplePath)) {
  success.push('.env.example file exists');
  console.log('   ✅ .env.example found');
} else {
  warnings.push('.env.example file not found (not critical)');
  console.log('   ⚠️  .env.example not found');
}

console.log('');

// Check AbstractAPI key
console.log('🔑 Checking API keys...');
const abstractApiKey = process.env.NEXT_PUBLIC_ABSTRACT_API_KEY;

if (abstractApiKey) {
  if (abstractApiKey === 'your_abstract_api_key') {
    issues.push('NEXT_PUBLIC_ABSTRACT_API_KEY is set to placeholder value');
    console.log('   ❌ AbstractAPI key is placeholder');
    console.log('      Update with real key from https://www.abstractapi.com/');
  } else if (abstractApiKey.length < 20) {
    warnings.push('AbstractAPI key seems too short');
    console.log('   ⚠️  AbstractAPI key seems invalid (too short)');
  } else {
    success.push('AbstractAPI key is configured');
    console.log('   ✅ AbstractAPI key is set');
  }
} else {
  issues.push('NEXT_PUBLIC_ABSTRACT_API_KEY not set');
  console.log('   ❌ AbstractAPI key not found');
  console.log('      Get your key: https://www.abstractapi.com/api/email-verification-validation-api');
}

console.log('');

// Check HaveIBeenPwned (no key needed)
console.log('🛡️  Checking HaveIBeenPwned...');
console.log('   ✅ No configuration needed (public API)');
success.push('HaveIBeenPwned requires no configuration');

console.log('');

// Check required files
console.log('📄 Checking required files...');
const requiredFiles = [
  'lib/utils/security-validation.ts',
  'app/register/page.tsx',
  'docs/registration-security.md',
  'docs/SECURITY-SETUP.md',
  'scripts/test-security-validation.html',
];

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    success.push(`${file} exists`);
    console.log(`   ✅ ${file}`);
  } else {
    issues.push(`${file} not found`);
    console.log(`   ❌ ${file}`);
  }
});

console.log('');

// Summary
console.log('================================================');
console.log('📊 SUMMARY');
console.log('================================================\n');

console.log(`✅ Success: ${success.length}`);
console.log(`⚠️  Warnings: ${warnings.length}`);
console.log(`❌ Issues: ${issues.length}\n`);

if (issues.length > 0) {
  console.log('🚨 ISSUES TO FIX:\n');
  issues.forEach((issue, idx) => {
    console.log(`   ${idx + 1}. ${issue}`);
  });
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:\n');
  warnings.forEach((warning, idx) => {
    console.log(`   ${idx + 1}. ${warning}`);
  });
  console.log('');
}

if (issues.length === 0 && warnings.length === 0) {
  console.log('🎉 All checks passed! Your security features are configured.\n');
  console.log('Next steps:');
  console.log('   1. Start dev server: npm run dev');
  console.log('   2. Test registration: http://localhost:3000/register');
  console.log('   3. Open test suite: scripts/test-security-validation.html\n');
} else if (issues.length === 0) {
  console.log('✅ Configuration is good, but there are some warnings.\n');
} else {
  console.log('❌ Please fix the issues above before using security features.\n');
  console.log('Quick fix guide:');
  console.log('   1. Create .env.local if missing: copy .env.example .env.local');
  console.log('   2. Get AbstractAPI key: https://www.abstractapi.com/');
  console.log('   3. Add to .env.local: NEXT_PUBLIC_ABSTRACT_API_KEY=your_key_here\n');
  process.exit(1);
}

// Test connectivity (if keys are configured)
if (abstractApiKey && abstractApiKey !== 'your_abstract_api_key') {
  console.log('================================================');
  console.log('🌐 CONNECTIVITY TEST');
  console.log('================================================\n');
  console.log('Testing API connections...\n');

  // Test AbstractAPI
  console.log('📧 Testing AbstractAPI...');
  fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${abstractApiKey}&email=test@example.com`)
    .then(response => {
      if (response.ok) {
        console.log('   ✅ AbstractAPI is responding');
        return response.json();
      } else {
        console.log(`   ❌ AbstractAPI returned status ${response.status}`);
        if (response.status === 401) {
          console.log('      Check your API key!');
        }
        throw new Error('API error');
      }
    })
    .then(data => {
      console.log(`   ✅ API quota remaining: ${data.credit_remaining || 'Unknown'}`);
    })
    .catch(error => {
      console.log('   ❌ Could not connect to AbstractAPI');
      console.log(`      Error: ${error.message}`);
    })
    .finally(() => {
      // Test HaveIBeenPwned
      console.log('\n🛡️  Testing HaveIBeenPwned...');
      fetch('https://api.pwnedpasswords.com/range/21BD1')
        .then(response => {
          if (response.ok) {
            console.log('   ✅ HaveIBeenPwned is responding');
          } else {
            console.log(`   ❌ HaveIBeenPwned returned status ${response.status}`);
          }
        })
        .catch(error => {
          console.log('   ❌ Could not connect to HaveIBeenPwned');
          console.log(`      Error: ${error.message}`);
        })
        .finally(() => {
          console.log('\n================================================\n');
          console.log('Configuration check complete!\n');
        });
    });
}
