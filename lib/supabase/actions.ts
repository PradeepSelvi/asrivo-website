'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitContactForm(
  email: string,
  name: string,
  message: string,
  company?: string
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        email,
        name,
        message,
        company,
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function getContacts(limit = 50) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function getTeamMembers() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function getSettings() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('key', { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function updateSetting(key: string, value: string, description?: string, type?: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('settings')
      .upsert({
        key,
        value,
        description,
        type,
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function updateSocialLinks(socialLinks: { linkedin?: string; github?: string; twitter?: string }) {
  try {
    const supabase = await createClient()

    const updates = []

    if (socialLinks.linkedin !== undefined) {
      updates.push(
        supabase
          .from('settings')
          .upsert({
            key: 'linkedin_url',
            value: socialLinks.linkedin,
            description: 'LinkedIn profile',
            type: 'url',
            updated_at: new Date().toISOString(),
          })
      )
    }

    if (socialLinks.github !== undefined) {
      updates.push(
        supabase
          .from('settings')
          .upsert({
            key: 'github_url',
            value: socialLinks.github,
            description: 'GitHub profile',
            type: 'url',
            updated_at: new Date().toISOString(),
          })
      )
    }

    if (socialLinks.twitter !== undefined) {
      updates.push(
        supabase
          .from('settings')
          .upsert({
            key: 'twitter_url',
            value: socialLinks.twitter,
            description: 'Twitter profile',
            type: 'url',
            updated_at: new Date().toISOString(),
          })
      )
    }

    const results = await Promise.all(updates)

    // Check if any updates failed
    const failed = results.find(result => result.error)
    if (failed) {
      return { success: false, error: failed.error?.message || 'Unknown error' }
    }

    return { success: true, data: results.map(r => r.data).filter(Boolean) }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
