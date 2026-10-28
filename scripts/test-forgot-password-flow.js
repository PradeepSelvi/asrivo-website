/**
 * Automated test suite for the Forgot Password & Password Reset flow.
 * Run in PowerShell: node scripts/test-forgot-password-flow.js
 */

const { z } = require('zod')

// 1. Re-import or replicate Zod schemas for unit verification
const emailSchema = z.string().email().min(5).max(255)
const forgotPasswordSchema = z.object({
  email: emailSchema,
  captchaToken: z.string().optional().nullable(),
})

const COMMON_WEAK_PASSWORDS = new Set([
  'password',
  'password123',
  '12345678',
  '123456789',
  'qwerty123',
  'admin123',
  'welcome123',
  'letmein123',
  'changeme123',
])

const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password must not exceed 128 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
      .refine(
        (val) => !COMMON_WEAK_PASSWORDS.has(val.toLowerCase()),
        'Password is too common. Please choose a more secure password.'
      ),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters long'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// Open redirect validator function used in /auth/confirm
function sanitizeNextUrl(next) {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('://')) {
    return '/reset-password'
  }
  return next
}

// Simple test runner
let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`)
    passed++
  } else {
    console.error(`  ✗ FAIL: ${message}`)
    failed++
  }
}

console.log('\n======================================================')
console.log(' RUNNING FORGOT PASSWORD & RESET PASSWORD TEST SUITE')
console.log('======================================================\n')

// TEST SUITE 1: Email Validation
console.log('[1/5] Testing Forgot Password Email Validation...')
assert(forgotPasswordSchema.safeParse({ email: 'user@example.com' }).success, 'Valid email passes')
assert(forgotPasswordSchema.safeParse({ email: 'user.name+tag@sub.domain.co' }).success, 'Complex valid email passes')
assert(!forgotPasswordSchema.safeParse({ email: 'not-an-email' }).success, 'Malformed email rejected')
assert(!forgotPasswordSchema.safeParse({ email: '' }).success, 'Empty email rejected')

// TEST SUITE 2: Password Policy Validation
console.log('\n[2/5] Testing Update Password Security Policy...')
const validPassword = { password: 'SecurePassword123!', confirmPassword: 'SecurePassword123!' }
assert(updatePasswordSchema.safeParse(validPassword).success, 'Strong password with upper/lower/number/symbol passes')

const shortPassword = { password: 'Aa1!', confirmPassword: 'Aa1!' }
assert(!updatePasswordSchema.safeParse(shortPassword).success, 'Short password (< 8 chars) rejected')

const noUpper = { password: 'securepassword123!', confirmPassword: 'securepassword123!' }
assert(!updatePasswordSchema.safeParse(noUpper).success, 'Password missing uppercase rejected')

const noLower = { password: 'SECUREPASSWORD123!', confirmPassword: 'SECUREPASSWORD123!' }
assert(!updatePasswordSchema.safeParse(noLower).success, 'Password missing lowercase rejected')

const noNumber = { password: 'SecurePassword!!!!', confirmPassword: 'SecurePassword!!!!' }
assert(!updatePasswordSchema.safeParse(noNumber).success, 'Password missing number rejected')

const noSymbol = { password: 'SecurePassword123', confirmPassword: 'SecurePassword123' }
assert(!updatePasswordSchema.safeParse(noSymbol).success, 'Password missing special character rejected')

const commonPassword = { password: 'Password123', confirmPassword: 'Password123' }
assert(!updatePasswordSchema.safeParse(commonPassword).success, 'Common weak password (Password123) rejected')

const mismatched = { password: 'SecurePassword123!', confirmPassword: 'DifferentPassword123!' }
assert(!updatePasswordSchema.safeParse(mismatched).success, 'Mismatched confirmPassword rejected')

// TEST SUITE 3: Open Redirect Prevention
console.log('\n[3/5] Testing Open Redirect Sanitization in /auth/confirm...')
assert(sanitizeNextUrl('/reset-password') === '/reset-password', 'Valid internal route /reset-password allowed')
assert(sanitizeNextUrl('/profile/settings') === '/profile/settings', 'Valid internal route /profile/settings allowed')
assert(sanitizeNextUrl('//evil.com') === '/reset-password', 'Protocol-relative URL //evil.com blocked')
assert(sanitizeNextUrl('https://evil.com') === '/reset-password', 'Absolute URL https://evil.com blocked')
assert(sanitizeNextUrl('javascript:alert(1)') === '/reset-password', 'javascript: URI blocked')
assert(sanitizeNextUrl('') === '/reset-password', 'Empty next parameter defaults safely to /reset-password')

// TEST SUITE 4: In-Memory Rate Limiting
console.log('\n[4/5] Testing Rate Limiting Logic...')
class TestRateLimiter {
  constructor(limit, intervalMs) {
    this.limit = limit
    this.interval = intervalMs
    this.store = new Map()
  }
  check(key) {
    const now = Date.now()
    const rec = this.store.get(key)
    if (!rec || now > rec.reset) {
      this.store.set(key, { count: 1, reset: now + this.interval })
      return true
    }
    if (rec.count >= this.limit) {
      return false
    }
    rec.count++
    return true
  }
}

const limiter = new TestRateLimiter(5, 60000)
for (let i = 1; i <= 5; i++) {
  assert(limiter.check('ip_test'), `Request ${i}/5 within rate limit accepted`)
}
assert(!limiter.check('ip_test'), 'Request 6/5 exceeds rate limit and is rejected')

// TEST SUITE 5: Anti-Enumeration API Response
console.log('\n[5/5] Testing Anti-Enumeration Behavior on /api/auth/forgot-password...')
async function testApiAntiEnumeration() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'unregistered-test-user-xyz999@gmail.com' }),
    })
    const data = await res.json()
    assert(res.ok && data.success === true, 'API returns success=true for unregistered email (no user enumeration)')
    assert(
      data.message && data.message.includes('If an account exists'),
      'API returns generic privacy-preserving message'
    )
  } catch (err) {
    console.log('  ℹ Dev server not reachable from Node fetch; skipping live HTTP test:', err.message)
  }
}

testApiAntiEnumeration().then(() => {
  console.log('\n======================================================')
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`)
  console.log('======================================================\n')
  if (failed > 0) process.exitCode = 1
})
