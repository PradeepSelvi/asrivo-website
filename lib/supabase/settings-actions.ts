'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { revalidatePath } from 'next/cache'

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

export async function getSiteSettings(category?: string) {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('site_settings')
      .select('*')
      .order('key', { ascending: true })
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data, error } = await query
    
    if (error) throw new Error(error.message)
    
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getSiteSetting(category: string, key: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('category', category)
      .eq('key', key)
      .single()
    
    if (error) throw new Error(error.message)
    
    return { success: true, data: data.value }
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
    
    // Convert value to JSON if it's not already
    const jsonValue = typeof value === 'string' ? JSON.stringify(value) : value
    
    const { data, error } = await supabase
      .from('site_settings')
      .update({ value: jsonValue, updated_at: new Date().toISOString() })
      .eq('category', category)
      .eq('key', key)
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
    
    // Update each setting
    const results = await Promise.all(
      settings.map(async ({ category, key, value }) => {
        const jsonValue = typeof value === 'string' ? JSON.stringify(value) : value
        
        return supabase
          .from('site_settings')
          .update({ value: jsonValue, updated_at: new Date().toISOString() })
          .eq('category', category)
          .eq('key', key)
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
    
    const jsonValue = typeof value === 'string' ? JSON.stringify(value) : value
    
    const { data, error } = await supabase
      .from('site_settings')
      .insert({
        category,
        key,
        value: jsonValue,
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
    
    const { error } = await supabase
      .from('site_settings')
      .delete()
      .eq('category', category)
      .eq('key', key)
    
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

// Get all settings formatted as an object
export async function getSettingsMap(category?: string) {
  const result = await getSiteSettings(category)
  
  if (!result.success || !result.data) {
    return {}
  }
  
  return result.data.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = {}
    }
    // Parse JSON value
    try {
      acc[setting.category][setting.key] = JSON.parse(setting.value)
    } catch {
      acc[setting.category][setting.key] = setting.value
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
