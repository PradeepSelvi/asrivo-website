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

export async function getContactById(id: number) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single()

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

export async function updateContactStatus(id: number, status: 'unread' | 'read' | 'responded') {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('contacts')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
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

export async function getContactsByStatus(status: 'unread' | 'read' | 'responded', limit = 50) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('status', status)
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

export async function getContactsStats() {
  try {
    const supabase = await createClient()

    // Get counts for each status
    const [unreadResult, readResult, respondedResult, totalResult] = await Promise.all([
      supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'unread'),
      supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'read'),
      supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'responded'),
      supabase.from('contacts').select('*', { count: 'exact', head: true }),
    ])

    if (unreadResult.error || readResult.error || respondedResult.error || totalResult.error) {
      const error = unreadResult.error || readResult.error || respondedResult.error || totalResult.error
      return { success: false, error: error?.message || 'Unknown error' }
    }

    return {
      success: true,
      data: {
        unread: unreadResult.count || 0,
        read: readResult.count || 0,
        responded: respondedResult.count || 0,
        total: totalResult.count || 0,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function markMultipleContactsAsRead(ids: number[]) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('contacts')
      .update({
        status: 'read',
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
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

export async function deleteContact(id: number) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
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
