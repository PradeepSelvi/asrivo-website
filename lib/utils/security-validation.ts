/**
 * Security validation utilities for user registration
 * Uses AbstractAPI for email validation and HaveIBeenPwned for password breach checking
 */

/**
 * Validate email using AbstractAPI Email Validation
 * Checks if email is deliverable, not disposable, and properly formatted
 */
export async function validateEmail(email: string): Promise<{
  isValid: boolean
  error?: string
  details?: {
    isDeliverable: boolean
    isDisposable: boolean
    quality: number
  }
}> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_ABSTRACT_API_KEY
    
    if (!apiKey) {
      console.warn('AbstractAPI key not configured')
      // Skip validation if API key is not configured
      return { isValid: true }
    }

    const response = await fetch(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(email)}`
    )

    if (!response.ok) {
      console.warn(`Email validation API error: ${response.status}`)
      // Fail open on API errors
      return { isValid: true }
    }

    const data = await response.json()

    // Check for common issues
    if (data.is_disposable_email?.value === true) {
      return {
        isValid: false,
        error: 'Disposable email addresses are not allowed. Please use a permanent email address.',
      }
    }

    if (data.deliverability === 'UNDELIVERABLE') {
      return {
        isValid: false,
        error: 'This email address appears to be invalid or undeliverable.',
      }
    }

    if (data.is_valid_format?.value === false) {
      return {
        isValid: false,
        error: 'Please enter a valid email address.',
      }
    }

    // Check quality score (0-1, lower is worse)
    const qualityScore = data.quality_score || 0
    if (qualityScore < 0.5) {
      return {
        isValid: false,
        error: 'This email address quality is too low. Please use a different email.',
      }
    }

    return {
      isValid: true,
      details: {
        isDeliverable: data.deliverability === 'DELIVERABLE',
        isDisposable: data.is_disposable_email?.value === true,
        quality: qualityScore,
      },
    }
  } catch (error) {
    console.error('Email validation error:', error)
    // On error, allow registration to proceed (fail open)
    return { isValid: true }
  }
}

/**
 * Check if password has been compromised using HaveIBeenPwned API (k-anonymity model)
 * This uses the Pwned Passwords API which never sends the actual password
 */
export async function checkPasswordBreach(password: string): Promise<{
  isBreached: boolean
  breachCount?: number
  error?: string
}> {
  try {
    // Hash the password using SHA-1
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-1', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()

    // Use k-anonymity: only send first 5 characters of hash
    const prefix = hashHex.substring(0, 5)
    const suffix = hashHex.substring(5)

    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          'User-Agent': 'AsrivoTech-Registration',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Password breach check API request failed')
    }

    const text = await response.text()
    const hashes = text.split('\n')

    // Check if our password hash suffix is in the results
    for (const line of hashes) {
      const [hashSuffix, count] = line.split(':')
      if (hashSuffix === suffix) {
        return {
          isBreached: true,
          breachCount: parseInt(count, 10),
          error: `This password has been exposed in ${parseInt(count, 10).toLocaleString()} data breaches. Please choose a different password.`,
        }
      }
    }

    return { isBreached: false }
  } catch (error) {
    console.error('Password breach check error:', error)
    // On error, allow registration to proceed (fail open)
    return { isBreached: false }
  }
}

/**
 * Get password strength score and feedback
 */
export function getPasswordStrength(password: string): {
  score: number // 0-4
  feedback: string[]
  isStrong: boolean
} {
  let score = 0
  const feedback: string[] = []

  // Length check
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long')
  }

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++
  } else {
    feedback.push('Include both uppercase and lowercase letters')
  }

  if (/\d/.test(password)) {
    score++
  } else {
    feedback.push('Include at least one number')
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score++
  } else {
    feedback.push('Include at least one special character (!@#$%^&*)')
  }

  // Common patterns to avoid
  const commonPatterns = [
    /^123/,
    /password/i,
    /qwerty/i,
    /abc/i,
    /(.)\1{2,}/, // Repeated characters
  ]

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score = Math.max(0, score - 1)
      feedback.push('Avoid common patterns and repeated characters')
      break
    }
  }

  return {
    score: Math.min(4, score),
    feedback,
    isStrong: score >= 3,
  }
}
