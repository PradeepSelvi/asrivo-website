/**
 * Google reCAPTCHA v3 Integration
 * Add to .env.local:
 * NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
 * RECAPTCHA_SECRET_KEY=your_secret_key
 */

/**
 * Verify reCAPTCHA token on server-side
 * @param token - Token from client-side reCAPTCHA
 * @param action - Action name (e.g., 'contact_form', 'newsletter')
 * @returns Promise with success status and score
 */
export async function verifyCaptcha(
  token: string,
  _action: string // Prefix with underscore to indicate intentionally unused
): Promise<{ success: boolean; score?: number; error?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY not configured')
    return { success: true } // Pass through in development
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await response.json()

    if (!data.success) {
      return {
        success: false,
        error: 'CAPTCHA verification failed',
      }
    }

    // reCAPTCHA v3 returns a score (0.0 - 1.0)
    // 0.0 is very likely a bot, 1.0 is very likely a human
    const score = data.score || 0
    const threshold = 0.5 // Adjust based on your needs

    if (score < threshold) {
      return {
        success: false,
        score,
        error: 'Suspected bot activity',
      }
    }

    return {
      success: true,
      score,
    }
  } catch (error) {
    console.error('CAPTCHA verification error:', error)
    return {
      success: false,
      error: 'CAPTCHA verification error',
    }
  }
}

/**
 * Client-side: Load reCAPTCHA script
 * Add this to your page component
 */
export function loadRecaptchaScript() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  
  if (!siteKey) {
    console.warn('NEXT_PUBLIC_RECAPTCHA_SITE_KEY not configured')
    return
  }

  if (typeof window !== 'undefined' && !window.grecaptcha) {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }
}

/**
 * Client-side: Execute reCAPTCHA
 * @param action - Action name
 * @returns Promise with token
 */
export async function executeRecaptcha(action: string): Promise<string | null> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  if (!siteKey) {
    return null // Pass through in development
  }

  if (typeof window === 'undefined' || !window.grecaptcha) {
    console.error('reCAPTCHA not loaded')
    return null
  }

  try {
    window.grecaptcha.ready(() => {})
    const token = await window.grecaptcha.execute(siteKey, { action })
    return token
  } catch (error) {
    console.error('reCAPTCHA execution error:', error)
    return null
  }
}

// TypeScript declaration for grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}
