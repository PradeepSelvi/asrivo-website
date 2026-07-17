/**
 * Admin Auth Test Script
 * Run this in the browser console on /admin/login to diagnose auth issues
 */

async function testAdminAuth() {
  console.log('=== Admin Auth Diagnostic Test ===\n');

  // Test 1: Check cookies
  console.log('1. Checking cookies...');
  const cookies = document.cookie.split(';').map(c => c.trim());
  const supabaseCookies = cookies.filter(c => 
    c.startsWith('sb-') || c.includes('auth-token')
  );
  console.log('   Supabase cookies found:', supabaseCookies.length);
  supabaseCookies.forEach(c => {
    const name = c.split('=')[0];
    console.log(`   - ${name}`);
  });

  // Test 2: Check environment variables
  console.log('\n2. Checking environment...');
  const supabaseUrl = process?.env?.NEXT_PUBLIC_SUPABASE_URL || 'Not exposed (check server)';
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl !== 'Not exposed (check server)' ? '✓ Set' : '✗ Missing');

  // Test 3: Check current path
  console.log('\n3. Current location...');
  console.log('   Path:', window.location.pathname);
  console.log('   Search params:', window.location.search);

  // Test 4: Check session storage
  console.log('\n4. Checking storage...');
  const sessionKeys = Object.keys(sessionStorage).filter(k => k.includes('supabase'));
  const localKeys = Object.keys(localStorage).filter(k => k.includes('supabase'));
  console.log('   Session storage keys:', sessionKeys.length);
  console.log('   Local storage keys:', localKeys.length);

  // Test 5: Network check
  console.log('\n5. Recommendation:');
  console.log('   Open Network tab and watch for:');
  console.log('   - POST to /auth/v1/token (login)');
  console.log('   - Check response Set-Cookie headers');
  console.log('   - Verify cookies appear in subsequent requests');

  console.log('\n=== Test Complete ===');
  console.log('If you see redirect loops, run: clearAdminAuth()');
}

function clearAdminAuth() {
  console.log('Clearing all auth data...');
  
  // Clear all cookies
  document.cookie.split(";").forEach(c => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
  });
  
  // Clear storage
  sessionStorage.clear();
  localStorage.clear();
  
  console.log('✓ Auth data cleared. Reloading page...');
  location.reload();
}

function monitorRedirects() {
  console.log('Monitoring redirects... (check console during login)');
  
  let redirectCount = 0;
  const originalHref = Object.getOwnPropertyDescriptor(window.location, 'href');
  
  Object.defineProperty(window.location, 'href', {
    set: function(url) {
      redirectCount++;
      console.log(`[Redirect #${redirectCount}] → ${url}`);
      
      if (redirectCount > 5) {
        console.error('⚠️ INFINITE REDIRECT LOOP DETECTED!');
        console.log('Run clearAdminAuth() to reset');
        return;
      }
      
      if (originalHref && originalHref.set) {
        originalHref.set.call(this, url);
      }
    },
    get: originalHref?.get
  });
  
  console.log('✓ Redirect monitor active');
}

// Auto-run on script load
testAdminAuth();

console.log('\n📋 Available Commands:');
console.log('  testAdminAuth()     - Run diagnostic tests');
console.log('  clearAdminAuth()    - Clear all auth data and reload');
console.log('  monitorRedirects()  - Watch for redirect loops');
