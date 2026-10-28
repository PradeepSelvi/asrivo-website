'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  cover_image_url: string | null
  phone: string | null
  bio: string | null
  location: string | null
  created_at: string
  updated_at: string
}

export interface UpdateProfileInput {
  full_name?: string
  phone?: string
  bio?: string
  location?: string
  avatar_url?: string
  cover_image_url?: string
}

/**
 * Validate and sanitize URL (blocks javascript:, data:, vbscript:)
 */
function isValidUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false
  const trimmed = urlStr.trim()
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

/**
 * Sanitize plain string: trim, remove dangerous control characters, bound length
 */
function sanitizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '').trim()
  return cleaned.slice(0, maxLength)
}

/**
 * Get current user's profile
 */
export async function getCurrentUserProfile(): Promise<{
  success: boolean
  profile?: UserProfile
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Try user_profiles first, fall back to profiles if relation does not exist
    let { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
      const fallback = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      data = fallback.data
      error = fallback.error
    }

    if (error) {
      console.error('Error fetching user profile:', error.message)
      return { success: false, error: 'Failed to retrieve profile' }
    }

    // Profile doesn't exist yet, create it safely
    if (!data) {
      const newProfile = {
        id: user.id,
        email: user.email!,
        full_name: sanitizeText(user.user_metadata?.full_name, 100),
        avatar_url: typeof user.user_metadata?.avatar_url === 'string' && isValidUrl(user.user_metadata.avatar_url)
          ? user.user_metadata.avatar_url.slice(0, 2048)
          : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      let createRes = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select()
        .maybeSingle()

      if (createRes.error && (createRes.error.code === '42P01' || createRes.error.message?.includes('does not exist'))) {
        createRes = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .maybeSingle()
      }

      if (createRes.error) {
        console.error('Error auto-creating profile:', createRes.error.message)
        return { success: false, error: 'Failed to create profile' }
      }

      return { success: true, profile: createRes.data }
    }

    return { success: true, profile: data }
  } catch (error: any) {
    console.error('Error getting user profile:', error)
    return { success: false, error: 'Internal server error' }
  }
}

/**
 * Update user profile
 * Hardened against mass assignment, prototype pollution, and XSS
 */
export async function updateUserProfile(updates: UpdateProfileInput): Promise<{
  success: boolean
  profile?: UserProfile
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Unauthorized: Authentication required' }
    }

    if (!updates || typeof updates !== 'object') {
      return { success: false, error: 'Invalid update payload' }
    }

    // STRICT WHITELISTING & SANITIZATION (Defense against mass assignment CWE-915)
    // Only permitted fields are extracted; id, email, role, etc. cannot be modified.
    const sanitizedUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if ('full_name' in updates && updates.full_name !== undefined) {
      sanitizedUpdates.full_name = sanitizeText(updates.full_name, 100)
    }

    if ('phone' in updates && updates.phone !== undefined) {
      const phone = sanitizeText(updates.phone, 30)
      if (phone && !/^[+]?[\d\s\-().]{0,30}$/.test(phone)) {
        return { success: false, error: 'Invalid phone number format' }
      }
      sanitizedUpdates.phone = phone
    }

    if ('bio' in updates && updates.bio !== undefined) {
      sanitizedUpdates.bio = sanitizeText(updates.bio, 1000)
    }

    if ('location' in updates && updates.location !== undefined) {
      sanitizedUpdates.location = sanitizeText(updates.location, 100)
    }

    if ('avatar_url' in updates && updates.avatar_url !== undefined) {
      const avatarUrl = typeof updates.avatar_url === 'string' ? updates.avatar_url.trim() : ''
      if (avatarUrl && !isValidUrl(avatarUrl)) {
        return { success: false, error: 'Invalid avatar URL protocol' }
      }
      sanitizedUpdates.avatar_url = avatarUrl ? avatarUrl.slice(0, 2048) : null
    }

    if ('cover_image_url' in updates && updates.cover_image_url !== undefined) {
      const coverUrl = typeof updates.cover_image_url === 'string' ? updates.cover_image_url.trim() : ''
      if (coverUrl && !isValidUrl(coverUrl)) {
        return { success: false, error: 'Invalid cover image URL protocol' }
      }
      sanitizedUpdates.cover_image_url = coverUrl ? coverUrl.slice(0, 2048) : null
    }

    // Attempt update on user_profiles
    let { data, error } = await supabase
      .from('user_profiles')
      .update(sanitizedUpdates)
      .eq('id', user.id)
      .select()
      .maybeSingle()

    // Fall back to profiles table if user_profiles does not exist
    if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
      const fallback = await supabase
        .from('profiles')
        .update(sanitizedUpdates)
        .eq('id', user.id)
        .select()
        .maybeSingle()
      data = fallback.data
      error = fallback.error
    }

    if (error) {
      console.error('Error updating user profile:', error.message)
      return { success: false, error: 'Failed to update profile' }
    }

    revalidatePath('/profile')
    revalidatePath('/profile/settings')
    revalidatePath('/', 'layout')
    return { success: true, profile: data }
  } catch (error: any) {
    console.error('Error updating user profile:', error)
    return { success: false, error: 'Internal server error' }
  }
}

/**
 * Create or ensure profile exists
 */
export async function ensureUserProfile(): Promise<{
  success: boolean
  profile?: UserProfile
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if profile exists
    let { data: existingProfile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
      const fallback = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      existingProfile = fallback.data
    }

    if (existingProfile) {
      return { success: true, profile: existingProfile }
    }

    // Create new profile with strict sanitization
    const newProfile = {
      id: user.id,
      email: user.email!,
      full_name: sanitizeText(user.user_metadata?.full_name, 100),
      avatar_url: typeof user.user_metadata?.avatar_url === 'string' && isValidUrl(user.user_metadata.avatar_url)
        ? user.user_metadata.avatar_url.slice(0, 2048)
        : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    let insertRes = await supabase
      .from('user_profiles')
      .insert(newProfile)
      .select()
      .maybeSingle()

    if (insertRes.error && (insertRes.error.code === '42P01' || insertRes.error.message?.includes('does not exist'))) {
      insertRes = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .maybeSingle()
    }

    if (insertRes.error) {
      console.error('Error ensuring profile exists:', insertRes.error.message)
      return { success: false, error: 'Failed to create profile' }
    }

    return { success: true, profile: insertRes.data }
  } catch (error: any) {
    console.error('Error ensuring user profile:', error)
    return { success: false, error: 'Internal server error' }
  }
}
