'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { revalidatePath } from 'next/cache'
import { isValidEmail } from '@/lib/utils/validation'

const MAX_SETTING_VALUE_LENGTH = 10000

/**
 * Validate setting values before persistence to prevent ReDoS or oversized payload attacks
 */
function validateSettingField(fullKey: string, stringValue: string): void {
  if (stringValue.length > MAX_SETTING_VALUE_LENGTH) {
    throw new Error(`Setting '${fullKey}' exceeds maximum allowed length of ${MAX_SETTING_VALUE_LENGTH} characters.`)
  }

  const normalizedKey = fullKey.toLowerCase()
  if (
    normalizedKey === 'site.contact_email' ||
    normalizedKey === 'contact_email' ||
    normalizedKey.endsWith('_email') ||
    normalizedKey.endsWith('.email')
  ) {
    let cleanEmail = stringValue.trim()
    if (cleanEmail.startsWith('"') && cleanEmail.endsWith('"')) {
      try {
        cleanEmail = JSON.parse(cleanEmail)
      } catch {
        cleanEmail = cleanEmail.slice(1, -1)
      }
    }
    cleanEmail = cleanEmail.trim()
    if (cleanEmail !== '' && !isValidEmail(cleanEmail)) {
      throw new Error(`Invalid email address format for '${fullKey}'. Email must be valid and between 5 and 254 characters.`)
    }
  }

  if (
    normalizedKey.includes('linkedin') ||
    normalizedKey.includes('instagram') ||
    normalizedKey.includes('facebook') ||
    normalizedKey.includes('twitter') ||
    normalizedKey.endsWith('_url')
  ) {
    let cleanUrl = stringValue.trim()
    if (cleanUrl.startsWith('"') && cleanUrl.endsWith('"')) {
      try {
        cleanUrl = JSON.parse(cleanUrl)
      } catch {
        cleanUrl = cleanUrl.slice(1, -1)
      }
    }
    cleanUrl = cleanUrl.trim()
    if (cleanUrl !== '' && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      throw new Error(`Invalid URL format for '${fullKey}'. URL must start with http:// or https://.`)
    }
  }
}

// Helper function to verify high admin permission
async function requireHighAdmin() {
  const authResult = await getCurrentAdmin()
  
  if (!authResult.success || !authResult.user) {
    throw new Error('AUTH_REQUIRED')
  }
  
  if (authResult.user.role !== 'high') {
    throw new Error('INSUFFICIENT_ROLE')
  }
  
  return authResult.user
}

// ==========================================
// SITE SETTINGS ACTIONS
// ==========================================
// The DB table uses columns: setting_key (TEXT), setting_value (TEXT)
// Category is encoded as a prefix in the key: "homepage.hero_title", "site.site_name"
// Legacy keys without a prefix (e.g., "careers_page_enabled") are also supported.

/**
 * Fetch all site settings, optionally filtered by category prefix.
 * Category is encoded in the setting_key as "category.keyName".
 */
export async function getSiteSettings(category?: string) {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('site_settings')
      .select('*')
      .order('setting_key', { ascending: true })
    
    if (category) {
      // Filter by keys that start with the category prefix
      query = query.like('setting_key', `${category}.%`)
    }
    
    const { data, error } = await query
    
    if (error) {
      // Return empty array gracefully when the table doesn't exist yet
      if (
        error.code === 'PGRST116' ||
        error.message?.includes('does not exist') ||
        error.message?.includes('relation') ||
        error.code === '42P01'
      ) {
        return { success: true, data: [] as any[] }
      }
      throw new Error(error.message)
    }
    
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Get a single setting by its full key (e.g., "homepage.hero_title").
 * For backward compatibility, also accepts (category, key) which are joined as "category.key".
 */
export async function getSiteSetting(category: string, key: string) {
  try {
    const supabase = await createClient()
    
    const fullKey = `${category}.${key}`
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', fullKey)
      .single()
    
    if (error) {
      // Return null gracefully when the table doesn't exist yet or row not found
      if (
        error.code === 'PGRST116' ||
        error.code === 'PGRST100' ||
        error.message?.includes('does not exist') ||
        error.message?.includes('relation') ||
        error.code === '42P01'
      ) {
        return { success: true, data: null }
      }
      throw new Error(error.message)
    }
    
    return { success: true, data: data.setting_value }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateSiteSetting(
  category: string, 
  key: string, 
  value: any
) {
  try {
    await requireHighAdmin()
    const supabase = await createClient()
    
    const fullKey = `${category}.${key}`
    // Store as plain string value
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
    validateSettingField(fullKey, stringValue)
    
    const { data, error } = await supabase
      .from('site_settings')
      .update({ setting_value: stringValue })
      .eq('setting_key', fullKey)
      .select()
      .single()
    
    if (error) throw new Error(error.message)
    
    // Revalidate all pages that might use these settings
    revalidatePath('/', 'layout')
    
    return { success: true, data }
  } catch (error: any) {
    if (error.message === 'AUTH_REQUIRED') {
      return { success: false, error: 'Session expired. Please log in again.', code: 'AUTH_EXPIRED' }
    }
    if (error.message === 'INSUFFICIENT_ROLE') {
      return { success: false, error: 'Only high-level admins can modify settings', code: 'INSUFFICIENT_ROLE' }
    }
    return { success: false, error: error.message }
  }
}

export async function updateMultipleSettings(
  settings: Array<{ category: string; key: string; value: any }>
) {
  try {
    await requireHighAdmin()
    const supabase = await createClient()
    
    // Validate all settings before performing any DB operations
    for (const { category, key, value } of settings) {
      const fullKey = `${category}.${key}`
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
      validateSettingField(fullKey, stringValue)
    }

    // Update each setting
    const results = await Promise.all(
      settings.map(async ({ category, key, value }) => {
        const fullKey = `${category}.${key}`
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
        
        return supabase
          .from('site_settings')
          .update({ setting_value: stringValue })
          .eq('setting_key', fullKey)
      })
    )
    
    // Check if any failed
    const failed = results.filter(r => r.error)
    if (failed.length > 0) {
      throw new Error(`Failed to update ${failed.length} settings`)
    }
    
    // Revalidate all pages
    revalidatePath('/', 'layout')
    
    return { success: true, updated: results.length }
  } catch (error: any) {
    if (error.message === 'AUTH_REQUIRED') {
      return { success: false, error: 'Session expired. Please log in again.', code: 'AUTH_EXPIRED' }
    }
    if (error.message === 'INSUFFICIENT_ROLE') {
      return { success: false, error: 'Only high-level admins can modify settings', code: 'INSUFFICIENT_ROLE' }
    }
    return { success: false, error: error.message }
  }
}

export async function createSiteSetting(
  category: string,
  key: string,
  value: any,
  description?: string
) {
  try {
    await requireHighAdmin()
    const supabase = await createClient()
    
    const fullKey = `${category}.${key}`
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
    validateSettingField(fullKey, stringValue)
    
    const { data, error } = await supabase
      .from('site_settings')
      .insert({
        setting_key: fullKey,
        setting_value: stringValue,
      })
      .select()
      .single()
    
    if (error) throw new Error(error.message)
    
    revalidatePath('/', 'layout')
    
    return { success: true, data }
  } catch (error: any) {
    if (error.message === 'AUTH_REQUIRED') {
      return { success: false, error: 'Session expired. Please log in again.', code: 'AUTH_EXPIRED' }
    }
    if (error.message === 'INSUFFICIENT_ROLE') {
      return { success: false, error: 'Only high-level admins can create settings', code: 'INSUFFICIENT_ROLE' }
    }
    return { success: false, error: error.message }
  }
}

export async function deleteSiteSetting(category: string, key: string) {
  try {
    await requireHighAdmin()
    const supabase = await createClient()
    
    const fullKey = `${category}.${key}`
    
    const { error } = await supabase
      .from('site_settings')
      .delete()
      .eq('setting_key', fullKey)
    
    if (error) throw new Error(error.message)
    
    revalidatePath('/', 'layout')
    
    return { success: true }
  } catch (error: any) {
    if (error.message === 'AUTH_REQUIRED') {
      return { success: false, error: 'Session expired. Please log in again.', code: 'AUTH_EXPIRED' }
    }
    if (error.message === 'INSUFFICIENT_ROLE') {
      return { success: false, error: 'Only high-level admins can delete settings', code: 'INSUFFICIENT_ROLE' }
    }
    return { success: false, error: error.message }
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Get all settings formatted as a nested object { category: { key: value } }
export async function getSettingsMap(category?: string) {
  const result = await getSiteSettings(category)
  
  if (!result.success || !result.data) {
    return {}
  }
  
  return result.data.reduce((acc: Record<string, Record<string, any>>, setting: any) => {
    const settingKey = setting.setting_key as string
    const settingValue = setting.setting_value as string
    
    // Parse "category.key" from setting_key
    const dotIndex = settingKey.indexOf('.')
    const cat = dotIndex > 0 ? settingKey.substring(0, dotIndex) : 'general'
    const key = dotIndex > 0 ? settingKey.substring(dotIndex + 1) : settingKey
    
    if (!acc[cat]) {
      acc[cat] = {}
    }
    // Parse JSON value if possible
    try {
      acc[cat][key] = JSON.parse(settingValue)
    } catch {
      acc[cat][key] = settingValue
    }
    return acc
  }, {} as Record<string, Record<string, any>>)
}

// Get a single setting value with fallback
export async function getSettingValue(
  category: string, 
  key: string, 
  fallback: any = null
) {
  const result = await getSiteSetting(category, key)
  
  if (!result.success || result.data === null) {
    return fallback
  }
  
  // Parse JSON if it's a string
  try {
    return typeof result.data === 'string' ? JSON.parse(result.data) : result.data
  } catch {
    return result.data
  }
}
