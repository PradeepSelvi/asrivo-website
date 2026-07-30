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

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      // Profile doesn't exist, create it
      if (error.code === 'PGRST116') {
        const newProfile = {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single()

        if (createError) {
          return { success: false, error: createError.message }
        }

        return { success: true, profile: createdProfile }
      }

      return { success: false, error: error.message }
    }

    return { success: true, profile: data }
  } catch (error: any) {
    console.error('Error getting user profile:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(updates: {
  full_name?: string
  phone?: string
  bio?: string
  location?: string
  avatar_url?: string
  cover_image_url?: string
}): Promise<{
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

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true, profile: data }
  } catch (error: any) {
    console.error('Error updating user profile:', error)
    return { success: false, error: error.message }
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
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      return { success: true, profile: existingProfile }
    }

    // Create new profile
    const newProfile = {
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .insert(newProfile)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, profile: data }
  } catch (error: any) {
    console.error('Error ensuring user profile:', error)
    return { success: false, error: error.message }
  }
}
