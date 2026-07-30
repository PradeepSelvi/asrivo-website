#!/usr/bin/env node

/**
 * Verification Script for User Profile System
 * 
 * This script checks if the user profile system is set up correctly.
 * Run with: node scripts/verify-profile-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying User Profile System Setup...\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function checkPassed(message) {
  console.log(`✅ ${message}`);
  checks.passed++;
}

function checkFailed(message) {
  console.log(`❌ ${message}`);
  checks.failed++;
}

function checkWarning(message) {
  console.log(`⚠️  ${message}`);
  checks.warnings++;
}

// Check 1: Database migration file exists
console.log('📄 Checking Files...');
const migrationPath = path.join(__dirname, '../supabase/migrations/create_user_profiles_table.sql');
if (fs.existsSync(migrationPath)) {
  checkPassed('Database migration file exists');
} else {
  checkFailed('Database migration file not found');
}

// Check 2: Profile actions file exists
const profileActionsPath = path.join(__dirname, '../lib/supabase/profile-actions.ts');
if (fs.existsSync(profileActionsPath)) {
  checkPassed('Profile actions file exists');
} else {
  checkFailed('Profile actions file not found');
}

// Check 3: Profile menu component exists
const profileMenuPath = path.join(__dirname, '../components/user-profile-menu.tsx');
if (fs.existsSync(profileMenuPath)) {
  checkPassed('UserProfileMenu component exists');
} else {
  checkFailed('UserProfileMenu component not found');
}

// Check 4: Profile pages exist
console.log('\n📑 Checking Profile Pages...');
const profilePagePath = path.join(__dirname, '../app/profile/page.tsx');
const settingsPagePath = path.join(__dirname, '../app/profile/settings/page.tsx');

if (fs.existsSync(profilePagePath)) {
  checkPassed('Profile view page exists (/profile)');
} else {
  checkFailed('Profile view page not found');
}

if (fs.existsSync(settingsPagePath)) {
  checkPassed('Profile settings page exists (/profile/settings)');
} else {
  checkFailed('Profile settings page not found');
}

// Check 5: Header component updated
console.log('\n🎨 Checking Header Component...');
const headerPath = path.join(__dirname, '../components/header.tsx');
if (fs.existsSync(headerPath)) {
  const headerContent = fs.readFileSync(headerPath, 'utf-8');
  
  if (headerContent.includes('UserProfileMenu')) {
    checkPassed('Header includes UserProfileMenu component');
  } else {
    checkFailed('Header does not include UserProfileMenu');
  }
  
  if (headerContent.includes('import { UserProfileMenu }')) {
    checkPassed('UserProfileMenu is properly imported');
  } else {
    checkFailed('UserProfileMenu import statement missing');
  }
  
  // Check for old auth code that should be removed
  if (headerContent.includes('handleLogout') && headerContent.includes('router.push')) {
    checkWarning('Header still contains old handleLogout function - should use UserProfileMenu');
  }
  
  if (headerContent.includes('const [user') || headerContent.includes('const [loading')) {
    checkWarning('Header still has authentication state - should be handled by UserProfileMenu');
  }
} else {
  checkFailed('Header component not found');
}

// Check 6: Register page updated
console.log('\n📝 Checking Registration Flow...');
const registerPath = path.join(__dirname, '../app/register/page.tsx');
if (fs.existsSync(registerPath)) {
  const registerContent = fs.readFileSync(registerPath, 'utf-8');
  
  if (registerContent.includes('/profile')) {
    checkPassed('Registration redirects to /profile');
  } else {
    checkWarning('Registration might not redirect to /profile after signup');
  }
} else {
  checkFailed('Register page not found');
}

// Check 7: Environment variables
console.log('\n🔐 Checking Environment...');
const envLocalPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) {
  checkPassed('.env.local file exists');
  
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  
  if (envContent.includes('NEXT_PUBLIC_SUPABASE_URL')) {
    checkPassed('Supabase URL is configured');
  } else {
    checkFailed('NEXT_PUBLIC_SUPABASE_URL not found');
  }
  
  if (envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    checkPassed('Supabase anon key is configured');
  } else {
    checkFailed('NEXT_PUBLIC_SUPABASE_ANON_KEY not found');
  }
  
  if (envContent.includes('NEXT_PUBLIC_ABSTRACT_API_KEY')) {
    checkPassed('AbstractAPI key is configured');
  } else {
    checkWarning('AbstractAPI key not found (email validation will not work)');
  }
} else {
  checkFailed('.env.local file not found');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Verification Summary');
console.log('='.repeat(50));
console.log(`✅ Passed: ${checks.passed}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);
console.log('='.repeat(50));

if (checks.failed === 0 && checks.warnings === 0) {
  console.log('\n🎉 All checks passed! Your user profile system is ready.');
  console.log('\n📋 Next Steps:');
  console.log('   1. Run the database migration (see SETUP-USER-PROFILES.md)');
  console.log('   2. Test registration flow');
  console.log('   3. Verify profile menu appears in header');
  console.log('   4. Test profile view and edit pages');
} else if (checks.failed === 0) {
  console.log('\n✅ Setup is mostly complete, but there are some warnings to review.');
  console.log('📖 Check SETUP-USER-PROFILES.md for details.');
} else {
  console.log('\n⚠️  Some critical checks failed. Please review the errors above.');
  console.log('📖 See SETUP-USER-PROFILES.md for troubleshooting steps.');
  process.exit(1);
}

console.log('\n📄 Documentation: SETUP-USER-PROFILES.md');
console.log('🔧 Migration file: supabase/migrations/create_user_profiles_table.sql\n');
